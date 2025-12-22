import React, { useMemo, useRef, useState } from "react";

type Handle = "start" | "end" | null;

type Props = {
  minMinutes: number; // inclusive
  maxMinutes: number; // inclusive
  startMinutes: number;
  endMinutes: number;
  onChange: (next: { startMinutes: number; endMinutes: number }) => void;
  stepMinutes?: number; // snapping
  minRangeMinutes?: number;
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

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  // angles in radians, top semicircle: [0..pi]
  const sx = cx + r * Math.cos(startAngle);
  const sy = cy - r * Math.sin(startAngle);
  const ex = cx + r * Math.cos(endAngle);
  const ey = cy - r * Math.sin(endAngle);
  const largeArcFlag = 0;
  const sweepFlag = startAngle > endAngle ? 0 : 1;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${ex} ${ey}`;
}

export const TimeRangeArc: React.FC<Props> = ({
  minMinutes,
  maxMinutes,
  startMinutes,
  endMinutes,
  onChange,
  stepMinutes = 15,
  minRangeMinutes = 30,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<Handle>(null);

  const min = minMinutes;
  const max = maxMinutes;

  const start = clamp(startMinutes, min, max);
  const end = clamp(endMinutes, min, max);

  const toAngle = (m: number) => {
    const t = (m - min) / (max - min); // 0..1
    return Math.PI * (1 - t); // left(pi) -> right(0)
  };

  const toMinutes = (angle: number) => {
    const a = clamp(angle, 0, Math.PI);
    const t = (Math.PI - a) / Math.PI;
    return min + t * (max - min);
  };

  const { startAngle, endAngle, durationLabel } = useMemo(() => {
    const sA = toAngle(start);
    const eA = toAngle(end);
    const dur = Math.max(0, end - start);
    const h = Math.floor(dur / 60);
    const mm = dur % 60;
    const label = h > 0 ? `${h}h${mm ? ` ${mm}m` : ""}` : `${mm}m`;
    return { startAngle: sA, endAngle: eA, durationLabel: label };
  }, [start, end]);

  const onPointer = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // layout geometry
    const cx = rect.width / 2;
    const cy = rect.width / 2; // keep semicircle proportional (height handled by container)
    const r = rect.width * 0.42;

    // compute angle on top semicircle
    const dx = x - cx;
    const dy = cy - y; // inverted y for math coords
    let angle = Math.atan2(dy, dx); // [-pi..pi]
    angle = clamp(angle, 0, Math.PI);

    const minutesRaw = toMinutes(angle);
    const minutes = clamp(roundToStep(minutesRaw, stepMinutes), min, max);

    if (active === "start") {
      const nextStart = Math.min(minutes, end - minRangeMinutes);
      onChange({ startMinutes: clamp(nextStart, min, max), endMinutes: end });
    } else if (active === "end") {
      const nextEnd = Math.max(minutes, start + minRangeMinutes);
      onChange({ startMinutes: start, endMinutes: clamp(nextEnd, min, max) });
    }
  };

  const pickClosestHandle = (clientX: number, clientY: number) => {
    if (!containerRef.current) return "start" as Handle;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const cx = rect.width / 2;
    const cy = rect.width / 2;
    const r = rect.width * 0.42;
    const handlePoint = (angle: number) => ({
      x: cx + r * Math.cos(angle),
      y: cy - r * Math.sin(angle),
    });
    const s = handlePoint(startAngle);
    const e = handlePoint(endAngle);
    const ds = (x - s.x) ** 2 + (y - s.y) ** 2;
    const de = (x - e.x) ** 2 + (y - e.y) ** 2;
    return ds <= de ? ("start" as const) : ("end" as const);
  };

  const header = `${formatTime(start)} – ${formatTime(end)}`;

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between px-1">
        <div className="text-[16px] font-semibold text-zinc-100">{header}</div>
        <div className="text-[12px] font-semibold text-zinc-500">{durationLabel}</div>
      </div>

      <div
        ref={containerRef}
        className="mt-4 relative w-full select-none touch-none"
        style={{ height: 220 }}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          const chosen = pickClosestHandle(e.clientX, e.clientY);
          setActive(chosen);
          onPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (!active) return;
          onPointer(e.clientX, e.clientY);
        }}
        onPointerUp={() => setActive(null)}
        onPointerCancel={() => setActive(null)}
      >
        {/* Background guide */}
        <div className="absolute inset-0 rounded-[28px] bg-zinc-900/40 border border-zinc-800" />

        <svg className="absolute inset-0" viewBox="0 0 300 220" preserveAspectRatio="none">
          {/* base arc */}
          <path
            d={describeArc(150, 150, 125, Math.PI, 0)}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* selected arc */}
          <path
            d={describeArc(150, 150, 125, startAngle, endAngle)}
            fill="none"
            stroke="rgba(254,52,0,0.28)"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* handles */}
          {(() => {
            const cx = 150;
            const cy = 150;
            const r = 125;
            const sx = cx + r * Math.cos(startAngle);
            const sy = cy - r * Math.sin(startAngle);
            const ex = cx + r * Math.cos(endAngle);
            const ey = cy - r * Math.sin(endAngle);
            return (
              <>
                <circle cx={sx} cy={sy} r="10" fill="rgba(25,25,25,1)" stroke="rgba(255,255,255,0.20)" strokeWidth="2" />
                <circle cx={sx} cy={sy} r="4" fill="rgba(254,52,0,0.9)" />

                <circle cx={ex} cy={ey} r="10" fill="rgba(25,25,25,1)" stroke="rgba(255,255,255,0.20)" strokeWidth="2" />
                <circle cx={ex} cy={ey} r="4" fill="rgba(254,52,0,0.9)" />
              </>
            );
          })()}

          {/* endpoint labels */}
          <text x="22" y="170" fill="rgba(255,255,255,0.35)" fontSize="12" fontWeight="700">
            {formatTime(minMinutes)}
          </text>
          <text x="238" y="170" fill="rgba(255,255,255,0.35)" fontSize="12" fontWeight="700">
            {formatTime(maxMinutes)}
          </text>
        </svg>
      </div>
    </div>
  );
};


