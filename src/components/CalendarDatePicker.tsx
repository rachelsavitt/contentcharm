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
  const [rangeStart, setRangeStart] = useState<string | null>(null);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthName = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const toggleDate = (dateStr: string) => {
    // If clicking an already-selected day, just remove it (fine-tune)
    if (selectedDates.includes(dateStr)) {
      onDatesChange(selectedDates.filter(d => d !== dateStr));
      setRangeStart(null);
      return;
    }
    // No pending start yet: set this as the range start and select it
    if (!rangeStart) {
      setRangeStart(dateStr);
      onDatesChange([...selectedDates, dateStr].sort());
      return;
    }
    // We have a start: fill the range from start to this click (inclusive)
    const start = rangeStart < dateStr ? rangeStart : dateStr;
    const end = rangeStart < dateStr ? dateStr : rangeStart;
    const filled: string[] = [];
    const cur = new Date(start + 'T00:00:00');
    const last = new Date(end + 'T00:00:00');
    while (cur <= last) {
      filled.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }
    const merged = Array.from(new Set([...selectedDates, ...filled])).sort();
    onDatesChange(merged);
    setRangeStart(null);
  };

  const clearDates = () => {
    onDatesChange([]);
    setRangeStart(null);
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

      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-[#8C8479]">
          {rangeStart ? 'Now click the end date' : 'Tip: click a start date, then an end date'}
        </p>
        {selectedDates.length > 0 && (
          <button type="button" onClick={clearDates} className="text-[11px] font-medium" style={{ color: primaryColor }}>
            Clear ({selectedDates.length})
          </button>
        )}
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
