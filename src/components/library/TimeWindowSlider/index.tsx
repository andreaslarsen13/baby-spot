import React from 'react';
import { TimeWindowSliderV1 } from './v1';
import { TimeWindowSliderV2 } from './v2';
import { TimeWindowSliderV3 } from './v3';
import { TimeWindowSliderV4 } from './v4';
import { TimeWindowSliderV5 } from './v5';
import { TimeWindowSliderV6 } from './v6';
import { TimeWindowSliderV7 } from './v7';
import { TimeWindowSliderV8 } from './v8';
import { TimeWindowSliderV9 } from './v9';
import { useVersion } from '../VersionContext';

export type TimeWindowSliderProps = {
  minMinutes: number;
  maxMinutes: number;
  startMinutes: number;
  endMinutes: number;
  onChange: (next: { startMinutes: number; endMinutes: number }) => void;
  stepMinutes?: number;
  minWindowMinutes?: number;
  className?: string;
};

// Component registry - add new versions here
export const TimeWindowSliderVersions = {
  v1: TimeWindowSliderV1,
  v2: TimeWindowSliderV2,
  v3: TimeWindowSliderV3,
  v4: TimeWindowSliderV4,
  v5: TimeWindowSliderV5,
  v6: TimeWindowSliderV6,
  v7: TimeWindowSliderV7,
  v8: TimeWindowSliderV8,
  v9: TimeWindowSliderV9,
} as const;

export type TimeWindowSliderVersion = keyof typeof TimeWindowSliderVersions;

// Default version (change this to switch the active version)
export const DEFAULT_VERSION: TimeWindowSliderVersion = 'v1';

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

