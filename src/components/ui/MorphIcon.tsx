import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface MorphIconProps {
  isChevron: boolean;
  className?: string;
}

export const MorphIcon: React.FC<MorphIconProps> = ({ isChevron, className }) => {
  // Animate from opposite state on mount to create transition effect
  const initialRotation = isChevron ? 0 : 180;
  const targetRotation = isChevron ? 180 : 0;

  return (
    <div className={`relative ${className}`} style={{ perspective: '200px' }}>
      <motion.div
        className="w-full h-full"
        initial={{ rotateY: initialRotation }}
        animate={{ rotateY: targetRotation }}
        transition={{
          duration: 0.35,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front: Sparkle icon */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src="/images/sparkle-icon.svg"
            alt=""
            className="w-[23px] h-[23px]"
          />
        </div>

        {/* Back: Chevron icon (pre-rotated 180deg so it appears correct when flipped) */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <ChevronLeft className="w-[24px] h-[24px] text-white" strokeWidth={2.5} />
        </div>
      </motion.div>
    </div>
  );
};

export default MorphIcon;
