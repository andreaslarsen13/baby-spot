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
  mealPeriodIndex?: number; // Lock latest times to this meal period
  onMealPeriodChange?: (index: number) => void; // Callback when meal period changes
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
  mealPeriodIndex,
  onMealPeriodChange,
  className = "",
}) => {
  const isLatestMode = earliestTime != null;
  const [selectedPeriod, setSelectedPeriod] = useState(0); // Default to Dinner

  const handlePeriodChange = (index: number) => {
    setSelectedPeriod(index);
    onMealPeriodChange?.(index);
  };
  // Generate slots based on mode
  const currentSlots = useMemo(() => {
    if (isLatestMode) {
      // For latest mode: show times after earliest selection, locked to meal period
      const period = mealPeriods[mealPeriodIndex ?? 0];
      return buildSlots(earliestTime + STEP, period.end);
    }
    const period = mealPeriods[selectedPeriod];
    return buildSlots(period.start, period.end);
  }, [isLatestMode, earliestTime, selectedPeriod, mealPeriodIndex]);

  const handleTimeSelect = (minutes: number) => {
    onChange?.(minutes);
    onConfirm?.();
  };

  return (
    <div className={cn("flex flex-col gap-[10px] pt-[6px] px-[20px] pb-[20px]", className)}>
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
        <div className="inline-flex items-center bg-[#1c1c1c] rounded-[10px] p-[3px] self-start">
          <div className="h-[32px] px-4 rounded-[8px] bg-[#2c2c2c] flex items-center justify-center text-[13px] font-medium text-white tracking-[-0.08px] shadow-sm">
            {mealPeriods[mealPeriodIndex ?? 0].label}: {formatTime(earliestTime).time} {formatTime(earliestTime).meridiem}
          </div>
        </div>
      ) : (
        <div className="inline-flex items-center bg-[#1c1c1c] rounded-[10px] p-[3px] self-start">
          {mealPeriods.map((period, index) => (
            <button
              key={period.label}
              onClick={() => handlePeriodChange(index)}
              className={cn(
                "h-[32px] px-4 rounded-[8px] text-[13px] font-medium tracking-[-0.08px] transition-all",
                selectedPeriod === index
                  ? "bg-[#2c2c2c] text-white shadow-sm"
                  : "text-zinc-500 active:text-zinc-300"
              )}
            >
              {period.label}
            </button>
          ))}
        </div>
      )}

      {/* Time Grid */}
      <div className="grid grid-cols-3 gap-[10px] mt-[4px]">
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
    </div>
  );
};
