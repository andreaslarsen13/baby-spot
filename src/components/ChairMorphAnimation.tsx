import React, { useEffect, useRef, useState } from 'react';
import { interpolate } from 'flubber';

// Chair paths - all translated to occupy the same position (centered around x=20)
// Original positions: Chair1 ~(84-121, 0-64), Chair2 ~(0-39, 2-63), Chair3 ~(43-84, 6-62)
const CHAIR_PATHS = [
  // Chair 1 - translated left by ~82 to center around x=20
  "M11.9433 31.1106C11.5726 30.7722 11.2416 30.4697 10.9226 30.1782C10.5609 30.374 10.5516 30.6842 10.5249 30.9362C10.0127 35.7607 8.948 40.488 8.0465 45.2444C7.7038 47.0524 7.4485 48.877 7.1579 50.6947C7.0247 51.5283 6.8335 51.666 5.9942 51.552C4.9947 51.4162 3.9914 51.3075 2.9926 51.1666C2.0826 51.0381 1.9227 50.8153 2.0286 49.9236C2.4863 46.0675 2.9732 42.2146 3.3917 38.3543C3.7939 34.644 4.0772 30.9206 4.5003 27.2129C4.9489 23.2803 5.2957 19.337 5.8159 15.4115C6.1936 12.5616 6.4649 9.69786 6.8908 6.85268C7.159 5.0609 7.6648 3.30465 7.6671 1.47084C7.6679 0.842248 8.1616 0.621832 8.7042 0.577456C10.0874 0.464315 11.4715 0.327578 12.8576 0.290385C16.3153 0.197608 19.775 0.161913 23.233 0.088433C24.493 0.0616561 25.75 -0.0947734 27.013 0.0857104C28.124 0.244434 28.566 0.653022 28.503 1.77546C28.374 4.06873 28.182 6.35862 28 8.64871C27.833 10.7615 27.648 12.8729 27.467 14.9846C27.263 17.3726 27.085 19.7638 26.734 22.1362C26.624 22.8846 26.768 23.4813 27.315 24.0643C30.689 27.6543 34.025 31.2792 37.38 34.8868C38.057 35.6141 38.329 36.5031 38.359 37.45C38.603 45.1523 39.09 52.8482 38.985 60.56C38.983 60.7622 38.991 60.9651 38.976 61.1665C38.893 62.3409 38.557 62.6373 37.371 62.7008C36.036 62.7722 34.705 62.9028 33.37 62.9755C32.232 63.0375 32.039 62.8544 31.962 61.644C31.772 58.6184 31.667 55.5899 31.604 52.5582C31.495 47.3554 31.309 42.1543 31.173 36.9519C31.156 36.2851 30.869 36.0601 30.237 36.0983C28.146 36.2247 26.054 36.3357 23.962 36.4408C23.419 36.4681 23.225 36.7506 23.198 37.265C23.065 39.7354 22.974 42.2102 22.756 44.6734C22.291 49.9139 22.317 55.1714 22.115 60.4208C22.087 61.1525 22.033 61.8831 21.993 62.6143C21.955 63.2887 21.625 63.6623 20.938 63.7807C19.711 63.9919 18.468 63.8295 17.2365 63.9925C16.642 64.0712 16.5184 63.5129 16.5091 63.0427C16.4895 62.0574 16.4959 61.0706 16.5235 60.0854C16.5922 57.6366 16.6783 55.1884 16.7583 52.74C16.9184 47.8433 17.151 42.9502 17.5004 38.0632C17.5534 37.3219 17.4204 36.6629 16.8767 36.1139C15.2411 34.4624 13.6136 32.8029 11.9433 31.1106Z",

  // Chair 2 - already near left, shift right by ~1 to center
  "M5.98921 31.639C6.93142 26.8981 8.32792 22.3258 9.26371 17.6497C10.21395 12.9015 11.4462 8.21335 12.2936 3.44383C12.5332 2.09464 12.7974 1.88248 14.0608 2.04851C18.3835 2.61654 22.7122 3.12826 27.0552 3.51871C27.6257 3.57 28.1936 3.65265 28.7647 3.69308C29.4218 3.73959 29.7049 4.08925 29.6598 4.71723C29.4866 7.13274 29.3089 9.54793 29.1295 11.963C28.9701 14.1082 28.8265 16.2549 28.6361 18.3975C28.5335 19.5528 28.3934 20.7091 28.1828 21.8491C28.0407 22.6185 28.2898 23.0395 28.9807 23.3732C31.94 24.8023 34.8834 26.2641 37.8293 27.7204C40.1614 28.8733 40.1641 28.878 39.8613 31.4447C39.4735 34.732 39.1099 38.0227 38.6746 41.3039C38.2622 44.4126 37.7672 47.5104 37.3169 50.6141C37.2289 51.2202 36.9162 51.5348 36.2879 51.5732C35.5426 51.6189 34.7998 51.7038 34.0558 51.7703C33.1716 51.8492 32.8652 51.5658 32.9242 50.6637C33.0065 49.4062 33.109 48.1498 33.219 46.8944C33.4043 44.7788 33.6074 42.6648 33.793 40.5492C33.9118 39.1949 34.0191 37.8395 34.1161 36.4835C34.1348 36.2217 34.197 35.9413 34.0355 35.6952C33.8286 35.5969 33.6849 35.7279 33.5589 35.833C32.2431 36.931 30.9306 38.0328 29.6239 39.1415C29.1902 39.5094 28.9887 39.9756 28.9084 40.555C28.3041 44.9113 27.5255 49.2372 26.599 53.5387C26.0319 56.171 25.5602 58.8235 25.041 61.466C24.9792 61.7806 24.902 62.0938 24.8076 62.4003C24.6597 62.8805 24.3096 63.07 23.8247 62.9771C22.6756 62.7572 21.5239 62.5463 20.3843 62.2844C19.4587 62.0716 19.3064 61.8248 19.441 60.8574C19.6246 59.5376 19.8187 58.2185 20.0457 56.9054C20.9505 51.6737 21.8198 46.4366 22.5418 41.1764C22.6221 40.5915 22.4154 40.2372 21.7923 40.1169C18.5657 39.494 15.3419 38.8572 12.1183 38.219C11.4419 38.0851 11.056 38.2751 10.87783 39C9.66193 43.9473 8.65668 48.9358 7.82444 53.9595C7.48903 55.9842 7.00731 57.9784 6.53169 59.9729C6.33003 60.8185 5.94698 61.0046 5.10772 60.8469C4.10441 60.6584 3.09808 60.4846 2.09053 60.3196C1.178036 60.1702 0.899 59.8129 1.0308801 58.888C1.432052 56.0748 2.0459 53.2996 2.56504 50.5075C3.40944 45.9661 4.22768 41.4209 4.9257 36.854C5.19023 35.1233 5.61947 33.4174 5.98921 31.639Z",

  // Chair 3 - translate left by ~43 to center
  "M18.8785 60.6548C17.7203 56.2789 16.7833 51.915 15.7696 47.5692C15.5127 46.4676 15.3924 45.3435 15.2752 44.2204C15.1496 43.0165 14.6669 42.0424 13.6613 41.286C11.5074 39.6658 9.3984 37.9867 7.2729 36.3291C7.0146 36.1277 6.7562 35.9335 6.3351 35.8157C6.1652 36.5633 6.2664 37.2783 6.3134 37.9827C6.4933 40.6847 6.6643 43.3877 6.8942 46.0857C7.1367 48.9305 7.4617 51.7676 7.8511 54.5972C7.9705 55.4654 8.0112 56.3441 8.0986 57.2169C8.1631 57.8606 7.8736 58.2291 7.2413 58.3148C5.8423 58.5045 4.4408 58.6691 3.0255 58.6877C2.4881 58.6948 2.2578 58.4562 2.228 57.9228C2.1554 56.6213 2.0352 55.3225 1.9575 54.0212C1.6571 48.9895 1.45 43.9531 1.0884 38.9241C0.8888 36.1492 0.7509 33.3682 0.6881 30.5817C0.5836 25.9428 0.3109 21.3079 0.1367 16.6703C0.0575 14.5636 0.0437 12.4545 0.0028 10.3465C-0.0021 10.0956 -0.0019 9.8438 0.0142 9.59358C0.0951 8.34191 0.1772 8.175 1.437 7.95794C5.5286 7.25299 9.5729 6.20959 13.7749 6.2674C14.7023 6.28016 15.6307 6.07378 16.5616 6.01396C17.7168 5.93974 17.9302 6.13366 18.0529 7.27531C18.2268 8.89525 18.3928 10.5161 18.556 12.1371C18.9623 16.1727 19.3516 20.2095 20.0562 24.2097C20.2009 25.0313 20.509 25.4551 21.3925 25.6394C25.1169 26.4165 28.8645 27.087 32.5595 28.0049C33.327 28.1956 33.7549 28.5797 34.0247 29.3292C36.6864 36.7255 38.7442 44.2949 40.6214 51.9165C40.8006 52.644 40.8805 53.3967 40.9881 54.1403C41.0459 54.5398 40.8972 54.8503 40.4607 54.9103C38.9575 55.1167 37.5206 55.6101 36.0376 55.9033C34.9836 56.1117 34.6648 55.9426 34.3823 54.9173C32.7434 48.9694 31.1077 43.0206 29.4806 37.0695C29.3265 36.5057 29.0902 35.9874 28.8106 35.479C28.566 35.0342 28.2671 34.9475 27.8211 35.2089C25.4727 36.5851 23.1238 37.9608 20.7603 39.311C20.1367 39.6672 20.159 40.1678 20.2796 40.7366C20.9153 43.7321 21.8107 46.659 22.6268 49.6074C23.5025 52.7713 24.4323 55.9232 25.0372 59.1552C25.2553 60.3201 25.119 60.5083 23.9369 60.8398C22.8688 61.1392 21.8128 61.4813 20.7455 61.7835C19.3193 62.1874 19.2464 62.1379 18.8785 60.6548Z",
];

// ViewBox sized to fit the centered chairs
const VIEWBOX = "0 0 42 65";

// Pre-compute all interpolators for smooth transitions
function createInterpolators() {
  const interpolators: ((t: number) => string)[] = [];
  for (let i = 0; i < CHAIR_PATHS.length; i++) {
    const nextIndex = (i + 1) % CHAIR_PATHS.length;
    interpolators.push(
      interpolate(CHAIR_PATHS[i], CHAIR_PATHS[nextIndex], {
        maxSegmentLength: 1,
      })
    );
  }
  return interpolators;
}

interface ChairMorphAnimationProps {
  /** Duration of each morph transition in ms */
  morphDuration?: number;
  /** Pause between morphs in ms */
  pauseDuration?: number;
  /** Fill color for the chair */
  fillColor?: string;
  /** Width of the SVG container */
  width?: number;
  /** Height of the SVG container */
  height?: number;
  /** Optional className for the container */
  className?: string;
}

const ChairMorphAnimation: React.FC<ChairMorphAnimationProps> = ({
  morphDuration = 1200,
  pauseDuration = 800,
  fillColor = '#888888',
  width = 200,
  height = 106,
  className = '',
}) => {
  const [currentPath, setCurrentPath] = useState(CHAIR_PATHS[0]);
  const interpolatorsRef = useRef<((t: number) => string)[] | null>(null);
  const animationRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const phaseRef = useRef<'morphing' | 'paused'>('paused');
  const phaseStartTimeRef = useRef<number>(0);

  useEffect(() => {
    // Create interpolators once on mount
    interpolatorsRef.current = createInterpolators();

    const animate = (timestamp: number) => {
      if (!interpolatorsRef.current) return;

      // Initialize start time on first frame
      if (phaseStartTimeRef.current === 0) {
        phaseStartTimeRef.current = timestamp;
      }

      const elapsed = timestamp - phaseStartTimeRef.current;

      if (phaseRef.current === 'paused') {
        // Waiting phase - show static chair
        if (elapsed >= pauseDuration) {
          // Transition to morphing
          phaseRef.current = 'morphing';
          phaseStartTimeRef.current = timestamp;
        }
      } else {
        // Morphing phase - interpolate between shapes
        const progress = Math.min(elapsed / morphDuration, 1);

        // Smooth easing function (ease-in-out cubic)
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // Get interpolated path
        const interpolator = interpolatorsRef.current[currentIndexRef.current];
        const newPath = interpolator(eased);
        setCurrentPath(newPath);

        if (progress >= 1) {
          // Move to next chair
          currentIndexRef.current = (currentIndexRef.current + 1) % CHAIR_PATHS.length;
          phaseRef.current = 'paused';
          phaseStartTimeRef.current = timestamp;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [morphDuration, pauseDuration]);

  return (
    <div className={className} style={{ width, height }}>
      <svg
        viewBox={VIEWBOX}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={currentPath}
          fill={fillColor}
        />
      </svg>
    </div>
  );
};

export default ChairMorphAnimation;
