import { useRef, useEffect } from 'react';
import { interpolate } from 'flubber';

const FG = '#F0C4F0';
const BG = '#FF4500';

// ─── UTILITIES ──────────────────────────────────────────────────────────────────

function ellipseToPath(cx: number, cy: number, rx: number, ry: number, rotDeg: number, n = 64): string {
  const rad = (rotDeg * Math.PI) / 180;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI;
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

// ─── EASING (Emil Kowalski) ─────────────────────────────────────────────────────

function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── KEYFRAME SHAPES (300×350 coordinate space) ─────────────────────────────────
//
// 6 keyframes for smooth morphing:
//   1. SPOT      — logo ellipse
//   2. BLOB      — organic rounded rectangle
//   3. NOTCHED   — blob with scalloped bottom hinting at leg positions
//   4. WEBBED    — short stubby legs emerged
//   5. EMERGING  — legs lengthening + differentiating, body narrowing
//   6. CHAIR     — final chair illustration

const SPOT = ellipseToPath(150, 158, 118, 128, 15);

const BLOB =
  'M155 42' +
  'C200 38 248 58 258 98' +
  'C268 138 262 195 252 228' +
  'C242 262 205 278 160 275' +
  'C115 272 68 258 52 228' +
  'C32 192 38 138 48 98' +
  'C58 58 110 46 155 42Z';

// Scalloped bottom — three soft protrusions at the leg x-positions (~120, ~180, ~235)
// The "between-leg" areas pull up to ~256, bumps extend to ~290
const NOTCHED =
  'M155 42' +
  'C200 38 248 58 258 98' +
  'C268 138 262 195 252 228' +
  'C248 250 244 262 238 266' +
  'Q235 290 232 266' +
  'C222 256 198 256 188 266' +
  'Q180 290 172 266' +
  'C160 256 140 256 128 266' +
  'Q120 290 112 266' +
  'C100 258 76 248 52 228' +
  'C32 192 38 138 48 98' +
  'C58 58 110 46 155 42Z';

// Short stubby legs at chair's three vertical positions
const WEBBED =
  'M155 38' +
  'C200 34 240 50 248 82' +
  'C256 112 254 162 250 198' +
  'C248 214 246 226 244 232' +
  'L242 300 Q235 308 228 300 L226 232' +
  'L188 232 L186 300 Q180 308 174 300 L172 232' +
  'L128 232 L126 300 Q120 308 114 300 L112 232' +
  'C96 228 80 218 68 198' +
  'C56 162 50 112 58 82' +
  'C68 50 112 42 155 38Z';

// Legs differentiate in length (left longest, middle shortest — matching chair)
// Body narrows slightly and shifts left to hint at chair asymmetry
const EMERGING =
  'M148 36' +
  'C196 30 238 44 246 76' +
  'C254 106 252 158 246 192' +
  'C242 210 240 220 238 226' +
  'L240 226 L238 298 Q234 306 230 298 L228 226' +
  'L186 226 L184 272 Q180 280 176 272 L174 226' +
  'L124 226 L122 304 Q118 312 114 304 L112 226' +
  'C92 222 74 210 64 192' +
  'C48 158 46 106 54 76' +
  'C64 44 104 36 148 36Z';

const CHAIR_RAW =
  'M186.784 129.81C186.669 127.422 186.559 125.205 186.45 122.989C186.129 116.475 181.142 110.383 174.219 109.408C165.577 108.191 156.975 106.696 148.27 105.942C147.631 105.886 146.997 105.748 146.364 105.629C143.291 105.051 141.265 103.307 140.637 100.22C140.021 97.1927 139.568 94.1329 139.026 91.0907C137.336 81.6134 135.7 72.126 133.927 62.6642C131.79 51.258 129.549 39.8709 127.321 28.4819C126.3 23.262 124.34 18.3927 121.189 14.0952C116.682 7.94544 110.667 3.90583 103.275 1.8885C99.5212 0.864222 95.6971 0.334274 91.8292 0.190445C83.1533 -0.132189 74.4733 -0.0670238 65.8138 0.556889C56.6957 1.21384 47.6155 2.24184 38.6237 3.94179C31.4836 5.29166 26.6655 9.44759 23.7774 16.0094C21.5623 21.042 20.4252 26.344 20.0213 31.7693C19.1326 43.7049 18.3765 55.6511 17.6567 67.5984C17.0703 77.3313 16.7198 87.079 16.0666 96.807C15.5937 103.85 14.8683 110.879 14.1215 117.9C13.4982 123.76 12.7215 129.605 11.9385 135.448C10.8377 143.661 9.69496 151.869 8.52131 160.072C7.11617 169.893 5.72486 179.717 4.20416 189.521C3.03302 197.071 1.66097 204.59 0.404142 212.127C0.193611 213.39 -0.00450984 214.675 6.36645e-05 215.949C0.00983335 218.677 1.69679 220.427 4.44785 220.593C6.14185 220.695 7.84942 220.697 9.54513 220.619C12.4162 220.487 13.8162 219.236 14.3257 216.445C15.5409 209.786 16.7327 203.123 17.9431 196.464C19.8415 186.018 21.7503 175.575 23.6491 165.129C25.0159 157.611 26.3317 150.083 27.753 142.574C28.4687 138.793 29.3115 135.033 30.2066 131.29C30.7254 129.12 31.6609 127.099 33.1402 125.378C34.6734 123.594 36.5242 122.632 38.8958 123.497C41.5815 124.477 44.2891 125.431 46.8788 126.629C49.6362 127.904 52.2985 129.396 54.9383 130.905C56.1418 131.593 57.2978 132.44 58.2866 133.406C59.8036 134.889 60.4343 136.718 60.4315 138.929C60.3989 164.046 60.4094 189.162 60.4813 214.279C60.5229 228.822 60.6928 243.364 60.8224 257.907C60.8291 258.654 60.8896 259.435 61.1171 260.139C61.7813 262.194 62.8644 262.94 65.0177 262.958C66.9524 262.974 68.8917 262.888 70.821 262.993C73.2252 263.123 74.7945 261.427 75.2659 259.333C75.4562 258.488 75.5019 257.599 75.5173 256.728C75.7163 245.398 75.8776 234.067 76.0904 222.738C76.2692 213.221 76.5358 203.706 76.705 194.189C76.9666 179.474 77.151 164.757 77.4346 150.042C77.4907 147.132 77.7466 144.216 78.09 141.323C78.5019 137.854 80.4286 135.43 83.6753 134.055C85.5775 133.249 87.5264 132.721 89.6076 132.586C98.7889 131.993 107.967 131.35 117.146 130.725C117.38 130.709 117.614 130.685 117.848 130.674C120.591 130.546 122.418 132.078 122.446 134.796C122.482 138.181 122.378 141.571 122.226 144.954C121.987 150.262 121.637 155.565 121.372 160.873C120.915 170.029 120.485 179.187 120.047 188.344C119.894 191.552 119.746 194.761 119.61 197.97C119.58 198.669 119.563 199.375 119.622 200.071C119.763 201.75 120.55 202.62 122.184 202.934C122.641 203.022 123.115 203.048 123.582 203.051C125.458 203.063 127.335 203.068 129.211 203.05C131.461 203.029 132.56 202.188 133.039 199.995C133.3 198.802 133.414 197.575 133.539 196.358C134.286 189.099 135.064 181.843 135.74 174.578C136.466 166.788 137.116 158.99 137.749 151.192C138.08 147.119 138.267 143.033 138.591 138.959C138.729 137.22 138.994 135.485 139.305 133.767C139.629 131.974 140.65 130.726 142.434 130.091C147.695 128.218 153.053 126.768 158.661 126.502C159.928 126.442 161.255 126.574 162.479 126.899C165.479 127.694 167.174 129.933 168.048 132.72C168.725 134.878 169.237 137.129 169.478 139.375C170.056 144.771 170.518 150.184 170.869 155.601C171.501 165.39 172.046 175.185 172.576 184.98C173.125 195.127 173.598 205.277 174.131 215.425C174.566 223.705 175.014 231.984 175.511 240.261C175.707 243.517 177.451 245.062 180.75 245.091C182.45 245.105 184.151 245.116 185.851 245.086C189.065 245.029 190.848 243.309 190.977 240.106C191.028 238.824 190.985 237.535 190.935 236.252C190.276 219.328 189.606 202.404 188.942 185.479C188.552 175.559 188.167 165.638 187.782 155.717C187.449 147.138 187.121 138.56 186.784 129.81Z';

const CHAIR = translatePath(CHAIR_RAW, 54.5, 43.5);

// ─── TIMELINE ─────────────────────────────────────────────────────────────────
//
// Continuous flow with 5 morph stages (no long static holds):
//   0–700ms        Hold spot
//   700–1000ms     spot → blob       (300ms, ease-out-quint — snappy entrance)
//   1000–1150ms    Hold blob          (150ms — brief register)
//   1150–1400ms    blob → notched     (250ms, ease-in-out — scallops form)
//   1400–1700ms    notched → webbed   (300ms, ease-in-out — legs emerge)
//   1700–2100ms    webbed → emerging  (400ms, ease-in-out — legs differentiate)
//   2100–2550ms    emerging → chair   (450ms, ease-in-out — final refinement)
//   2550ms+        Hold chair

const W = 300;
const H = 350;

export default function Splash() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const opts = { maxSegmentLength: 10 };
    const spotToBlob = interpolate(SPOT, BLOB, opts);
    const blobToNotched = interpolate(BLOB, NOTCHED, opts);
    const notchedToWebbed = interpolate(NOTCHED, WEBBED, opts);
    const webbedToEmerging = interpolate(WEBBED, EMERGING, opts);
    const emergingToChair = interpolate(EMERGING, CHAIR, opts);

    const t0 = performance.now();
    let rafId: number;

    function draw(now: number) {
      const ms = now - t0;
      ctx!.clearRect(0, 0, W, H);

      let pathStr: string;

      if (ms < 700) {
        pathStr = SPOT;
      } else if (ms < 1000) {
        pathStr = spotToBlob(easeOutQuint(Math.min(1, (ms - 700) / 300)));
      } else if (ms < 1150) {
        pathStr = BLOB;
      } else if (ms < 1400) {
        pathStr = blobToNotched(easeInOutCubic(Math.min(1, (ms - 1150) / 250)));
      } else if (ms < 1700) {
        pathStr = notchedToWebbed(easeInOutCubic(Math.min(1, (ms - 1400) / 300)));
      } else if (ms < 2100) {
        pathStr = webbedToEmerging(easeInOutCubic(Math.min(1, (ms - 1700) / 400)));
      } else if (ms < 2550) {
        pathStr = emergingToChair(easeInOutCubic(Math.min(1, (ms - 2100) / 450)));
      } else {
        pathStr = CHAIR;
      }

      ctx!.fillStyle = FG;
      ctx!.fill(new Path2D(pathStr));

      if (ms < 2600) {
        rafId = requestAnimationFrame(draw);
      }
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      className="h-dvh w-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${(W * 220) / 300}px`,
          height: `${(H * 220) / 300}px`,
        }}
      />
    </div>
  );
}
