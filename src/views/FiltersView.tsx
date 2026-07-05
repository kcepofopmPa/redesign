import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FilterState } from '../types';

interface FiltersViewProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

export const FiltersView: React.FC<FiltersViewProps> = ({ isOpen, onClose, filters, onApply }) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const toggleManufacturer = (brand: string) => {
    setLocalFilters(prev => ({
      ...prev,
      manufacturer: prev.manufacturer.includes(brand)
        ? prev.manufacturer.filter(b => b !== brand)
        : [...prev.manufacturer, brand]
    }));
  };

  const toggleFuelType = (type: string) => {
    setLocalFilters(prev => ({
      ...prev,
      fuelType: prev.fuelType.includes(type)
        ? prev.fuelType.filter(t => t !== type)
        : [...prev.fuelType, type]
    }));
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      manufacturer: [],
      priceRange: [0, 500000],
      fuelType: []
    };
    setLocalFilters(resetFilters);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[60] flex flex-col bg-surface"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 bg-surface-container-low border-b border-white/5">
            <button 
              onClick={onClose}
              className="size-10 flex items-center justify-center rounded-full bg-surface-container-high"
            >
              <X size={20} />
            </button>
            <h2 className="font-headline text-xl font-bold">Fine Tune</h2>
            <button 
              onClick={handleReset}
              className="font-label text-xs font-bold text-primary tracking-widest uppercase"
            >
              Reset
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Filter Group: Brand */}
            <div className="space-y-4">
              <label className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Manufacturer</label>
              <div className="grid grid-cols-2 gap-3">
                {['BMW', 'Volkswagen', 'Tesla', 'Porsche', 'Audi', 'Lumina'].map((brand) => (
                  <button 
                    key={brand}
                    onClick={() => toggleManufacturer(brand)}
                    className={`h-14 flex items-center justify-center gap-3 rounded-xl border transition-all ${
                      localFilters.manufacturer.includes(brand) 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-surface-container-high border-white/5 text-on-surface-variant'
                    }`}
                  >
                    <span className="font-bold text-sm">{brand}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Group: Price Range */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Price Range</label>
                <span className="font-headline text-lg font-bold text-primary">
                  ${(localFilters.priceRange[0] / 1000).toFixed(0)}k - ${(localFilters.priceRange[1] / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="relative h-2 bg-surface-container-highest rounded-full">
                <div className="absolute left-0 right-0 h-full bg-primary/20 rounded-full"></div>
                <div className="absolute left-0 right-0 h-full bg-primary rounded-full opacity-50"></div>
                {/* Simplified slider for prototype */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 size-6 bg-white rounded-full shadow-lg border-2 border-primary"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 size-6 bg-white rounded-full shadow-lg border-2 border-primary"></div>
              </div>
            </div>

            {/* Filter Group: Fuel Type */}
            <div className="space-y-4">
              <label className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Fuel Type</label>
              <div className="flex flex-wrap gap-3">
                {['Electric', 'Hybrid', 'Petrol', 'Diesel', 'Gasoline'].map((type) => (
                  <button 
                    key={type}
                    onClick={() => toggleFuelType(type)}
                    className={`px-6 py-3 rounded-full font-bold text-sm border transition-all ${
                      localFilters.fuelType.includes(type) 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-surface-container-high border-white/5 text-on-surface-variant'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Footer for Actions */}
          <div className="p-6 liquid-glass border-t border-white/5">
            <button 
              onClick={() => {
                onApply(localFilters);
                onClose();
              }}
              className="w-full h-16 bg-gradient-to-r from-primary to-primary-dim text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/30"
            >
              <span className="font-headline text-lg tracking-wider uppercase">Apply Filters</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
