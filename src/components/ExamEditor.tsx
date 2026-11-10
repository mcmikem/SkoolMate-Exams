import React, { useState } from 'react';
import { Exam, ExamQuestion, QuestionType } from '../types/exam';
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle2,
  ChevronLeft,
  Image as ImageIcon,
} from 'lucide-react';

interface ExamEditorProps {
  exam: Exam;
  onSaveExam: (updatedExam: Exam) => Promise<void>;
  onBack: () => void;
  onPreviewExam: (exam: Exam) => void;
}

export const ExamEditor: React.FC<ExamEditorProps> = ({
  exam: initialExam,
  onSaveExam,
  onBack,
  onPreviewExam,
}) => {
  const [exam, setExam] = useState<Exam>(JSON.parse(JSON.stringify(initialExam)));
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewDiagram, setPreviewDiagram] = useState(false);

  const currentQ: ExamQuestion | undefined = exam.questions[selectedQuestionIndex];

  const handleUpdateExamMeta = (field: keyof Exam, value: any) => {
    setExam((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateCurrentQ = (field: keyof ExamQuestion, value: any) => {
    if (!currentQ) return;
    setExam((prev) => {
      const nextQuestions = [...prev.questions];
      nextQuestions[selectedQuestionIndex] = {
        ...nextQuestions[selectedQuestionIndex],
        [field]: value,
      };
      return {
        ...prev,
        questions: nextQuestions,
      };
    });
  };

  const handleUpdateChoice = (choiceIndex: number, text: string) => {
    if (!currentQ || !currentQ.choices) return;
    const updatedChoices = [...currentQ.choices];
    updatedChoices[choiceIndex] = {
      ...updatedChoices[choiceIndex],
      text,
    };
    handleUpdateCurrentQ('choices', updatedChoices);
  };

  const handleAddQuestion = () => {
    const newNumber = exam.questions.length + 1;
    const newQ: ExamQuestion = {
      id: `q-${Date.now()}`,
      number: newNumber,
      type: 'multiple_choice',
      text: `New Question ${newNumber}`,
      marks: 2,
      choices: [
        { id: 'A', label: 'A', text: 'Option A' },
        { id: 'B', label: 'B', text: 'Option B' },
        { id: 'C', label: 'C', text: 'Option C' },
        { id: 'D', label: 'D', text: 'Option D' },
      ],
      correctAnswer: 'A',
      modelAnswer: 'Correct worked solution.',
      topic: exam.subject,
    };

    setExam((prev) => ({
      ...prev,
      questions: [...prev.questions, newQ],
      totalMarks: prev.totalMarks + newQ.marks,
    }));
    setSelectedQuestionIndex(exam.questions.length);
  };

  const handleDeleteQuestion = (indexToDelete: number) => {
    if (exam.questions.length <= 1) {
      alert('Exam must have at least one question.');
      return;
    }

    setExam((prev) => {
      const filtered = prev.questions.filter((_, i) => i !== indexToDelete);
      const renumbered = filtered.map((q, idx) => ({ ...q, number: idx + 1 }));
      return {
        ...prev,
        questions: renumbered,
      };
    });

    if (selectedQuestionIndex >= exam.questions.length - 1) {
      setSelectedQuestionIndex(Math.max(0, exam.questions.length - 2));
    }
  };

  const handleMoveQuestion = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= exam.questions.length) return;

    setExam((prev) => {
      const copy = [...prev.questions];
      const temp = copy[fromIndex];
      copy[fromIndex] = copy[toIndex];
      copy[toIndex] = temp;
      const renumbered = copy.map((q, idx) => ({ ...q, number: idx + 1 }));
      return {
        ...prev,
        questions: renumbered,
      };
    });
    setSelectedQuestionIndex(toIndex);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSaveExam(exam);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error saving exam');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in text-[#171717]">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm-card p-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-[#edf3fd] text-[#5b6576] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-[#001f3f] flex items-center gap-2 font-heading">
              <span>Exam Editor & Recreator</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#eef4ff] text-[#005ce6] border border-[#b0ccf7]">
                Teacher Mode
              </span>
            </h1>
            <p className="text-xs text-[#5b6576] font-medium">
              Edit questions, adjust marks, customize diagrams, and recreate the past paper
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onPreviewExam(exam)}
            className="btn btn-secondary flex-1 sm:flex-initial"
          >
            <Eye className="w-3.5 h-3.5 text-[#005ce6]" />
            <span>Student Preview</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary flex-1 sm:flex-initial"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Paper Information form */}
      <div className="sm-card p-6 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5b6576]">
          Paper Metadata & Instructions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 mb-1 font-bold">Exam Title</label>
            <input
              type="text"
              value={exam.title}
              onChange={(e) => handleUpdateExamMeta('title', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-bold">Subject</label>
            <input
              type="text"
              value={exam.subject}
              onChange={(e) => handleUpdateExamMeta('subject', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-bold">Paper Code / Series</label>
            <input
              type="text"
              value={exam.code || ''}
              onChange={(e) => handleUpdateExamMeta('code', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 font-mono font-medium"
              placeholder="e.g. 0580/42"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-bold">Duration (Minutes)</label>
            <input
              type="number"
              value={exam.durationMinutes}
              onChange={(e) => handleUpdateExamMeta('durationMinutes', Number(e.target.value) || 60)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 font-mono font-medium"
            />
          </div>
        </div>
      </div>

      {/* Question Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Questions list */}
        <div className="lg:col-span-4 sm-card p-5 space-y-3 flex flex-col max-h-[750px]">
          <div className="flex items-center justify-between border-b border-[#d9e7fb] pb-3">
            <span className="text-xs font-extrabold text-[#001f3f] font-heading">
              Questions ({exam.questions.length})
            </span>
            <button
              onClick={handleAddQuestion}
              className="card-action-pill !bg-[#eef4ff] !border-[#b0ccf7] !text-[#005ce6] hover:!bg-[#d9e7fb]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {exam.questions.map((q, idx) => {
              const isSelected = idx === selectedQuestionIndex;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestionIndex(idx)}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#eef4ff] border-[#005ce6] text-[#001f3f] font-bold shadow-xs'
                      : 'bg-[#f4f7fd] border-[#d9e7fb] text-[#313131] hover:border-[#b0ccf7] hover:bg-[#edf3fd] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-6 h-6 rounded-lg bg-white border border-[#d9e7fb] flex items-center justify-center font-extrabold text-[11px] shrink-0 text-[#005ce6]">
                      {idx + 1}
                    </span>
                    <span className="truncate">{q.text}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] bg-[#fff1cf] border border-[#fde68a] px-1.5 py-0.5 rounded text-[#8a4508] font-bold">
                      {q.marks}m
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveQuestion(idx, 'up');
                      }}
                      disabled={idx === 0}
                      className="p-1 text-[#7b8698] hover:text-[#171717] disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveQuestion(idx, 'down');
                      }}
                      disabled={idx === exam.questions.length - 1}
                      className="p-1 text-[#7b8698] hover:text-[#171717] disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuestion(idx);
                      }}
                      className="p-1 text-[#7b8698] hover:text-[#f04444] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected question details */}
        {currentQ ? (
          <div className="lg:col-span-8 sm-card p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-[#d9e7fb] pb-3">
              <h3 className="font-extrabold text-sm text-[#001f3f] flex items-center gap-2 font-heading">
                <span>Editing Question #{currentQ.number}</span>
              </h3>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                  <span>Type:</span>
                  <select
                    value={currentQ.type}
                    onChange={(e) => handleUpdateCurrentQ('type', e.target.value as QuestionType)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none font-medium"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="numerical">Numerical</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="essay">Essay / Long Answer</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                  <span>Marks:</span>
                  <input
                    type="number"
                    value={currentQ.marks}
                    onChange={(e) => handleUpdateCurrentQ('marks', Number(e.target.value) || 1)}
                    className="w-16 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Question Statement</label>
              <textarea
                rows={3}
                value={currentQ.text}
                onChange={(e) => handleUpdateCurrentQ('text', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            {/* Multiple Choice Options Editor */}
            {currentQ.type === 'multiple_choice' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Multiple Choice Options & Key Answer
                </label>
                <div className="space-y-2">
                  {(currentQ.choices || []).map((choice, cIdx) => (
                    <div key={choice.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateCurrentQ('correctAnswer', choice.label)}
                        className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 border-2 transition-colors cursor-pointer ${
                          currentQ.correctAnswer === choice.label
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                        title="Click to mark as correct answer"
                      >
                        {choice.label}
                      </button>
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => handleUpdateChoice(cIdx, e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600 font-medium"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Click the option badge (A/B/C/D) to set the correct answer.
                </p>
              </div>
            )}

            {/* Target Value */}
            {currentQ.type !== 'multiple_choice' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Target Value / Correct Form</label>
                <input
                  type="text"
                  value={currentQ.correctAnswer || ''}
                  onChange={(e) => handleUpdateCurrentQ('correctAnswer', e.target.value)}
                  placeholder="e.g. 17 cm, or x = 3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600 font-mono font-medium"
                />
              </div>
            )}

            {/* Model Answer & Steps */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Model Answer & Step-by-Step Solution
              </label>
              <textarea
                rows={3}
                value={currentQ.modelAnswer || ''}
                onChange={(e) => handleUpdateCurrentQ('modelAnswer', e.target.value)}
                placeholder="Full worked steps for scoring and student review..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600 leading-relaxed font-mono font-medium"
              />
            </div>

            {/* Diagram SVG / Isolated Figure Editor */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Isolated SVG Diagram (Circuits, Geometry, Graphs)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPreviewDiagram(!previewDiagram)}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  {previewDiagram ? 'Hide Preview' : 'Show Diagram Preview'}
                </button>
              </div>

              <textarea
                rows={3}
                value={currentQ.diagramSvg || ''}
                onChange={(e) => handleUpdateCurrentQ('diagramSvg', e.target.value)}
                placeholder="<svg viewBox='0 0 320 200' ...>...</svg>"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-600 font-medium"
              />

              {previewDiagram && currentQ.diagramSvg && (
                <div
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center max-h-48 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: currentQ.diagramSvg }}
                />
              )}
            </div>

            {/* Hint & Topic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
                <input
                  type="text"
                  value={currentQ.topic || ''}
                  onChange={(e) => handleUpdateCurrentQ('topic', e.target.value)}
                  placeholder="e.g. Pythagoras or DC Circuits"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hint for Student</label>
                <input
                  type="text"
                  value={currentQ.hint || ''}
                  onChange={(e) => handleUpdateCurrentQ('hint', e.target.value)}
                  placeholder="e.g. Recall a² + b² = c²"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center p-12 text-slate-400 text-xs">
            Select a question on the left to edit its details.
          </div>
        )}
      </div>
    </div>
  );
};
