import React from 'react';
import { TimeWindowSliderV1 } from './v1';
import { TimeWindowSliderV3 } from './v3';
import { TimeWindowSliderV5 } from './v5';
import { TimeWindowSliderV8 } from './v8';
import { TimeWindowSliderV9 } from './v9';
import { TimeWindowSliderV10 } from './v10';
import { TimeWindowSliderV11 } from './v11';
import { TimeWindowSliderV12 } from './v12';
import { useVersion } from '../VersionContext';

// Export v11 directly (different props interface)
export { TimeWindowSliderV11 } from './v11';

export type TimeWindowSliderProps = {
  minMinutes: number;
  maxMinutes: number;
  startMinutes: number;
  endMinutes: number;
  onChange: (next: { startMinutes: number; endMinutes: number }) => void;
  stepMinutes?: number;
  minWindowMinutes?: number;
  className?: string;
  // v10 props for two-drawer time selection
  mode?: 'earliest' | 'latest';
  earliestTime?: number;
  onTimeSelect?: (minutes: number) => void;
};

// Component registry - add new versions here
export const TimeWindowSliderVersions = {
  v1: TimeWindowSliderV1,
  v3: TimeWindowSliderV3,
  v5: TimeWindowSliderV5,
  v8: TimeWindowSliderV8,
  v9: TimeWindowSliderV9,
  v10: TimeWindowSliderV10,
  v11: TimeWindowSliderV11,
  v12: TimeWindowSliderV12,
} as const;

export type TimeWindowSliderVersion = keyof typeof TimeWindowSliderVersions;

// Default version (change this to switch the active version)
export const DEFAULT_VERSION: TimeWindowSliderVersion = 'v12';

// Internal component that uses version context
const TimeWindowSliderInternal: React.FC<TimeWindowSliderProps> = (props) => {
  const { getVersion } = useVersion();
  const currentVersion = getVersion('TimeWindowSlider', DEFAULT_VERSION) as TimeWindowSliderVersion;
  
  // Get the component - ensure it exists
  const Component = TimeWindowSliderVersions[currentVersion] || TimeWindowSliderVersions[DEFAULT_VERSION];

  return <Component {...props} />;
};

// Export the version-aware component
export const TimeWindowSlider = TimeWindowSliderInternal;

