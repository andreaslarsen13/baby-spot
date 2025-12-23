import React, { useMemo, useRef, useState, useEffect } from "react";

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

// Arrow icons
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/**
 * TimeWindowSlider v8
 * 
 * Based on V3 (segmented bar design) with improvements:
 * - Earliest/Latest cards above slider
 * - Fixed grab bar alignment at exact edges
 * - Middle drag to move entire range
 * - Improved drag interaction (smoother, won't get stuck)
 */
export const TimeWindowSliderV8: React.FC<Props> = ({
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
  const [activeHandle, setActiveHandle] = useState<'earliest' | 'latest' | 'move' | null>(null);
  const VIEWPORT_WIDTH_INIT = 6 * 60; // 6 hours
  
  const [viewMinMinutes, setViewMinMinutes] = useState(() => {
    const mid = (startMinutes + endMinutes) / 2;
    let viewMin = mid - VIEWPORT_WIDTH_INIT / 2;
    // Make sure viewport doesn't go below minMinutes
    if (viewMin < minMinutes) viewMin = minMinutes;
    // Make sure viewport doesn't go above maxMinutes - width
    if (viewMin > maxMinutes - VIEWPORT_WIDTH_INIT) viewMin = maxMinutes - VIEWPORT_WIDTH_INIT;
    return viewMin;
  });
  const [viewMaxMinutes, setViewMaxMinutes] = useState(() => {
    const mid = (startMinutes + endMinutes) / 2;
    let viewMin = mid - VIEWPORT_WIDTH_INIT / 2;
    if (viewMin < minMinutes) viewMin = minMinutes;
    if (viewMin > maxMinutes - VIEWPORT_WIDTH_INIT) viewMin = maxMinutes - VIEWPORT_WIDTH_INIT;
    return viewMin + VIEWPORT_WIDTH_INIT;
  });
  
  const dragRef = useRef<{
    handle: 'earliest' | 'latest' | 'move';
    start0: number;
    end0: number;
    x0: number;
    widthPx: number;
  } | null>(null);

  // Shift the viewport (time scale) by 5 hours (breakfast → lunch → dinner)
  const shiftViewport = (direction: 'earlier' | 'later') => {
    const SHIFT_AMOUNT = 5 * 60; // 5 hours
    const delta = direction === 'earlier' ? -SHIFT_AMOUNT : SHIFT_AMOUNT;
    const newViewMin = viewMin + delta;
    panViewport(newViewMin);
  };

  const start = clamp(startMinutes, minMinutes, maxMinutes);
  const end = clamp(endMinutes, minMinutes, maxMinutes);

  const viewMin = clamp(viewMinMinutes, minMinutes, maxMinutes);
  const viewMax = clamp(viewMaxMinutes, minMinutes, maxMinutes);
  const viewSpan = Math.max(stepMinutes, viewMax - viewMin);

  const stateRef = useRef({ start, end, viewMin, viewMax, viewSpan, minMinutes, maxMinutes, minWindowMinutes });
  stateRef.current = { start, end, viewMin, viewMax, viewSpan, minMinutes, maxMinutes, minWindowMinutes };

  const minutesToPct = (minutes: number) => {
    return ((minutes - viewMin) / viewSpan) * 100;
  };

  const getTrack = () => {
    if (!trackRef.current) return null;
    const rect = trackRef.current.getBoundingClientRect();
    return { left: rect.left, width: rect.width };
  };

  // Fixed viewport width (6 hours)
  const VIEWPORT_WIDTH = 6 * 60;

  const panViewport = (newViewMin: number) => {
    // Pan the viewport while keeping fixed width
    const clampedViewMin = clamp(newViewMin, minMinutes, maxMinutes - VIEWPORT_WIDTH);
    setViewMinMinutes(clampedViewMin);
    setViewMaxMinutes(clampedViewMin + VIEWPORT_WIDTH);
  };


  const handleDragRef = useRef((clientX: number) => {
    const t = getTrack();
    if (!t || !dragRef.current) return;
    const { start, end, viewMin, viewMax, viewSpan, minMinutes, maxMinutes, minWindowMinutes } = stateRef.current;
    const { handle, start0, end0, x0, widthPx } = dragRef.current;
    
    const x = clientX - t.left;
    const deltaPx = x - x0;
    const deltaMinutes = roundToStep((deltaPx / widthPx) * viewSpan, stepMinutes);

    if (handle === 'move') {
      // Move entire range while maintaining width
      const rangeWidth = end0 - start0;
      let newStart = start0 + deltaMinutes;
      let newEnd = end0 + deltaMinutes;
      
      // Clamp to bounds
      if (newStart < minMinutes) {
        newStart = minMinutes;
        newEnd = minMinutes + rangeWidth;
      }
      if (newEnd > maxMinutes) {
        newEnd = maxMinutes;
        newStart = maxMinutes - rangeWidth;
      }
      
      // Pan viewport if selection goes outside (keep fixed width)
      if (newStart < viewMin) {
        panViewport(newStart - 30); // 30 min padding
      }
      if (newEnd > viewMax) {
        panViewport(newEnd - VIEWPORT_WIDTH + 30); // 30 min padding
      }
      
      onChange({ startMinutes: newStart, endMinutes: newEnd });
    } else if (handle === 'earliest') {
      const pct = clamp(x / t.width, 0, 1);
      const newMinutes = roundToStep(viewMin + pct * viewSpan, stepMinutes);
      let newStart = clamp(newMinutes, minMinutes, end - (minWindowMinutes || 30));
      
      // Pan viewport left if dragging past left edge
      if (newStart < viewMin) {
        panViewport(newStart - 30);
      }
      onChange({ startMinutes: newStart, endMinutes: end });
    } else {
      const pct = clamp(x / t.width, 0, 1);
      const newMinutes = roundToStep(viewMin + pct * viewSpan, stepMinutes);
      let newEnd = clamp(newMinutes, start + (minWindowMinutes || 30), maxMinutes);
      
      // Pan viewport right if dragging past right edge
      if (newEnd > viewMax) {
        panViewport(newEnd - VIEWPORT_WIDTH + 30);
      }
      onChange({ startMinutes: start, endMinutes: newEnd });
    }
  });

  useEffect(() => {
    if (!activeHandle) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      handleDragRef.current(e.clientX);
    };

    const handlePointerUp = () => {
      setActiveHandle(null);
      dragRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [activeHandle]);

  const segments = useMemo(() => {
    const segs = [];
    const startSegment = Math.floor((viewMin - minMinutes) / stepMinutes);
    const endSegment = Math.ceil((viewMax - minMinutes) / stepMinutes);
    
    for (let i = startSegment; i <= endSegment; i++) {
      const minutes = minMinutes + i * stepMinutes;
      if (minutes >= viewMin && minutes <= viewMax) {
        segs.push(minutes);
      }
    }
    return segs;
  }, [viewMin, viewMax, minMinutes, stepMinutes]);

  const hourLabels = useMemo(() => {
    const labels = [];
    const minHour = Math.floor(viewMin / 60);
    const maxHour = Math.ceil(viewMax / 60);
    
    for (let hour = minHour; hour <= maxHour; hour++) {
      const minutes = hour * 60;
      if (minutes >= viewMin && minutes <= viewMax) {
        labels.push({ minutes, hour });
      }
    }
    return labels;
  }, [viewMin, viewMax]);

  const startPct = minutesToPct(start);
  const endPct = minutesToPct(end);
  const trackHeight = 96;

  const initiateHandleDrag = (handle: 'earliest' | 'latest' | 'move', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const t = getTrack();
    if (!t) return;
    setActiveHandle(handle);
    dragRef.current = {
      handle,
      start0: start,
      end0: end,
      x0: e.clientX - t.left,
      widthPx: t.width,
    };
  };

  return (
    <div className={className}>
      {/* Time Range Cards */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
          <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Earliest</div>
          <div className="text-[20px] font-semibold text-white">{formatTime(start)}</div>
        </div>
        <div className="flex-1 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
          <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Latest</div>
          <div className="text-[20px] font-semibold text-white">{formatTime(end)}</div>
        </div>
      </div>

      {/* Segmented Bar */}
      <div className="relative">
        {/* Hour Labels */}
        <div className="relative h-6 mb-2">
          {hourLabels.map(({ minutes, hour }) => {
            const pct = minutesToPct(minutes);
            const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const meridiem = hour >= 12 ? "PM" : "AM";
            
            return (
              <div
                key={minutes}
                className="absolute -translate-x-1/2 text-[11px] font-medium text-zinc-500 whitespace-nowrap"
                style={{ left: `${pct}%` }}
              >
                {h12} {meridiem}
              </div>
            );
          })}
        </div>

        {/* Segmented Track Container */}
        <div className="relative" style={{ height: trackHeight }}>
          {/* Actual segment track */}
          <div
            ref={trackRef}
            className="absolute inset-0 flex gap-[2px] z-[5] cursor-pointer"
            onPointerDown={(e) => {
              // Ignore if clicking on arrow buttons
              if ((e.target as HTMLElement).closest('button')) return;
              
              // Calculate which time was clicked and snap selection there
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const pct = x / rect.width;
              const clickedMinutes = roundToStep(viewMin + pct * viewSpan, stepMinutes);
              
              // Check if click is outside the current selection (or selection is not visible)
              const selectionVisible = start < viewMax && end > viewMin;
              const isOutsideSelection = !selectionVisible || clickedMinutes < start || clickedMinutes >= end;
              
              if (isOutsideSelection) {
                const currentDuration = end - start;
                // Center the selection on the clicked position
                let newStart = clickedMinutes - currentDuration / 2;
                newStart = roundToStep(newStart, stepMinutes);
                let newEnd = newStart + currentDuration;
                
                // Clamp to bounds
                if (newEnd > maxMinutes) {
                  newEnd = maxMinutes;
                  newStart = maxMinutes - currentDuration;
                }
                if (newStart < minMinutes) {
                  newStart = minMinutes;
                  newEnd = minMinutes + currentDuration;
                }
                
                onChange({ startMinutes: newStart, endMinutes: newEnd });
              }
            }}
          >
            {segments.map((segmentMinutes, index) => {
              const isInRange = segmentMinutes >= start && segmentMinutes < end;
              
              return (
                <div
                  key={index}
                  className={`flex-1 rounded-sm transition-colors ${
                    isInRange ? 'bg-orange-500' : 'bg-zinc-800'
                  }`}
                />
              );
            })}
          </div>

          {/* Left edge handle - invisible but draggable */}
          <div
            className="absolute top-0 bottom-0 z-20 cursor-ew-resize touch-none"
            style={{ 
              left: `${startPct}%`,
              width: 24,
            }}
            onPointerDown={(e) => initiateHandleDrag('earliest', e)}
          />

          {/* Middle drag area - over the orange selection */}
          <div
            className="absolute top-0 bottom-0 z-10 cursor-grab active:cursor-grabbing touch-none"
            style={{ 
              left: `calc(${startPct}% + 24px)`,
              width: `calc(${endPct - startPct}% - 48px)`,
            }}
            onPointerDown={(e) => initiateHandleDrag('move', e)}
          />

          {/* Right edge handle - invisible but draggable */}
          <div
            className="absolute top-0 bottom-0 z-20 cursor-ew-resize touch-none"
            style={{ 
              left: `${endPct}%`,
              width: 24,
              transform: 'translateX(-100%)',
            }}
            onPointerDown={(e) => initiateHandleDrag('latest', e)}
          />

          {/* Left Arrow - overlayed (shifts viewport 5 hours earlier) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              shiftViewport('earlier');
            }}
            disabled={viewMin <= minMinutes}
            className="absolute left-0 top-0 bottom-0 w-10 z-40 flex items-center justify-center bg-gradient-to-r from-zinc-900/90 to-transparent text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all pointer-events-auto"
          >
            <ChevronLeftIcon />
          </button>

          {/* Right Arrow - overlayed (shifts viewport 5 hours later) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              shiftViewport('later');
            }}
            disabled={viewMax >= maxMinutes}
            className="absolute right-0 top-0 bottom-0 w-10 z-40 flex items-center justify-center bg-gradient-to-l from-zinc-900/90 to-transparent text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all pointer-events-auto"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
