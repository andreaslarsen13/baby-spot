import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// BTN-01: Plus Button (Create New Booking)
// =============================================================================
export const PlusButton: React.FC<{
  onClick?: () => void;
  className?: string;
}> = ({ onClick, className }) => (
  <button
    onClick={onClick}
    className={cn(
      'w-[123px] h-[57px] bg-[#FE3400] rounded-[46px] flex items-center justify-center active:opacity-80 transition-opacity',
      className
    )}
  >
    <img src="/images/plus-icon.svg" alt="" className="w-6 h-6" aria-hidden="true" />
  </button>
);

// =============================================================================
// BTN-02: Continue Button
// =============================================================================
export const ContinueButton: React.FC<{
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}> = ({ onClick, className, children = 'Continue' }) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full h-14 bg-[#252525] border border-[#30302e] text-[#e3e3e3] rounded-[46px] font-medium text-[15px] tracking-[0.25px] active:bg-[#1a1a1a] transition-colors',
      className
    )}
  >
    {children}
  </button>
);

// =============================================================================
// BTN-03: Book Table Button (Primary CTA)
// =============================================================================
export const BookTableButton: React.FC<{
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}> = ({ onClick, className, children = 'Book Table' }) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full h-16 rounded-full bg-white text-black font-black text-xl active:bg-zinc-200 transition-all shadow-2xl',
      className
    )}
  >
    {children}
  </button>
);

// =============================================================================
// BTN-04: Calendar Toggle Button
// =============================================================================
export const CalendarToggleButton: React.FC<{
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}> = ({ onClick, isActive = false, className }) => (
  <button
    onClick={onClick}
    className={cn(
      'h-10 w-10 rounded-xl bg-[#252525] flex items-center justify-center transition-colors active:bg-zinc-700',
      isActive && 'ring-1 ring-zinc-500',
      className
    )}
  >
    <Calendar className="w-5 h-5 text-zinc-300" />
  </button>
);

// =============================================================================
// BTN-05 & BTN-06: Navigation Buttons
// =============================================================================
export const NavButton: React.FC<{
  direction: 'prev' | 'next';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}> = ({ direction, onClick, disabled = false, className, 'aria-label': ariaLabel }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={cn(
      'w-14 h-14 rounded-full bg-zinc-800/50 flex items-center justify-center transition-colors',
      disabled ? 'opacity-30' : 'active:bg-zinc-700',
      className
    )}
  >
    {direction === 'prev' ? (
      <ChevronLeft className="w-5 h-5 text-zinc-300" />
    ) : (
      <ChevronRight className="w-5 h-5 text-zinc-300" />
    )}
  </button>
);

// =============================================================================
// BTN-07: Back Button (Drawer Navigation)
// =============================================================================
export const BackButton: React.FC<{
  onClick?: () => void;
  className?: string;
}> = ({ onClick, className }) => (
  <button
    onClick={onClick}
    aria-label="Go back"
    className={cn(
      'w-10 h-10 rounded-xl bg-[#2a2a2a] flex items-center justify-center active:bg-zinc-700 transition-colors flex-shrink-0',
      className
    )}
  >
    <ChevronLeft className="w-5 h-5 text-zinc-300" />
  </button>
);

