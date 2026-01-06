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
      'rounded-[10px] h-[114px] px-[15px] py-[3px] flex flex-col items-center justify-center transition-colors',
      isPast && 'opacity-40 pointer-events-none',
      isSelected
        ? 'bg-white'
        : 'bg-[#252525] active:bg-[#303030]',
      className
    )}
  >
    <div
      className={cn(
        'text-[12px] font-bold tracking-[0.25px] text-center',
        isSelected ? 'text-black/60' : 'text-[#71717b]'
      )}
    >
      {isToday ? 'Today' : weekday}
    </div>
    <div className={cn(
      'text-[20px] font-bold mt-[10px]',
      isSelected ? 'text-black' : 'text-[#d5d5d5]'
    )}>
      {date}
    </div>
    <div
      className={cn(
        'mt-[10px] text-[12px] font-bold tracking-[0.25px]',
        isSelected ? 'text-black/50' : 'text-[#71717b]'
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
  isFlashing?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ count, isSelected = false, isFlashing = false, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn(
      'rounded-[7px] flex items-center justify-center px-5 py-7 transition-all duration-100',
      (isSelected || isFlashing)
        ? 'bg-[#FE3400] text-white'
        : 'bg-[#252525] text-[#d5d5d5]',
      className
    )}
  >
    <span className="text-[16px] font-semibold tracking-[0.25px]">{count}</span>
  </button>
);

