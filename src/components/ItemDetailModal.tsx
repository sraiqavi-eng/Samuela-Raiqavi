import React, { useState } from 'react';
import { ListingItem } from '../types';
import { 
  X, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  Check, 
  Plus, 
  Clock, 
  Sparkles, 
  Share2, 
  ShieldCheck,
  Send
} from 'lucide-react';
import { HERO_IMAGE, DINING_IMAGE, CULTURE_IMAGE, REEF_IMAGE, VILLAGE_IMAGE } from '../data/fijiData';

interface ItemDetailModalProps {
  item: ListingItem | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onNavigateToMapWithPin: (id: string) => void;
  onBookItem: (item: ListingItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  isSaved,
  onToggleSave,
  onNavigateToMapWithPin,
  onBookItem
}) => {
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  if (!item) return null;

  // Determine fallback image based on category
  let modalImage = item.image;
  if (!modalImage) {
    if (item.category === 'food') modalImage = DINING_IMAGE;
    else if (item.category === 'activities') modalImage = REEF_IMAGE;
    else if (item.category === 'village') modalImage = VILLAGE_IMAGE;
    else if (item.category === 'attractions') modalImage = CULTURE_IMAGE;
    else modalImage = HERO_IMAGE;
  }

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setShowInquiryForm(false);
      setInquirySent(false);
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Image Banner */}
        <div className="relative aspect-[16/9] w-full bg-slate-900 shrink-0 overflow-hidden">
          <img
            src={modalImage}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          
          {/* Top Bar Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-md">
              {item.subType}
            </span>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition-colors shadow-lg"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Title Bar Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-1.5 text-xs text-teal-300 font-semibold mb-1 drop-shadow">
              <MapPin className="w-3.5 h-3.5" />
              <span>{item.locationName}</span>
              <span>·</span>
              <span className="capitalize">{item.islandRegion.replace(/-/g, ' ')}</span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white drop-shadow">
              {item.name}
            </h2>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Price, Rating, and Quick Action Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              {item.priceEstimate && (
                <div className="text-sm font-extrabold text-emerald-700">
                  {item.priceEstimate}
                </div>
              )}
              {item.rating && (
                <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-900">{item.rating.toFixed(1)}</span>
                  {item.reviewsCount && (
                    <span className="text-slate-400 font-normal">({item.reviewsCount} visitor reviews)</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onBookItem(item);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-teal-600 hover:bg-teal-500 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Direct Here</span>
              </button>

              <button
                onClick={() => onToggleSave(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSaved
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4" />}
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigateToMapWithPin(item.id);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-heading font-bold text-sm text-slate-900 mb-1.5">Overview</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Specific Accommodation Amenities */}
          {'amenities' in item && item.amenities && (
            <div>
              <h4 className="font-heading font-bold text-sm text-slate-900 mb-2">Amenities & Services</h4>
              <div className="flex flex-wrap gap-1.5">
                {item.amenities.map((amenity, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specific Food Signature Dishes */}
          {'signatureDishes' in item && item.signatureDishes && (
            <div>
              <h4 className="font-heading font-bold text-sm text-slate-900 mb-2">Signature Dishes & Cocktails</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {item.signatureDishes.map((dish, i) => (
                  <div key={i} className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 text-amber-900 font-medium flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{dish}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transport Details (Schedule, Fares) */}
          {'schedule' in item && item.schedule && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Schedule & Timetable</span>
              </div>
              <p>{item.schedule}</p>
              {item.bookingTip && (
                <p className="text-slate-500 italic mt-1">Tip: {item.bookingTip}</p>
              )}
            </div>
          )}

          {/* Event Venue & Dates */}
          {'venue' in item && item.venue && (
            <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200 space-y-1 text-xs text-rose-950">
              <div className="font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>{item.dateDisplay}</span>
              </div>
              <p>Venue: {item.venue}</p>
              <p className="font-semibold text-rose-700">Admission: {item.admission}</p>
            </div>
          )}

          {/* Contact Details */}
          {item.contact && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-700">
              <h4 className="font-heading font-bold text-sm text-slate-900 mb-2">Direct Contact & Location</h4>
              
              {item.contact.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phone:</span>
                  </span>
                  <a href={`tel:${item.contact.phone}`} className="font-bold text-teal-700 hover:underline">
                    {item.contact.phone}
                  </a>
                </div>
              )}

              {item.contact.email && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email:</span>
                  </span>
                  <a href={`mailto:${item.contact.email}`} className="font-bold text-teal-700 hover:underline">
                    {item.contact.email}
                  </a>
                </div>
              )}

              {item.contact.address && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Address:</span>
                  </span>
                  <span className="font-medium text-slate-800 text-right">{item.contact.address}</span>
                </div>
              )}
            </div>
          )}

          {/* Direct Booking CTA Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 block">
                Instant Confirmation
              </span>
              <h5 className="font-heading font-bold text-sm text-white">
                Book This {item.category === 'accommodation' ? 'Stay' : item.category === 'food' ? 'Table' : 'Experience'} Directly
              </h5>
              <p className="text-[11px] text-teal-100/80">
                Official e-Ticket issued instantly · Pay online or on arrival in Fiji.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onBookItem(item);
              }}
              className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-transform active:scale-95 shrink-0"
            >
              Book Now
            </button>
          </div>

          {/* Inquiry Simulation Box */}
          <div className="pt-1">
            {!showInquiryForm ? (
              <button
                onClick={() => setShowInquiryForm(true)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Direct Inquiry / Reservation Request</span>
              </button>
            ) : (
              <form onSubmit={handleSendInquiry} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900">
                    Direct Inquiry for {item.name}
                  </h5>
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>

                {inquirySent ? (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Vinaka vakalevu! Your inquiry has been dispatched to {item.name}.</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                    />
                    <textarea
                      required
                      rows={2}
                      placeholder="Dates, group size, or questions (e.g. transfers, dietary requirements, kava protocol)..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Dispatch Inquiry (Bula!)
                    </button>
                  </>
                )}
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
