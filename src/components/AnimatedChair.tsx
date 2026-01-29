import { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

// Figma stool dimensions
const STOOL_WIDTH = 226;
const STOOL_HEIGHT = 283;

// Animation timing
const MORPH_DURATION = 4000;
const HOLD_DURATION = 500;

// SDF rendering
const AA_WIDTH = 0.75;  // Anti-aliasing half-width in distance pixels
const BULGE = 2;        // Max dilation at mid-transit — liquid surface tension feel

// ease-in-out-quint — holds endpoints crisp, fast decisive transit
function easeInOutQuint(t: number): number {
  return t < 0.5
    ? 16 * t * t * t * t * t
    : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

// Hermite smooth step — anti-aliased edge at the SDF zero-contour
function smoothStep(lo: number, hi: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}

// Chair2 path (stool) — viewBox 84×105
const CHAIR2_PATH = "M41.0019 29.0617C40.331 46.9069 39.6614 64.6496 38.9988 82.3925C38.7436 89.2276 38.5047 96.0633 38.256 102.899C38.2414 103.298 38.1959 103.697 38.1825 104.097C38.1616 104.723 37.8608 105.021 37.2159 104.999C36.154 104.963 35.0912 104.935 34.0288 104.932C33.0943 104.93 32.773 104.495 32.7702 103.575C32.755 98.6991 32.6915 93.8234 32.6424 88.9477C32.4538 70.2094 32.2111 51.4714 32.1195 32.7326C32.1009 28.9305 32.6075 25.1216 32.9699 21.3251C33.0593 20.3881 32.8649 20.0191 31.9326 19.8577C25.6984 18.7786 19.8576 16.6229 14.3952 13.4494C13.4713 12.9126 13.1024 13.0274 12.7714 14.054C12.4489 15.0539 12.1339 16.0822 12.0242 17.1197C10.8548 28.1879 9.71055 39.2588 8.59293 50.3323C7.70901 59.0902 6.86672 67.8523 6.02117 76.614C5.92746 77.5851 5.50877 78.2521 4.57322 78.5959C4.19695 78.7342 3.84237 78.9308 3.47835 79.1017C1.23477 80.1554 -0.153361 79.2391 0.0135462 76.803C0.384102 71.3946 0.768311 65.987 1.13654 60.5784C2.03855 47.3295 2.90499 34.0782 3.85834 20.8329C4.04764 18.2028 4.01504 15.5164 5.10658 13.004C5.80799 11.3895 6.91909 10.1287 8.16773 8.9277C8.52849 8.5807 8.77293 7.97365 8.81052 7.4668C8.87996 6.53047 8.78913 5.57731 8.7064 4.63625C8.60033 3.42979 9.14261 2.65261 10.2655 2.33075C12.1586 1.78815 14.0459 1.08304 15.9833 0.865953C19.7634 0.442401 23.5731 0.169825 27.3763 0.0819322C37.3838 -0.149345 47.3887 0.0887025 57.3536 1.05671C61.8628 1.49472 66.338 2.29983 70.8156 3.01812C71.8486 3.18383 72.8294 3.67348 73.8322 4.01959C74.7683 4.34265 75.3133 5.0156 75.2891 5.98327C75.2601 7.13655 75.0534 8.28481 75.0057 9.43858C74.9898 9.82357 75.1031 10.4197 75.3664 10.5793C79.3427 12.99 80.9738 16.6408 81.1779 21.0974C81.7705 34.0362 82.3745 46.9745 82.9755 59.9129C83.2996 66.891 83.6364 73.8685 83.942 80.8473C83.9868 81.8693 84.2663 83.0556 83.0233 83.6417C81.7494 84.2423 80.6972 83.6304 79.6823 82.897C78.9164 82.3437 78.5653 81.6471 78.498 80.6938C77.6825 69.1536 76.8631 57.6136 75.9911 46.0775C75.2892 36.7922 74.5176 27.5121 73.7686 18.2304C73.638 16.6116 72.8984 15.2364 71.8965 13.9973C71.1578 13.0837 70.28 12.8882 69.2638 13.3949C64.315 15.8629 59.0248 17.3366 53.6616 18.53C50.3824 19.2597 47.0396 19.7192 43.7132 20.2204C42.7758 20.3616 42.3115 20.8552 42.1719 21.6557C41.7482 24.0842 41.3898 26.5238 41.0019 29.0617Z";

const CHAIR2_VB = { w: 84, h: 105 };
const CHAIR3_VB = { w: 710, h: 1027 };

// ─── SDF computation ────────────────────────────────────

// Rasterize an SVG path to a binary grid (1 = inside, 0 = outside)
function rasterizeShape(
  path: Path2D,
  xf: { s: number; ox: number; oy: number },
  W: number, H: number,
): Uint8Array {
  const tmp = document.createElement('canvas');
  tmp.width = W;
  tmp.height = H;
  const ctx = tmp.getContext('2d')!;
  ctx.translate(xf.ox, xf.oy);
  ctx.scale(xf.s, xf.s);
  ctx.fillStyle = 'white';
  ctx.fill(path);

  const data = ctx.getImageData(0, 0, W, H).data;
  const binary = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    binary[i] = data[i * 4 + 3] > 128 ? 1 : 0;
  }
  return binary;
}

// 1D Euclidean distance transform (Felzenszwalb/Huttenlocher)
// Operates in-place on squared distances in `grid`
function edt1d(
  grid: Float32Array, offset: number, stride: number, length: number,
  f: Float32Array, v: Int32Array, z: Float32Array,
): void {
  f[0] = grid[offset];
  v[0] = 0;
  z[0] = -1e20;
  z[1] = 1e20;

  let k = 0;
  for (let q = 1; q < length; q++) {
    f[q] = grid[offset + q * stride];
    const q2 = q * q;
    let s: number;
    do {
      const r = v[k];
      s = (f[q] - f[r] + q2 - r * r) / (2 * (q - r));
    } while (s <= z[k] && --k > -1);

    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = 1e20;
  }

  k = 0;
  for (let q = 0; q < length; q++) {
    while (z[k + 1] < q) k++;
    const dx = q - v[k];
    grid[offset + q * stride] = f[v[k]] + dx * dx;
  }
}

// 2D distance transform via separability — rows then columns
function edt2d(grid: Float32Array, W: number, H: number): void {
  const maxDim = Math.max(W, H);
  const f = new Float32Array(maxDim);
  const v = new Int32Array(maxDim);
  const z = new Float32Array(maxDim + 1);

  // Process rows
  for (let y = 0; y < H; y++) {
    edt1d(grid, y * W, 1, W, f, v, z);
  }
  // Process columns
  for (let x = 0; x < W; x++) {
    edt1d(grid, x, W, H, f, v, z);
  }
}

// Compute signed distance field from a binary grid
// Negative = inside, positive = outside, zero = boundary
function computeSDF(binary: Uint8Array, W: number, H: number): Float32Array {
  const size = W * H;
  const INF = 1e20;

  const outside = new Float32Array(size);
  const inside = new Float32Array(size);

  for (let i = 0; i < size; i++) {
    if (binary[i]) {
      outside[i] = 0;
      inside[i] = INF;
    } else {
      outside[i] = INF;
      inside[i] = 0;
    }
  }

  edt2d(outside, W, H);
  edt2d(inside, W, H);

  const sdf = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    sdf[i] = Math.sqrt(outside[i]) - Math.sqrt(inside[i]);
  }
  return sdf;
}

// ─── Component ──────────────────────────────────────────

interface AnimatedChairProps {
  className?: string;
}

export const AnimatedChair: React.FC<AnimatedChairProps> = ({
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Path2D objects (created once, reused for rasterization)
  const path2 = useRef<Path2D | null>(null);
  const path3 = useRef<Path2D | null>(null);
  const loaded = useRef(false);

  // Pre-computed signed distance fields
  const sdfA = useRef<Float32Array | null>(null);
  const sdfB = useRef<Float32Array | null>(null);

  // Pre-allocated rendering buffers
  const imgData = useRef<ImageData | null>(null);
  const buf32 = useRef<Uint32Array | null>(null);

  // Pre-computed transforms to fit each shape centered in canvas
  const xf2 = useRef({ s: 1, ox: 0, oy: 0 });
  const xf3 = useRef({ s: 1, ox: 0, oy: 0 });

  // Animation state
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isForwardRef = useRef(true);

  // ─── Setup ───────────────────────────────────────────────
  useEffect(() => {
    const W = STOOL_WIDTH;
    const H = STOOL_HEIGHT;

    // Chair2 Path2D + transform
    path2.current = new Path2D(CHAIR2_PATH);
    const s2 = Math.min(W / CHAIR2_VB.w, H / CHAIR2_VB.h);
    xf2.current = {
      s: s2,
      ox: (W - CHAIR2_VB.w * s2) / 2,
      oy: (H - CHAIR2_VB.h * s2) / 2,
    };

    // Chair3 transform (path loaded async)
    const s3 = Math.min(W / CHAIR3_VB.w, H / CHAIR3_VB.h);
    xf3.current = {
      s: s3,
      ox: (W - CHAIR3_VB.w * s3) / 2,
      oy: (H - CHAIR3_VB.h * s3) / 2,
    };

    // Pre-allocate rendering buffers
    imgData.current = new ImageData(W, H);
    buf32.current = new Uint32Array(imgData.current.data.buffer);

    // Load chair3 SVG path, then compute SDFs
    fetch('/chair3.svg')
      .then(r => r.text())
      .then(text => {
        const i = text.indexOf('d="');
        if (i !== -1) {
          const j = text.indexOf('"', i + 3);
          if (j !== -1) {
            path3.current = new Path2D(text.substring(i + 3, j));

            // Rasterize both shapes to binary grids
            const binaryA = rasterizeShape(path2.current!, xf2.current, W, H);
            const binaryB = rasterizeShape(path3.current, xf3.current, W, H);

            // Compute signed distance fields
            sdfA.current = computeSDF(binaryA, W, H);
            sdfB.current = computeSDF(binaryB, W, H);

            loaded.current = true;
          }
        }
      })
      .catch(err => console.error('Chair3 load failed:', err));
  }, []);

  // ─── Render one frame ────────────────────────────────────
  const renderFrame = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    const a = sdfA.current;
    const b = sdfB.current;
    const img = imgData.current;
    const buf = buf32.current;
    if (!canvas || !a || !b || !img || !buf) return;

    const ctx = canvas.getContext('2d')!;
    const size = STOOL_WIDTH * STOOL_HEIGHT;

    // Liquid surface tension: shape dilates slightly at mid-transit
    const bulge = Math.sin(progress * Math.PI) * BULGE;
    const oneMinusT = 1 - progress;

    for (let i = 0; i < size; i++) {
      // Interpolate distance fields
      const d = a[i] * oneMinusT + b[i] * progress - bulge;

      // Anti-aliased edge via smoothstep
      const alpha = 1 - smoothStep(-AA_WIDTH, AA_WIDTH, d);

      if (alpha > 0.004) {
        const byte = (alpha * 255 + 0.5) | 0;
        // Little-endian ABGR: #FF5300 with alpha
        buf[i] = (byte << 24) | (0x53 << 8) | 0xFF;
      } else {
        buf[i] = 0;
      }
    }

    ctx.putImageData(img, 0, 0);
  }, []);

  // ─── Animation loop ──────────────────────────────────────
  useEffect(() => {
    if (shouldReduceMotion || !canvasRef.current) return;

    // Poll until SDFs are computed
    const waitInterval = setInterval(() => {
      if (loaded.current) {
        clearInterval(waitInterval);
        renderFrame(0);
        timerRef.current = setTimeout(run, HOLD_DURATION);
      }
    }, 50);

    function run() {
      const t0 = performance.now();
      const fwd = isForwardRef.current;

      function tick(now: number) {
        const rawT = Math.min((now - t0) / MORPH_DURATION, 1);
        const eased = easeInOutQuint(rawT);
        renderFrame(fwd ? eased : 1 - eased);

        if (rawT < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          isForwardRef.current = !fwd;
          timerRef.current = setTimeout(run, HOLD_DURATION);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      clearInterval(waitInterval);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [shouldReduceMotion, renderFrame]);

  // ─── Render ──────────────────────────────────────────────
  if (shouldReduceMotion) {
    return (
      <svg
        width={STOOL_WIDTH}
        height={STOOL_HEIGHT}
        viewBox={`0 0 ${CHAIR2_VB.w} ${CHAIR2_VB.h}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path d={CHAIR2_PATH} fill="#FF5300" />
      </svg>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={STOOL_WIDTH}
      height={STOOL_HEIGHT}
      className={className}
      style={{
        width: STOOL_WIDTH,
        height: STOOL_HEIGHT,
      }}
    />
  );
};

export default AnimatedChair;
