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
  // Mode: which drawer we're in
  mode: 'earliest' | 'latest';
  // For 'latest' mode: the earliest time already selected
  earliestTime?: number;
  // Called when user taps to select
  onTimeSelect: (minutes: number) => void;
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
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  if (m === 0) {
    return `${h12} ${meridiem}`;
  }
  return `${h12}:${m.toString().padStart(2, "0")} ${meridiem}`;
}

/**
 * TimeWindowSlider v10
 *
 * Two-drawer flow for time range selection:
 * - Drawer 1 (mode='earliest'): Select earliest time, animates to left edge
 * - Drawer 2 (mode='latest'): Earliest visible at left, select latest
 */
export const TimeWindowSliderV10: React.FC<Props> = ({
  minMinutes,
  maxMinutes,
  startMinutes,
  endMinutes,
  onChange,
  stepMinutes = 15,
  minWindowMinutes = 30,
  className,
  mode,
  earliestTime,
  onTimeSelect,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport state
  const VIEWPORT_WIDTH = 6 * 60; // 6 hours visible
  const GHOST_WIDTH = 80; // ghost selection width (slightly wider for text)

  // Selected time (for showing orange before transition)
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [isAnimatingToLeft, setIsAnimatingToLeft] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0); // 0 to 1

  // Initialize viewCenter based on mode
  const [viewCenter, setViewCenter] = useState(() => {
    if (mode === 'latest' && earliestTime) {
      // Start with earliest fully visible at left (offset by ghost width so it's not cut off)
      return earliestTime + VIEWPORT_WIDTH * 0.5 + GHOST_WIDTH / 2;
    }
    return 18 * 60; // Default 6 PM
  });

  // Scroll state
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollRef = useRef<{
    startX: number;
    startCenter: number;
    hasMoved: boolean;
    lastX: number;
    lastTime: number;
    velocity: number;
    totalDistance: number;
    startTime: number;
  } | null>(null);
  const momentumRef = useRef<number | null>(null);

  // Calculate viewport bounds
  const viewMin = clamp(viewCenter - VIEWPORT_WIDTH / 2, minMinutes, maxMinutes - VIEWPORT_WIDTH);
  const viewMax = viewMin + VIEWPORT_WIDTH;
  const viewSpan = VIEWPORT_WIDTH;

  // The time at center (what user is looking at)
  const centerTime = roundToStep(viewCenter, stepMinutes);

  // For latest mode, minimum selectable time is after earliest
  const minSelectableTime = mode === 'latest' && earliestTime
    ? earliestTime + minWindowMinutes
    : minMinutes;

  const minutesToPct = (minutes: number) => {
    return ((minutes - viewMin) / viewSpan) * 100;
  };

  const panViewport = (newCenter: number) => {
    // In latest mode, don't allow scrolling before earliest
    let minCenter = minMinutes + VIEWPORT_WIDTH / 2;
    if (mode === 'latest' && earliestTime) {
      // Keep earliest fully visible at left edge (offset by ghost width)
      minCenter = earliestTime + VIEWPORT_WIDTH / 2 + GHOST_WIDTH / 2;
    }
    const clampedCenter = clamp(newCenter, minCenter, maxMinutes - VIEWPORT_WIDTH / 2);
    setViewCenter(clampedCenter);
  };

  // Handle scroll/pan
  const handleScrollStart = (clientX: number) => {
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
      totalDistance: 0,
      startTime: Date.now(),
    };
  };

  const handleScrollMove = (clientX: number) => {
    if (!scrollRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const deltaX = scrollRef.current.startX - clientX;

    scrollRef.current.totalDistance += Math.abs(clientX - scrollRef.current.lastX);

    if (Math.abs(deltaX) > 5) {
      scrollRef.current.hasMoved = true;
    }

    const now = Date.now();
    const dt = now - scrollRef.current.lastTime;
    if (dt > 0) {
      const dx = clientX - scrollRef.current.lastX;
      scrollRef.current.velocity = scrollRef.current.velocity * 0.5 + (dx / dt) * 0.5;
    }
    scrollRef.current.lastX = clientX;
    scrollRef.current.lastTime = now;

    const deltaPct = deltaX / rect.width;
    const deltaMinutes = deltaPct * viewSpan;
    panViewport(scrollRef.current.startCenter + deltaMinutes);
  };

  const handleScrollEnd = () => {
    if (!scrollRef.current || !trackRef.current) {
      setIsScrolling(false);
      return;
    }

    const rect = trackRef.current.getBoundingClientRect();
    const elapsed = Date.now() - scrollRef.current.startTime;
    const avgSpeed = scrollRef.current.totalDistance / elapsed;
    const hasMoved = scrollRef.current.hasMoved;

    // If didn't move much, this is a tap to select
    if (!hasMoved) {
      handleTapSelect();
      setIsScrolling(false);
      scrollRef.current = null;
      return;
    }

    // Apply momentum for fast swipes
    const isFastSwipe = avgSpeed > 0.3 && Math.abs(scrollRef.current.velocity) > 0.15;

    if (isFastSwipe) {
      let velocity = scrollRef.current.velocity;
      const friction = 0.95;

      const animate = () => {
        velocity *= friction;
        const deltaMinutes = -(velocity * 16) / rect.width * viewSpan;

        // Calculate min center for latest mode
        let minCenter = minMinutes + VIEWPORT_WIDTH / 2;
        if (mode === 'latest' && earliestTime) {
          minCenter = earliestTime + VIEWPORT_WIDTH / 2 + GHOST_WIDTH / 2;
        }

        setViewCenter(prev => clamp(prev + deltaMinutes, minCenter, maxMinutes - VIEWPORT_WIDTH / 2));

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

  const handleTapSelect = () => {
    const selected = centerTime;

    // Check if valid selection
    if (selected >= minSelectableTime && selected <= maxMinutes) {
      setSelectedTime(selected);

      if (mode === 'earliest') {
        // Animate to left edge, then call onTimeSelect
        setTimeout(() => {
          setIsAnimatingToLeft(true);
          const duration = 400;
          const startTime = Date.now();
          const startCenter = viewCenter;
          // Target: selected time at left edge (0% position)
          const targetCenter = selected + VIEWPORT_WIDTH / 2;

          const animateToLeft = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimationProgress(eased);

            // Pan viewport so selected slides to left
            const newCenter = startCenter + (targetCenter - startCenter) * eased;
            setViewCenter(clamp(newCenter, minMinutes + VIEWPORT_WIDTH / 2, maxMinutes - VIEWPORT_WIDTH / 2));

            if (progress < 1) {
              requestAnimationFrame(animateToLeft);
            } else {
              // Animation complete, trigger transition to next drawer
              setTimeout(() => {
                onTimeSelect(selected);
              }, 100);
            }
          };

          requestAnimationFrame(animateToLeft);
        }, 250);
      } else {
        // Latest mode: just select and advance
        setTimeout(() => {
          onTimeSelect(selected);
        }, 300);
      }
    }
  };

  // Global pointer event handlers
  useEffect(() => {
    if (!isScrolling) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      handleScrollMove(e.clientX);
    };

    const handlePointerUp = () => {
      handleScrollEnd();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isScrolling, mode, earliestTime]);

  // Generate segments
  const segments = useMemo(() => {
    const segs = [];
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
    const minHour = Math.floor((viewMin - 60) / 60);
    const maxHour = Math.ceil((viewMax + 60) / 60);

    for (let hour = minHour; hour <= maxHour; hour++) {
      const minutes = hour * 60;
      if (minutes >= minMinutes && minutes <= maxMinutes) {
        labels.push(minutes);
      }
    }
    return labels;
  }, [viewMin, viewMax, minMinutes, maxMinutes]);

  // Track height - 50% taller
  const trackHeight = 150;

  // Ghost selection position (centered)
  const ghostWidthPct = (GHOST_WIDTH / viewSpan) * 100;
  const ghostLeftPct = 50 - ghostWidthPct / 2;

  // Check if center time is valid for selection
  const isValidSelection = centerTime >= minSelectableTime && centerTime <= maxMinutes;

  // Calculate selected time position during animation
  const selectedPct = selectedTime !== null ? minutesToPct(selectedTime) : 50;

  // Earliest time position (for latest mode)
  const earliestPct = earliestTime !== null ? minutesToPct(earliestTime) : 0;

  // Show left fade only in earliest mode and not animating
  const showLeftFade = mode === 'earliest' && !isAnimatingToLeft && !selectedTime;

  return (
    <div ref={containerRef} className={className}>
      {/* Wheel Track */}
      <div className="relative overflow-hidden">
        {/* Hour labels */}
        <div className="relative h-6 mb-1">
          {hourLabels.map((minutes) => {
            const pct = minutesToPct(minutes);
            if (pct < -10 || pct > 110) return null;

            const distFromCenter = Math.abs(pct - 50);
            const opacity = Math.max(0.15, 1 - (distFromCenter / 50) * 0.85);

            const h24 = Math.floor(minutes / 60);
            const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
            const meridiem = h24 >= 12 ? "PM" : "AM";

            return (
              <div
                key={minutes}
                className="absolute -translate-x-1/2"
                style={{ left: `${pct}%`, opacity }}
              >
                <div className="text-[12px] font-medium text-zinc-300 whitespace-nowrap">
                  {h12} {meridiem}
                </div>
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
              if (!selectedTime) {
                handleScrollStart(e.clientX);
              }
            }}
          >
            {/* Segment bars */}
            <div className="absolute inset-0 flex items-center">
              {segments.map((segmentMinutes) => {
                const leftPct = minutesToPct(segmentMinutes);
                const widthPct = (stepMinutes / viewSpan) * 100;

                const distFromCenter = Math.abs(leftPct + widthPct / 2 - 50);
                const maxDist = 50;
                const normalizedDist = Math.min(distFromCenter / maxDist, 1);
                const progress = Math.cos(normalizedDist * Math.PI / 2);
                const scale = 0.97 + (progress * 0.03);
                const height = trackHeight * scale;

                if (leftPct < -10 || leftPct > 110) return null;

                const baseOpacity = 0.12 + progress * 0.2;

                return (
                  <div
                    key={segmentMinutes}
                    className="absolute rounded-[3px] bg-zinc-600"
                    style={{
                      left: `${leftPct}%`,
                      width: `calc(${widthPct}% - 3px)`,
                      height: `${height}px`,
                      opacity: baseOpacity,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Earliest time marker (visible in latest mode) */}
          {mode === 'latest' && earliestTime !== null && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-40"
              style={{
                left: `${earliestPct - ghostWidthPct / 2}%`,
                width: `${ghostWidthPct}%`,
              }}
            >
              <div className="w-full h-full rounded-xl bg-orange-500/70 border-2 border-orange-400 flex items-center justify-center">
                <span className="text-xl font-semibold text-white tracking-tight">
                  {formatTime(earliestTime)}
                </span>
              </div>
            </div>
          )}

          {/* Selected time (orange) - shown when tapped in earliest mode */}
          {mode === 'earliest' && selectedTime !== null && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-40"
              style={{
                left: `${selectedPct - ghostWidthPct / 2}%`,
                width: `${ghostWidthPct}%`,
              }}
            >
              <div className="w-full h-full rounded-xl bg-orange-500/70 border-2 border-orange-400 flex items-center justify-center">
                <span className="text-xl font-semibold text-white tracking-tight">
                  {formatTime(selectedTime)}
                </span>
              </div>
            </div>
          )}

          {/* Ghost selection at center (when not selected) */}
          {!selectedTime && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-10 flex items-center"
              style={{
                left: `${ghostLeftPct}%`,
                width: `${ghostWidthPct}%`,
              }}
            >
              <div className={`w-full h-full rounded-xl flex items-center justify-center transition-colors duration-150 ${
                isValidSelection
                  ? 'bg-zinc-600/50 border-2 border-zinc-400/60'
                  : 'bg-zinc-700/30 border-2 border-zinc-600/40'
              }`}>
                <span className={`text-sm font-medium whitespace-nowrap ${isValidSelection ? 'text-white' : 'text-zinc-500'}`}>
                  {formatTime(centerTime)}
                </span>
              </div>
            </div>
          )}

          {/* Edge fade overlays */}
          {showLeftFade && (
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#191919] via-[#191919]/80 to-transparent pointer-events-none z-30" />
          )}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#191919] via-[#191919]/80 to-transparent pointer-events-none z-30" />
        </div>
      </div>

      {/* Bottom hint text */}
      <div className="text-center mt-4">
        <span className="text-sm text-zinc-400">
          scroll to browse, tap to select
        </span>
      </div>
    </div>
  );
};

export default TimeWindowSliderV10;
