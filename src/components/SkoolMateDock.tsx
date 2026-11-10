import React from 'react';
import {
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  Building2,
  MoreHorizontal,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SkoolMateDockProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenStaffModal: () => void;
  onOpenSignInModal: () => void;
  studentName: string;
}

export const SkoolMateDock: React.FC<SkoolMateDockProps> = ({
  currentTab,
  onSelectTab,
  onOpenStaffModal,
  onOpenSignInModal,
  studentName,
}) => {
  const dockItems = [
    { id: 'calendar', label: 'School Calendar', icon: Calendar },
    { id: 'holiday_packages', label: 'Holiday Packages', icon: Briefcase },
    { id: 'exams', label: 'Past Papers & Exams', icon: GraduationCap },
    { id: 'notes', label: 'Revision Notes', icon: FileText },
    { id: 'curriculum', label: 'Curriculum & Classes', icon: Building2 },
  ];

  return (
    <aside className="w-[68px] sm:w-[72px] bg-white border-r border-[#e2e8f0] flex flex-col items-center py-4 shrink-0 select-none z-30">
      {/* School Crest / SkoolMate OS Badge */}
      <button
        onClick={onOpenSignInModal}
        title={`Student: ${studentName}`}
        className="w-10 h-10 rounded-full border-2 border-[#102a4e]/20 p-0.5 bg-white shadow-xs hover:scale-105 transition-transform cursor-pointer mb-6 flex items-center justify-center overflow-hidden"
      >
        <div className="w-full h-full rounded-full bg-[#102a4e] flex items-center justify-center text-white font-extrabold text-xs shadow-inner">
          <GraduationCap className="w-5 h-5 text-[#38bdf8]" />
        </div>
      </button>

      {/* Vertical Navigation Icons */}
      <nav className="flex-1 flex flex-col items-center gap-3">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative group ${
                isActive
                  ? 'bg-[#102a4e] text-white shadow-md shadow-[#102a4e]/20'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-[#f1f5f9]'
              }`}
            >
              <Icon className="w-5 h-5" />

              {/* Tooltip on hover */}
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#102a4e] text-white text-[11px] font-semibold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Discreet Staff Access / More */}
      <div className="pt-4 flex flex-col items-center gap-2 border-t border-slate-100 w-full px-2">
        <button
          onClick={onOpenStaffModal}
          title="Staff Portal (Restricted)"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#102a4e] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
