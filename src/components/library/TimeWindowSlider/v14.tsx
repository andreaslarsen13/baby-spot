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

type PeriodKey = "breakfast" | "lunch" | "dinner";

const STEP = 30; // minutes
const SLOTS_PER_PAGE = 12;

const DINNER_START = 16 * 60 + 30; // 4:30 PM

const buildSlots = (startMinutes: number, endMinutes: number) => {
  const out: number[] = [];
  for (let m = startMinutes; m <= endMinutes; m += STEP) {
    out.push(m);
  }
  return out;
};

const periodConfigs: Record<PeriodKey, { label: string; slots: number[] }> = {
  breakfast: {
    label: "Breakfast",
    slots: buildSlots(7 * 60, 10 * 60 + 30), // 7:00 AM -> 10:30 AM
  },
  lunch: {
    label: "Lunch",
    slots: buildSlots(11 * 60, 16 * 60 + 30), // 11:00 AM -> 4:30 PM
  },
  dinner: {
    label: "Dinner",
    slots: buildSlots(17 * 60, 22 * 60 + 30), // 5:00 PM -> 10:30 PM
  },
};
const periodOrder: PeriodKey[] = ["breakfast", "lunch", "dinner"];

function formatTime(minutesFromMidnight: number) {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  return `${h12}:${m.toString().padStart(2, "0")} ${meridiem}`;
}

export const TimeWindowSliderV14: React.FC<Props> = ({
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
  // Detect mode: earliestTime defined = latest mode, otherwise earliest mode
  const isLatestMode = earliestTime !== undefined;

  // State for earliest mode (period tabs)
  const initialPeriod: PeriodKey =
    value == null
      ? "dinner"
      : value < 12 * 60
        ? "breakfast"
        : value < DINNER_START
          ? "lunch"
          : "dinner";
  const [period, setPeriod] = useState<PeriodKey>(initialPeriod);

  // State for latest mode (pagination)
  const [pageIndex, setPageIndex] = useState(0);

  // Generate slots for latest mode: all times from (earliestTime + 30) to maxMinutes
  const latestModeSlots = useMemo(() => {
    if (!isLatestMode) return [];
    const startFrom = earliestTime + STEP;
    const slots: number[] = [];
    for (let m = startFrom; m <= maxMinutes; m += STEP) {
      slots.push(m);
    }
    return slots;
  }, [isLatestMode, earliestTime, maxMinutes]);

  // Pagination for latest mode
  const totalPages = Math.ceil(latestModeSlots.length / SLOTS_PER_PAGE);
  const currentPageSlots = latestModeSlots.slice(
    pageIndex * SLOTS_PER_PAGE,
    (pageIndex + 1) * SLOTS_PER_PAGE
  );

  // Slots for earliest mode (period-based)
  const earliestModeSlots = periodConfigs[period]?.slots ?? periodConfigs.breakfast.slots;

  // Determine which slots to render
  const slotsToRender = isLatestMode ? currentPageSlots : earliestModeSlots.slice(0, 12);

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
        <span className="text-[15px] font-bold text-[#d6d6d6] tracking-[0.25px]">
          {title}
        </span>
      </div>

      {/* Earliest mode: Segmented control (Breakfast/Lunch/Dinner) */}
      {!isLatestMode && (
        <div className="w-full h-[32px] bg-[#1c1c1c] rounded-[25px] p-[2px] flex items-center gap-1">
          {periodOrder.map((key) => {
            const cfg = periodConfigs[key];
            const active = key === period;
            return (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={cn(
                  "flex-1 h-[28px] rounded-[20px] flex items-center justify-center text-[13px] text-white transition-colors",
                  active ? "bg-[#252525] font-semibold" : "font-medium opacity-80"
                )}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      )}


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

      {/* Latest mode: Pagination controls below grid */}
      {isLatestMode && totalPages > 1 && (
        <div className="w-full flex items-center justify-end gap-2">
          <button
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex === 0}
            className={cn(
              "w-10 h-10 rounded-xl bg-[#2a2a2a] flex items-center justify-center transition-colors",
              pageIndex === 0 ? "opacity-30" : "active:bg-zinc-700"
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-300" />
          </button>
          <button
            onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
            disabled={pageIndex === totalPages - 1}
            className={cn(
              "w-10 h-10 rounded-xl bg-[#2a2a2a] flex items-center justify-center transition-colors",
              pageIndex === totalPages - 1 ? "opacity-30" : "active:bg-zinc-700"
            )}
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5 text-zinc-300" />
          </button>
        </div>
      )}
    </div>
  );
};
