import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface SchoolCalendarCardProps {
  onSelectDate?: (date: number) => void;
  onAddEvent?: () => void;
}

export const SchoolCalendarCard: React.FC<SchoolCalendarCardProps> = ({
  onSelectDate,
  onAddEvent,
}) => {
  const [selectedDay, setSelectedDay] = useState(10);
  const [currentMonth, setCurrentMonth] = useState('November 2026');

  // Days with scheduled exams/events
  const eventDays: Record<number, string> = {
    1: 'Term 3 Candidate Assessment',
    25: 'UNEB Joint Mock Examination',
  };

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Calendar dates for November 2026 (Nov 1 is Sunday)
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
      {/* Top Header */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
          School Calendar
        </span>
        <div className="flex items-center justify-between pt-0.5">
          <h3 className="font-heading font-extrabold text-xl text-slate-900">
            {currentMonth}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-600">
            <button
              onClick={() => {}}
              className="p-1 hover:text-slate-900 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDay(10)}
              className="px-3 py-1 bg-[#f1f5f9] hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-full transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => {}}
              className="p-1 hover:text-slate-900 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {daysOfWeek.map((day) => (
          <span key={day} className="text-[10px] font-bold text-slate-400">
            {day}
          </span>
        ))}
      </div>

      {/* Calendar Grid of Rounded Cells */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day) => {
          const isSelected = selectedDay === day;
          const hasEvent = Boolean(eventDays[day]);

          return (
            <button
              key={day}
              onClick={() => {
                setSelectedDay(day);
                if (onSelectDate) onSelectDate(day);
              }}
              title={hasEvent ? eventDays[day] : `Day ${day}`}
              className={`h-11 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-white border-2 border-[#102a4e] text-slate-900 font-extrabold shadow-xs'
                  : 'bg-[#f4f7fc] hover:bg-[#e8edf7] text-slate-700 font-medium'
              }`}
            >
              <span className="text-xs leading-none">{day}</span>
              {hasEvent && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#102a4e] mt-1 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Event Banner if applicable */}
      {eventDays[selectedDay] && (
        <div className="p-3 rounded-2xl bg-[#f0f4fa] border border-[#d9e3f0] text-xs text-slate-800 flex items-center justify-between">
          <span className="font-semibold">{eventDays[selectedDay]}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#102a4e] border border-[#d9e3f0]">
            Uganda Syllabus
          </span>
        </div>
      )}

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          onClick={onAddEvent}
          className="flex items-center gap-1.5 bg-[#102a4e] hover:bg-[#0c203b] text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add event</span>
        </button>

        <span className="text-xs text-slate-500 font-medium">
          • 2 events this month
        </span>
      </div>
    </div>
  );
};
