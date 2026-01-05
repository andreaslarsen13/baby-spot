import React, { lazy, Suspense } from 'react';
import { useVersion } from '../VersionContext';

// Lazy load all versions - only the active version gets loaded
const TimeWindowSliderV1 = lazy(() => import('./v1').then(m => ({ default: m.TimeWindowSliderV1 })));
const TimeWindowSliderV3 = lazy(() => import('./v3').then(m => ({ default: m.TimeWindowSliderV3 })));
const TimeWindowSliderV5 = lazy(() => import('./v5').then(m => ({ default: m.TimeWindowSliderV5 })));
const TimeWindowSliderV8 = lazy(() => import('./v8').then(m => ({ default: m.TimeWindowSliderV8 })));
const TimeWindowSliderV9 = lazy(() => import('./v9').then(m => ({ default: m.TimeWindowSliderV9 })));
const TimeWindowSliderV10 = lazy(() => import('./v10').then(m => ({ default: m.TimeWindowSliderV10 })));
const TimeWindowSliderV11Lazy = lazy(() => import('./v11').then(m => ({ default: m.TimeWindowSliderV11 })));
const TimeWindowSliderV12Lazy = lazy(() => import('./v12').then(m => ({ default: m.TimeWindowSliderV12 })));
const TimeWindowSliderV13 = lazy(() => import('./v13').then(m => ({ default: m.TimeWindowSliderV13 })));
const TimeWindowSliderV14 = lazy(() => import('./v14').then(m => ({ default: m.TimeWindowSliderV14 })));
const TimeWindowSliderV15 = lazy(() => import('./v15').then(m => ({ default: m.TimeWindowSliderV15 })));
const TimeWindowSliderV16Lazy = lazy(() => import('./v16').then(m => ({ default: m.TimeWindowSliderV16 })));

// Direct exports for Prototype.tsx (these are loaded directly when imported)
export { TimeWindowSliderV11 } from './v11';
export { TimeWindowSliderV12 } from './v12';
export { TimeWindowSliderV13 } from './v13';
export { TimeWindowSliderV14 } from './v14';
export { TimeWindowSliderV15 } from './v15';
export { TimeWindowSliderV16 } from './v16';

export type TimeWindowSliderProps = {
  minMinutes: number;
  maxMinutes: number;
  startMinutes: number;
  endMinutes: number;
  onChange: (next: { startMinutes: number; endMinutes: number }) => void;
  stepMinutes?: number;
  minWindowMinutes?: number;
  className?: string;
  mode?: 'earliest' | 'latest';
  earliestTime?: number;
  onTimeSelect?: (minutes: number) => void;
};

// Component registry with lazy components
const TimeWindowSliderVersions = {
  v1: TimeWindowSliderV1,
  v3: TimeWindowSliderV3,
  v5: TimeWindowSliderV5,
  v8: TimeWindowSliderV8,
  v9: TimeWindowSliderV9,
  v10: TimeWindowSliderV10,
  v11: TimeWindowSliderV11Lazy,
  v12: TimeWindowSliderV12Lazy,
  v13: TimeWindowSliderV13,
  v14: TimeWindowSliderV14,
  v15: TimeWindowSliderV15,
  v16: TimeWindowSliderV16Lazy,
} as const;

export type TimeWindowSliderVersion = keyof typeof TimeWindowSliderVersions;

// Default version (change this to switch the active version)
export const DEFAULT_VERSION: TimeWindowSliderVersion = 'v16';

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
  </div>
);

// Internal component that uses version context
const TimeWindowSliderInternal: React.FC<TimeWindowSliderProps> = (props) => {
  const { getVersion } = useVersion();
  const currentVersion = getVersion('TimeWindowSlider', DEFAULT_VERSION) as TimeWindowSliderVersion;

  const Component = TimeWindowSliderVersions[currentVersion] || TimeWindowSliderVersions[DEFAULT_VERSION];

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// Export the version-aware component
export const TimeWindowSlider = TimeWindowSliderInternal;
