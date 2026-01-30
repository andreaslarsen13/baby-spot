import { useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { interpolate } from 'flubber';

const FG = '#F0C4F0';
const BG = '#FF4500';

// ─── UTILITIES ──────────────────────────────────────────────────────────────────

// CCW ellipse polygon starting near top (matches chair path winding)
function ellipseToPath(cx: number, cy: number, rx: number, ry: number, rotDeg: number, n = 64): string {
  const rad = (rotDeg * Math.PI) / 180;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    // Counter-clockwise in SVG coords, starting at top
    const a = (3 * Math.PI) / 2 - (i / n) * 2 * Math.PI;
    const px = rx * Math.cos(a);
    const py = ry * Math.sin(a);
    const x = cx + px * Math.cos(rad) - py * Math.sin(rad);
    const y = cy + px * Math.sin(rad) + py * Math.cos(rad);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `M${pts[0]}L${pts.slice(1).join('L')}Z`;
}

function translatePath(d: string, dx: number, dy: number): string {
  const cmds = d.match(/[MCLQZmclqz][^MCLQZmclqz]*/g) || [];
  return cmds
    .map((cmd) => {
      const type = cmd[0];
      if (type === 'Z' || type === 'z') return cmd;
      const nums = cmd.slice(1).match(/-?\d+\.?\d*(e[+-]?\d+)?/gi) || [];
      const t = nums.map((n, i) => {
        const v = parseFloat(n);
        return (i % 2 === 0 ? v + dx : v + dy).toFixed(4);
      });
      return type + t.join(' ');
    })
    .join('');
}

// ─── KEYFRAME SHAPES (300×350 coordinate space) ─────────────────────────────────
//
// ALL paths are counter-clockwise (matching the chair's winding direction).
// Path direction: top → left side → bottom (left-to-right) → right side → top.
// Legs appear in left → middle → right order so flubber maps them correctly
// to the chair's left → center → right legs.
//
// Chair leg positions (translated, x-centers): ~62, ~122, ~181, ~238
// Intermediate shapes use 3 legs at: ~120, ~180, ~235
// The chair's back-left leg (~62) emerges from the body during final morph.

const SPOT = ellipseToPath(150, 158, 118, 128, 15);

// Organic rounded rectangle — CCW: top → left → bottom → right
const BLOB =
  'M155 42' +
  'C110 46 58 58 48 98' +
  'C38 138 32 192 52 228' +
  'C68 258 115 272 160 275' +
  'C205 278 242 262 252 228' +
  'C262 195 268 138 258 98' +
  'C248 58 200 38 155 42Z';

// Scalloped bottom — bumps at leg x-positions, left → middle → right
const NOTCHED =
  'M155 42' +
  'C110 46 58 58 48 98' +
  'C38 138 32 192 52 228' +
  'C76 248 100 258 112 266' +
  'Q120 290 128 266' +
  'C140 256 160 256 172 266' +
  'Q180 290 188 266' +
  'C198 256 222 256 232 266' +
  'Q235 290 238 266' +
  'C244 262 248 250 252 228' +
  'C262 195 268 138 258 98' +
  'C248 58 200 38 155 42Z';

// Short stubby legs — CCW, left → middle → right
const WEBBED =
  'M155 38' +
  'C112 42 68 50 58 82' +
  'C50 112 56 162 68 198' +
  'C80 218 96 228 112 232' +
  'L114 300 Q120 308 126 300 L128 232' +
  'L172 232 L174 300 Q180 308 186 300 L188 232' +
  'L226 232 L228 300 Q235 308 242 300 L244 232' +
  'C246 226 248 214 250 198' +
  'C254 162 256 112 248 82' +
  'C240 50 200 34 155 38Z';

// Legs differentiate: left longest, middle shortest (matching chair proportions)
const EMERGING =
  'M148 36' +
  'C104 36 64 44 54 76' +
  'C46 106 48 158 64 192' +
  'C74 210 92 222 112 226' +
  'L114 304 Q118 312 122 304 L124 226' +
  'L174 226 L176 272 Q180 280 184 272 L186 226' +
  'L228 226 L230 298 Q234 306 238 298 L240 226' +
  'C240 220 242 210 246 192' +
  'C252 158 254 106 246 76' +
  'C238 44 196 30 148 36Z';

const CHAIR_RAW =
  'M186.784 129.81C186.669 127.422 186.559 125.205 186.45 122.989C186.129 116.475 181.142 110.383 174.219 109.408C165.577 108.191 156.975 106.696 148.27 105.942C147.631 105.886 146.997 105.748 146.364 105.629C143.291 105.051 141.265 103.307 140.637 100.22C140.021 97.1927 139.568 94.1329 139.026 91.0907C137.336 81.6134 135.7 72.126 133.927 62.6642C131.79 51.258 129.549 39.8709 127.321 28.4819C126.3 23.262 124.34 18.3927 121.189 14.0952C116.682 7.94544 110.667 3.90583 103.275 1.8885C99.5212 0.864222 95.6971 0.334274 91.8292 0.190445C83.1533 -0.132189 74.4733 -0.0670238 65.8138 0.556889C56.6957 1.21384 47.6155 2.24184 38.6237 3.94179C31.4836 5.29166 26.6655 9.44759 23.7774 16.0094C21.5623 21.042 20.4252 26.344 20.0213 31.7693C19.1326 43.7049 18.3765 55.6511 17.6567 67.5984C17.0703 77.3313 16.7198 87.079 16.0666 96.807C15.5937 103.85 14.8683 110.879 14.1215 117.9C13.4982 123.76 12.7215 129.605 11.9385 135.448C10.8377 143.661 9.69496 151.869 8.52131 160.072C7.11617 169.893 5.72486 179.717 4.20416 189.521C3.03302 197.071 1.66097 204.59 0.404142 212.127C0.193611 213.39 -0.00450984 214.675 6.36645e-05 215.949C0.00983335 218.677 1.69679 220.427 4.44785 220.593C6.14185 220.695 7.84942 220.697 9.54513 220.619C12.4162 220.487 13.8162 219.236 14.3257 216.445C15.5409 209.786 16.7327 203.123 17.9431 196.464C19.8415 186.018 21.7503 175.575 23.6491 165.129C25.0159 157.611 26.3317 150.083 27.753 142.574C28.4687 138.793 29.3115 135.033 30.2066 131.29C30.7254 129.12 31.6609 127.099 33.1402 125.378C34.6734 123.594 36.5242 122.632 38.8958 123.497C41.5815 124.477 44.2891 125.431 46.8788 126.629C49.6362 127.904 52.2985 129.396 54.9383 130.905C56.1418 131.593 57.2978 132.44 58.2866 133.406C59.8036 134.889 60.4343 136.718 60.4315 138.929C60.3989 164.046 60.4094 189.162 60.4813 214.279C60.5229 228.822 60.6928 243.364 60.8224 257.907C60.8291 258.654 60.8896 259.435 61.1171 260.139C61.7813 262.194 62.8644 262.94 65.0177 262.958C66.9524 262.974 68.8917 262.888 70.821 262.993C73.2252 263.123 74.7945 261.427 75.2659 259.333C75.4562 258.488 75.5019 257.599 75.5173 256.728C75.7163 245.398 75.8776 234.067 76.0904 222.738C76.2692 213.221 76.5358 203.706 76.705 194.189C76.9666 179.474 77.151 164.757 77.4346 150.042C77.4907 147.132 77.7466 144.216 78.09 141.323C78.5019 137.854 80.4286 135.43 83.6753 134.055C85.5775 133.249 87.5264 132.721 89.6076 132.586C98.7889 131.993 107.967 131.35 117.146 130.725C117.38 130.709 117.614 130.685 117.848 130.674C120.591 130.546 122.418 132.078 122.446 134.796C122.482 138.181 122.378 141.571 122.226 144.954C121.987 150.262 121.637 155.565 121.372 160.873C120.915 170.029 120.485 179.187 120.047 188.344C119.894 191.552 119.746 194.761 119.61 197.97C119.58 198.669 119.563 199.375 119.622 200.071C119.763 201.75 120.55 202.62 122.184 202.934C122.641 203.022 123.115 203.048 123.582 203.051C125.458 203.063 127.335 203.068 129.211 203.05C131.461 203.029 132.56 202.188 133.039 199.995C133.3 198.802 133.414 197.575 133.539 196.358C134.286 189.099 135.064 181.843 135.74 174.578C136.466 166.788 137.116 158.99 137.749 151.192C138.08 147.119 138.267 143.033 138.591 138.959C138.729 137.22 138.994 135.485 139.305 133.767C139.629 131.974 140.65 130.726 142.434 130.091C147.695 128.218 153.053 126.768 158.661 126.502C159.928 126.442 161.255 126.574 162.479 126.899C165.479 127.694 167.174 129.933 168.048 132.72C168.725 134.878 169.237 137.129 169.478 139.375C170.056 144.771 170.518 150.184 170.869 155.601C171.501 165.39 172.046 175.185 172.576 184.98C173.125 195.127 173.598 205.277 174.131 215.425C174.566 223.705 175.014 231.984 175.511 240.261C175.707 243.517 177.451 245.062 180.75 245.091C182.45 245.105 184.151 245.116 185.851 245.086C189.065 245.029 190.848 243.309 190.977 240.106C191.028 238.824 190.985 237.535 190.935 236.252C190.276 219.328 189.606 202.404 188.942 185.479C188.552 175.559 188.167 165.638 187.782 155.717C187.449 147.138 187.121 138.56 186.784 129.81Z';

const CHAIR = translatePath(CHAIR_RAW, 54.5, 43.5);

// ─── ANIMATION ──────────────────────────────────────────────────────────────────
//
// Single Framer Motion progress (0→1) drives flubber interpolators.
// One continuous ease-in-out-quart curve — no per-stage pulsing.
//
// Progress breakpoints (weighted toward later, more complex stages):
//   0.00 → 0.15   spot → blob
//   0.15 → 0.30   blob → notched
//   0.30 → 0.50   notched → webbed
//   0.50 → 0.75   webbed → emerging
//   0.75 → 1.00   emerging → chair

const BREAKPOINTS = [0, 0.15, 0.30, 0.50, 0.75, 1.0];

const W = 300;
const H = 350;

export default function Splash() {
  const progress = useMotionValue(0);

  const interps = useMemo(() => {
    const opts = { maxSegmentLength: 6 };
    return [
      interpolate(SPOT, BLOB, opts),
      interpolate(BLOB, NOTCHED, opts),
      interpolate(NOTCHED, WEBBED, opts),
      interpolate(WEBBED, EMERGING, opts),
      interpolate(EMERGING, CHAIR, opts),
    ];
  }, []);

  const pathD = useTransform(progress, (p) => {
    if (p <= 0) return SPOT;
    if (p >= 1) return CHAIR;

    for (let i = 0; i < interps.length; i++) {
      if (p <= BREAKPOINTS[i + 1]) {
        const localT = (p - BREAKPOINTS[i]) / (BREAKPOINTS[i + 1] - BREAKPOINTS[i]);
        return interps[i](localT);
      }
    }
    return CHAIR;
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      animate(progress, 1, {
        duration: 2.2,
        ease: [0.76, 0, 0.24, 1],
      });
    }, 700);
    return () => clearTimeout(timeout);
  }, [progress]);

  return (
    <div
      className="h-dvh w-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      <svg
        width={(W * 220) / 300}
        height={(H * 220) / 300}
        viewBox={`0 0 ${W} ${H}`}
      >
        <motion.path d={pathD} fill={FG} />
      </svg>
    </div>
  );
}
