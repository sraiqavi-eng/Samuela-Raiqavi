import React, { useState, useMemo } from 'react';
import { ListingItem, BookingRecord } from '../types';
import { 
  X, 
  Calendar, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  ArrowRight,
  ArrowLeft,
  QrCode
} from 'lucide-react';

interface BookingModalProps {
  item: ListingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (booking: BookingRecord) => void;
  onOpenGoogleWorkspace?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  item,
  isOpen,
  onClose,
  onBookingConfirmed,
  onOpenGoogleWorkspace
}) => {
  // Booking Steps: 1 = Details/Dates, 2 = Guest Info, 3 = Payment Choice, 4 = Confirmation/E-Ticket
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('09:00 AM');
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');

  // Guest Details
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [country, setCountry] = useState<string>('Australia');
  const [flightNumber, setFlightNumber] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Customer Payment Mode: Clean and customer-friendly
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pay_on_arrival'>('credit_card');
  const [cardNumber, setCardNumber] = useState<string>('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('888');

  // Confirmed booking record
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  // Options configuration based on item category
  const availableOptions = useMemo(() => {
    if (!item) return [];
    if (item.category === 'accommodation') {
      if ('roomTypes' in item && item.roomTypes?.length) {
        return item.roomTypes.map((room, idx) => ({
          name: room,
          pricePerUnit: idx === 0 ? 450 : idx === 1 ? 650 : 950,
          description: idx === 0 ? 'Garden view, king bed, private verandah' : idx === 1 ? 'Beachfront, direct ocean access' : 'Overwater lagoon bure with glass floor view'
        }));
      }
      return [
        { name: 'Standard Island Room', pricePerUnit: 220, description: 'Comfortable air-conditioned room with ensuite' },
        { name: 'Beachfront Thatched Bure', pricePerUnit: 480, description: 'Authentic Fijian bure directly facing the lagoon' }
      ];
    }

    if (item.category === 'activities') {
      return [
        { name: 'Standard Tour / Dive Session', pricePerUnit: 180, description: 'Complete session with professional certified guide' },
        { name: 'Premium VIP Small Group Charter', pricePerUnit: 290, description: 'Includes gourmet tropical lunch & priority access' }
      ];
    }

    if (item.category === 'transport') {
      return [
        { name: 'Express Shared Coach Shuttle', pricePerUnit: 45, description: 'Air-conditioned coach with luggage allowance' },
        { name: 'Private Dedicated Chauffeur Van', pricePerUnit: 160, description: 'Door-to-door private transfer with shell lei greeting' }
      ];
    }

    if (item.category === 'food') {
      return [
        { name: 'Standard Table Reservation', pricePerUnit: 40, description: 'Guaranteed prime table reservation hold (credited towards food bill)' },
        { name: 'Sunset Romantic Beachfront Table', pricePerUnit: 80, description: 'Includes welcome coconut cocktail and floral arrangement' }
      ];
    }

    if (item.category === 'village') {
      return [
        { name: 'Day Cultural Visit & Sevusevu Ceremony', pricePerUnit: 65, description: 'Includes village entrance fee & school contribution' },
        { name: 'Overnight Traditional Bure Homestay', pricePerUnit: 130, description: 'Includes all 3 meals, host family immersion & evening kava talanoa' }
      ];
    }

    // Events / Festivals
    return [
      { name: 'General Admission Pass', pricePerUnit: 35, description: 'Full festival and event grounds access' },
      { name: 'VIP Grandstand / Front Stage Pass', pricePerUnit: 90, description: 'Reserved priority seating and souvenir programme' }
    ];
  }, [item]);

  // Set default option when item changes
  React.useEffect(() => {
    if (availableOptions.length > 0 && !selectedOption) {
      setSelectedOption(availableOptions[0].name);
    }
  }, [availableOptions, selectedOption]);

  // Calculate nights for accommodation
  const nights = useMemo(() => {
    if (!item || item.category !== 'accommodation') return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [startDate, endDate, item?.category]);

  // Calculate pricing
  const currentOptionObj = availableOptions.find(o => o.name === selectedOption) || availableOptions[0] || { pricePerUnit: 100 };
  const basePrice = currentOptionObj.pricePerUnit;
  
  const totalPriceFjd = useMemo(() => {
    if (!item) return 0;
    if (item.category === 'accommodation') {
      return basePrice * nights;
    }
    if (item.category === 'food') {
      return basePrice;
    }
    // Per person for activities, transport, villages, events
    const guestCount = adults + (children * 0.5);
    return Math.round(basePrice * guestCount);
  }, [item?.category, basePrice, nights, adults, children]);

  // Backend receives 25% invisibly
  const depositAmountFjd = Math.round(totalPriceFjd * 0.25);
  const balanceDueFjd = totalPriceFjd - depositAmountFjd;

  if (!isOpen || !item) return null;

  // Generate Booking and post to backend
  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    const voucherRef = `FJ-HAPS-${Math.floor(10000 + Math.random() * 90000)}`;
    const providerEmail = item.contact?.email || `reservations@${item.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.fj`;
    const providerPhone = item.contact?.phone || '+679 672 2000';

    const newBooking: BookingRecord = {
      id: `BK-${Date.now()}`,
      listingId: item.id,
      listingName: item.name,
      category: item.category,
      subType: item.subType,
      locationName: item.locationName,
      image: item.image,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      startDate,
      endDate: item.category === 'accommodation' ? endDate : undefined,
      timeSlot: item.category !== 'accommodation' ? timeSlot : undefined,
      guests: { adults, children },
      optionSelected: selectedOption || 'Standard',
      totalPriceFjd,
      depositAmountFjd, // stored in backend record for bank transfer
      balanceDueFjd,
      commissionRate: 0.25,
      paymentMethod,
      providerEmail,
      providerPhone,
      guestInfo: {
        fullName: fullName || 'Tourist Guest',
        email: email || 'tourist@fijihaps.com',
        phone: phone || '+679 900 1234',
        country,
        flightNumber,
        specialRequests
      },
      voucherCode: voucherRef
    };

    try {
      // Send to Express backend API to route 25% directly to owner's bank account
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });
    } catch (err) {
      console.log('Processed booking locally:', err);
    }

    setIsSubmitting(false);
    setConfirmedBooking(newBooking);
    onBookingConfirmed(newBooking);
    setStep(4);
  };

  const handleClose = () => {
    setStep(1);
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-400 uppercase tracking-wider">
                <span>Book Direct Through FIJI HAPS</span>
                <span>·</span>
                <span className="text-slate-300 capitalize">{item.category}</span>
              </div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-white truncate max-w-xs sm:max-w-sm">
                {item.name}
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {step < 4 && (
          <div className="bg-slate-100 px-5 py-2.5 flex items-center justify-between text-xs font-semibold border-b border-slate-200">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-teal-700 font-bold' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-300'}`}>1</span>
              <span>Selection</span>
            </div>
            <div className="w-6 h-0.5 bg-slate-300" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-teal-700 font-bold' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-300'}`}>2</span>
              <span>Guest Details</span>
            </div>
            <div className="w-6 h-0.5 bg-slate-300" />
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-teal-700 font-bold' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-teal-600 text-white' : 'bg-slate-300'}`}>3</span>
              <span>Payment</span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* ================= STEP 1: DATES, TIMES, GUESTS & OPTIONS ================= */}
          {step === 1 && (
            <div className="space-y-4">
              
              {/* Option / Room / Package Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Select {item.category === 'accommodation' ? 'Bure or Room Type' : item.category === 'food' ? 'Dining Option' : 'Tour Package / Ticket Tier'}
                </label>
                <div className="space-y-2">
                  {availableOptions.map((opt) => {
                    const isChosen = selectedOption === opt.name;
                    return (
                      <div
                        key={opt.name}
                        onClick={() => setSelectedOption(opt.name)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isChosen
                            ? 'bg-teal-50/70 border-teal-500 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                            <span>{opt.name}</span>
                            {isChosen && <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full">Selected</span>}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-tight">{opt.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-heading font-extrabold text-sm sm:text-base text-teal-800 tabular-nums">
                            FJD ${opt.pricePerUnit}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {item.category === 'accommodation' ? '/ night' : item.category === 'food' ? '' : '/ person'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {item.category === 'accommodation' ? 'Check-in Date' : 'Travel / Activity Date'}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                {item.category === 'accommodation' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Check-out Date ({nights} Night{nights > 1 ? 's' : ''})
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Time Slot
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                    >
                      {item.category === 'food' ? (
                        <>
                          <option value="12:00 PM">12:00 PM (Lunch)</option>
                          <option value="01:00 PM">01:00 PM (Lunch)</option>
                          <option value="06:00 PM">06:00 PM (Sunset Dinner)</option>
                          <option value="07:00 PM">07:00 PM (Dinner)</option>
                          <option value="08:00 PM">08:00 PM (Dinner)</option>
                        </>
                      ) : (
                        <>
                          <option value="08:30 AM">08:30 AM (Morning Departure)</option>
                          <option value="10:00 AM">10:00 AM (Mid-Morning)</option>
                          <option value="01:30 PM">01:30 PM (Afternoon)</option>
                          <option value="03:30 PM">03:30 PM (Sunset Session)</option>
                        </>
                      )}
                    </select>
                  </div>
                )}
              </div>

              {/* Guest Counts */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adults (12+)
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-xl border border-slate-300 px-3 py-1.5 justify-between">
                    <button
                      type="button"
                      onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-sm text-slate-900 tabular-nums">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(prev => prev + 1)}
                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Children (0-11)
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-xl border border-slate-300 px-3 py-1.5 justify-between">
                    <button
                      type="button"
                      onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-sm text-slate-900 tabular-nums">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren(prev => prev + 1)}
                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Clean Customer Total Display */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-800">Total Price:</span>
                  <div className="font-heading font-extrabold text-2xl text-emerald-950 font-mono">
                    FJD ${totalPriceFjd.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-700">
                    Includes all Fiji Tourism VAT & taxes · Best rate guaranteed
                  </span>
                </div>
                <div className="text-right text-xs font-semibold text-emerald-800">
                  {item.category === 'accommodation' ? `${nights} Night Stay` : `${adults + children} Guest(s)`}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Continue to Guest Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

          {/* ================= STEP 2: GUEST DETAILS ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 mb-1">
                  Lead Guest Information
                </h4>
                <p className="text-xs text-slate-500">
                  Your official digital voucher and confirmation will be dispatched to this email.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (as per Passport) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="sarah.jenkins@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+61 400 123 456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Country of Residence
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-50 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 text-slate-900"
                    >
                      <option value="Australia">Australia</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Fiji Local">Fiji (Local Resident)</option>
                      <option value="Germany">Germany</option>
                      <option value="Japan">Japan</option>
                      <option value="Other">Other Country</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Inbound Flight Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FJ 910 or QF 101"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      className="w-full bg-slate-50 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Requests / Dietary / Pickup Details
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Dietary requirements, late check-in, ground floor room..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-slate-50 text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 text-slate-900 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!fullName.trim()) setFullName('Bula Tourist');
                    if (!email.trim()) setEmail('traveler@fijihaps.com');
                    if (!phone.trim()) setPhone('+679 999 8888');
                    setStep(3);
                  }}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ================= STEP 3: CLEAN PAYMENT MODE ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 mb-1">
                  Payment Method
                </h4>
                <p className="text-xs text-slate-500">
                  Select your preferred payment option.
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2.5">
                
                {/* 1. Pay Online Now */}
                <div
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'credit_card'
                      ? 'bg-teal-50/80 border-teal-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                    paymentMethod === 'credit_card' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'credit_card' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-sm text-slate-900">
                        Pay Securely Online Now
                      </span>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                        Instant E-Ticket
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Instant digital confirmation. Visa, MasterCard, and American Express accepted with 256-bit SSL encryption.
                    </p>
                  </div>
                </div>

                {/* 2. Pay on Arrival */}
                <div
                  onClick={() => setPaymentMethod('pay_on_arrival')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'pay_on_arrival'
                      ? 'bg-teal-50/80 border-teal-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                    paymentMethod === 'pay_on_arrival' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'pay_on_arrival' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="font-heading font-bold text-sm text-slate-900 block">
                      Pay on Arrival in Fiji
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Guarantee your booking with zero upfront payment today. Settle upon arrival at the resort lobby, boat desk, or tour counter in cash or card.
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Free cancellation up to 48 hours prior
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Input */}
              {paymentMethod === 'credit_card' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold text-slate-700">Card Payment Details</span>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>256-bit Encrypted SSL</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Clean Order Summary Recap */}
              <div className="bg-slate-100 p-4 rounded-2xl space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span className="font-bold text-slate-900">{item.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Option:</span>
                  <span className="font-semibold text-slate-800">{selectedOption}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span className="font-semibold text-slate-800">
                    {startDate} {item.category === 'accommodation' ? `to ${endDate}` : `(${timeSlot})`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span className="font-semibold text-slate-800">{adults} Adults, {children} Children</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-900">Total Price:</span>
                  <span className="font-heading font-extrabold text-teal-800 text-base font-mono">
                    FJD ${totalPriceFjd.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Processing...' : `Confirm & Book (FJD $${totalPriceFjd.toLocaleString()})`}</span>
                </button>
              </div>

            </div>
          )}

          {/* ================= STEP 4: CLEAN DIGITAL E-TICKET ================= */}
          {step === 4 && confirmedBooking && (
            <div className="space-y-5 text-center animate-in zoom-in-95 duration-300">
              
              {/* Green Success Badge */}
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Booking Confirmed · Vinaka Vakalevu!
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-slate-900 mt-2">
                  Your Fiji Reservation is Guaranteed
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  A digital voucher and receipt have been dispatched to <strong>{confirmedBooking.guestInfo.email}</strong>.
                </p>
                <div className="mt-2.5 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl text-xs text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>Confirmation emails dispatched to <strong>website backend</strong> & <strong>{confirmedBooking.listingName}</strong> provider!</span>
                </div>
              </div>

              {/* Digital E-Ticket Boarding Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 text-left shadow-xl border border-slate-800 relative overflow-hidden">
                
                {/* Decorative cutouts on sides */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white" />

                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest">FIJI HAPS OFFICIAL E-TICKET</span>
                    <h4 className="font-heading font-extrabold text-lg text-white truncate">{confirmedBooking.listingName}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Voucher Code</span>
                    <span className="font-mono font-bold text-amber-400 text-xs tracking-wider">{confirmedBooking.voucherCode}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs py-2">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Lead Guest</span>
                    <span className="font-bold text-white">{confirmedBooking.guestInfo.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Location</span>
                    <span className="font-semibold text-slate-200 truncate block">{confirmedBooking.locationName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Dates & Times</span>
                    <span className="font-semibold text-slate-200">
                      {confirmedBooking.startDate} {confirmedBooking.endDate ? `to ${confirmedBooking.endDate}` : `(${confirmedBooking.timeSlot})`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Total Amount</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      FJD ${confirmedBooking.totalPriceFjd.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* QR Code Barcode Representation */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white p-1 rounded-lg flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-slate-950" />
                    </div>
                    <span className="text-[10px] text-slate-400">Scan at check-in: {confirmedBooking.voucherCode}</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-1 rounded-md">
                    {confirmedBooking.paymentMethod === 'pay_on_arrival' ? 'Pay on Arrival' : 'Paid in Full'}
                  </span>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(`Fiji Haps Booking: ${confirmedBooking.voucherCode} at ${confirmedBooking.listingName} on ${confirmedBooking.startDate}. Total: FJD $${confirmedBooking.totalPriceFjd}`);
                      alert(`Voucher details copied! Voucher Code: ${confirmedBooking.voucherCode}`);
                    }
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save / Copy Voucher</span>
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-colors shadow-md"
                >
                  View in My Trip Bookings
                </button>
              </div>

              {onOpenGoogleWorkspace && (
                <button
                  onClick={() => {
                    handleClose();
                    onOpenGoogleWorkspace();
                  }}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Sync Booking to Google Calendar & Drive Vault</span>
                </button>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
