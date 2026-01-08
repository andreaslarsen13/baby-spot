import React, { useState, useMemo } from 'react';
import { ChevronLeft, Plus, Check, Search, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { restaurants, categories, type CategoryType, type Restaurant } from '@/data/restaurants';

interface RestaurantSearchProps {
  selectedRestaurants: string[];
  onSelectionChange: (ids: string[]) => void;
  onBack: () => void;
  onContinue: () => void;
  maxSelections?: number;
}

export const RestaurantSearchV1: React.FC<RestaurantSearchProps> = ({
  selectedRestaurants,
  onSelectionChange,
  onBack,
  onContinue,
  maxSelections = 5,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('spots-picks');

  const activeCtg = useMemo(
    () => categories.find((c) => c.id === activeCategory)!,
    [activeCategory]
  );

  const filteredRestaurants = useMemo(
    () => restaurants.filter((r) => r.categories.includes(activeCategory)),
    [activeCategory]
  );

  const newRestaurants = useMemo(
    () => filteredRestaurants.filter((r) => r.isNew),
    [filteredRestaurants]
  );

  const regularRestaurants = useMemo(
    () => filteredRestaurants.filter((r) => !r.isNew),
    [filteredRestaurants]
  );

  const toggleRestaurant = (id: string) => {
    if (selectedRestaurants.includes(id)) {
      onSelectionChange(selectedRestaurants.filter((r) => r !== id));
    } else if (selectedRestaurants.length < maxSelections) {
      onSelectionChange([...selectedRestaurants, id]);
    }
  };

  const isSelected = (id: string) => selectedRestaurants.includes(id);
  const canAddMore = selectedRestaurants.length < maxSelections;

  return (
    <div className="relative h-full bg-[#151515]">
      {/* Scrollable Content */}
      <div className="h-full overflow-y-auto pt-[env(safe-area-inset-top)] pb-[140px]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-[15px] font-bold text-[#d6d6d6] tracking-[0.25px]">
            Where do you want to eat?
          </h1>
        </div>

        {/* Search Bar (visual only) */}
        <div className="px-4 pb-4">
          <div className="h-[50px] bg-[#252525] rounded-[46px] flex items-center gap-2 px-5">
            <Search className="w-4 h-4 text-[#d6d6d6]" />
            <span className="text-[13px] text-[#d6d6d6] tracking-[0.25px]">
              Search restaurants...
            </span>
          </div>
        </div>

        {/* Featured Banner */}
        <div className="px-4 pb-4">
          <div
            className="h-[123px] rounded-[12px] border border-white/25 relative overflow-hidden flex flex-col justify-end p-4"
            style={{ backgroundColor: activeCtg.color }}
          >
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, rgba(39,19,4,0) 50%, rgba(39,19,4,0.8) 100%), linear-gradient(90deg, rgba(39,19,4,0.4) 0%, rgba(39,19,4,0.4) 100%)',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-[22px] font-bold text-white tracking-[0.25px]">
                {activeCtg.title}
              </h2>
              <p className="text-[12px] text-white/90 mt-0.5">{activeCtg.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-4">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'flex-shrink-0 h-[43px] px-4 rounded-[37px] flex items-center justify-center transition-colors',
                    isActive
                      ? 'bg-[#252525] border border-[#252525]'
                      : 'border border-[#30302e]'
                  )}
                >
                  <span
                    className={cn(
                      'text-[14px] font-medium tracking-[0.25px] whitespace-nowrap',
                      isActive ? 'text-white' : 'text-[#909090]'
                    )}
                  >
                    {cat.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* New to List Section */}
        {newRestaurants.length > 0 && (
          <div className="bg-[#1a1a1a] border-y border-[#2a2a2a]">
            <div className="px-4">
              <div className="pt-1">
                <span className="text-[11px] font-medium text-[#666] tracking-[0.3px]">
                  Recently added to list
                </span>
              </div>
              <div className="flex flex-col">
                {newRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isSelected={isSelected(restaurant.id)}
                    canAdd={canAddMore || isSelected(restaurant.id)}
                    onToggle={() => toggleRestaurant(restaurant.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Restaurant List */}
        <div className="px-4">
          <div className="flex flex-col">
            {regularRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isSelected={isSelected(restaurant.id)}
                canAdd={canAddMore || isSelected(restaurant.id)}
                onToggle={() => toggleRestaurant(restaurant.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4 bg-gradient-to-t from-[#151515] via-[#151515] to-transparent">
        <div className="flex gap-[11px]">
          {/* Selection Counter */}
          <div className="w-[97px] h-[54px] bg-[#252525] border border-[#30302e] rounded-[46px] flex items-center justify-center gap-2.5">
            <Layers className="w-[19px] h-[19px] text-white" />
            <span className="text-[12px] font-medium text-white">
              {selectedRestaurants.length}
            </span>
          </div>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            disabled={selectedRestaurants.length === 0}
            className={cn(
              'flex-1 h-[54px] rounded-[46px] flex items-center justify-center transition-colors',
              selectedRestaurants.length > 0
                ? 'bg-[#252525] border border-[#30302e]'
                : 'bg-[#1a1a1a] border border-[#252525]'
            )}
          >
            <span
              className={cn(
                'text-[15px] font-medium tracking-[0.25px]',
                selectedRestaurants.length > 0 ? 'text-white' : 'text-white/40'
              )}
            >
              Continue
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Restaurant Card Component
const RestaurantCard: React.FC<{
  restaurant: Restaurant;
  isSelected: boolean;
  canAdd: boolean;
  onToggle: () => void;
}> = ({ restaurant, isSelected, canAdd, onToggle }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        {/* Restaurant Image - vertical/portrait */}
        <div
          className="w-[56px] h-[76px] rounded-xl flex-shrink-0"
          style={{ backgroundColor: restaurant.color }}
        />

        {/* Restaurant Info */}
        <div className="flex flex-col gap-0.5">
          {/* Name */}
          <span className="text-[17px] font-semibold text-white tracking-[-0.4px]">
            {restaurant.name}
          </span>

          {/* Cuisine & Location */}
          <span className="text-[15px] text-[#8E8E93] tracking-[-0.2px]">
            {restaurant.cuisine} · {restaurant.neighborhood}
          </span>

          {/* Deposit Badge */}
          <div className="flex items-center mt-1.5">
            <div className="flex items-center justify-center px-2 h-[22px] rounded-md bg-white/[0.05]">
              <span className="text-[11px] text-[#636366] tracking-[-0.1px] leading-none">
                ${restaurant.fee} deposit
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Remove Button */}
      <button
        onClick={onToggle}
        disabled={!canAdd && !isSelected}
        className={cn(
          'w-[57px] h-[37px] rounded-[49px] flex items-center justify-center p-[10px] transition-colors',
          isSelected
            ? 'bg-[#FE3400]'
            : canAdd
              ? 'bg-[#252525] active:bg-[#303030]'
              : 'bg-[#1a1a1a] opacity-50'
        )}
      >
        {isSelected ? (
          <Check className="w-[19px] h-[19px] text-white" />
        ) : (
          <Plus className="w-[19px] h-[19px] text-white" />
        )}
      </button>
    </div>
  );
};

export default RestaurantSearchV1;
