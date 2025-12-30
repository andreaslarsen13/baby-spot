import React, { useState, useCallback, useMemo, useEffect } from "react";

type Props = {
  title: string;
  minMinutes: number;
  maxMinutes: number;
  value: number;
  onChange: (minutes: number) => void;
  onConfirm: () => void;
  className?: string;
};

type Meridiem = "AM" | "PM";

/**
 * Parse a digit string into hours and minutes
 * Only allows 5-minute intervals (00, 05, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55)
 * Format: H or HH for hours, then MM for minutes
 */
function parseDigitsToTime(digits: string): { hours: number; minutes: number } | null {
  if (!digits || digits.length === 0) return null;

  const len = digits.length;
  let hours = 0;
  let minutes = 0;

  if (len === 1) {
    // Single digit: X:00
    hours = parseInt(digits, 10);
    minutes = 0;
  } else if (len === 2) {
    const num = parseInt(digits, 10);
    // Two digits: if 10, 11, 12 → hour, else invalid (need more digits for minutes)
    if (num >= 10 && num <= 12) {
      hours = num;
      minutes = 0;
    } else {
      // Treat as incomplete - first digit is hour, waiting for 2-digit minutes
      hours = parseInt(digits[0], 10);
      // Second digit is start of minutes - show as X0 for now
      minutes = parseInt(digits[1], 10) * 10;
    }
  } else if (len === 3) {
    const firstTwo = parseInt(digits.slice(0, 2), 10);
    if (firstTwo >= 10 && firstTwo <= 12) {
      // 10X, 11X, 12X → hour is first two, minute starts with third
      hours = firstTwo;
      minutes = parseInt(digits[2], 10) * 10;
    } else {
      // XYZ → hour is X, minutes is YZ
      hours = parseInt(digits[0], 10);
      minutes = parseInt(digits.slice(1), 10);
    }
  } else if (len === 4) {
    // HHMM format
    hours = parseInt(digits.slice(0, 2), 10);
    minutes = parseInt(digits.slice(2), 10);
  } else {
    return null;
  }

  if (hours < 1 || hours > 12) return null;
  if (minutes < 0 || minutes > 59) return null;
  // Only allow 5-minute intervals
  if (minutes % 5 !== 0) return null;

  return { hours, minutes };
}

/**
 * Get display values for hours and minutes from digits
 * Returns intermediate display during typing
 */
function getDisplayFromDigits(digits: string): { hours: number; minutes: number } {
  if (!digits) return { hours: 0, minutes: 0 };

  const len = digits.length;

  if (len === 1) {
    return { hours: parseInt(digits, 10), minutes: 0 };
  }

  if (len === 2) {
    const num = parseInt(digits, 10);
    if (num >= 10 && num <= 12) {
      return { hours: num, minutes: 0 };
    }
    // First digit is hour, second is tens of minutes
    return { hours: parseInt(digits[0], 10), minutes: parseInt(digits[1], 10) * 10 };
  }

  if (len === 3) {
    const firstTwo = parseInt(digits.slice(0, 2), 10);
    if (firstTwo >= 10 && firstTwo <= 12) {
      return { hours: firstTwo, minutes: parseInt(digits[2], 10) * 10 };
    }
    return { hours: parseInt(digits[0], 10), minutes: parseInt(digits.slice(1), 10) };
  }

  if (len === 4) {
    return { hours: parseInt(digits.slice(0, 2), 10), minutes: parseInt(digits.slice(2), 10) };
  }

  return { hours: 0, minutes: 0 };
}

/**
 * Convert 12-hour time to minutes from midnight
 */
function toMinutesFromMidnight(hours: number, minutes: number, meridiem: Meridiem): number {
  let h24 = hours;
  if (meridiem === "AM") {
    if (hours === 12) h24 = 0;
  } else {
    if (hours !== 12) h24 = hours + 12;
  }
  return h24 * 60 + minutes;
}

/**
 * Convert minutes from midnight to 12-hour format
 */
function fromMinutesFromMidnight(minutesFromMidnight: number): { hours: number; minutes: number; meridiem: Meridiem } {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const meridiem: Meridiem = h24 >= 12 ? "PM" : "AM";
  const hours = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return { hours, minutes: m, meridiem };
}

/**
 * Check if adding a digit would create a valid time (5-minute intervals only)
 */
function wouldBeValidDigit(currentDigits: string, newDigit: string): boolean {
  const potential = currentDigits + newDigit;
  const len = potential.length;
  const digit = parseInt(newDigit, 10);

  if (len === 1) {
    // First digit: 1-9 for hours (can't start with 0)
    return digit >= 1 && digit <= 9;
  }

  if (len === 2) {
    const first = parseInt(potential[0], 10);
    if (first === 1) {
      // After 1: can be 0,1,2 (for hours 10,11,12) or 0-5 (for minutes tens)
      return digit <= 5;
    }
    // After 2-9: this is minutes tens place, only 0-5 valid
    return digit <= 5;
  }

  if (len === 3) {
    const firstTwo = parseInt(potential.slice(0, 2), 10);
    if (firstTwo >= 10 && firstTwo <= 12) {
      // Hour is 10/11/12, third digit is minutes tens: 0-5
      return digit <= 5;
    }
    // Third digit is minutes ones: only 0 or 5 for 5-min intervals
    return digit === 0 || digit === 5;
  }

  if (len === 4) {
    // Fourth digit is minutes ones: only 0 or 5 for 5-min intervals
    return digit === 0 || digit === 5;
  }

  return false;
}

/**
 * TimeWindowSlider v12
 *
 * Numeric keypad time picker with two-drawer flow (like v11)
 */
export const TimeWindowSliderV12: React.FC<Props> = ({
  title,
  minMinutes,
  maxMinutes,
  value,
  onChange,
  onConfirm,
  className,
}) => {
  // Initialize from value prop
  const initialTime = fromMinutesFromMidnight(value);

  const [digits, setDigits] = useState("");
  const [meridiem, setMeridiem] = useState<Meridiem>(initialTime.meridiem);

  // Reset digits when value changes externally
  useEffect(() => {
    const time = fromMinutesFromMidnight(value);
    setMeridiem(time.meridiem);
    // Don't reset digits - let user type fresh
  }, [value]);

  // Parse current input
  const parsed = useMemo(() => parseDigitsToTime(digits), [digits]);

  // Calculate minutes from midnight for validation
  const currentMinutes = useMemo(() => {
    if (!parsed) return null;
    return toMinutesFromMidnight(parsed.hours, parsed.minutes, meridiem);
  }, [parsed, meridiem]);

  // Check if current time is valid
  const isValid = useMemo(() => {
    if (currentMinutes === null) return false;
    return currentMinutes >= minMinutes && currentMinutes <= maxMinutes;
  }, [currentMinutes, minMinutes, maxMinutes]);

  // Handle digit press
  const handleDigitPress = useCallback((digit: string) => {
    if (digits.length >= 4) return;

    if (wouldBeValidDigit(digits, digit)) {
      const newDigits = digits + digit;
      setDigits(newDigits);

      // Update parent with new time if valid
      const newParsed = parseDigitsToTime(newDigits);
      if (newParsed) {
        const newMinutes = toMinutesFromMidnight(newParsed.hours, newParsed.minutes, meridiem);
        if (newMinutes >= minMinutes && newMinutes <= maxMinutes) {
          onChange(newMinutes);
        }
      }
    }
  }, [digits, meridiem, minMinutes, maxMinutes, onChange]);

  // Handle backspace
  const handleBackspace = useCallback(() => {
    setDigits(digits.slice(0, -1));
  }, [digits]);

  // Handle confirm
  const handleConfirm = useCallback(() => {
    if (isValid && currentMinutes !== null) {
      onChange(currentMinutes);
      onConfirm();
    }
  }, [isValid, currentMinutes, onChange, onConfirm]);

  // Handle AM/PM toggle
  const handleMeridiemChange = useCallback((newMeridiem: Meridiem) => {
    setMeridiem(newMeridiem);

    // Update parent if we have a valid time
    if (parsed) {
      const newMinutes = toMinutesFromMidnight(parsed.hours, parsed.minutes, newMeridiem);
      if (newMinutes >= minMinutes && newMinutes <= maxMinutes) {
        onChange(newMinutes);
      }
    }
  }, [parsed, minMinutes, maxMinutes, onChange]);

  // Get display values (shows intermediate state during typing)
  const { hours: displayHours, minutes: displayMinutes } = getDisplayFromDigits(digits);
  const hasInput = digits.length > 0;

  return (
    <div className={className}>
      {/* Unified Time Card */}
      <div className="rounded-2xl bg-zinc-800 p-4 mb-4">
        <div className="flex items-center justify-between">
          {/* Time Display */}
          <div className="flex items-baseline">
            <span className={`text-[52px] font-light tabular-nums ${hasInput ? 'text-white' : 'text-zinc-500'}`}>
              {hasInput ? displayHours : '0'}
            </span>
            <span className="text-[52px] font-light text-zinc-500 mx-1">:</span>
            <span className={`text-[52px] font-light tabular-nums ${hasInput ? 'text-white' : 'text-zinc-500'}`}>
              {displayMinutes.toString().padStart(2, '0')}
            </span>
          </div>

          {/* AM/PM Segmented Control */}
          <div className="relative bg-zinc-900 rounded-full p-1 flex">
            {/* Sliding indicator */}
            <div
              className="absolute top-1 bottom-1 w-[42px] bg-white rounded-full transition-all duration-200 ease-out"
              style={{ left: meridiem === 'AM' ? '4px' : 'calc(100% - 46px)' }}
            />
            <button
              onClick={() => handleMeridiemChange("AM")}
              className={`relative z-10 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 ${
                meridiem === "AM" ? "text-black" : "text-zinc-500"
              }`}
            >
              AM
            </button>
            <button
              onClick={() => handleMeridiemChange("PM")}
              className={`relative z-10 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 ${
                meridiem === "PM" ? "text-black" : "text-zinc-500"
              }`}
            >
              PM
            </button>
          </div>
        </div>
      </div>

      {/* Compact Numeric Keypad */}
      <div className="grid grid-cols-3 gap-1.5">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigitPress(digit)}
            className="h-14 rounded-xl bg-zinc-800 text-white text-xl font-medium active:bg-zinc-700 transition-colors"
          >
            {digit}
          </button>
        ))}
        {/* Row 4: Backspace, 0, Confirm */}
        <button
          onClick={handleBackspace}
          className="h-14 rounded-xl bg-zinc-800/60 text-zinc-400 active:bg-zinc-700 transition-colors flex items-center justify-center"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l-7-7 7-7M19 12H5" />
          </svg>
        </button>
        <button
          onClick={() => handleDigitPress("0")}
          className="h-14 rounded-xl bg-zinc-800 text-white text-xl font-medium active:bg-zinc-700 transition-colors"
        >
          0
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isValid}
          className={`h-14 rounded-xl text-xl font-medium transition-colors flex items-center justify-center ${
            isValid
              ? "bg-[#FE3400] text-white active:bg-[#E02E00]"
              : "bg-zinc-800/60 text-zinc-600"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
