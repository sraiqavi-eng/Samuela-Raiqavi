/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MainTab, ListingItem, BookingRecord } from './types';
import { ALL_LISTINGS } from './data/fijiData';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { ExploreView } from './components/ExploreView';
import { InteractiveMap } from './components/InteractiveMap';
import { EventsView } from './components/EventsView';
import { VillageDirectoryView } from './components/VillageDirectoryView';
import { EssentialInfoView } from './components/EssentialInfoView';
import { ItineraryView } from './components/ItineraryView';
import { ItemDetailModal } from './components/ItemDetailModal';
import { BookingModal } from './components/BookingModal';
import { SearchModal } from './components/SearchModal';
import { CurrencyModal } from './components/CurrencyModal';
import { OwnerBackendModal } from './components/OwnerBackendModal';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { ShieldCheck, Landmark } from 'lucide-react';

const SAVED_STORAGE_KEY = 'fiji_haps_saved_items_v1';
const BOOKINGS_STORAGE_KEY = 'fiji_haps_bookings_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainTab>('explore');
  
  // Saved listings state
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['acc-1', 'food-1', 'vil-1'];
    } catch {
      return ['acc-1', 'food-1', 'vil-1'];
    }
  });

  // Tourist Bookings State
  const [bookings, setBookings] = useState<BookingRecord[]>(() => {
    try {
      const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      
      // Default sample confirmed booking for instant demonstration
      return [
        {
          id: 'BK-SAMPLE-01',
          listingId: 'acc-1',
          listingName: 'Likuliku Lagoon Resort',
          category: 'accommodation',
          subType: 'Resorts',
          locationName: 'Malolo Island, Mamanucas',
          image: '/src/assets/images/hero_fiji_islands_1790736422977.jpg',
          createdAt: new Date().toISOString(),
          status: 'confirmed',
          startDate: '2026-10-14',
          endDate: '2026-10-18',
          guests: { adults: 2, children: 0 },
          optionSelected: 'Over-Water Bure',
          totalPriceFjd: 7200,
          depositAmountFjd: 1800, // 25% received by FIJI HAPS app
          balanceDueFjd: 5400, // 75% due to resort on arrival
          commissionRate: 0.25,
          paymentMethod: 'deposit_online_balance_arrival',
          guestInfo: {
            fullName: 'Alexander Wright',
            email: 'alex.wright@traveler.com',
            phone: '+61 412 890 234',
            country: 'Australia',
            flightNumber: 'FJ 910',
            specialRequests: 'Honeymoon couple, sunset overwater bure requested.'
          },
          voucherCode: 'FJ-HAPS-92841'
        }
      ];
    } catch {
      return [];
    }
  });

  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [bookingModalItem, setBookingModalItem] = useState<ListingItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isOwnerPortalOpen, setIsOwnerPortalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  // Sync saved items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedIds));
    } catch (e) {
      console.error('Failed to save savedIds to localStorage', e);
    }
  }, [savedIds]);

  // Sync bookings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.error('Failed to save bookings to localStorage', e);
    }
  }, [bookings]);

  const handleToggleSave = (id: string) => {
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleNavigateToMapWithPin = (id: string) => {
    setCurrentTab('map');
  };

  const handleOpenBooking = (item: ListingItem) => {
    setBookingModalItem(item);
  };

  const handleBookingConfirmed = (newBooking: BookingRecord) => {
    setBookings(prev => [newBooking, ...prev]);
  };

  const handleCancelBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Top Application Bar */}
      <TopNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        savedCount={savedIds.length + bookings.length}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCurrency={() => setIsCurrencyOpen(true)}
        onOpenOwnerPortal={() => setIsOwnerPortalOpen(true)}
        onOpenGoogleWorkspace={() => setIsWorkspaceModalOpen(true)}
      />

      {/* Main Screen Content Switcher */}
      <main className="flex-1 w-full">
        {currentTab === 'explore' && (
          <ExploreView
            onSelectItem={setSelectedItem}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onNavigateToMap={() => setCurrentTab('map')}
            onBookItem={handleOpenBooking}
          />
        )}

        {currentTab === 'map' && (
          <InteractiveMap
            onSelectItem={setSelectedItem}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onBookItem={handleOpenBooking}
          />
        )}

        {currentTab === 'events' && (
          <EventsView
            onSelectItem={setSelectedItem}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onBookItem={handleOpenBooking}
          />
        )}

        {currentTab === 'villages' && (
          <VillageDirectoryView
            onSelectItem={setSelectedItem}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onNavigateToMap={() => setCurrentTab('map')}
            onBookItem={handleOpenBooking}
          />
        )}

        {currentTab === 'essentials' && (
          <EssentialInfoView />
        )}

        {currentTab === 'itinerary' && (
          <ItineraryView
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectItem={setSelectedItem}
            onExplore={() => setCurrentTab('explore')}
            onNavigateToMap={() => setCurrentTab('map')}
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onOpenGoogleWorkspace={() => setIsWorkspaceModalOpen(true)}
          />
        )}
      </main>

      {/* Fixed Mobile Bottom Navigation Bar (Thumb Zone) */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        savedCount={savedIds.length + bookings.length}
      />

      {/* Item Detail Modal / Drawer */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isSaved={selectedItem ? savedIds.includes(selectedItem.id) : false}
        onToggleSave={handleToggleSave}
        onNavigateToMapWithPin={handleNavigateToMapWithPin}
        onBookItem={handleOpenBooking}
      />

      {/* In-App Direct Booking Engine Modal */}
      <BookingModal
        item={bookingModalItem}
        isOpen={Boolean(bookingModalItem)}
        onClose={() => setBookingModalItem(null)}
        onBookingConfirmed={handleBookingConfirmed}
        onOpenGoogleWorkspace={() => setIsWorkspaceModalOpen(true)}
      />

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectItem={setSelectedItem}
      />

      {/* Quick Currency Modal */}
      <CurrencyModal
        isOpen={isCurrencyOpen}
        onClose={() => setIsCurrencyOpen(false)}
      />

      {/* Owner & Bank Payout Backend Modal */}
      <OwnerBackendModal
        isOpen={isOwnerPortalOpen}
        onClose={() => setIsOwnerPortalOpen(false)}
      />

      {/* Google Workspace Hub Modal (Drive, Sheets, Calendar, Contacts) */}
      <GoogleWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        bookings={bookings}
      />

      {/* Discrete Footer with Operator & Bank Settlement Portal Access */}
      <footer className="mt-auto py-6 px-4 bg-slate-900 text-slate-400 text-xs border-t border-slate-800 text-center pb-24 sm:pb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-white text-sm">FIJI HAPS</span>
            <span>· Everything Fiji. All in One Place.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsWorkspaceModalOpen(true)}
              className="text-slate-400 hover:text-blue-400 flex items-center gap-1.5 transition-colors font-semibold"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Google Workspace Hub</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsOwnerPortalOpen(true)}
              className="text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors font-semibold"
            >
              <Landmark className="w-3.5 h-3.5 text-emerald-500" />
              <span>Owner & Bank Payout Portal</span>
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">© 2026 Fiji Tourism Platform</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
