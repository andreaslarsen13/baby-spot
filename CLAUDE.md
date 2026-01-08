# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Baby Spot" is a React + TypeScript restaurant booking prototype with a sophisticated component library system. The app demonstrates a mobile-first booking flow with multiple interactive UI component versions that can be switched dynamically.

## Key Architecture

### Component Versioning System
The app features a unique component library system that allows multiple implementations (versions) of the same component to coexist:

- **VersionContext**: Global React context that manages and persists component version selections in localStorage
- **Component Registry**: Centralized catalog (`src/components/library/registry.ts`) documenting all component versions with descriptions and features
- **Version Switcher**: UI overlay that allows live switching between component versions during development
- **Index Pattern**: Each versionable component has an `index.tsx` that imports all versions and selects the current one via context

Example: `TimeWindowSlider` has multiple versions (v1-v12), each with distinct interaction patterns and visual designs.

### Application Structure
- **Router-based**: Three main pages: Prototype (booking flow), Library (version catalog), UIKit (design system)
- **Mobile-first**: Designed for iPhone 16 Pro mockup with drawer-based navigation
- **Multi-step booking flow**: When → What Time → How Many → Confirmation
- **Native Mode Detection**: Prototype.tsx detects PWA/mobile and renders full-screen app without mockup frame

### PWA Support
The app is configured as a Progressive Web App for mobile testing:
- `public/manifest.json` - PWA manifest with standalone display mode
- `public/icon-192.png` and `public/icon-512.png` - App icons
- `index.html` - PWA meta tags for iOS and Android
- Safe area insets handled via `env(safe-area-inset-*)` CSS functions

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run build  # TypeScript compilation is part of build

# Linting
npm run lint

# Preview production build
npm run preview

# Mobile testing via ngrok (use when local network blocks device-to-device)
ngrok http --url=imelda-reblown-camryn.ngrok-free.dev 5173
```

## Tech Stack & Patterns

- **React 19** with TypeScript
- **Vite** for build tooling
- **React Router DOM** for navigation
- **Tailwind CSS** for styling with custom theme extensions
- **Radix UI** components (Dialog, etc.) via shadcn/ui pattern
- **Framer Motion** for animations
- **Lucide React** for icons

### Important Patterns

1. **Path Alias**: Use `@/` for all src imports (configured in vite.config.ts)
2. **Component Structure**: UI components in `/ui/`, library components in `/library/[ComponentName]/`
3. **Version Management**: All versionable components must be registered in `registry.ts` with proper metadata
4. **State Management**: React Context for version state, local component state elsewhere

### Adding New Component Versions

1. Create `src/components/library/[ComponentName]/v[N].tsx`
2. Export component from the new file
3. Add to versions object in corresponding `index.tsx`
4. Update registry in `registry.ts` with version info and features
5. Change `DEFAULT_VERSION` in index.tsx to make it active
6. **IMPORTANT**: Update fallback version in `Prototype.tsx` - search for `getVersion('ComponentName', 'vX')` and update the fallback parameter to match the new default

## Key Files

- `src/components/library/registry.ts` - Component version catalog
- `src/components/library/VersionContext.tsx` - Version state management
- `src/pages/Prototype.tsx` - Main booking flow prototype
- `src/components/library/TimeWindowSlider/` - Primary example of versioned component
- `tailwind.config.js` - Extended theme with custom colors and animations

## Development Notes

- Components are designed to be self-contained with their own styling
- The app uses a dark theme by default (zinc-950 background)
- All interactions are touch-optimized for mobile
- Time handling uses minutes since midnight for calculations
- The booking flow maintains state across drawer steps

## Voice & Tone

Spot is an agentic concierge — not old-world hospitality, but a software agent that gets you what you want and provides recommendations you can trust. The app is confident, not precious. Direct, not mushy.

### Copywriting Principles

1. **Clarity over cleverness.** If a joke or reference requires context the user might not have, cut it. The tire company joke for Michelin, calling someone "the goat" — these undercut credibility by trying too hard.

2. **Specificity is credibility.** "Best new restaurants" means something. "Unique drinks" means nothing. Name what you mean.

3. **Source in the title.** For third-party lists (Infatuation, Eater, NYT, Pete Wells, Michelin), the credible source goes in the title — that's what earns the click. The subtitle explains what the list is.

4. **Say what's in the box.** The subtitle's job is to tell you exactly what you're getting. No mystery, no tease.

5. **Utility over warmth.** We're helping, not hand-holding. "Where to grab a drink after dinner" beats "Wine bars, cocktails, and unique drinks for when you want to remember your night out... or don't."

6. **Active voice, confident verbs.** "Earning repeat reservations" not "have been booked repeatedly." "Most booked" not "restaurants that have been booked."

7. **Timeframes should be specific.** "This month" or "January" — not "over the past few weeks."

### What to Avoid

- "Curated" — meaningless, overused
- "Discover" / "Explore" — generic hospitality language
- Jokes that require insider knowledge ("the goat", "favorite tire company")
- Passive voice and soft verbs
- Trying to be the user's friend
- Anything that sounds like a meditation app

### Reference Examples

| Title | Subtitle | Notes |
|-------|----------|-------|
| **Spot's Picks** | What we're recommending this month | Agentic, clear timeframe |
| **Infatuation '25** | The Infatuation's best new restaurants of 2025 | Source in title, subtitle explains exactly what it is |
| **Infatuation Hit List** | The Infatuation's best new restaurants, updated monthly | Consistent attribution, "updated monthly" differentiates from annual lists |
| **Hot Tables** | Most booked on Spot this month | Data-forward, Spot as the source, specific timeframe |
| **Spot After Dark** | Where to grab a drink after dinner | Utility-first — tells you when to use this list |
| **Eater Top Picks** | Eater NY's highest-rated restaurants, updated monthly | Source credited, "updated monthly" signals currency |
| **Pete Wells '24** | Pete Wells' best restaurants of 2024 | Name carries weight — no need to call him "the goat" |
| **NYT Picks '25** | The New York Times' best restaurants of 2025 | Same pattern: source + clear explanation |
| **Michelin Guide** | Restaurants awarded Michelin stars | Official name, Michelin as the authority giving the award |

### Before/After Examples

**Before:** "Spot Curated — Brian's picks for what's new, hot, and worth going back to over and over this month"
**After:** "Spot's Picks — What we're recommending this month"
*Why: "Curated" is meaningless. "New" and "going back to" are contradictory. Too many words.*

**Before:** "Hot Tables — Restaurants that have been booked repeatedly on Spot over the past few weeks"
**After:** "Hot Tables — Most booked on Spot this month"
*Why: Passive voice, vague timeframe. New version is tight and data-forward.*

**Before:** "Spot After Dark — Wine bars, cocktails, and unique drinks for when you want to remember your night out... or don't"
**After:** "Spot After Dark — Where to grab a drink after dinner"
*Why: The joke doesn't land. "Unique drinks" means nothing. New version is pure utility.*

**Before:** "Pete Wells '24 — The 2024 list from the goat, Pete Wells"
**After:** "Pete Wells '24 — Pete Wells' best restaurants of 2024"
*Why: "The goat" is trying too hard. His name carries the weight — let it.*

**Before:** "Michelin Stars — Restaurants with 1-3 stars from everyone's favorite tire company"
**After:** "Michelin Guide — Restaurants awarded Michelin stars"
*Why: The tire joke undercuts prestige. Use the official name, let Michelin be the authority.*