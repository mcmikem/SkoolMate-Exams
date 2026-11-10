import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { INITIAL_EXAMS } from './src/data/seedExams';
import { Exam, TelegramConfig } from './src/types/exam';
import { convertPdfToExam, gradeStudentAnswers } from './src/server/examEngine';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

// In-memory data store with file persistence
const DATA_DIR = path.resolve(process.cwd(), '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const EXAMS_FILE = path.join(DATA_DIR, 'exams.json');
const CONFIG_FILE = path.join(DATA_DIR, 'telegram_config.json');

// Load or initialize exams
let exams: Exam[] = [];
try {
  if (fs.existsSync(EXAMS_FILE)) {
    const raw = fs.readFileSync(EXAMS_FILE, 'utf-8');
    exams = JSON.parse(raw);
  } else {
    exams = [...INITIAL_EXAMS];
    fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2));
  }
} catch (e) {
  console.warn('Failed to load persisted exams, using initial seeds:', e);
  exams = [...INITIAL_EXAMS];
}

// Load or initialize Telegram config
let telegramConfig: TelegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  channelUsername: process.env.TELEGRAM_CHANNEL || '@past_papers_channel',
  autoSync: true,
  pollingIntervalSeconds: 60,
  lastSyncAt: new Date().toISOString(),
  lastMessageIdProcessed: 0,
  isConnected: false,
};

try {
  if (fs.existsSync(CONFIG_FILE)) {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    telegramConfig = { ...telegramConfig, ...JSON.parse(raw) };
  }
} catch (e) {
  console.warn('Failed to load telegram config, using defaults:', e);
}

function saveExams() {
  try {
    fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2));
  } catch (err) {
    console.error('Error saving exams:', err);
  }
}

function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(telegramConfig, null, 2));
  } catch (err) {
    console.error('Error saving config:', err);
  }
}

async function startServer() {
  const app = express();

  // Allow larger payload for PDF documents (base64)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // --- API Routes ---

  // 1. Get Telegram connection configuration
  app.get('/api/config', (req, res) => {
    const maskedToken = telegramConfig.botToken
      ? `${telegramConfig.botToken.slice(0, 6)}...${telegramConfig.botToken.slice(-4)}`
      : '';
    res.json({
      ...telegramConfig,
      botTokenMasked: maskedToken,
      hasBotToken: Boolean(telegramConfig.botToken),
    });
  });

  // 2. Update Telegram configuration
  app.post('/api/config', async (req, res) => {
    const { botToken, channelUsername, autoSync, pollingIntervalSeconds } = req.body;
    if (botToken !== undefined && botToken !== '') {
      telegramConfig.botToken = botToken.trim();
    }
    if (channelUsername !== undefined) {
      telegramConfig.channelUsername = channelUsername.trim();
    }
    if (autoSync !== undefined) {
      telegramConfig.autoSync = Boolean(autoSync);
    }
    if (pollingIntervalSeconds !== undefined) {
      telegramConfig.pollingIntervalSeconds = Number(pollingIntervalSeconds) || 60;
    }

    saveConfig();
    res.json({ success: true, config: telegramConfig });
  });

  // 3. Test Telegram connection
  app.post('/api/telegram/test-connection', async (req, res) => {
    try {
      const { botToken, channelUsername } = req.body;
      const token = botToken || telegramConfig.botToken;
      const channel = channelUsername || telegramConfig.channelUsername;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a Telegram Bot Token (from @BotFather).',
        });
      }

      // Check Bot identity
      const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const meData = await meRes.json();
      if (!meData.ok) {
        return res.status(400).json({
          success: false,
          error: `Telegram Bot verification failed: ${meData.description || 'Invalid token'}`,
        });
      }

      telegramConfig.botInfo = {
        username: meData.result.username,
        firstName: meData.result.first_name,
        canReadChannelPosts: meData.result.can_read_all_group_messages ?? true,
      };

      let channelInfoResult = undefined;
      if (channel) {
        try {
          const chatRes = await fetch(`https://api.telegram.org/bot${token}/getChat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: channel }),
          });
          const chatData = await chatRes.json();
          if (chatData.ok) {
            channelInfoResult = {
              title: chatData.result.title || chatData.result.username,
              username: chatData.result.username ? `@${chatData.result.username}` : channel,
              type: chatData.result.type,
            };
            telegramConfig.channelInfo = channelInfoResult;
          }
        } catch (chatErr) {
          console.warn('Channel lookup info error:', chatErr);
        }
      }

      telegramConfig.isConnected = true;
      saveConfig();

      res.json({
        success: true,
        bot: telegramConfig.botInfo,
        channel: channelInfoResult,
        message: `Successfully connected to Telegram as @${meData.result.username}!`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Telegram test error' });
    }
  });

  // 4. Ingest / Sync from Telegram Channel
  app.post('/api/telegram/sync', async (req, res) => {
    try {
      telegramConfig.lastSyncAt = new Date().toISOString();

      if (!telegramConfig.botToken) {
        return res.status(200).json({
          success: false,
          error: 'Please configure your Telegram Bot Token in Settings to poll the channel.',
        });
      }

      const updatesUrl = `https://api.telegram.org/bot${telegramConfig.botToken}/getUpdates?allowed_updates=["channel_post","message"]`;
      const updateRes = await fetch(updatesUrl);
      const updateData = await updateRes.json();

      if (!updateData.ok) {
        return res.status(200).json({
          success: false,
          error: `Telegram error: ${updateData.description || 'Could not fetch channel updates'}`,
        });
      }

      const updates = updateData.result || [];
      const newExamsCreated: Exam[] = [];
      const processedFiles: string[] = [];

      for (const update of updates) {
        const post = update.channel_post || update.message;
        if (!post) continue;

        const doc = post.document;
        if (!doc) continue;

        const isPdf =
          doc.mime_type === 'application/pdf' ||
          (doc.file_name && doc.file_name.toLowerCase().endsWith('.pdf'));

        if (!isPdf) continue;

        const alreadyExists = exams.some(
          (e) => e.sourceTelegramFileId === doc.file_id || e.sourceTelegramMessageId === post.message_id
        );
        if (alreadyExists) continue;

        // Get file path from Telegram Bot API
        const fileInfoRes = await fetch(
          `https://api.telegram.org/bot${telegramConfig.botToken}/getFile?file_id=${doc.file_id}`
        );
        const fileInfoData = await fileInfoRes.json();
        if (!fileInfoData.ok || !fileInfoData.result?.file_path) continue;

        // Stream document directly from Telegram CDN without disk storage
        const downloadUrl = `https://api.telegram.org/file/bot${telegramConfig.botToken}/${fileInfoData.result.file_path}`;
        const fileContentRes = await fetch(downloadUrl);
        const arrayBuffer = await fileContentRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fileName = doc.file_name || `Exam_Paper_${post.message_id}.pdf`;
        const newExam = await convertPdfToExam(
          buffer,
          fileName,
          post.chat?.username ? `@${post.chat.username}` : telegramConfig.channelUsername,
          doc.file_id,
          post.message_id
        );

        exams.unshift(newExam);
        newExamsCreated.push(newExam);
        processedFiles.push(fileName);
      }

      saveExams();
      saveConfig();

      res.json({
        success: true,
        foundNew: newExamsCreated.length,
        newExams: newExamsCreated,
        processedFiles,
        message:
          newExamsCreated.length > 0
            ? `Successfully ingested and converted ${newExamsCreated.length} new exam(s) from Telegram!`
            : 'Telegram channel checked: All documents are up to date.',
      });
    } catch (err: any) {
      console.error('Error during Telegram sync:', err);
      res.status(500).json({ success: false, error: err.message || 'Telegram sync error' });
    }
  });

  // 5. Telegram Webhook endpoint
  app.post('/api/telegram/webhook', async (req, res) => {
    res.status(200).send('OK');

    try {
      const update = req.body;
      const post = update.channel_post || update.message;
      if (!post || !post.document) return;

      const doc = post.document;
      const isPdf =
        doc.mime_type === 'application/pdf' ||
        (doc.file_name && doc.file_name.toLowerCase().endsWith('.pdf'));

      if (!isPdf || !telegramConfig.botToken) return;

      const fileInfoRes = await fetch(
        `https://api.telegram.org/bot${telegramConfig.botToken}/getFile?file_id=${doc.file_id}`
      );
      const fileInfoData = await fileInfoRes.json();
      if (!fileInfoData.ok || !fileInfoData.result?.file_path) return;

      const downloadUrl = `https://api.telegram.org/file/bot${telegramConfig.botToken}/${fileInfoData.result.file_path}`;
      const fileContentRes = await fetch(downloadUrl);
      const buffer = Buffer.from(await fileContentRes.arrayBuffer());

      const fileName = doc.file_name || `Exam_Paper_${post.message_id}.pdf`;
      const newExam = await convertPdfToExam(
        buffer,
        fileName,
        post.chat?.username ? `@${post.chat.username}` : telegramConfig.channelUsername,
        doc.file_id,
        post.message_id
      );

      exams.unshift(newExam);
      saveExams();
      console.log(`[Telegram Webhook] Automatically digitized exam: ${newExam.title}`);
    } catch (e) {
      console.error('Error processing Telegram webhook update:', e);
    }
  });

  // 6. Direct PDF Ingestion / Upload
  app.post('/api/exams/convert-pdf', async (req, res) => {
    try {
      const { pdfBase64, fileName, channelName } = req.body;
      if (!pdfBase64) {
        return res.status(400).json({ success: false, error: 'No PDF data provided' });
      }

      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');

      const newExam = await convertPdfToExam(
        buffer,
        fileName || 'Uploaded_Past_Paper.pdf',
        channelName || telegramConfig.channelUsername || 'Uploaded Past Paper'
      );

      exams.unshift(newExam);
      saveExams();

      res.json({
        success: true,
        exam: newExam,
        message: `Successfully converted "${newExam.title}" with ${newExam.questions.length} questions!`,
      });
    } catch (err: any) {
      console.error('Error converting PDF:', err);
      res.status(500).json({ success: false, error: err.message || 'Error converting exam PDF' });
    }
  });

  // 7. Simulate Telegram Ingestion
  app.post('/api/telegram/simulate-ingest', async (req, res) => {
    try {
      const { subjectType } = req.body;

      let simulatedExam: Exam;
      const simId = `exam-tg-sim-${Date.now()}`;

      if (subjectType === 'chemistry') {
        simulatedExam = {
          id: simId,
          title: 'UNEB UCE 2024 Chemistry Paper 2',
          subject: 'Chemistry',
          level: 'o_level',
          classGrade: 'S.4',
          category: 'past_paper',
          examBoard: 'UNEB / UCE',
          code: '545/2',
          year: '2024',
          session: 'October/November Official UNEB',
          durationMinutes: 75,
          totalMarks: 45,
          instructions: [
            'A periodic table is provided in the formula reference.',
            'Show all chemical equations with state symbols where required.',
            'Express final numeric answers to three significant figures.',
          ],
          sourceDocumentName: 'UNEB_UCE_Chemistry_545_2_2024.pdf',
          sourceTelegramChannel: telegramConfig.channelUsername || '@uganda_o_level_papers',
          sourceTelegramFileId: `BQACAgQAAxkBAAEJ_${Date.now()}_sim_chem`,
          sourceTelegramMessageId: Math.floor(Math.random() * 9000) + 1000,
          createdAt: new Date().toISOString(),
          status: 'ready',
          questions: [
            {
              id: 'cq1',
              number: 1,
              type: 'multiple_choice',
              text: 'Which of the following compounds has the highest boiling point?',
              marks: 1,
              choices: [
                { id: 'A', label: 'A', text: 'CH₄ (Methane)' },
                { id: 'B', label: 'B', text: 'CH₃CH₂OH (Ethanol)' },
                { id: 'C', label: 'C', text: 'CH₃OCH₃ (Dimethyl ether)' },
                { id: 'D', label: 'D', text: 'CH₃CH₂CH₃ (Propane)' },
              ],
              correctAnswer: 'B',
              modelAnswer: 'Ethanol (CH₃CH₂OH) exhibits strong intermolecular hydrogen bonding due to the polar O-H group, leading to the highest boiling point (78°C).',
              explanation: 'Methane and propane only have London dispersion forces. Dimethyl ether has dipole-dipole forces. Ethanol can form hydrogen bonds, which are significantly stronger.',
              topic: 'Organic Chemistry & Bonding',
            },
            {
              id: 'cq2',
              number: 2,
              type: 'numerical',
              text: 'Consider the titration reaction: HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l). Exactly 25.0 cm³ of 0.200 mol/dm³ HCl is completely neutralised by 0.100 mol/dm³ NaOH. Calculate the required volume of NaOH in cm³.',
              marks: 3,
              diagramSvg: `<svg viewBox="0 0 320 180" class="w-full max-w-sm mx-auto stroke-[#005ce6] fill-none" xmlns="http://www.w3.org/2000/svg">
  <line x1="40" y1="140" x2="280" y2="140" stroke="#7b8698" stroke-width="2" />
  <line x1="40" y1="20" x2="40" y2="140" stroke="#7b8698" stroke-width="2" />
  <path d="M 40,130 C 130,130 150,110 160,80 C 170,50 190,30 270,30" stroke="#005ce6" stroke-width="3" fill="none" />
  <circle cx="160" cy="80" r="4" fill="#f59e0b" />
  <text x="170" y="80" fill="#8a4508" font-size="11" font-weight="bold">Equivalence Pt (pH 7)</text>
  <text x="120" y="165" fill="#5b6576" font-size="12">Volume NaOH (cm³)</text>
  <text x="10" y="25" fill="#5b6576" font-size="12">pH</text>
</svg>`,
              diagramDescription: 'Strong acid - strong base titration curve showing equivalence point at pH 7.',
              correctAnswer: '50',
              modelAnswer: 'Moles of HCl = (25.0 / 1000) * 0.200 = 0.00500 moles.\nSince molar ratio is 1:1, moles of NaOH = 0.00500.\nVolume of NaOH = 0.00500 / 0.100 = 0.0500 dm³ = 50.0 cm³.',
              explanation: 'Using n = C * V gives 50.0 cm³.',
              topic: 'Quantitative Analysis & Volumetric Titration',
            },
          ],
        };
      } else {
        simulatedExam = {
          id: simId,
          title: 'Term 1 Holiday Package: P.7 Integrated Science & Health Education',
          subject: 'Integrated Science',
          level: 'primary',
          classGrade: 'P.7',
          category: 'holiday_package',
          term: 'Term 1',
          examBoard: 'Kampala Junior Revision',
          year: '2024',
          session: 'Term 1 Holiday Package',
          durationMinutes: 60,
          totalMarks: 25,
          instructions: [
            'Complete all questions as holiday homework revision.',
            'Write neat, accurate scientific explanations.',
          ],
          sourceDocumentName: 'P7_Science_Term1_Holiday_Package.pdf',
          sourceTelegramChannel: telegramConfig.channelUsername || '@uganda_primary_papers',
          sourceTelegramFileId: `BQACAgQAAxkBAAEJ_${Date.now()}_sim_p7`,
          sourceTelegramMessageId: Math.floor(Math.random() * 9000) + 1000,
          createdAt: new Date().toISOString(),
          status: 'ready',
          questions: [
            {
              id: 'sq1',
              number: 1,
              type: 'multiple_choice',
              text: 'Which vaccine is administered to infants to protect against Tuberculosis (TB) in Uganda?',
              marks: 1,
              choices: [
                { id: 'A', label: 'A', text: 'BCG vaccine' },
                { id: 'B', label: 'B', text: 'Polio vaccine' },
                { id: 'C', label: 'C', text: 'Measles vaccine' },
                { id: 'D', label: 'D', text: 'DPT-HepB-Hib vaccine' },
              ],
              correctAnswer: 'A',
              modelAnswer: 'BCG (Bacillus Calmette-Guérin) vaccine is given at birth to prevent Tuberculosis.',
              explanation: 'BCG leaves a characteristic scar on the upper right arm.',
              topic: 'Immunisation & Child Health',
            },
            {
              id: 'sq2',
              number: 2,
              type: 'short_answer',
              text: 'Give two reasons why boiling drinking water is strongly encouraged in homes in Uganda.',
              marks: 2,
              correctAnswer: 'To kill disease-causing germs/bacteria and make water safe for drinking',
              modelAnswer: '1. High temperature kills pathogenic bacteria and amoebae that cause waterborne diseases such as cholera, typhoid, and dysentery.\n2. It removes temporary hardness from water and makes it safe for consumption.',
              explanation: 'Boiling destroys living microorganisms.',
              topic: 'Water Sanitation & Hygiene',
            },
          ],
        };
      }

      exams.unshift(simulatedExam);
      saveExams();

      res.json({
        success: true,
        exam: simulatedExam,
        message: `Simulated live document upload from Telegram channel! Document ingested: "${simulatedExam.sourceDocumentName}"`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Get all exams
  app.get('/api/exams', (req, res) => {
    res.json(exams);
  });

  // 9. Get specific exam
  app.get('/api/exams/:id', (req, res) => {
    const exam = exams.find((e) => e.id === req.params.id);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.json(exam);
  });

  // 10. Update / Edit exam (Teacher / Editor Mode)
  app.put('/api/exams/:id', (req, res) => {
    const index = exams.findIndex((e) => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const updatedExam: Exam = {
      ...exams[index],
      ...req.body,
      id: req.params.id,
    };

    exams[index] = updatedExam;
    saveExams();
    res.json({ success: true, exam: updatedExam });
  });

  // 11. Delete exam
  app.delete('/api/exams/:id', (req, res) => {
    const prevCount = exams.length;
    exams = exams.filter((e) => e.id !== req.params.id);
    if (exams.length === prevCount) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    saveExams();
    res.json({ success: true, message: 'Exam deleted successfully' });
  });

  // 12. Grade student exam submission
  app.post('/api/exams/:id/grade', async (req, res) => {
    try {
      const exam = exams.find((e) => e.id === req.params.id);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      const { answers = {}, studentName = 'Student', timeSpentSeconds = 0 } = req.body;
      const result = await gradeStudentAnswers(exam, answers, studentName, timeSpentSeconds);

      res.json({ success: true, result });
    } catch (err: any) {
      console.error('Error grading exam:', err);
      res.status(500).json({ success: false, error: err.message || 'Grading failed' });
    }
  });

  // 13. Stream original Telegram document directly
  app.get('/api/telegram/stream-file/:fileId', async (req, res) => {
    try {
      const { fileId } = req.params;
      if (!telegramConfig.botToken) {
        return res.status(400).send('Telegram Bot Token not configured');
      }

      const fileInfoRes = await fetch(
        `https://api.telegram.org/bot${telegramConfig.botToken}/getFile?file_id=${fileId}`
      );
      const fileInfo = await fileInfoRes.json();
      if (!fileInfo.ok || !fileInfo.result?.file_path) {
        return res.status(404).send('File not found on Telegram');
      }

      const telegramStreamUrl = `https://api.telegram.org/file/bot${telegramConfig.botToken}/${fileInfo.result.file_path}`;
      const streamResponse = await fetch(telegramStreamUrl);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="original_past_paper.pdf"');

      const arrayBuffer = await streamResponse.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (e: any) {
      res.status(500).send(`Error streaming file from Telegram: ${e.message}`);
    }
  });

  // Global Express error handler returning JSON
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Express Error Handler:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error',
    });
  });

  // Mount Vite or static build
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TeleExam full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
