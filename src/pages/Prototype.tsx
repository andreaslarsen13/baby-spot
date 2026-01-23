import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { TopNav } from '@/components/ui/TopNav';
import { restaurants } from '@/data/restaurants';

// Active booking search type
interface ActiveSearch {
  id: string;
  date: string;
  startMinutes: number;
  endMinutes: number;
  partySize: number | string;
  restaurantIds: string[];
  stopTimeOffset: number;
  createdAt: number;
}

// Confirmed reservation type
interface Reservation {
  id: string;
  restaurantId: string;
  date: string;
  timeMinutes: number;
  partySize: number | string;
  confirmationCode: string;
  seatingArea?: string;
  specialRequests?: string;
  createdAt: number;
}
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { TimeWindowSlider, TimeWindowSliderV11, TimeWindowSliderV12, TimeWindowSliderV16 } from "@/components/TimeWindowSlider";
import { RestaurantSearchV1 } from "@/components/library/RestaurantSearch";
import { VersionSwitcherOverlay } from "@/components/library/VersionSwitcherOverlay";
import { useVersion } from "@/components/library/VersionContext";
import {
  PlusButton,
  BackButton,
} from '@/components/ui/buttons';
import {
  PartySizeCard,
} from '@/components/ui/cards';
import { cn } from '@/lib/utils';


// Stop Time Picker - Stepper based design
interface StopTimePickerProps {
  selectedDate: Date | null;
  startTimeMinutes: number | null;
  endTimeMinutes: number | null;
  stopTimeOffset: number;
  onOffsetChange: (offset: number) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const StopTimePicker: React.FC<StopTimePickerProps> = ({
  selectedDate,
  startTimeMinutes,
  endTimeMinutes,
  stopTimeOffset,
  onOffsetChange,
  onConfirm,
  onBack,
}) => {
  const [yoloMode, setYoloMode] = useState(false);

  // Calculate the actual stop time and days offset
  const getStopTime = () => {
    if (yoloMode) return { minutes: endTimeMinutes, daysBack: 0 };
    if (!startTimeMinutes) return null;
    const rawMinutes = startTimeMinutes - stopTimeOffset;
    const daysBack = Math.floor(-rawMinutes / (24 * 60)) + (rawMinutes < 0 ? 1 : 0);
    const normalizedMinutes = ((rawMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
    return { minutes: normalizedMinutes, daysBack };
  };

  const formatTime = (minutes: number) => {
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const meridiem = h24 >= 12 ? 'PM' : 'AM';
    const h12 = ((h24 + 11) % 12) + 1;
    return `${h12}:${m.toString().padStart(2, '0')} ${meridiem}`;
  };

  // Get date label for stop time
  const getDateLabel = (daysBack: number) => {
    if (!selectedDate || daysBack === 0) return null;
    const stopDate = new Date(selectedDate);
    stopDate.setDate(stopDate.getDate() - daysBack);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (stopDate.toDateString() === today.toDateString()) return 'Today';
    if (stopDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return stopDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Format offset in readable text (e.g., "1 hour", "30 minutes", "1 hour 30 minutes")
  const formatOffsetText = (mins: number) => {
    if (mins < 60) return `${mins} minutes`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    const hourText = hours === 1 ? '1 hour' : `${hours} hours`;
    if (remainMins === 0) return hourText;
    return `${hourText} ${remainMins} min`;
  };

  const stopTime = getStopTime();
  const dateLabel = stopTime ? getDateLabel(stopTime.daysBack) : null;

  return (
    <div className="flex flex-col pt-1 px-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="flex items-center gap-[15px] py-2">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors -ml-2"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-[15px] font-bold text-[#d6d6d6] tracking-[0.25px]">
          Search stop time
        </h2>
      </div>

      {/* Time Display + Stepper */}
      <div className="flex flex-col items-center py-6">
        <div className="text-[14px] text-[#8e8e93] mb-2">
          Spot will stop searching at
        </div>
        <div className="text-[56px] font-light text-white tabular-nums tracking-tight">
          {stopTime !== null ? formatTime(stopTime.minutes) : '—'}
        </div>
        {dateLabel && (
          <div className="text-[15px] text-[#8e8e93] mt-1">
            {dateLabel}
          </div>
        )}

        {/* Stepper controls */}
        <div className={cn(
          "flex items-center gap-4 mt-6 transition-opacity",
          yoloMode && "opacity-40"
        )}>
          <button
            onClick={() => onOffsetChange(Math.min(stopTimeOffset + 30, 48 * 60))}
            disabled={yoloMode || stopTimeOffset >= 48 * 60}
            className={cn(
              "w-[52px] h-[52px] rounded-full flex items-center justify-center text-[24px] font-light transition-all",
              yoloMode || stopTimeOffset >= 48 * 60
                ? "bg-[#1c1c1e] text-[#3a3a3c]"
                : "bg-[#252525] text-white active:bg-[#353535]"
            )}
          >
            −
          </button>
          <div className="w-[160px] text-center whitespace-nowrap">
            <span className="text-[15px] font-medium text-[#d5d5d5]">
              {formatOffsetText(stopTimeOffset)}
            </span>
            <span className="text-[15px] font-medium text-[#636366]"> before</span>
          </div>
          <button
            onClick={() => onOffsetChange(Math.max(stopTimeOffset - 30, 30))}
            disabled={yoloMode || stopTimeOffset <= 30}
            className={cn(
              "w-[52px] h-[52px] rounded-full flex items-center justify-center text-[24px] font-light transition-all",
              yoloMode || stopTimeOffset <= 30
                ? "bg-[#1c1c1e] text-[#3a3a3c]"
                : "bg-[#252525] text-white active:bg-[#353535]"
            )}
          >
            +
          </button>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Quick Presets Row */}
        <div className={cn(
          "flex gap-2 transition-opacity",
          yoloMode && "opacity-40"
        )}>
          {[
            { label: '6h before', mins: 6 * 60 },
            { label: '24h before', mins: 24 * 60 },
            { label: '48h before', mins: 48 * 60 },
          ].map(({ label, mins }) => {
            const isSelected = stopTimeOffset === mins;
            return (
              <button
                key={label}
                onClick={() => !yoloMode && onOffsetChange(isSelected ? 60 : mins)}
                disabled={yoloMode}
                className={cn(
                  "flex-1 h-[40px] rounded-[12px] text-[13px] font-medium transition-all",
                  isSelected
                    ? "bg-white text-black"
                    : "bg-[#252525] text-[#8e8e93] active:bg-[#353535]"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Yolo Mode Card */}
        <div className="bg-[#252525] rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#d5d5d5] tracking-[0.25px]">
                Yolo mode
              </span>
              <span className="text-[12px] font-semibold text-[#898989] tracking-[0.25px]">
                Keep searching until latest time
              </span>
            </div>
            {/* iOS Toggle */}
            <button
              onClick={() => setYoloMode(!yoloMode)}
              className={cn(
                "w-[51px] h-[31px] rounded-full relative transition-colors",
                yoloMode ? "bg-[#fe3400]" : "bg-[#39393d]"
              )}
            >
              <div
                className={cn(
                  "absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-[0px_3px_7px_0px_rgba(0,0,0,0.12)] transition-all",
                  yoloMode ? "right-[2px]" : "left-[2px]"
                )}
              />
            </button>
          </div>
        </div>
      </div>


      {/* Confirm button */}
      <button
        onClick={onConfirm}
        className="w-full h-[54px] bg-[#fe3400] rounded-[46px] flex items-center justify-center"
      >
        <span className="text-[15px] font-medium text-white tracking-[0.25px]">
          Confirm
        </span>
      </button>
    </div>
  );
};

// Helper to persist state to localStorage for dev refresh
const usePersistedState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(`prototype_${key}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(`prototype_${key}`, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  return [state, setState];
};

const Prototype: React.FC = () => {
  const navigate = useNavigate();
  const { getVersion, setVersion } = useVersion();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [currentStep, setCurrentStep] = usePersistedState('currentStep', 0);
  const [showVersionSwitcher, setShowVersionSwitcher] = useState(false);

  // Detect mobile/PWA mode
  const isMobile = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.innerWidth <= 768
  );

  // ⌘A hotkey to toggle version switcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'a') {
        e.preventDefault();
        setShowVersionSwitcher(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Force TimeWindowSlider to use v16 as the default (overrides older stored versions)
  useEffect(() => {
    if (getVersion('TimeWindowSlider', 'v16') !== 'v16') {
      setVersion('TimeWindowSlider', 'v16');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedDateStr, setSelectedDateStr] = usePersistedState<string | null>('selectedDate', null);
  const selectedDate = selectedDateStr ? new Date(selectedDateStr) : null;
  const setSelectedDate = (date: Date | null) => setSelectedDateStr(date ? date.toISOString() : null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [flashingCalendarDay, setFlashingCalendarDay] = useState<string | null>(null);
  const [selectedPartySize, setSelectedPartySize] = usePersistedState<number | string | null>('selectedPartySize', null);
  const [timeRange, setTimeRange] = usePersistedState<{ startMinutes: number | null; endMinutes: number | null }>('timeRange', {
    startMinutes: null,
    endMinutes: null,
  });
  const [timeCardExpanded, setTimeCardExpanded] = usePersistedState<'earliest' | 'latest'>('timeCardExpanded', 'earliest');
  const [selectedMealPeriod, setSelectedMealPeriod] = useState(0); // Track meal period for latest time
  const [flashingCard, setFlashingCard] = useState<number | null>(null); // Track which card is flashing
  const [flashingPartySize, setFlashingPartySize] = useState<number | string | null>(null);
  const [selectedRestaurants, setSelectedRestaurants] = usePersistedState<string[]>('selectedRestaurants', []);
  const [editingField, setEditingField] = useState<'date' | 'time' | 'party' | 'spots' | 'stopTime' | null>(null);
  const [stopTimeOffset, setStopTimeOffset] = usePersistedState<number>('stopTimeOffset', 60); // minutes before start time
  const [activeSearches, setActiveSearches] = usePersistedState<ActiveSearch[]>('activeSearches', []);
  const [reservations, setReservations] = usePersistedState<Reservation[]>('reservations', []);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedSearch, setSelectedSearch] = useState<ActiveSearch | null>(null);
  const [showCancelDrawer, setShowCancelDrawer] = useState(false);

  // Initialize with demo data (temporary - for testing)
  useEffect(() => {
    // Demo active search
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(0, 0, 0, 0);
    setActiveSearches([{
      id: 'demo-search-1',
      date: dayAfterTomorrow.toISOString(),
      startMinutes: 19 * 60 + 30, // 7:30 PM
      endMinutes: 22 * 60, // 10:00 PM
      partySize: 4,
      restaurantIds: ['2', '4', '8'], // Lilia, Via Carota, Don Angie
      stopTimeOffset: 60,
      createdAt: Date.now(),
    }]);

    // Demo reservation for testing
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    setReservations([{
      id: 'demo-1',
      restaurantId: '2', // Lilia
      date: tomorrow.toISOString(),
      timeMinutes: 19 * 60 + 30, // 7:30 PM
      partySize: 2,
      confirmationCode: 'SPT-2847',
      seatingArea: 'Dining Room',
      createdAt: Date.now(),
    }]);
  }, []);

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const resetBookingFlow = () => {
    setSelectedDate(null);
    setShowCalendar(false);
    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setFlashingCalendarDay(null);
    setSelectedPartySize(null);
    setTimeRange({ startMinutes: null, endMinutes: null });
    setTimeCardExpanded('earliest');
    setSelectedMealPeriod(0);
    setFlashingCard(null);
    setFlashingPartySize(null);
    setSelectedRestaurants([]);
    setEditingField(null);
    setStopTimeOffset(60);
    setCurrentStep(0);
  };

  const handleFinish = () => {
    // Save the active search and show confirmation
    if (selectedDate && timeRange.startMinutes !== null && timeRange.endMinutes !== null && selectedPartySize && selectedRestaurants.length > 0) {
      const newSearch: ActiveSearch = {
        id: Date.now().toString(),
        date: selectedDate.toISOString(),
        startMinutes: timeRange.startMinutes,
        endMinutes: timeRange.endMinutes,
        partySize: selectedPartySize,
        restaurantIds: selectedRestaurants,
        stopTimeOffset: stopTimeOffset,
        createdAt: Date.now(),
      };
      setActiveSearches(prev => [newSearch, ...prev]);
      // Show Search in Progress drawer as confirmation
      setSelectedSearch(newSearch);
    }
    resetBookingFlow();
  };

  const cancelSearch = (id: string) => {
    setActiveSearches(prev => prev.filter(s => s.id !== id));
  };

  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Step 2: start-time window configuration (7:00 AM – 10:30 PM)
  const minTimeMinutes = 6 * 60;
  const maxTimeMinutes = 23 * 60 + 30;

  const formatMinutes = (minutes: number) => {
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const meridiem = h24 >= 12 ? 'PM' : 'AM';
    const h12 = ((h24 + 11) % 12) + 1;
    return `${h12}:${m.toString().padStart(2, '0')} ${meridiem}`;
  };

  // Get stop time based on offset
  const getStopTimeMinutes = () => {
    if (!timeRange.startMinutes) return null;
    return timeRange.startMinutes - stopTimeOffset;
  };

  const getStopTimeLabel = () => {
    const stopMins = getStopTimeMinutes();
    if (stopMins === null) return '—';
    return formatMinutes(stopMins);
  };


  // Format time for display
  const formatTimeShort = (minutes: number) => {
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const meridiem = h24 >= 12 ? 'PM' : 'AM';
    const h12 = ((h24 + 11) % 12) + 1;
    return `${h12}:${m.toString().padStart(2, '0')} ${meridiem}`;
  };

  // Screen content - shared between native and mockup modes
  const screenContent = (
    <>
      {/* Top Navigation */}
      <TopNav
        onLogoClick={() => isMobile && navigate('/onboarding')}
        onSpotlightClick={() => navigate('/spotlight')}
        onProfileClick={() => navigate('/profile')}
      />

      {/* Home Content */}
      <div className="px-4 py-2 flex-1 overflow-y-auto">
        {/* Empty state message - only show if no reservations AND no active searches */}
        {reservations.length === 0 && activeSearches.length === 0 && (
          <p className="text-[20px] leading-[28px] tracking-[-0.4px]">
            <span className="font-light text-[#898989]">Welcome, </span>
            <span className="font-semibold text-[#D6D6D6]">Antonio</span>
            <span className="font-light text-[#898989]">. Start a search to find a table.</span>
          </p>
        )}

        {/* Reservation Cards */}
        {reservations.length > 0 && (
          <div className="flex flex-col gap-3 mt-2">
            {reservations.map((reservation) => {
              const resDate = new Date(reservation.date);
              const restaurant = restaurants.find(r => r.id === reservation.restaurantId) || restaurants[0];

              return (
                <button
                  key={reservation.id}
                  onClick={() => setSelectedReservation(reservation)}
                  className="bg-[#252525] rounded-[10px] p-4 border-[0.75px] border-[#30302e] w-full text-left active:bg-[#2a2a2a] transition-colors">
                  {/* Top row: Date/time/guests + Booked status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[16px] font-semibold text-[#d6d6d6] tracking-[0.25px]">
                        {resDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="text-[13px] text-[#898989] mt-1 tracking-[0.25px]">
                        {formatTimeShort(reservation.timeMinutes)} for {reservation.partySize} {reservation.partySize === 1 ? 'guest' : 'guests'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-[7px] h-[7px] rounded-full bg-[#04ff3f]" />
                      <span className="text-[11px] text-[#898989] tracking-[0.25px]">Booked</span>
                    </div>
                  </div>

                  {/* Bottom row: Restaurant image + name/neighborhood */}
                  <div className="flex items-center gap-4 mt-4">
                    <div
                      className="w-[42px] h-[61px] rounded-[10px] flex-shrink-0"
                      style={{ backgroundColor: restaurant?.color || '#3a3a3c' }}
                    />
                    <div>
                      <div className="text-[16px] font-semibold text-[#d4d4d4] tracking-[0.25px]">
                        {restaurant?.name || 'Restaurant'}
                      </div>
                      <div className="text-[13px] text-[#898989] mt-0.5 tracking-[0.25px]">
                        {restaurant?.neighborhood || ''}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Search Cards */}
        {activeSearches.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            {activeSearches.map((search) => {
              const searchDate = new Date(search.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              const isToday = searchDate.toDateString() === today.toDateString();
              const isTomorrow = searchDate.toDateString() === tomorrow.toDateString();
              const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : searchDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

              return (
                <button
                  key={search.id}
                  onClick={() => setSelectedSearch(search)}
                  className="bg-[#1f1f1f] rounded-[10px] p-4 border-[0.75px] border-[#30302e] w-full text-left active:bg-[#252525] transition-colors"
                >
                  {/* Top row: Date + Searching status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[16px] font-semibold text-[#d6d6d6] tracking-[0.25px]">
                        {dateLabel}
                      </div>
                      <div className="text-[13px] text-[#898989] mt-1 tracking-[0.25px]">
                        {formatTimeShort(search.startMinutes)} - {formatTimeShort(search.endMinutes)} for {search.partySize} {Number(search.partySize) === 1 ? 'guest' : 'guests'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-[7px] h-[7px] rounded-full bg-[#ffce04]" />
                      <span className="text-[11px] text-[#898989] tracking-[0.25px]">Searching</span>
                    </div>
                  </div>

                  {/* Bottom row: Restaurant pills */}
                  <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar">
                    {search.restaurantIds.map((id) => {
                      const restaurant = restaurants.find(r => r.id === id);
                      if (!restaurant) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2 bg-[#252525] rounded-full px-2 py-1.5 flex-shrink-0"
                        >
                          <div
                            className="w-[24px] h-[24px] rounded-full flex-shrink-0"
                            style={{ backgroundColor: restaurant.color }}
                          />
                          <span className="text-[13px] text-[#d4d4d4] tracking-[0.25px] pr-1">
                            {restaurant.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="mt-auto mb-8 flex justify-center">
        <PlusButton onClick={() => setCurrentStep(1)} />
      </div>
    </>
  );

  return (
    <>
      <motion.div
        ref={setContainer}
        className="bg-[#191919] text-white flex flex-col font-['Inter']"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      initial={{ x: '-30%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-30%', opacity: 0.5 }}
      transition={{
        type: 'tween',
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {/* Version Switcher Overlay - toggle with [space][space] */}
      <VersionSwitcherOverlay
        componentName="TimeWindowSlider"
        currentVersion={getVersion('TimeWindowSlider', 'v16')}
        onVersionChange={(version) => setVersion('TimeWindowSlider', version)}
        isVisible={showVersionSwitcher}
      />

      {screenContent}

          {/* Step 1: When? */}
          <Drawer open={currentStep === 1} onOpenChange={(open) => {
            if (!open) {
              if (editingField) {
                setEditingField(null);
                setCurrentStep(5);
              } else {
                resetBookingFlow();
              }
            }
          }}>
            <DrawerContent
              container={container}
              className="bg-[#191919] border-0 text-white outline-none !absolute h-auto"
              overlayClassName="!absolute"
            >
              <div className="flex flex-col gap-[4px] pt-[6px] px-[20px]">
                {/* Header */}
                <div className="flex items-center">
                  {showCalendar && (
                    <button
                      onClick={() => setShowCalendar(false)}
                      className="w-[40px] h-[40px] flex items-center justify-center rounded-full active:bg-white/10 transition-colors -ml-[10px] mr-[5px]"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                  )}
                  <h2 className="text-[16px] font-bold text-[#d6d6d6] tracking-[0.25px]">
                    {showCalendar ? 'Select a date' : 'When do you need a table?'}
                  </h2>
                </div>

                {!showCalendar ? (
                  /* Date selection - scrollable list with fade */
                  <div className="relative h-[420px]">
                    {/* Top fade */}
                    <div className="absolute top-0 left-0 right-0 h-[20px] bg-gradient-to-b from-[#191919] to-transparent z-10 pointer-events-none" />
                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-t from-[#191919] to-transparent z-10 pointer-events-none" />

                    <div className="overflow-y-auto h-full py-[20px] no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <div className="flex flex-col gap-[8px]">
                        {Array.from({ length: 7 }).map((_, i) => {
                          const date = new Date(now);
                          date.setDate(now.getDate() + i);
                          const isToday = i === 0;
                          const dayLabel = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' });
                          const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          const isSelected = selectedDate?.toDateString() === date.toDateString();
                          const isActive = flashingCard === i || isSelected;

                          return (
                            <button
                              key={i}
                              onClick={() => {
                                setFlashingCard(i);
                                setSelectedDate(date);
                                setTimeout(() => {
                                  if (editingField === 'date') {
                                    setEditingField(null);
                                    setCurrentStep(5);
                                  } else {
                                    handleNextStep();
                                  }
                                }, 200);
                              }}
                              className={cn(
                                "flex-shrink-0 h-[64px] rounded-[12px] flex items-center justify-between px-[18px] transition-all duration-100",
                                isActive
                                  ? "bg-[#FE3400]"
                                  : "bg-[#252525]"
                              )}
                            >
                              <span className={cn(
                                "text-[15px] font-medium transition-colors duration-100",
                                isActive ? "text-white" : "text-white/90"
                              )}>{dayLabel}</span>
                              <span className={cn(
                                "text-[14px] tabular-nums transition-colors duration-100",
                                isActive ? "text-white/70" : "text-white/40"
                              )}>{monthDay}</span>
                            </button>
                          );
                        })}
                        {/* More dates button */}
                        <button
                          onClick={() => setShowCalendar(true)}
                          className="flex-shrink-0 h-[64px] rounded-[12px] flex items-center justify-center gap-[8px] px-[18px] bg-[#252525] transition-all duration-100 active:bg-[#303030]"
                        >
                          <Calendar className="w-5 h-5 text-white/50" />
                          <span className="text-[15px] font-medium text-white/50">More dates</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Calendar view */
                  <div className="flex flex-col gap-[13px] pb-[calc(20px+env(safe-area-inset-bottom))]">
                    {/* Header with month nav */}
                    <div className="flex items-center justify-between mt-[10px]">
                      <span className="text-[17px] font-semibold text-white tracking-[-0.4px]">
                        {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                          className="p-1 active:opacity-50 transition-opacity"
                        >
                          <ChevronLeft className="w-5 h-5 text-[#FF453A]" />
                        </button>
                        <button
                          onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                          className="p-1 active:opacity-50 transition-opacity"
                        >
                          <ChevronRight className="w-5 h-5 text-[#FF453A]" />
                        </button>
                      </div>
                    </div>

                    {/* Day headers */}
                    <div className="flex justify-between">
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
                        <div key={i} className="w-[40px] text-center">
                          <span className="text-[13px] font-semibold text-white/30 tracking-[-0.08px]">{d}</span>
                        </div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    {(() => {
                      const year = calendarMonth.getFullYear();
                      const month = calendarMonth.getMonth();
                      const firstDay = new Date(year, month, 1).getDay();
                      const daysInMonth = new Date(year, month + 1, 0).getDate();

                      const cells: (number | null)[] = [];
                      for (let i = 0; i < firstDay; i++) cells.push(null);
                      for (let d = 1; d <= daysInMonth; d++) cells.push(d);
                      while (cells.length % 7 !== 0) cells.push(null);

                      const rows: (number | null)[][] = [];
                      for (let i = 0; i < cells.length; i += 7) {
                        rows.push(cells.slice(i, i + 7));
                      }

                      return (
                        <div className="flex flex-col">
                          {rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex justify-between py-[10px]">
                              {row.map((day, colIndex) => {
                                if (day === null) {
                                  return <div key={colIndex} className="w-[40px] h-[40px]" />;
                                }

                                const date = new Date(year, month, day);
                                const dateStr = date.toDateString();
                                const isPast = date < now;
                                const isToday = dateStr === now.toDateString();
                                const isSelected = selectedDate?.toDateString() === dateStr;
                                const isActive = flashingCalendarDay === dateStr || isSelected;

                                return (
                                  <button
                                    key={colIndex}
                                    disabled={isPast}
                                    onClick={() => {
                                      setFlashingCalendarDay(dateStr);
                                      setSelectedDate(date);
                                      setTimeout(() => {
                                        if (editingField === 'date') {
                                          setEditingField(null);
                                          setCurrentStep(5);
                                        } else {
                                          handleNextStep();
                                        }
                                      }, 200);
                                    }}
                                    className={cn(
                                      "w-[40px] h-[40px] flex flex-col items-center justify-center rounded-full transition-all duration-100",
                                      isPast
                                        ? 'text-zinc-700'
                                        : isActive
                                          ? 'bg-[#FE3400] text-white'
                                          : 'text-white'
                                    )}
                                  >
                                    <span className="text-[20px] font-normal tracking-[0.38px]">{day}</span>
                                    {isToday && !isActive && <div className="w-[5px] h-[5px] rounded-full bg-[#FE3400] -mt-1" />}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </DrawerContent>
          </Drawer>

          {/* Step 2: Time Selection (stacked cards) */}
          <Drawer open={currentStep === 2} onOpenChange={(open) => {
            if (!open) {
              if (editingField) {
                setEditingField(null);
                setCurrentStep(5);
              } else {
                resetBookingFlow();
              }
            }
          }}>
            <DrawerContent
              container={container}
              className="bg-[#191919] border-0 text-white outline-none !absolute h-auto max-h-[88%] flex flex-col"
              overlayClassName="!absolute"
            >
              {(() => {
                const version = getVersion('TimeWindowSlider', 'v16');
                // V16 handles its own layout
                if (version === 'v16') {
                  return (
                    <TimeWindowSliderV16
                      key={timeCardExpanded}
                      title={timeCardExpanded === 'earliest' ? "Earliest start time?" : "Latest start time?"}
                      minMinutes={
                        timeCardExpanded === 'earliest'
                          ? minTimeMinutes
                          : (timeRange.startMinutes ?? minTimeMinutes) + 30
                      }
                      maxMinutes={maxTimeMinutes}
                      value={timeCardExpanded === 'earliest' ? timeRange.startMinutes : timeRange.endMinutes}
                      earliestTime={timeCardExpanded === 'latest' ? timeRange.startMinutes ?? undefined : undefined}
                      mealPeriodIndex={timeCardExpanded === 'latest' ? selectedMealPeriod : undefined}
                      onMealPeriodChange={setSelectedMealPeriod}
                      className=""
                      onBack={timeCardExpanded === 'earliest' ? () => setCurrentStep(1) : () => setTimeCardExpanded('earliest')}
                      onChange={(minutes: number) => {
                        if (timeCardExpanded === 'earliest') {
                          setTimeRange(prev => ({ ...prev, startMinutes: minutes }));
                        } else {
                          setTimeRange(prev => ({ ...prev, endMinutes: minutes }));
                        }
                      }}
                      onConfirm={() => {
                        if (timeCardExpanded === 'earliest') {
                          setTimeCardExpanded('latest');
                        } else {
                          if (editingField === 'time') {
                            setEditingField(null);
                            setCurrentStep(5);
                          } else {
                            handleNextStep();
                          }
                        }
                      }}
                    />
                  );
                }
                // V11, V12 use old layout with header
                if (version === 'v11' || version === 'v12') {
                  const SliderComponent = version === 'v12' ? TimeWindowSliderV12 : TimeWindowSliderV11;
                  return (
                    <div className="flex flex-col h-full">
                      <DrawerHeader className="pt-1 pb-0 px-5">
                        <div className="flex items-center gap-[15px]">
                          <BackButton onClick={() => {
                            if (timeCardExpanded === 'latest') {
                              setTimeCardExpanded('earliest');
                            } else {
                              setCurrentStep(1);
                            }
                          }} />
                          <DrawerTitle className="text-[15px] font-bold text-[#d6d6d6] tracking-[0.25px]">
                            {timeCardExpanded === 'earliest' ? "Earliest start time?" : "Latest start time?"}
                          </DrawerTitle>
                        </div>
                      </DrawerHeader>
                      <div className="px-5 pb-6">
                        <SliderComponent
                          key={timeCardExpanded}
                          title={timeCardExpanded === 'earliest' ? "Earliest start time?" : "Latest start time?"}
                          minMinutes={timeCardExpanded === 'earliest' ? minTimeMinutes : timeRange.startMinutes + 30}
                          maxMinutes={maxTimeMinutes}
                          value={timeCardExpanded === 'earliest' ? timeRange.startMinutes : timeRange.endMinutes}
                          onChange={(minutes: number) => {
                            if (timeCardExpanded === 'earliest') {
                              setTimeRange(prev => ({ ...prev, startMinutes: minutes }));
                            } else {
                              setTimeRange(prev => ({ ...prev, endMinutes: minutes }));
                            }
                          }}
                          onConfirm={() => {
                            if (timeCardExpanded === 'earliest') {
                              setTimeRange(prev => ({ ...prev, endMinutes: prev.startMinutes + 30 }));
                              setTimeCardExpanded('latest');
                            } else {
                              if (editingField === 'time') {
                                setEditingField(null);
                                setCurrentStep(5);
                              } else {
                                handleNextStep();
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                }
                // All other versions: Single component for both times
                return (
                  <TimeWindowSlider
                    minMinutes={minTimeMinutes}
                    maxMinutes={maxTimeMinutes}
                    startMinutes={timeRange.startMinutes}
                    endMinutes={timeRange.endMinutes}
                    onChange={({ startMinutes, endMinutes }) => {
                      setTimeRange({ startMinutes, endMinutes });
                      if (editingField === 'time') {
                        setEditingField(null);
                        setCurrentStep(5);
                      } else {
                        handleNextStep();
                      }
                    }}
                  />
                );
              })()}
            </DrawerContent>
          </Drawer>

          {/* Step 3: How many? */}
          <Drawer open={currentStep === 3} onOpenChange={(open) => {
            if (!open) {
              if (editingField) {
                setEditingField(null);
                setCurrentStep(5);
              } else {
                resetBookingFlow();
              }
            }
          }}>
            <DrawerContent
              container={container}
              className="bg-[#191919] border-0 text-white outline-none !absolute h-auto max-h-[85%]"
              overlayClassName="!absolute"
            >
              <div className="flex flex-col overflow-hidden">
                <DrawerHeader className="pt-1 pb-0 px-5">
                  <div className="flex items-center gap-[15px]">
                    <BackButton onClick={() => setCurrentStep(2)} />
                    <DrawerTitle className="text-[15px] font-bold text-[#d6d6d6] tracking-[0.25px]">
                      How many people?
                    </DrawerTitle>
                  </div>
                </DrawerHeader>

                <div className="overflow-y-auto no-scrollbar px-5 pt-6 pb-[calc(24px+env(safe-area-inset-bottom))]">
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map((count) => (
                      <PartySizeCard
                        key={count}
                        count={count}
                        isSelected={selectedPartySize === count}
                        isFlashing={flashingPartySize === count}
                        onClick={() => {
                          setFlashingPartySize(count);
                          setSelectedPartySize(count);
                          setTimeout(() => {
                            if (editingField === 'party') {
                              setEditingField(null);
                              setCurrentStep(5);
                            } else {
                              handleNextStep();
                            }
                          }, 200);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Step 4: Find a Spot (Restaurant Selection) - Full Screen */}
          {currentStep === 4 && (
            <div className="absolute inset-0 z-50 bg-[#151515]">
              <RestaurantSearchV1
                selectedRestaurants={selectedRestaurants}
                onSelectionChange={setSelectedRestaurants}
                onBack={() => {
                  if (editingField === 'spots') {
                    setEditingField(null);
                    setCurrentStep(5);
                  } else {
                    setCurrentStep(3);
                  }
                }}
                onContinue={() => {
                  if (editingField === 'spots') {
                    setEditingField(null);
                  }
                  setCurrentStep(5);
                }}
                maxSelections={5}
              />
            </div>
          )}

          {/* Step 5: Summary & Confirmation */}
          <Drawer open={currentStep === 5} onOpenChange={(open) => !open && resetBookingFlow()}>
            <DrawerContent
              container={container}
              className="bg-[#191919] border-0 text-white outline-none !absolute h-auto max-h-[90%]"
              overlayClassName="!absolute"
            >
              <div className="flex flex-col gap-4 pt-1 px-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
                {/* Header */}
                <div className="flex items-center justify-between py-2">
                  <h2 className="text-[15px] font-bold text-[#d6d6d6] tracking-[0.25px]">
                    Confirm Booking Plan
                  </h2>
                  <button
                    onClick={resetBookingFlow}
                    className="h-[33px] px-4 bg-[#252525] rounded-[49px] flex items-center justify-center"
                  >
                    <span className="text-[12px] font-medium text-[#d5d5d5] tracking-[-0.25px]">
                      Restart
                    </span>
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Spots Card */}
                  <div className="bg-[#252525] rounded-2xl p-4 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.02)]">
                    <button
                      onClick={() => {
                        setEditingField('spots');
                        setCurrentStep(4);
                      }}
                      className="w-full flex items-center justify-between mb-3"
                    >
                      <span className="text-[14px] font-medium text-[#d5d5d5] tracking-[-0.25px]">
                        Restaurants
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] font-medium text-white tracking-[-0.408px]">
                          {selectedRestaurants.length}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#d5d5d5]" />
                      </div>
                    </button>
                    <div className="flex gap-[5px] overflow-x-auto no-scrollbar">
                      {selectedRestaurants.map((id) => {
                        const restaurant = restaurants.find(r => r.id === id);
                        if (!restaurant) return null;
                        return (
                          <div key={id} className="flex flex-col gap-[3px] items-center flex-shrink-0 w-[89px]">
                            <div
                              className="w-full h-[79px] rounded-[4px]"
                              style={{ backgroundColor: restaurant.color }}
                            />
                            <span className="text-[10px] text-[#d6d6d6] tracking-[0.25px] text-center w-full truncate">
                              {restaurant.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Settings Rows */}
                  <div className="rounded-2xl overflow-hidden">
                    {/* Date */}
                    <button
                      onClick={() => {
                        setEditingField('date');
                        setCurrentStep(1);
                      }}
                      className="w-full bg-[#252525] h-12 px-4 flex items-center justify-between"
                    >
                      <span className="text-[14px] font-medium text-[#d5d5d5] tracking-[-0.408px]">
                        Date
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-[#d5d5d5] tracking-[-0.408px]">
                          {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#d5d5d5]" />
                      </div>
                    </button>
                    {/* Start Time */}
                    <button
                      onClick={() => {
                        setEditingField('time');
                        setTimeCardExpanded('earliest');
                        setCurrentStep(2);
                      }}
                      className="w-full bg-[#252525] h-12 px-4 flex items-center justify-between border-t border-[#3d3d3d]"
                    >
                      <span className="text-[14px] font-medium text-[#d5d5d5] tracking-[-0.408px]">
                        Time Window
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-[#d5d5d5] tracking-[-0.408px]">
                          {timeRange.startMinutes !== null && timeRange.endMinutes !== null
                            ? `${formatMinutes(timeRange.startMinutes)} - ${formatMinutes(timeRange.endMinutes)}`
                            : '—'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#d5d5d5]" />
                      </div>
                    </button>
                    {/* Party Size */}
                    <button
                      onClick={() => {
                        setEditingField('party');
                        setCurrentStep(3);
                      }}
                      className="w-full bg-[#252525] h-12 px-4 flex items-center justify-between border-t border-[#3d3d3d]"
                    >
                      <span className="text-[14px] font-medium text-[#d5d5d5] tracking-[-0.408px]">
                        Guests
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-[#d5d5d5] tracking-[-0.408px]">
                          {selectedPartySize ?? '—'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#d5d5d5]" />
                      </div>
                    </button>
                    {/* Search will stop at */}
                    <button
                      onClick={() => {
                        setEditingField('stopTime');
                        setCurrentStep(6);
                      }}
                      className="w-full bg-[#252525] h-12 px-4 flex items-center justify-between border-t border-[#3d3d3d]"
                    >
                      <span className="text-[14px] font-medium text-[#d5d5d5] tracking-[-0.408px]">
                        Search Stop Time
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-[#d5d5d5] tracking-[-0.408px]">
                          {getStopTimeLabel()}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#d5d5d5]" />
                      </div>
                    </button>
                  </div>

                  {/* Winter Mode Card */}
                  <div className="bg-[#252525] rounded-2xl px-4 py-3 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold text-[#d5d5d5] tracking-[0.25px]">
                          Winter mode on
                        </span>
                        <span className="text-[12px] font-semibold text-[#898989] tracking-[0.25px]">
                          Indoor tables only
                        </span>
                      </div>
                      {/* iOS Toggle */}
                      <button className="w-[51px] h-[31px] bg-[#65c466] rounded-full relative">
                        <div className="absolute right-[2px] top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-[0px_3px_7px_0px_rgba(0,0,0,0.12)]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activate Spot Button */}
                <button
                  onClick={handleFinish}
                  className="w-full h-[54px] bg-[#fe3400] rounded-[46px] flex items-center justify-center"
                >
                  <span className="text-[15px] font-medium text-white tracking-[0.25px]">
                    Activate Spot
                  </span>
                </button>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Step 6: Stop Time Selection */}
          <Drawer open={currentStep === 6} onOpenChange={(open) => {
            if (!open) {
              setEditingField(null);
              setCurrentStep(5);
            }
          }}>
            <DrawerContent
              container={container}
              className="bg-[#191919] border-0 text-white outline-none !absolute h-auto"
              overlayClassName="!absolute"
            >
              <StopTimePicker
                selectedDate={selectedDate}
                startTimeMinutes={timeRange.startMinutes}
                endTimeMinutes={timeRange.endMinutes}
                stopTimeOffset={stopTimeOffset}
                onOffsetChange={setStopTimeOffset}
                onConfirm={() => {
                  setEditingField(null);
                  setCurrentStep(5);
                }}
                onBack={() => {
                  setEditingField(null);
                  setCurrentStep(5);
                }}
              />
            </DrawerContent>
          </Drawer>

          {/* Reservation Details Drawer */}
          <Drawer open={selectedReservation !== null} onOpenChange={(open) => !open && setSelectedReservation(null)}>
            <DrawerContent
              container={container}
              className="bg-[#191919] border-0 text-white outline-none !absolute h-auto max-h-[85%]"
              overlayClassName="!absolute"
            >
              {selectedReservation && (() => {
                const restaurant = restaurants.find(r => r.id === selectedReservation.restaurantId) || restaurants[0];
                const resDate = new Date(selectedReservation.date);
                const formattedDate = resDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                });

                // Mock address based on restaurant (in real app this would come from data)
                const addresses: Record<string, string> = {
                  '1': '115 St Marks Pl',
                  '2': '567 Union Ave',
                  '3': '652 10th Ave',
                  '4': '51 Grove St',
                  '5': '119 Delancey St',
                  '6': '10 Columbus Cir',
                  '7': '104 E 30th St',
                  '8': '103 Greenwich Ave',
                  '9': '134 Eldridge St',
                  '10': '29 Hudson Yards',
                };
                const address = addresses[selectedReservation.restaurantId] || '123 Restaurant St';

                return (
                  <div className="flex flex-col gap-[25px] pt-5 px-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
                    {/* Header */}
                    <div className="flex flex-col gap-3">
                      <h2 className="text-[15px] font-semibold text-[#d6d6d6] tracking-[0.25px]">
                        Reservation details
                      </h2>
                      <p className="text-[15px] text-[#848486] tracking-[0.25px] leading-[23px]">
                        Spot booked you a table for {selectedReservation.partySize} on {formattedDate} at {formatTimeShort(selectedReservation.timeMinutes)}.
                      </p>
                    </div>

                    {/* Restaurant Card */}
                    <div className="flex items-center gap-[17px]">
                      <div
                        className="w-[58px] h-[85px] rounded-[10px] flex-shrink-0"
                        style={{ backgroundColor: restaurant?.color || '#3a3a3c' }}
                      />
                      <div className="flex flex-col gap-[3px]">
                        <div className="text-[16px] font-semibold text-[#d4d4d4] tracking-[0.25px] leading-[23px]">
                          {restaurant?.name || 'Restaurant'}
                        </div>
                        <div className="text-[13px] text-[#898989] tracking-[0.25px] leading-[23px]">
                          {address}
                        </div>
                        {selectedReservation.seatingArea && (
                          <div className="text-[13px] text-[#898989] tracking-[0.25px] leading-[23px]">
                            {selectedReservation.seatingArea}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                      <button className="w-full h-[54px] bg-[#252525] border border-[#30302e] rounded-[46px] flex items-center justify-center active:bg-[#303030] transition-colors">
                        <span className="text-[15px] font-medium text-white tracking-[0.25px]">
                          Manage Reservation
                        </span>
                      </button>
                      <button
                        onClick={() => setShowCancelDrawer(true)}
                        className="w-full h-[54px] bg-[#252525] border border-[#30302e] rounded-[46px] flex items-center justify-center active:bg-[#303030] transition-colors"
                      >
                        <span className="text-[15px] font-medium text-[#f13d37] tracking-[0.25px]">
                          Cancel Reservation
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </DrawerContent>
          </Drawer>

          {/* Cancel Confirmation Drawer (With Fee) */}
          <Drawer open={showCancelDrawer} onOpenChange={(open) => !open && setShowCancelDrawer(false)}>
            <DrawerContent
              container={container}
              className="bg-[#191919] border-0 text-white outline-none !absolute h-auto max-h-[85%]"
              overlayClassName="!absolute"
            >
              {selectedReservation && (() => {
                const restaurant = restaurants.find(r => r.id === selectedReservation.restaurantId) || restaurants[0];
                const feePerGuest = restaurant?.fee || 25;
                const partySize = typeof selectedReservation.partySize === 'string' ? 9 : selectedReservation.partySize;
                const totalFee = feePerGuest * partySize;

                return (
                  <div className="flex flex-col gap-5 pt-1 px-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
                    {/* Header */}
                    <div className="flex items-center gap-[15px] py-2">
                      <button
                        onClick={() => setShowCancelDrawer(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors -ml-2"
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </button>
                      <h2 className="text-[15px] font-bold text-[#d6d6d6] tracking-[0.25px]">
                        Confirm cancellation
                      </h2>
                    </div>

                    {/* Warning Text */}
                    <p className="text-[15px] text-[#848486] tracking-[0.25px] leading-[23px]">
                      This reservation is within the cancellation window. The restaurant may charge a cancellation fee at their discretion.
                    </p>

                    {/* Fee Breakdown Card */}
                    <div className="bg-[#252525] rounded-[16px] p-4 border border-[#30302e]">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] text-[#d4d4d4] tracking-[0.25px]">Cancellation fee</span>
                          <span className="text-[14px] text-[#898989] tracking-[0.25px]">${feePerGuest} per guest</span>
                        </div>
                        <div className="h-[1px] bg-[#3d3d3d]" />
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] text-[#d4d4d4] tracking-[0.25px]">Via Resy</span>
                          <span className="text-[14px] text-[#898989] tracking-[0.25px]">{restaurant?.name}</span>
                        </div>
                        <div className="h-[1px] bg-[#3d3d3d]" />
                        <div className="flex items-center justify-between">
                          <span className="text-[15px] font-semibold text-[#d4d4d4] tracking-[0.25px]">Total</span>
                          <span className="text-[15px] font-semibold text-[#d4d4d4] tracking-[0.25px]">${totalFee}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          setReservations(prev => prev.filter(r => r.id !== selectedReservation.id));
                          setShowCancelDrawer(false);
                          setSelectedReservation(null);
                        }}
                        className="w-full h-[54px] bg-[#fe3400] rounded-[46px] flex items-center justify-center active:opacity-90 transition-opacity"
                      >
                        <span className="text-[15px] font-medium text-white tracking-[0.25px]">
                          Confirm Cancellation
                        </span>
                      </button>
                      <button
                        onClick={() => setShowCancelDrawer(false)}
                        className="w-full h-[54px] bg-[#252525] border border-[#30302e] rounded-[46px] flex items-center justify-center active:bg-[#303030] transition-colors"
                      >
                        <span className="text-[15px] font-medium text-white tracking-[0.25px]">
                          Contact Support
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </DrawerContent>
          </Drawer>

          {/* Search in Progress Drawer */}
          <Drawer open={selectedSearch !== null} onOpenChange={(open) => !open && setSelectedSearch(null)}>
            <DrawerContent
              container={container}
              className="bg-[#191919] border-0 text-white outline-none !absolute h-auto max-h-[85%]"
              overlayClassName="!absolute"
            >
              {selectedSearch && (() => {
                const searchDate = new Date(selectedSearch.date);
                const formattedDate = searchDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                });
                const partySize = typeof selectedSearch.partySize === 'string' ? '9+' : selectedSearch.partySize;

                // Calculate stop time
                const stopMinutes = selectedSearch.startMinutes - selectedSearch.stopTimeOffset;
                const stopTime = formatTimeShort(stopMinutes > 0 ? stopMinutes : stopMinutes + 24 * 60);

                return (
                  <div className="flex flex-col gap-5 pt-5 px-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
                    {/* Header */}
                    <div className="flex flex-col gap-3">
                      <h2 className="text-[15px] font-semibold text-[#d6d6d6] tracking-[0.25px]">
                        Search in progress
                      </h2>
                      <p className="text-[15px] text-[#848486] tracking-[0.25px] leading-[23px]">
                        Spot is searching for a table for {partySize} on {formattedDate} between {formatTimeShort(selectedSearch.startMinutes)} and {formatTimeShort(selectedSearch.endMinutes)}.
                      </p>
                    </div>

                    {/* Restaurant List */}
                    <div className="flex flex-col gap-2">
                      {selectedSearch.restaurantIds.map((id) => {
                        const restaurant = restaurants.find(r => r.id === id);
                        if (!restaurant) return null;
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-3 bg-[#252525] rounded-[12px] p-3"
                          >
                            <div
                              className="w-[40px] h-[40px] rounded-[8px] flex-shrink-0"
                              style={{ backgroundColor: restaurant.color }}
                            />
                            <span className="text-[15px] text-[#d4d4d4] tracking-[0.25px]">
                              {restaurant.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Search stops at row */}
                    <button className="flex items-center justify-between py-3">
                      <span className="text-[14px] text-[#898989] tracking-[0.25px]">
                        Search stops at
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] text-[#d4d4d4] tracking-[0.25px]">
                          {stopTime}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#636366]" />
                      </div>
                    </button>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                      <button
                        className="w-full h-[54px] bg-[#252525] border border-[#30302e] rounded-[46px] flex items-center justify-center active:bg-[#303030] transition-colors"
                      >
                        <span className="text-[15px] font-medium text-white tracking-[0.25px]">
                          Edit Search
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          cancelSearch(selectedSearch.id);
                          setSelectedSearch(null);
                        }}
                        className="w-full h-[54px] bg-[#252525] border border-[#30302e] rounded-[46px] flex items-center justify-center active:bg-[#303030] transition-colors"
                      >
                        <span className="text-[15px] font-medium text-[#f13d37] tracking-[0.25px]">
                          Stop Search
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </DrawerContent>
          </Drawer>

      </motion.div>
    </>
  );
};

export default Prototype;
