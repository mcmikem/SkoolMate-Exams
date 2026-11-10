import React from 'react';
import { Play, BookOpen, Clock, Award, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { Exam } from '../types/exam';

interface ExamCardProps {
  exam: Exam;
  onStartExam: (exam: Exam) => void;
  onReadNotes?: (exam: Exam) => void;
  isStaffMode?: boolean;
  onEditExam?: (exam: Exam) => void;
  onDeleteExam?: (examId: string) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  onStartExam,
  onReadNotes,
  isStaffMode = false,
  onEditExam,
  onDeleteExam,
}) => {
  const isNotes = exam.category === 'revision_notes';

  const getSubjectColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('math')) return 'bg-[#eef4ff] text-[#005ce6] border-[#b0ccf7]';
    if (s.includes('phys')) return 'bg-[#e0f2fe] text-[#0284c7] border-[#bae6fd]';
    if (s.includes('chem')) return 'bg-[#f3e8ff] text-[#7c3aed] border-[#ddd6fe]';
    if (s.includes('bio') || s.includes('sci')) return 'bg-[#dff7f3] text-[#065f46] border-[#a2ecd8]';
    if (s.includes('sst') || s.includes('social') || s.includes('hist') || s.includes('geog'))
      return 'bg-[#fff1cf] text-[#8a4508] border-[#fde68a]';
    return 'bg-[#edf3fd] text-[#0045ad] border-[#d9e7fb]';
  };

  const getCategoryLabel = (cat: string, term?: string) => {
    switch (cat) {
      case 'holiday_package':
        return term ? `${term} Package` : 'Holiday Package';
      case 'mock_exam':
        return 'Mock Examination';
      case 'revision_notes':
        return 'Revision Notes';
      default:
        return 'UNEB Past Paper';
    }
  };

  return (
    <div className="sm-card p-5 sm:p-6 flex flex-col justify-between group transition-all hover:border-[#b0ccf7]">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getSubjectColor(exam.subject)}`}>
              {exam.subject}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#f4f7fd] text-[#001f3f] border border-[#d9e7fb]">
              {exam.classGrade}
            </span>
            <span className="text-[11px] text-[#5b6576] font-semibold">
              {getCategoryLabel(exam.category, exam.term)}
            </span>
          </div>

          {exam.year && (
            <span className="text-xs font-bold font-mono text-[#005ce6] bg-[#eef4ff] px-2 py-0.5 rounded-md">
              {exam.year}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-heading font-extrabold text-base text-[#171717] group-hover:text-[#005ce6] transition-colors line-clamp-2 mb-2 leading-snug">
          {exam.title}
        </h3>

        {/* Exam Board / Session */}
        <div className="text-xs text-[#5b6576] mb-3.5 flex items-center gap-1.5 font-medium">
          <span className="text-[#001f3f] font-bold">{exam.examBoard || 'Uganda Curriculum'}</span>
          <span>•</span>
          <span className="truncate">{exam.session || 'Official'}</span>
        </div>

        {/* Metadata stats */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-[#d9e7fb] text-xs mb-4">
          <div className="flex items-center gap-1.5 text-[#313131] font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#005ce6] shrink-0" />
            <span>{exam.durationMinutes} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#313131] font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-[#43b3a3] shrink-0" />
            <span>{exam.questions.length} Qs</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#313131] font-semibold">
            <Award className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
            <span>{exam.totalMarks} marks</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        {isNotes ? (
          <button
            onClick={() => onReadNotes && onReadNotes(exam)}
            className="btn btn-secondary flex-1 !py-2.5 text-xs sm:text-sm !text-[#005ce6] !border-[#b0ccf7] hover:!bg-[#eef4ff]"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Read Summary Notes</span>
          </button>
        ) : (
          <button
            onClick={() => onStartExam(exam)}
            className="btn btn-primary flex-1 !py-2.5 text-xs sm:text-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Practice</span>
          </button>
        )}

        {isStaffMode && onEditExam && (
          <button
            onClick={() => onEditExam(exam)}
            className="btn btn-secondary !py-2.5 !px-3 text-xs"
            title="Edit exam"
          >
            Edit
          </button>
        )}

        {isStaffMode && onDeleteExam && (
          <button
            onClick={() => onDeleteExam(exam.id)}
            className="btn btn-secondary !py-2.5 !px-3 text-xs !text-[#f04444] hover:!bg-[#fac5c5]/20"
            title="Delete paper"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
