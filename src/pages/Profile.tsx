import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Settings } from 'lucide-react';
import { restaurants } from '@/data/restaurants';

// Mock dining history data
const diningHistory = [
  { restaurantId: '2', date: '2025-01-15', time: '7:30 PM' },
  { restaurantId: '4', date: '2025-01-08', time: '8:00 PM' },
  { restaurantId: '8', date: '2024-12-28', time: '7:00 PM' },
  { restaurantId: '3', date: '2024-12-20', time: '8:30 PM' },
  { restaurantId: '10', date: '2024-12-12', time: '7:30 PM' },
];

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div
      className="bg-[#191919] text-white flex flex-col font-['Inter'] min-h-screen"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      initial={{ x: '30%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '30%', opacity: 0.5 }}
      transition={{
        type: 'tween',
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors -ml-2"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-[17px] font-semibold text-white">Profile</h1>
        </div>
        <button
          onClick={() => navigate('/account')}
          className="w-10 h-10 bg-[#242424] rounded-[13px] flex items-center justify-center active:bg-[#303030] transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-[calc(24px+env(safe-area-inset-bottom))]">
        {/* Integrations Section */}
        <div className="flex flex-col gap-3 mb-8">
          <h2 className="text-[13px] font-semibold text-[#898989] uppercase tracking-[0.5px]">
            Integrations
          </h2>

          {/* Resy Card */}
          <div className="bg-[#252525] rounded-[16px] p-4 border border-[#30302e]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e53935] rounded-[10px] flex items-center justify-center">
                  <span className="text-white text-[14px] font-bold">R</span>
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-[#d4d4d4]">Resy</div>
                  <div className="text-[13px] text-[#898989]">Not connected</div>
                </div>
              </div>
              <button className="h-[36px] px-4 bg-[#fe3400] rounded-[18px] flex items-center justify-center">
                <span className="text-[13px] font-medium text-white">Connect</span>
              </button>
            </div>
          </div>

          {/* OpenTable Card */}
          <div className="bg-[#252525] rounded-[16px] p-4 border border-[#30302e]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#da3743] rounded-[10px] flex items-center justify-center">
                  <span className="text-white text-[14px] font-bold">OT</span>
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-[#d4d4d4]">OpenTable</div>
                  <div className="text-[13px] text-[#898989]">Not connected</div>
                </div>
              </div>
              <button className="h-[36px] px-4 bg-[#fe3400] rounded-[18px] flex items-center justify-center">
                <span className="text-[13px] font-medium text-white">Connect</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dining History Section */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[13px] font-semibold text-[#898989] uppercase tracking-[0.5px]">
            Dining history
          </h2>

          <div className="flex flex-col gap-3">
            {diningHistory.map((visit, index) => {
              const restaurant = restaurants.find(r => r.id === visit.restaurantId);
              if (!restaurant) return null;

              return (
                <div
                  key={index}
                  className="bg-[#252525] rounded-[16px] p-4 border border-[#30302e] flex items-center gap-4"
                >
                  <div
                    className="w-[50px] h-[50px] rounded-[10px] flex-shrink-0"
                    style={{ backgroundColor: restaurant.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-[#d4d4d4] truncate">
                      {restaurant.name}
                    </div>
                    <div className="text-[13px] text-[#898989]">
                      {formatDate(visit.date)} at {visit.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
