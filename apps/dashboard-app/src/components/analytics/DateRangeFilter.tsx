import { useRef } from 'react';
import { format, subDays, startOfMonth, subMonths } from 'date-fns';
import { CalendarDays } from 'lucide-react';

export interface DateParams {
  startDate: string;
  endDate:   string;
}

interface Props {
  startDate:     string;
  endDate:       string;
  activePreset:  string;
  onPreset:      (label: string, start: string, end: string) => void;
  onStartChange: (val: string) => void;
  onEndChange:   (val: string) => void;
  onApply:       () => void;
}

const fmt     = (d: Date) => format(d, 'yyyy-MM-dd');
const display = (d: Date) => format(d, 'dd MMM yy');

const PRESETS = [
  { label: 'Today',       start: () => new Date(),               end: () => new Date() },
  { label: 'Yesterday',   start: () => subDays(new Date(), 1),   end: () => subDays(new Date(), 1) },
  { label: 'Last 7 Days', start: () => subDays(new Date(), 6),   end: () => new Date() },
  { label: 'Last 30 Days',start: () => subDays(new Date(), 29),  end: () => new Date() },
  { label: 'This Month',  start: () => startOfMonth(new Date()), end: () => new Date() },
  { label: 'Last 3 Mo',   start: () => subMonths(new Date(), 3), end: () => new Date() },
];

export const DateRangeFilter = ({
  startDate, endDate, activePreset,
  onPreset, onStartChange, onEndChange, onApply,
}: Props) => {
  const today    = fmt(new Date());
  const startRef = useRef<HTMLInputElement>(null);
  const endRef   = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full bg-[#111827]/90 border border-gray-700/50
                    rounded-2xl px-5 py-3.5 backdrop-blur-sm shadow-xl">
      <div className="flex flex-wrap items-center gap-2">

        
        <div className="flex items-center gap-2 pr-2 border-r border-gray-700">
          <CalendarDays className="w-4 h-4 text-orange-400" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Period
          </span>
        </div>


        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => onPreset(p.label, fmt(p.start()), fmt(p.end()))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold
                        transition-all duration-150 border
              ${activePreset === p.label
                ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'bg-transparent border-gray-700/80 text-gray-400 hover:border-gray-500 hover:text-gray-200'
              }`}
          >
            {p.label}
          </button>
        ))}

        
        <div className="w-px h-6 bg-gray-700 mx-1" />

        
        <div
          onClick={() => startRef.current?.showPicker?.()}
          className="relative flex items-center gap-2 bg-gray-800/80
                     border border-gray-700 hover:border-orange-500/60
                     rounded-lg px-3 py-1.5 cursor-pointer
                     transition-all duration-150 group"
        >
          <CalendarDays className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-400 transition" />
          <span className="text-xs text-gray-300 font-medium whitespace-nowrap">
            {startDate ? display(new Date(startDate + 'T00:00:00')) : 'Start'}
          </span>
          <input
            ref={startRef}
            type="date"
            value={startDate}
            max={endDate || today}
            onChange={(e) => onStartChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full cursor-pointer"
          />
        </div>

        <span className="text-gray-600 text-xs font-bold">→</span>

        
        <div
          onClick={() => endRef.current?.showPicker?.()}
          className="relative flex items-center gap-2 bg-gray-800/80
                     border border-gray-700 hover:border-orange-500/60
                     rounded-lg px-3 py-1.5 cursor-pointer
                     transition-all duration-150 group"
        >
          <CalendarDays className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-400 transition" />
          <span className="text-xs text-gray-300 font-medium whitespace-nowrap">
            {endDate ? display(new Date(endDate + 'T00:00:00')) : 'End'}
          </span>
          <input
            ref={endRef}
            type="date"
            value={endDate}
            min={startDate}
            max={today}
            onChange={(e) => onEndChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full cursor-pointer"
          />
        </div>

        
        <button
          onClick={onApply}
          className="px-4 py-1.5 rounded-lg text-xs font-bold
                     bg-orange-500 hover:bg-orange-600 text-white
                     shadow-md shadow-orange-500/20
                     transition-all duration-150 active:scale-95"
        >
          Apply
        </button>

        
        <span className="text-[11px] text-gray-600 ml-auto whitespace-nowrap hidden lg:block">
          Showing:&nbsp;
          <span className="text-gray-400 font-semibold">
            {startDate && display(new Date(startDate + 'T00:00:00'))}
          </span>
          &nbsp;—&nbsp;
          <span className="text-gray-400 font-semibold">
            {endDate && display(new Date(endDate + 'T00:00:00'))}
          </span>
        </span>

      </div>
    </div>
  );
};