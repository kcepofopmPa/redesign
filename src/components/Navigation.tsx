import React from 'react';
import { Search, Heart, Settings, Menu, SlidersHorizontal, ChevronLeft } from 'lucide-react';
import { View } from '../types';

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-white/5">
      <div className="flex items-center gap-4">
        {currentView === 'details' ? (
          <button 
            onClick={() => onNavigate('inventory')}
            className="active:scale-95 transition-transform text-primary flex items-center gap-1"
          >
            <ChevronLeft size={24} />
          </button>
        ) : (
          <button className="active:scale-95 transition-transform text-primary">
            <Menu size={24} />
          </button>
        )}
        <h1 
          className="text-2xl font-bold tracking-widest text-primary font-headline cursor-pointer"
          onClick={() => onNavigate('inventory')}
        >
          KINETIC
        </h1>
      </div>
      <button 
        className="active:scale-95 transition-transform text-primary"
        onClick={() => onNavigate('filters')}
      >
        <SlidersHorizontal size={24} />
      </button>
    </header>
  );
};

export const BottomNav: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'inventory' as View, label: 'Search', icon: Search },
    { id: 'saved' as View, label: 'Saved', icon: Heart },
    { id: 'settings' as View, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full h-20 bg-surface-container-low/90 backdrop-blur-2xl flex justify-around items-center px-4 pb-4 rounded-t-2xl z-50 border-t border-white/5 lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
              isActive ? 'text-primary font-bold' : 'text-white/40 hover:text-white/90'
            }`}
          >
            <Icon size={24} fill={isActive ? 'currentColor' : 'none'} />
            <span className="text-[10px] uppercase tracking-[0.05em] mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export const Sidebar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'inventory' as View, label: 'Showroom', icon: Search },
    { id: 'saved' as View, label: 'Saved Cars', icon: Heart },
    { id: 'settings' as View, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface-container-low py-8 px-4 gap-6 z-40 mt-16 border-r border-white/5">
      <div className="flex flex-col mb-4 px-4">
        <span className="text-xl font-bold text-white font-headline">KINETIC</span>
        <span className="text-xs text-neutral-500 font-label tracking-widest uppercase">Elite Member</span>
      </div>
      <div className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:translate-x-1 ${
                isActive 
                  ? 'text-primary bg-primary/10 border-r-4 border-primary' 
                  : 'text-neutral-500 hover:bg-neutral-800/50'
              }`}
            >
              <Icon size={20} fill={isActive ? 'currentColor' : 'none'} />
              <span className="font-medium font-headline">{item.label}</span>
            </button>
          );
        })}
      </div>
      <button className="mt-auto bg-primary text-on-primary font-headline font-bold py-4 rounded-xl hover:bg-primary-dim transition-colors uppercase tracking-widest text-xs mx-4">
        Book Test Drive
      </button>
    </aside>
  );
};
