import React, { useState } from 'react';
import { ExamGradingResult, Exam } from '../types/exam';
import { DiagramModal } from './DiagramModal';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  ZoomIn,
} from 'lucide-react';

interface ExamGradingViewProps {
  result: ExamGradingResult;
  exam: Exam;
  onRetake: () => void;
  onBackToVault: () => void;
}

export const ExamGradingView: React.FC<ExamGradingViewProps> = ({
  result,
  exam,
  onRetake,
  onBackToVault,
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [activeDiagramQuestion, setActiveDiagramQuestion] = useState<number | null>(null);

  const toggleSolution = (qId: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const getGradeBadge = (grade: string) => {
    if (grade.includes('A')) return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (grade.includes('B')) return 'bg-blue-50 text-blue-700 border-blue-300';
    if (grade.includes('C')) return 'bg-amber-50 text-amber-800 border-amber-300';
    return 'bg-rose-50 text-rose-700 border-rose-300';
  };

  const formatMinutes = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  const filteredGradings = result.questionGradings.filter((g) => {
    if (filter === 'correct') return g.isCorrect || g.marksAwarded >= g.maxMarks * 0.7;
    if (filter === 'incorrect') return !g.isCorrect && g.marksAwarded < g.maxMarks;
    return true;
  });

  const activeQuestionData = activeDiagramQuestion
    ? exam.questions.find((q) => q.number === activeDiagramQuestion)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in text-[#171717]">
      {/* Top Header Card with Score & Grade in SkoolMate style */}
      <div className="sm-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef4ff] border border-[#b0ccf7] text-[#005ce6] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>SkoolMate Academic Evaluation Complete</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001f3f] tracking-tight font-heading">
              {result.examTitle}
            </h1>
            <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-[#5b6576] font-medium pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#005ce6]" />
                Time Spent: {formatMinutes(result.timeSpentSeconds)}
              </span>
              <span>•</span>
              <span className="font-semibold text-[#171717]">Subject: {exam.subject}</span>
            </div>
          </div>

          {/* Big Score / Grade Badge */}
          <div className="flex items-center gap-4 bg-[#f4f7fd] p-4 rounded-2xl border border-[#d9e7fb]">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-[#001f3f] font-mono">
                {result.totalMarksAwarded}
                <span className="text-lg text-[#7b8698]">/{result.totalMaxMarks}</span>
              </div>
              <span className="text-[11px] text-[#5b6576] font-bold uppercase tracking-wider">Marks Awarded</span>
            </div>

            <div className="h-10 w-px bg-[#d9e7fb]" />

            <div className="text-center">
              <div
                className={`text-3xl sm:text-4xl font-black px-3 py-0.5 rounded-xl border ${getGradeBadge(
                  result.grade
                )}`}
              >
                {result.grade}
              </div>
              <span className="text-[11px] text-[#5b6576] font-bold uppercase tracking-wider">{result.percentage}% Score</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-6 border-t border-[#d9e7fb] mt-6 flex-wrap">
          <button
            onClick={onRetake}
            className="btn btn-primary"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Paper</span>
          </button>

          <button
            onClick={onBackToVault}
            className="btn btn-secondary"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#005ce6]" />
            <span>All Past Papers</span>
          </button>
        </div>
      </div>

      {/* Examiner Summary & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overview */}
        <div className="md:col-span-3 sm-card p-6 space-y-2">
          <div className="flex items-center gap-2 text-[#005ce6] text-xs font-extrabold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Examiner's Assessment</span>
          </div>
          <p className="text-sm text-[#313131] leading-relaxed font-medium">{result.summaryFeedback}</p>
        </div>

        {/* Strengths */}
        <div className="md:col-span-1 bg-emerald-50/60 border border-emerald-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-1.5 text-xs text-emerald-900 font-medium list-disc list-inside">
            {result.strengths.map((str, idx) => (
              <li key={idx}>{str}</li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="md:col-span-2 bg-amber-50/60 border border-amber-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Recommended Revision Focus</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-900 font-medium list-disc list-inside">
            {result.improvements.map((imp, idx) => (
              <li key={idx}>{imp}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question by Question Detailed Breakdown */}
      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex items-center justify-between gap-3 border-b border-[#d9e7fb] pb-3">
          <h2 className="text-base font-extrabold text-[#001f3f] font-heading">Step-by-Step Question Review</h2>
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#d9e7fb] text-xs shadow-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors font-bold cursor-pointer ${
                filter === 'all' ? 'bg-[#005ce6] text-white shadow-xs' : 'text-[#5b6576] hover:text-[#171717]'
              }`}
            >
              All ({result.questionGradings.length})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1 rounded-lg transition-colors font-bold cursor-pointer ${
                filter === 'correct' ? 'bg-[#43b3a3] text-white shadow-xs' : 'text-[#5b6576] hover:text-[#171717]'
              }`}
            >
              Correct
            </button>
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1 rounded-lg transition-colors font-bold cursor-pointer ${
                filter === 'incorrect' ? 'bg-[#f04444] text-white shadow-xs' : 'text-[#5b6576] hover:text-[#171717]'
              }`}
            >
              Needs Review
            </button>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-4">
          {filteredGradings.map((g) => {
            const questionData = exam.questions.find((q) => q.id === g.questionId || q.number === g.questionNumber);
            const isFullMarks = g.marksAwarded >= g.maxMarks;
            const isPartial = !isFullMarks && g.marksAwarded > 0;
            const isExpanded = expandedSolutions[g.questionId] ?? true;

            return (
              <div
                key={g.questionId}
                className="sm-card p-5 sm:p-6 space-y-4"
              >
                {/* Question item header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-xl font-extrabold flex items-center justify-center text-xs shrink-0 ${
                        isFullMarks
                          ? 'bg-[#43b3a3] text-white'
                          : isPartial
                          ? 'bg-[#f59e0b] text-white'
                          : 'bg-[#f04444] text-white'
                      }`}
                    >
                      {g.questionNumber}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[#001f3f] font-heading">
                        Question {g.questionNumber}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {questionData?.topic || exam.subject}
                      </span>
                    </div>
                  </div>

                  {/* Marks badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        isFullMarks
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isPartial
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {g.marksAwarded} / {g.maxMarks} Marks
                    </span>

                    <button
                      onClick={() => toggleSolution(g.questionId)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Question text */}
                <p className="text-sm text-slate-800 font-semibold">{questionData?.text}</p>

                {/* Diagram thumbnail if question has one */}
                {(questionData?.diagramSvg || questionData?.imageUrl) && (
                  <div
                    onClick={() => setActiveDiagramQuestion(questionData.number)}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-blue-300 flex items-center justify-between text-xs text-blue-600 group max-w-sm"
                  >
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      View Isolated Question Diagram
                    </span>
                    <ZoomIn className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                )}

                {/* Detailed Comparison & Feedback */}
                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block mb-1 font-bold">Your Submitted Answer:</span>
                        <div className="text-slate-900 font-mono font-bold">
                          {g.studentAnswer?.trim() || <span className="text-slate-400 italic">No answer submitted</span>}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                        <span className="text-emerald-700 block mb-1 font-bold">Target / Correct Answer:</span>
                        <div className="text-emerald-950 font-mono font-bold">
                          {g.correctAnswer || questionData?.correctAnswer || questionData?.modelAnswer}
                        </div>
                      </div>
                    </div>

                    {/* AI Feedback */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-1">
                      <span className="font-extrabold text-blue-900 block">SkoolMate Examiner Notes:</span>
                      <p className="text-blue-950 leading-relaxed font-medium">{g.feedback}</p>
                    </div>

                    {/* Step-by-step model solution */}
                    {g.stepByStepSolution && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <span className="font-bold text-slate-900 block">Step-by-Step Model Working:</span>
                        <pre className="text-slate-700 whitespace-pre-wrap font-sans leading-relaxed font-medium">
                          {g.stepByStepSolution}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Diagram Zoom Modal */}
      {activeQuestionData && (
        <DiagramModal
          isOpen={Boolean(activeDiagramQuestion)}
          onClose={() => setActiveDiagramQuestion(null)}
          title={`Question ${activeQuestionData.number} Diagram`}
          diagramSvg={activeQuestionData.diagramSvg}
          imageUrl={activeQuestionData.imageUrl}
          description={activeQuestionData.diagramDescription}
        />
      )}
    </div>
  );
};
