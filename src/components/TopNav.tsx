import React from 'react';
import { Compass, CalendarCheck, Coins, Search, Landmark } from 'lucide-react';
import { MainTab } from '../types';

interface TopNavProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  savedCount: number;
  onOpenSearch: () => void;
  onOpenCurrency: () => void;
  onOpenOwnerPortal: () => void;
  onOpenGoogleWorkspace: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onTabChange,
  savedCount,
  onOpenSearch,
  onOpenCurrency,
  onOpenOwnerPortal,
  onOpenGoogleWorkspace
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Brand Zone */}
        <div 
          onClick={() => onTabChange('explore')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-teal-700/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                FIJI HAPS
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                Bula!
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium tracking-tight hidden sm:inline">
              Everything Fiji · All in One Place
            </span>
          </div>
        </div>

        {/* Quick Action Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search Trigger Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Search Fiji listings"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">Search Fiji...</span>
          </button>

          {/* Quick Currency Converter Modal Trigger */}
          <button
            onClick={onOpenCurrency}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200/60"
            title="Fijian Dollar Currency Converter"
          >
            <Coins className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold tabular-nums">FJD</span>
          </button>

          {/* Google Workspace Integration Button */}
          <button
            onClick={onOpenGoogleWorkspace}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-colors"
            title="Google Workspace Hub (Drive, Sheets, Calendar, Contacts)"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span className="hidden md:inline text-xs font-bold text-slate-800">Workspace</span>
          </button>

          {/* App Owner & Bank Account Hub Button */}
          <button
            onClick={onOpenOwnerPortal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
            title="Owner & Bank Payout Hub (25% Revenue)"
          >
            <Landmark className="w-4 h-4 text-emerald-700" />
            <span className="hidden lg:inline text-xs font-bold text-slate-800">Owner Hub</span>
          </button>

          {/* My Trip / Itinerary Pill */}
          <button
            onClick={() => onTabChange('itinerary')}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
          >
            <CalendarCheck className="w-4 h-4" />
            <span className="hidden sm:inline">My Trip</span>
            {savedCount > 0 && (
              <span className="ml-1 bg-amber-500 text-white font-bold text-[10px] rounded-full w-5 h-5 flex items-center justify-center tabular-nums">
                {savedCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
