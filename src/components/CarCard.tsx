import React from 'react';
import { Heart, Zap, Settings2, Gauge } from 'lucide-react';
import { Car } from '../types';
import { motion } from 'motion/react';

interface CarCardProps {
  car: Car;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  onOpenDetails?: (id: string) => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, isSaved, onToggleSave, onOpenDetails }) => {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden group"
    >
      <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden mb-4 relative">
        <img 
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          src={car.image}
          referrerPolicy="no-referrer"
          onClick={() => onOpenDetails?.(car.id)}
        />
        
        {car.tags.map((tag, i) => (
          <div 
            key={i}
            className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              tag === 'Price Drop' 
                ? 'bg-primary/20 backdrop-blur-md text-primary' 
                : 'bg-secondary-container text-white'
            }`}
          >
            {tag}
          </div>
        ))}

        <button 
          onClick={() => onToggleSave?.(car.id)}
          className="absolute top-4 right-4 h-10 w-10 liquid-glass rounded-full flex items-center justify-center text-white/80 hover:text-primary transition-colors"
        >
          <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'text-primary' : ''} />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-1">
        <div className="flex justify-between items-end">
          <div className="cursor-pointer" onClick={() => onOpenDetails?.(car.id)}>
            <p className="text-primary font-label text-xs font-bold uppercase tracking-[0.1em]">{car.year} {car.make}</p>
            <h3 className="font-headline text-2xl font-bold tracking-tight">{car.model}</h3>
          </div>
          <div className="text-right">
            <p className="font-headline text-2xl font-bold text-white">${car.price.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2 border-y border-white/5 overflow-x-auto no-scrollbar">
          {car.specs.miles && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-secondary"><Zap size={14} /></span>
              <span className="text-xs text-on-surface-variant font-medium">{car.specs.miles}</span>
            </div>
          )}
          {car.specs.engine && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-secondary"><Zap size={14} /></span>
              <span className="text-xs text-on-surface-variant font-medium">{car.specs.engine}</span>
            </div>
          )}
          {car.specs.drive && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-secondary"><Settings2 size={14} /></span>
              <span className="text-xs text-on-surface-variant font-medium">{car.specs.drive}</span>
            </div>
          )}
        </div>

        <button 
          onClick={() => onOpenDetails?.(car.id)}
          className="w-full bg-surface-container-highest text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-surface-bright transition-colors active:scale-95"
        >
          Open details
        </button>
      </div>
    </motion.article>
  );
};
