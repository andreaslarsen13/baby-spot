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
        version: 'v2',
        description: 'Minimal design with prominent time display and visible handles',
        features: [
          'Large time display at top (From → To)',
          'Solid red selection with visible edge handles',
          'Clean hour markers',
          'Simplified interaction model',
          'More compact ruler design',
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
        version: 'v4',
        description: 'Dual vertical columns (Earliest/Latest) with meal presets',
        features: [
          'Two vertical drag columns: Earliest on left, Latest on right',
          'Meal presets (Breakfast/Lunch/Dinner) recenter the viewport',
          'Viewport system keeps segments sized evenly (no squish)',
          '15-minute snap with top=increase, bottom=decrease gestures',
          'Hour labels along columns for quick reference',
          'Dynamic island–inspired card container',
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
        version: 'v6',
        description: 'Abstract dot matrix time selector (inspired by Figma design)',
        features: [
          '4x5 grid of circles; range fills the dots in order',
          'Press-and-drag on the grid to adjust earliest/latest',
          'Simple start/end chip below the grid',
          'Aligned with 5x4 dot layout from the reference',
        ],
      },
      {
        version: 'v7',
        description: 'Ideal time cards + drag-to-shape range',
        features: [
          'Pick an ideal time via 30-minute cards',
          'Auto-create a 2-hour range around the ideal time',
          'Press-and-drag center to move window',
          'Press-and-drag edges to resize (15-minute snapping)',
          'No tap-to-jump on the ruler',
          'Light time ticks/labels plus start→end chip',
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
    ],
  },
};

export const getComponentVersions = (componentName: string): ComponentInfo['versions'] => {
  return ComponentLibrary[componentName]?.versions || [];
};

export const getAllComponents = (): ComponentInfo[] => {
  return Object.values(ComponentLibrary);
};

