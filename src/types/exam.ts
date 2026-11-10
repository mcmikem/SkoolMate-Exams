export type QuestionType = 'multiple_choice' | 'short_answer' | 'essay' | 'numerical';

export interface Choice {
  id: string;
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface ExamQuestion {
  id: string;
  number: number;
  type: QuestionType;
  text: string;
  marks: number;
  choices?: Choice[];
  correctAnswer?: string; // e.g. "B" for multiple choice, or key term/numeric value
  modelAnswer?: string; // full worked solution or model explanation
  explanation?: string;
  diagramSvg?: string; // SVG code representing the figure/diagram/graph
  diagramDescription?: string;
  imageUrl?: string;
  topic?: string;
  hint?: string;
}

export type EducationLevel = 'primary' | 'o_level' | 'a_level';
export type ClassGrade = 'P.5' | 'P.6' | 'P.7' | 'S.1' | 'S.2' | 'S.3' | 'S.4' | 'S.5' | 'S.6';
export type ResourceCategory = 'past_paper' | 'holiday_package' | 'mock_exam' | 'revision_notes';

export interface Exam {
  id: string;
  title: string;
  subject: string;
  level: EducationLevel;
  classGrade: ClassGrade;
  category: ResourceCategory;
  term?: 'Term 1' | 'Term 2' | 'Term 3' | 'Annual';
  examBoard?: string; // e.g. "UNEB / PLE", "UNEB / UCE", "Wakiso Joint Mock"
  code?: string; // e.g. "P525/1" or "0580/42"
  year?: string;
  session?: string; // e.g. "October/November UNEB" or "Term 2 Holiday Work"
  durationMinutes: number;
  totalMarks: number;
  instructions: string[];
  questions: ExamQuestion[];
  notesContent?: string; // Formatted summary notes for revision materials
  sourceDocumentName?: string;
  sourceTelegramFileId?: string;
  sourceTelegramMessageId?: number;
  sourceTelegramChannel?: string;
  createdAt: string;
  status: 'ready' | 'processing' | 'failed';
}

export interface StudentAnswers {
  [questionId: string]: string;
}

export interface QuestionGrading {
  questionId: string;
  questionNumber: number;
  marksAwarded: number;
  maxMarks: number;
  isCorrect: boolean;
  studentAnswer: string;
  correctAnswer: string;
  feedback: string;
  stepByStepSolution: string;
}

export interface ExamGradingResult {
  examId: string;
  examTitle: string;
  studentName?: string;
  submittedAt: string;
  timeSpentSeconds: number;
  totalMarksAwarded: number;
  totalMaxMarks: number;
  percentage: number;
  grade: string;
  summaryFeedback: string;
  strengths: string[];
  improvements: string[];
  questionGradings: QuestionGrading[];
}

export interface TelegramConfig {
  botToken: string;
  channelUsername: string; // e.g. "@pastpapers_hub" or chat id
  autoSync: boolean;
  pollingIntervalSeconds: number;
  lastSyncAt: string | null;
  lastMessageIdProcessed: number;
  isConnected: boolean;
  botInfo?: {
    username?: string;
    firstName?: string;
    canReadChannelPosts?: boolean;
  };
  channelInfo?: {
    title?: string;
    username?: string;
    type?: string;
  };
}

export interface TelegramChannelPost {
  messageId: number;
  date: number;
  caption?: string;
  fileName: string;
  fileSize?: number;
  fileId: string;
  mimeType: string;
  alreadyIngested: boolean;
  associatedExamId?: string;
}
