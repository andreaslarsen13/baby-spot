import React, { useRef, useState, useEffect, useMemo } from "react";

type Props = {
  title: string;
  minMinutes: number;
  maxMinutes: number;
  value: number;
  onChange: (minutes: number) => void;
  onConfirm: () => void;
  className?: string;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function formatTime(minutesFromMidnight: number) {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${meridiem}`;
}

/**
 * TimeWindowSlider v11
 *
 * Ruler-based time picker with:
 * - Fixed center handle (white circle with <·> icon)
 * - Scrollable ruler underneath
 * - Large time display
 * - Tick marks with hour labels
 */
export const TimeWindowSliderV11: React.FC<Props> = ({
  title,
  minMinutes,
  maxMinutes,
  value,
  onChange,
  onConfirm,
  className,
}) => {
  const rulerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startValue: number } | null>(null);

  // Viewport: how many minutes visible
  const VIEWPORT_MINUTES = 24 * 60; // Show full 24 hours
  const PIXELS_PER_MINUTE = 2; // Density of ruler

  // Handle drag - ruler moves, handle stays fixed
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    dragRef.current = { startX: clientX, startValue: value };
  };

  const handleDragMove = (clientX: number) => {
    if (!dragRef.current) return;
    const deltaX = dragRef.current.startX - clientX;
    const deltaMinutes = deltaX / PIXELS_PER_MINUTE;
    const newValue = Math.round(dragRef.current.startValue + deltaMinutes);
    onChange(clamp(newValue, minMinutes, maxMinutes));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  // Global pointer events
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      handleDragMove(e.clientX);
    };

    const handlePointerUp = () => {
      handleDragEnd();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging, value]);

  // Generate tick marks for visible range
  const ticks = useMemo(() => {
    const tickArray = [];
    const step = 15; // tick every 15 minutes
    const visibleStart = value - VIEWPORT_MINUTES / 2;
    const visibleEnd = value + VIEWPORT_MINUTES / 2;

    for (let m = Math.floor(visibleStart / step) * step; m <= visibleEnd; m += step) {
      if (m < minMinutes || m > maxMinutes) continue;
      const offsetFromCenter = m - value;
      const xPos = offsetFromCenter * PIXELS_PER_MINUTE;
      const isHour = m % 60 === 0;
      tickArray.push({ minutes: m, xPos, isHour });
    }
    return tickArray;
  }, [value, minMinutes, maxMinutes]);

  // Generate hour labels
  const hourLabels = useMemo(() => {
    const labels = [];
    const visibleStart = value - VIEWPORT_MINUTES / 2;
    const visibleEnd = value + VIEWPORT_MINUTES / 2;

    // Every 6 hours
    for (let m = Math.floor(visibleStart / 360) * 360; m <= visibleEnd; m += 360) {
      if (m < minMinutes || m > maxMinutes) continue;
      const hour = Math.floor(m / 60) % 24;
      const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const offsetFromCenter = m - value;
      const xPos = offsetFromCenter * PIXELS_PER_MINUTE;
      labels.push({ label: h12.toString(), xPos });
    }
    return labels;
  }, [value, minMinutes, maxMinutes]);

  return (
    <div className={`${className || ""}`}>
      {/* Title */}
      <div className="text-lg font-medium text-white mb-6">
        {title}
      </div>

      {/* Center line and handle */}
      <div className="relative h-24 flex items-center justify-center overflow-hidden">
        {/* Vertical center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-500 -translate-x-1/2 z-10" />

        {/* Fixed handle at center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg">
            <span className="text-zinc-700 text-base font-medium">&lt;·&gt;</span>
          </div>
        </div>
      </div>

      {/* Large time display */}
      <div className="text-4xl font-light text-zinc-400 mb-4 tracking-tight">
        {formatTime(value)}
      </div>

      {/* Scrollable ruler area */}
      <div
        ref={rulerRef}
        className="relative h-14 overflow-hidden cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={(e) => {
          e.preventDefault();
          handleDragStart(e.clientX);
        }}
      >
        {/* Tick marks - positioned relative to center */}
        <div className="absolute inset-0 flex items-start justify-center">
          <div className="relative h-full" style={{ width: "100%" }}>
            {ticks.map((tick, i) => (
              <div
                key={i}
                className="absolute bg-zinc-600"
                style={{
                  left: `calc(50% + ${tick.xPos}px)`,
                  top: 0,
                  width: "1px",
                  height: tick.isHour ? "14px" : "8px",
                }}
              />
            ))}
            {/* Center indicator */}
            <div
              className="absolute bg-white"
              style={{
                left: "50%",
                top: 0,
                width: "1px",
                height: "14px",
                transform: "translateX(-50%)",
              }}
            />
          </div>
        </div>

        {/* Hour labels */}
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <div className="relative h-full" style={{ width: "100%" }}>
            {hourLabels.map((label, i) => (
              <div
                key={i}
                className="absolute text-sm text-zinc-500 -translate-x-1/2"
                style={{ left: `calc(50% + ${label.xPos}px)` }}
              >
                {label.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        className="w-full mt-6 py-3.5 bg-white text-black font-semibold rounded-2xl active:bg-zinc-200 transition-colors"
      >
        Continue
      </button>
    </div>
  );
};

export default TimeWindowSliderV11;
