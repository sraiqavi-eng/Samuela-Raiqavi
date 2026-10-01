import React, { useState, useMemo } from 'react';
import { 
  ACCOMMODATIONS, 
  FOOD_ITEMS, 
  TRANSPORT_ITEMS, 
  ATTRACTION_ITEMS, 
  ACTIVITY_ITEMS,
  ISLAND_REGIONS,
  HERO_IMAGE,
  CULTURE_IMAGE,
  REEF_IMAGE,
  DINING_IMAGE
} from '../data/fijiData';
import { ListingItem, IslandRegion, SubCategory } from '../types';
import { 
  Search, 
  Bed, 
  Utensils, 
  Bus, 
  MapPin, 
  Activity, 
  Star, 
  ArrowRight, 
  Plus, 
  Check, 
  Sparkles,
  Phone
} from 'lucide-react';

interface ExploreViewProps {
  onSelectItem: (item: ListingItem) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onNavigateToMap: () => void;
  onBookItem: (item: ListingItem) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onSelectItem,
  savedIds,
  onToggleSave,
  onNavigateToMap,
  onBookItem
}) => {
  const [activeCategory, setActiveCategory] = useState<SubCategory>('all');
  const [selectedRegion, setSelectedRegion] = useState<IslandRegion>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubFilter, setActiveSubFilter] = useState<string>('all');

  // Primary categories
  const categories: { id: SubCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'All Fiji', icon: Sparkles },
    { id: 'accommodation', label: 'Accommodation', icon: Bed },
    { id: 'food', label: 'Food & Nightlife', icon: Utensils },
    { id: 'transport', label: 'Transport', icon: Bus },
    { id: 'attractions', label: 'Attractions', icon: MapPin },
    { id: 'activities', label: 'Activities', icon: Activity },
  ];

  // Specific sub-types based on activeCategory
  const subFilterOptions = useMemo(() => {
    switch (activeCategory) {
      case 'accommodation':
        return ['all', 'Resorts', 'Hotels', 'Apartments', 'Hostels', 'Village Stays', 'Holiday Homes'];
      case 'food':
        return ['all', 'Local Food', 'Restaurants', 'Bars', 'Cafes', 'Nightclubs'];
      case 'transport':
        return ['all', 'Airport Transfers', 'Ferries', 'Buses', 'Domestic Flights', 'Taxis'];
      case 'attractions':
        return ['all', 'Beaches', 'Waterfalls', 'Parks', 'Cultural Locations', 'Historical Sites'];
      case 'activities':
        return ['all', 'Diving', 'Surfing', 'Adventure Activities', 'Hiking', 'Sailing'];
      default:
        return ['all'];
    }
  }, [activeCategory]);

  // Aggregate listings
  const allListings = useMemo(() => {
    return [
      ...ACCOMMODATIONS,
      ...FOOD_ITEMS,
      ...TRANSPORT_ITEMS,
      ...ATTRACTION_ITEMS,
      ...ACTIVITY_ITEMS
    ];
  }, []);

  // Filter listings
  const filteredListings = useMemo(() => {
    return allListings.filter(item => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      // Sub-type filter
      if (activeSubFilter !== 'all' && item.subType !== activeSubFilter) {
        return false;
      }

      // Region filter
      if (selectedRegion !== 'all' && item.islandRegion !== selectedRegion) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) ||
          item.locationName.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.subType.toLowerCase().includes(q);
      }

      return true;
    });
  }, [allListings, activeCategory, activeSubFilter, selectedRegion, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="Fiji Tropical Islands and Barrier Reef"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-45 scale-105 transition-transform duration-700 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-16 sm:pb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-4 border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Visitor Companion</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Everything Fiji. <br className="hidden sm:inline" />
              <span className="text-teal-400">All in One Place.</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl">
              From luxury overwater bures and authentic mountain village homestays to sacred kava rituals, world-class reef diving, and island transport.
            </p>

            {/* Quick Hero Search Input */}
            <div className="mt-6 flex items-center bg-white/95 rounded-2xl p-1.5 shadow-xl text-slate-900 max-w-lg">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resorts, Kokoda dining, ferries, dive spots..."
                className="w-full px-3 py-2 text-sm bg-transparent border-none focus:outline-none placeholder-slate-400 text-slate-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Links & Live Info */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="text-teal-300 font-semibold">Popular:</span>
              <button onClick={() => { setActiveCategory('accommodation'); setActiveSubFilter('Resorts'); }} className="hover:text-white underline decoration-slate-500">Luxury Resorts</button>
              <span>·</span>
              <button onClick={() => { setActiveCategory('food'); setActiveSubFilter('Local Food'); }} className="hover:text-white underline decoration-slate-500">Kokoda & Lovo</button>
              <span>·</span>
              <button onClick={() => { setActiveCategory('activities'); setActiveSubFilter('Diving'); }} className="hover:text-white underline decoration-slate-500">Shark Diving</button>
              <span>·</span>
              <button onClick={onNavigateToMap} className="text-teal-400 font-bold hover:underline flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Interactive Map</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Sticky Filter Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200/80 mb-6">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-3 border-b border-slate-100">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setActiveSubFilter('all');
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap min-h-[40px] ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Filters and Island Region Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            {/* Sub-type pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {subFilterOptions.length > 1 && subFilterOptions.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubFilter(sub)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeSubFilter === sub
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub === 'all' ? 'All Types' : sub}
                </button>
              ))}
            </div>

            {/* Island Region Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as IslandRegion)}
                aria-label="Filter by Region"
                className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500"
              >
                {ISLAND_REGIONS.map(reg => (
                  <option key={reg.id} value={reg.id}>{reg.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count & Quick View Bar */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="text-xs sm:text-sm text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900 tabular-nums">{filteredListings.length}</span> places & experiences
          </div>
          <button
            onClick={onNavigateToMap}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors border border-teal-200/60"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Show on Fiji Map</span>
          </button>
        </div>

        {/* Cards Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto my-12">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">No matches found</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try adjusting your search query, sub-filter, or island region to see more of Fiji.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setActiveSubFilter('all');
                setSelectedRegion('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((item) => {
              const isSaved = savedIds.includes(item.id);
              
              // Select default image if not present
              let cardImage = item.image;
              if (!cardImage) {
                if (item.category === 'food') cardImage = DINING_IMAGE;
                else if (item.category === 'activities') cardImage = REEF_IMAGE;
                else if (item.category === 'attractions') cardImage = CULTURE_IMAGE;
                else cardImage = HERO_IMAGE;
              }

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  {/* Card Image Slot */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={cardImage}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        {item.subType}
                      </span>
                      
                      {/* Save Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(item.id);
                        }}
                        className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                          isSaved 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-slate-900/60 text-white hover:bg-slate-900'
                        }`}
                        title={isSaved ? "Saved to My Trip" : "Save to My Trip"}
                      >
                        {isSaved ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Bottom overlay text */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-1 font-medium truncate drop-shadow">
                        <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                        <span className="truncate">{item.locationName}</span>
                      </div>
                      {item.rating && (
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-300 shrink-0 tabular-nums">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Quiet unboxed metadata */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <span className="capitalize">{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{item.islandRegion.replace(/-/g, ' ')}</span>
                      </div>

                      <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                        {item.name}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Price, Features, and CTA Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="text-slate-700 font-semibold truncate pr-2">
                        {item.priceEstimate ? (
                          <span className="text-emerald-700">{item.priceEstimate}</span>
                        ) : item.contact?.phone ? (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {item.contact.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400">Fiji Islands</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookItem(item);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-transform active:scale-95"
                        >
                          Book Direct
                        </button>
                        <div className="flex items-center gap-0.5 text-slate-500 font-semibold group-hover:text-teal-700 transition-colors">
                          <span className="hidden sm:inline">Info</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
