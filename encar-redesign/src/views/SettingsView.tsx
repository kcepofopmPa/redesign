import React from 'react';
import { User, Bell, Globe, LogOut, Edit2, ChevronRight } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="mb-8">
        <h2 className="font-headline text-4xl font-bold text-on-surface mb-1">Settings</h2>
        <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest">System Configuration</p>
      </div>

      <div className="space-y-6">
        {/* Account Profile Section */}
        <section className="liquid-glass rounded-xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <User size={20} className="text-primary" />
            <h3 className="font-headline text-lg font-medium">Account Profile</h3>
          </div>
          
          <div className="flex items-center gap-4 py-2">
            <div className="relative">
              <img 
                alt="User profile" 
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 bg-primary text-on-primary p-1 rounded-full">
                <Edit2 size={12} />
              </div>
            </div>
            <div>
              <p className="font-headline font-bold text-white">Alex Sterling</p>
              <p className="text-xs text-on-surface-variant">alex.s@velocity.io</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 font-bold">Display Name</label>
              <input 
                className="w-full bg-surface-container-highest border-none rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary transition-all p-3" 
                type="text" 
                defaultValue="Alex Sterling"
              />
            </div>
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="liquid-glass rounded-xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Bell size={20} className="text-secondary" />
            <h3 className="font-headline text-lg font-medium">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Price Drop Alerts</p>
                <p className="text-[11px] text-on-surface-variant">Notify when saved cars decrease in price</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Regional & Language */}
        <section className="liquid-glass rounded-xl p-5 border border-white/5 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Globe size={20} className="text-tertiary" />
            <h3 className="font-headline text-lg font-medium">Regional</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 font-bold">Currency Selection</label>
              <select className="w-full bg-surface-container-highest border-none rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary appearance-none p-3">
                <option>USD ($) - US Dollar</option>
                <option defaultValue="KRW">KRW (₩) - South Korean Won</option>
                <option>EUR (€) - Euro</option>
              </select>
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 font-bold">Search Region</label>
              <div className="flex items-center bg-surface-container-highest rounded-lg px-3 py-3">
                <Globe size={18} className="text-on-surface-variant mr-2" />
                <span className="text-sm">Global - All Regions</span>
                <ChevronRight size={18} className="text-primary ml-auto" />
              </div>
            </div>
          </div>
        </section>

        <div className="pt-4">
          <button className="w-full bg-gradient-to-r from-primary to-primary-dim text-white py-4 rounded-xl font-headline font-bold text-lg active:scale-[0.98] transition-transform shadow-lg shadow-primary/20">
            Save Changes
          </button>
          <button className="w-full mt-4 text-red-500 text-sm font-label uppercase tracking-widest font-bold active:opacity-60 transition-opacity flex items-center justify-center gap-2">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
