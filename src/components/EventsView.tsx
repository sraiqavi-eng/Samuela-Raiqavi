import React, { useState, useMemo } from 'react';
import { EVENTS_DATA, CULTURE_IMAGE, DINING_IMAGE } from '../data/fijiData';
import { EventItem, IslandRegion, ListingItem } from '../types';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Clock, 
  Flame, 
  Plus, 
  Check, 
  Search,
  Share2
} from 'lucide-react';

interface EventsViewProps {
  onSelectItem: (item: EventItem) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onBookItem: (item: ListingItem) => void;
}

type PeriodFilter = 'all' | 'today' | 'weekend' | 'month' | 'upcoming';

export const EventsView: React.FC<EventsViewProps> = ({
  onSelectItem,
  savedIds,
  onToggleSave,
  onBookItem
}) => {
  const [activePeriod, setActivePeriod] = useState<PeriodFilter>('all');
  const [selectedSubtype, setSelectedSubtype] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const periods: { id: PeriodFilter; label: string; icon?: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'All Haps' },
    { id: 'today', label: 'Happening Today', icon: Flame },
    { id: 'weekend', label: 'This Weekend' },
    { id: 'month', label: 'This Month' },
    { id: 'upcoming', label: 'Upcoming' },
  ];

  const subtypes = [
    'all',
    'Concerts',
    'Festivals',
    'Sports',
    'Cultural Events',
    'Nightlife',
    'Live Music',
    'Food Events',
    'Community Events'
  ];

  const filteredEvents = useMemo(() => {
    return EVENTS_DATA.filter(ev => {
      if (activePeriod !== 'all' && ev.datePeriod !== activePeriod) return false;
      if (selectedSubtype !== 'all' && ev.subType !== selectedSubtype) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return ev.name.toLowerCase().includes(q) ||
          ev.venue.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activePeriod, selectedSubtype, searchQuery]);

  const handleShare = (ev: EventItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${ev.name} in Fiji! ${ev.dateDisplay} at ${ev.venue}`);
      setShareFeedback(ev.id);
      setTimeout(() => setShareFeedback(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      
      {/* Header Banner */}
      <section className="bg-slate-900 text-white relative overflow-hidden py-10 px-4 sm:px-6">
        <div className="absolute inset-0 z-0">
          <img
            src={CULTURE_IMAGE}
            alt="Fijian Cultural Celebration"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>Fiji Haps & Events Calendar</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            What\'s Happening in Fiji
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Live music, international rugby 7s matches, traditional fire mekes, coastal street food night markets, and island yacht regattas.
          </p>

          {/* Quick Period Tabs */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {periods.map(period => {
              const Icon = period.icon;
              const isActive = activePeriod === period.id;
              return (
                <button
                  key={period.id}
                  onClick={() => setActivePeriod(period.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-rose-300" />}
                  <span>{period.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Subtype Filter Strip & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {subtypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedSubtype(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSubtype === type
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? 'All Categories' : type}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px] w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, venues..."
              className="w-full bg-slate-50 text-slate-900 text-xs px-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Events List / Cards */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto my-8">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="font-heading font-bold text-base text-slate-800">No events found for this filter</h3>
            <p className="text-xs text-slate-500 mt-1">Try switching to "All Haps" or changing the category filter.</p>
            <button
              onClick={() => { setActivePeriod('all'); setSelectedSubtype('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg"
            >
              Show All Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => {
              const isSaved = savedIds.includes(event.id);
              return (
                <div
                  key={event.id}
                  onClick={() => onSelectItem(event)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  {/* Event Top Media */}
                  <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                    <img
                      src={event.image || CULTURE_IMAGE}
                      alt={event.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    {/* Period Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide bg-rose-600 text-white px-2.5 py-1 rounded-md shadow-sm">
                        {event.subType}
                      </span>
                    </div>

                    {/* Bookmark Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(event.id);
                      }}
                      className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-colors ${
                        isSaved ? 'bg-amber-500 text-white' : 'bg-slate-900/60 text-white hover:bg-slate-900'
                      }`}
                      title="Save to My Trip"
                    >
                      {isSaved ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4" />}
                    </button>

                    {/* Date banner */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{event.dateDisplay}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium truncate">{event.venue}</span>
                      </div>

                      <h3 className="font-heading font-bold text-base text-slate-900 line-clamp-1 hover:text-rose-700 transition-colors">
                        {event.name}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Footer with Admission & Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Ticket className="w-3.5 h-3.5 text-teal-600" />
                        <span className="truncate max-w-[150px]">{event.admission}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookItem(event);
                          }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-transform active:scale-95 shadow-sm"
                        >
                          Book Tickets
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(event);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Share event link"
                        >
                          {shareFeedback === event.id ? (
                            <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
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
