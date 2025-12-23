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
 * TimeWindowSlider v5
 *
 * Visual clock of dots around a ring.
 * - Drag the ring or handles to set earliest/latest
 * - Dots highlight the selected arc; hour labels around the ring
 * - Clear badges near handles plus a center readout
 */
export const TimeWindowSliderV5: React.FC<Props> = ({
  minMinutes,
  maxMinutes,
  startMinutes,
  endMinutes,
  onChange,
  stepMinutes = 15,
  minWindowMinutes = 30,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeHandle, setActiveHandle] = useState<"earliest" | "latest" | null>(null);
  const activePointerIdRef = useRef<number | null>(null);

  // Constrain to a preferred outer window: 5 PM to 10 PM when available
  const effectiveMin = Math.max(minMinutes, 17 * 60);
  const effectiveMax = Math.min(maxMinutes, 22 * 60);

  const start = clamp(startMinutes, effectiveMin, effectiveMax);
  const end = clamp(endMinutes, effectiveMin, effectiveMax);
  const span = effectiveMax - effectiveMin;

  // Semi-circle: left (start) to right (end) across the top
  const startAngle = Math.PI; // left
  const endAngle = 0; // right

  const minutesToAngle = (m: number) => startAngle + ((m - effectiveMin) / span) * (endAngle - startAngle);
  const angleToMinutes = (angle: number) => {
    // normalize angle into [startAngle, endAngle]
    let a = angle;
    while (a < startAngle) a += Math.PI * 2;
    while (a > endAngle) a -= Math.PI * 2;
    const pct = (a - startAngle) / (endAngle - startAngle);
    const minutes = effectiveMin + pct * span;
    return roundToStep(minutes, stepMinutes);
  };

  const polarToCartesian = (angle: number, radius: number) => {
    // Flip Y so positive goes upward (for top semicircle)
    return {
      x: Math.cos(angle) * radius,
      y: -Math.sin(angle) * radius,
    };
  };

  const chooseHandleAtAngle = (angle: number) => {
    const minutes = angleToMinutes(angle);
    const distStart = Math.abs(minutes - start);
    const distEnd = Math.abs(minutes - end);
    return distStart <= distEnd ? "earliest" : "latest";
  };

  const applyDragFromPoint = (clientX: number, clientY: number) => {
    if (!activeHandle || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const angle = Math.atan2(dy, dx);
    const newMinutes = angleToMinutes(angle);

    if (activeHandle === "earliest") {
      const nextStart = clamp(newMinutes, minMinutes, end - (minWindowMinutes || 30));
      onChange({ startMinutes: nextStart, endMinutes: end });
    } else {
      const nextEnd = clamp(newMinutes, start + (minWindowMinutes || 30), maxMinutes);
      onChange({ startMinutes: start, endMinutes: nextEnd });
    }
  };

  // Dots around the ring (use a coarser step for visibility)
  const dotStep = Math.max(stepMinutes, 30);
  const dots = useMemo(() => {
    const list: { minutes: number; angle: number }[] = [];
    for (let m = effectiveMin; m <= effectiveMax; m += dotStep) {
      list.push({ minutes: m, angle: minutesToAngle(m) });
    }
    return list;
  }, [effectiveMin, effectiveMax, dotStep]);

  const startAnglePos = minutesToAngle(start);
  const endAnglePos = minutesToAngle(end);

  // Hour labels (every 1 hour)
  const hourLabels = useMemo(() => {
    const labels: { minutes: number; angle: number }[] = [];
    const startHour = Math.ceil(effectiveMin / 60);
    const endHour = Math.floor(effectiveMax / 60);
    for (let h = startHour; h <= endHour; h++) {
      const m = h * 60;
      labels.push({ minutes: m, angle: minutesToAngle(m) });
    }
    return labels;
  }, [effectiveMin, effectiveMax]);

  return (
    <div className={className}>
      <div className="relative w-full flex justify-center">
        <div
          ref={containerRef}
          className="relative w-[340px] h-[240px] touch-none select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            activePointerIdRef.current = e.pointerId;
            containerRef.current?.setPointerCapture(e.pointerId);

            const rect = containerRef.current.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const angle = Math.atan2(dy, dx);
            const handle = chooseHandleAtAngle(angle);
            setActiveHandle(handle);
            applyDragFromPoint(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (activePointerIdRef.current !== e.pointerId) return;
            applyDragFromPoint(e.clientX, e.clientY);
          }}
          onPointerUp={(e) => {
            if (activePointerIdRef.current !== e.pointerId) return;
            activePointerIdRef.current = null;
            setActiveHandle(null);
            containerRef.current?.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={(e) => {
            if (activePointerIdRef.current !== e.pointerId) return;
            activePointerIdRef.current = null;
            setActiveHandle(null);
            containerRef.current?.releasePointerCapture(e.pointerId);
          }}
        >
          {/* Ring dots */}
          <div className="absolute inset-0">
            {dots.map(({ minutes, angle }, idx) => {
              const pos = polarToCartesian(angle, 115);
              const inRange =
                start <= end
                  ? minutes >= start && minutes <= end
                  : minutes >= start || minutes <= end; // wrap case (unlikely with current constraints)
              return (
                <div
                  key={idx}
                  className={`absolute w-5 h-5 rounded-full ${
                    inRange ? "bg-orange-500" : "bg-orange-500/18"
                  }`}
                  style={{
                    left: `calc(50% + ${pos.x}px - 10px)`,
                    top: `calc(200px + ${pos.y}px - 10px)`,
                  }}
                />
              );
            })}
          </div>

          {/* Arc highlight + hour labels */}
          <svg className="absolute inset-0" viewBox="0 0 340 240">
            <circle
              cx="170"
              cy="200"
              r="125"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="16"
              fill="none"
            />
            <path
              d={describeArc(170, 200, 125, startAnglePos, endAnglePos)}
              stroke="rgba(255,255,255,0.42)"
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
            />
            {hourLabels.map(({ minutes, angle }, idx) => {
              const pos = polarToCartesian(angle, 145);
              const h24 = Math.floor(minutes / 60);
              const meridiem = h24 >= 12 ? "PM" : "AM";
              const h12 = ((h24 + 11) % 12) + 1;
              return (
                <text
                  key={idx}
                  x={170 + pos.x}
                  y={200 + pos.y - 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(255,255,255,0.85)"
                  fontSize="12"
                  fontWeight={700}
                >
                  {h12}
                  <tspan fontSize="9" dx="2" fill="rgba(255,255,255,0.7)">{meridiem}</tspan>
                </text>
              );
            })}
          </svg>

          {/* Handles */}
          {[{ angle: startAnglePos, label: "Earliest", value: formatTime(start) }, { angle: endAnglePos, label: "Latest", value: formatTime(end) }].map(
            ({ angle, label }, idx) => {
              const pos = polarToCartesian(angle, 125);
              return (
                <div
                  key={label}
                  className="absolute w-11 h-11 rounded-full bg-white shadow-lg border border-black/10 flex items-center justify-center"
                  style={{
                    left: `calc(50% + ${pos.x}px - 20px)`,
                    top: `calc(200px + ${pos.y}px - 20px)`,
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    activePointerIdRef.current = e.pointerId;
                    containerRef.current?.setPointerCapture(e.pointerId);
                    setActiveHandle(idx === 0 ? "earliest" : "latest");
                  }}
                  onPointerMove={(e) => {
                    if (activePointerIdRef.current !== e.pointerId) return;
                    applyDragFromPoint(e.clientX, e.clientY);
                  }}
                  onPointerUp={(e) => {
                    if (activePointerIdRef.current !== e.pointerId) return;
                    activePointerIdRef.current = null;
                    setActiveHandle(null);
                    containerRef.current?.releasePointerCapture(e.pointerId);
                  }}
                  onPointerCancel={(e) => {
                    if (activePointerIdRef.current !== e.pointerId) return;
                    activePointerIdRef.current = null;
                    setActiveHandle(null);
                    containerRef.current?.releasePointerCapture(e.pointerId);
                  }}
                  aria-label={label}
                >
                  <div className="w-2 h-2 rounded-full bg-black" />
                  <div className="absolute left-1/2 -translate-x-1/2 top-12 px-2 py-1 rounded-md bg-black/75 border border-white/10 text-[11px] font-semibold text-white whitespace-nowrap shadow-lg">
                    {idx === 0 ? formatTime(start) : formatTime(end)}
                  </div>
                </div>
              );
            }
          )}

          {/* Center readout */}
          <div className="absolute left-1/2 top-[78%] -translate-x-1/2 -translate-y-1/2 text-center space-y-1">
            <div className="text-xs font-semibold text-white/75 tracking-wide">Available</div>
            <div className="text-lg font-semibold text-white">{formatTime(start)}</div>
            <div className="text-sm font-semibold text-white/80">to</div>
            <div className="text-lg font-semibold text-white">{formatTime(end)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility to create arc path between two angles (radians)
function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const startXY = {
    x: cx + r * Math.cos(start),
    y: cy - r * Math.sin(start),
  };
  const endXY = {
    x: cx + r * Math.cos(end),
    y: cy - r * Math.sin(end),
  };
  const delta = end - start;
  const largeArcFlag = Math.abs(delta) <= Math.PI ? 0 : 1;
  return `M ${startXY.x} ${startXY.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${endXY.x} ${endXY.y}`;
}

