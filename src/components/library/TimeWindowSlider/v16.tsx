import React, { useMemo, useState } from "react";
import { ChevronLeft, Moon, Sun, Sunrise } from "lucide-react";
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
  { label: "Dinner", start: 17 * 60, end: 22 * 60 + 30, icon: Moon },     // 5:00 PM -> 10:30 PM
  { label: "Lunch", start: 11 * 60, end: 16 * 60 + 30, icon: Sun },       // 11:00 AM -> 4:30 PM
  { label: "Breakfast", start: 6 * 60, end: 11 * 60, icon: Sunrise },     // 6:00 AM -> 11:00 AM
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
  const [flashingTime, setFlashingTime] = useState<number | null>(null);

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
    setFlashingTime(minutes);
    onChange?.(minutes);
    setTimeout(() => {
      onConfirm?.();
    }, 200);
  };

  return (
    <div className={cn("flex flex-col pt-[6px] px-[20px]", className)}>
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


      {/* Time Grid */}
      <div className="grid grid-cols-3 gap-[10px] mt-[14px]">
        {currentSlots.map((minutes) => {
          const { time, meridiem } = formatTime(minutes);
          const isSelected = value === minutes;
          const isActive = flashingTime === minutes || isSelected;

          return (
            <button
              key={minutes}
              onClick={() => handleTimeSelect(minutes)}
              className={cn(
                "flex items-center justify-center h-[80px] rounded-[7px] transition-all duration-100",
                isActive
                  ? "bg-[#FE3400]"
                  : "bg-[#252525]"
              )}
            >
              <span className={cn(
                "text-[15px] font-semibold tracking-[0.25px] transition-colors duration-100",
                isActive ? "text-white" : "text-[#d5d5d5]"
              )}>
                {time} <span className={cn(
                  "transition-colors duration-100",
                  isActive ? "text-white/70" : "text-[#d5d5d5]"
                )}>{meridiem}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Drawer Picker - only in earliest mode */}
      {!isLatestMode && (
        <div className="mt-[20px] -mx-[20px] bg-[#1F1F1F] px-[20px] pt-[12px] pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-center">
            {mealPeriods.map((period, index) => {
              const isActive = selectedPeriod === index;
              return (
                <button
                  key={period.label}
                  onClick={() => handlePeriodChange(index)}
                  className="flex-1 h-[40px] flex items-center justify-center transition-colors duration-200"
                >
                  <span className={cn(
                    "text-[14px] font-medium transition-colors duration-200",
                    isActive ? "text-white" : "text-zinc-600"
                  )}>
                    {period.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Drawer Info - only in latest mode */}
      {isLatestMode && (
        <div className="mt-[20px] -mx-[20px] bg-[#1F1F1F] px-[20px] pt-[12px] pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-center h-[40px] gap-[16px]">
            <span className="text-[14px] font-medium text-zinc-500">
              Earliest: {formatTime(earliestTime).time} {formatTime(earliestTime).meridiem}
            </span>
            <span className="text-[14px] font-medium text-white">
              {mealPeriods[mealPeriodIndex ?? 0].label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
