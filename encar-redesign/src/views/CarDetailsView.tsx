import React from 'react';
import { ChevronLeft, Heart, Share2, ShieldCheck, Zap, Gauge, Settings2, Calendar, MapPin } from 'lucide-react';
import { Car } from '../types';
import { motion } from 'motion/react';

interface CarDetailsViewProps {
  car: Car;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onBack: () => void;
}

export const CarDetailsView: React.FC<CarDetailsViewProps> = ({ car, isSaved, onToggleSave, onBack }) => {
  return (
    <div className="space-y-8 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="h-12 w-12 liquid-glass rounded-full flex items-center justify-center text-white hover:text-primary transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-3">
          <button className="h-12 w-12 liquid-glass rounded-full flex items-center justify-center text-white hover:text-primary transition-colors">
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => onToggleSave(car.id)}
            className="h-12 w-12 liquid-glass rounded-full flex items-center justify-center text-white hover:text-primary transition-colors"
          >
            <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="aspect-[16/9] w-full rounded-3xl overflow-hidden relative shadow-2xl shadow-primary/10"
      >
        <img 
          src={car.image} 
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60"></div>
      </motion.div>

      {/* Title & Price */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded">Featured</span>
            <span className="text-on-surface-variant text-sm font-medium">{car.year} Model</span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
            {car.make} <span className="text-primary">{car.model}</span>
          </h1>
          <div className="flex items-center gap-4 mt-2 text-on-surface-variant">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span className="text-xs uppercase tracking-wider font-label">Berlin, Germany</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span className="text-xs uppercase tracking-wider font-label">Listed 2 days ago</span>
            </div>
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest mb-1">Price</p>
          <p className="font-headline text-4xl font-bold text-white">${car.price.toLocaleString()}</p>
        </div>
      </div>

      {/* Key Specs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {car.specs.acceleration && (
          <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5">
            <Zap className="text-primary mb-3" size={24} />
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">0-60 mph</p>
            <p className="font-headline text-xl font-bold">{car.specs.acceleration}</p>
          </div>
        )}
        {car.specs.power && (
          <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5">
            <Gauge className="text-secondary mb-3" size={24} />
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">Power</p>
            <p className="font-headline text-xl font-bold">{car.specs.power}</p>
          </div>
        )}
        {car.specs.range && (
          <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5">
            <ShieldCheck className="text-tertiary mb-3" size={24} />
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">Range</p>
            <p className="font-headline text-xl font-bold">{car.specs.range}</p>
          </div>
        )}
        {car.specs.drive && (
          <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5">
            <Settings2 className="text-primary mb-3" size={24} />
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">Drive</p>
            <p className="font-headline text-xl font-bold">{car.specs.drive}</p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5">
        <h3 className="font-headline text-xl font-bold mb-4">Vehicle Description</h3>
        <p className="text-on-surface-variant leading-relaxed">
          This {car.year} {car.make} {car.model} represents the pinnacle of automotive engineering. 
          Finished in a stunning bespoke paint, it features a meticulously crafted interior with 
          premium materials throughout. With only {car.specs.miles || 'minimal'} miles on the odometer, 
          this vehicle is in pristine condition and ready for its next discerning owner.
        </p>
        <div className="grid grid-cols-2 gap-y-4 mt-8 pt-8 border-t border-white/5">
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">Engine</p>
            <p className="font-medium">{car.specs.engine || 'N/A'}</p>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">Transmission</p>
            <p className="font-medium">{car.specs.transmission || 'Automatic'}</p>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">Exterior Color</p>
            <p className="font-medium">Obsidian Black</p>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">Interior Color</p>
            <p className="font-medium">Saddle Brown Leather</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full bg-primary text-on-primary py-5 rounded-2xl font-bold uppercase tracking-widest text-lg hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">
        Book Private Viewing
      </button>
    </div>
  );
};
