import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Settings, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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
  BookTableButton,
  BackButton,
} from '@/components/ui/buttons';
import {
  PartySizeCard,
} from '@/components/ui/cards';
import { cn } from '@/lib/utils';

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
    setCurrentStep(0);
  };

  const handleFinish = () => {
    resetBookingFlow();
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
      <div className="px-4 py-2 flex-1">
        <h3 className="text-2xl font-semibold tracking-tight">Good morning, Andreas</h3>
        <p className="text-zinc-400 text-sm mt-1">Here's what's happening today.</p>
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
          <Drawer open={currentStep === 1} onOpenChange={(open) => !open && resetBookingFlow()}>
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
                                  handleNextStep();
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
                                        handleNextStep();
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
          <Drawer open={currentStep === 2} onOpenChange={(open) => !open && resetBookingFlow()}>
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
                          handleNextStep();
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
                              handleNextStep();
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
                      handleNextStep();
                    }}
                  />
                );
              })()}
            </DrawerContent>
          </Drawer>

          {/* Step 3: How many? */}
          <Drawer open={currentStep === 3} onOpenChange={(open) => !open && resetBookingFlow()}>
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
                            handleNextStep();
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
                onBack={() => setCurrentStep(3)}
                onContinue={handleNextStep}
                maxSelections={5}
              />
            </div>
          )}

          {/* Step 5: Summary & Confirmation */}
          <Drawer open={currentStep === 5} onOpenChange={(open) => !open && resetBookingFlow()}>
            <DrawerContent
              container={container}
              className="bg-[#191919] border-0 text-white outline-none !absolute h-auto max-h-[85%]"
              overlayClassName="!absolute"
            >
              <div className="flex flex-col overflow-hidden">
                <DrawerHeader className="pt-5 pb-0 px-5">
                  <div className="flex items-center gap-[15px]">
                    <BackButton onClick={() => setCurrentStep(4)} />
                    <DrawerTitle className="text-[15px] font-bold text-[#d6d6d6] tracking-[0.25px]">
                      Confirm booking
                    </DrawerTitle>
                  </div>
                </DrawerHeader>
                
                <div className="overflow-y-auto no-scrollbar px-5 pt-2 pb-[calc(32px+env(safe-area-inset-bottom))]">
                  <div className="space-y-6">
                    {/* Visual Summary Card */}
                    <div className="rounded-[32px] border border-zinc-800 bg-zinc-900/30 p-6 space-y-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Date</div>
                          <div className="mt-1 text-[20px] font-bold text-white">
                            {selectedDate?.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Party</div>
                          <div className="mt-1 text-[20px] font-bold text-white">
                            {selectedPartySize} {selectedPartySize === 1 ? 'Person' : 'People'}
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-zinc-800/50">
                        <div className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase mb-2">Time Window</div>
                        <div className="h-12 w-full rounded-full bg-[#FE3400] flex items-center justify-center shadow-[0_0_40px_rgba(254,52,0,0.15)]">
                          <span className="text-[15px] font-black text-black/90">
                            {formatMinutes(timeRange.startMinutes)} – {formatMinutes(timeRange.endMinutes)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <BookTableButton onClick={handleFinish} />
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

    </div>
  );
};

export default Prototype;
