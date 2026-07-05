import React, { useState, useMemo } from 'react';
import { Filter, Search as SearchIcon } from 'lucide-react';
import { MOCK_CARS } from '../constants';
import { CarCard } from '../components/CarCard';
import { FilterState } from '../types';
import { motion } from 'motion/react';

interface InventoryViewProps {
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onOpenFilters: () => void;
  onOpenDetails: (id: string) => void;
  filters: FilterState;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  savedIds, 
  onToggleSave, 
  onOpenFilters, 
  onOpenDetails,
  filters 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCars = useMemo(() => {
    return MOCK_CARS.filter(car => {
      // Search Query Filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        car.make.toLowerCase().includes(searchLower) ||
        car.model.toLowerCase().includes(searchLower) ||
        car.year.toString().includes(searchLower) ||
        car.tags.some(tag => tag.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Manufacturer Filter
      if (filters.manufacturer.length > 0 && !filters.manufacturer.includes(car.make)) {
        return false;
      }

      // Fuel Type Filter
      if (filters.fuelType.length > 0) {
        const carFuel = car.specs.engine || '';
        const matchesFuel = filters.fuelType.some(type => 
          carFuel.toLowerCase().includes(type.toLowerCase())
        );
        if (!matchesFuel) return false;
      }

      // Price Range Filter
      if (car.price < filters.priceRange[0] || car.price > filters.priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-3xl font-bold">{filteredCars.length} Results</h2>
          <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest">Berlin, Germany</p>
        </div>
        <button 
          onClick={onOpenFilters}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-colors group ${
            filters.manufacturer.length > 0 || filters.fuelType.length > 0 
              ? 'bg-primary text-on-primary' 
              : 'bg-surface-container-highest hover:bg-surface-bright'
          }`}
        >
          <Filter size={16} className={filters.manufacturer.length > 0 || filters.fuelType.length > 0 ? 'text-on-primary' : 'text-primary'} />
          <span className="font-label text-sm font-semibold uppercase tracking-wider">
            {filters.manufacturer.length > 0 || filters.fuelType.length > 0 ? 'Filtered' : 'Filters'}
          </span>
        </button>
      </section>

      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <SearchIcon className="text-neutral-500 group-focus-within:text-primary transition-colors" size={20} />
        </div>
        <input 
          className="w-full bg-surface-container-low border-b-2 border-outline-variant/20 focus:border-primary bg-opacity-50 py-6 pl-16 pr-8 text-xl font-headline transition-all outline-none focus:bg-surface-container-high placeholder:text-neutral-700" 
          placeholder="Search by name, spec, or VIN..." 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCars.map((car) => (
            <CarCard 
              key={car.id} 
              car={car} 
              isSaved={savedIds.includes(car.id)}
              onToggleSave={onToggleSave}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
            <SearchIcon size={32} className="text-on-surface-variant" />
          </div>
          <h3 className="font-headline text-2xl font-bold mb-2">No matches found</h3>
          <p className="text-on-surface-variant max-w-xs">Try adjusting your search or filters to find what you're looking for.</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-6 text-primary font-bold uppercase tracking-widest text-sm hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};
