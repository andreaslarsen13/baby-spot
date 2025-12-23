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

/**
 * TimeWindowSlider v9
 * 
 * Wheel-like scrolling design:
 * - No range selected by default
 * - Smooth horizontal scrolling on track
 * - 3D depth effect with smaller bars at edges
 * - Click to place a 2-hour selection
 * - After selection placed, can adjust like v8
 */
export const TimeWindowSliderV9: React.FC<Props> = ({
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeHandle, setActiveHandle] = useState<'earliest' | 'latest' | null>(null);
  
  // Internal state: selection starts as "not placed" until user clicks
  const [selectionPlaced, setSelectionPlaced] = useState(false);
  
  // Viewport state - what time range is visible
  const VIEWPORT_WIDTH = 6 * 60; // 6 hours visible
  const [viewCenter, setViewCenter] = useState(() => {
    // Start centered on dinner time (6 PM = 18 * 60 = 1080)
    return 18 * 60;
  });

  // Scroll state for smooth panning with momentum
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollRef = useRef<{ startX: number; startCenter: number; hasMoved: boolean; lastX: number; lastTime: number; velocity: number } | null>(null);
  const momentumRef = useRef<number | null>(null);

  const hasSelection = selectionPlaced;
  const start = clamp(startMinutes, minMinutes, maxMinutes);
  const end = clamp(endMinutes, minMinutes, maxMinutes);

  // Calculate viewport bounds
  const viewMin = clamp(viewCenter - VIEWPORT_WIDTH / 2, minMinutes, maxMinutes - VIEWPORT_WIDTH);
  const viewMax = viewMin + VIEWPORT_WIDTH;
  const viewSpan = VIEWPORT_WIDTH;

  const stateRef = useRef({ start, end, viewMin, viewMax, viewSpan, minMinutes, maxMinutes, minWindowMinutes, hasSelection });
  stateRef.current = { start, end, viewMin, viewMax, viewSpan, minMinutes, maxMinutes, minWindowMinutes, hasSelection };

  const dragRef = useRef<{
    handle: 'earliest' | 'latest';
    start0: number;
    end0: number;
    x0: number;
    widthPx: number;
  } | null>(null);

  const minutesToPct = (minutes: number) => {
    return ((minutes - viewMin) / viewSpan) * 100;
  };

  const getTrack = () => {
    if (!trackRef.current) return null;
    const rect = trackRef.current.getBoundingClientRect();
    return { left: rect.left, width: rect.width };
  };

  const panViewport = (newCenter: number) => {
    const clampedCenter = clamp(newCenter, minMinutes + VIEWPORT_WIDTH / 2, maxMinutes - VIEWPORT_WIDTH / 2);
    setViewCenter(clampedCenter);
  };

  // Handle scroll/pan on the track (always works, even with selection)
  const handleScrollStart = (clientX: number) => {
    // Cancel any ongoing momentum
    if (momentumRef.current) {
      cancelAnimationFrame(momentumRef.current);
      momentumRef.current = null;
    }
    
    setIsScrolling(true);
    scrollRef.current = {
      startX: clientX,
      startCenter: viewCenter,
      hasMoved: false,
      lastX: clientX,
      lastTime: Date.now(),
      velocity: 0,
    };
  };

  const handleScrollMove = (clientX: number) => {
    if (!scrollRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const deltaX = scrollRef.current.startX - clientX;
    
    // Mark as moved if we've dragged more than 5 pixels
    if (Math.abs(deltaX) > 5) {
      scrollRef.current.hasMoved = true;
    }
    
    // Track velocity for momentum
    const now = Date.now();
    const dt = now - scrollRef.current.lastTime;
    if (dt > 0) {
      const dx = clientX - scrollRef.current.lastX;
      // Smooth velocity with some weight on previous
      scrollRef.current.velocity = scrollRef.current.velocity * 0.5 + (dx / dt) * 0.5;
    }
    scrollRef.current.lastX = clientX;
    scrollRef.current.lastTime = now;
    
    const deltaPct = deltaX / rect.width;
    const deltaMinutes = deltaPct * viewSpan;
    panViewport(scrollRef.current.startCenter + deltaMinutes);
  };

  const handleScrollEnd = () => {
    // Apply momentum if we have velocity
    if (scrollRef.current && Math.abs(scrollRef.current.velocity) > 0.1 && trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      let velocity = scrollRef.current.velocity; // px per ms
      const friction = 0.95; // Deceleration factor
      
      const animate = () => {
        velocity *= friction;
        
        // Convert velocity to minutes and pan
        const deltaMinutes = -(velocity * 16) / rect.width * viewSpan; // 16ms frame
        setViewCenter(prev => {
          const newCenter = prev + deltaMinutes;
          return clamp(newCenter, minMinutes + VIEWPORT_WIDTH / 2, maxMinutes - VIEWPORT_WIDTH / 2);
        });
        
        // Continue if still moving
        if (Math.abs(velocity) > 0.05) {
          momentumRef.current = requestAnimationFrame(animate);
        } else {
          momentumRef.current = null;
        }
      };
      
      momentumRef.current = requestAnimationFrame(animate);
    }
    
    setIsScrolling(false);
    scrollRef.current = null;
  };

  // Handle edge drag to extend/shrink selection
  const handleDragRef = useRef((clientX: number) => {
    const t = getTrack();
    if (!t || !dragRef.current) return;
    const { start, end, viewMin, viewSpan, minMinutes, maxMinutes, minWindowMinutes } = stateRef.current;
    const { handle } = dragRef.current;
    
    const x = clientX - t.left;

    if (handle === 'earliest') {
      const pct = clamp(x / t.width, 0, 1);
      const newMinutes = roundToStep(viewMin + pct * viewSpan, stepMinutes);
      const newStart = clamp(newMinutes, minMinutes, end - (minWindowMinutes || 30));
      onChange({ startMinutes: newStart, endMinutes: end });
    } else {
      const pct = clamp(x / t.width, 0, 1);
      const newMinutes = roundToStep(viewMin + pct * viewSpan, stepMinutes);
      const newEnd = clamp(newMinutes, start + (minWindowMinutes || 30), maxMinutes);
      onChange({ startMinutes: start, endMinutes: newEnd });
    }
  });

  // Store last pointer position for click detection
  const lastPointerRef = useRef<{ clientX: number; clientY: number } | null>(null);

  useEffect(() => {
    if (!activeHandle && !isScrolling) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      lastPointerRef.current = { clientX: e.clientX, clientY: e.clientY };
      if (isScrolling) {
        handleScrollMove(e.clientX);
      } else if (activeHandle) {
        handleDragRef.current(e.clientX);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      // If we were scrolling and didn't move, treat as a click to place selection
      if (isScrolling && scrollRef.current && !scrollRef.current.hasMoved) {
        const rect = trackRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const pct = x / rect.width;
          const clickedMinutes = roundToStep(viewMin + pct * viewSpan, stepMinutes);
          
          // Place a 2-hour selection
          const DEFAULT_DURATION = 2 * 60;
          let newStart = clickedMinutes - DEFAULT_DURATION / 2;
          newStart = roundToStep(newStart, stepMinutes);
          let newEnd = newStart + DEFAULT_DURATION;
          
          if (newEnd > maxMinutes) {
            newEnd = maxMinutes;
            newStart = maxMinutes - DEFAULT_DURATION;
          }
          if (newStart < minMinutes) {
            newStart = minMinutes;
            newEnd = minMinutes + DEFAULT_DURATION;
          }
          
          setSelectionPlaced(true);
          onChange({ startMinutes: newStart, endMinutes: newEnd });
        }
      }
      
      if (isScrolling) {
        handleScrollEnd();
      }
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
  }, [activeHandle, isScrolling, viewMin, viewSpan, minMinutes, maxMinutes, stepMinutes, onChange]);

  // Generate segments for the visible viewport (with extra buffer for smooth scrolling)
  const segments = useMemo(() => {
    const segs = [];
    // Add buffer segments on each side for smooth entry/exit
    const buffer = stepMinutes * 2;
    const startSegment = Math.floor((viewMin - buffer - minMinutes) / stepMinutes);
    const endSegment = Math.ceil((viewMax + buffer - minMinutes) / stepMinutes);
    
    for (let i = startSegment; i <= endSegment; i++) {
      const minutes = minMinutes + i * stepMinutes;
      if (minutes >= minMinutes && minutes <= maxMinutes) {
        segs.push(minutes);
      }
    }
    return segs;
  }, [viewMin, viewMax, minMinutes, maxMinutes, stepMinutes]);

  // Hour labels
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

  const startPct = hasSelection ? minutesToPct(start) : 0;
  const endPct = hasSelection ? minutesToPct(end) : 0;
  const trackHeight = 120; // Taller for better depth effect

  const initiateHandleDrag = (handle: 'earliest' | 'latest', e: React.PointerEvent) => {
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

  // Calculate depth scale for each segment (very subtle gradual from edges to center)
  const getSegmentScale = (index: number, total: number) => {
    const distFromLeftEdge = index;
    const distFromRightEdge = total - 1 - index;
    const distFromEdge = Math.min(distFromLeftEdge, distFromRightEdge);
    
    // Gradual transition: full height only in center 3-4 bars
    const center = Math.floor(total / 2);
    const barsToCenter = center - 2; // How many bars until we reach the "full height" zone
    
    if (barsToCenter <= 0) return 1; // Edge case: very few bars
    
    // Calculate progress from edge (0) to center zone (1)
    const progress = Math.min(distFromEdge / barsToCenter, 1);
    
    // Scale from 0.94 at edge to 1.0 at center (very subtle 6% range)
    return 0.94 + (progress * 0.06);
  };

  // Handle click to place selection
  const handleTrackClick = (e: React.PointerEvent) => {
    // Don't place selection if we were scrolling/dragging
    if (scrollRef.current?.hasMoved) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const clickedMinutes = roundToStep(viewMin + pct * viewSpan, stepMinutes);

    if (!selectionPlaced) {
      // Place a 2-hour selection centered on click
      const DEFAULT_DURATION = 2 * 60; // 2 hours
      let newStart = clickedMinutes - DEFAULT_DURATION / 2;
      newStart = roundToStep(newStart, stepMinutes);
      let newEnd = newStart + DEFAULT_DURATION;
      
      if (newEnd > maxMinutes) {
        newEnd = maxMinutes;
        newStart = maxMinutes - DEFAULT_DURATION;
      }
      if (newStart < minMinutes) {
        newStart = minMinutes;
        newEnd = minMinutes + DEFAULT_DURATION;
      }
      
      setSelectionPlaced(true);
      onChange({ startMinutes: newStart, endMinutes: newEnd });
    } else {
      // If clicking outside selection, move it
      const isOutsideSelection = clickedMinutes < start || clickedMinutes >= end;
      if (isOutsideSelection) {
        const currentDuration = end - start;
        let newStart = clickedMinutes - currentDuration / 2;
        newStart = roundToStep(newStart, stepMinutes);
        let newEnd = newStart + currentDuration;
        
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
    }
  };

  // Calculate frame position and dimensions
  const frameWidthPct = hasSelection 
    ? ((end - start) / viewSpan) * 100 
    : (2 * 60 / viewSpan) * 100; // 2-hour default
  
  const frameLeftPct = hasSelection
    ? minutesToPct(start)
    : 50 - frameWidthPct / 2; // Centered

  // Time display in the frame
  const frameTimeDisplay = hasSelection
    ? `${formatTimeShort(start)} – ${formatTimeShort(end)}`
    : formatTimeShort(roundToStep(viewCenter, stepMinutes));

  return (
    <div ref={containerRef} className={className}>
      {/* Time Display - shows current browsing time or selected range */}
      <div className="text-center mb-3">
        <div className={`text-xl font-semibold transition-colors duration-200 ${
          hasSelection ? 'text-orange-400' : 'text-white'
        }`}>
          {frameTimeDisplay}
        </div>
      </div>

      {/* Wheel-like Slider */}
      <div className="relative overflow-hidden">
        {/* Hour Labels with indicator dots */}
        <div className="relative h-8 mb-1">
          {hourLabels.map(({ minutes, hour }) => {
            const pct = minutesToPct(minutes);
            const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const meridiem = hour >= 12 ? "PM" : "AM";
            
            // Fade labels at edges
            const distFromCenter = Math.abs(pct - 50);
            const opacity = Math.max(0.3, 1 - (distFromCenter / 50) * 0.7);
            
            return (
              <div
                key={minutes}
                className="absolute -translate-x-1/2 flex flex-col items-center transition-opacity"
                style={{ left: `${pct}%`, opacity }}
              >
                <div className="text-[11px] font-medium text-zinc-500 whitespace-nowrap">
                  {h12} {meridiem}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1" />
              </div>
            );
          })}
        </div>

        {/* Track Container */}
        <div className="relative" style={{ height: trackHeight }}>
          {/* Segment track */}
          <div
            ref={trackRef}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => {
              // Check if near selection edges (only if selection exists)
              if (selectionPlaced) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const startPx = (startPct / 100) * rect.width;
                const endPx = (endPct / 100) * rect.width;
                const handleWidth = 20; // Touch target for edges
                
                const isNearStart = x >= startPx - handleWidth && x <= startPx + handleWidth;
                const isNearEnd = x >= endPx - handleWidth && x <= endPx + handleWidth;
                
                if (isNearStart) {
                  initiateHandleDrag('earliest', e);
                  return;
                } else if (isNearEnd) {
                  initiateHandleDrag('latest', e);
                  return;
                }
              }
              
              // Default: start scroll/pan (works everywhere else)
              handleScrollStart(e.clientX);
            }}
            onClick={(e) => {
              // Handle click to place selection (fallback for quick taps)
              if (!selectionPlaced) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const pct = x / rect.width;
                const clickedMinutes = roundToStep(viewMin + pct * viewSpan, stepMinutes);
                
                // Place a 2-hour selection
                const DEFAULT_DURATION = 2 * 60;
                let newStart = clickedMinutes - DEFAULT_DURATION / 2;
                newStart = roundToStep(newStart, stepMinutes);
                let newEnd = newStart + DEFAULT_DURATION;
                
                if (newEnd > maxMinutes) {
                  newEnd = maxMinutes;
                  newStart = maxMinutes - DEFAULT_DURATION;
                }
                if (newStart < minMinutes) {
                  newStart = minMinutes;
                  newEnd = minMinutes + DEFAULT_DURATION;
                }
                
                setSelectionPlaced(true);
                onChange({ startMinutes: newStart, endMinutes: newEnd });
              }
            }}
          >
            {/* Absolutely positioned segments for smooth scrolling */}
            <div className="absolute inset-0 flex items-center">
              {segments.map((segmentMinutes) => {
                const leftPct = minutesToPct(segmentMinutes);
                const widthPct = (stepMinutes / viewSpan) * 100;
                
                // Calculate depth scale based on position in viewport (wheel curve)
                const distFromCenter = Math.abs(leftPct + widthPct / 2 - 50);
                const maxDist = 50;
                const normalizedDist = Math.min(distFromCenter / maxDist, 1);
                const progress = Math.cos(normalizedDist * Math.PI / 2);
                const scale = 0.94 + (progress * 0.06);
                const height = trackHeight * scale;
                
                // Skip segments outside visible area
                if (leftPct < -10 || leftPct > 110) return null;
                
                // Check if segment is inside the frame zone
                const isInFrame = hasSelection
                  ? segmentMinutes >= start && segmentMinutes < end
                  : leftPct >= (50 - (2 * 60 / viewSpan) * 50) && leftPct < (50 + (2 * 60 / viewSpan) * 50);
                
                const baseOpacity = 0.3 + scale * 0.7;
                
                return (
                  <div
                    key={segmentMinutes}
                    className="absolute rounded-sm bg-zinc-800"
                    style={{ 
                      left: `${leftPct}%`,
                      width: `calc(${widthPct}% - 2px)`,
                      height: `${height}px`,
                      opacity: baseOpacity,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Selection Frame - always visible, transforms from preview to selection */}
          <div 
            className="absolute top-0 bottom-0 pointer-events-none z-10 transition-all duration-200"
            style={{ 
              left: `${frameLeftPct}%`,
              width: `${frameWidthPct}%`,
            }}
          >
            {/* Frame with fill */}
            <div 
              className={`w-full h-full rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                hasSelection 
                  ? 'border-orange-500 bg-orange-500/90' 
                  : 'border-zinc-500/60 bg-zinc-800/30'
              }`}
            />
          </div>

          {/* Edge fade overlays - matches drawer bg #191919 */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#191919] to-transparent pointer-events-none z-30" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#191919] to-transparent pointer-events-none z-30" />

          {/* Selection handles (only when selection exists) */}
          {hasSelection && (
            <>
              {/* Left edge handle */}
              <div
                className="absolute top-0 bottom-0 z-20 cursor-ew-resize touch-none"
                style={{ 
                  left: `${startPct}%`,
                  width: 24,
                }}
                onPointerDown={(e) => initiateHandleDrag('earliest', e)}
              />

              {/* Right edge handle */}
              <div
                className="absolute top-0 bottom-0 z-20 cursor-ew-resize touch-none"
                style={{ 
                  left: `${endPct}%`,
                  width: 24,
                  transform: 'translateX(-100%)',
                }}
                onPointerDown={(e) => initiateHandleDrag('latest', e)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function formatTime(minutesFromMidnight: number) {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  return `${h12}:${m.toString().padStart(2, "0")} ${meridiem}`;
}

// Shorter format: "6 PM" for on-the-hour, "6:15 PM" otherwise
function formatTimeShort(minutesFromMidnight: number) {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  if (m === 0) {
    return `${h12} ${meridiem}`;
  }
  return `${h12}:${m.toString().padStart(2, "0")} ${meridiem}`;
}

