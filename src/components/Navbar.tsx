import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  User,
  Shield,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ClassGrade } from '../types/exam';

interface StudentProfile {
  name: string;
  classGrade: ClassGrade;
  school?: string;
}

interface NavbarProps {
  currentView: 'vault' | 'runner' | 'grading' | 'editor';
  onNavigate: (view: 'vault' | 'runner' | 'grading' | 'editor') => void;
  selectedClass: string;
  onSelectClass: (c: string) => void;
  hasActiveExam: boolean;
  hasGradingResult: boolean;
  studentProfile: StudentProfile;
  onOpenSignInModal: () => void;
  onOpenStaffModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  selectedClass,
  onSelectClass,
  hasActiveExam,
  hasGradingResult,
  studentProfile,
  onOpenSignInModal,
  onOpenStaffModal,
}) => {
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

  const classOptions = [
    { label: 'All Classes (P.5 - S.6)', value: 'All' },
    { label: 'P.7 Candidate (PLE)', value: 'P.7' },
    { label: 'P.6 Primary', value: 'P.6' },
    { label: 'P.5 Primary', value: 'P.5' },
    { label: 'S.4 Candidate (UCE)', value: 'S.4' },
    { label: 'S.3 Lower Secondary', value: 'S.3' },
    { label: 'S.2 Lower Secondary', value: 'S.2' },
    { label: 'S.1 Lower Secondary', value: 'S.1' },
    { label: 'S.6 Candidate (UACE)', value: 'S.6' },
    { label: 'S.5 Upper Secondary', value: 'S.5' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#d9e7fb] shadow-xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          onClick={() => onNavigate('vault')}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#005ce6] flex items-center justify-center text-white shadow-xs shadow-[#005ce6]/25">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight font-heading text-[#001f3f]">
                SKOOLMATE <span className="text-[#005ce6]">EXAMS</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#eef4ff] text-[#005ce6] border border-[#b0ccf7]">
                UGANDA
              </span>
            </div>
            <p className="text-[10px] text-[#5b6576] font-medium hidden sm:block">
              Your Digital Learning & Past Paper Partner • by Omuto
            </p>
          </div>
        </div>

        {/* Student Class Switcher (Center) */}
        <div className="relative">
          <button
            onClick={() => setClassDropdownOpen(!classDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4f7fd] border border-[#d9e7fb] hover:border-[#b0ccf7] text-xs font-bold text-[#001f3f] cursor-pointer transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#005ce6]" />
            <span className="max-w-[110px] sm:max-w-none truncate">
              {selectedClass === 'All' ? 'All Classes' : `Class: ${selectedClass}`}
            </span>
            <ChevronDown className="w-3 h-3 text-[#7b8698]" />
          </button>

          {classDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-56 bg-white border border-[#d9e7fb] rounded-2xl shadow-xl py-1.5 z-50 animate-fade-in text-xs">
              <div className="px-3 py-1 text-[10px] font-bold text-[#7b8698] uppercase tracking-wider border-b border-[#d9e7fb]/60">
                Select Your Class
              </div>
              {classOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onSelectClass(opt.value);
                    setClassDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 font-medium flex items-center justify-between transition-colors ${
                    selectedClass === opt.value
                      ? 'bg-[#eef4ff] text-[#005ce6] font-bold'
                      : 'text-[#313131] hover:bg-[#f4f7fd]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedClass === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[#005ce6]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active test indicator */}
          {hasActiveExam && (
            <button
              onClick={() => onNavigate('runner')}
              className={`card-action-pill ${
                currentView === 'runner'
                  ? '!bg-[#005ce6] !text-white !border-[#005ce6] shadow-xs'
                  : '!text-[#005ce6] !bg-[#eef4ff] !border-[#b0ccf7]'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#005ce6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005ce6]"></span>
              </span>
              <span>Test Room</span>
            </button>
          )}

          {/* Results indicator */}
          {hasGradingResult && (
            <button
              onClick={() => onNavigate('grading')}
              className={`card-action-pill ${
                currentView === 'grading'
                  ? '!bg-[#43b3a3] !text-white !border-[#43b3a3] shadow-xs'
                  : '!text-[#065f46] !bg-[#dff7f3] !border-[#a2ecd8]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          )}

          {/* Student Profile / Sign In */}
          <button
            onClick={onOpenSignInModal}
            className="card-action-pill hover:!bg-[#edf3fd] !text-[#001f3f]"
            title="Student Profile"
          >
            <div className="w-5 h-5 rounded-full bg-[#005ce6] text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">
              {studentProfile.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline font-bold">{studentProfile.name}</span>
          </button>

          {/* Discreet Staff Portal Lock Icon (Owner Only) */}
          <button
            onClick={onOpenStaffModal}
            className="p-2 rounded-xl text-[#7b8698] hover:text-[#005ce6] hover:bg-[#edf3fd] transition-colors cursor-pointer"
            title="Staff & Teacher Portal"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
