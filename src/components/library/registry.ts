/**
 * Component Library Registry
 * 
 * Catalog of all component versions available in the library.
 * Use this to track and switch between different component designs.
 */

export type ComponentInfo = {
  name: string;
  description: string;
  versions: Array<{
    version: string;
    description: string;
    features: string[];
  }>;
};

export const ComponentLibrary: Record<string, ComponentInfo> = {
  TimeWindowSlider: {
    name: 'Time Window Slider',
    description: 'Interactive time range selector with meal presets and smooth animations',
    versions: [
      {
        version: 'v1',
        description: 'Glass-style design with Breakfast/Lunch/Dinner toggles',
        features: [
          'Meal toggle buttons (Breakfast/Lunch/Dinner)',
          'Smooth 500ms scrolling animation between meals',
          'Glass-style semi-transparent selection window',
          'Hour markers on time ruler',
          'Earliest/Latest time cards at bottom',
          'Centered viewports for each meal (2-hour windows)',
        ],
      },
      {
        version: 'v3',
        description: 'Braun + Notion + Apple: One-tap quick selection with minimal interface',
        features: [
          'One-tap time buttons (5pm, 6pm, 7pm, 8pm, 9pm)',
          'Large, clear time display (32px font)',
          'Minimal ruler for fine adjustment',
          'Drag to adjust edges or move window',
          'Tap ruler to center window on that time',
          'Ultra-fast and delightful',
        ],
      },
      {
        version: 'v5',
        description: 'Visual clock of dots around a ring',
        features: [
          'Circular ring of dots; drag to set earliest/latest',
          'Highlighted arc shows selected window',
          'Center readout of start/end times',
          'Pointer-drag only (no tap jump)',
          'Arc path and handles for direct manipulation',
        ],
      },
      {
        version: 'v8',
        description: 'Refined V3: Segmented bar with improved handles and time cards',
        features: [
          'Based on V3 segmented bar design (pro feel, finger-slide interaction)',
          'Earliest/Latest time cards from V1 at bottom above Continue button',
          'Fixed grab bar alignment (centered with grip lines)',
          'Improved drag handling (uses window events, won\'t get stuck)',
          'Larger touch targets (44px) for easier grabbing',
          'Smooth viewport expansion when dragging beyond edges',
        ],
      },
      {
        version: 'v9',
        description: 'Wheel-like scrolling picker with depth effect',
        features: [
          'No range selected by default - scroll to browse',
          'Smooth horizontal scroll/drag to pan through times',
          '3D depth effect: bars shrink at edges for wheel illusion',
          'Edge fade overlays for smooth visual transition',
          'Tap anywhere to place a 2-hour selection',
          'After selection: drag middle to move, edges to resize',
          'No separate Earliest/Latest cards - inline time display',
        ],
      },
      {
        version: 'v10',
        description: 'Refined wheel picker with Apple-like physics',
        features: [
          'Minimal, clean design with reduced visual noise',
          '30-minute inline time labels on the wheel',
          'Apple-like scroll physics: fast swipe = momentum, slow drag = snap',
          'Spring animation when snapping to intervals',
          'Ghost preview (subtle fill) before selection placed',
          'Orange fill selection with thin edge line handles',
          'Very subtle depth effect (3% scale range)',
          'Tap to place 2-hour selection, drag edges to resize',
        ],
      },
      {
        version: 'v11',
        description: 'Ruler picker with stacked cards for earliest/latest',
        features: [
          'Single drawer with two stacked expandable cards',
          'Fixed center handle (white circle with <·> icon)',
          'Scrollable horizontal ruler underneath',
          'Large time display (e.g., 03:21 PM)',
          'Tick marks with hour labels',
          'Dedicated Continue button to confirm each selection',
          'Earliest card collapses after selection, latest expands',
        ],
      },
      {
        version: 'v12',
        description: 'Numeric keypad picker with two-drawer flow',
        features: [
          'Phone-style numeric keypad (1-9, 0) for quick time entry',
          'Two-drawer flow like v11 (earliest → latest)',
          'Large time display card with vertical AM/PM toggle',
          'Natural time entry with auto-colon (6 → 6:00, 63 → 6:30)',
          'Invalid input is blocked (smart validation)',
          'Orange confirm arrow to advance between drawers',
          'Backspace button to correct mistakes',
        ],
      },
      {
        version: 'v13',
        description: 'iOS-style scroll wheel picker',
        features: [
          'Vertical scroll wheel with full times (6:00 PM, 6:30 PM)',
          '30-minute intervals for quick selection',
          'CSS scroll-snap for smooth, natural scrolling',
          'Highlighted center selection row (zinc-800 pill)',
          'Fading gradient effect above/below selection',
          'Two-drawer flow like v11/v12 (earliest → latest)',
        ],
      },
      {
        version: 'v14',
        description: 'Grid picker with Morning/Afternoon/Evening segmented control',
        features: [
          'Segmented toggle for Morning / Afternoon / Evening',
          '3x4 grid of 30-minute slots',
          'Selected earliest time shown in header for latest drawer',
          'Back button and centered confirm button',
          'Compact 20px side padding and 15px vertical spacing',
        ],
      },
      {
        version: 'v15',
        description: 'Paginated grid picker with arrow navigation',
        features: [
          '3x4 grid of 30-minute time slots',
          'Arrow navigation to page through Breakfast/Lunch/Dinner',
          'Centered bottom arrows for balanced feel',
          'Clean layout without tabs or labels',
          'Back button in header for drawer navigation',
        ],
      },
      {
        version: 'v16',
        description: 'Grid picker with Breakfast/Lunch/Dinner segmented control',
        features: [
          'Segmented picker for Breakfast / Lunch / Dinner at top',
          '3-column grid of 30-minute time slots',
          'Tap any meal period to switch time ranges',
          'Back button in header for navigation',
          'Clean, minimal design matching Figma spec',
        ],
      },
    ],
  },
};

export const getComponentVersions = (componentName: string): ComponentInfo['versions'] => {
  return ComponentLibrary[componentName]?.versions || [];
};

export const getAllComponents = (): ComponentInfo[] => {
  return Object.values(ComponentLibrary);
};

