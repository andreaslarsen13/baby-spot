import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, ChevronRight, LogOut, Trash2 } from 'lucide-react';

interface MenuRowProps {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  isDestructive?: boolean;
  showChevron?: boolean;
}

const MenuRow: React.FC<MenuRowProps> = ({
  label,
  onClick,
  icon,
  isDestructive = false,
  showChevron = true,
}) => (
  <button
    onClick={onClick}
    className="w-full h-[52px] px-4 flex items-center justify-between bg-[#252525] active:bg-[#303030] transition-colors"
  >
    <div className="flex items-center gap-3">
      {icon && (
        <div className={isDestructive ? 'text-[#fe0000]' : 'text-[#d4d4d4]'}>
          {icon}
        </div>
      )}
      <span className={`text-[15px] font-medium ${isDestructive ? 'text-[#fe0000]' : 'text-[#d4d4d4]'}`}>
        {label}
      </span>
    </div>
    {showChevron && <ChevronRight className="w-5 h-5 text-[#636366]" />}
  </button>
);

const Account: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('spot_authenticated');
    navigate('/onboarding');
  };

  const handleDeleteAccount = () => {
    // In real app, would show confirmation dialog first
    console.log('Delete account requested');
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
        <h1 className="text-[17px] font-semibold text-white">Account</h1>
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 bg-[#242424] rounded-[13px] flex items-center justify-center active:bg-[#303030] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-[calc(24px+env(safe-area-inset-bottom))]">
        {/* Main Menu Group */}
        <div className="rounded-[16px] overflow-hidden mb-6">
          <MenuRow label="Membership" onClick={() => {}} />
          <div className="h-[1px] bg-[#3d3d3d]" />
          <MenuRow label="Onboarding Guide" onClick={() => {}} />
          <div className="h-[1px] bg-[#3d3d3d]" />
          <MenuRow label="FAQ" onClick={() => {}} />
          <div className="h-[1px] bg-[#3d3d3d]" />
          <MenuRow label="Notifications" onClick={() => {}} />
          <div className="h-[1px] bg-[#3d3d3d]" />
          <MenuRow label="Contact support" onClick={() => {}} />
        </div>

        {/* Logout */}
        <div className="rounded-[16px] overflow-hidden mb-6">
          <MenuRow
            label="Logout"
            onClick={handleLogout}
            icon={<LogOut className="w-5 h-5" />}
            showChevron={false}
          />
        </div>

        {/* Delete Account */}
        <div className="rounded-[16px] overflow-hidden">
          <MenuRow
            label="Delete account"
            onClick={handleDeleteAccount}
            icon={<Trash2 className="w-5 h-5" />}
            isDestructive
            showChevron={false}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Account;
