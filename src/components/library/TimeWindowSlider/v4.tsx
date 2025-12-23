import React, { useMemo, useRef, useState } from "react";

type Props = {
  minMinutes: number;
  maxMinutes: number;
  startMinutes: number;
  endMinutes: number;
  onChange: (next: { startMinutes: number; endMinutes: number }) => void;
  stepMinutes?: number;
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

/**
 * TimeWindowSlider v4
 *
 * Ultra-simple pill slider
 * - Single glowing pill; drag left edge for Earliest, right edge for Latest
 * - Viewport system keeps segments evenly sized (no squish)
 */
export const TimeWindowSliderV4: React.FC<Props> = ({
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
  const [activeHandle, setActiveHandle] = useState<"earliest" | "latest" | null>(null);
  const activePointerIdRef = useRef<number | null>(null);

  // Center viewport with an outer frame roughly 5 PM – 10 PM when possible
  const targetViewMin = Math.max(minMinutes, 17 * 60); // 5 PM
  const targetViewMax = Math.min(maxMinutes, 22 * 60); // 10 PM
  const defaultSpanMinutes = Math.min(maxMinutes - minMinutes, targetViewMax - targetViewMin || 8 * 60);

  const [viewMinMinutes, setViewMinMinutes] = useState(() => {
    // If 5–10 PM fits, use it; otherwise center around the selection with default span
    if (targetViewMax - targetViewMin >= defaultSpanMinutes && startMinutes >= targetViewMin && endMinutes <= targetViewMax) {
      return targetViewMin;
    }
    const mid = (startMinutes + endMinutes) / 2;
    return clamp(mid - defaultSpanMinutes / 2, minMinutes, maxMinutes);
  });
  const [viewMaxMinutes, setViewMaxMinutes] = useState(() => {
    if (targetViewMax - targetViewMin >= defaultSpanMinutes && startMinutes >= targetViewMin && endMinutes <= targetViewMax) {
      return targetViewMax;
    }
    const mid = (startMinutes + endMinutes) / 2;
    return clamp(mid + defaultSpanMinutes / 2, minMinutes, maxMinutes);
  });

  const start = clamp(startMinutes, minMinutes, maxMinutes);
  const end = clamp(endMinutes, minMinutes, maxMinutes);

  const viewMin = clamp(viewMinMinutes, minMinutes, maxMinutes);
  const viewMax = clamp(viewMaxMinutes, minMinutes, maxMinutes);
  const viewSpan = Math.max(stepMinutes, viewMax - viewMin);

  const minutesToPct = (minutes: number) => ((minutes - viewMin) / viewSpan) * 100;

  const pctToMinutes = (pct: number) => {
    const minutes = viewMin + (pct / 100) * viewSpan;
    return roundToStep(minutes, stepMinutes);
  };

  const getTrack = () => {
    if (!trackRef.current) return null;
    const rect = trackRef.current.getBoundingClientRect();
    return { left: rect.left, width: rect.width };
  };

  const ensureInView = (minutes: number, edge: "min" | "max") => {
    const buffer = 90; // minutes of headroom when expanding
    if (edge === "min" && minutes < viewMin) {
      const newMin = Math.max(minMinutes, minutes - buffer);
      const newMax = Math.min(maxMinutes, newMin + viewSpan);
      setViewMinMinutes(newMin);
      setViewMaxMinutes(newMax);
    } else if (edge === "max" && minutes > viewMax) {
      const newMax = Math.min(maxMinutes, minutes + buffer);
      const newMin = Math.max(minMinutes, newMax - viewSpan);
      setViewMinMinutes(newMin);
      setViewMaxMinutes(newMax);
    }
  };

  const chooseHandleAtX = (xPx: number, widthPx: number) => {
    const startPct = minutesToPct(start);
    const endPct = minutesToPct(end);
    const startPx = (startPct / 100) * widthPx;
    const endPx = (endPct / 100) * widthPx;
    const mid = (startPx + endPx) / 2;
    // Left half targets earliest, right half targets latest
    return xPx <= mid ? "earliest" : "latest";
  };

  const handleDrag = (clientX: number) => {
    if (!activeHandle) return;
    const t = getTrack();
    if (!t) return;

    const x = clamp(clientX - t.left, 0, t.width);
    const pct = clamp((x / t.width) * 100, 0, 100);
    const newMinutes = pctToMinutes(pct);

    if (activeHandle === "earliest") {
      const nextStart = clamp(newMinutes, minMinutes, end - (minWindowMinutes || 30));
      ensureInView(nextStart, "min");
      onChange({ startMinutes: nextStart, endMinutes: end });
    } else {
      const nextEnd = clamp(newMinutes, start + (minWindowMinutes || 30), maxMinutes);
      ensureInView(nextEnd, "max");
      onChange({ startMinutes: start, endMinutes: nextEnd });
    }
  };

  // Meal presets (same rules as v1)
  // Segments and labels for viewport
  const segments = useMemo(() => {
    const segs = [];
    const startSeg = Math.floor(viewMin / stepMinutes) * stepMinutes;
    const endSeg = Math.ceil(viewMax / stepMinutes) * stepMinutes;
    for (let m = startSeg; m <= endSeg; m += stepMinutes) {
      if (m >= viewMin - stepMinutes && m <= viewMax + stepMinutes) {
        segs.push(m);
      }
    }
    return segs;
  }, [viewMin, viewMax, stepMinutes]);

  const hourLabels = useMemo(() => {
    const labels = [];
    const minHour = Math.floor(viewMin / 60);
    const maxHour = Math.ceil(viewMax / 60);
    for (let h = minHour; h <= maxHour; h++) {
      const minutes = h * 60;
      if (minutes >= viewMin && minutes <= viewMax) {
        labels.push(minutes);
      }
    }
    return labels;
  }, [viewMin, viewMax]);

  // Tick marks (like text size slider) every 30 minutes
  const ticks = useMemo(() => {
    const list: number[] = [];
    const startTick = Math.floor(viewMin / 30) * 30;
    const endTick = Math.ceil(viewMax / 30) * 30;
    for (let m = startTick; m <= endTick; m += 30) {
      if (m >= viewMin - 30 && m <= viewMax + 30) list.push(m);
    }
    return list;
  }, [viewMin, viewMax]);

  const startPct = minutesToPct(start);
  const endPct = minutesToPct(end);

  return (
    <div className={className}>
      {/* Glowing pill slider */}
      <div className="relative w-full">
        <div
          ref={trackRef}
          className="relative w-full h-48 rounded-[22px] overflow-hidden cursor-pointer touch-none select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            const t = getTrack();
            if (!t) return;
            const x = clamp(e.clientX - t.left, 0, t.width);
            const handle = chooseHandleAtX(x, t.width);
            activePointerIdRef.current = e.pointerId;
            trackRef.current?.setPointerCapture(e.pointerId);
            setActiveHandle(handle);
            handleDrag(e.clientX);
          }}
          onPointerMove={(e) => {
            if (activePointerIdRef.current !== e.pointerId) return;
            handleDrag(e.clientX);
          }}
          onPointerUp={(e) => {
            if (activePointerIdRef.current !== e.pointerId) return;
            activePointerIdRef.current = null;
            setActiveHandle(null);
            trackRef.current?.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={(e) => {
            if (activePointerIdRef.current !== e.pointerId) return;
            activePointerIdRef.current = null;
            setActiveHandle(null);
            trackRef.current?.releasePointerCapture(e.pointerId);
          }}
        >
          {/* Hour labels */}
          <div className="absolute inset-x-0 top-2 text-[11px] font-semibold text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
            {hourLabels.map((minutes) => {
              const pct = minutesToPct(minutes);
              const h24 = Math.floor(minutes / 60);
              const displayHour = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
              const meridiem = h24 >= 12 ? "PM" : "AM";
              return (
                <div
                  key={minutes}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${pct}%` }}
                >
                  {displayHour}
                  <span className="text-[9px] ml-0.5 opacity-70">{meridiem}</span>
                </div>
              );
            })}
          </div>

          {/* Tick marks (clear thin lines) */}
          <div className="absolute inset-0">
            {ticks.map((m, idx) => {
              const pct = minutesToPct(m);
              return (
                <div
                  key={idx}
                  className="absolute top-6 bottom-6 w-[1px] bg-white/40"
                  style={{ left: `${pct}%`, transform: "translateX(-0.5px)" }}
                />
              );
            })}
          </div>

          {/* Segments */}
          <div className="absolute inset-0 flex items-center px-2 gap-[2px]">
            {segments.map((m, idx) => {
              const isInRange = m >= start && m <= end;
              return (
                <div
                  key={idx}
                  className={`flex-1 h-[6px] rounded-full transition-colors ${
                    isInRange ? "bg-white" : "bg-white/16"
                  }`}
                />
              );
            })}
          </div>

          {/* Glowing pill range */}
          <div
            className="absolute inset-y-3 rounded-[18px] bg-white shadow-none"
            style={{
              left: `${startPct}%`,
              width: `${Math.max(1, endPct - startPct)}%`,
              transition: activeHandle ? "none" : "left 160ms ease, width 160ms ease",
            }}
          >
            {/* Center marker for affordance */}
            <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-[2px] bg-black/20" />
          </div>

          {/* Earliest handle */}
          <div
            className="absolute inset-y-0 w-8 -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing"
            style={{ left: `${startPct}%` }}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              activePointerIdRef.current = e.pointerId;
              (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              setActiveHandle("earliest");
            }}
            onPointerMove={(e) => {
              if (activePointerIdRef.current !== e.pointerId) return;
              handleDrag(e.clientX);
            }}
            onPointerUp={(e) => {
              if (activePointerIdRef.current !== e.pointerId) return;
              activePointerIdRef.current = null;
              setActiveHandle(null);
              (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={(e) => {
              if (activePointerIdRef.current !== e.pointerId) return;
              activePointerIdRef.current = null;
              setActiveHandle(null);
              (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
            }}
          />

          {/* Latest handle */}
          <div
            className="absolute inset-y-0 w-8 -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing"
            style={{ left: `${endPct}%` }}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              activePointerIdRef.current = e.pointerId;
              (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              setActiveHandle("latest");
            }}
            onPointerMove={(e) => {
              if (activePointerIdRef.current !== e.pointerId) return;
              handleDrag(e.clientX);
            }}
            onPointerUp={(e) => {
              if (activePointerIdRef.current !== e.pointerId) return;
              activePointerIdRef.current = null;
              setActiveHandle(null);
              (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={(e) => {
              if (activePointerIdRef.current !== e.pointerId) return;
              activePointerIdRef.current = null;
              setActiveHandle(null);
              (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
            }}
          />

          {/* Glow overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-transparent" />
        </div>
      </div>

      {/* Selected time chip */}
      <div className="mt-4 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          <span>{formatTime(start)}</span>
          <span className="opacity-70">→</span>
          <span>{formatTime(end)}</span>
        </div>
      </div>

    </div>
  );
};

