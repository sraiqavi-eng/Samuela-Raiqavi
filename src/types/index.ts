export type MainTab = 
  | 'explore'
  | 'map'
  | 'events'
  | 'villages'
  | 'essentials'
  | 'itinerary';

export type SubCategory = 
  | 'all'
  | 'accommodation'
  | 'food'
  | 'transport'
  | 'attractions'
  | 'activities';

export type IslandRegion = 
  | 'all'
  | 'viti-levu-west' // Nadi, Denarau, Lautoka
  | 'coral-coast'    // Sigatoka, Pacific Harbour
  | 'suva-east'      // Suva, Nausori
  | 'mamanucas-yasawas' // Mamanuca & Yasawa Islands
  | 'vanua-levu'     // Savusavu, Labasa
  | 'taveuni'        // Garden Island
  | 'kadavu-outer';  // Kadavu, Lomaiviti, Lau

export interface BaseListing {
  id: string;
  name: string;
  category: 'accommodation' | 'food' | 'transport' | 'attractions' | 'activities' | 'events' | 'village' | 'service';
  subType: string;
  islandRegion: IslandRegion;
  locationName: string;
  coordinates: { x: number; y: number; lat: number; lng: number }; // x,y are 0-100% on map canvas
  description: string;
  image?: string;
  priceLevel?: 'Free' | '$' | '$$' | '$$$' | '$$$$';
  priceEstimate?: string;
  rating?: number;
  reviewsCount?: number;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  features?: string[];
  tags?: string[];
  hours?: string;
}

export interface AccommodationItem extends BaseListing {
  category: 'accommodation';
  subType: 'Hotels' | 'Resorts' | 'Motels' | 'Apartments' | 'Hostels' | 'Homestays' | 'Holiday Homes' | 'Guesthouses' | 'Village Stays';
  amenities: string[];
  roomTypes?: string[];
}

export interface FoodItem extends BaseListing {
  category: 'food';
  subType: 'Restaurants' | 'Cafes' | 'Takeaways' | 'Local Food' | 'Bars' | 'Nightclubs' | 'Live Entertainment';
  cuisineType: string;
  signatureDishes?: string[];
}

export interface TransportItem extends BaseListing {
  category: 'transport';
  subType: 'Airport Transfers' | 'Taxis' | 'Buses' | 'Car Rentals' | 'Private Drivers' | 'Ferries' | 'Water Taxis' | 'Domestic Flights' | 'Boat Operators';
  schedule?: string;
  fareEstimate?: string;
  bookingTip?: string;
}

export interface AttractionItem extends BaseListing {
  category: 'attractions';
  subType: 'Beaches' | 'Islands' | 'Waterfalls' | 'Mountains' | 'Historical Sites' | 'Museums' | 'Parks' | 'Villages' | 'Cultural Locations' | 'Hidden Destinations';
  bestTimeToVisit?: string;
  accessibilityNotes?: string;
  visitorGuidelines?: string[];
}

export interface ActivityItem extends BaseListing {
  category: 'activities';
  subType: 'Diving' | 'Snorkelling' | 'Fishing' | 'Surfing' | 'Hiking' | 'Kayaking' | 'Sailing' | 'Island Tours' | 'Adventure Activities' | 'Cultural Experiences';
  duration?: string;
  fitnessLevel?: 'Easy' | 'Moderate' | 'Challenging';
  equipmentProvided?: boolean;
}

export interface EventItem extends BaseListing {
  category: 'events';
  subType: 'Concerts' | 'Festivals' | 'Sports' | 'Cultural Events' | 'Nightlife' | 'Live Music' | 'Food Events' | 'Community Events';
  datePeriod: 'today' | 'weekend' | 'month' | 'upcoming';
  dateDisplay: string;
  venue: string;
  admission: string;
}

export interface VillageItem extends BaseListing {
  category: 'village';
  subType: 'Village';
  province: string;
  history: string;
  culturalSignificance: string;
  chiefProtocol: string;
  sevusevuGuide: {
    yaqonaRequirement: string;
    presentationSteps: string[];
    respectRules: string[];
  };
  visitorGuidelines: string[];
  experiences: string[];
}

export interface EssentialServiceItem extends BaseListing {
  category: 'service';
  subType: 'Hospital' | 'Fuel Station' | 'Bank / ATM' | 'Police' | 'Emergency' | 'Port / Airport';
  emergencyNumber?: string;
}

export type ListingItem = 
  | AccommodationItem 
  | FoodItem 
  | TransportItem 
  | AttractionItem 
  | ActivityItem 
  | EventItem 
  | VillageItem 
  | EssentialServiceItem;

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  notes: string;
  items: string[]; // listing IDs
}

export interface PhraseItem {
  fijian: string;
  english: string;
  phonetic: string;
  context: string;
  category: 'Greetings' | 'Respect & Etiquette' | 'Dining & Village' | 'Getting Around' | 'Fiji Hindi';
}

export interface BookingRecord {
  id: string; // e.g. BK-FJ-84920
  listingId: string;
  listingName: string;
  category: string;
  subType: string;
  locationName: string;
  image?: string;
  createdAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  startDate: string;
  endDate?: string;
  timeSlot?: string;
  guests: {
    adults: number;
    children: number;
  };
  optionSelected: string;
  totalPriceFjd: number;
  depositAmountFjd: number; // 25% received by FIJI HAPS app
  balanceDueFjd: number; // 75% due to operator / resort on arrival
  commissionRate: number; // 0.25
  paymentMethod: 'credit_card' | 'pay_on_arrival' | 'deposit_online_balance_arrival';
  providerEmail?: string;
  providerPhone?: string;
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    flightNumber?: string;
    specialRequests?: string;
  };
  voucherCode: string;
}

