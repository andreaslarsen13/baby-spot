import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Settings, ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
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
  const { getVersion, setVersion } = useVersion();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [currentStep, setCurrentStep] = usePersistedState('currentStep', 0);
  const [showVersionSwitcher, setShowVersionSwitcher] = useState(false);

  // Double-space hotkey to toggle version switcher
  const lastSpaceTime = useRef<number>(0);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const now = Date.now();
        if (now - lastSpaceTime.current < 400) {
          e.preventDefault();
          setShowVersionSwitcher(prev => !prev);
          lastSpaceTime.current = 0;
        } else {
          lastSpaceTime.current = now;
        }
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
    // Save the active search
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
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-2xl font-bold tracking-tight">Spot</h2>
        <button className="p-2 active:bg-white/10 rounded-full transition-colors">
          <Settings className="w-6 h-6 text-zinc-400" />
        </button>
      </div>

      {/* Home Content */}
      <div className="px-4 py-2 flex-1 overflow-y-auto">
        <h3 className="text-xl tracking-tight">
          <span className="font-light text-[#898989]">Good morning, </span>
          <span className="font-semibold text-[#D6D6D6]">Andreas</span>
        </h3>

        {/* Active Search Cards */}
        {activeSearches.length > 0 && (
          <div className="flex flex-col gap-3 mt-6">
            {activeSearches.map((search) => {
              const searchDate = new Date(search.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              const isToday = searchDate.toDateString() === today.toDateString();
              const isTomorrow = searchDate.toDateString() === tomorrow.toDateString();
              const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : searchDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

              return (
                <div key={search.id} className="bg-[#2c2c2e] rounded-2xl border border-[#3a3a3c] p-4">
                  {/* Date as title */}
                  <div className="text-[17px] font-semibold text-white">
                    {dateLabel}
                  </div>

                  {/* Info */}
                  <div className="text-[13px] text-[#636366] mt-1">
                    {formatTimeShort(search.startMinutes)}–{formatTimeShort(search.endMinutes)} · {search.partySize} guests · {search.restaurantIds.length} spot{search.restaurantIds.length > 1 ? 's' : ''}
                  </div>
                </div>
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
    <div
      ref={setContainer}
      className="h-[100dvh] bg-[#191919] text-white relative flex flex-col font-['Inter'] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] overflow-hidden"
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

    </div>
  );
};

export default Prototype;
