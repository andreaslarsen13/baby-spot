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

function formatCardTime(minutesFromMidnight: number) {
  // 30-min cards read better without :00
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  return m === 0 ? `${h12} ${meridiem}` : `${h12}:${m.toString().padStart(2, "0")} ${meridiem}`;
}

function computeDefaultWindowAroundIdeal(
  ideal: number,
  min: number,
  max: number,
  step: number
): { start: number; end: number } {
  // 2-hour total window (±1h), centered on ideal, preserved when clamping
  const half = 60;
  const width = 120;
  let s = roundToStep(ideal - half, step);
  let e = roundToStep(ideal + half, step);
  if (s < min) {
    s = min;
    e = min + width;
  }
  if (e > max) {
    e = max;
    s = max - width;
  }
  s = clamp(roundToStep(s, step), min, max);
  e = clamp(roundToStep(e, step), min, max);
  if (e - s < width) {
    // if range is too narrow due to bounds, just clamp safely
    e = clamp(s + width, min, max);
    s = clamp(e - width, min, max);
  }
  return { start: s, end: e };
}

/**
 * TimeWindowSlider v7
 *
 * 1) Pick an ideal time via 30-minute cards.
 * 2) A 2-hour orange range appears centered on that ideal time.
 * 3) Press-and-drag to adjust: center moves window, edges resize (15-min snapping).
 *    No tap-to-jump on the ruler.
 */
export const TimeWindowSliderV7: React.FC<Props> = ({
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
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const dragRef = useRef<{
    mode: DragMode;
    start0: number;
    end0: number;
    x0: number;
    widthPx: number;
  } | null>(null);

  const min = minMinutes;
  const max = maxMinutes;
  const start = clamp(roundToStep(startMinutes, stepMinutes), min, max);
  const end = clamp(roundToStep(endMinutes, stepMinutes), min, max);

  // Ideal cards: prefer 5–10 PM when possible; otherwise fall back to the provided range.
  const idealCardMin = clamp(17 * 60, min, max);
  const idealCardMax = clamp(22 * 60, min, max);
  const cardMin = idealCardMax - idealCardMin >= 60 ? idealCardMin : min;
  const cardMax = idealCardMax - idealCardMin >= 60 ? idealCardMax : max;

  const idealOptions = useMemo(() => {
    const opts: number[] = [];
    const step = 30;
    const first = Math.ceil(cardMin / step) * step;
    const last = Math.floor(cardMax / step) * step;
    for (let m = first; m <= last; m += step) opts.push(m);
    return opts;
  }, [cardMin, cardMax]);

  // Use the current selection midpoint as the displayed "ideal" highlight.
  const idealHighlight = useMemo(() => {
    const mid = (start + end) / 2;
    const step = 30;
    const snapped = clamp(Math.round(mid / step) * step, cardMin, cardMax);
    return snapped;
  }, [start, end, cardMin, cardMax]);

  // Ruler viewport: prefer 5–10 PM if available; otherwise center around selection.
  const viewMin = useMemo(() => {
    const preferredMin = Math.max(min, 17 * 60);
    const preferredMax = Math.min(max, 22 * 60);
    if (preferredMax - preferredMin >= 120) return preferredMin;
    const mid = (start + end) / 2;
    const span = Math.min(max - min, 5 * 60);
    return clamp(mid - span / 2, min, max);
  }, [min, max, start, end]);

  const viewMax = useMemo(() => {
    const preferredMin = Math.max(min, 17 * 60);
    const preferredMax = Math.min(max, 22 * 60);
    if (preferredMax - preferredMin >= 120) return preferredMax;
    const span = Math.min(max - min, 5 * 60);
    return clamp(viewMin + span, min, max);
  }, [min, max, viewMin, start, end]);

  const viewSpan = Math.max(stepMinutes, viewMax - viewMin);
  const toPct = (m: number) => ((m - viewMin) / viewSpan) * 100;

  const startPct = toPct(start);
  const endPct = toPct(end);
  const idealPct = toPct(idealHighlight);

  const ticks = useMemo(() => {
    const list: Array<{ minutes: number; isHour: boolean; label?: string }> = [];
    const tickStep = 30;
    const first = Math.ceil(viewMin / tickStep) * tickStep;
    const last = Math.floor(viewMax / tickStep) * tickStep;
    for (let m = first; m <= last; m += tickStep) {
      const isHour = m % 60 === 0;
      if (isHour) {
        const h24 = Math.floor(m / 60);
        const meridiem = h24 >= 12 ? "PM" : "AM";
        const h12 = ((h24 + 11) % 12) + 1;
        list.push({ minutes: m, isHour: true, label: `${h12} ${meridiem}` });
      } else {
        list.push({ minutes: m, isHour: false });
      }
    }
    return list;
  }, [viewMin, viewMax]);

  const chooseModeAtX = (xPx: number, widthPx: number): DragMode => {
    const leftPx = (startPct / 100) * widthPx;
    const rightPx = (endPct / 100) * widthPx;
    const inside = xPx >= leftPx && xPx <= rightPx;
    const edgeHitPx = 28;
    if (inside) {
      if (xPx - leftPx <= edgeHitPx) return "start";
      if (rightPx - xPx <= edgeHitPx) return "end";
      return "move";
    }
    // Outside: pick nearest edge
    return Math.abs(xPx - leftPx) <= Math.abs(xPx - rightPx) ? "start" : "end";
  };

  const applyDrag = (clientX: number) => {
    if (!dragRef.current) return;
    const t = trackRef.current?.getBoundingClientRect();
    if (!t) return;

    const x = clamp(clientX - t.left, 0, t.width);
    const deltaPx = x - dragRef.current.x0;
    const deltaMin = roundToStep((deltaPx / dragRef.current.widthPx) * viewSpan, stepMinutes);
    const { mode, start0, end0 } = dragRef.current;
    if (!mode) return;

    if (mode === "move") {
      const width = end0 - start0;
      let nextStart = start0 + deltaMin;
      let nextEnd = end0 + deltaMin;
      if (nextStart < min) {
        nextStart = min;
        nextEnd = min + width;
      }
      if (nextEnd > max) {
        nextEnd = max;
        nextStart = max - width;
      }
      onChange({ startMinutes: nextStart, endMinutes: nextEnd });
      return;
    }

    if (mode === "start") {
      let nextStart = start0 + deltaMin;
      nextStart = clamp(nextStart, min, end0 - minWindowMinutes);
      onChange({ startMinutes: nextStart, endMinutes: end0 });
      return;
    }

    if (mode === "end") {
      let nextEnd = end0 + deltaMin;
      nextEnd = clamp(nextEnd, start0 + minWindowMinutes, max);
      onChange({ startMinutes: start0, endMinutes: nextEnd });
    }
  };

  const setIdeal = (idealMinutes: number) => {
    const { start: s, end: e } = computeDefaultWindowAroundIdeal(idealMinutes, min, max, stepMinutes);
    onChange({ startMinutes: s, endMinutes: e });
  };

  return (
    <div className={className}>
      {/* Ideal time cards */}
      <div className="px-4">
        <div className="text-[12px] font-semibold text-white/70 mb-3">Pick an ideal time</div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {idealOptions.map((m) => {
            const selected = m === idealHighlight;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setIdeal(m)}
                className={`shrink-0 px-4 py-3 rounded-2xl border text-[14px] font-semibold transition-colors ${
                  selected
                    ? "bg-[#FE3400] border-[#FE3400] text-black"
                    : "bg-white/5 border-white/10 text-white/85"
                }`}
              >
                {formatCardTime(m)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ruler */}
      <div className="mt-6 px-4">
        <div
          ref={trackRef}
          className="relative w-full h-44 rounded-[24px] overflow-hidden touch-none select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const x = clamp(e.clientX - rect.left, 0, rect.width);
            const mode = chooseModeAtX(x, rect.width);
            setDragMode(mode);
            dragRef.current = { mode, start0: start, end0: end, x0: x, widthPx: rect.width };
          }}
          onPointerMove={(e) => {
            if (!dragMode) return;
            applyDrag(e.clientX);
          }}
          onPointerUp={() => {
            setDragMode(null);
            dragRef.current = null;
          }}
          onPointerCancel={() => {
            setDragMode(null);
            dragRef.current = null;
          }}
        >
          {/* Ticks */}
          <div className="absolute inset-0">
            {ticks.map((t) => {
              const pct = toPct(t.minutes);
              return (
                <div
                  key={t.minutes}
                  className="absolute top-4 bottom-8"
                  style={{ left: `${pct}%`, transform: "translateX(-0.5px)" }}
                >
                  <div className={`w-[1px] h-full ${t.isHour ? "bg-white/30" : "bg-white/18"}`} />
                  {t.isHour && t.label ? (
                    <div className="absolute -top-1 -translate-y-full left-1/2 -translate-x-1/2 text-[11px] font-semibold text-white/70 whitespace-nowrap">
                      {t.label}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Ideal marker */}
          <div
            className="absolute top-6 h-2 w-2 rounded-full bg-white/50"
            style={{ left: `${idealPct}%`, transform: "translateX(-50%)" }}
          />

          {/* Orange range rectangle */}
          <div
            className="absolute inset-y-10 rounded-[18px] bg-[#FE3400]/80 border border-[#FE3400] shadow-[0_8px_30px_rgba(254,52,0,0.18)]"
            style={{
              left: `${startPct}%`,
              width: `${Math.max(0, endPct - startPct)}%`,
              transition: dragMode ? "none" : "left 140ms ease, width 140ms ease",
            }}
          >
            {/* edge affordances */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-[3px] h-16 rounded-full bg-black/25" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-[3px] h-16 rounded-full bg-black/25" />
            {/* center marker */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-12 bg-black/18 rounded-full" />
          </div>

          {/* subtle base fade */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/20" />
        </div>
      </div>

      {/* Bottom chip */}
      <div className="mt-6 px-4 flex justify-center">
        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/7 border border-white/10 text-base font-semibold text-white">
          <span>{formatTime(start)}</span>
          <span className="opacity-60">→</span>
          <span>{formatTime(end)}</span>
        </div>
      </div>
    </div>
  );
};


