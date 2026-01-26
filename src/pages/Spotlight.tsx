import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MorphIcon } from '@/components/ui/MorphIcon';

// Restaurant images
const IMAGES = {
  lilia: 'https://www.figma.com/api/mcp/asset/42ada9b5-0971-4db1-9def-4ab42540666b',
  wenWen: 'https://www.figma.com/api/mcp/asset/99f71627-d94c-4e96-bf91-fe7411ed8219',
  llamaInn: 'https://www.figma.com/api/mcp/asset/db167f43-80c5-4fa1-a801-f366ad05dbb3',
};

// Preload images
const preloadImages = () => {
  Object.values(IMAGES).forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};
preloadImages();

// Mock data
const availableTables = [
  {
    id: '1',
    restaurant: 'Lilia',
    neighborhood: 'Williamsburg',
    cuisine: 'Italian',
    time: '8:00 PM',
    partySize: 4,
    date: 'Friday, January 31',
    image: IMAGES.lilia,
    addedAt: Date.now() - 1000 * 60 * 45,
    claimed: false,
  },
  {
    id: '2',
    restaurant: 'Carbone',
    neighborhood: 'Greenwich Village',
    cuisine: 'Italian-American',
    time: '7:30 PM',
    partySize: 2,
    date: 'Saturday, February 1',
    image: IMAGES.wenWen,
    addedAt: Date.now() - 1000 * 60 * 60 * 3,
    claimed: true,
  },
  {
    id: '3',
    restaurant: 'Don Angie',
    neighborhood: 'West Village',
    cuisine: 'Italian-American',
    time: '9:00 PM',
    partySize: 2,
    date: 'Friday, January 31',
    image: IMAGES.lilia,
    addedAt: Date.now() - 1000 * 60 * 60 * 8,
    claimed: false,
  },
  {
    id: '4',
    restaurant: 'Via Carota',
    neighborhood: 'West Village',
    cuisine: 'Italian',
    time: '6:30 PM',
    partySize: 2,
    date: 'Sunday, February 2',
    image: IMAGES.wenWen,
    addedAt: Date.now() - 1000 * 60 * 60 * 24,
    claimed: true,
  },
  {
    id: '5',
    restaurant: 'Llama Inn',
    neighborhood: 'Williamsburg',
    cuisine: 'Peruvian',
    time: '7:00 PM',
    partySize: 6,
    date: 'Friday, January 31',
    image: IMAGES.llamaInn,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    claimed: false,
  },
];

type TableData = (typeof availableTables)[0];

// Helper to format relative time
const getRelativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return '1d';
  return `${days}d`;
};

// Calculate time until next Sunday noon
const getTimeUntilNextDrop = (): string => {
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
  nextSunday.setHours(12, 0, 0, 0);

  if (now > nextSunday) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  }

  const diff = nextSunday.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

// Hero Card Component - Large featured card
interface HeroCardProps {
  table: TableData;
  onSelect: () => void;
  index: number;
  total: number;
}

const HeroCard: React.FC<HeroCardProps> = ({ table, onSelect, index, total }) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onSelect}
      className="w-full text-left relative"
      whileTap={{ scale: 0.995 }}
    >
      {/* Cinematic image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={table.image}
          alt={table.restaurant}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(10,10,10,0.4) 0%, transparent 40%, transparent 50%, rgba(10,10,10,0.95) 100%)',
          }}
        />
      </div>

      {/* Editorial text overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
        {/* Index number */}
        <span
          className="text-[11px] text-white/40 uppercase tracking-[0.15em] block mb-2"
        >
          {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>

        {/* Restaurant name - large editorial type */}
        <h2
          className="text-[36px] leading-[0.95] tracking-[-0.02em] text-white mb-2"
          style={{
            fontFamily: "'Times New Roman', Georgia, serif",
            fontWeight: 400,
            fontStyle: 'italic',
          }}
        >
          {table.restaurant}
        </h2>

        {/* Metadata line */}
        <p
          className="text-[13px] text-white/50 tracking-[0.01em]"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}
        >
          {table.neighborhood} · {table.time} · {table.partySize} guests
        </p>
      </div>
    </motion.button>
  );
};

// List Card Component - Elegant horizontal card
interface ListCardProps {
  table: TableData;
  index: number;
  total: number;
  onSelect: () => void;
}

const ListCard: React.FC<ListCardProps> = ({ table, index, total, onSelect }) => {
  const isClaimed = table.claimed;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.5,
        delay: 0.1 + index * 0.04,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onClick={isClaimed ? undefined : onSelect}
      className={`w-full text-left relative ${isClaimed ? 'pointer-events-none' : ''}`}
      whileTap={isClaimed ? undefined : { scale: 0.98 }}
    >
      <div className="flex gap-4 py-5 border-t border-white/[0.08]">
        {/* Index number */}
        <div className="w-[28px] flex-shrink-0 pt-1">
          <span className={`text-[11px] tracking-[0.05em] ${isClaimed ? 'text-white/20' : 'text-white/40'}`}>
            {String(index).padStart(2, '0')}
          </span>
        </div>

        {/* Square image */}
        <div className="relative w-[72px] h-[72px] flex-shrink-0 overflow-hidden">
          <img
            src={table.image}
            alt={table.restaurant}
            className={`w-full h-full object-cover ${isClaimed ? 'grayscale opacity-40' : ''}`}
          />
        </div>

        {/* Text content */}
        <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
          {/* Restaurant name */}
          <h3
            className={`text-[20px] leading-[1.1] tracking-[-0.02em] mb-1 ${isClaimed ? 'text-white/30' : 'text-white'}`}
            style={{
              fontFamily: "'Times New Roman', Georgia, serif",
              fontWeight: 400,
              fontStyle: 'italic',
            }}
          >
            {table.restaurant}
          </h3>

          {/* Details */}
          <p className={`text-[12px] tracking-[0.01em] ${isClaimed ? 'text-white/20' : 'text-white/45'}`}>
            {table.neighborhood} · {table.time}
          </p>

          {/* Claimed indicator */}
          {isClaimed && (
            <p className="text-[10px] text-white/25 mt-1.5 uppercase tracking-[0.12em]">
              Claimed
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
};

// Expanded Detail View - Editorial style
interface DetailViewProps {
  table: TableData;
  onClose: () => void;
  onClaim: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({ table, onClose, onClaim }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-[#0a0a0a]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full-bleed image */}
        <div className="relative h-[55%] flex-shrink-0">
          <img
            src={table.image}
            alt={table.restaurant}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(10,10,10,0.4) 0%, transparent 25%, transparent 60%, rgba(10,10,10,1) 100%)',
            }}
          />

          {/* Close button - minimal */}
          <button
            onClick={onClose}
            className="absolute top-[calc(env(safe-area-inset-top)+16px)] right-4 w-10 h-10 rounded-full flex items-center justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content section - refined typography */}
        <div className="flex-1 px-6 -mt-16 flex flex-col overflow-hidden relative z-10">
          {/* Restaurant name - large editorial serif */}
          <h2
            className="text-[44px] leading-[1] tracking-[-0.02em] text-white mb-3"
            style={{
              fontFamily: "'Times New Roman', Georgia, serif",
              fontWeight: 400,
              fontStyle: 'italic',
            }}
          >
            {table.restaurant}
          </h2>

          {/* Cuisine and neighborhood */}
          <p className="text-[14px] text-white/50 mb-8 tracking-[0.01em]">
            {table.cuisine} · {table.neighborhood}
          </p>

          {/* Reservation details - clean typography */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-baseline border-b border-white/[0.06] pb-3">
              <span className="text-[13px] text-white/40 uppercase tracking-[0.1em]">Date</span>
              <span className="text-[16px] text-white">{table.date}</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-white/[0.06] pb-3">
              <span className="text-[13px] text-white/40 uppercase tracking-[0.1em]">Time</span>
              <span className="text-[16px] text-white">{table.time}</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-white/[0.06] pb-3">
              <span className="text-[13px] text-white/40 uppercase tracking-[0.1em]">Party</span>
              <span className="text-[16px] text-white">{table.partySize} guests</span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Claim button - refined */}
          <motion.button
            onClick={onClaim}
            className="w-full h-[54px] border border-white text-white text-[15px] tracking-[0.05em] uppercase flex items-center justify-center"
            whileTap={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            Claim Table
          </motion.button>

          {/* Bottom safe area */}
          <div className="h-6" />
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Spotlight Component
const Spotlight: React.FC = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState(() =>
    [...availableTables].sort((a, b) => Number(a.claimed) - Number(b.claimed))
  );
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [nextDrop, setNextDrop] = useState(getTimeUntilNextDrop());

  useEffect(() => {
    const interval = setInterval(() => {
      setNextDrop(getTimeUntilNextDrop());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = (tableId: string) => {
    setTables((prev) =>
      prev
        .map((t) => (t.id === tableId ? { ...t, claimed: true } : t))
        .sort((a, b) => Number(a.claimed) - Number(b.claimed))
    );
    setSelectedTable(null);
  };

  // All tables in order (available first, then claimed)
  const totalTables = tables.length;

  return (
    <motion.div
      className="fixed inset-0 bg-[#0a0a0a] text-white overflow-hidden"
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
      {/* Scrollable content */}
      <div className="h-full overflow-y-auto pt-[env(safe-area-inset-top)]">
        {/* Fixed header area */}
        <div className="px-5 pt-4 pb-6">
          {/* Back button row */}
          <div className="flex items-center justify-between mb-6">
            <motion.button
              layoutId="spotlight-back-button"
              onClick={() => navigate('/')}
              aria-label="Go back"
              className="w-10 h-10 flex items-center justify-center active:opacity-50 -ml-2"
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

          {/* Editorial title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1
              className="text-[11px] text-white/50 uppercase tracking-[0.2em] mb-2"
            >
              Spotlight
            </h1>
            <p
              className="text-[26px] leading-[1.2] text-white max-w-[300px] mb-2"
              style={{
                fontFamily: "'Times New Roman', Georgia, serif",
                fontWeight: 400,
                fontStyle: 'italic',
              }}
            >
              The hardest tables to book, released every Sunday.
            </p>
            <p className="text-[12px] text-white/35 tracking-[0.02em]">
              Next drop in {nextDrop}
            </p>
          </motion.div>
        </div>

        {/* Hero card for first table */}
        {tables[0] && (
          <div className="px-5 mb-2">
            <HeroCard
              table={tables[0]}
              index={1}
              total={totalTables}
              onSelect={() => setSelectedTable(tables[0])}
            />
          </div>
        )}

        {/* Remaining tables list */}
        <div className="px-5 pb-12">
          <AnimatePresence mode="popLayout">
            {tables.slice(1).map((table, idx) => (
              <ListCard
                key={table.id}
                table={table}
                index={idx + 2}
                total={totalTables}
                onSelect={() => setSelectedTable(table)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail overlay */}
      <AnimatePresence>
        {selectedTable && (
          <DetailView
            table={selectedTable}
            onClose={() => setSelectedTable(null)}
            onClaim={() => handleClaim(selectedTable.id)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Spotlight;
