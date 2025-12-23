import React from 'react';
import { ComponentLibrary } from './registry';

type VersionSwitcherProps = {
  componentName: string;
  currentVersion: string;
  onVersionChange: (version: string) => void;
};

export const VersionSwitcher: React.FC<VersionSwitcherProps> = ({
  componentName,
  currentVersion,
  onVersionChange,
}) => {
  const component = ComponentLibrary[componentName];
  const versions = component?.versions || [];

  // Only show if there are multiple versions and component exists
  if (!component || versions.length <= 1) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Component Name Label */}
      <div className="mb-2 px-2">
        <div className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider text-center">
          {component.name}
        </div>
      </div>

      {/* Version "App Icons" */}
      {versions.map((version) => {
        const isActive = currentVersion === version.version;
        return (
          <button
            key={version.version}
            onClick={() => onVersionChange(version.version)}
            className={`group relative w-14 h-14 rounded-2xl transition-all duration-200 ${
              isActive
                ? 'bg-[#FE3400] shadow-[0_0_30px_rgba(254,52,0,0.4)] scale-110'
                : 'bg-zinc-800/60 hover:bg-zinc-700/80 hover:scale-105'
            }`}
            title={version.description}
          >
            {/* Version Number */}
            <div className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${
              isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
            }`}>
              {version.version.toUpperCase()}
            </div>
            
            {/* Active Indicator Dot */}
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
          </button>
        );
      })}
    </div>
  );
};

