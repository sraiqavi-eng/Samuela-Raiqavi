import React, { useState, useMemo } from 'react';
import { 
  ALL_LISTINGS,
  ISLAND_REGIONS
} from '../data/fijiData';
import { ListingItem, IslandRegion } from '../types';
import { 
  Bed, 
  Utensils, 
  Bus, 
  MapPin, 
  Activity, 
  Calendar, 
  Tent, 
  Plus, 
  Minus, 
  RotateCcw, 
  Navigation, 
  Phone, 
  ExternalLink,
  Info,
  Check
} from 'lucide-react';

interface InteractiveMapProps {
  onSelectItem: (item: ListingItem) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onBookItem: (item: ListingItem) => void;
}

type MapCategoryFilter = 'all' | 'accommodation' | 'food' | 'transport' | 'attractions' | 'activities' | 'events' | 'village' | 'hospital' | 'fuel' | 'atm';

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onSelectItem,
  savedIds,
  onToggleSave,
  onBookItem
}) => {
  const [activeCategory, setActiveCategory] = useState<MapCategoryFilter>('all');
  const [selectedRegion, setSelectedRegion] = useState<IslandRegion>('all');
  const [selectedPinId, setSelectedPinId] = useState<string | null>('acc-1');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [simulatedUserLocation, setSimulatedUserLocation] = useState<{ name: string; x: number; y: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Category filters definition
  const categoryFilters: { id: MapCategoryFilter; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'All Places', icon: MapPin },
    { id: 'accommodation', label: 'Stays', icon: Bed },
    { id: 'food', label: 'Food & Drinks', icon: Utensils },
    { id: 'attractions', label: 'Attractions', icon: MapPin },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'village', label: 'Villages', icon: Tent },
    { id: 'transport', label: 'Transport', icon: Bus },
    { id: 'hospital', label: 'Hospitals', icon: Info },
    { id: 'fuel', label: 'Fuel', icon: Navigation },
    { id: 'atm', label: 'Banks / ATMs', icon: Navigation },
  ];

  // Filter listings based on category, region, and search
  const filteredListings = useMemo(() => {
    return ALL_LISTINGS.filter(item => {
      // Category check
      if (activeCategory !== 'all') {
        if (activeCategory === 'hospital' && !(item.category === 'service' && item.subType === 'Hospital')) return false;
        if (activeCategory === 'fuel' && !(item.category === 'service' && item.subType === 'Fuel Station')) return false;
        if (activeCategory === 'atm' && !(item.category === 'service' && item.subType === 'Bank / ATM')) return false;
        if (['accommodation', 'food', 'transport', 'attractions', 'activities', 'events', 'village'].includes(activeCategory)) {
          if (item.category !== activeCategory) return false;
        }
      }

      // Region check
      if (selectedRegion !== 'all' && item.islandRegion !== selectedRegion) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) ||
          item.locationName.toLowerCase().includes(q) ||
          item.subType.toLowerCase().includes(q);
      }

      return true;
    });
  }, [activeCategory, selectedRegion, searchQuery]);

  const selectedItem = useMemo(() => {
    return ALL_LISTINGS.find(item => item.id === selectedPinId) || filteredListings[0] || null;
  }, [selectedPinId, filteredListings]);

  // Color mapping based on category
  const getMarkerColor = (item: ListingItem) => {
    switch (item.category) {
      case 'accommodation': return 'bg-sky-500 ring-sky-300';
      case 'food': return 'bg-amber-500 ring-amber-300';
      case 'attractions': return 'bg-emerald-500 ring-emerald-300';
      case 'activities': return 'bg-indigo-500 ring-indigo-300';
      case 'events': return 'bg-rose-500 ring-rose-300';
      case 'village': return 'bg-teal-700 ring-teal-300';
      case 'transport': return 'bg-blue-600 ring-blue-300';
      case 'service': 
        if (item.subType === 'Hospital') return 'bg-red-600 ring-red-300';
        if (item.subType === 'Fuel Station') return 'bg-orange-500 ring-orange-300';
        return 'bg-purple-600 ring-purple-300';
      default: return 'bg-teal-500 ring-teal-200';
    }
  };

  const simulateLocation = (name: string, x: number, y: number) => {
    setSimulatedUserLocation({ name, x, y });
    setZoomLevel(1.2);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-4rem)] sm:h-[calc(100vh-4rem-4rem)] max-w-7xl mx-auto w-full relative bg-slate-900 overflow-hidden">
      
      {/* Top Controls Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 p-2 sm:p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-transparent">
        
        {/* Search & Island Region Select */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 mb-2">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places, beaches, hospitals, ATMs..."
              className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-xs sm:text-sm pl-8 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-400"
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as IslandRegion)}
            aria-label="Filter by Island Region"
            className="bg-slate-800/90 text-white text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-400"
          >
            {ISLAND_REGIONS.map(reg => (
              <option key={reg.id} value={reg.id}>{reg.label}</option>
            ))}
          </select>

          {/* Near Me Simulator Button */}
          <div className="relative group">
            <button
              onClick={() => {
                if (simulatedUserLocation) {
                  setSimulatedUserLocation(null);
                } else {
                  simulateLocation('Nadi International Airport', 33, 51);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                simulatedUserLocation 
                  ? 'bg-teal-500 text-white border-teal-400 shadow-md' 
                  : 'bg-slate-800/90 text-teal-300 border-teal-500/40 hover:bg-slate-800'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${simulatedUserLocation ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Near:</span>
              <span className="truncate max-w-[120px]">
                {simulatedUserLocation ? simulatedUserLocation.name.split(' ')[0] : 'Locate Me'}
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categoryFilters.map(filter => {
            const Icon = filter.icon;
            const isSelected = activeCategory === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isSelected 
                    ? 'bg-teal-500 text-white shadow-sm font-semibold' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Map Zoom Controls */}
      <div className="absolute right-4 top-28 sm:top-24 z-20 flex flex-col gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700 shadow-lg">
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.2))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.85))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoomLevel(1); setSelectedRegion('all'); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          title="Reset Map"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Canvas Map Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none bg-[#091b29]">
        
        {/* Ocean Background Texture and Waves */}
        <div 
          className="w-full h-full relative transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 1000 650"
            className="w-full h-full drop-shadow-2xl"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#082032" />
                <stop offset="50%" stopColor="#0b2b42" />
                <stop offset="100%" stopColor="#061824" />
              </linearGradient>

              {/* Island Land Gradient */}
              <linearGradient id="islandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e4620" />
                <stop offset="50%" stopColor="#2d5e30" />
                <stop offset="100%" stopColor="#19381b" />
              </linearGradient>

              {/* Barrier Reef Turquoise Gradient */}
              <linearGradient id="reefGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00c4cc" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#007788" stopOpacity="0.1" />
              </linearGradient>

              {/* Grid Lines Pattern */}
              <pattern id="latLongGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Ocean Fill with Coordinate Grid */}
            <rect width="1000" height="650" fill="url(#oceanGrad)" />
            <rect width="1000" height="650" fill="url(#latLongGrid)" />

            {/* Ocean Depth Bathymetry Contours */}
            <ellipse cx="480" cy="380" rx="350" ry="220" fill="#0c3552" opacity="0.4" />
            <ellipse cx="780" cy="200" rx="200" ry="120" fill="#0c3552" opacity="0.4" />

            {/* ================= BARRIER REEF SHALLOWS (TURQUOISE) ================= */}
            {/* Mamanuca & Yasawa Reef Shelf */}
            <path
              d="M 200 200 Q 250 180 320 280 Q 260 380 200 370 Q 180 320 200 200 Z"
              fill="url(#reefGrad)"
              stroke="#14b8a6"
              strokeWidth="0.8"
              strokeDasharray="3,3"
            />
            {/* Coral Coast Barrier Reef Lagoon */}
            <path
              d="M 300 440 Q 450 510 600 480 Q 560 520 400 525 Q 310 490 300 440 Z"
              fill="url(#reefGrad)"
              stroke="#06b6d4"
              strokeWidth="1"
            />
            {/* Taveuni Rainbow Reef */}
            <ellipse cx="880" cy="180" rx="60" ry="40" fill="url(#reefGrad)" stroke="#14b8a6" strokeWidth="1" />

            {/* ================= FIJI ISLANDS LANDMASSES ================= */}
            
            {/* 1. VITI LEVU (Main Island) */}
            <g id="viti-levu" className="transition-all hover:brightness-110">
              {/* Coastline Shadow */}
              <path
                d="M 310 320 
                   Q 330 290 380 280 
                   Q 440 270 510 290 
                   Q 580 310 630 350 
                   Q 660 380 690 420 
                   Q 710 470 680 500 
                   Q 640 520 560 500 
                   Q 480 510 420 520 
                   Q 350 510 310 460 
                   Q 290 420 280 370 
                   Z"
                fill="#163818"
                opacity="0.8"
                transform="translate(4, 5)"
              />
              {/* Main Landmass */}
              <path
                d="M 310 320 
                   Q 330 290 380 280 
                   Q 440 270 510 290 
                   Q 580 310 630 350 
                   Q 660 380 690 420 
                   Q 710 470 680 500 
                   Q 640 520 560 500 
                   Q 480 510 420 520 
                   Q 350 510 310 460 
                   Q 290 420 280 370 
                   Z"
                fill="url(#islandGrad)"
                stroke="#4ade80"
                strokeWidth="1.5"
              />
              {/* Viti Levu Mountain Ridges (Highlands & Mt Tomanivi) */}
              <path
                d="M 380 380 Q 480 370 560 410 Q 520 440 450 430 Z"
                fill="#1f421e"
                opacity="0.7"
              />
              <text x="470" y="405" fill="#a7f3d0" fontSize="13" fontWeight="bold" opacity="0.8" letterSpacing="2">
                VITI LEVU
              </text>
              <text x="315" y="360" fill="#f8fafc" fontSize="10" fontWeight="600">Nadi</text>
              <text x="670" y="475" fill="#f8fafc" fontSize="10" fontWeight="600">Suva</text>
              <text x="380" y="505" fill="#f8fafc" fontSize="9" fontWeight="500">Coral Coast</text>
            </g>

            {/* 2. VANUA LEVU (Second Largest Island) */}
            <g id="vanua-levu">
              <path
                d="M 640 180 
                   Q 700 140 760 150 
                   Q 830 160 860 210 
                   Q 820 240 770 230 
                   Q 730 250 680 260 
                   Q 620 250 600 230 
                   Z"
                fill="url(#islandGrad)"
                stroke="#4ade80"
                strokeWidth="1.5"
              />
              <text x="710" y="200" fill="#a7f3d0" fontSize="11" fontWeight="bold" opacity="0.8" letterSpacing="1.5">
                VANUA LEVU
              </text>
              <text x="740" y="240" fill="#f8fafc" fontSize="9" fontWeight="600">Savusavu</text>
            </g>

            {/* 3. TAVEUNI (The Garden Island) */}
            <g id="taveuni">
              <ellipse
                cx="890"
                cy="210"
                rx="35"
                ry="18"
                transform="rotate(-40 890 210)"
                fill="url(#islandGrad)"
                stroke="#4ade80"
                strokeWidth="1.2"
              />
              <text x="875" y="175" fill="#a7f3d0" fontSize="10" fontWeight="bold">
                TAVEUNI
              </text>
            </g>

            {/* 4. MAMANUCA ISLANDS */}
            <g id="mamanucas">
              {/* Malolo Island */}
              <circle cx="230" cy="360" r="10" fill="#3b7a40" stroke="#86efac" strokeWidth="1" />
              {/* Castaway & Tivua */}
              <circle cx="245" cy="335" r="7" fill="#3b7a40" stroke="#86efac" strokeWidth="1" />
              <circle cx="260" cy="315" r="6" fill="#3b7a40" stroke="#86efac" strokeWidth="1" />
              <text x="170" y="345" fill="#6ee7b7" fontSize="9" fontWeight="600">Mamanucas</text>
            </g>

            {/* 5. YASAWA ISLANDS CHAIN */}
            <g id="yasawas">
              <path
                d="M 230 180 Q 250 220 270 270"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4,8"
                fill="none"
              />
              <circle cx="235" cy="185" r="7" fill="#3b7a40" stroke="#86efac" strokeWidth="1" />
              <circle cx="248" cy="215" r="8" fill="#3b7a40" stroke="#86efac" strokeWidth="1" />
              <circle cx="260" cy="245" r="7" fill="#3b7a40" stroke="#86efac" strokeWidth="1" />
              <circle cx="272" cy="275" r="6" fill="#3b7a40" stroke="#86efac" strokeWidth="1" />
              <text x="210" y="170" fill="#6ee7b7" fontSize="9" fontWeight="600">Yasawa Islands</text>
            </g>

            {/* 6. KADAVU & ASTROLABE REEF */}
            <g id="kadavu">
              <ellipse
                cx="500"
                cy="590"
                rx="45"
                ry="14"
                transform="rotate(-15 500 590)"
                fill="url(#islandGrad)"
                stroke="#4ade80"
                strokeWidth="1.2"
              />
              <text x="475" y="620" fill="#a7f3d0" fontSize="10" fontWeight="bold">
                KADAVU
              </text>
            </g>

            {/* 7. LOMAIVITI (Ovalau / Levuka) */}
            <g id="lomaiviti">
              <circle cx="750" cy="370" r="9" fill="#3b7a40" stroke="#86efac" strokeWidth="1" />
              <text x="765" y="375" fill="#93c5fd" fontSize="9">Ovalau (Levuka)</text>
            </g>

            {/* Compass Rose */}
            <g transform="translate(80, 520) scale(0.7)">
              <circle cx="50" cy="50" r="40" fill="#082032" stroke="#334155" strokeWidth="2" />
              <polygon points="50,15 55,50 50,45 45,50" fill="#14b8a6" />
              <polygon points="50,85 55,50 50,55 45,50" fill="#64748b" />
              <polygon points="85,50 50,55 55,50 50,45" fill="#64748b" />
              <polygon points="15,50 50,55 45,50 50,45" fill="#64748b" />
              <text x="46" y="12" fill="#14b8a6" fontSize="12" fontWeight="bold">N</text>
            </g>

            {/* Simulated User Location Ring */}
            {simulatedUserLocation && (
              <g transform={`translate(${simulatedUserLocation.x * 10}, ${simulatedUserLocation.y * 6.5})`}>
                <circle cx="0" cy="0" r="18" fill="none" stroke="#2dd4bf" strokeWidth="2" opacity="0.6" className="animate-ping" />
                <circle cx="0" cy="0" r="8" fill="#14b8a6" stroke="#ffffff" strokeWidth="2.5" />
              </g>
            )}

            {/* ================= INTERACTIVE PINS ================= */}
            {filteredListings.map(item => {
              // Convert percentages (0-100) to SVG canvas coordinates (0-1000 width, 0-650 height)
              const posX = item.coordinates.x * 10;
              const posY = item.coordinates.y * 6.5;
              const isSelected = selectedPinId === item.id;
              const colorClass = getMarkerColor(item);

              return (
                <g 
                  key={item.id} 
                  transform={`translate(${posX}, ${posY})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPinId(item.id);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Pin Selection Highlight Ring */}
                  {isSelected && (
                    <circle 
                      cx="0" 
                      cy="0" 
                      r="16" 
                      fill="none" 
                      stroke="#ffffff" 
                      strokeWidth="2.5"
                      strokeDasharray="4,2"
                      className="animate-spin"
                    />
                  )}

                  {/* Marker Pin Base */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? 10 : 7}
                    className={`transition-all duration-200 stroke-white stroke-2 shadow-md ${
                      colorClass.split(' ')[0]
                    } ${isSelected ? 'scale-125' : 'hover:scale-125'}`}
                  />

                  {/* Small Label for Selected */}
                  {isSelected && (
                    <g transform="translate(0, -18)">
                      <rect
                        x="-60"
                        y="-16"
                        width="120"
                        height="20"
                        rx="10"
                        fill="#0f172a"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        opacity="0.95"
                      />
                      <text
                        x="0"
                        y="-3"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {item.name.length > 18 ? item.name.substring(0, 16) + '...' : item.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

          </svg>
        </div>

      </div>

      {/* Selected Location Details Bottom Drawer / Sheet */}
      {selectedItem && (
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-auto sm:w-96 z-30 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 p-3 sm:p-4 text-white shadow-2xl">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-teal-400 font-medium mb-1">
                <span>{selectedItem.subType}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{selectedItem.locationName}</span>
              </div>
              <h4 className="font-heading font-bold text-sm sm:text-base text-white truncate">
                {selectedItem.name}
              </h4>
            </div>

            {/* Save / Bookmark Button */}
            <button
              onClick={() => onToggleSave(selectedItem.id)}
              className={`p-2 rounded-xl border transition-colors ${
                savedIds.includes(selectedItem.id)
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Save to My Trip"
            >
              {savedIds.includes(selectedItem.id) ? (
                <Check className="w-4 h-4 text-amber-400" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">
            {selectedItem.description}
          </p>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800 text-xs">
            <div className="text-slate-400 truncate">
              {selectedItem.priceEstimate ? (
                <span className="text-emerald-400 font-semibold">{selectedItem.priceEstimate.split(' ')[0]} {selectedItem.priceEstimate.split(' ')[1]}</span>
              ) : selectedItem.contact?.phone ? (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {selectedItem.contact.phone}
                </span>
              ) : (
                <span>Fiji Islands</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onBookItem(selectedItem)}
                className="px-2.5 py-1.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold text-xs transition-colors shadow-sm"
              >
                Book Direct
              </button>
              <button
                onClick={() => onSelectItem(selectedItem)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                <span>Details</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
