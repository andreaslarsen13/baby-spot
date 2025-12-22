import React, { useEffect, useMemo, useRef, useState } from "react";

type DragMode = "start" | "end" | "move" | null;

type Props = {
  minMinutes: number; // inclusive
  maxMinutes: number; // inclusive
  startMinutes: number; // earliest start
  endMinutes: number; // latest start
  onChange: (next: { startMinutes: number; endMinutes: number }) => void;
  stepMinutes?: number; // snapping
  minWindowMinutes?: number;
  className?: string;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function roundToStep(n: number, step: number) {
  return Math.round(n / step) * step;
}

function formatTime(minutesFromMidnight: number) {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  return `${h12}:${m.toString().padStart(2, "0")} ${meridiem}`;
}

export const TimeWindowSlider: React.FC<Props> = ({
  minMinutes,
  maxMinutes,
  startMinutes,
  endMinutes,
  onChange,
  stepMinutes = 15,
  minWindowMinutes = 30,
  className,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<DragMode>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMinMinutes, setViewMinMinutes] = useState(() => {
    // Dinner-first viewport: 4:00–10:00 PM (centered on 6-8 PM)
    return clamp(16 * 60, minMinutes, maxMinutes);
  });
  const [viewMaxMinutes, setViewMaxMinutes] = useState(() => {
    return clamp(22 * 60, minMinutes, maxMinutes);
  });
  const dragRef = useRef<{
    mode: DragMode;
    start0: number;
    end0: number;
    x0: number; // px within track
    widthPx: number;
  } | null>(null);
  const animationRef = useRef<number | null>(null);

  const min = minMinutes;
  const max = maxMinutes;
  const start = clamp(startMinutes, min, max);
  const end = clamp(endMinutes, min, max);

  const viewMin = clamp(viewMinMinutes, min, max);
  const viewMax = clamp(viewMaxMinutes, min, max);
  const viewSpan = Math.max(stepMinutes, viewMax - viewMin);

  const toPct = (m: number) => ((m - viewMin) / viewSpan) * 100;

  const { startPct, endPct } = useMemo(() => {
    return { startPct: toPct(start), endPct: toPct(end) };
  }, [start, end, viewMin, viewMax, viewSpan]);

  const getTrack = () => {
    if (!trackRef.current) return null;
    const rect = trackRef.current.getBoundingClientRect();
    return { left: rect.left, width: rect.width };
  };

  const pxToMinutesDelta = (deltaPx: number, widthPx: number) => {
    if (widthPx <= 0) return 0;
    const delta = (deltaPx / widthPx) * viewSpan;
    return roundToStep(delta, stepMinutes);
  };

  const chooseModeAtX = (xPx: number, widthPx: number): DragMode => {
    const pillLeftPx = (startPct / 100) * widthPx;
    const pillRightPx = (endPct / 100) * widthPx;
    const inside = xPx >= pillLeftPx && xPx <= pillRightPx;

    const edgeHitPx = 26; // generous thumb zone
    if (inside) {
      if (xPx - pillLeftPx <= edgeHitPx) return "start";
      if (pillRightPx - xPx <= edgeHitPx) return "end";
      return "move";
    }

    // outside: adjust nearest edge
    return Math.abs(xPx - pillLeftPx) <= Math.abs(xPx - pillRightPx) ? "start" : "end";
  };

  const applyDrag = (clientX: number) => {
    const t = getTrack();
    if (!t || !dragRef.current) return;
    const x = clientX - t.left; // allow overscroll to trigger auto-expand
    const deltaPx = x - dragRef.current.x0;
    const deltaMin = pxToMinutesDelta(deltaPx, dragRef.current.widthPx);

    const { mode, start0, end0 } = dragRef.current;
    if (!mode) return;

    if (mode === "move") {
      const widthMin = end0 - start0;
      let nextStart = start0 + deltaMin;
      let nextEnd = end0 + deltaMin;
      if (nextStart < min) {
        nextStart = min;
        nextEnd = min + widthMin;
      }
      if (nextEnd > max) {
        nextEnd = max;
        nextStart = max - widthMin;
      }
      if (nextStart < viewMin) setViewMinMinutes(nextStart);
      if (nextEnd > viewMax) setViewMaxMinutes(nextEnd);
      onChange({ startMinutes: nextStart, endMinutes: nextEnd });
      return;
    }

    if (mode === "start") {
      let nextStart = start0 + deltaMin;
      nextStart = clamp(nextStart, min, end0 - minWindowMinutes);
      if (nextStart < viewMin) setViewMinMinutes(nextStart);
      onChange({ startMinutes: nextStart, endMinutes: end0 });
      return;
    }

    if (mode === "end") {
      let nextEnd = end0 + deltaMin;
      nextEnd = clamp(nextEnd, start0 + minWindowMinutes, max);
      if (nextEnd > viewMax) setViewMaxMinutes(nextEnd);
      onChange({ startMinutes: start0, endMinutes: nextEnd });
    }
  };

  const handleMealToggle = (meal: "Breakfast" | "Lunch" | "Dinner") => {
    const presets = {
      Breakfast: { start: 9 * 60, end: 11 * 60, viewStart: 7 * 60, viewEnd: 13 * 60 },
      Lunch: { start: 12 * 60, end: 14 * 60, viewStart: 10 * 60, viewEnd: 16 * 60 },
      Dinner: { start: 18 * 60, end: 20 * 60, viewStart: 16 * 60, viewEnd: 22 * 60 },
    };
    const preset = presets[meal];
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Animate the scroll - animate both viewport AND time values together
    const startViewMin = viewMinMinutes;
    const startViewMax = viewMaxMinutes;
    const startTimeStart = start;
    const startTimeEnd = end;
    const animStartTime = performance.now();
    const duration = 500; // ms
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - animStartTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const newViewMin = startViewMin + (preset.viewStart - startViewMin) * eased;
      const newViewMax = startViewMax + (preset.viewEnd - startViewMax) * eased;
      const newTimeStart = Math.round((startTimeStart + (preset.start - startTimeStart) * eased) / stepMinutes) * stepMinutes;
      const newTimeEnd = Math.round((startTimeEnd + (preset.end - startTimeEnd) * eased) / stepMinutes) * stepMinutes;
      
      setViewMinMinutes(newViewMin);
      setViewMaxMinutes(newViewMax);
      onChange({ startMinutes: newTimeStart, endMinutes: newTimeEnd });
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const currentMeal =
    start >= 17 * 60 && end <= 22 * 60
      ? "Dinner"
      : start >= 12 * 60 && end <= 17 * 60
        ? "Lunch"
        : "Breakfast";

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Generate hour markers for the ruler
  const hourMarkers = useMemo(() => {
    const markers = [];
    const hourFloor = Math.floor(viewMin / 60) * 60;
    const hourCeil = Math.ceil(viewMax / 60) * 60;
    
    for (let h = hourFloor; h <= hourCeil; h += 60) {
      if (h < viewMin || h > viewMax) continue;
      const pct = toPct(h);
      const h24 = Math.floor(h / 60);
      const displayHour = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
      const meridiem = h24 >= 12 ? "PM" : "AM";
      markers.push({ h, pct, displayHour, meridiem });
    }
    return markers;
  }, [viewMin, viewMax, viewSpan]);

  return (
    <div className={className}>
      {/* Meal Toggle Buttons */}
      <div className="flex gap-1 mb-8 p-1 bg-zinc-900/40 rounded-full border border-zinc-800/50 w-fit mx-auto">
        {(["Breakfast", "Lunch", "Dinner"] as const).map((meal) => (
          <button
            key={meal}
            onClick={() => handleMealToggle(meal)}
            className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
              currentMeal === meal
                ? "bg-white text-black"
                : "text-zinc-500"
            }`}
          >
            {meal}
          </button>
        ))}
      </div>

      <div className="mt-6 relative">
        <div
          ref={trackRef}
          className="relative w-full h-48 touch-none select-none bg-zinc-900/20 rounded-xl border border-zinc-800/30"
          onPointerDown={(e) => {
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
            const t = getTrack();
            if (!t) return;
            const x = clamp(e.clientX - t.left, 0, t.width);
            const mode = chooseModeAtX(x, t.width);
            setActive(mode);
            setIsDragging(true);
            dragRef.current = { mode, start0: start, end0: end, x0: x, widthPx: t.width };
            applyDrag(e.clientX);
          }}
          onPointerMove={(e) => {
            if (!active) return;
            applyDrag(e.clientX);
          }}
          onPointerUp={() => {
            setActive(null);
            setIsDragging(false);
            dragRef.current = null;
          }}
          onPointerCancel={() => {
            setActive(null);
            setIsDragging(false);
            dragRef.current = null;
          }}
        >
          {/* Minimal Time Ruler Background */}
          <div className="absolute inset-0 z-0">
            {/* Hour markers */}
            {hourMarkers.map(({ h, pct, displayHour, meridiem }) => (
              <div
                key={h}
                className="absolute top-0 bottom-0 flex flex-col items-center"
                style={{ left: `${pct}%` }}
              >
                {/* Tick */}
                <div className="w-[1px] h-full bg-white/10" />
                {/* Label */}
                <div className="absolute bottom-3 text-[10px] font-medium text-zinc-600 whitespace-nowrap">
                  {displayHour}
                  <span className="text-[8px] ml-0.5 opacity-60">{meridiem}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Clean Glass Selection Window */}
          <div
            className="absolute inset-y-0 z-20 rounded-lg"
            style={{ 
              left: `${startPct}%`, 
              width: `${Math.max(0, endPct - startPct)}%`,
              transition: isDragging ? 'none' : 'left 0.3s ease-out, width 0.3s ease-out',
            }}
          >
            {/* Simple glass fill */}
            <div className="absolute inset-0 bg-[#FE3400]/35 backdrop-blur-[1px] border border-[#FE3400]/50 rounded-lg" />
            
            {/* Grip indicators */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex gap-2 opacity-40 z-10">
              <div className="w-[4px] h-24 rounded-full bg-white/40" />
              <div className="w-[4px] h-24 rounded-full bg-white/40" />
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2 opacity-40 z-10">
              <div className="w-[4px] h-24 rounded-full bg-white/40" />
              <div className="w-[4px] h-24 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* Time Range Cards */}
        <div className="mt-6 px-4 flex gap-3">
          <div className="flex-1 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Earliest</div>
            <div className="text-[20px] font-semibold text-white">{formatTime(start)}</div>
          </div>
          <div className="flex-1 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Latest</div>
            <div className="text-[20px] font-semibold text-white">{formatTime(end)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
