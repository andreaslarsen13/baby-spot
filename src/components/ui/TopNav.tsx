import React from 'react';
import { cn } from '@/lib/utils';

interface TopNavProps {
  onLogoClick?: () => void;
  onSpotlightClick?: () => void;
  onProfileClick?: () => void;
  className?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  onLogoClick,
  onSpotlightClick,
  onProfileClick,
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-between px-4 py-4", className)}>
      {/* Logo */}
      <button
        onClick={onLogoClick}
        className="active:opacity-70 transition-opacity"
      >
        <img src="/images/spot-wordmark.svg" alt="Spot" className="h-[28px] w-auto" />
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-[7px]">
        {/* Spotlight Button */}
        <button
          onClick={onSpotlightClick}
          className="w-10 h-10 bg-[#242424] rounded-[13px] flex items-center justify-center active:bg-[#303030] transition-colors"
          aria-label="Spotlight"
        >
          <img src="/images/sparkle-icon.svg" alt="" className="w-[23px] h-[23px]" aria-hidden="true" />
        </button>

        {/* Profile Button */}
        <button
          onClick={onProfileClick}
          className="w-10 h-10 bg-[#242424] rounded-[13px] flex items-center justify-center active:bg-[#303030] transition-colors"
          aria-label="Profile"
        >
          <img src="/images/person-icon.svg" alt="" className="w-[23px] h-[23px]" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default TopNav;
