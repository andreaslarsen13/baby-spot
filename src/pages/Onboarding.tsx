import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedChair } from '@/components/AnimatedChair';

type OnboardingStep =
  | 'splash'
  | 'phone'
  | 'verify'
  | 'name'
  | 'waitlist-on'
  | 'waitlist-off'
  | 'carousel';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>(() => {
    const saved = localStorage.getItem('onboarding_step');
    return (saved as OnboardingStep) || 'splash';
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [name, setName] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(() => {
    const saved = localStorage.getItem('onboarding_carousel');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Save step to localStorage
  useEffect(() => {
    localStorage.setItem('onboarding_step', step);
  }, [step]);

  // Save carousel index to localStorage
  useEffect(() => {
    localStorage.setItem('onboarding_carousel', carouselIndex.toString());
  }, [carouselIndex]);

  // Double spacebar to restart
  useEffect(() => {
    let lastSpace = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const now = Date.now();
        if (now - lastSpace < 500) {
          // Double tap - restart
          localStorage.removeItem('onboarding_step');
          localStorage.removeItem('onboarding_carousel');
          setStep('splash');
          setCarouselIndex(0);
          setPhoneNumber('');
          setVerifyCode('');
          setName('');
        }
        lastSpace = now;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  // Format phone number as (XXX) XXX-XXXX
  const formatPhoneNumber = (digits: string) => {
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneDigit = (_digit: string) => {
    // Quick-fill for prototype: one tap fills complete number
    setPhoneNumber('5551234567');
  };

  const handlePhoneDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleVerifyDigit = (_digit: string) => {
    // Quick-fill for prototype: one tap fills complete code
    setVerifyCode('123456');
  };

  const handleVerifyDelete = () => {
    setVerifyCode(prev => prev.slice(0, -1));
  };

  const handlePhoneContinue = () => {
    if (phoneNumber.length === 10) {
      setStep('verify');
    }
  };

  const handleVerifyContinue = () => {
    if (verifyCode.length === 6) {
      setStep('name');
    }
  };

  const handleNameContinue = () => {
    if (name.trim().length > 0) {
      setStep('waitlist-on');
    }
  };

  const handleWaitlistOnTap = () => {
    setStep('waitlist-off');
  };

  const handleWaitlistContinue = () => {
    setStep('carousel');
  };

  const handleCarouselNext = () => {
    if (carouselIndex < 4) {
      setCarouselIndex(prev => prev + 1);
    } else {
      // Clear onboarding state and go to main app
      localStorage.removeItem('onboarding_step');
      localStorage.removeItem('onboarding_carousel');
      onComplete();
      navigate('/');
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'verify':
        setStep('phone');
        break;
      case 'name':
        setStep('verify');
        break;
      default:
        break;
    }
  };

  return (
    <div className="h-[100dvh] text-white relative flex flex-col font-['Inter'] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] overflow-hidden">
      {/* Fixed background that covers entire viewport including safe areas */}
      <div className="fixed inset-0 bg-[#151515] z-[-1]" />
      {step === 'splash' && (
        <SplashScreen onTap={() => setStep('phone')} />
      )}
      {step === 'phone' && (
        <PhoneEntryScreen
          phoneNumber={phoneNumber}
          formattedPhone={formatPhoneNumber(phoneNumber)}
          onDigit={handlePhoneDigit}
          onDelete={handlePhoneDelete}
          onContinue={handlePhoneContinue}
        />
      )}
      {step === 'verify' && (
        <VerifyCodeScreen
          code={verifyCode}
          onDigit={handleVerifyDigit}
          onDelete={handleVerifyDelete}
          onContinue={handleVerifyContinue}
          onBack={handleBack}
        />
      )}
      {step === 'name' && (
        <NameEntryScreen
          name={name}
          onNameChange={setName}
          onContinue={handleNameContinue}
          onBack={handleBack}
        />
      )}
      {step === 'waitlist-on' && (
        <WaitlistScreen
          isOnWaitlist={true}
          onTap={handleWaitlistOnTap}
          onContinue={handleWaitlistContinue}
        />
      )}
      {step === 'waitlist-off' && (
        <WaitlistScreen
          isOnWaitlist={false}
          onContinue={handleWaitlistContinue}
        />
      )}
      {step === 'carousel' && (
        <CarouselScreen
          currentIndex={carouselIndex}
          onNext={handleCarouselNext}
          onDotPress={setCarouselIndex}
        />
      )}
    </div>
  );
};

// ============ Splash Screen ============
interface SplashScreenProps {
  onTap: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onTap }) => {
  return (
    <button
      onClick={onTap}
      className="h-full w-full animate-in fade-in duration-500 relative text-left bg-[#fe3400]"
    >
      {/* spot logo */}
      <h1
        className="absolute left-[43px] top-[181.5px] -translate-y-1/2 text-[77px] font-black text-[#ebebe8] leading-[41px] tracking-[-6px]"
        style={{ fontFeatureSettings: "'dlig' 1", fontFamily: "'Dia Trial', sans-serif" }}
      >
        spot
      </h1>

      {/* Tagline */}
      <p
        className="absolute left-[calc(50%-148.5px)] top-[calc(50%-144px)] -translate-y-1/2 text-[25px] text-[#ebebe8] leading-[30px] tracking-[-1px] w-[229px]"
        style={{ fontFeatureSettings: "'dlig' 1", fontFamily: "'Alte Haas Grotesk', sans-serif" }}
      >
        Get the best tables in New York City.
      </p>

      {/* Animated chair illustration */}
      <div className="absolute left-[calc(50%+28.5px)] top-[calc(50%+206.5px)] -translate-x-1/2 -translate-y-1/2">
        <AnimatedChair />
      </div>

      {/* Tap to enter */}
      <p
        className="absolute left-[calc(50%-43.5px)] top-[737.5px] -translate-y-1/2 text-[16px] text-[#ebebe8] leading-[35px]"
        style={{ fontFeatureSettings: "'dlig' 1", fontFamily: "'Alte Haas Grotesk', sans-serif" }}
      >
        Tap to enter
      </p>
    </button>
  );
};

// ============ Phone Entry Screen ============
interface PhoneEntryScreenProps {
  phoneNumber: string;
  formattedPhone: string;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onContinue: () => void;
}

const PhoneEntryScreen: React.FC<PhoneEntryScreenProps> = ({
  phoneNumber,
  formattedPhone,
  onDigit,
  onDelete,
  onContinue,
}) => {
  const canContinue = phoneNumber.length === 10;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="px-6 pt-6">
        <h1 className="text-[22px] font-bold text-[#d6d6d6] tracking-[-0.25px] mt-16">
          Enter your number
        </h1>

        {/* Phone Input Display */}
        <div className="flex items-center gap-1 mt-4">
          <span className="text-[21px] text-[#bebebe] tracking-[-0.25px]">+1</span>
          <span className="text-[21px] text-white tracking-[-0.25px]">
            {formattedPhone || <span className="text-[#4a4a4a]">Mobile number</span>}
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Continue Button */}
      <div className="px-6 mb-4">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            "w-full h-[54px] rounded-[46px] flex items-center justify-center transition-colors",
            canContinue
              ? "bg-[#252525] text-white"
              : "bg-[#1a1a1a] text-[#4a4a4a]"
          )}
        >
          <span className="text-[15px] font-medium tracking-[0.25px]">
            Continue
          </span>
        </button>
      </div>

      {/* Numeric Keypad */}
      <NumericKeypad
        onDigit={onDigit}
        onDelete={onDelete}
        showLetters={true}
      />
    </div>
  );
};

// ============ Verify Code Screen ============
interface VerifyCodeScreenProps {
  code: string;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onContinue: () => void;
  onBack: () => void;
}

const VerifyCodeScreen: React.FC<VerifyCodeScreenProps> = ({
  code,
  onDigit,
  onDelete,
  onContinue,
  onBack,
}) => {
  const canContinue = code.length === 6;

  // Auto-continue when code is complete
  useEffect(() => {
    if (code.length === 6) {
      const timer = setTimeout(onContinue, 300);
      return () => clearTimeout(timer);
    }
  }, [code, onContinue]);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header with back button */}
      <div className="px-6 pt-6">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center -ml-2"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <h1 className="text-[22px] font-bold text-[#d6d6d6] tracking-[-0.25px] mt-4">
          Verify your number
        </h1>

        {/* Code Display */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-[21px] text-white tracking-[-0.25px]">
            {code || <span className="text-[#4a4a4a]">6-digit code</span>}
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Continue Button */}
      <div className="px-6 mb-4">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            "w-full h-[54px] rounded-[46px] flex items-center justify-center transition-colors",
            canContinue
              ? "bg-[#252525] text-white"
              : "bg-[#1a1a1a] text-[#4a4a4a]"
          )}
        >
          <span className="text-[15px] font-medium tracking-[0.25px]">
            Continue
          </span>
        </button>
      </div>

      {/* Numeric Keypad */}
      <NumericKeypad
        onDigit={onDigit}
        onDelete={onDelete}
        showLetters={true}
      />
    </div>
  );
};

// ============ Name Entry Screen ============
interface NameEntryScreenProps {
  name: string;
  onNameChange: (name: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

const NameEntryScreen: React.FC<NameEntryScreenProps> = ({
  name,
  onNameChange,
  onContinue,
  onBack,
}) => {
  const canContinue = name.trim().length > 0;

  const handleKeyboardTap = () => {
    onNameChange('Andreas');
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header with back button */}
      <div className="px-6 pt-6">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center -ml-2"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <h1 className="text-[22px] font-bold text-[#d6d6d6] tracking-[-0.25px] mt-4">
          Enter your name
        </h1>

        {/* Name Display */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-[21px] text-white tracking-[-0.25px]">
            {name || <span className="text-[#4a4a4a]">Name</span>}
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Continue Button */}
      <div className="px-6 mb-4">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            "w-full h-[54px] rounded-[46px] flex items-center justify-center transition-colors",
            canContinue
              ? "bg-[#252525] text-white"
              : "bg-[#1a1a1a] text-[#4a4a4a]"
          )}
        >
          <span className="text-[15px] font-medium tracking-[0.25px]">
            Continue
          </span>
        </button>
      </div>

      {/* Keyboard Image */}
      <KeyboardImage onTap={handleKeyboardTap} />
    </div>
  );
};

// ============ Waitlist Screen ============
interface WaitlistScreenProps {
  isOnWaitlist: boolean;
  onTap?: () => void;
  onContinue: () => void;
}

// Waitlist assets from Figma
const WAITLIST_CHAIRS_ICON = "https://www.figma.com/api/mcp/asset/d12a16e0-7f03-473d-94cc-0bd5108ff44b";
const ARROW_FORWARD_ICON = "https://www.figma.com/api/mcp/asset/f8bdd2ce-0f23-4461-b7f1-0a328c17e8dd";

// SMS number for Spot
const SPOT_SMS_NUMBER = "+1234567890"; // Replace with actual number

const WaitlistScreen: React.FC<WaitlistScreenProps> = ({
  isOnWaitlist,
  onTap,
  onContinue,
}) => {
  const handleGetNotified = () => {
    // Request push notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
    onTap?.();
  };

  const handleTextUs = () => {
    const message = "Hey Spot, a friend referred me!";
    const smsUrl = `sms:${SPOT_SMS_NUMBER}?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_self');
  };

  // For "on waitlist" state
  if (isOnWaitlist) {
    return (
      <div className="h-full w-full animate-in fade-in duration-300 relative bg-[#151515] flex flex-col">
        {/* Main content - centered */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-[48px]">
            {/* Chairs icon */}
            <img
              src={WAITLIST_CHAIRS_ICON}
              alt=""
              className="w-[97px] h-[131px]"
            />

            {/* Text content */}
            <div className="flex flex-col items-center gap-[17px]">
              {/* Title */}
              <h1
                className="text-[30px] font-bold text-white leading-[41px] font-['Alte_Haas_Grotesk'] text-center w-[237px]"
                style={{ fontFeatureSettings: "'dlig' 1" }}
              >
                YOU'RE ON THE WAITLIST
              </h1>

              {/* Subtitle */}
              <p
                className="text-[16px] text-white leading-[23px] tracking-[0.25px] font-['Alte_Haas_Grotesk'] text-center w-[209px]"
                style={{ fontFeatureSettings: "'dlig' 1" }}
              >
                We'll be opening up more spots soon.
              </p>

              {/* Get notified button */}
              <button
                onClick={handleGetNotified}
                className="h-[54px] w-[181px] bg-[#252525] border border-[#30302e] rounded-[46px] flex items-center justify-center active:scale-[0.97] transition-transform"
              >
                <span
                  className="text-[18px] font-medium text-white tracking-[0.25px]"
                  style={{ fontFeatureSettings: "'dlig' 1" }}
                >
                  Get notified
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom red bar - Referred by a friend */}
        <button
          onClick={handleTextUs}
          className="bg-[#fe3400] h-[74px] w-full flex items-center justify-center gap-[10px] px-[63px] active:bg-[#e52f00] transition-colors"
        >
          <span
            className="text-[16px] font-medium text-white text-center tracking-[0.25px] leading-[21px]"
            style={{ fontFeatureSettings: "'dlig' 1" }}
          >
            Referred by a friend? Text us
          </span>
          <img
            src={ARROW_FORWARD_ICON}
            alt=""
            className="w-[23px] h-[23px]"
          />
        </button>
      </div>
    );
  }

  // "Off waitlist" state - shows SPOT background and swipe hint
  return (
    <button
      onClick={onContinue}
      className="flex flex-col h-full w-full relative animate-in fade-in zoom-in-95 duration-200 cursor-pointer text-left"
    >
      {/* Large SPOT background text */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[calc(50%-100px)] -translate-x-1/2 -translate-y-1/2 text-[200px] font-medium leading-none whitespace-nowrap"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(237,237,237,0.04) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        SPOT
      </div>

      {/* Page indicator on left side */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20"
        role="group"
        aria-label="Page 1 of 5"
      >
        <div className="bg-[#232323]/80 backdrop-blur-sm rounded-r-full py-2 px-3 flex flex-col gap-[2px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className={cn(
                "w-[5px] h-[5px] rounded-full",
                i === 0 ? "bg-[#d9d9d9]" : "bg-[#d9d9d9]/25"
              )}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="absolute left-[48px] top-1/2 -translate-y-1/2">
        <h1 className="text-[33px] text-white text-left tracking-[0.25px] leading-[45px]">
          You're off the waitlist.
        </h1>
      </div>

      {/* Swipe hint at bottom */}
      <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2">
        <p className="text-[16px] text-[#e9e6df]/50 text-center tracking-[0.25px] leading-[21px]">
          Swipe up to get started
        </p>
      </div>
    </button>
  );
};

// ============ Carousel Screen ============
interface CarouselScreenProps {
  currentIndex: number;
  onNext: () => void;
  onDotPress: (index: number) => void;
}

// Background images from Figma
const ORB_IMAGE = "https://www.figma.com/api/mcp/asset/0a182955-87ba-4e17-9c33-e020fc720534";
const RESTAURANT_BG_IMAGE = "https://www.figma.com/api/mcp/asset/dd22ee4c-d559-4262-bc06-eabf8bd50e25";
const NOTIFICATION_IMAGE = "https://www.figma.com/api/mcp/asset/010f5bb8-d622-4766-b3e6-291cdb0d2da3";
const MAP_BG_IMAGE = "https://www.figma.com/api/mcp/asset/dddb66d6-f551-40c2-a1e2-6ff4311232e0";
const MAP_DOTS_IMAGE = "https://www.figma.com/api/mcp/asset/2bd32709-6441-4532-8a6f-a738af78a16e";
const COVERAGE_IMAGE = "https://www.figma.com/api/mcp/asset/5d1c0d03-7006-41c5-9eb4-69f38582d21d";
const RESY_LOGO_NEW = "https://www.figma.com/api/mcp/asset/14f5e5b7-ad56-4e63-ab74-6b631f724148";
const OPENTABLE_LOGO_NEW = "https://www.figma.com/api/mcp/asset/dbb89c70-8d9a-40a5-90a3-abd144bbb711";

// Restaurant pin images
const PIN_SEMMA = "https://www.figma.com/api/mcp/asset/2950774e-9e99-45c5-a50b-1a4cbc43be05";
const PIN_TORRISI = "https://www.figma.com/api/mcp/asset/8704fe82-6cba-4597-bef4-278829593bf1";
const PIN_THAI_DINER = "https://www.figma.com/api/mcp/asset/45a3f2d0-c6ff-43c0-bf4e-e44d28977345";
const PIN_MONKEY_BAR = "https://www.figma.com/api/mcp/asset/06085784-5d6a-4745-8d3a-b51d91d59aa5";
const PIN_FOUR_HORSEMEN = "https://www.figma.com/api/mcp/asset/ce8535d5-1821-409c-a415-22bc46f15856";

// Restaurant logos for the Resy/OpenTable slide
const RESTAURANT_LOGOS = [
  "https://www.figma.com/api/mcp/asset/33b2c7ba-ebea-4c8d-8037-37b5c34bdd89", // Theodora
  "https://www.figma.com/api/mcp/asset/63447fa7-c0ad-48ad-a44b-df45cc2f9ff6", // I Cavallini
  "https://www.figma.com/api/mcp/asset/be8bd5de-e86a-4b6e-b2d9-bcc20c2f7f86", // Four Horsemen
  "https://www.figma.com/api/mcp/asset/05045696-3924-4940-bae6-e2cea7b1b8c3", // Torrisi
  "https://www.figma.com/api/mcp/asset/82053556-a487-41b4-9b2c-e5cb74430b61", // Barbuto
  "https://www.figma.com/api/mcp/asset/c49cb095-2aec-443c-9670-e69f5b58cc4f", // Claud
  "https://www.figma.com/api/mcp/asset/1fb6926a-a7b6-425f-8ff1-cc7e877a855c", // Carbone
  "https://www.figma.com/api/mcp/asset/bfb71ada-6848-4ca8-892e-c81ed123d14d", // Cote
  "https://www.figma.com/api/mcp/asset/891d9418-9532-4eaf-9c0d-2dc451a78ae9", // Lilia
  "https://www.figma.com/api/mcp/asset/e0919378-609e-47ac-8444-6e74f998bd87", // Bangkok Supper Club
  "https://www.figma.com/api/mcp/asset/1d138df5-4c43-4341-8036-bc2441ba3871", // Adda
  "https://www.figma.com/api/mcp/asset/6f3915be-8e83-4009-97f1-e6ff9668d288", // Monkey Bar
  "https://www.figma.com/api/mcp/asset/a3f277f7-46f3-4e19-8269-3d8502a302c4", // American Bar
  "https://www.figma.com/api/mcp/asset/93ae8486-757b-46d1-88b6-69743acd08a2", // Ai Fiori
  "https://www.figma.com/api/mcp/asset/621382fc-df27-401d-8377-010c8509590e", // Carne Mare
  "https://www.figma.com/api/mcp/asset/b35ef1fa-21b4-412d-bc17-0a92b1ba9243", // Arthur & Sons
];

const RESY_LOGO = "https://www.figma.com/api/mcp/asset/9aea95d1-5894-438b-842f-0dc128975050";
const OPENTABLE_LOGO = "https://www.figma.com/api/mcp/asset/6ad3c9fb-bf02-4eac-a5e1-4707ffbe0e45";

// Restaurant Pin Component
const RestaurantPin: React.FC<{
  image: string;
  name: string;
  top: number;
  left: number;
}> = ({ image, name, top, left }) => (
  <div className="absolute opacity-80" style={{ top, left }}>
    <div className="relative">
      <div className="absolute -inset-[1px] border-[3px] border-white/30 rounded-[10px] w-[37px] h-[37px]" />
      <img
        src={image}
        alt={name}
        className="w-[35px] h-[35px] rounded-[10px] border-2 border-white object-cover"
      />
    </div>
    <p className="text-[10px] font-bold text-white text-center tracking-[0.25px] mt-[8px] w-[65px] -ml-[15px]">
      {name}
    </p>
  </div>
);

const carouselSlides = [
  {
    title: "Spot is your reservation agent.",
    subtitle: "Tell Spot where you want to eat and Spot starts searching for tables.",
    background: 'orb',
  },
  {
    title: "Spot books the table for you.",
    subtitle: "The moment a table becomes available, Spot grabs it.",
    background: 'restaurant',
  },
  {
    title: "Resy + OpenTable in one place.",
    subtitle: "Spot searches both for the best coverage in NYC.",
    background: 'map',
  },
  {
    title: "Become a regular at NYC's hardest to book spots.",
    subtitle: "",
    background: 'coverage',
  },
  {
    title: "Start booking with Spot.",
    subtitle: "",
    background: 'membership',
  },
];

const CarouselScreen: React.FC<CarouselScreenProps> = ({
  currentIndex,
  onNext,
  onDotPress,
}) => {
  const slide = carouselSlides[currentIndex];
  const isLastSlide = currentIndex === carouselSlides.length - 1;

  return (
    <div className="flex flex-col h-full relative animate-in fade-in duration-200">
      {/* Background */}
      <div className="absolute inset-0 bg-[#151515]">
        {slide.background === 'orb' && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[241px]">
            <img
              src={ORB_IMAGE}
              alt=""
              className="w-[191px] h-[191px] object-cover"
            />
          </div>
        )}
        {slide.background === 'restaurant' && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={RESTAURANT_BG_IMAGE}
              alt=""
              className="absolute h-[108%] left-[-161%] top-[-5%] w-[419%] max-w-none object-cover"
            />
            {/* Gradient overlays */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(25, 25, 25, 0) 56%, rgba(25, 25, 25, 1) 100%), linear-gradient(90deg, rgba(39, 19, 4, 0.4) 0%, rgba(39, 19, 4, 0.4) 100%)'
              }}
            />
          </div>
        )}
        {slide.background === 'coverage' && (
          <>
            {/* Gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, rgba(39, 19, 4, 0.4) 0%, rgba(39, 19, 4, 0.4) 100%)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[rgba(21,21,21,0.6)] via-[30%] to-transparent" />
            {/* Coverage logos grid */}
            <img
              src={COVERAGE_IMAGE}
              alt=""
              className="absolute left-1/2 -translate-x-1/2 top-[254px] w-[370px] h-[558px] object-cover"
            />
          </>
        )}
        {slide.background === 'membership' && (
          <div
            className="absolute left-1/2 top-[180px] -translate-x-1/2 text-[160px] font-bold leading-none whitespace-nowrap tracking-[-8px]"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(237,237,237,0.02) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SPOT
          </div>
        )}
        {slide.background === 'map' && (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={MAP_BG_IMAGE}
                alt=""
                className="absolute h-[104%] left-[-30%] top-[-4%] w-[160%] max-w-none object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(21,21,21,0.6)] via-[80%] to-[rgba(21,21,21,0.8)]" />
            </div>
            <img
              src={MAP_DOTS_IMAGE}
              alt=""
              className="absolute left-[3px] top-[2px] w-[370px] h-[603px] object-cover"
            />
            {/* Restaurant pins */}
            <RestaurantPin image={PIN_MONKEY_BAR} name="Monkey Bar" top={73} left={145} />
            <RestaurantPin image={PIN_SEMMA} name="Semma" top={151} left={37} />
            <RestaurantPin image={PIN_TORRISI} name="Torrisi" top={263} left={37} />
            <RestaurantPin image={PIN_THAI_DINER} name="Thai Diner" top={344} left={69} />
            <RestaurantPin image={PIN_FOUR_HORSEMEN} name="The Four Horsemen" top={365} left={302} />
          </>
        )}
      </div>

      {/* Side Page Indicator - hidden on membership slide */}
      {slide.background !== 'membership' && (
        <div className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-20",
          slide.background === 'coverage' && "opacity-30"
        )}>
          <div className="bg-[#232323]/80 backdrop-blur-sm rounded-r-full py-2 px-3 flex flex-col gap-[2px]">
            {carouselSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => onDotPress(i)}
                className={cn(
                  "w-[5px] h-[5px] rounded-full transition-colors",
                  i === currentIndex ? "bg-[#d9d9d9]" : "bg-[#d9d9d9]/25"
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Notification Card for restaurant slide */}
      {slide.background === 'restaurant' && (
        <div className="absolute top-[72px] left-1/2 -translate-x-1/2 w-[349px] h-[92px] bg-white/10 rounded-[23px] overflow-hidden z-10 flex items-center">
          <img
            src={NOTIFICATION_IMAGE}
            alt=""
            className="w-[80px] h-[80px] ml-[6px] rounded-[17px] object-cover"
          />
          <div className="flex flex-col gap-[3px] ml-[12px] flex-1 pr-4">
            <p className="text-[16px] font-semibold text-white leading-[20px]">
              Spot booked you a table
            </p>
            <p className="text-[14px] text-[#d4d4d4] leading-[16px] tracking-[0.25px]">
              Spot booked a table for 4 at Lilia on Friday at 8PM
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "relative z-10 flex flex-col",
        slide.background === 'orb'
          ? "absolute top-[540px] left-1/2 -translate-x-1/2 w-[295px] items-start"
          : slide.background === 'restaurant'
            ? "absolute top-[605px] left-1/2 -translate-x-1/2 w-[298px] items-start"
            : slide.background === 'map'
              ? "absolute top-[545px] left-1/2 -translate-x-1/2 w-[300px] items-start"
              : slide.background === 'coverage'
                ? "absolute top-[78px] left-1/2 -translate-x-1/2 w-[295px] items-start"
                : slide.background === 'membership'
                  ? "absolute bottom-[100px] left-1/2 -translate-x-1/2 w-[343px] items-start"
                  : "flex-1 px-[31px] pt-[95px]"
      )}>
        {/* Resy/OpenTable pills for map slide - above title */}
        {slide.background === 'map' && (
          <div className="flex gap-[10px] mb-[10px]">
            <div className="h-[30px] w-[85px] bg-[#232323] rounded-[49px] flex items-center justify-center gap-[7px] px-[10px]">
              <img src={RESY_LOGO_NEW} alt="Resy" className="h-[16px] w-[13px] object-contain opacity-90" />
              <span className="text-[13px] font-bold text-[#e9e9e9] tracking-[0.25px]">RESY</span>
            </div>
            <div className="h-[30px] w-[131px] bg-[#232323] rounded-[49px] flex items-center justify-center gap-[5px] px-[10px]">
              <img src={OPENTABLE_LOGO_NEW} alt="OpenTable" className="h-[20px] w-[27px] object-cover opacity-90 rounded-[10px]" />
              <span className="text-[13px] font-bold text-[#e9e9e9] tracking-[0.25px]">OPENTABLE</span>
            </div>
          </div>
        )}

        <h1 className={cn(
          "font-bold text-white leading-[41px]",
          slide.background === 'orb'
            ? "text-[35px] tracking-[-2px] w-[295px]"
            : slide.background === 'restaurant'
              ? "text-[30px] tracking-[-1px] w-[298px]"
              : slide.background === 'map'
                ? "text-[28px] tracking-[-1px] w-[300px]"
                : slide.background === 'coverage'
                  ? "text-[33px] tracking-[-2px] w-[287px]"
                  : slide.background === 'membership'
                    ? "text-[33px] tracking-[-1px] w-[343px] leading-[48px]"
                    : "text-[25px] tracking-[-1px] max-w-[295px]"
        )}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className={cn(
            "text-[17px] text-white leading-[30px]",
            slide.background === 'orb'
              ? "tracking-[-0.25px] mt-[16px] w-[295px]"
              : slide.background === 'restaurant'
                ? "tracking-[-0.25px] mt-[11px] w-[298px]"
                : slide.background === 'map'
                  ? "tracking-[-0.25px] mt-[15px] w-[300px]"
                  : "tracking-[0.25px] mt-[15px] max-w-[295px]"
          )}>
            {slide.subtitle}
          </p>
        )}

        {/* Membership card */}
        {slide.background === 'membership' && (
          <div className="mt-[40px] w-full bg-[#1c1c1c]/80 backdrop-blur-sm rounded-[20px] border border-white/10 p-[20px]">
            {/* Header */}
            <div className="flex justify-between items-start mb-[20px]">
              <div>
                <p className="text-[20px] font-bold text-white">Membership</p>
                <p className="text-[16px] text-[#8e8e93]">$50.00 / month</p>
              </div>
              <p className="text-[15px] text-white/80">1 Week Free Trial</p>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-[12px] mb-[24px]">
              <div className="flex items-center gap-[12px]">
                <div className="w-[20px] h-[20px] rounded-full bg-[#3a3a3c] flex items-center justify-center">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[16px] font-medium text-white">Unlimited reservations</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-[20px] h-[20px] rounded-full bg-[#3a3a3c] flex items-center justify-center">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[16px] font-medium text-white">Avoid late cancellation fees</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-[20px] h-[20px] rounded-full bg-[#3a3a3c] flex items-center justify-center">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[16px] font-medium text-white">Concierge support</span>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={onNext}
              className="w-full h-[54px] bg-[#2c2c2e] rounded-[46px] flex items-center justify-center"
            >
              <span className="text-[17px] font-semibold text-white">Start Free Trial</span>
            </button>
          </div>
        )}

        {/* Legacy logos slide - no longer used */}
        {slide.background === 'logos' && (
          <>
            <div className="flex gap-[10px] mt-6">
              <div className="h-[30px] px-[10px] bg-[#232323] rounded-[49px] flex items-center gap-[10px]">
                <img src={RESY_LOGO} alt="Resy" className="h-[16px] w-[13px] object-contain opacity-90" />
                <span className="text-[13px] font-bold text-[#d6d6d6] tracking-[0.25px]">RESY</span>
              </div>
              <div className="h-[30px] px-[10px] bg-[#232323] rounded-[49px] flex items-center gap-[5px]">
                <img src={OPENTABLE_LOGO} alt="OpenTable" className="h-[20px] w-[27px] object-contain opacity-90 rounded-[10px]" />
                <span className="text-[13px] font-bold text-[#d6d6d6] tracking-[0.25px]">OPENTABLE</span>
              </div>
            </div>

            {/* Restaurant logos grid */}
            <div className="grid grid-cols-4 gap-[6px] mt-8 -mx-[31px] px-[3px]">
              {RESTAURANT_LOGOS.map((logo, i) => (
                <div
                  key={i}
                  className="w-[88px] h-[88px] bg-[#1c1c1c] rounded-[54px] flex items-center justify-center"
                >
                  <img
                    src={logo}
                    alt=""
                    className="max-w-[62px] max-h-[44px] object-contain opacity-80"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tap overlay for non-membership slides */}
      {slide.background !== 'membership' && (
        <button
          onClick={onNext}
          className="absolute inset-0 z-20"
          aria-label="Next slide"
        />
      )}

      {/* Footer links for membership slide */}
      {slide.background === 'membership' && (
        <div className="absolute bottom-[40px] left-1/2 -translate-x-1/2 flex gap-[40px] z-10">
          <button className="text-[14px] text-[#8e8e93]">Privacy</button>
          <button className="text-[14px] text-[#8e8e93]">Restore</button>
          <button className="text-[14px] text-[#8e8e93]">Terms</button>
        </div>
      )}
    </div>
  );
};

// ============ Numeric Keypad Component ============
interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  showLetters?: boolean;
}

const keypadLetters: Record<string, string> = {
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
};

const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onDigit,
  onDelete,
  showLetters = false,
}) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['+*#', '0', 'delete'],
  ];

  return (
    <div className="bg-[#313131] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-3 gap-[6px] p-[6px]">
        {keys.flat().map((key) => {
          if (key === '+*#') {
            return (
              <button
                key={key}
                className="h-[46px] bg-[#646464] rounded-[5px] flex items-center justify-center shadow-[0px_1px_0px_0px_rgba(0,0,0,0.3)]"
              >
                <span className="text-[14px] text-white tracking-[2px]">+ * #</span>
              </button>
            );
          }
          if (key === 'delete') {
            return (
              <button
                key={key}
                onClick={onDelete}
                className="h-[46px] flex items-center justify-center"
              >
                <svg width="23" height="17" viewBox="0 0 23 17" fill="none">
                  <path
                    d="M8.5 1L1 8.5L8.5 16M8.5 8.5H22"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            );
          }
          return (
            <button
              key={key}
              onClick={() => onDigit(key)}
              className="h-[46px] bg-[#646464] rounded-[5px] flex flex-col items-center justify-center shadow-[0px_1px_0px_0px_rgba(0,0,0,0.3)]"
            >
              <span className="text-[25px] text-white tracking-[-0.5px] leading-none">
                {key}
              </span>
              {showLetters && keypadLetters[key] && (
                <span className="text-[10px] text-white tracking-[1.7px] leading-none mt-0.5">
                  {keypadLetters[key]}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Home Indicator */}
      <div className="flex justify-center py-2">
        <div className="w-[135px] h-[5px] bg-white rounded-full" />
      </div>
    </div>
  );
};

// ============ Keyboard Image Component ============
interface KeyboardImageProps {
  onTap: () => void;
}

const KeyboardImage: React.FC<KeyboardImageProps> = ({ onTap }) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['⇧', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
  ];

  return (
    <button onClick={onTap} className="bg-[#313131] pb-[env(safe-area-inset-bottom)]">
      <div className="flex flex-col gap-[6px] p-[3px]">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-[5px]">
            {row.map((key) => (
              <div
                key={key}
                className={cn(
                  "h-[42px] bg-[#646464] rounded-[5px] flex items-center justify-center shadow-[0px_1px_0px_0px_rgba(0,0,0,0.3)]",
                  key === '⇧' || key === '⌫' ? "w-[42px]" : "w-[32px]"
                )}
              >
                <span className="text-[18px] text-white">{key}</span>
              </div>
            ))}
          </div>
        ))}
        {/* Bottom row */}
        <div className="flex justify-center gap-[5px]">
          <div className="w-[85px] h-[42px] bg-[#646464] rounded-[5px] flex items-center justify-center shadow-[0px_1px_0px_0px_rgba(0,0,0,0.3)]">
            <span className="text-[14px] text-white">123</span>
          </div>
          <div className="flex-1 h-[42px] bg-[#646464] rounded-[5px] flex items-center justify-center shadow-[0px_1px_0px_0px_rgba(0,0,0,0.3)] mx-1">
            <span className="text-[14px] text-white">space</span>
          </div>
          <div className="w-[85px] h-[42px] bg-[#646464] rounded-[5px] flex items-center justify-center shadow-[0px_1px_0px_0px_rgba(0,0,0,0.3)]">
            <span className="text-[14px] text-white">return</span>
          </div>
        </div>
      </div>
      {/* Home Indicator */}
      <div className="flex justify-center py-2">
        <div className="w-[135px] h-[5px] bg-white rounded-full" />
      </div>
    </button>
  );
};

export default Onboarding;
