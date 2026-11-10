import React, { useState, useEffect } from 'react';
import { Exam, StudentAnswers, ExamQuestion } from '../types/exam';
import { MathSymbolBar } from './MathSymbolBar';
import { ScratchpadModal } from './ScratchpadModal';
import { DiagramModal } from './DiagramModal';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  PenTool,
  Grid,
  Send,
  ZoomIn,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

interface ExamRunnerProps {
  exam: Exam;
  onSubmitExam: (answers: StudentAnswers, timeSpentSeconds: number) => void;
  onExitExam: () => void;
  isSubmitting: boolean;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({
  exam,
  onSubmitExam,
  onExitExam,
  isSubmitting,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswers>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(exam.durationMinutes * 60);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  // Modals state
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentQuestion: ExamQuestion = exam.questions[currentIndex] || exam.questions[0];

  // Timer effect
  useEffect(() => {
    if (isTimerPaused || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerPaused, secondsRemaining]);

  // Keyboard navigation (A, B, C, D or 1, 2, 3, 4 for MCQs, arrows for next/prev)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (currentQuestion.type === 'multiple_choice' && currentQuestion.choices) {
        const key = e.key.toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(key)) {
          handleSelectChoice(key);
        } else if (['1', '2', '3', '4'].includes(e.key)) {
          const index = parseInt(e.key) - 1;
          const choice = currentQuestion.choices[index];
          if (choice) handleSelectChoice(choice.label);
        }
      }

      if (e.key === 'ArrowRight' && currentIndex < exam.questions.length - 1) {
        goToNext();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQuestion]);

  useEffect(() => {
    setShowHint(false);
  }, [currentIndex]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectChoice = (choiceLabel: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: choiceLabel,
    }));
  };

  const handleTextAnswerChange = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  const handleInsertSymbol = (symbol: string) => {
    const currentVal = answers[currentQuestion.id] || '';
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: currentVal + symbol,
    }));
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const goToNext = () => {
    if (currentIndex < exam.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSubmitConfirmOpen(true);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim().length > 0).length;
  const totalQuestions = exam.questions.length;
  const isCurrentFlagged = Boolean(flaggedQuestions[currentQuestion.id]);
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-[#f5f8fe] flex flex-col justify-between text-[#171717]">
      {/* Top Test Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#d9e7fb] px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Exam Info */}
          <div className="flex items-center gap-2.5 truncate">
            <button
              onClick={onExitExam}
              className="p-1.5 rounded-xl hover:bg-[#edf3fd] text-[#5b6576] hover:text-[#171717] transition-colors cursor-pointer"
              title="Exit test room"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="truncate">
              <h2 className="font-extrabold text-xs sm:text-sm text-[#001f3f] truncate font-heading">{exam.title}</h2>
              <div className="flex items-center gap-2 text-[11px] text-[#5b6576] font-medium">
                <span className="text-[#005ce6] font-bold">{exam.subject}</span>
                <span>•</span>
                <span>{answeredCount} of {totalQuestions} answered</span>
              </div>
            </div>
          </div>

          {/* Timer and Quick Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Timer Badge */}
            <div
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold cursor-pointer border transition-colors ${
                secondsRemaining <= 300
                  ? 'bg-[#fac5c5]/30 text-[#a51d1d] border-[#f04444] animate-pulse'
                  : 'bg-[#edf3fd] text-[#0045ad] border-[#d9e7fb] hover:bg-[#d9e7fb]'
              }`}
              title="Click to pause or resume timer"
            >
              <Clock className="w-3.5 h-3.5 text-[#005ce6]" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Scratchpad button */}
            <button
              onClick={() => setIsScratchpadOpen(true)}
              className="card-action-pill !bg-[#eef4ff] !border-[#b0ccf7] !text-[#005ce6] hover:!bg-[#d9e7fb]"
              title="Open Scratchpad for rough work"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scratchpad</span>
            </button>

            {/* Question matrix sheet button */}
            <button
              onClick={() => setIsQuestionGridOpen(true)}
              className="p-2 rounded-xl bg-white hover:bg-[#edf3fd] text-[#313131] border border-[#d9e7fb] transition-colors cursor-pointer"
              title="View all questions matrix"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-[#d9e7fb] h-1.5 mt-2.5 rounded-full overflow-hidden max-w-4xl mx-auto">
          <div
            className="bg-[#005ce6] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Question View Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-start">
        {/* Question Card */}
        <div className="sm-card p-5 sm:p-7 space-y-6">
          {/* Question Subheader: Number, Marks, Flag */}
          <div className="flex items-center justify-between gap-3 border-b border-[#d9e7fb] pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#005ce6] text-white font-extrabold flex items-center justify-center text-xs shadow-xs shadow-[#005ce6]/25">
                {currentQuestion.number}
              </span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              {currentQuestion.topic && (
                <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  {currentQuestion.topic}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                {currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
              </span>

              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  isCurrentFlagged
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800'
                }`}
                title={isCurrentFlagged ? 'Remove review flag' : 'Flag question for review'}
              >
                <Flag className="w-3.5 h-3.5 fill-current" />
                <span className="text-[11px] hidden sm:inline">
                  {isCurrentFlagged ? 'Flagged' : 'Flag'}
                </span>
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {currentQuestion.text}
          </div>

          {/* Question Diagram / Image (Clean presentation of the isolated diagram) */}
          {(currentQuestion.diagramSvg || currentQuestion.imageUrl) && (
            <div className="relative rounded-2xl bg-[#f4f7fd] border border-[#d9e7fb] p-4 sm:p-5 flex flex-col items-center justify-center group overflow-hidden">
              <div className="w-full flex items-center justify-between text-xs text-[#5b6576] mb-2 border-b border-[#d9e7fb] pb-2">
                <span className="font-bold text-[#171717] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#005ce6] inline-block" />
                  Exam Diagram / Figure
                </span>
                <button
                  onClick={() => setIsDiagramModalOpen(true)}
                  className="flex items-center gap-1 text-[#005ce6] hover:text-[#004fc6] text-xs font-bold transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Enlarge Diagram</span>
                </button>
              </div>

              {currentQuestion.diagramSvg ? (
                <div
                  className="w-full max-w-md my-2 flex items-center justify-center cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => setIsDiagramModalOpen(true)}
                  dangerouslySetInnerHTML={{ __html: currentQuestion.diagramSvg }}
                />
              ) : currentQuestion.imageUrl ? (
                <img
                  src={currentQuestion.imageUrl}
                  alt={currentQuestion.diagramDescription || 'Question diagram'}
                  className="max-h-60 max-w-full rounded-lg object-contain my-2 cursor-pointer bg-white p-2 border border-[#d9e7fb]"
                  onClick={() => setIsDiagramModalOpen(true)}
                />
              ) : null}

              {currentQuestion.diagramDescription && (
                <p className="text-[11px] text-[#5b6576] mt-2 text-center max-w-lg italic font-medium">
                  {currentQuestion.diagramDescription}
                </p>
              )}
            </div>
          )}

          {/* Answer Input Section */}
          <div className="space-y-4 pt-1">
            {/* 1. Multiple Choice Options */}
            {currentQuestion.type === 'multiple_choice' && currentQuestion.choices && (
              <div className="space-y-2.5">
                <p className="text-xs text-[#5b6576] font-bold">Select one choice (or press A, B, C, D on keyboard):</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQuestion.choices.map((choice) => {
                    const isSelected = answers[currentQuestion.id] === choice.label;
                    return (
                      <div
                        key={choice.id}
                        onClick={() => handleSelectChoice(choice.label)}
                        className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.99] select-none ${
                          isSelected
                            ? 'bg-[#eef4ff] border-[#005ce6] text-[#001f3f] shadow-xs'
                            : 'bg-white border-[#d9e7fb] text-[#171717] hover:bg-[#f4f7fd] hover:border-[#b0ccf7]'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#005ce6] text-white shadow-xs'
                              : 'bg-[#edf3fd] text-[#0045ad]'
                          }`}
                        >
                          {choice.label}
                        </div>
                        <span className="text-sm sm:text-base font-semibold flex-1">
                          {choice.text}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-[#005ce6] shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Numerical Input */}
            {currentQuestion.type === 'numerical' && (
              <div className="space-y-2.5">
                <label className="block text-xs text-[#313131] font-bold">
                  Enter your numerical answer (numbers, decimals, or fractions):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleTextAnswerChange(e.target.value)}
                    placeholder="e.g. 17 or 2.25 or 3/4"
                    className="flex-1 px-4 py-3 rounded-2xl bg-white border-2 border-[#d9e7fb] text-[#171717] text-base font-mono focus:border-[#005ce6] focus:outline-none shadow-xs"
                    autoFocus
                  />
                  {answers[currentQuestion.id] && (
                    <button
                      type="button"
                      onClick={() => handleTextAnswerChange('')}
                      className="px-3.5 py-3 rounded-xl bg-[#edf3fd] hover:bg-[#d9e7fb] text-xs font-bold text-[#0045ad] cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <MathSymbolBar onInsertSymbol={handleInsertSymbol} />
              </div>
            )}

            {/* 3. Short Answer / Essay Input */}
            {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'essay') && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#5b6576] font-semibold">
                  <span>Type your response & show your steps / explanation:</span>
                  <span>{(answers[currentQuestion.id] || '').length} characters</span>
                </div>
                <textarea
                  rows={currentQuestion.type === 'essay' ? 5 : 3}
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleTextAnswerChange(e.target.value)}
                  placeholder="Write your answer, key steps, or explanation..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-[#d9e7fb] text-[#171717] text-sm focus:border-[#005ce6] focus:outline-none leading-relaxed shadow-xs"
                />
                <MathSymbolBar onInsertSymbol={handleInsertSymbol} />
              </div>
            )}

            {/* Hint Accordion */}
            {currentQuestion.hint && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1.5 text-xs text-[#005ce6] hover:text-[#004fc6] font-bold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>{showHint ? 'Hide Hint' : 'Need a hint?'}</span>
                </button>
                {showHint && (
                  <div className="mt-2 p-3.5 rounded-2xl bg-[#fff1cf] border border-[#fde68a] text-xs text-[#8a4508] font-medium animate-fade-in">
                    💡 <strong>Hint:</strong> {currentQuestion.hint}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Navigation Bar (Mobile Friendly) */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#d9e7fb] py-3.5 px-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Previous Button */}
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="btn btn-secondary !py-2.5 !px-4 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Quick Matrix Drawer Opener */}
          <button
            onClick={() => setIsQuestionGridOpen(true)}
            className="card-action-pill !bg-[#edf3fd] !border-[#d9e7fb] !text-[#0045ad]"
          >
            <Grid className="w-3.5 h-3.5 text-[#005ce6]" />
            <span>
              {currentIndex + 1} / {totalQuestions}
            </span>
          </button>

          {/* Next or Finish Button */}
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={goToNext}
              className="btn btn-primary !py-2.5 !px-6"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsSubmitConfirmOpen(true)}
              className="btn !bg-[#43b3a3] hover:!bg-[#359e8f] !text-white !py-2.5 !px-6 shadow-md shadow-[#43b3a3]/20"
            >
              <Send className="w-4 h-4" />
              <span>Submit & Mark</span>
            </button>
          )}
        </div>
      </footer>

      {/* Question Grid Modal */}
      {isQuestionGridOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Question Matrix</h3>
              </div>
              <button
                onClick={() => setIsQuestionGridOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Legend */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-600 font-medium py-1">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Flagged
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-300" /> Unanswered
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-5 gap-2.5 py-2 max-h-60 overflow-y-auto">
              {exam.questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]?.trim());
                const isFlagged = Boolean(flaggedQuestions[q.id]);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsQuestionGridOpen(false);
                    }}
                    className={`h-11 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-blue-600 scale-105 shadow-sm'
                        : ''
                    } ${
                      isFlagged
                        ? 'bg-amber-400 text-slate-950 font-extrabold'
                        : isAnswered
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span className="text-[9px] opacity-75 font-normal">{q.marks}m</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setIsQuestionGridOpen(false);
                setIsSubmitConfirmOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/20 cursor-pointer"
            >
              Finish & Review Paper
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-slate-900">Ready to Submit Exam?</h3>
              <p className="text-xs text-slate-500 font-medium">
                SkoolMate will immediately grade your answers, award partial marks, and deliver a detailed report.
              </p>
            </div>

            {/* Exam Completion Breakdown */}
            <div className="grid grid-cols-3 gap-2 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Answered</span>
                <span className="text-base font-extrabold text-emerald-600">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Unanswered</span>
                <span className="text-base font-extrabold text-rose-600">
                  {totalQuestions - answeredCount}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Flagged</span>
                <span className="text-base font-extrabold text-amber-500">
                  {Object.values(flaggedQuestions).filter(Boolean).length}
                </span>
              </div>
            </div>

            {totalQuestions - answeredCount > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>You have {totalQuestions - answeredCount} unanswered question(s). You can go back to finish them or submit now.</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsSubmitConfirmOpen(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Keep Working
              </button>
              <button
                onClick={() => {
                  setIsSubmitConfirmOpen(false);
                  onSubmitExam(answers, timeSpentSeconds);
                }}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Marking Paper...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm & Mark</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Isolated Diagram Zoom Modal */}
      <DiagramModal
        isOpen={isDiagramModalOpen}
        onClose={() => setIsDiagramModalOpen(false)}
        title={`Question ${currentQuestion.number} Diagram`}
        diagramSvg={currentQuestion.diagramSvg}
        imageUrl={currentQuestion.imageUrl}
        description={currentQuestion.diagramDescription}
      />

      {/* Student Scratchpad Modal */}
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />
    </div>
  );
};
