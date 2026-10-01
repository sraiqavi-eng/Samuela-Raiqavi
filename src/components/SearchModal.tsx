import React, { useState, useMemo } from 'react';
import { ALL_LISTINGS } from '../data/fijiData';
import { ListingItem } from '../types';
import { Search, X, MapPin, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: ListingItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectItem
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_LISTINGS.filter(item => {
      return item.name.toLowerCase().includes(q) ||
        item.locationName.toLowerCase().includes(q) ||
        item.subType.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
    }).slice(0, 8);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hotels, Kokoda, taxis, diving, villages..."
            className="w-full text-sm text-slate-900 placeholder-slate-400 bg-transparent border-none focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              ESC
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Type to search any accommodation, restaurant, village, or activity across Fiji.
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No results found for "{query}". Try "Resort", "Diving", "Kokoda", or "Navala".
            </div>
          ) : (
            <div className="space-y-1">
              {results.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-teal-600 font-semibold mb-0.5">
                      <span>{item.subType}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{item.locationName}</span>
                    </div>
                    <div className="font-heading font-bold text-sm text-slate-900 group-hover:text-teal-700 truncate">
                      {item.name}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
