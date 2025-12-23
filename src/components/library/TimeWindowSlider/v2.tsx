import React, { useMemo, useRef, useState } from "react";

type DragMode = "start" | "end" | "move" | null;

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
 * TimeWindowSlider v2
 * 
 * New design direction:
 * - More minimal and focused
 * - Different interaction model
 * - Cleaner visual hierarchy
 */
export const TimeWindowSliderV2: React.FC<Props> = ({
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
  const [viewMinMinutes, setViewMinMinutes] = useState(() => {
    return clamp(16 * 60, minMinutes, maxMinutes);
  });
  const [viewMaxMinutes, setViewMaxMinutes] = useState(() => {
    return clamp(22 * 60, minMinutes, maxMinutes);
  });
  const dragRef = useRef<{
    mode: DragMode;
    start0: number;
    end0: number;
    x0: number;
    widthPx: number;
  } | null>(null);

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

    const edgeHitPx = 24;
    if (inside) {
      if (xPx - pillLeftPx <= edgeHitPx) return "start";
      if (pillRightPx - xPx <= edgeHitPx) return "end";
      return "move";
    }

    return Math.abs(xPx - pillLeftPx) <= Math.abs(xPx - pillRightPx) ? "start" : "end";
  };

  const applyDrag = (clientX: number) => {
    const t = getTrack();
    if (!t || !dragRef.current) return;
    const x = clientX - t.left;
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

  // Generate hour markers
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
      {/* Time Display Header */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <div className="text-center">
          <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">From</div>
          <div className="text-[28px] font-bold text-white">{formatTime(start)}</div>
        </div>
        <div className="text-zinc-600 text-xl">→</div>
        <div className="text-center">
          <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">To</div>
          <div className="text-[28px] font-bold text-white">{formatTime(end)}</div>
        </div>
      </div>

      {/* Time Ruler */}
      <div className="relative">
        <div
          ref={trackRef}
          className="relative w-full h-32 touch-none select-none bg-zinc-900/30 rounded-2xl border border-zinc-800/50"
          onPointerDown={(e) => {
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
            const t = getTrack();
            if (!t) return;
            const x = clamp(e.clientX - t.left, 0, t.width);
            const mode = chooseModeAtX(x, t.width);
            setActive(mode);
            dragRef.current = { mode, start0: start, end0: end, x0: x, widthPx: t.width };
            applyDrag(e.clientX);
          }}
          onPointerMove={(e) => {
            if (!active) return;
            applyDrag(e.clientX);
          }}
          onPointerUp={() => {
            setActive(null);
            dragRef.current = null;
          }}
          onPointerCancel={() => {
            setActive(null);
            dragRef.current = null;
          }}
        >
          {/* Hour markers */}
          <div className="absolute inset-0 z-0">
            {hourMarkers.map(({ h, pct, displayHour, meridiem }) => (
              <div
                key={h}
                className="absolute top-0 bottom-0 flex flex-col items-center"
                style={{ left: `${pct}%` }}
              >
                <div className="w-[1.5px] h-full bg-white/15" />
                <div className="absolute bottom-2 text-[11px] font-medium text-zinc-500 whitespace-nowrap">
                  {displayHour}
                  <span className="text-[9px] ml-0.5 opacity-70">{meridiem}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selection Range */}
          <div
            className="absolute inset-y-0 z-20 rounded-xl"
            style={{ 
              left: `${startPct}%`, 
              width: `${Math.max(0, endPct - startPct)}%`,
              transition: active ? 'none' : 'left 0.2s ease-out, width 0.2s ease-out',
            }}
          >
            <div className="absolute inset-0 bg-[#FE3400] rounded-xl shadow-[0_0_40px_rgba(254,52,0,0.3)]" />
            
            {/* Edge handles */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-[#FE3400] shadow-lg" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-[#FE3400] shadow-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

