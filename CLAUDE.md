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
npx ngrok http 5173
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