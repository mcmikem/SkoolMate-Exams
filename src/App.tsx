/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExamVault } from './components/ExamVault';
import { ExamRunner } from './components/ExamRunner';
import { ExamGradingView } from './components/ExamGradingView';
import { ExamEditor } from './components/ExamEditor';
import { NotesReaderModal } from './components/NotesReaderModal';
import { SignInModal } from './components/SignInModal';
import { StaffPortalModal } from './components/StaffPortalModal';
import { UploadPdfModal } from './components/UploadPdfModal';
import { SkoolMateDock } from './components/SkoolMateDock';
import { Exam, ExamGradingResult, TelegramConfig, StudentAnswers, ClassGrade } from './types/exam';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StudentProfile {
  name: string;
  classGrade: ClassGrade;
  school?: string;
}

async function safeJsonFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Server returned unexpected response (${res.status}): ${text.slice(0, 120)}`);
  }
  return res.json();
}

export default function App() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [gradingResult, setGradingResult] = useState<ExamGradingResult | null>(null);
  const [currentView, setCurrentView] = useState<'vault' | 'runner' | 'grading' | 'editor'>('vault');

  // Student state
  const [selectedClass, setSelectedClass] = useState<string>('S.4');
  const [dockTab, setDockTab] = useState<string>('exams');
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    name: 'Brian Kato',
    classGrade: 'S.4',
    school: 'Gayaza High School',
  });

  // Modal states
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isStaffMode, setIsStaffMode] = useState(false);
  const [notesExam, setNotesExam] = useState<Exam | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Background Telegram config (staff only)
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    botToken: '',
    channelUsername: '@past_papers_channel',
    autoSync: true,
    pollingIntervalSeconds: 60,
    lastSyncAt: null,
    lastMessageIdProcessed: 0,
    isConnected: false,
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load
  useEffect(() => {
    fetchExams();
    fetchConfig();
  }, []);

  const fetchExams = async () => {
    try {
      const data = await safeJsonFetch('/api/exams');
      setExams(data);
    } catch (e: any) {
      console.error('Failed to fetch exams:', e);
    }
  };

  const fetchConfig = async () => {
    try {
      const data = await safeJsonFetch('/api/config');
      setTelegramConfig(data);
    } catch (e: any) {
      console.error('Failed to fetch config:', e);
    }
  };

  const handleStartExam = (exam: Exam) => {
    setActiveExam(exam);
    setCurrentView('runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReadNotes = (exam: Exam) => {
    setNotesExam(exam);
    setIsNotesModalOpen(true);
  };

  const handleEditExam = (exam: Exam) => {
    setActiveExam(exam);
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveExam = async (updatedExam: Exam) => {
    const data = await safeJsonFetch(`/api/exams/${updatedExam.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedExam),
    });

    if (!data.success) {
      throw new Error(data.error || 'Failed to update exam');
    }

    setActiveExam(data.exam);
    setExams((prev) => prev.map((e) => (e.id === data.exam.id ? data.exam : e)));
    addToast('success', `Exam "${data.exam.title}" saved successfully.`);
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam paper?')) return;

    try {
      const data = await safeJsonFetch(`/api/exams/${examId}`, { method: 'DELETE' });
      if (data.success) {
        setExams((prev) => prev.filter((e) => e.id !== examId));
        if (activeExam?.id === examId) {
          setActiveExam(null);
          setCurrentView('vault');
        }
        addToast('info', 'Past paper removed from catalog.');
      }
    } catch (e: any) {
      addToast('error', `Could not delete: ${e.message}`);
    }
  };

  const handleSubmitExam = async (answers: StudentAnswers, timeSpentSeconds: number) => {
    if (!activeExam) return;

    setIsSubmittingExam(true);
    try {
      const data = await safeJsonFetch(`/api/exams/${activeExam.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          studentName: studentProfile.name,
          timeSpentSeconds,
        }),
      });

      if (!data.success || !data.result) {
        throw new Error(data.error || 'Marking assessment failed');
      }

      setGradingResult(data.result);
      setCurrentView('grading');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      addToast(
        'success',
        `Exam marked! You scored ${data.result.totalMarksAwarded}/${data.result.totalMaxMarks} (${data.result.percentage}%)`
      );
    } catch (err: any) {
      console.error(err);
      addToast('error', `Marking error: ${err.message}`);
    } finally {
      setIsSubmittingExam(false);
    }
  };

  const handleSyncTelegram = async () => {
    setIsSyncing(true);
    try {
      const data = await safeJsonFetch('/api/telegram/sync', { method: 'POST' });

      if (!data.success) {
        addToast('info', data.error || 'Please configure bot token in the Staff Room.');
        setIsStaffModalOpen(true);
        return;
      }

      await fetchExams();
      await fetchConfig();
      addToast('success', data.message);
    } catch (e: any) {
      addToast('error', `Sync failed: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSimulateIngest = async (subject: 'chemistry' | 'math') => {
    setIsSyncing(true);
    try {
      const data = await safeJsonFetch('/api/telegram/simulate-ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectType: subject }),
      });

      if (!data.success) {
        throw new Error(data.error);
      }

      await fetchExams();
      addToast('success', data.message);
      if (currentView !== 'vault') {
        setCurrentView('vault');
      }
    } catch (e: any) {
      addToast('error', `Ingestion error: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUploadPdf = async (base64: string, fileName: string) => {
    try {
      const data = await safeJsonFetch('/api/exams/convert-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: base64,
          fileName,
        }),
      });

      if (!data.success) {
        throw new Error(data.error);
      }

      await fetchExams();
      addToast('success', data.message);
      setActiveExam(data.exam);
      setCurrentView('runner');
    } catch (e: any) {
      addToast('error', `Conversion error: ${e.message}`);
    }
  };

  const handleTestConnection = async (token: string, channel: string) => {
    try {
      const data = await safeJsonFetch('/api/telegram/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: token, channelUsername: channel }),
      });
      if (data.success) {
        await fetchConfig();
      }
      return data;
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const handleUpdateConfig = async (newConfig: Partial<TelegramConfig>) => {
    const data = await safeJsonFetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    });

    if (!data.success) {
      throw new Error(data.error || 'Failed to update config');
    }

    setTelegramConfig(data.config);
  };

  return (
    <div className="min-h-screen bg-[#f5f8fe] text-[#171717] flex flex-col justify-between">
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border text-xs shadow-lg flex items-start justify-between gap-3 animate-fade-in ${
              toast.type === 'success'
                ? 'bg-white border-emerald-300 text-emerald-950 shadow-emerald-500/5'
                : toast.type === 'error'
                ? 'bg-white border-rose-300 text-rose-950 shadow-rose-500/5'
                : 'bg-white border-[#b0ccf7] text-[#001f3f] shadow-blue-500/5'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[#005ce6] shrink-0" />}
              <span className="font-bold leading-relaxed">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#7b8698] hover:text-[#171717] p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Top Navigation (hidden in full student runner mode for distraction-free exam taking) */}
      {currentView !== 'runner' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          selectedClass={selectedClass}
          onSelectClass={(c) => setSelectedClass(c)}
          hasActiveExam={Boolean(activeExam)}
          hasGradingResult={Boolean(gradingResult)}
          studentProfile={studentProfile}
          onOpenSignInModal={() => setIsSignInModalOpen(true)}
          onOpenStaffModal={() => setIsStaffModalOpen(true)}
        />
      )}

      {/* Main App Layout: Dock + Content */}
      <div className="flex-1 flex flex-row min-w-0">
        {currentView !== 'runner' && (
          <div className="hidden sm:block">
            <SkoolMateDock
              currentTab={dockTab}
              onSelectTab={(tab) => {
                setDockTab(tab);
                if (currentView !== 'vault') setCurrentView('vault');
                if (tab === 'curriculum') setIsSignInModalOpen(true);
              }}
              onOpenStaffModal={() => setIsStaffModalOpen(true)}
              onOpenSignInModal={() => setIsSignInModalOpen(true)}
              studentName={studentProfile.name}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {currentView === 'vault' && (
            <ExamVault
              exams={exams}
              onStartExam={handleStartExam}
              onReadNotes={handleReadNotes}
              onEditExam={handleEditExam}
              onDeleteExam={handleDeleteExam}
              selectedClass={selectedClass}
              onSelectClass={(c) => setSelectedClass(c)}
              isStaffMode={isStaffMode}
            />
          )}

          {currentView === 'runner' && activeExam && (
            <ExamRunner
              exam={activeExam}
              onSubmitExam={handleSubmitExam}
              onExitExam={() => setCurrentView('vault')}
              isSubmitting={isSubmittingExam}
            />
          )}

          {currentView === 'grading' && gradingResult && activeExam && (
            <ExamGradingView
              result={gradingResult}
              exam={activeExam}
              onRetake={() => {
                setCurrentView('runner');
              }}
              onBackToVault={() => {
                setCurrentView('vault');
              }}
            />
          )}

          {currentView === 'editor' && activeExam && (
            <ExamEditor
              exam={activeExam}
              onSaveExam={handleSaveExam}
              onBack={() => setCurrentView('vault')}
              onPreviewExam={(e) => {
                setActiveExam(e);
                setCurrentView('runner');
              }}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <NotesReaderModal
        isOpen={isNotesModalOpen}
        exam={notesExam}
        onClose={() => {
          setIsNotesModalOpen(false);
          setNotesExam(null);
        }}
        onStartExam={(exam) => {
          setIsNotesModalOpen(false);
          handleStartExam(exam);
        }}
      />

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        currentProfile={studentProfile}
        onSaveProfile={(profile) => {
          setStudentProfile(profile);
          setSelectedClass(profile.classGrade);
          addToast('success', `Welcome, ${profile.name}! Filtered to ${profile.classGrade}.`);
        }}
      />

      <StaffPortalModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        config={telegramConfig}
        onUpdateConfig={handleUpdateConfig}
        onTestConnection={handleTestConnection}
        onSyncNow={handleSyncTelegram}
        onSimulateIngest={handleSimulateIngest}
        onOpenUploadPdf={() => setIsUploadModalOpen(true)}
        isSyncing={isSyncing}
        isStaffMode={isStaffMode}
        onToggleStaffMode={(val) => {
          setIsStaffMode(val);
          addToast('info', val ? 'Teacher Edit Mode enabled on exam cards' : 'Standard Student Mode active');
        }}
      />

      <UploadPdfModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadPdf={handleUploadPdf}
      />

      {/* Clean Student-Facing Footer */}
      {currentView !== 'runner' && (
        <footer className="border-t border-[#d9e7fb] bg-white py-6 px-4 text-center text-xs text-[#5b6576]">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-medium">
            <p>
              <strong className="text-[#001f3f] font-bold">SkoolMate Exams</strong> • An <a href="https://omuto.org" target="_blank" rel="noreferrer" className="text-[#005ce6] font-bold hover:underline">omuto.org</a> Educational Platform for Uganda
            </p>
            <p className="text-[11px] text-[#7b8698]">
              UNEB PLE (Primary) • UCE (O-Level) • UACE (A-Level) Past Papers & Holiday Packages
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
