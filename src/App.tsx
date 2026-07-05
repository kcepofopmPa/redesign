import React, { useState, useEffect } from 'react';
import { View } from './types';
import { Navbar, BottomNav, Sidebar } from './components/Navigation';
import { InventoryView } from './views/InventoryView';
import { SavedView } from './views/SavedView';
import { SettingsView } from './views/SettingsView';
import { FiltersView } from './views/FiltersView';
import { CarDetailsView } from './views/CarDetailsView';
import { MOCK_CARS } from './constants';
import { FilterState } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('inventory');
  const [savedIds, setSavedIds] = useState<string[]>(['1', '4']);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    manufacturer: [],
    priceRange: [0, 500000],
    fuelType: []
  });

  const toggleSave = (id: string) => {
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const openDetails = (id: string) => {
    setSelectedCarId(id);
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigate = (view: View) => {
    if (view === 'filters') {
      setIsFiltersOpen(true);
    } else {
      setCurrentView(view);
      setSelectedCarId(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const applyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setIsFiltersOpen(false);
  };

  const selectedCar = MOCK_CARS.find(c => c.id === selectedCarId);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans">
      <Navbar currentView={currentView} onNavigate={navigate} />
      <Sidebar currentView={currentView} onNavigate={navigate} />
      
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto lg:ml-64 lg:max-w-4xl lg:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView === 'details' ? `details-${selectedCarId}` : currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'inventory' && (
              <InventoryView 
                savedIds={savedIds} 
                onToggleSave={toggleSave} 
                onOpenFilters={() => setIsFiltersOpen(true)} 
                onOpenDetails={openDetails}
                filters={filters}
              />
            )}
            {currentView === 'saved' && (
              <SavedView 
                savedIds={savedIds} 
                onToggleSave={toggleSave} 
                onOpenDetails={openDetails}
              />
            )}
            {currentView === 'settings' && (
              <SettingsView />
            )}
            {currentView === 'details' && selectedCar && (
              <CarDetailsView 
                car={selectedCar} 
                isSaved={savedIds.includes(selectedCar.id)}
                onToggleSave={toggleSave}
                onBack={() => navigate('inventory')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav currentView={currentView} onNavigate={navigate} />
      
      <FiltersView 
        isOpen={isFiltersOpen} 
        onClose={() => setIsFiltersOpen(false)} 
        filters={filters}
        onApply={applyFilters}
      />

      {/* Ambient Lighting Effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full"></div>
      </div>
    </div>
  );
}
