import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MorphIcon } from '@/components/ui/MorphIcon';

// Restaurant images from Figma
const IMAGES = {
  lilia: 'https://www.figma.com/api/mcp/asset/42ada9b5-0971-4db1-9def-4ab42540666b',
  wenWen: 'https://www.figma.com/api/mcp/asset/99f71627-d94c-4e96-bf91-fe7411ed8219',
  llamaInn: 'https://www.figma.com/api/mcp/asset/db167f43-80c5-4fa1-a801-f366ad05dbb3',
};

// Preload images on module load for instant display
const preloadImages = () => {
  Object.values(IMAGES).forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};
preloadImages();

// Mock data for available tables
const availableTables = [
  {
    id: '1',
    restaurant: 'Lilia',
    time: '8:00 PM',
    partySize: 4,
    date: 'Fri, Jan 28',
    image: IMAGES.lilia,
  },
  {
    id: '2',
    restaurant: 'Carbone',
    time: '7:30 PM',
    partySize: 2,
    date: 'Sat, Jan 29',
    image: IMAGES.wenWen,
  },
  {
    id: '3',
    restaurant: 'Don Angie',
    time: '9:00 PM',
    partySize: 2,
    date: 'Fri, Jan 28',
    image: IMAGES.lilia,
  },
  {
    id: '4',
    restaurant: 'Via Carota',
    time: '6:30 PM',
    partySize: 2,
    date: 'Sun, Jan 30',
    image: IMAGES.wenWen,
  },
  {
    id: '5',
    restaurant: 'Llama Inn',
    time: '7:00 PM',
    partySize: 6,
    date: 'Fri, Jan 28',
    image: IMAGES.llamaInn,
  },
];

interface SpotlightCardProps {
  table: typeof availableTables[0];
  onClaim: () => void;
  index: number;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ table, onClaim, index }) => {
  return (
    <motion.div
      className="relative w-full h-[158px] rounded-[7px] overflow-hidden flex flex-col items-start justify-end px-[16px] py-[18px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.4,
        delay: 0.15 + index * 0.06,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {/* Background image */}
      <img
        src={table.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover rounded-[7px]"
        aria-hidden="true"
      />

      {/* Gradient overlay - warm brown tint from Figma */}
      <div
        className="absolute inset-0 rounded-[7px]"
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(39, 19, 4, 0.2) 0%, rgba(39, 19, 4, 0.2) 100%), linear-gradient(180deg, rgba(39, 19, 4, 0) 0%, rgba(39, 19, 4, 0.25098) 50%, rgba(39, 19, 4, 0.7) 100%)'
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative flex items-end justify-between w-full gap-[5px]">
        {/* Left - Info */}
        <div className="flex flex-col gap-[2px] flex-1 min-w-0">
          <h3
            className="text-[22px] text-white leading-[26px] tracking-[-0.02em]"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
              fontWeight: 600,
            }}
          >
            {table.restaurant}
          </h3>
          <p
            className="text-[14px] text-white/75 leading-[20px] tracking-[-0.01em]"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              fontWeight: 400,
            }}
          >
            {table.date} · {table.time}
          </p>
          <p
            className="text-[14px] text-white/50 leading-[20px] tracking-[-0.01em]"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              fontWeight: 400,
            }}
          >
            {table.partySize} guests
          </p>
        </div>

        {/* Right - Claim button */}
        <button
          onClick={onClaim}
          className="h-[38px] px-[20px] rounded-[46px] bg-gradient-to-b from-[#313131] to-[rgba(49,49,49,0.5)] active:opacity-80 transition-opacity flex items-center justify-center flex-shrink-0 focus:outline-none"
        >
          <span
            className="text-[15px] text-white/90 tracking-[-0.01em]"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              fontWeight: 500,
            }}
          >
            Claim
          </span>
        </button>
      </div>
    </motion.div>
  );
};

const Spotlight: React.FC = () => {
  const navigate = useNavigate();

  const handleClaim = (tableId: string) => {
    // TODO: Implement claim flow
    console.log('Claiming table:', tableId);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-[#151515] text-white overflow-hidden pt-[env(safe-area-inset-top)]"
      style={{ zIndex: 2 }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{
        type: 'tween',
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {/* Fixed top bar - solid background + back button + fade */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none pt-[env(safe-area-inset-top)]">
        {/* Solid background for back button area - matches TopNav px-4 py-4 */}
        <div className="h-[72px] bg-[#151515] pointer-events-auto">
          <div className="px-4 py-4">
            <motion.button
              layoutId="spotlight-back-button"
              onClick={() => navigate('/')}
              aria-label="Go back"
              className="w-10 h-10 flex items-center justify-center active:opacity-50 bg-[#242424] rounded-[13px]"
              transition={{
                layout: {
                  type: 'tween',
                  duration: 0.35,
                  ease: [0.25, 0.1, 0.25, 1],
                },
              }}
            >
              <MorphIcon isChevron={true} className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
        {/* Fade gradient extending from solid area */}
        <div className="h-[8px] bg-gradient-to-b from-[#151515] to-transparent" />
      </div>

      {/* Scrollable content - header + cards */}
      <div className="h-full overflow-y-auto pt-[72px]">
        {/* Header section */}
        <div className="flex flex-col gap-[8px] px-[25px] w-full">
          <h1
            className="text-[26px] text-white leading-[45px] h-[37px] flex flex-col justify-center"
            style={{
              fontFamily: "'Alte Haas Grotesk', sans-serif",
              fontWeight: 700,
              letterSpacing: '-1px',
              fontFeatureSettings: "'dlig' 1"
            }}
          >
            Spotlight
          </h1>
          <p
            className="text-[17px] text-[#6e6e73] leading-[22px] max-w-[320px] tracking-[-0.01em]"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              fontWeight: 400,
            }}
          >
            The hardest tables to book, released every Sunday at noon.
          </p>
        </div>

        {/* Table List */}
        <div className="flex flex-col gap-[14px] px-[14px] pt-[21px] pb-8">
          {availableTables.map((table, index) => (
            <SpotlightCard
              key={table.id}
              table={table}
              index={index}
              onClaim={() => handleClaim(table.id)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Spotlight;
