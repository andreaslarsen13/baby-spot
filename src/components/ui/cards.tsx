import React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// CRD-01 & CRD-02: Date Card (Week View)
// =============================================================================
export const DateCardWeek: React.FC<{
  weekday: string;
  date: number;
  month: string;
  isSelected?: boolean;
  isToday?: boolean;
  isPast?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ weekday, date, month, isSelected = false, isToday = false, isPast = false, onClick, className }) => (
  <button
    onClick={onClick}
    disabled={isPast}
    className={cn(
      'rounded-[20px] border px-2 py-6 flex flex-col items-center justify-center transition-colors relative',
      isPast && 'opacity-10 pointer-events-none',
      isSelected
        ? 'bg-white text-black border-white'
        : 'bg-[#272729] text-white border-zinc-800 active:bg-zinc-800',
      className
    )}
  >
    <div
      className={cn(
        'text-[12px] font-semibold tracking-wide',
        isSelected ? 'text-black/60' : isToday ? 'text-[#FE3400]/70' : 'text-zinc-500'
      )}
    >
      {isToday ? 'Today' : weekday}
    </div>
    <div className="relative mt-2">
      <div className="text-[26px] font-semibold leading-none">{date}</div>
    </div>
    <div
      className={cn(
        'mt-2.5 text-[12px] font-semibold',
        isSelected ? 'text-black/50' : 'text-zinc-600'
      )}
    >
      {month}
    </div>
  </button>
);

// =============================================================================
// CRD-03: Date Card (Month View)
// =============================================================================
export const DateCardMonth: React.FC<{
  date: number;
  isSelected?: boolean;
  isToday?: boolean;
  isPast?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ date, isSelected = false, isToday = false, isPast = false, onClick, className }) => (
  <button
    onClick={onClick}
    disabled={isPast}
    className={cn(
      'aspect-square rounded-[18px] border flex items-center justify-center text-[14px] font-semibold transition-colors',
      isPast && 'opacity-10 pointer-events-none',
      isSelected
        ? 'bg-white text-black border-white'
        : 'bg-zinc-900/60 text-white border-zinc-800 active:bg-zinc-800',
      className
    )}
  >
    <span className={isToday && !isSelected ? 'text-[#FE3400]/80' : ''}>{date}</span>
  </button>
);

// =============================================================================
// CRD-04 & CRD-05: Party Size Card
// =============================================================================
export const PartySizeCard: React.FC<{
  count: number | string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ count, isSelected = false, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn(
      'rounded-[7px] flex items-center justify-center px-5 py-7 transition-colors',
      isSelected
        ? 'bg-white text-black'
        : 'bg-[#252525] text-[#d5d5d5] active:bg-[#1a1a1a]',
      className
    )}
  >
    <span className="text-[16px] font-semibold tracking-[0.25px]">{count}</span>
  </button>
);

