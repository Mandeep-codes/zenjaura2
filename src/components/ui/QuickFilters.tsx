import React from 'react';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';

interface QuickFiltersProps {
  genres: string[];
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  priceRanges: Array<{ label: string; min: number; max: number }>;
  selectedPriceRange: { min: number; max: number };
  onPriceRangeChange: (range: { min: number; max: number }) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({
  genres,
  selectedGenre,
  onGenreChange,
  priceRanges,
  selectedPriceRange,
  onPriceRangeChange,
  onClearFilters,
  activeFiltersCount
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">Quick Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full text-xs font-medium">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Clear All</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Genre Pills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Genres
          </label>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => onGenreChange(genre === selectedGenre ? '' : genre)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedGenre === genre
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Pills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price Range
          </label>
          <div className="flex flex-wrap gap-2">
            {priceRanges.map((range, index) => {
              const isSelected = selectedPriceRange.min === range.min && selectedPriceRange.max === range.max;
              return (
                <button
                  key={index}
                  onClick={() => onPriceRangeChange(isSelected ? { min: 0, max: 100 } : range)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300'
                  }`}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickFilters;