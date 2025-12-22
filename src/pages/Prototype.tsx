import React, { useMemo, useState } from 'react';
import { Settings, Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { TimeWindowSlider } from "@/components/TimeWindowSlider";

const Prototype: React.FC = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const startOfWeek = (d: Date, weekStartsOn: 0 | 1 = 0) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const diff = (day - weekStartsOn + 7) % 7;
    date.setDate(date.getDate() - diff);
    return date;
  };

  const [gridStartDate, setGridStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return startOfWeek(d, 0);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPartySize, setSelectedPartySize] = useState<number | string | null>(null);
  const [calendarMode, setCalendarMode] = useState<'week' | 'month'>('week');
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [timeRange, setTimeRange] = useState<{ startMinutes: number; endMinutes: number }>(() => ({
    startMinutes: 18 * 60, // 6:00 PM
    endMinutes: 20 * 60, // 8:00 PM
  }));

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const resetBookingFlow = () => {
    setSelectedDate(null);
    setSelectedPartySize(null);
    setGridStartDate(startOfWeek(now, 0));
    setCalendarMode('week');
    setMonthAnchor(new Date(now.getFullYear(), now.getMonth(), 1));
    setTimeRange({ startMinutes: 18 * 60, endMinutes: 20 * 60 });
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

  const days = useMemo(() => {
    const out: Array<{
      fullDate: string;
      isToday: boolean;
      isPast: boolean;
      isSelected: boolean;
      weekdayShort: string;
      dateNum: number;
      monthShort: string;
      rawDate: Date;
    }> = [];

    for (let i = 0; i < 8; i++) {
      const day = new Date(gridStartDate);
      day.setDate(gridStartDate.getDate() + i);
      day.setHours(0, 0, 0, 0);

      const isToday = day.toDateString() === now.toDateString();
      const isPast = day < now;
      const isSelected =
        !!selectedDate && day.toDateString() === selectedDate.toDateString();

      out.push({
        fullDate: day.toDateString(),
        isToday,
        isPast,
        isSelected,
        weekdayShort: day.toLocaleString('default', { weekday: 'short' }),
        dateNum: day.getDate(),
        monthShort: day.toLocaleString('default', { month: 'short' }),
        rawDate: day,
      });
    }

    return out;
  }, [gridStartDate, now, selectedDate]);

  const weekLabel = useMemo(() => {
    const start = new Date(gridStartDate);
    const end = new Date(gridStartDate);
    end.setDate(gridStartDate.getDate() + 6);
    const startMonth = start.toLocaleString('default', { month: 'short' });
    const endMonth = end.toLocaleString('default', { month: 'short' });
    const year = start.getFullYear();
    return startMonth === endMonth ? `${startMonth} ${year}` : `${startMonth}–${endMonth} ${year}`;
  }, [gridStartDate]);

  const isCurrentWeek = useMemo(() => {
    return gridStartDate.toDateString() === startOfWeek(now, 0).toDateString();
  }, [gridStartDate, now]);

  const monthLabel = useMemo(() => {
    return monthAnchor.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [monthAnchor]);

  const nextRange = () => {
    setGridStartDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const prevRange = () => {
    setGridStartDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  // Step 2: start-time window configuration (7:00 AM – 10:30 PM)
  const minTimeMinutes = 7 * 60;
  const maxTimeMinutes = 22 * 60 + 30;

  const formatMinutes = (minutes: number) => {
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const meridiem = h24 >= 12 ? 'PM' : 'AM';
    const h12 = ((h24 + 11) % 12) + 1;
    return `${h12}:${m.toString().padStart(2, '0')} ${meridiem}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 font-['Inter']">
      {/* iPhone 16 Pro Mockup */}
      <div 
        ref={setContainer}
        className="relative w-[402px] h-[874px] bg-black rounded-[55px] border-[8px] border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/10"
      >
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-50 flex items-center justify-center pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-zinc-800 ml-auto mr-4" />
        </div>

        {/* Screen Content */}
        <div className="w-full h-full bg-[#191919] text-white relative flex flex-col">
          {/* Status Bar */}
          <div className="h-12 flex items-center justify-between px-8 pt-4 text-xs font-semibold">
            <span>9:41</span>
            <div className="flex gap-1.5 items-center">
              <div className="w-4 h-3 border border-current rounded-[2px]" />
              <div className="w-3 h-3 bg-current rounded-full" />
            </div>
          </div>

          {/* Top Navigation */}
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-bold tracking-tight">Spot</h2>
            <button className="p-2 active:bg-white/10 rounded-full transition-colors">
              <Settings className="w-6 h-6 text-zinc-400" />
            </button>
          </div>

          {/* Home Content */}
          <div className="px-6 py-2 flex-1">
            <h3 className="text-2xl font-semibold tracking-tight">Good morning, Andreas</h3>
            <p className="text-zinc-400 text-sm mt-1">Here's what's happening today.</p>
          </div>

          {/* Bottom Action Button */}
          <div className="pb-12 flex justify-center">
            <button 
              onClick={() => setCurrentStep(1)}
              className="w-48 h-16 bg-black border border-zinc-800 rounded-full flex items-center justify-center shadow-lg active:bg-zinc-900 transition-colors"
            >
              <Plus className="w-8 h-8 text-white" />
            </button>
          </div>

          {/* Step 1: When? - Sectioned Weekly View */}
          <Drawer open={currentStep === 1} onOpenChange={(open) => !open && resetBookingFlow()}>
            <DrawerContent 
              container={container} 
              className="bg-[#191919] border-zinc-800 text-white outline-none !absolute h-auto max-h-[85%]"
              overlayClassName="!absolute"
            >
              <div className="flex flex-col overflow-hidden">
                <DrawerHeader className="pb-2">
                  <div className="flex items-center justify-between px-2">
                    <DrawerTitle className="text-left text-lg font-semibold text-zinc-100">
                      When do you need a table?
                    </DrawerTitle>
                    <button
                      onClick={() => {
                        const nextMode = calendarMode === 'week' ? 'month' : 'week';
                        setCalendarMode(nextMode);
                        if (nextMode === 'month') {
                          const base = selectedDate ?? now;
                          setMonthAnchor(new Date(base.getFullYear(), base.getMonth(), 1));
                        }
                      }}
                      className={`h-10 w-10 rounded-full border border-zinc-800 flex items-center justify-center transition-colors
                        ${calendarMode === 'month' ? 'bg-white text-black' : 'bg-zinc-900/60 text-zinc-200 active:bg-zinc-800'}`}
                      aria-label={calendarMode === 'week' ? 'Open full calendar' : 'Close full calendar'}
                    >
                      <Calendar className="w-5 h-5" />
                    </button>
                  </div>
                </DrawerHeader>
                
                <div 
                  className="overflow-y-auto no-scrollbar px-4 pt-4 pb-6 flex flex-col"
                >
                  {calendarMode === 'week' ? (
                    <div className="grid grid-cols-4 gap-2.5">
                      {days.map((day) => (
                        <button
                          key={day.fullDate}
                          disabled={day.isPast}
                          onClick={() => {
                            if (day.isPast) return;
                            setSelectedDate(day.rawDate);
                            handleNextStep();
                          }}
                          className={`rounded-[20px] border px-2 py-6 flex flex-col items-center justify-center transition-colors relative
                            ${day.isPast ? 'opacity-10 pointer-events-none' : ''}
                            ${day.isSelected
                              ? 'bg-white text-black border-white'
                              : 'bg-zinc-900/60 text-white border-zinc-800 active:bg-zinc-800'}
                          `}
                        >
                          <div
                            className={`text-[12px] font-semibold tracking-wide ${
                              day.isSelected ? 'text-black/60' : day.isToday ? 'text-[#FE3400]/70' : 'text-zinc-500'
                            }`}
                          >
                            {day.isToday ? 'Today' : day.weekdayShort}
                          </div>
                          <div className="relative mt-2">
                            <div className="text-[26px] font-semibold leading-none">
                              {day.dateNum}
                            </div>
                          </div>
                          <div
                            className={`mt-2.5 text-[12px] font-semibold ${
                              day.isSelected ? 'text-black/50' : 'text-zinc-600'
                            }`}
                          >
                            {day.monthShort}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-7 gap-2 px-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                          <div key={d} className="text-[11px] font-semibold text-zinc-600 text-center">
                            {d}
                          </div>
                        ))}
                      </div>

                      {(() => {
                        const first = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
                        const startOffset = first.getDay(); // Sunday=0
                        const daysInMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0).getDate();
                        const cells: Array<Date | null> = Array.from({ length: 42 }, () => null);
                        for (let i = 0; i < daysInMonth; i++) {
                          const d = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), i + 1);
                          d.setHours(0, 0, 0, 0);
                          cells[startOffset + i] = d;
                        }

                        return (
                          <div className="grid grid-cols-7 gap-2">
                            {cells.map((d, idx) => {
                              if (!d) return <div key={idx} className="aspect-square" />;
                              const isPast = d < now;
                              const isToday = d.toDateString() === now.toDateString();
                              const isSelected = !!selectedDate && d.toDateString() === selectedDate.toDateString();
                              return (
                                <button
                                  key={idx}
                                  disabled={isPast}
                                  onClick={() => {
                                    if (isPast) return;
                                    setSelectedDate(d);
                                    setGridStartDate(startOfWeek(d, 0));
                                    handleNextStep();
                                  }}
                                  className={`aspect-square rounded-[18px] border flex items-center justify-center text-[14px] font-semibold transition-colors
                                    ${isPast ? 'opacity-10 pointer-events-none' : ''}
                                    ${isSelected
                                      ? 'bg-white text-black border-white'
                                      : 'bg-zinc-900/60 text-white border-zinc-800 active:bg-zinc-800'}
                                  `}
                                >
                                  <span className={isToday && !isSelected ? 'text-[#FE3400]/80' : ''}>
                                    {d.getDate()}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Bottom Navigation Buttons */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        if (calendarMode === 'week') prevRange();
                        else setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
                      }}
                      className="flex-1 h-14 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center active:bg-zinc-800 transition-colors"
                      aria-label={calendarMode === 'week' ? 'Previous week' : 'Previous month'}
                    >
                      <ChevronLeft className="w-6 h-6 text-zinc-200" />
                    </button>
                    <button
                      onClick={() => {
                        if (calendarMode === 'week') nextRange();
                        else setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                      }}
                      className="flex-1 h-14 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center active:bg-zinc-800 transition-colors"
                      aria-label={calendarMode === 'week' ? 'Next week' : 'Next month'}
                    >
                      <ChevronRight className="w-6 h-6 text-zinc-200" />
                    </button>
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Step 2: What Time? */}
          <Drawer open={currentStep === 2} onOpenChange={(open) => !open && resetBookingFlow()}>
            <DrawerContent 
              container={container} 
              className="bg-[#191919] border-zinc-800 text-white outline-none !absolute"
              overlayClassName="!absolute"
            >
              <div className="flex flex-col overflow-hidden">
                <DrawerHeader className="pb-2">
                  <DrawerTitle className="text-left px-2 text-lg font-semibold text-zinc-100">Select available time window</DrawerTitle>
                </DrawerHeader>

                <div className="overflow-y-auto no-scrollbar pt-4 pb-6">
                  <TimeWindowSlider
                    minMinutes={minTimeMinutes}
                    maxMinutes={maxTimeMinutes}
                    startMinutes={timeRange.startMinutes}
                    endMinutes={timeRange.endMinutes}
                    stepMinutes={15}
                    minWindowMinutes={30}
                    onChange={setTimeRange}
                  />

                  <div className="px-6">
                    <button
                      onClick={handleNextStep}
                      className="mt-8 w-full h-14 bg-white text-black rounded-xl font-medium text-[15px] active:bg-zinc-200 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Step 3: How many? */}
          <Drawer open={currentStep === 3} onOpenChange={(open) => !open && resetBookingFlow()}>
            <DrawerContent 
              container={container} 
              className="bg-[#191919] border-zinc-800 text-white outline-none !absolute h-auto max-h-[85%]"
              overlayClassName="!absolute"
            >
              <div className="flex flex-col overflow-hidden">
                <DrawerHeader className="pb-2">
                  <DrawerTitle className="text-left px-2 text-lg font-semibold text-zinc-100">How many people?</DrawerTitle>
                </DrawerHeader>
                
                <div className="overflow-y-auto no-scrollbar px-4 pt-4 pb-6">
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map((count) => {
                      const isSelected = selectedPartySize === count;
                      return (
                        <button 
                          key={count}
                          onClick={() => {
                            setSelectedPartySize(count);
                            handleNextStep();
                          }}
                          className={`aspect-square rounded-2xl border flex items-center justify-center transition-colors
                            ${isSelected
                              ? 'bg-white text-black border-white'
                              : 'bg-zinc-900/30 text-white border-zinc-800/50 active:bg-zinc-800'}
                          `}
                        >
                          <span className="text-[28px] font-semibold">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Step 4: Summary & Confirmation */}
          <Drawer open={currentStep === 4} onOpenChange={(open) => !open && resetBookingFlow()}>
            <DrawerContent 
              container={container} 
              className="bg-[#191919] border-zinc-800 text-white outline-none !absolute h-auto max-h-[85%]"
              overlayClassName="!absolute"
            >
              <div className="flex flex-col overflow-hidden">
                <DrawerHeader className="pb-2">
                  <DrawerTitle className="text-left px-2 text-lg font-semibold text-zinc-100">Confirm booking</DrawerTitle>
                </DrawerHeader>
                
                <div className="overflow-y-auto no-scrollbar px-6 pt-6 pb-8">
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

                    <button
                      onClick={handleFinish}
                      className="w-full h-16 rounded-full bg-white text-black font-black text-xl active:bg-zinc-200 transition-all shadow-2xl"
                    >
                      Book Table
                    </button>
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Home Indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[140px] h-1.5 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default Prototype;
