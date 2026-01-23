import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MorphIcon } from './MorphIcon';

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
        {/* Spotlight Button - shared element with back button */}
        <motion.button
          layoutId="spotlight-back-button"
          onClick={onSpotlightClick}
          className="w-10 h-10 bg-[#242424] rounded-[13px] flex items-center justify-center active:bg-[#303030]"
          aria-label="Spotlight"
          transition={{
            layout: {
              type: 'tween',
              duration: 0.35,
              ease: [0.25, 0.1, 0.25, 1],
            },
          }}
        >
          <MorphIcon isChevron={false} className="w-6 h-6" />
        </motion.button>

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
