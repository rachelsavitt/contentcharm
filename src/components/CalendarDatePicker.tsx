import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarDatePickerProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  primaryColor: string;
}

export function CalendarDatePicker({ selectedDates, onDatesChange, primaryColor }: CalendarDatePickerProps) {
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthName = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const toggleDate = (dateStr: string) => {
    if (selectedDates.includes(dateStr)) {
      onDatesChange(selectedDates.filter(d => d !== dateStr));
    } else {
      onDatesChange([...selectedDates, dateStr].sort());
    }
  };

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="border border-[#E8E3DC] rounded-xl p-4 w-full max-w-[420px]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-[#FAF8F4] rounded-lg transition">
          <ChevronLeft className="w-4 h-4 text-[#8C8479]" />
        </button>
        <p className="text-sm font-semibold text-[#1A1612]">{monthName}</p>
        <button onClick={nextMonth} className="p-1 hover:bg-[#FAF8F4] rounded-lg transition">
          <ChevronRight className="w-4 h-4 text-[#8C8479]" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs text-[#8C8479] font-medium py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDates.includes(dateStr);
          const isToday = dateStr === today;

          return (
            <button
              key={day}
              onClick={() => toggleDate(dateStr)}
              className="h-10 flex items-center justify-center rounded-lg text-sm transition"
              style={{
                backgroundColor: isSelected ? primaryColor : isToday ? primaryColor + '15' : 'transparent',
                color: isSelected ? 'white' : isToday ? primaryColor : '#1A1612',
                fontWeight: isSelected || isToday ? 600 : 400,
                border: isToday && !isSelected ? `1px solid ${primaryColor}40` : 'none',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-[#E8E3DC] flex items-center justify-between">
        <p className="text-xs text-[#8C8479]">{selectedDates.length} dates selected</p>
        <button onClick={() => onDatesChange([])} className="text-xs text-[#8C8479] hover:text-[#1A1612] transition">
          Clear all
        </button>
      </div>
    </div>
  );
}
