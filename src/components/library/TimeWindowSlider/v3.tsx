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
 * TimeWindowSlider v3
 * 
 * Segmented Bar Design with Viewport System
 * - Horizontal segmented bar with click/drag selection
 * - Viewport system ensures selection is always centered and visible
 * - No squishing - segments always properly sized
 */
export const TimeWindowSliderV3: React.FC<Props> = ({
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
  const [activeHandle, setActiveHandle] = useState<'earliest' | 'latest' | null>(null);
  const [viewMinMinutes, setViewMinMinutes] = useState(() => {
    // Center viewport around initial selection
    const mid = (startMinutes + endMinutes) / 2;
    const windowWidth = 6 * 60; // 6 hour viewport
    return clamp(mid - windowWidth / 2, minMinutes, maxMinutes);
  });
  const [viewMaxMinutes, setViewMaxMinutes] = useState(() => {
    const mid = (startMinutes + endMinutes) / 2;
    const windowWidth = 6 * 60;
    return clamp(mid + windowWidth / 2, minMinutes, maxMinutes);
  });
  
  const dragRef = useRef<{
    handle: 'earliest' | 'latest';
    start0: number;
    end0: number;
    x0: number;
    widthPx: number;
  } | null>(null);

  const start = clamp(startMinutes, minMinutes, maxMinutes);
  const end = clamp(endMinutes, minMinutes, maxMinutes);
  const totalRange = maxMinutes - minMinutes;

  // Viewport calculations (like v1)
  const viewMin = clamp(viewMinMinutes, minMinutes, maxMinutes);
  const viewMax = clamp(viewMaxMinutes, minMinutes, maxMinutes);
  const viewSpan = Math.max(stepMinutes, viewMax - viewMin);

  // Convert minutes to percentage within viewport (not total range)
  const minutesToPct = (minutes: number) => {
    return ((minutes - viewMin) / viewSpan) * 100;
  };

  const getTrack = () => {
    if (!trackRef.current) return null;
    const rect = trackRef.current.getBoundingClientRect();
    return { left: rect.left, width: rect.width };
  };

  const pxToMinutes = (xPx: number, widthPx: number) => {
    if (widthPx <= 0) return viewMin;
    const pct = clamp(xPx / widthPx, 0, 1);
    const minutes = viewMin + pct * viewSpan;
    return roundToStep(minutes, stepMinutes);
  };

  const handleDrag = (clientX: number) => {
    const t = getTrack();
    if (!t || !dragRef.current) return;
    const x = clamp(clientX - t.left, 0, t.width);
    const newMinutes = pxToMinutes(x, t.width);

    if (dragRef.current.handle === 'earliest') {
      let newStart = clamp(newMinutes, minMinutes, end - (minWindowMinutes || 30));
      // Expand viewport if dragging outside
      if (newStart < viewMin) {
        setViewMinMinutes(Math.max(minMinutes, newStart - 2 * 60)); // Add buffer
      }
      onChange({ startMinutes: newStart, endMinutes: end });
    } else {
      let newEnd = clamp(newMinutes, start + (minWindowMinutes || 30), maxMinutes);
      // Expand viewport if dragging outside
      if (newEnd > viewMax) {
        setViewMaxMinutes(Math.min(maxMinutes, newEnd + 2 * 60)); // Add buffer
      }
      onChange({ startMinutes: start, endMinutes: newEnd });
    }
  };

  const handleClick = (clientX: number) => {
    if (activeHandle) return; // Don't handle clicks while dragging
    
    const t = getTrack();
    if (!t) return;
    
    const x = clamp(clientX - t.left, 0, t.width);
    const newMinutes = pxToMinutes(x, t.width);
    
    // Determine which handle to move based on which is closer
    const distToStart = Math.abs(newMinutes - start);
    const distToEnd = Math.abs(newMinutes - end);
    
    if (distToStart < distToEnd) {
      let newStart = clamp(newMinutes, minMinutes, end - (minWindowMinutes || 30));
      if (newStart < viewMin) {
        setViewMinMinutes(Math.max(minMinutes, newStart - 2 * 60));
      }
      onChange({ startMinutes: newStart, endMinutes: end });
    } else {
      let newEnd = clamp(newMinutes, start + (minWindowMinutes || 30), maxMinutes);
      if (newEnd > viewMax) {
        setViewMaxMinutes(Math.min(maxMinutes, newEnd + 2 * 60));
      }
      onChange({ startMinutes: start, endMinutes: newEnd });
    }
  };

  // Generate segments only for the visible viewport
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

  // Generate hour labels for the viewport
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

  return (
    <div className={className}>
      {/* Selected Times Display */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-baseline gap-4">
          <div>
            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Earliest
            </div>
            <div className="text-[36px] font-light text-white leading-none">
              {formatTime(start)}
            </div>
          </div>
          <div className="text-zinc-600 text-2xl">→</div>
          <div>
            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Latest
            </div>
            <div className="text-[36px] font-light text-white leading-none">
              {formatTime(end)}
            </div>
          </div>
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

        {/* Segmented Track */}
        <div
          ref={trackRef}
          className="relative h-12 flex gap-[2px] cursor-pointer"
          onClick={(e) => handleClick(e.clientX)}
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

        {/* Earliest Handle */}
        <div
          className="absolute top-0 bottom-0 -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing"
          style={{ left: `${startPct}%` }}
          onPointerDown={(e) => {
            e.stopPropagation();
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
            const t = getTrack();
            if (!t) return;
            setActiveHandle('earliest');
            dragRef.current = {
              handle: 'earliest',
              start0: start,
              end0: end,
              x0: e.clientX - t.left,
              widthPx: t.width,
            };
          }}
        >
          <div className="w-1 h-full bg-white rounded-full shadow-lg" />
        </div>

        {/* Latest Handle */}
        <div
          className="absolute top-0 bottom-0 -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing"
          style={{ left: `${endPct}%` }}
          onPointerDown={(e) => {
            e.stopPropagation();
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
            const t = getTrack();
            if (!t) return;
            setActiveHandle('latest');
            dragRef.current = {
              handle: 'latest',
              start0: start,
              end0: end,
              x0: e.clientX - t.left,
              widthPx: t.width,
            };
          }}
        >
          <div className="w-1 h-full bg-white rounded-full shadow-lg" />
        </div>
      </div>

      {/* Global drag handlers */}
      {activeHandle && (
        <div
          className="fixed inset-0 z-10"
          onPointerMove={(e) => {
            if (activeHandle) handleDrag(e.clientX);
          }}
          onPointerUp={() => {
            setActiveHandle(null);
            dragRef.current = null;
          }}
          onPointerCancel={() => {
            setActiveHandle(null);
            dragRef.current = null;
          }}
        />
      )}
    </div>
  );
};
