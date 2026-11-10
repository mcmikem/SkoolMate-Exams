import React from 'react';
import { X, BookOpen, Play, CheckCircle2, Award } from 'lucide-react';
import { Exam } from '../types/exam';

interface NotesReaderModalProps {
  isOpen: boolean;
  exam: Exam | null;
  onClose: () => void;
  onStartExam: (exam: Exam) => void;
}

export const NotesReaderModal: React.FC<NotesReaderModalProps> = ({
  isOpen,
  exam,
  onClose,
  onStartExam,
}) => {
  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#001f3f]/60 backdrop-blur-sm animate-fade-in text-[#171717]">
      <div className="bg-white border border-[#d9e7fb] rounded-[24px] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d9e7fb] bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#edf3fd] text-[#005ce6]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#eef4ff] text-[#005ce6] border border-[#b0ccf7]">
                  {exam.subject} • {exam.classGrade}
                </span>
                <span className="text-[11px] text-[#5b6576] font-semibold">
                  {exam.examBoard || 'Uganda Syllabus'}
                </span>
              </div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#001f3f] mt-0.5">
                {exam.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#edf3fd] text-[#7b8698] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-[#313131] leading-relaxed">
          {exam.notesContent ? (
            <div className="prose prose-slate max-w-none space-y-4">
              <div
                className="space-y-4 whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: exam.notesContent
                    .replace(/^### (.*$)/gim, '<h3 class="font-heading font-extrabold text-base sm:text-lg text-[#001f3f] mt-4 mb-2">$1</h3>')
                    .replace(/^#### (.*$)/gim, '<h4 class="font-heading font-bold text-sm sm:text-base text-[#005ce6] mt-3 mb-1.5">$1</h4>')
                    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-extrabold text-[#001f3f]">$1</strong>'),
                }}
              />
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#f4f7fd] border border-[#d9e7fb] text-xs space-y-2">
              <p className="font-bold text-[#001f3f]">Core Learning Objectives:</p>
              <ul className="list-disc list-inside space-y-1 text-[#5b6576]">
                {exam.instructions.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Practice Questions Callout */}
          {exam.questions.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#edf3fd] border border-[#b0ccf7] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#005ce6]">
                  <Award className="w-4 h-4" />
                  <span>Test Your Comprehension ({exam.questions.length} Quick Questions)</span>
                </div>
                <span className="text-[11px] font-bold text-[#001f3f] bg-white px-2.5 py-0.5 rounded-full border border-[#d9e7fb]">
                  {exam.totalMarks} Total Marks
                </span>
              </div>
              <p className="text-xs text-[#5b6576] font-medium">
                Practice answering these targeted questions in the interactive test room to test your memory and calculate your score.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onStartExam(exam);
                }}
                className="btn btn-primary !py-2.5 !px-5 text-xs font-bold"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Practice Questions Now</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#d9e7fb] bg-white flex items-center justify-between">
          <span className="text-xs text-[#5b6576] font-medium hidden sm:inline">
            SkoolMate Student Library • Free for Learners
          </span>
          <button
            onClick={onClose}
            className="btn btn-secondary !py-2 !px-5 text-xs"
          >
            Close Notes
          </button>
        </div>
      </div>
    </div>
  );
};
