import React, { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  minMinutes?: number;
  maxMinutes?: number;
  value?: number | null;
  onChange?: (minutes: number) => void;
  onConfirm?: () => void;
  onBack?: () => void;
  earliestTime?: number;
  className?: string;
};

const STEP = 30;

// Meal period definitions matching Figma
const mealPeriods = [
  { label: "Dinner", start: 17 * 60, end: 22 * 60 + 30 },     // 5:00 PM -> 10:30 PM
  { label: "Lunch", start: 11 * 60, end: 16 * 60 + 30 },      // 11:00 AM -> 4:30 PM
  { label: "Breakfast", start: 6 * 60, end: 11 * 60 },        // 6:00 AM -> 11:00 AM
];

function formatTime(minutesFromMidnight: number) {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  return { time: `${h12}:${m.toString().padStart(2, "0")}`, meridiem };
}

function buildSlots(start: number, end: number) {
  const slots: number[] = [];
  for (let m = start; m <= end; m += STEP) {
    slots.push(m);
  }
  return slots;
}

export const TimeWindowSliderV16: React.FC<Props> = ({
  title = "Earliest available start time?",
  value,
  onChange,
  onConfirm,
  onBack,
  earliestTime,
  className = "",
}) => {
  const isLatestMode = earliestTime != null;
  const [selectedPeriod, setSelectedPeriod] = useState(0); // Default to Dinner

  // Generate slots based on mode
  const currentSlots = useMemo(() => {
    if (isLatestMode) {
      // For latest mode: show times after earliest selection
      return buildSlots(earliestTime + STEP, 23 * 60);
    }
    const period = mealPeriods[selectedPeriod];
    return buildSlots(period.start, period.end);
  }, [isLatestMode, earliestTime, selectedPeriod]);

  const handleTimeSelect = (minutes: number) => {
    onChange?.(minutes);
    onConfirm?.();
  };

  return (
    <div className={cn("flex flex-col gap-[13px] pt-[6px] px-[20px] pb-[20px]", className)}>
      {/* Header */}
      <div className="flex gap-[15px] items-center w-full">
        <button
          onClick={onBack}
          className="w-[40px] h-[40px] flex items-center justify-center rounded-full active:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <span className="text-[15px] font-bold text-[#d6d6d6] tracking-[0.25px]">
          {title}
        </span>
      </div>

      {/* Segmented Picker or Earliest Time Pill */}
      {isLatestMode ? (
        <div className="flex items-start w-full">
          <div className="bg-[#252525] h-[40px] px-4 rounded-[25px] flex items-center justify-center text-[13px] font-semibold text-white tracking-[-0.08px]">
            Earliest: {formatTime(earliestTime).time} {formatTime(earliestTime).meridiem}
          </div>
        </div>
      ) : (
        <div className="bg-[#252525] flex h-[40px] items-center p-[2px] rounded-[25px] w-full">
          {mealPeriods.map((period, index) => (
            <button
              key={period.label}
              onClick={() => setSelectedPeriod(index)}
              className={cn(
                "flex-1 h-[34px] rounded-[100px] text-[13px] font-medium text-white tracking-[-0.08px] transition-all",
                selectedPeriod === index
                  ? "bg-[#191919] border border-[#2a2a2a]"
                  : "active:bg-white/5"
              )}
            >
              {period.label}
            </button>
          ))}
        </div>
      )}

      {/* Time Grid */}
      {isLatestMode && currentSlots.length > 12 ? (
        /* Horizontal scroll for latest mode with many slots */
        <div className="overflow-x-auto no-scrollbar -mx-[20px] px-[20px]">
          <div
            className="grid grid-flow-col gap-[10px]"
            style={{ gridTemplateRows: 'repeat(4, 80px)', paddingRight: '20px' }}
          >
            {currentSlots.map((minutes) => {
              const { time, meridiem } = formatTime(minutes);
              const isSelected = value === minutes;

              return (
                <button
                  key={minutes}
                  onClick={() => handleTimeSelect(minutes)}
                  className={cn(
                    "flex items-center justify-center h-[80px] rounded-[7px] transition-all active:scale-[0.98]",
                    isSelected
                      ? "bg-[#FE3400]"
                      : "bg-[#252525] active:bg-[#303030]"
                  )}
                  style={{ width: 'calc((100vw - 60px) / 3)' }}
                >
                  <span className={cn(
                    "text-[15px] font-semibold tracking-[0.25px]",
                    isSelected ? "text-black" : "text-[#d5d5d5]"
                  )}>
                    {time} <span className={isSelected ? "text-black/70" : "text-[#d5d5d5]"}>{meridiem}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Standard grid for earliest mode */
        <div className="grid grid-cols-3 gap-[10px]">
          {currentSlots.map((minutes) => {
            const { time, meridiem } = formatTime(minutes);
            const isSelected = value === minutes;

            return (
              <button
                key={minutes}
                onClick={() => handleTimeSelect(minutes)}
                className={cn(
                  "flex items-center justify-center h-[80px] rounded-[7px] transition-all active:scale-[0.98]",
                  isSelected
                    ? "bg-[#FE3400]"
                    : "bg-[#252525] active:bg-[#303030]"
                )}
              >
                <span className={cn(
                  "text-[15px] font-semibold tracking-[0.25px]",
                  isSelected ? "text-black" : "text-[#d5d5d5]"
                )}>
                  {time} <span className={isSelected ? "text-black/70" : "text-[#d5d5d5]"}>{meridiem}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
