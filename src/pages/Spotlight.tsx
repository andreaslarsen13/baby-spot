import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

// Restaurant images from Figma
const IMAGES = {
  lilia: 'https://www.figma.com/api/mcp/asset/42ada9b5-0971-4db1-9def-4ab42540666b',
  wenWen: 'https://www.figma.com/api/mcp/asset/99f71627-d94c-4e96-bf91-fe7411ed8219',
  llamaInn: 'https://www.figma.com/api/mcp/asset/db167f43-80c5-4fa1-a801-f366ad05dbb3',
};

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
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ table, onClaim }) => {
  return (
    <div className="relative w-full h-[158px] rounded-[7px] overflow-hidden flex flex-col items-start justify-end px-[16px] py-[18px]">
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
        <div className="flex flex-col gap-[3px] flex-1 min-w-0">
          <h3
            className="text-[22px] text-white leading-[23px]"
            style={{
              fontFamily: "'Alte Haas Grotesk', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.25px',
              fontFeatureSettings: "'dlig' 1"
            }}
          >
            {table.restaurant}
          </h3>
          <p
            className="text-[14px] text-white leading-[23px] h-[18px] flex flex-col justify-center"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Rounded', sans-serif",
              fontWeight: 500,
              letterSpacing: '0.25px',
              fontFeatureSettings: "'dlig' 1"
            }}
          >
            {table.date} • {table.time}
          </p>
          <p
            className="text-[14px] text-white leading-[23px] h-[18px] flex flex-col justify-center"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Rounded', sans-serif",
              fontWeight: 500,
              letterSpacing: '0.25px',
              fontFeatureSettings: "'dlig' 1"
            }}
          >
            {table.partySize} Guests
          </p>
        </div>

        {/* Right - Claim button */}
        <button
          onClick={onClaim}
          className="h-[37px] w-[84px] rounded-[49px] bg-[#fe3400] active:scale-[0.97] transition-all flex items-center justify-center flex-shrink-0 focus:outline-none p-[10px]"
        >
          <span
            className="text-[15px] text-white leading-[23px]"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Rounded', sans-serif",
              fontWeight: 500,
              letterSpacing: '0.25px',
              fontFeatureSettings: "'dlig' 1"
            }}
          >
            Claim
          </span>
        </button>
      </div>
    </div>
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
        duration: 0.25,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      {/* Fixed top bar - solid background + back button + fade */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none pt-[env(safe-area-inset-top)]">
        {/* Solid background for back button area */}
        <div className="h-[95px] bg-[#151515] pointer-events-auto">
          <div className="pt-[35px] pl-[25px]">
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="w-[40px] h-[40px] flex items-center justify-center active:opacity-50 transition-opacity bg-[#2a2a2a] rounded-[10px]"
            >
              <ChevronLeft className="w-[24px] h-[24px] text-white" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        </div>
        {/* Fade gradient extending from solid area */}
        <div className="h-[30px] bg-gradient-to-b from-[#151515] to-transparent" />
      </div>

      {/* Scrollable content - header + cards */}
      <motion.div
        className="h-full overflow-y-auto pt-[calc(35px+40px+23px)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'tween',
          duration: 0.2,
          delay: 0.1,
          ease: 'easeOut',
        }}
      >
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
            className="text-[18px] text-[#949494] leading-[23px] max-w-[329px]"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Rounded', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.25px',
              fontFeatureSettings: "'dlig' 1"
            }}
          >
            A selection of the hardest to book tables, released every Sunday at noon.
          </p>
        </div>

        {/* Table List */}
        <div className="flex flex-col gap-[14px] px-[14px] pt-[21px] pb-8">
          {availableTables.map((table) => (
            <SpotlightCard
              key={table.id}
              table={table}
              onClaim={() => handleClaim(table.id)}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Spotlight;
