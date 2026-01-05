import React, { useRef, useMemo, useEffect, useCallback, useState } from "react";
import { ChevronLeft } from "lucide-react";

type Props = {
  title: string;
  minMinutes: number;
  maxMinutes: number;
  value: number;
  onChange: (minutes: number) => void;
  onConfirm: () => void;
  onBack?: () => void;
  earliestTime?: number; // For showing the red "earliest" time above when selecting latest
  className?: string;
};

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 3;
const STEP_MINUTES = 30;

function formatTimeParts(minutesFromMidnight: number): {
  time: string;
  meridiem: string;
} {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  return {
    time: `${h12}:${m.toString().padStart(2, "0")}`,
    meridiem,
  };
}

function formatTimeSimple(minutesFromMidnight: number): string {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  return `${h12}:${m.toString().padStart(2, "0")} ${meridiem}`;
}

export const TimeWindowSliderV13: React.FC<Props> = ({
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate time slots at 30-minute intervals
  const timeSlots = useMemo(() => {
    const slots: number[] = [];
    const start = Math.ceil(minMinutes / STEP_MINUTES) * STEP_MINUTES;
    for (let mins = start; mins <= maxMinutes; mins += STEP_MINUTES) {
      slots.push(mins);
    }
    return slots;
  }, [minMinutes, maxMinutes]);

  // Find index of current value
  const selectedIndex = useMemo(() => {
    const idx = timeSlots.findIndex((t) => t === value);
    return idx >= 0 ? idx : 0;
  }, [timeSlots, value]);

  // Initialize current index from value
  useEffect(() => {
    setCurrentIndex(selectedIndex);
  }, [selectedIndex]);

  // Scroll to selected value on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const timer = setTimeout(() => {
      el.scrollTop = selectedIndex * ITEM_HEIGHT;
    }, 50);

    return () => clearTimeout(timer);
  }, []); // Only on mount

  // Handle scroll to update visual selection in real-time
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, timeSlots.length - 1));

    setCurrentIndex(clampedIndex);
  }, [timeSlots.length]);

  // Handle scroll end - snap and update value
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScrollEnd = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, timeSlots.length - 1));

    // Snap to nearest item
    el.scrollTo({
      top: clampedIndex * ITEM_HEIGHT,
      behavior: "smooth",
    });

    // Update value
    if (timeSlots[clampedIndex] !== value) {
      onChange(timeSlots[clampedIndex]);
    }
  }, [timeSlots, value, onChange]);

  const onScroll = useCallback(() => {
    handleScroll();

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(handleScrollEnd, 150);
  }, [handleScroll, handleScrollEnd]);

  const visibleItems = VISIBLE_ITEMS;
  // Inline styles for hiding scrollbar cross-browser
  const scrollContainerStyle: React.CSSProperties = {
    height: ITEM_HEIGHT * visibleItems,
    overflowY: "auto",
    scrollSnapType: "y mandatory",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  };
  // Position the highlight pill at the center line
  const highlightTop = ITEM_HEIGHT;

  return (
    <div className={`bg-[#191919] flex flex-col h-full items-center pt-[20px] px-[20px] pb-[20px] ${className}`}>
      {/* Title row - full width, left aligned */}
      <div className="w-full mb-[29px]">
        <div className="h-[40px] flex items-center gap-[15px]">
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
      </div>

      {/* Time picker - centered between header and confirm */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative w-[311px]">
          {/* Fixed center highlight pill */}
          <div
            className="absolute left-0 right-0 bg-[#252525] rounded-full pointer-events-none z-0"
            style={{
              top: highlightTop,
              height: ITEM_HEIGHT,
            }}
          />

          {/* Scrollable list */}
          <div
            ref={scrollRef}
            className="relative z-10 [&::-webkit-scrollbar]:hidden"
            style={scrollContainerStyle}
            onScroll={onScroll}
          >
          {/* Top row: show earliest time when provided; otherwise spacer */}
          {earliestTime !== undefined ? (
            <div
              className="snap-center flex items-center justify-center"
              style={{ height: ITEM_HEIGHT }}
            >
              <span className="font-semibold text-[16px] text-[#898989] tracking-[0.25px] opacity-70">
                {formatTimeSimple(earliestTime)} (earliest)
              </span>
            </div>
          ) : (
            <div
              className="snap-center flex items-center justify-center"
              style={{ height: ITEM_HEIGHT }}
            />
          )}

          {timeSlots.map((mins, idx) => {
            const isSelected = idx === currentIndex;
            const { time, meridiem } = formatTimeParts(mins);

            return (
              <div
                key={mins}
                className="snap-center flex items-center justify-center"
                style={{ height: ITEM_HEIGHT }}
              >
                <span
                  className={`font-semibold text-[#d5d5d5] tracking-[0.25px] transition-all duration-100 ${
                    isSelected ? "text-[20px]" : "text-[16px] opacity-50"
                  }`}
                >
                  {time}
                </span>
                <span className="w-[6px]" />
                <span
                  className={`font-semibold text-[#898989] text-[16px] tracking-[0.25px] transition-opacity duration-100 ${
                    isSelected ? "" : "opacity-50"
                  }`}
                >
                  {meridiem}
                </span>
              </div>
            );
          })}

          {/* Bottom padding */}
          <div style={{ height: ITEM_HEIGHT }} className="snap-center" />
          </div>
        </div>
      </div>

      {/* Confirm button - 323px */}
      <button
        onClick={onConfirm}
        className="w-[323px] h-[54px] bg-[#252525] border border-[#30302e] rounded-[46px] flex items-center justify-center px-[20px] py-[14px] flex-shrink-0 mt-[29px]"
      >
        <span className="font-medium text-white text-[15px] tracking-[0.25px]">
          Confirm
        </span>
      </button>
    </div>
  );
};
