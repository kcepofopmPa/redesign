import React from 'react';
import { MOCK_CARS } from '../constants';
import { CarCard } from '../components/CarCard';
import { Heart } from 'lucide-react';

interface SavedViewProps {
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onOpenDetails: (id: string) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({ savedIds, onToggleSave, onOpenDetails }) => {
  const savedCars = MOCK_CARS.filter(car => savedIds.includes(car.id));

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Saved Cars</h1>
        <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest">
          {savedCars.length} {savedCars.length === 1 ? 'VEHICLE' : 'VEHICLES'} IN YOUR GALLERY
        </p>
      </div>

      {savedCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {savedCars.map((car) => (
            <CarCard 
              key={car.id} 
              car={car} 
              isSaved={true}
              onToggleSave={onToggleSave}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
            <Heart size={40} className="text-on-surface-variant" />
          </div>
          <h3 className="font-headline text-2xl font-bold mb-2">No Saved Cars</h3>
          <p className="text-on-surface-variant max-w-[240px] mb-8">Start exploring the gallery and save your favorites to view them here.</p>
          <button className="px-8 h-14 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-transform">
            EXPLORE GALLERY
          </button>
        </div>
      )}
    </div>
  );
};
