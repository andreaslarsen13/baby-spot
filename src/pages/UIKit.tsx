import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  PlusButton,
  ContinueButton,
  BookTableButton,
  CalendarToggleButton,
  NavButton,
} from '@/components/ui/buttons';
import {
  DateCardWeek,
  DateCardMonth,
  PartySizeCard,
} from '@/components/ui/cards';

type Category = 'ALL' | 'BUTTONS' | 'CARDS';

type UIElement = {
  id: string;
  label: string;
  category: Category[];
  element: React.ReactNode;
  description: string;
  file: string;
  component: string;
  darkBg?: boolean; // Use dark background for light-colored elements
};

const elements: UIElement[] = [
  {
    id: 'btn-01',
    label: 'BTN-01',
    category: ['BUTTONS'],
    element: <PlusButton />,
    description: 'Primary action button with plus icon',
    file: 'src/components/ui/buttons.tsx',
    component: 'PlusButton',
  },
  {
    id: 'btn-02',
    label: 'BTN-02',
    category: ['BUTTONS'],
    element: <ContinueButton className="w-48" />,
    description: 'Secondary action button',
    file: 'src/components/ui/buttons.tsx',
    component: 'ContinueButton',
  },
  {
    id: 'btn-03',
    label: 'BTN-03',
    category: ['BUTTONS'],
    element: <BookTableButton className="w-48" />,
    description: 'Primary CTA button',
    file: 'src/components/ui/buttons.tsx',
    component: 'BookTableButton',
    darkBg: true,
  },
  {
    id: 'btn-04',
    label: 'BTN-04',
    category: ['BUTTONS'],
    element: <CalendarToggleButton />,
    description: 'Icon toggle button',
    file: 'src/components/ui/buttons.tsx',
    component: 'CalendarToggleButton',
  },
  {
    id: 'btn-05',
    label: 'BTN-05',
    category: ['BUTTONS'],
    element: <NavButton direction="prev" className="w-32 flex-none" />,
    description: 'Navigation button (prev)',
    file: 'src/components/ui/buttons.tsx',
    component: 'NavButton',
  },
  {
    id: 'btn-06',
    label: 'BTN-06',
    category: ['BUTTONS'],
    element: <NavButton direction="next" className="w-32 flex-none" />,
    description: 'Navigation button (next)',
    file: 'src/components/ui/buttons.tsx',
    component: 'NavButton',
  },
  {
    id: 'crd-01',
    label: 'CRD-01',
    category: ['CARDS'],
    element: <DateCardWeek weekday="Mon" date={15} month="Jan" />,
    description: 'Date card - Week view',
    file: 'src/components/ui/cards.tsx',
    component: 'DateCardWeek',
  },
  {
    id: 'crd-02',
    label: 'CRD-02',
    category: ['CARDS'],
    element: <DateCardWeek weekday="Mon" date={15} month="Jan" isSelected />,
    description: 'Date card - Selected',
    file: 'src/components/ui/cards.tsx',
    component: 'DateCardWeek',
    darkBg: true,
  },
  {
    id: 'crd-03',
    label: 'CRD-03',
    category: ['CARDS'],
    element: <DateCardMonth date={15} className="w-12" />,
    description: 'Date card - Month view',
    file: 'src/components/ui/cards.tsx',
    component: 'DateCardMonth',
  },
  {
    id: 'crd-04',
    label: 'CRD-04',
    category: ['CARDS'],
    element: <PartySizeCard count={2} className="w-20" />,
    description: 'Party size card',
    file: 'src/components/ui/cards.tsx',
    component: 'PartySizeCard',
  },
  {
    id: 'crd-05',
    label: 'CRD-05',
    category: ['CARDS'],
    element: <PartySizeCard count={2} isSelected className="w-20" />,
    description: 'Party size card - Selected',
    file: 'src/components/ui/cards.tsx',
    component: 'PartySizeCard',
    darkBg: true,
  },
];

const categories: Category[] = ['ALL', 'BUTTONS', 'CARDS'];

const UIKit: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('ALL');
  const [focusedElement, setFocusedElement] = useState<UIElement | null>(null);

  const filteredElements =
    activeCategory === 'ALL'
      ? elements
      : elements.filter((el) => el.category.includes(activeCategory));

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Focus Modal */}
      {focusedElement && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <div className="sticky top-0 z-10 flex justify-end p-6">
            <button
              onClick={() => setFocusedElement(null)}
              className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
            >
              <X className="w-6 h-6 text-black" />
            </button>
          </div>
          <div className="max-w-2xl mx-auto px-6 pb-24">
            <div
              className={`flex justify-center mb-12 p-8 rounded-2xl ${
                focusedElement.darkBg ? 'bg-zinc-900' : ''
              }`}
            >
              {focusedElement.element}
            </div>
            <div className="text-center mb-12">
              <div className="text-sm font-medium text-zinc-400 mb-2">{focusedElement.label}</div>
              <div className="text-xl font-medium text-black">{focusedElement.description}</div>
            </div>
            <div className="space-y-8">
              <div>
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">
                  Component
                </div>
                <code className="block p-4 bg-zinc-100 rounded-lg text-sm font-mono text-zinc-700">
                  {'<'}{focusedElement.component}{' />'}
                </code>
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">
                  File
                </div>
                <code className="block p-4 bg-zinc-100 rounded-lg text-sm font-mono text-zinc-700">
                  {focusedElement.file}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        <nav className="flex items-center justify-center gap-8 px-6 py-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm font-medium transition-colors ${
                activeCategory === cat ? 'text-black' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </header>

      {/* Grid */}
      <main className="p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {filteredElements.map((el) => (
            <button
              key={el.id}
              onClick={() => setFocusedElement(el)}
              className="flex flex-col items-center group"
            >
              <div
                className={`w-full aspect-square flex items-center justify-center mb-4 hover:scale-105 transition-transform rounded-2xl ${
                  el.darkBg ? 'bg-zinc-900' : ''
                }`}
              >
                {el.element}
              </div>
              <div className="text-sm font-medium text-zinc-500 group-hover:text-black transition-colors">
                {el.label}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UIKit;
