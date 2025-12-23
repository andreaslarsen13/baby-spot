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

function formatHour(minutesFromMidnight: number) {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const h12 = ((h24 + 11) % 12) + 1;
  return `${h12}`;
}

/**
 * TimeWindowSlider v6
 *
 * Abstract dot matrix: 5 PM – 10 PM, 15-minute granularity
 * - 4 rows × 5 columns = 20 dots (each dot = 15 min slot)
 * - Drag to select range; dots fill for selected times
 * - Time markers on left and right edges
 */
export const TimeWindowSliderV6: React.FC<Props> = ({
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

  // Fixed 5 PM – 10 PM range
  const fixedMin = 17 * 60; // 5:00 PM
  const fixedMax = 22 * 60; // 10:00 PM

  const dotSize = 52;
  const gap = 10;
  const rows = 4;
  const cols = 5;
  const totalDots = rows * cols; // 20 dots
  const slotDuration = 15; // minutes per dot

  const start = clamp(roundToStep(startMinutes, stepMinutes), fixedMin, fixedMax);
  const end = clamp(roundToStep(endMinutes, stepMinutes), fixedMin, fixedMax);

  // Each dot represents a 15-min slot; dot 0 = 5:00 PM, dot 19 = 9:45 PM (ends at 10:00 PM)
  const dots = useMemo(() => {
    const list: Array<{ idx: number; minutes: number; row: number; col: number }> = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const minutes = fixedMin + idx * slotDuration;
        list.push({ idx, minutes, row: r, col: c });
      }
    }
    return list;
  }, [rows, cols, fixedMin, slotDuration]);

  // Row time markers (left side) - first dot of each row
  const rowMarkers = useMemo(() => {
    const markers: Array<{ row: number; minutes: number }> = [];
    for (let r = 0; r < rows; r++) {
      const minutes = fixedMin + r * cols * slotDuration;
      markers.push({ row: r, minutes });
    }
    return markers;
  }, [rows, cols, fixedMin, slotDuration]);

  const nearestHandle = (minutes: number) => {
    const distStart = Math.abs(minutes - start);
    const distEnd = Math.abs(minutes - end);
    return distStart <= distEnd ? "earliest" : "latest";
  };

  const setByMinutes = (handle: "earliest" | "latest", minutes: number) => {
    const m = clamp(roundToStep(minutes, stepMinutes), fixedMin, fixedMax);
    if (handle === "earliest") {
      const nextStart = clamp(m, fixedMin, end - minWindowMinutes);
      onChange({ startMinutes: nextStart, endMinutes: end });
    } else {
      const nextEnd = clamp(m, start + minWindowMinutes, fixedMax);
      onChange({ startMinutes: start, endMinutes: nextEnd });
    }
  };

  const positionToMinutes = (clientX: number, clientY: number) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    // Map to closest dot index
    let closestIdx = 0;
    let closestDist = Infinity;
    dots.forEach((d) => {
      const x = d.col * (dotSize + gap) + dotSize / 2;
      const y = d.row * (dotSize + gap) + dotSize / 2;
      const dx = relX - x;
      const dy = relY - y;
      const dist = dx * dx + dy * dy;
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = d.idx;
      }
    });
    return fixedMin + closestIdx * slotDuration;
  };

  const handlePointer = (clientX: number, clientY: number) => {
    if (!containerRef.current || !activeHandle) return;
    const minutes = positionToMinutes(clientX, clientY);
    if (minutes !== null) {
      setByMinutes(activeHandle, minutes);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const minutes = positionToMinutes(e.clientX, e.clientY);
    if (minutes === null) return;
    activePointerIdRef.current = e.pointerId;
    containerRef.current?.setPointerCapture(e.pointerId);
    const handle = nearestHandle(minutes);
    setActiveHandle(handle);
    setByMinutes(handle, minutes);
  };

  const gridWidth = cols * dotSize + (cols - 1) * gap;
  const gridHeight = rows * dotSize + (rows - 1) * gap;

  return (
    <div className={className}>
      <div className="flex justify-center">
        <div className="flex items-start gap-4">
          {/* Left time markers */}
          <div
            className="relative flex flex-col justify-between text-right text-[12px] font-semibold text-white/60"
            style={{ height: gridHeight }}
          >
            {rowMarkers.map(({ row, minutes }) => (
              <div
                key={row}
                className="leading-none"
                style={{ height: dotSize, display: "flex", alignItems: "center" }}
              >
                {formatHour(minutes)}
                <span className="text-[9px] ml-0.5 opacity-70">PM</span>
              </div>
            ))}
          </div>

          {/* Dot matrix */}
          <div
            ref={containerRef}
            className="relative rounded-3xl touch-none select-none"
            style={{
              width: gridWidth,
              height: gridHeight,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={(e) => {
              if (activeHandle === null) return;
              if (activePointerIdRef.current !== null && activePointerIdRef.current !== e.pointerId) return;
              handlePointer(e.clientX, e.clientY);
            }}
            onPointerUp={(e) => {
              if (activePointerIdRef.current !== null && activePointerIdRef.current !== e.pointerId) return;
              activePointerIdRef.current = null;
              setActiveHandle(null);
              containerRef.current?.releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={(e) => {
              if (activePointerIdRef.current !== null && activePointerIdRef.current !== e.pointerId) return;
              activePointerIdRef.current = null;
              setActiveHandle(null);
              containerRef.current?.releasePointerCapture(e.pointerId);
            }}
          >
            {dots.map(({ idx, row, col, minutes }) => {
              const inRange = minutes >= start && minutes < end;
              return (
                <div
                  key={idx}
                  className="absolute rounded-full transition-colors duration-100"
                  style={{
                    width: dotSize,
                    height: dotSize,
                    left: col * (dotSize + gap),
                    top: row * (dotSize + gap),
                    background: inRange ? "#FE3400" : "#252525",
                  }}
                />
              );
            })}
          </div>

          {/* Right time markers (end of each row) */}
          <div
            className="relative flex flex-col justify-between text-left text-[12px] font-semibold text-white/60"
            style={{ height: gridHeight }}
          >
            {rowMarkers.map(({ row, minutes }) => {
              const endOfRowMinutes = minutes + (cols - 1) * slotDuration + slotDuration; // +15 for end of slot
              return (
                <div
                  key={row}
                  className="leading-none"
                  style={{ height: dotSize, display: "flex", alignItems: "center" }}
                >
                  {formatHour(endOfRowMinutes)}
                  <span className="text-[9px] ml-0.5 opacity-70">PM</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected range display */}
      <div className="mt-6 flex justify-center">
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-900/60 border border-white/10 text-base font-semibold text-white">
          <span>{formatTime(start)}</span>
          <span className="text-white/50">→</span>
          <span>{formatTime(end)}</span>
        </div>
      </div>
    </div>
  );
};
