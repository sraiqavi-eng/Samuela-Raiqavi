import React, { useState } from 'react';
import { VILLAGES_DIRECTORY, VILLAGE_IMAGE, CULTURE_IMAGE } from '../data/fijiData';
import { VillageItem, ListingItem } from '../types';
import { 
  Tent, 
  MapPin, 
  BookOpen, 
  ShieldCheck, 
  Heart, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  Check, 
  Volume2,
  CalendarCheck
} from 'lucide-react';

interface VillageDirectoryViewProps {
  onSelectItem: (item: VillageItem) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onNavigateToMap: () => void;
  onBookItem: (item: ListingItem) => void;
}

export const VillageDirectoryView: React.FC<VillageDirectoryViewProps> = ({
  onSelectItem,
  savedIds,
  onToggleSave,
  onNavigateToMap,
  onBookItem
}) => {
  const [selectedVillageId, setSelectedVillageId] = useState<string>('vil-1');
  const [activeStep, setActiveStep] = useState<number>(0);

  const activeVillage = VILLAGES_DIRECTORY.find(v => v.id === selectedVillageId) || VILLAGES_DIRECTORY[0];

  const sevusevuSteps = [
    {
      step: 1,
      title: 'Obtain the Waka (Kava Root)',
      action: 'Purchase a bundle of dried waka root (0.5kg – 1kg) at the local town market (approx FJD $30–$50). Wrap it neatly in brown paper with natural ribbon.',
      tip: 'Never arrive in an iTaukei village without yaqona. It represents your respectful request to enter the community\'s ancestral land.'
    },
    {
      step: 2,
      title: 'Attire & Entering Boundaries',
      action: 'Wrap a sulu (sarong) securely around your waist covering knees. Remove hats, caps, and sunglasses immediately before crossing the village boundary gate.',
      tip: 'Do not carry bags slung across your shoulders; hold them in hand.'
    },
    {
      step: 3,
      title: 'Entering the Chief\'s Bure',
      action: 'Remove your footwear at the doorway. Enter with a slight bow whispering "Tulou". Sit cross-legged on the woven voivoi pandanus mats.',
      tip: 'Never point the soles of your feet towards the Chief or elders; tuck feet under or sit tailor-style.'
    },
    {
      step: 4,
      title: 'The Presentation (Sevusevu)',
      action: 'Your local guide will place the Waka on the mat and deliver formal oratory in the iTaukei language, explaining who you are and wishing blessings.',
      tip: 'The village elder will accept the root, chant sacred responses, and perform rhythmic cupped claps (cobo).'
    },
    {
      step: 5,
      title: 'Drinking the Bilo of Kava',
      action: 'When presented with the coconut bilo: 1. Cup your hands and clap once saying "Bula!". 2. Drink in one continuous draught. 3. Hand back the bilo, clap three times rhythmically, and say "Vinaka!".',
      tip: 'You are now officially welcomed into the village family (taukei) and granted the freedom of the village!'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      
      {/* Banner */}
      <section className="bg-slate-900 text-white relative overflow-hidden py-10 px-4 sm:px-6">
        <div className="absolute inset-0 z-0">
          <img
            src={VILLAGE_IMAGE}
            alt="Traditional Navala Fijian Village"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Tent className="w-4 h-4" />
            <span>Official Fiji Village Directory</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            Visiting iTaukei Villages
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
            Discover participating ancestral villages, their history, living traditions, and the sacred protocol of the Sevusevu kava ceremony.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Village Selector Horizontal Strip */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-heading font-bold text-sm sm:text-base text-slate-900">
              Participating Cultural Villages
            </h2>
            <button
              onClick={onNavigateToMap}
              className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {VILLAGES_DIRECTORY.map(village => {
              const isSelected = village.id === selectedVillageId;
              return (
                <button
                  key={village.id}
                  onClick={() => setSelectedVillageId(village.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border min-h-[44px] ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Tent className="w-3.5 h-3.5" />
                  <span>{village.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Village Detail Spotlight */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Village Image & Quick Facts */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                <img
                  src={activeVillage.image || VILLAGE_IMAGE}
                  alt={activeVillage.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-lg">
                  {activeVillage.province}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => onBookItem(activeVillage)}
                  className="flex-1 py-2.5 px-4 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-colors text-center shadow-md flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Book Homestay / Tour</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectItem(activeVillage)}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors text-center"
                  >
                    View Guide
                  </button>
                  <button
                    onClick={() => onToggleSave(activeVillage.id)}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      savedIds.includes(activeVillage.id)
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Save to My Trip"
                  >
                    {savedIds.includes(activeVillage.id) ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <Heart className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Cultural Experiences Offered */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-teal-800 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cultural Experiences Here</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeVillage.experiences.map((exp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">✓</span>
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Village Story & Protocols */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>{activeVillage.locationName}</span>
                </div>
                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
                  {activeVillage.name}
                </h3>
              </div>

              <div className="prose prose-sm text-slate-600 leading-relaxed space-y-3">
                <p className="text-sm text-slate-700 font-medium">
                  {activeVillage.description}
                </p>
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900 mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-teal-600" />
                    <span>History & Ancestral Origins</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {activeVillage.history}
                  </p>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Cultural Significance</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {activeVillage.culturalSignificance}
                  </p>
                </div>
              </div>

              {/* Chief / Turaga ni Koro Protocol */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wide text-amber-900 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Chief & Leadership Protocol</span>
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {activeVillage.chiefProtocol}
                </p>
              </div>

              {/* Visitor Guidelines List */}
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 mb-2">
                  Visitor Guidelines
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  {activeVillage.visitorGuidelines.map((guide, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                      <span>{guide}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Interactive Sevusevu Etiquette Guide */}
        <section className="bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-teal-800/40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-3 border border-teal-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Cultural Etiquette Guide</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              The Sacred Sevusevu Protocol
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              When entering an indigenous Fijian village, presenting a bundle of Yaqona (kava roots) is the highest gesture of respect and goodwill. Walk through the 5 steps below to prepare for your village visit:
            </p>
          </div>

          {/* Interactive Step Navigator */}
          <div className="mt-8 grid grid-cols-5 gap-2 sm:gap-3">
            {sevusevuSteps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setActiveStep(idx)}
                className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border transition-all text-center ${
                  activeStep === idx
                    ? 'bg-teal-500 text-slate-950 font-bold border-white shadow-lg scale-105'
                    : 'bg-teal-950/60 text-teal-200 border-teal-800/60 hover:bg-teal-900/60'
                }`}
              >
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold">Step {s.step}</span>
                <span className="text-[11px] sm:text-xs truncate max-w-full font-semibold hidden md:inline mt-0.5">
                  {s.title.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Active Step Showcase */}
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-7 border border-white/15">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-heading font-bold text-lg sm:text-xl text-teal-300">
                Step {sevusevuSteps[activeStep].step}: {sevusevuSteps[activeStep].title}
              </h3>
              <span className="text-xs text-teal-200 font-mono">
                {activeStep + 1} of 5
              </span>
            </div>

            <p className="text-sm sm:text-base text-white leading-relaxed">
              {sevusevuSteps[activeStep].action}
            </p>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2 text-xs text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <span>
                <strong>Cultural Tip:</strong> {sevusevuSteps[activeStep].tip}
              </span>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              {activeStep > 0 && (
                <button
                  onClick={() => setActiveStep(prev => prev - 1)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Previous Step
                </button>
              )}
              {activeStep < sevusevuSteps.length - 1 ? (
                <button
                  onClick={() => setActiveStep(prev => prev + 1)}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-300">
                  <Check className="w-4 h-4" />
                  <span>Protocol Mastered! Vinaka vakalevu!</span>
                </div>
              )}
            </div>
          </div>

          {/* Taboo Reminders Grid */}
          <div className="mt-8 pt-6 border-t border-teal-800/50">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-teal-300 mb-3">
              Sacred Village Taboos (Never Break These Rules)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-teal-950/70 p-3 rounded-xl border border-teal-800/40">
                <span className="font-bold text-rose-300 block mb-1">1. No Hats or Sunglasses</span>
                <p className="text-teal-100/80 text-[11px]">Wearing headwear implies you place yourself above the chiefs.</p>
              </div>
              <div className="bg-teal-950/70 p-3 rounded-xl border border-teal-800/40">
                <span className="font-bold text-rose-300 block mb-1">2. Sulu / Modest Dress</span>
                <p className="text-teal-100/80 text-[11px]">Knees and shoulders must be covered by men and women alike.</p>
              </div>
              <div className="bg-teal-950/70 p-3 rounded-xl border border-teal-800/40">
                <span className="font-bold text-rose-300 block mb-1">3. Never Touch Heads</span>
                <p className="text-teal-100/80 text-[11px]">The human head is sacred (tabu). Never pat children on the head.</p>
              </div>
              <div className="bg-teal-950/70 p-3 rounded-xl border border-teal-800/40">
                <span className="font-bold text-rose-300 block mb-1">4. Sundays are Sacred</span>
                <p className="text-teal-100/80 text-[11px]">Sunday is dedicated to family and church. Speak quietly and dress in Sunday best.</p>
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
};
