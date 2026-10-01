import React from 'react';
import { Compass, MapPin, Calendar, Tent, Info, Bookmark } from 'lucide-react';
import { MainTab } from '../types';

interface BottomNavProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  savedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  savedCount
}) => {
  const tabs: { id: MainTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'map', label: 'Fiji Map', icon: MapPin },
    { id: 'events', label: 'Haps / Events', icon: Calendar },
    { id: 'villages', label: 'Villages', icon: Tent },
    { id: 'essentials', label: 'Essentials', icon: Info },
    { id: 'itinerary', label: 'My Trip', icon: Bookmark, badge: savedCount }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe">
      <div className="max-w-md md:max-w-xl mx-auto grid grid-cols-6 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center h-full min-h-[44px] py-1 transition-colors select-none ${
                isActive ? 'text-teal-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 whitespace-nowrap truncate max-w-full px-0.5 ${
                isActive ? 'font-bold text-teal-700' : 'font-medium'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-5 h-0.5 bg-teal-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
