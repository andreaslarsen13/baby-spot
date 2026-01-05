import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  minMinutes: number;
  maxMinutes: number;
  value: number | null;
  onChange: (minutes: number) => void;
  onConfirm: () => void;
  onBack?: () => void;
  earliestTime?: number;
  className?: string;
};

const STEP = 30;
const SLOTS_PER_PAGE = 12;

const buildSlots = (startMinutes: number, endMinutes: number) => {
  const out: number[] = [];
  for (let m = startMinutes; m <= endMinutes; m += STEP) {
    out.push(m);
  }
  return out;
};

// All periods as pages
const pages = [
  buildSlots(7 * 60, 10 * 60 + 30),   // Breakfast: 7:00 AM -> 10:30 AM
  buildSlots(11 * 60, 16 * 60 + 30),  // Lunch: 11:00 AM -> 4:30 PM
  buildSlots(17 * 60, 22 * 60 + 30),  // Dinner: 5:00 PM -> 10:30 PM
];

function formatTime(minutesFromMidnight: number) {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  return `${h12}:${m.toString().padStart(2, "0")} ${meridiem}`;
}

export const TimeWindowSliderV15: React.FC<Props> = ({
  title,
  minMinutes,
  maxMinutes,
  value,
  onChange,
  onConfirm,
  onBack,
  earliestTime,
  className = "",
}) => {
  const isLatestMode = earliestTime != null;

  // Determine initial page based on current value
  const getInitialPage = () => {
    // In latest mode, always start at page 0 (first available slots after earliest)
    if (earliestTime != null) return 0;
    if (value == null) return 2; // Default to dinner (page 2)
    if (value < 12 * 60) return 0; // Breakfast
    if (value < 17 * 60) return 1; // Lunch
    return 2; // Dinner
  };

  const [pageIndex, setPageIndex] = useState(getInitialPage);

  // For latest mode: generate slots from earliestTime + 30 onwards
  const latestModePages = useMemo(() => {
    if (!isLatestMode) return [];
    const startFrom = earliestTime + STEP;
    const allSlots: number[] = [];
    for (let m = startFrom; m <= maxMinutes; m += STEP) {
      allSlots.push(m);
    }
    // Chunk into pages of 12
    const chunked: number[][] = [];
    for (let i = 0; i < allSlots.length; i += SLOTS_PER_PAGE) {
      chunked.push(allSlots.slice(i, i + SLOTS_PER_PAGE));
    }
    return chunked;
  }, [isLatestMode, earliestTime, maxMinutes]);

  const currentPages = isLatestMode ? latestModePages : pages;
  const totalPages = currentPages.length;
  const slotsToRender = currentPages[pageIndex]?.slice(0, 12) ?? [];

  const canGoBack = pageIndex > 0;
  const canGoForward = pageIndex < totalPages - 1;

  return (
    <div
      className={cn(
        "bg-[#191919] flex flex-col h-full items-center pt-[20px] px-[20px] pb-[20px] gap-[15px]",
        className
      )}
    >
      {/* Header */}
      <div className="w-full flex items-center gap-[15px]">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="w-10 h-10 rounded-xl bg-[#2a2a2a] flex items-center justify-center active:bg-zinc-700 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-300" />
          </button>
        )}
        <span className="text-[16px] font-bold text-[#d6d6d6] tracking-[0.25px]">
          {title}
        </span>
      </div>

      {/* Grid of times */}
      <div className="grid grid-cols-3 grid-rows-4 gap-[10px] w-full">
        {slotsToRender.map((m) => {
          const isSelected = value !== null && m === value;
          return (
            <button
              key={m}
              onClick={() => {
                onChange(m);
                onConfirm();
              }}
              className={cn(
                "h-[76px] rounded-[7px] bg-[#252525] px-[20px] py-[7px] flex items-center justify-center text-center text-[15px] font-semibold tracking-[0.25px] text-[#d5d5d5] whitespace-nowrap",
                isSelected && "ring-2 ring-[#6b6b6b] ring-offset-0 text-white"
              )}
            >
              {formatTime(m)}
            </button>
          );
        })}
      </div>

      {/* Pagination arrows */}
      {totalPages >= 1 && (
        <div className="w-full flex items-stretch gap-[10px]">
          <button
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={!canGoBack}
            className={cn(
              "flex-1 h-[57px] rounded-2xl bg-white/[0.08] flex items-center justify-center transition-all",
              !canGoBack ? "opacity-40" : "active:bg-white/[0.15] active:scale-[0.98]"
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          <button
            onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
            disabled={!canGoForward}
            className={cn(
              "flex-1 h-[57px] rounded-2xl bg-white/[0.08] flex items-center justify-center transition-all",
              !canGoForward ? "opacity-40" : "active:bg-white/[0.15] active:scale-[0.98]"
            )}
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5 text-white/70" />
          </button>
        </div>
      )}
    </div>
  );
};
