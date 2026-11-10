import React, { useState } from 'react';
import { Exam, ResourceCategory } from '../types/exam';
import { ExamCard } from './ExamCard';
import { SchoolCalendarCard } from './SchoolCalendarCard';
import {
  Search,
  BookOpen,
  Calendar,
  Layers,
  FileText,
  Package,
  Award,
  GraduationCap,
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Users,
  Banknote,
  UserCheck,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Play,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

interface ExamVaultProps {
  exams: Exam[];
  onStartExam: (exam: Exam) => void;
  onReadNotes: (exam: Exam) => void;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
  selectedClass: string;
  onSelectClass: (c: string) => void;
  isStaffMode?: boolean;
}

export const ExamVault: React.FC<ExamVaultProps> = ({
  exams,
  onStartExam,
  onReadNotes,
  onEditExam,
  onDeleteExam,
  selectedClass,
  onSelectClass,
  isStaffMode = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'all'>('past_paper');
  const [activeTab, setActiveTab] = useState<'fees' | 'students' | 'attendance' | 'grades' | 'reports' | 'timetable' | 'messages'>('grades');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedTerm, setSelectedTerm] = useState<string>('All');
  const [tasksExpanded, setTasksExpanded] = useState(true);

  // Available subjects from current exams
  const subjects = ['All', ...Array.from(new Set(exams.map((e) => e.subject)))];

  // Available years from past papers
  const years = ['All', '2024', '2023', '2022', '2021', '2020'];

  // Featured exam for the UP NEXT banner (e.g. UCE 2024 Math or first paper)
  const featuredExam = exams.find((e) => e.classGrade === selectedClass) || exams[0];

  // Filtering logic
  const filteredExams = exams.filter((e) => {
    // 1. Category filter
    if (activeCategory !== 'all' && e.category !== activeCategory) {
      return false;
    }

    // 2. Class filter
    if (selectedClass !== 'All' && e.classGrade !== selectedClass) {
      return false;
    }

    // 3. Subject filter
    if (selectedSubject !== 'All' && e.subject !== selectedSubject) {
      return false;
    }

    // 4. Year filter (for past papers)
    if (activeCategory === 'past_paper' && selectedYear !== 'All' && e.year !== selectedYear) {
      return false;
    }

    // 5. Term filter (for holiday packages)
    if (activeCategory === 'holiday_package' && selectedTerm !== 'All' && e.term !== selectedTerm) {
      return false;
    }

    // 6. Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        e.title.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        (e.code && e.code.toLowerCase().includes(q)) ||
        (e.examBoard && e.examBoard.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in text-[#171717] pb-12">
      {/* 1. TOP STAT / KPI STRIP (Matching SkoolMate OS screenshot exactly) */}
      <div className="bg-white border-b border-[#e2e8f0] -mx-4 sm:-mx-6 -mt-6 px-6 sm:px-10 py-5">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
          {/* Stat 1: Students / Enrolled Level */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">
              Enrolled Candidate Level
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                {selectedClass === 'All' ? 'P.5 — S.6' : `${selectedClass} Candidate`}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {selectedClass.startsWith('P') ? 'Primary Leaving Exams (PLE)' : selectedClass === 'S.5' || selectedClass === 'S.6' ? 'UACE Upper Secondary' : 'UCE Lower Secondary'} • Uganda
            </p>
          </div>

          {/* Divider 1 */}
          <div className="hidden md:block w-px h-10 bg-slate-200 justify-self-center" />

          {/* Stat 2: Attendance today / Practice Status */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">
              Practice Papers Available
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                {filteredExams.length} Papers
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Ready for immediate mobile testing
            </p>
          </div>

          {/* Divider 2 */}
          <div className="hidden md:block w-px h-10 bg-slate-200 justify-self-center" />

          {/* Stat 3: Fees collected / Average Score */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">
              Curriculum Mastery
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                78% Average
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Division 1 Standard (UNEB Scale)
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-6">
        {/* 2. SCHOOL SETUP CHECKLIST BANNER (Matching SkoolMate OS screenshot) */}
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900">
              Uganda Candidate Exam Readiness Checklist
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              6 of 8 compulsory curriculum subjects revised with past questions and marking rubrics
            </p>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <span className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
              75%
            </span>
            <button
              onClick={() => onSelectClass(selectedClass === 'All' ? 'S.4' : 'All')}
              className="px-5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
            >
              {selectedClass === 'All' ? 'Select Class' : 'View All Classes'}
            </button>
          </div>
        </div>

        {/* 3. HORIZONTAL SUB-NAVIGATION TABS (Exact match from SkoolMate OS screenshot) */}
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto border-b border-[#e2e8f0] pb-2 text-xs font-semibold text-slate-600 no-scrollbar">
          <button
            onClick={() => {
              setActiveTab('fees');
              setActiveCategory('past_paper');
            }}
            className={`flex items-center gap-2 pb-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'past_paper'
                ? 'text-[#102a4e] border-b-2 border-[#102a4e] font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Past Papers</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('attendance');
              setActiveCategory('holiday_package');
            }}
            className={`flex items-center gap-2 pb-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'holiday_package'
                ? 'text-[#102a4e] border-b-2 border-[#102a4e] font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-slate-500" />
            <span>Holiday Packages</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('grades');
              setActiveCategory('mock_exam');
            }}
            className={`flex items-center gap-2 pb-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'mock_exam'
                ? 'text-[#102a4e] border-b-2 border-[#102a4e] font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-slate-500" />
            <span>Mock Exams</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('reports');
              setActiveCategory('revision_notes');
            }}
            className={`flex items-center gap-2 pb-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'revision_notes'
                ? 'text-[#102a4e] border-b-2 border-[#102a4e] font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Revision Notes</span>
          </button>

          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 pb-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'all'
                ? 'text-[#102a4e] border-b-2 border-[#102a4e] font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>All Resources</span>
          </button>
        </div>

        {/* 4. MAIN 2-COLUMN DASHBOARD GRID (Exact layout from SkoolMate OS screenshot) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (approx 68% / 8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 4A. DARK NAVY "UP NEXT" HERO BANNER (Matches screenshot pixel-for-pixel) */}
            {featuredExam && (
              <div className="bg-[#102a4e] rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold tracking-widest text-slate-300 uppercase text-[11px]">
                    UP NEXT
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-bold text-[11px] border border-white/15">
                    Recommended
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-1.5 max-w-lg">
                    <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                      {featuredExam.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      {featuredExam.examBoard || 'Uganda Curriculum'} • {featuredExam.durationMinutes} Minutes • {featuredExam.totalMarks} Marks • {featuredExam.questions.length} Questions
                    </p>
                  </div>

                  {/* Actions matching screenshot right side */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {featuredExam.notesContent && (
                      <button
                        onClick={() => onReadNotes(featuredExam)}
                        className="px-4 py-2.5 rounded-full border border-slate-400/50 hover:bg-white/10 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Read Notes
                      </button>
                    )}

                    <button
                      onClick={() => onStartExam(featuredExam)}
                      className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-[#102a4e]" />
                      <span>Take now</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4B. "ALL OPEN TASKS" ACCORDION (Matches screenshot pixel-for-pixel) */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    All open practice tasks
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                    3
                  </span>
                </div>

                <button
                  onClick={() => setTasksExpanded(!tasksExpanded)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {tasksExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {tasksExpanded && (
                <div className="space-y-3.5 text-xs">
                  {/* Task 1: Amber Icon */}
                  <div className="flex items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          Term 2 Holiday Packages available for {selectedClass === 'All' ? 'Primary & Secondary' : selectedClass}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Complete vacation assignments before Term 3 resumes
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveCategory('holiday_package')}
                      className="text-[#005ce6] hover:underline font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Open
                    </button>
                  </div>

                  <div className="w-full h-px bg-slate-100" />

                  {/* Task 2: Red Icon */}
                  <div className="flex items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-100/70 text-rose-800 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          UNEB Past Papers 2020 – 2024 with examiner scoring rubrics
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Mathematics, Science, Physics, Chemistry, Biology & SST
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveCategory('past_paper')}
                      className="text-[#005ce6] hover:underline font-bold text-xs shrink-0 cursor-pointer"
                    >
                      View
                    </button>
                  </div>

                  <div className="w-full h-px bg-slate-100" />

                  {/* Task 3: Blue Icon */}
                  <div className="flex items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100/70 text-blue-800 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          Wakiso & Kampala Joint Mock Examinations uploaded
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Timed practice under authentic Uganda national exam conditions
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveCategory('mock_exam')}
                      className="text-[#005ce6] hover:underline font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Practice
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4C. SEARCH & SUBJECT / YEAR FILTER TOOLBAR */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search past papers, topics, code..."
                    className="w-full pl-9 pr-4 py-2 bg-[#f8fbff] rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#005ce6] focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* Year Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
                  <span className="text-slate-400 font-bold text-[11px] mr-1">Year:</span>
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        selectedYear === y
                          ? 'bg-[#102a4e] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-slate-400 font-bold text-[11px] mr-1 shrink-0">Subject:</span>
                {subjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedSubject === sub
                        ? 'bg-[#005ce6] text-white shadow-xs'
                        : 'bg-[#f4f7fc] text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* 4D. EXAM CARDS GRID */}
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {activeCategory === 'past_paper'
                    ? 'UNEB Past Examination Papers'
                    : activeCategory === 'holiday_package'
                    ? 'Term Holiday Packages'
                    : activeCategory === 'mock_exam'
                    ? 'Joint Mock Examinations'
                    : 'Curriculum Revision Notes'}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Showing {filteredExams.length} results
                </span>
              </div>

              {filteredExams.length === 0 ? (
                <div className="p-12 text-center bg-white border border-[#e2e8f0] rounded-3xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#005ce6] flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-extrabold text-base text-slate-900">
                    No examination papers found
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try adjusting your filters or switch classes to view more papers.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSubject('All');
                      setSelectedYear('All');
                      setSearchTerm('');
                    }}
                    className="btn btn-secondary !text-xs !py-1.5"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExams.map((exam) => (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      onStartExam={onStartExam}
                      onReadNotes={onReadNotes}
                      isStaffMode={isStaffMode}
                      onEditExam={onEditExam}
                      onDeleteExam={onDeleteExam}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 4E. "TEAM ACTIVITY" SECTION (Matches screenshot pixel-for-pixel) */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Recent Student Activity & Submissions
                </h3>
                <button
                  onClick={() => {}}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View all</span>
                  <span>↗</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#102a4e] text-white flex items-center justify-center font-bold text-xs">
                      BK
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        Brian Kato completed UNEB UCE Mathematics Paper 1
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Score: 88/100 (Grade 1 • Distinction) • 42 mins
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Distinction 1
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#005ce6] text-white flex items-center justify-center font-bold text-xs">
                      SM
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        Sarah Namubiru submitted Term 2 S.4 Mathematics Package
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Score: 42/50 (Grade 1 • Distinction) • 31 mins
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Distinction 2
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (approx 32% / 4 cols - Matches School Calendar in screenshot) */}
          <div className="lg:col-span-4 space-y-6">
            {/* The exact SCHOOL CALENDAR widget */}
            <SchoolCalendarCard
              onSelectDate={(d) => {}}
              onAddEvent={() => {}}
            />

            {/* Uganda UNEB Grading Scale Card */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                  UNEB Grading Scale
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Uganda National
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                  <span className="font-bold text-emerald-900">Division 1 (D1 - D2)</span>
                  <span className="font-bold text-emerald-700">75% - 100%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 border border-blue-200/60">
                  <span className="font-bold text-blue-900">Division 2 (C3 - C6)</span>
                  <span className="font-bold text-blue-700">55% - 74%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-200/60">
                  <span className="font-bold text-amber-900">Division 3 (P7 - P8)</span>
                  <span className="font-bold text-amber-700">40% - 54%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/70 border border-rose-200/60">
                  <span className="font-bold text-rose-900">Division 4 / Fail (F9)</span>
                  <span className="font-bold text-rose-700">0% - 39%</span>
                </div>
              </div>
            </div>

            {/* Quick Candidate Tips */}
            <div className="bg-gradient-to-br from-[#102a4e] to-[#1c3e6b] text-white rounded-3xl p-5 shadow-sm space-y-2.5">
              <span className="text-[10px] font-bold tracking-widest text-[#38bdf8] uppercase">
                Examination Technique
              </span>
              <h4 className="font-heading font-extrabold text-sm text-white">
                Show All Step-by-Step Working
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                In UNEB Mathematics and Physics papers, Method marks (M1, M2) are awarded for intermediate steps even if your final arithmetic is off. Use the digital scratchpad to practice showing full working!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
