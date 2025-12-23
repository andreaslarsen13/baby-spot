import React from 'react';
import { VersionSwitcher } from './VersionSwitcher';

type VersionSwitcherOverlayProps = {
  componentName: string;
  currentVersion: string;
  onVersionChange: (version: string) => void;
  isVisible: boolean;
};

/**
 * Version Switcher Overlay
 * Renders at the top level, completely isolated from the app
 */
export const VersionSwitcherOverlay: React.FC<VersionSwitcherOverlayProps> = ({
  componentName,
  currentVersion,
  onVersionChange,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed left-4 top-1/2 -translate-y-1/2 z-[9999] pointer-events-auto"
      style={{ 
        isolation: 'isolate',
        contain: 'layout style paint',
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <VersionSwitcher
        componentName={componentName}
        currentVersion={currentVersion}
        onVersionChange={onVersionChange}
      />
    </div>
  );
};

