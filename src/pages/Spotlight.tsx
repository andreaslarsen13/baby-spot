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
    date: 'Fri, Jan 31',
    image: IMAGES.lilia,
    addedAt: Date.now() - 1000 * 60 * 45,
  },
  {
    id: '2',
    restaurant: 'Carbone',
    neighborhood: 'Greenwich Village',
    cuisine: 'Italian-American',
    time: '7:30 PM',
    partySize: 2,
    date: 'Sat, Feb 1',
    image: IMAGES.wenWen,
    addedAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: '3',
    restaurant: 'Don Angie',
    neighborhood: 'West Village',
    cuisine: 'Italian-American',
    time: '9:00 PM',
    partySize: 2,
    date: 'Fri, Jan 31',
    image: IMAGES.lilia,
    addedAt: Date.now() - 1000 * 60 * 60 * 8,
  },
  {
    id: '4',
    restaurant: 'Via Carota',
    neighborhood: 'West Village',
    cuisine: 'Italian',
    time: '6:30 PM',
    partySize: 2,
    date: 'Sun, Feb 2',
    image: IMAGES.wenWen,
    addedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: '5',
    restaurant: 'Llama Inn',
    neighborhood: 'Williamsburg',
    cuisine: 'Peruvian',
    time: '7:00 PM',
    partySize: 6,
    date: 'Fri, Jan 31',
    image: IMAGES.llamaInn,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
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

// Feed Card Component
interface FeedCardProps {
  table: TableData;
  index: number;
  onSelect: () => void;
}

const FeedCard: React.FC<FeedCardProps> = ({ table, index, onSelect }) => {
  const isRecent = Date.now() - table.addedAt < 1000 * 60 * 60 * 2;

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        scale: 0.9,
        y: -20,
        transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onClick={onSelect}
      className="w-full text-left relative"
      whileTap={{ scale: 0.98 }}
    >
      {/* Card container */}
      <div className="relative h-[200px] rounded-[20px] overflow-hidden">
        {/* Background image */}
        <img
          src={table.image}
          alt={table.restaurant}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg,
              rgba(0,0,0,0.1) 0%,
              rgba(0,0,0,0) 40%,
              rgba(0,0,0,0.7) 100%
            )`,
          }}
        />

        {/* Top badge */}
        <div className="absolute top-4 left-4">
          {isRecent ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22c55e]/90 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] font-medium text-white tracking-wide">
                NEW
              </span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
              <span className="text-[11px] text-white/70 tracking-wide">
                {getRelativeTime(table.addedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Restaurant name */}
          <h3
            className="text-[28px] leading-[1] tracking-[-0.02em] text-white mb-1"
            style={{
              fontFamily: "'Alte Haas Grotesk', sans-serif",
              fontWeight: 700,
            }}
          >
            {table.restaurant}
          </h3>

          {/* Details row */}
          <div className="flex items-center gap-2 text-white/60">
            <span className="text-[14px]">{table.date}</span>
            <span className="text-white/30">·</span>
            <span className="text-[14px]">{table.time}</span>
            <span className="text-white/30">·</span>
            <span className="text-[14px]">Party of {table.partySize}</span>
          </div>
        </div>

      </div>
    </motion.button>
  );
};

// Expanded Detail View
interface DetailViewProps {
  table: TableData;
  onClose: () => void;
  onClaim: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({ table, onClose, onClaim }) => {
  const isRecent = Date.now() - table.addedAt < 1000 * 60 * 60 * 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="absolute inset-x-4 bottom-0 top-20 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image section */}
        <div className="relative h-[45%] rounded-t-[28px] overflow-hidden flex-shrink-0">
          <img
            src={table.image}
            alt={table.restaurant}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 60%, rgba(10,10,10,1) 100%)',
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Badge */}
          {isRecent && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#22c55e]">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[12px] font-semibold text-white">Just added</span>
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="flex-1 bg-[#0a0a0a] rounded-b-[28px] px-6 pt-2 pb-8 flex flex-col overflow-hidden">
          {/* Restaurant name */}
          <h2
            className="text-[36px] leading-[1.1] tracking-[-0.03em] text-white mb-1"
            style={{
              fontFamily: "'Alte Haas Grotesk', sans-serif",
              fontWeight: 700,
            }}
          >
            {table.restaurant}
          </h2>

          <p className="text-[15px] text-white/50 mb-6">
            {table.cuisine} · {table.neighborhood}
          </p>

          {/* Reservation details */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
              <span className="text-[11px] uppercase tracking-[0.1em] text-white/40 block mb-1">Date</span>
              <span className="text-[17px] text-white font-medium">{table.date}</span>
            </div>
            <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
              <span className="text-[11px] uppercase tracking-[0.1em] text-white/40 block mb-1">Time</span>
              <span className="text-[17px] text-white font-medium">{table.time}</span>
            </div>
            <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
              <span className="text-[11px] uppercase tracking-[0.1em] text-white/40 block mb-1">Party</span>
              <span className="text-[17px] text-white font-medium">{table.partySize}</span>
            </div>
          </div>

          {/* Added time */}
          <div className="flex items-center gap-2 mb-6 text-white/40">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="text-[13px]">Added {getRelativeTime(table.addedAt)} ago</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Claim button */}
          <motion.button
            onClick={onClaim}
            className="w-full h-[56px] rounded-[16px] bg-white text-[#0a0a0a] font-semibold text-[17px] tracking-[-0.01em] flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            Claim this table
          </motion.button>

          {/* Bottom safe area */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Spotlight Component
const Spotlight: React.FC = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState(availableTables);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [nextDrop, setNextDrop] = useState(getTimeUntilNextDrop());

  useEffect(() => {
    const interval = setInterval(() => {
      setNextDrop(getTimeUntilNextDrop());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = (tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    setSelectedTable(null);
  };

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
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4">
            {/* Back button */}
            <motion.button
              layoutId="spotlight-back-button"
              onClick={() => navigate('/')}
              aria-label="Go back"
              className="w-10 h-10 flex items-center justify-center active:opacity-50 bg-white/5 rounded-full border border-white/10"
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

            {/* Next drop badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span className="text-[12px] text-white/70">
                Next drop in <span className="text-white font-medium">{nextDrop}</span>
              </span>
            </div>

            {/* Spacer for balance */}
            <div className="w-10" />
          </div>
        </div>

        {/* Hero header section */}
        <div className="px-5 pt-2 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1
              className="text-[42px] leading-[1] tracking-[-0.03em] text-white mb-3"
              style={{
                fontFamily: "'Alte Haas Grotesk', sans-serif",
                fontWeight: 700,
              }}
            >
              Spotlight
            </h1>
            <p className="text-[15px] text-white/50 leading-relaxed max-w-[300px]">
              {tables.length} {tables.length === 1 ? 'table' : 'tables'} available this week.
              {' '}New tables drop every Sunday at noon.
            </p>
          </motion.div>
        </div>

        {/* Feed */}
        {tables.length > 0 ? (
          <div className="px-4 pb-8 flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {tables.map((table, index) => (
                <FeedCard
                  key={table.id}
                  table={table}
                  index={index}
                  onSelect={() => setSelectedTable(table)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center px-8 py-20"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 6V14L19 17" stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="14" cy="14" r="10" stroke="white" strokeOpacity="0.4" strokeWidth="2"/>
              </svg>
            </div>
            <h2
              className="text-[22px] tracking-[-0.02em] text-white mb-2"
              style={{
                fontFamily: "'Alte Haas Grotesk', sans-serif",
                fontWeight: 700,
              }}
            >
              All claimed
            </h2>
            <p className="text-[15px] text-white/40 text-center max-w-[260px]">
              Check back throughout the week. New tables appear ad-hoc.
            </p>
          </motion.div>
        )}
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
