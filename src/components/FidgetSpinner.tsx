import { useRef, useState, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useSpring,
  type PanInfo,
} from 'framer-motion';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

// Chair SVG path
const CHAIR_PATH =
  "M11.9433 31.1106C11.5726 30.7722 11.2416 30.4697 10.9226 30.1782C10.5609 30.374 10.5516 30.6842 10.5249 30.9362C10.0127 35.7607 8.948 40.488 8.0465 45.2444C7.7038 47.0524 7.4485 48.877 7.1579 50.6947C7.0247 51.5283 6.8335 51.666 5.9942 51.552C4.9947 51.4162 3.9914 51.3075 2.9926 51.1666C2.0826 51.0381 1.9227 50.8153 2.0286 49.9236C2.4863 46.0675 2.9732 42.2146 3.3917 38.3543C3.7939 34.644 4.0772 30.9206 4.5003 27.2129C4.9489 23.2803 5.2957 19.337 5.8159 15.4115C6.1936 12.5616 6.4649 9.69786 6.8908 6.85268C7.159 5.0609 7.6648 3.30465 7.6671 1.47084C7.6679 0.842248 8.1616 0.621832 8.7042 0.577456C10.0874 0.464315 11.4715 0.327578 12.8576 0.290385C16.3153 0.197608 19.775 0.161913 23.233 0.088433C24.493 0.0616561 25.75 -0.0947734 27.013 0.0857104C28.124 0.244434 28.566 0.653022 28.503 1.77546C28.374 4.06873 28.182 6.35862 28 8.64871C27.833 10.7615 27.648 12.8729 27.467 14.9846C27.263 17.3726 27.085 19.7638 26.734 22.1362C26.624 22.8846 26.768 23.4813 27.315 24.0643C30.689 27.6543 34.025 31.2792 37.38 34.8868C38.057 35.6141 38.329 36.5031 38.359 37.45C38.603 45.1523 39.09 52.8482 38.985 60.56C38.983 60.7622 38.991 60.9651 38.976 61.1665C38.893 62.3409 38.557 62.6373 37.371 62.7008C36.036 62.7722 34.705 62.9028 33.37 62.9755C32.232 63.0375 32.039 62.8544 31.962 61.644C31.772 58.6184 31.667 55.5899 31.604 52.5582C31.495 47.3554 31.309 42.1543 31.173 36.9519C31.156 36.2851 30.869 36.0601 30.237 36.0983C28.146 36.2247 26.054 36.3357 23.962 36.4408C23.419 36.4681 23.225 36.7506 23.198 37.265C23.065 39.7354 22.974 42.2102 22.756 44.6734C22.291 49.9139 22.317 55.1714 22.115 60.4208C22.087 61.1525 22.033 61.8831 21.993 62.6143C21.955 63.2887 21.625 63.6623 20.938 63.7807C19.711 63.9919 18.468 63.8295 17.2365 63.9925C16.642 64.0712 16.5184 63.5129 16.5091 63.0427C16.4895 62.0574 16.4959 61.0706 16.5235 60.0854C16.5922 57.6366 16.6783 55.1884 16.7583 52.74C16.9184 47.8433 17.151 42.9502 17.5004 38.0632C17.5534 37.3219 17.4204 36.6629 16.8767 36.1139C15.2411 34.4624 13.6136 32.8029 11.9433 31.1106Z";

const VIEWBOX = "0 0 42 65";

// Physics
const FRICTION = 0.98;
const MIN_VELOCITY = 0.1;

interface FidgetSpinnerProps {
  size?: number;
}

export function FidgetSpinner({ size = 100 }: FidgetSpinnerProps) {
  const { orientation, requestPermission, permissionState } = useDeviceOrientation();
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const [isLifted, setIsLifted] = useState(false);

  // Rotation
  const rotation = useMotionValue(0);
  const angularVelocity = useRef(0);

  // Position for dragging
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Scale spring for magnet lift effect
  const scale = useSpring(1, { stiffness: 400, damping: 25 });
  const shadowBlur = useSpring(8, { stiffness: 400, damping: 25 });

  const isDragging = useRef(false);
  const isSpinning = useRef(false);
  const chairRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const lastAngle = useRef(0);
  const lastTime = useRef(0);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Update center position
  useEffect(() => {
    const updateCenter = () => {
      if (chairRef.current) {
        const rect = chairRef.current.getBoundingClientRect();
        centerRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    };

    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

  const getAngle = (px: number, py: number) => {
    const dx = px - centerRef.current.x;
    const dy = py - centerRef.current.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  // Spin momentum animation
  useAnimationFrame(() => {
    if (isSpinning.current) return;

    if (Math.abs(angularVelocity.current) > MIN_VELOCITY) {
      rotation.set(rotation.get() + angularVelocity.current);
      angularVelocity.current *= FRICTION;
    } else {
      angularVelocity.current = 0;
    }
  });

  // Handlers for background spin (works always)
  const handleBackgroundPanStart = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!hasRequestedPermission && permissionState === 'prompt') {
      setHasRequestedPermission(true);
      requestPermission();
    }

    // Update center based on current chair position
    if (chairRef.current) {
      const rect = chairRef.current.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    isSpinning.current = true;
    angularVelocity.current = 0;
    lastAngle.current = getAngle(info.point.x, info.point.y);
    lastTime.current = performance.now();
  };

  const handleBackgroundPan = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isSpinning.current) return;

    const currentAngle = getAngle(info.point.x, info.point.y);
    const currentTime = performance.now();

    let delta = currentAngle - lastAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    rotation.set(rotation.get() + delta);

    const dt = currentTime - lastTime.current;
    if (dt > 0) {
      angularVelocity.current = (delta / dt) * 16;
    }

    lastAngle.current = currentAngle;
    lastTime.current = currentTime;
  };

  const handleBackgroundPanEnd = () => {
    isSpinning.current = false;
  };

  // Handlers for chair (lift and drag)
  const handleChairTap = () => {
    if (!isLifted) {
      // Lift up like magnet
      setIsLifted(true);
      scale.set(1.15);
      shadowBlur.set(25);
    }
  };

  const handleChairPanStart = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isLifted) {
      // First tap lifts it
      handleChairTap();
    }
    isDragging.current = true;
    dragStartPos.current = { x: info.point.x, y: info.point.y };
  };

  const handleChairPan = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isDragging.current) return;
    x.set(x.get() + info.delta.x);
    y.set(y.get() + info.delta.y);
  };

  const handleChairPanEnd = () => {
    isDragging.current = false;
  };

  // Click outside to drop (stays where it is)
  const handleBackgroundTap = () => {
    if (isLifted) {
      setIsLifted(false);
      scale.set(1);
      shadowBlur.set(8);
    }
  };

  // Gradient shift from device tilt
  const getTiltOffset = () => {
    if (orientation && permissionState === 'granted') {
      const gamma = orientation.gamma ?? 0;
      const beta = orientation.beta ?? 0;
      return gamma + beta * 0.5;
    }
    return 0;
  };

  const gradientId = 'chair-gradient';
  const maskId = 'chair-mask';

  return (
    <>
      {/* Full-screen touch layer for spinning */}
      <motion.div
        className="absolute inset-0 touch-none"
        style={{ zIndex: 1 }}
        onPanStart={handleBackgroundPanStart}
        onPan={handleBackgroundPan}
        onPanEnd={handleBackgroundPanEnd}
        onTap={handleBackgroundTap}
      />

      {/* Chair visual */}
      <motion.div
        ref={chairRef}
        className="cursor-grab active:cursor-grabbing touch-none"
        style={{
          width: size,
          height: size * 1.55,
          zIndex: isLifted ? 10 : 2,
          x,
          y,
          scale,
          filter: `drop-shadow(0 ${isLifted ? 12 : 4}px ${shadowBlur}px rgba(0, 0, 0, ${isLifted ? 0.4 : 0.2}))`,
        }}
        onTap={handleChairTap}
        onPanStart={handleChairPanStart}
        onPan={handleChairPan}
        onPanEnd={handleChairPanEnd}
        whileTap={{ scale: isLifted ? 1.15 : 1.1 }}
      >
        <motion.svg
          viewBox={VIEWBOX}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '100%',
            height: '100%',
            rotate: rotation,
          }}
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
              gradientTransform={`rotate(${getTiltOffset()}, 21, 32)`}
            >
              <stop offset="0%" stopColor="#7CB89E" />
              <stop offset="50%" stopColor="#A8D4A2" />
              <stop offset="100%" stopColor="#C5E8B7" />
            </linearGradient>

            <mask id={maskId}>
              <path d={CHAIR_PATH} fill="white" />
            </mask>
          </defs>

          {/* Main chair */}
          <path d={CHAIR_PATH} fill={`url(#${gradientId})`} />

          {/* Subtle highlight */}
          <path
            d={CHAIR_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.5"
          />
        </motion.svg>
      </motion.div>
    </>
  );
}

export default FidgetSpinner;
