import React, { useState, useEffect } from 'react';
import { FIJIAN_PHRASES } from '../data/fijiData';
import { PhraseItem } from '../types';
import { 
  Coins, 
  Sun, 
  Languages, 
  Clock, 
  Wifi, 
  Car, 
  CreditCard, 
  HeartPulse, 
  ShieldAlert, 
  BookMarked, 
  PhoneCall, 
  Volume2, 
  ArrowRightLeft, 
  Search,
  Check,
  AlertTriangle
} from 'lucide-react';

export const EssentialInfoView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('currency');
  
  // Currency Calculator State
  const [fjdAmount, setFjdAmount] = useState<number>(100);
  const [targetCurrency, setTargetCurrency] = useState<string>('USD');

  // Currency Exchange Rates (approximate benchmark)
  const exchangeRates: Record<string, { rate: number; symbol: string; name: string }> = {
    USD: { rate: 0.44, symbol: '$', name: 'US Dollar' },
    AUD: { rate: 0.68, symbol: 'A$', name: 'Australian Dollar' },
    NZD: { rate: 0.74, symbol: 'NZ$', name: 'New Zealand Dollar' },
    EUR: { rate: 0.41, symbol: '€', name: 'Euro' },
    GBP: { rate: 0.35, symbol: '£', name: 'British Pound' },
    CAD: { rate: 0.61, symbol: 'C$', name: 'Canadian Dollar' },
    JPY: { rate: 68.5, symbol: '¥', name: 'Japanese Yen' },
  };

  // Fijian Phrasebook State
  const [phraseSearch, setPhraseSearch] = useState('');
  const [activePhraseCategory, setActivePhraseCategory] = useState<string>('all');
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);

  // Fiji Live Clock State
  const [fijiTime, setFijiTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      // Fiji is GMT+12 (UTC+12)
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Pacific/Fiji',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      };
      setFijiTime(new Intl.DateTimeFormat('en-US', options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Speech API for Pronunciation
  const playAudio = (text: string) => {
    setPlayingPhrase(text);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.onend = () => setPlayingPhrase(null);
      utterance.onerror = () => setPlayingPhrase(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingPhrase(null), 1200);
    }
  };

  const sections = [
    { id: 'currency', label: 'Currency', icon: Coins },
    { id: 'weather', label: 'Weather', icon: Sun },
    { id: 'language', label: 'Language & Phrases', icon: Languages },
    { id: 'time', label: 'Fiji Time', icon: Clock },
    { id: 'internet', label: 'Internet & SIM', icon: Wifi },
    { id: 'driving', label: 'Driving', icon: Car },
    { id: 'banking', label: 'Banking', icon: CreditCard },
    { id: 'health', label: 'Health', icon: HeartPulse },
    { id: 'safety', label: 'Safety', icon: ShieldAlert },
    { id: 'etiquette', label: 'Etiquette', icon: BookMarked },
    { id: 'emergency', label: 'Emergency Services', icon: PhoneCall },
  ];

  const filteredPhrases = FIJIAN_PHRASES.filter(p => {
    if (activePhraseCategory !== 'all' && p.category !== activePhraseCategory) return false;
    if (phraseSearch.trim()) {
      const q = phraseSearch.toLowerCase();
      return p.fijian.toLowerCase().includes(q) ||
        p.english.toLowerCase().includes(q) ||
        p.phonetic.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      
      {/* Top Banner */}
      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <BookMarked className="w-4 h-4" />
            <span>Essential Fiji Traveller Guide</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            Practical Visitor Information
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Everything you need for a smooth, stress-free stay: live currency calculator, authentic audio phrasebook, driving rules, health advice, and emergency hotlines.
          </p>

          {/* Quick Horizontal Topic Bar */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {sections.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* ================= 1. CURRENCY CONVERTER ================= */}
        {activeSection === 'currency' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Fijian Dollar (FJD) Converter
                </h3>
                <p className="text-xs text-slate-500">Official currency of Fiji. 1 FJD = 100 Cents.</p>
              </div>
            </div>

            {/* Converter Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* FJD Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount in Fijian Dollars (FJD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-sm">FJD $</span>
                    <input
                      type="number"
                      value={fjdAmount || ''}
                      onChange={(e) => setFjdAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-white pl-16 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-base focus:outline-none focus:border-teal-500 tabular-nums"
                    />
                  </div>
                </div>

                {/* Target Currency Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Converted Currency
                  </label>
                  <select
                    value={targetCurrency}
                    onChange={(e) => setTargetCurrency(e.target.value)}
                    className="w-full bg-white px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 text-sm focus:outline-none focus:border-teal-500"
                  >
                    {Object.entries(exchangeRates).map(([code, info]) => (
                      <option key={code} value={code}>
                        {code} - {info.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conversion Output Result */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-emerald-800">Equivalent Value:</span>
                  <div className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-900 tabular-nums">
                    {exchangeRates[targetCurrency].symbol}
                    {(fjdAmount * exchangeRates[targetCurrency].rate).toFixed(2)}{' '}
                    <span className="text-sm font-semibold text-emerald-700">{targetCurrency}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-emerald-700">
                  <span>Indicative Rate</span>
                  <div className="font-mono text-[11px] text-emerald-800 mt-0.5">
                    1 FJD ≈ {exchangeRates[targetCurrency].rate} {targetCurrency}
                  </div>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-500 font-semibold">Quick Amounts:</span>
                {[20, 50, 100, 250, 500].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setFjdAmount(amt)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-700 transition-colors"
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Cash Guidelines */}
            <div className="mt-6 space-y-2 text-xs text-slate-600">
              <h4 className="font-heading font-bold text-sm text-slate-900">Money Advice in Fiji</h4>
              <p>• <strong>Resorts & Hotels:</strong> Major credit cards (Visa, Mastercard, Amex) are accepted everywhere with a standard 2.5% - 3.5% bank surcharge.</p>
              <p>• <strong>Villages & Markets:</strong> Cash is essential. Carry small notes ($5, $10, $20) for local produce markets, roadside fresh fruit stalls, and village donations.</p>
              <p>• <strong>Tipping:</strong> Tipping is not customary in Fijian culture, though appreciated for extraordinary hospitality. Most resorts operate a collective "Staff Christmas Fund" box.</p>
            </div>
          </div>
        )}

        {/* ================= 2. WEATHER & SEASONS ================= */}
        {activeSection === 'weather' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Fiji Weather & Tropical Climate
                </h3>
                <p className="text-xs text-slate-500">Year-round warm South Pacific sunshine with gentle trade winds.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-heading font-bold text-base text-emerald-900">
                    The Dry Season (May – October)
                  </h4>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">Peak Travel</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Known locally as the "Fijian Winter". Sunny blue skies, minimal rainfall, low humidity, and pleasant daytime temperatures (25°C to 28°C / 77°F to 82°F). Perfect for snorkeling, scuba diving, and hiking.
                </p>
              </div>

              <div className="bg-sky-50/60 p-5 rounded-2xl border border-sky-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-heading font-bold text-base text-sky-900">
                    The Wet Season (November – April)
                  </h4>
                  <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">Warm & Lush</span>
                </div>
                <p className="text-xs text-sky-800 leading-relaxed">
                  Warmer temperatures (30°C to 32°C / 86°F to 90°F) with tropical afternoon showers that clear quickly. Lush green rainforests, roaring waterfalls, warmer ocean waters, and fewer crowds.
                </p>
              </div>
            </div>

            {/* Regional Climate Nuances */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <h4 className="font-heading font-bold text-sm text-slate-900">Regional Weather Tips</h4>
              <p>• <strong>Western Viti Levu (Nadi, Denarau, Mamanuca & Yasawa Islands):</strong> Sits in the rain shadow of the central mountain divide and receives over 250 days of pure sunshine annually.</p>
              <p>• <strong>Eastern Viti Levu (Suva & Pacific Harbour):</strong> Experiences higher rainfall creating the famous lush rainforest canopy of Colo-i-Suva and thriving river gorges.</p>
            </div>
          </div>
        )}

        {/* ================= 3. LANGUAGE & PHRASEBOOK ================= */}
        {activeSection === 'language' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-slate-900">
                    Fijian Phrasebook & Audio Pronunciation
                  </h3>
                  <p className="text-xs text-slate-500">Tap the speaker icon to hear pronunciation aloud.</p>
                </div>
              </div>

              {/* Phrase Search */}
              <div className="relative min-w-[200px]">
                <input
                  type="text"
                  value={phraseSearch}
                  onChange={(e) => setPhraseSearch(e.target.value)}
                  placeholder="Search phrases..."
                  className="bg-slate-50 text-slate-900 text-xs px-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 w-full"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {['all', 'Greetings', 'Respect & Etiquette', 'Dining & Village', 'Getting Around', 'Fiji Hindi'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActivePhraseCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    activePhraseCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Phrases' : cat}
                </button>
              ))}
            </div>

            {/* Pronunciation Key Tip */}
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900">
              <span className="font-bold">Fijian Alphabet Sound Secrets:</span> "c" sounds like "th" (Moce = Moh-they) · "d" has a gentle "n" before it (Nadi = Nahn-dee) · "b" has an "m" sound (Bula = Mboo-lah) · "g" sounds like "ng" in song (Sega = Seh-ngah).
            </div>

            {/* Phrases List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredPhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-extrabold text-base text-slate-900 group-hover:text-teal-700 transition-colors">
                        {phrase.fijian}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-teal-700 mt-0.5">
                      {phrase.english}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-1">
                      🗣 {phrase.phonetic}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 italic">
                      {phrase.context}
                    </div>
                  </div>

                  {/* Audio Speaker Button */}
                  <button
                    onClick={() => playAudio(phrase.fijian)}
                    className={`p-2 rounded-xl transition-colors shrink-0 ${
                      playingPhrase === phrase.fijian
                        ? 'bg-teal-600 text-white scale-110 animate-pulse'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-teal-50 hover:text-teal-700'
                    }`}
                    title="Play Pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 4. TIME & CLOCK ================= */}
        {activeSection === 'time' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">
                Fiji Standard Time (FJT) · UTC+12
              </span>
              <div className="font-heading font-extrabold text-3xl sm:text-5xl text-slate-900 mt-2 font-mono tracking-tight tabular-nums">
                {fijiTime || 'Loading...'}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Fiji is one of the very first nations on Earth to welcome each new calendar day. Located on the 180° meridian, you can stand with one foot in "yesterday" and one foot in "today" on Taveuni Island!
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              <strong>Fiji Time Concept:</strong> Fiji is famous for relaxed, leisurely pacing. If someone says "Fiji Time", it means slow down, breathe, and enjoy the tropical paradise without rushing!
            </div>
          </div>
        )}

        {/* ================= 5. INTERNET & SIM ================= */}
        {activeSection === 'internet' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Internet & Tourist SIM Cards
                </h3>
                <p className="text-xs text-slate-500">Stay connected across Fiji's islands.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-heading font-bold text-sm text-slate-900 mb-1">Vodafone Fiji</h4>
                <p className="text-xs text-slate-600">Widest coverage across Viti Levu, Vanua Levu, Mamanuca, and outer island chains. Official booth located immediately outside Nadi Airport baggage reclaim.</p>
                <span className="inline-block mt-2 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">eSIM & Physical SIM available</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-heading font-bold text-sm text-slate-900 mb-1">Digicel Fiji</h4>
                <p className="text-xs text-slate-600">High-speed 4G data plans with affordable tourist bundles. Counter situated in both Nadi and Nausori arrival lounges.</p>
                <span className="inline-block mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Affordable tourist data packages</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <h4 className="font-heading font-bold text-sm text-slate-900">Quick Tips for Connectivity</h4>
              <p>• Bring your passport: Fiji telecommunications law requires passport registration for all SIM activation.</p>
              <p>• Most island resorts offer Starlink satellite Wi-Fi in common lobby areas and bures.</p>
            </div>
          </div>
        )}

        {/* ================= 6. DRIVING IN FIJI ================= */}
        {activeSection === 'driving' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Driving Rules & Road Safety
                </h3>
                <p className="text-xs text-slate-500">Self-drive advice for exploring Viti Levu and Vanua Levu.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>Drive on the Left:</strong> Fiji drives on the left-hand side of the road, with driver controls on the right.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>Speed Limits:</strong> Maximum 80 km/h (50 mph) on open highways and 50 km/h (31 mph) through villages and built-up towns. Speed humps (road humps) are frequent before entering villages.
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <strong>Livestock Caution:</strong> Cows, horses, and stray dogs frequently graze alongside Queen's Road and King's Road. Avoid high-speed night driving.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>Driver's License:</strong> An English-language national driver's license is valid for up to 6 months in Fiji.
              </div>
            </div>
          </div>
        )}

        {/* ================= 7. BANKING & ATMS ================= */}
        {activeSection === 'banking' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Banking & ATM Access
                </h3>
                <p className="text-xs text-slate-500">Major banks and international card networks.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="font-bold text-slate-900 block mb-1">BSP (Bank South Pacific)</span>
                <span className="text-slate-500">Fiji's largest ATM network in every major town & airport.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="font-bold text-slate-900 block mb-1">ANZ Fiji</span>
                <span className="text-slate-500">International branches in Nadi, Suva, Lautoka & Labasa.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="font-bold text-slate-900 block mb-1">Westpac Fiji</span>
                <span className="text-slate-500">ATMs accepting Visa, MasterCard, Cirrus & Plus cards.</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= 8. HEALTH & SAFETY ================= */}
        {(activeSection === 'health' || activeSection === 'safety') && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Health, Water & Ocean Safety
                </h3>
                <p className="text-xs text-slate-500">Staying safe and healthy in tropical Fiji.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>Drinking Water:</strong> Tap water in major resorts in Nadi, Denarau, and Suva is generally safe. In remote islands and villages, drink boiled or filtered water.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>Reef Shoes:</strong> Essential for coral snorkeling and wading to prevent cuts from sharp coral and contact with stonefish.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>Sun Protection & Dehydration:</strong> Tropical UV is intense. Apply reef-safe sunscreen, drink plenty of fresh coconut water (bu), and wear UV rash vests.
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <strong>Strong Ocean Currents:</strong> Never swim across island barrier reef passages alone or at night. Always respect resort flags and marine guides.
              </div>
            </div>
          </div>
        )}

        {/* ================= 9. EMERGENCY SERVICES ================= */}
        {activeSection === 'emergency' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Emergency Services Directory
                </h3>
                <p className="text-xs text-slate-500">Instant contacts for immediate assistance.</p>
              </div>
            </div>

            {/* Quick Dial Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="tel:911"
                className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex flex-col items-center justify-center text-center shadow-md transition-colors"
              >
                <span className="font-heading font-extrabold text-2xl">911</span>
                <span className="text-xs font-bold mt-1">Ambulance & Medical</span>
              </a>
              <a
                href="tel:917"
                className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex flex-col items-center justify-center text-center shadow-md transition-colors"
              >
                <span className="font-heading font-extrabold text-2xl">917 / 919</span>
                <span className="text-xs font-bold mt-1">Fiji Police Force</span>
              </a>
              <a
                href="tel:910"
                className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl flex flex-col items-center justify-center text-center shadow-md transition-colors"
              >
                <span className="font-heading font-extrabold text-2xl">910</span>
                <span className="text-xs font-bold mt-1">National Fire Authority</span>
              </a>
            </div>

            {/* Major Referral Hospitals */}
            <div className="space-y-2 pt-2 text-xs">
              <h4 className="font-heading font-bold text-sm text-slate-900">Key Hospitals & Tourist Police</h4>
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Lautoka Hospital (Hyperbaric Decompression)</span>
                  <span className="text-slate-500">Primary western trauma & dive emergency center</span>
                </div>
                <a href="tel:+6796660399" className="font-bold text-teal-700 hover:underline">
                  +679 666 0399
                </a>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Colonial War Memorial Hospital (CWM Suva)</span>
                  <span className="text-slate-500">Largest national tertiary public hospital</span>
                </div>
                <a href="tel:+6793313444" className="font-bold text-teal-700 hover:underline">
                  +679 331 3444
                </a>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Nadi Tourist Police Office</span>
                  <span className="text-slate-500">Dedicated tourist security assistance</span>
                </div>
                <a href="tel:+6796700222" className="font-bold text-teal-700 hover:underline">
                  +679 670 0222
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
