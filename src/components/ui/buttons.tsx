import React from 'react';
import { Plus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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
      'w-48 h-16 bg-gradient-to-b from-[#313131] to-[rgba(49,49,49,0.5)] rounded-[46px] flex items-center justify-center shadow-lg active:opacity-80 transition-opacity',
      className
    )}
  >
    <Plus className="w-6 h-6 text-white" />
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
      'h-10 w-10 rounded-full border border-zinc-800 flex items-center justify-center transition-colors',
      isActive ? 'bg-white text-black' : 'bg-zinc-900/60 text-zinc-200 active:bg-zinc-800',
      className
    )}
  >
    <Calendar className="w-5 h-5" />
  </button>
);

// =============================================================================
// BTN-05 & BTN-06: Navigation Buttons
// =============================================================================
export const NavButton: React.FC<{
  direction: 'prev' | 'next';
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}> = ({ direction, onClick, className, 'aria-label': ariaLabel }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={cn(
      'flex-1 h-14 rounded-full bg-[#242427] border border-zinc-800 flex items-center justify-center active:bg-zinc-800 transition-colors',
      className
    )}
  >
    {direction === 'prev' ? (
      <ChevronLeft className="w-6 h-6 text-zinc-200" />
    ) : (
      <ChevronRight className="w-6 h-6 text-zinc-200" />
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
      'w-12 h-12 rounded-xl bg-[#2a2a2a] flex items-center justify-center active:bg-zinc-700 transition-colors flex-shrink-0',
      className
    )}
  >
    <ChevronLeft className="w-5 h-5 text-zinc-300" />
  </button>
);

