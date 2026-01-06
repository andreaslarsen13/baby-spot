import React, { lazy, Suspense } from 'react';
import { useVersion } from '../VersionContext';

// Direct export for Prototype.tsx
export { RestaurantSearchV1 } from './v1';

// Lazy load versions
const RestaurantSearchV1Lazy = lazy(() => import('./v1').then(m => ({ default: m.RestaurantSearchV1 })));

export type RestaurantSearchProps = {
  selectedRestaurants: string[];
  onSelectionChange: (ids: string[]) => void;
  onBack: () => void;
  onContinue: () => void;
  maxSelections?: number;
};

// Component registry
const RestaurantSearchVersions = {
  v1: RestaurantSearchV1Lazy,
} as const;

export type RestaurantSearchVersion = keyof typeof RestaurantSearchVersions;

// Default version
export const DEFAULT_VERSION: RestaurantSearchVersion = 'v1';

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
  </div>
);

// Version-aware component
const RestaurantSearchInternal: React.FC<RestaurantSearchProps> = (props) => {
  const { getVersion } = useVersion();
  const currentVersion = getVersion('RestaurantSearch', DEFAULT_VERSION) as RestaurantSearchVersion;

  const Component = RestaurantSearchVersions[currentVersion] || RestaurantSearchVersions[DEFAULT_VERSION];

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

export const RestaurantSearch = RestaurantSearchInternal;
