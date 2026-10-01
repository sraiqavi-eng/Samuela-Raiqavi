import React, { useState } from 'react';
import { ALL_LISTINGS } from '../data/fijiData';
import { ListingItem, ItineraryDay, BookingRecord } from '../types';
import { 
  Bookmark, 
  Trash2, 
  MapPin, 
  Calendar, 
  Plus, 
  CheckSquare, 
  Square, 
  ArrowRight,
  ExternalLink,
  Luggage,
  Sparkles,
  Ticket,
  CheckCircle2,
  QrCode,
  Download,
  X
} from 'lucide-react';

interface ItineraryViewProps {
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onSelectItem: (item: ListingItem) => void;
  onExplore: () => void;
  onNavigateToMap: () => void;
  bookings: BookingRecord[];
  onCancelBooking: (id: string) => void;
  onOpenGoogleWorkspace?: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  savedIds,
  onToggleSave,
  onSelectItem,
  onExplore,
  onNavigateToMap,
  bookings,
  onCancelBooking,
  onOpenGoogleWorkspace
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'saved' | 'planner' | 'packing'>(
    bookings.length > 0 ? 'bookings' : 'saved'
  );
  const [selectedTicketBooking, setSelectedTicketBooking] = useState<BookingRecord | null>(null);
  
  // Custom packing checklist state
  const [packingItems, setPackingItems] = useState<{ id: string; label: string; checked: boolean; category: string }[]>([
    { id: 'p1', label: 'Reef shoes / Water booties (essential for coral & stonefish protection)', checked: false, category: 'Ocean Gear' },
    { id: 'p2', label: 'Sulu (sarong) covering knees for village visits and temples', checked: true, category: 'Cultural Attire' },
    { id: 'p3', label: 'Reef-safe biodegradable sunscreen (oxybenzone-free)', checked: true, category: 'Health' },
    { id: 'p4', label: 'Waterproof phone pouch & dry bag for boat transfers', checked: false, category: 'Travel Gear' },
    { id: 'p5', label: 'Tropical strength insect repellent (DEET or Picaridin)', checked: false, category: 'Health' },
    { id: 'p6', label: 'Snorkel mask & fin set (or rent at resort)', checked: false, category: 'Ocean Gear' },
    { id: 'p7', label: 'Bundle of Waka (Kava root) for village Sevusevu welcome', checked: false, category: 'Cultural Attire' },
    { id: 'p8', label: 'Universal power plug adapter (Type I, same as Australia/NZ)', checked: true, category: 'Travel Gear' },
    { id: 'p9', label: 'Small FJD cash notes ($5, $10, $20) for local markets and bus cards', checked: false, category: 'Money' },
  ]);

  const [days, setDays] = useState<ItineraryDay[]>([
    { dayNumber: 1, title: 'Arrival & Port Denarau Marina', notes: 'Check into resort, take airport shuttle, enjoy sunset dinner at Nadina.', items: ['acc-1', 'food-1'] },
    { dayNumber: 2, title: 'Mamanuca Reefs & Watersports', notes: 'Snorkeling at barrier reef, relax at Cloud 9 floating platform.', items: ['food-2', 'act-5'] },
    { dayNumber: 3, title: 'Traditional Navala Village Immersion', notes: 'Present waka kava root for Sevusevu, swim in Ba river.', items: ['vil-1', 'acc-4'] },
  ]);

  const savedListings = ALL_LISTINGS.filter(item => savedIds.includes(item.id));

  const togglePacking = (id: string) => {
    setPackingItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      
      {/* Header */}
      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Bookmark className="w-4 h-4 fill-amber-400" />
            <span>My Fiji Trip & Bookings</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            Your Personal Fiji Itinerary
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Manage your confirmed reservations, e-tickets, saved places, day-by-day scheduler, and packing checklist.
          </p>

          {/* Tab switcher */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] whitespace-nowrap ${
                activeTab === 'bookings'
                  ? 'bg-teal-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>My Bookings</span>
              {bookings.length > 0 && (
                <span className="ml-1 bg-teal-900 text-teal-200 px-1.5 py-0.5 rounded-full text-[10px] tabular-nums font-bold">
                  {bookings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Places</span>
              <span className="ml-1 bg-black/20 px-1.5 py-0.5 rounded-full text-[10px] tabular-nums">
                {savedListings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] whitespace-nowrap ${
                activeTab === 'planner'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('packing')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] whitespace-nowrap ${
                activeTab === 'packing'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Luggage className="w-4 h-4" />
              <span>Packing List</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* ================= 1. CONFIRMED BOOKINGS & E-TICKETS ================= */}
        {activeTab === 'bookings' && (
          <div>
            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto my-8">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">
                  No confirmed bookings yet
                </h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  You can book resorts, diving tours, airport transfers, restaurant tables, and cultural village homestays directly through FIJI HAPS with instant digital e-tickets!
                </p>
                <button
                  onClick={onExplore}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Browse & Book Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-semibold">
                    You have <span className="font-bold text-slate-900">{bookings.length}</span> active reservation{bookings.length > 1 ? 's' : ''}
                  </div>
                  <button
                    onClick={onExplore}
                    className="text-xs font-bold text-teal-700 hover:underline"
                  >
                    + Book Another Experience
                  </button>
                </div>

                {/* Google Workspace Quick Sync Banner */}
                {onOpenGoogleWorkspace && (
                  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-teal-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900">
                          Sync Trip to Google Workspace
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          Export bookings to <strong>Google Calendar</strong>, create live budget sheets in <strong>Google Sheets</strong> & save travel docs in <strong>Drive</strong>.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onOpenGoogleWorkspace}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                      <span>Open Workspace Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookings.map(booking => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Status & Voucher Code */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirmed</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-medium">Voucher Ref</span>
                            <span className="font-mono font-bold text-xs text-slate-900">{booking.voucherCode}</span>
                          </div>
                        </div>

                        {/* Title and Category */}
                        <div className="flex items-center gap-1.5 text-xs text-teal-700 font-bold uppercase tracking-wider mb-1">
                          <span>{booking.subType}</span>
                          <span>·</span>
                          <span className="truncate">{booking.locationName}</span>
                        </div>
                        <h4 className="font-heading font-extrabold text-lg text-slate-900 line-clamp-1">
                          {booking.listingName}
                        </h4>

                        {/* Booking Meta Details */}
                        <div className="mt-3 bg-slate-50 rounded-2xl p-3 text-xs text-slate-700 space-y-1.5 border border-slate-200/60">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Option / Package:</span>
                            <span className="font-bold text-slate-900">{booking.optionSelected}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Dates:</span>
                            <span className="font-semibold text-slate-800">
                              {booking.startDate} {booking.endDate ? `to ${booking.endDate}` : `(${booking.timeSlot || 'Day'})`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Guests:</span>
                            <span className="font-semibold text-slate-800">{booking.guests.adults} Adults, {booking.guests.children} Children</span>
                          </div>
                          
                          {/* Clean Total for Customer */}
                          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-900">Total:</span>
                            <span className="font-extrabold text-teal-800 font-mono text-base">
                              FJD ${booking.totalPriceFjd.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => setSelectedTicketBooking(booking)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>View E-Ticket</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to cancel your reservation for ${booking.listingName}?`)) {
                              onCancelBooking(booking.id);
                            }
                          }}
                          className="text-xs text-slate-400 hover:text-red-600 font-medium transition-colors"
                        >
                          Cancel Reservation
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 2. SAVED LISTINGS ================= */}
        {activeTab === 'saved' && (
          <div>
            {savedListings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto my-8">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">
                  Your saved list is empty
                </h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Explore Fiji\'s resorts, Kokoda dining, cultural villages, and reef adventures, then tap the plus button to save them here.
                </p>
                <button
                  onClick={onExplore}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Explore Fiji Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500 font-semibold">
                    {savedListings.length} item{savedListings.length > 1 ? 's' : ''} saved to your trip
                  </div>
                  <button
                    onClick={onNavigateToMap}
                    className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View Saved on Map</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedListings.map(item => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span className="font-bold text-teal-700 uppercase tracking-wider text-[10px]">
                            {item.subType}
                          </span>
                          <button
                            onClick={() => onToggleSave(item.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 
                          onClick={() => onSelectItem(item)}
                          className="font-heading font-bold text-base text-slate-900 hover:text-teal-700 cursor-pointer line-clamp-1"
                        >
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{item.locationName}</span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-700">
                          {item.priceEstimate || item.priceLevel || 'Fiji'}
                        </span>
                        <button
                          onClick={() => onSelectItem(item)}
                          className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 3. DAY-BY-DAY PLANNER ================= */}
        {activeTab === 'planner' && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">
                Sample Multi-Day Fiji Experience
              </h3>
              <p className="text-xs text-slate-500">Curated sequence from arrival to island discovery.</p>
            </div>

            <div className="space-y-4">
              {days.map((day) => (
                <div key={day.dayNumber} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-amber-100 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                      Day {day.dayNumber}
                    </span>
                    <h4 className="font-heading font-bold text-base text-slate-900">
                      {day.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {day.notes}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                    {day.items.map(itemId => {
                      const found = ALL_LISTINGS.find(x => x.id === itemId);
                      if (!found) return null;
                      return (
                        <button
                          key={itemId}
                          onClick={() => onSelectItem(found)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 border border-slate-200 flex items-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          <span>{found.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 4. PACKING CHECKLIST ================= */}
        {activeTab === 'packing' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Luggage className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Tropical Fiji Packing Checklist
                </h3>
                <p className="text-xs text-slate-500">Custom tailored for Pacific sun, reef adventures, and village customs.</p>
              </div>
            </div>

            <div className="space-y-2">
              {packingItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => togglePacking(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    item.checked
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.checked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-xs font-medium ${item.checked ? 'line-through text-slate-400' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Digital E-Ticket Pop-Up Viewer */}
      {selectedTicketBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setSelectedTicketBooking(null)} />
          <div className="relative z-10 w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-400">
                OFFICIAL DIGITAL E-TICKET
              </span>
              <button
                onClick={() => setSelectedTicketBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <h3 className="font-heading font-extrabold text-xl text-white">
                {selectedTicketBooking.listingName}
              </h3>

              <div className="bg-slate-800/80 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Voucher Reference:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{selectedTicketBooking.voucherCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Passenger / Guest:</span>
                  <span className="font-bold text-white">{selectedTicketBooking.guestInfo.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Package:</span>
                  <span className="font-semibold text-slate-200">{selectedTicketBooking.optionSelected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Slot:</span>
                  <span className="font-semibold text-slate-200">
                    {selectedTicketBooking.startDate} {selectedTicketBooking.endDate ? `to ${selectedTicketBooking.endDate}` : `(${selectedTicketBooking.timeSlot})`}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-700">
                  <span className="font-bold text-slate-300">Total Price:</span>
                  <span className="font-mono font-extrabold text-white text-sm">
                    {selectedTicketBooking.totalPriceFjd === 0 ? 'Free Reservation' : `FJD $${selectedTicketBooking.totalPriceFjd.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-400 pt-0.5 text-xs font-semibold">
                  <span>Payment Status:</span>
                  <span>
                    {selectedTicketBooking.paymentMethod === 'pay_on_arrival' ? 'Pay upon Check-in in Fiji' : 'Paid & Guaranteed in Full'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px] pt-0.5">
                  <span>Reservation Status:</span>
                  <span className="text-teal-300 font-medium">Instant Confirmed & Guaranteed</span>
                </div>
              </div>

              {/* QR Code Presentation */}
              <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center text-slate-900 text-center">
                <QrCode className="w-24 h-24 text-slate-900" />
                <span className="text-[10px] text-slate-500 font-mono mt-1">Scan for check-in: {selectedTicketBooking.voucherCode}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTicketBooking(null)}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
