import {
  AccommodationItem,
  FoodItem,
  TransportItem,
  AttractionItem,
  ActivityItem,
  EventItem,
  VillageItem,
  EssentialServiceItem,
  ListingItem,
  PhraseItem
} from '../types';

export const HERO_IMAGE = '/src/assets/images/hero_fiji_islands_1790736422977.jpg';
export const CULTURE_IMAGE = '/src/assets/images/fiji_culture_kava_1790736439086.jpg';
export const REEF_IMAGE = '/src/assets/images/fiji_coral_coast_reef_1790736452142.jpg';
export const VILLAGE_IMAGE = '/src/assets/images/fiji_navala_village_1790736464382.jpg';
export const DINING_IMAGE = '/src/assets/images/fiji_nightlife_food_1790736475960.jpg';

export const ISLAND_REGIONS = [
  { id: 'all', label: 'All Regions' },
  { id: 'viti-levu-west', label: 'Nadi & Denarau (West)' },
  { id: 'coral-coast', label: 'Coral Coast & Pacific Harbour' },
  { id: 'suva-east', label: 'Suva & East (Capital)' },
  { id: 'mamanucas-yasawas', label: 'Mamanuca & Yasawa Islands' },
  { id: 'vanua-levu', label: 'Savusavu & Vanua Levu' },
  { id: 'taveuni', label: 'Taveuni (Garden Island)' },
  { id: 'kadavu-outer', label: 'Kadavu & Outer Islands' },
] as const;

export const ACCOMMODATIONS: AccommodationItem[] = [
  {
    id: 'acc-1',
    name: 'Likuliku Lagoon Resort',
    category: 'accommodation',
    subType: 'Resorts',
    islandRegion: 'mamanucas-yasawas',
    locationName: 'Malolo Island, Mamanucas',
    coordinates: { x: 23, y: 52, lat: -17.755, lng: 177.168 },
    description: 'Iconic luxury resort featuring Fiji\'s only genuine overwater bures suspended over a protected marine sanctuary. Traditional iTaukei architecture with hand-woven magimagi coconut fiber detailing.',
    image: HERO_IMAGE,
    priceLevel: '$$$$',
    priceEstimate: 'FJD $1,800 - $3,200 / night',
    rating: 4.9,
    reviewsCount: 428,
    contact: {
      phone: '+679 672 0978',
      email: 'reservations@ahuraresorts.com',
      website: 'likulikulagoon.com',
      address: 'Malolo Island, Mamanuca Archipelago'
    },
    amenities: ['Over-water Bures', 'Infinity Pool', 'Tijikamu Spa', 'Gourmet Restaurant', 'Free Catamaran Access', 'Snorkel Equipment'],
    roomTypes: ['Over-Water Bure', 'Deluxe Beachfront Bure', 'Beachfront Bure with Private Plunge Pool'],
    features: ['Adults Only (17+)', 'Marine Sanctuary', 'Traditional Fijian Craftsmanship']
  },
  {
    id: 'acc-2',
    name: 'Outrigger Fiji Beach Resort',
    category: 'accommodation',
    subType: 'Resorts',
    islandRegion: 'coral-coast',
    locationName: 'Korotogo, Coral Coast',
    coordinates: { x: 38, y: 76, lat: -18.172, lng: 177.564 },
    description: 'Renowned 5-star beachfront resort styled like a traditional Fijian village nestled in 40 acres of lush landscaped gardens with signature Talai Butler service and Bebe Spa sanctuary.',
    image: REEF_IMAGE,
    priceLevel: '$$$',
    priceEstimate: 'FJD $580 - $1,150 / night',
    rating: 4.8,
    reviewsCount: 890,
    contact: {
      phone: '+679 650 0044',
      email: 'reservations@outriggerfiji.com.fj',
      website: 'outrigger.com/fiji',
      address: 'Sydney Drive, Korotogo, Coral Coast'
    },
    amenities: ['Lagoon Pools', 'Bebe Spa Sanctuary', 'Ivi Fine Dining', 'Kids Club & Meimei Nanny', 'Cultural Firewalking'],
    roomTypes: ['Plantation Bure', 'Ocean Breeze Room', 'Ocean View Suite'],
    features: ['Family Friendly', 'Authentic Lovo Nights', 'Direct Coral Reef Access']
  },
  {
    id: 'acc-3',
    name: 'Grand Pacific Hotel Suva',
    category: 'accommodation',
    subType: 'Hotels',
    islandRegion: 'suva-east',
    locationName: 'Victoria Parade, Suva',
    coordinates: { x: 68, y: 72, lat: -18.143, lng: 178.423 },
    description: 'The historic "Grand Old Lady of the Pacific", built in 1914 facing Suva Harbour. Colonial elegance combined with modern luxury, walking distance to the Fiji Museum and Thurston Gardens.',
    image: HERO_IMAGE,
    priceLevel: '$$$',
    priceEstimate: 'FJD $420 - $850 / night',
    rating: 4.7,
    reviewsCount: 512,
    contact: {
      phone: '+679 322 2000',
      email: 'gph@ihg.com',
      website: 'grandpacifichotel.com.fj',
      address: 'Victoria Parade, Suva City'
    },
    amenities: ['Harbour View Pool', 'GPH Bakery', 'Steam & Sauna', 'Conference Ballrooms', 'High Tea Terrace'],
    roomTypes: ['Heritage Room', 'Harbour View King', 'Royal Suite'],
    features: ['Historic Landmark', 'City Center', 'Suva Harbour Sunset Views']
  },
  {
    id: 'acc-4',
    name: 'Navala Village Traditional Homestay',
    category: 'accommodation',
    subType: 'Village Stays',
    islandRegion: 'viti-levu-west',
    locationName: 'Ba Highlands, Viti Levu',
    coordinates: { x: 42, y: 44, lat: -17.653, lng: 177.671 },
    description: 'A once-in-a-lifetime immersion living inside one of the 200 thatched bures in Fiji\'s last preserved ancestral village. Sleep on woven voivoi mats, share home-cooked meals with your host family, and participate in evening kava talanoa.',
    image: VILLAGE_IMAGE,
    priceLevel: '$',
    priceEstimate: 'FJD $95 - $140 / night (Includes Meals & Sevusevu)',
    rating: 4.9,
    reviewsCount: 164,
    contact: {
      phone: '+679 834 1928',
      email: 'navala.ecotourism@gmail.com',
      website: 'fiji.travel/navala-village',
      address: 'Navala Village, Ba Highlands'
    },
    amenities: ['Authentic Thatched Bure', 'All Home-cooked Meals Included', 'Village Guide & Translator', 'River Swimming'],
    roomTypes: ['Private Family Bure', 'Traditional Single Bure'],
    features: ['100% Traditional', 'Cultural Immersion', 'Direct Contribution to Community']
  },
  {
    id: 'acc-5',
    name: 'Barefoot Manta Island Resort',
    category: 'accommodation',
    subType: 'Hostels',
    islandRegion: 'mamanucas-yasawas',
    locationName: 'Drawaqa Island, Yasawas',
    coordinates: { x: 28, y: 32, lat: -17.158, lng: 177.190 },
    description: 'Eco-haven situated right on the world-famous Manta Ray channel. Offers both social beachfront safari tents and private sunrise bures with in-house marine biologists guiding daily reef conservation swims.',
    image: REEF_IMAGE,
    priceLevel: '$$',
    priceEstimate: 'FJD $120 - $350 / night',
    rating: 4.8,
    reviewsCount: 620,
    contact: {
      phone: '+679 666 4848',
      email: 'manta@barefootfiji.com',
      website: 'barefootmantafiji.com',
      address: 'Drawaqa Island, Southern Yasawas'
    },
    amenities: ['Manta Ray Channel', 'Dive Center (SSI/PADI)', 'Three Private Beaches', 'Beach Bar', 'Hammock Groves'],
    roomTypes: ['Safari Dorm Tent', 'Beachfront Safari Tent', 'Ensuite Island Bure'],
    features: ['Eco Certified', 'Manta Ray Swimming', 'No TV or Wifi Distraction']
  },
  {
    id: 'acc-6',
    name: 'Jean-Michel Cousteau Resort',
    category: 'accommodation',
    subType: 'Resorts',
    islandRegion: 'vanua-levu',
    locationName: 'Savusavu Bay, Vanua Levu',
    coordinates: { x: 74, y: 34, lat: -16.804, lng: 179.324 },
    description: 'Award-winning eco-luxury resort founded by legendary oceanographer Jean-Michel Cousteau. World-class scuba diving on the Namena Marine Reserve with resident marine biologists, organic farm-to-table cuisine.',
    image: HERO_IMAGE,
    priceLevel: '$$$$',
    priceEstimate: 'FJD $1,650 - $2,800 / night',
    rating: 5.0,
    reviewsCount: 310,
    contact: {
      phone: '+679 885 0145',
      email: 'info@fijiresort.com',
      website: 'fijiresort.com',
      address: 'Lesiaceva Point, Savusavu'
    },
    amenities: ['Private Marine Biologist', 'Dive Boat Fleet', 'Organic Farm Dining', 'Complimentary Bula Club Kids Camp', 'Beachside Massage'],
    roomTypes: ['Gardenview Bure', 'Oceanfront Bure', 'The Villa'],
    features: ['World-Class Diving', 'Holistic Eco-Tourism', 'Complimentary Nanny']
  },
  {
    id: 'acc-7',
    name: 'Smugglers Cove Beach Resort',
    category: 'accommodation',
    subType: 'Apartments',
    islandRegion: 'viti-levu-west',
    locationName: 'Wailoaloa Beach, Nadi',
    coordinates: { x: 30, y: 55, lat: -17.765, lng: 177.426 },
    description: 'Popular beachfront hub on Wailoaloa beach, just 15 minutes from Nadi International Airport. Clean modern self-contained apartments and lively beachfront deck featuring nightly Polynesian fire dancers.',
    image: DINING_IMAGE,
    priceLevel: '$$',
    priceEstimate: 'FJD $140 - $280 / night',
    rating: 4.4,
    reviewsCount: 940,
    contact: {
      phone: '+679 672 6578',
      email: 'reservations@smugglersbeachfiji.com',
      website: 'smugglerscovレスort.com',
      address: 'Wasawasa Road, Wailoaloa Beach, Nadi'
    },
    amenities: ['Ghost Ship Bar & Grill', 'Beachfront Pool', 'Travel Desk', 'PADI Dive Shop', 'Airport Transfers'],
    roomTypes: ['Self-Contained Studio Apartment', 'Deluxe Ocean View Room', 'Premium Dorm'],
    features: ['Nightly Beach Entertainment', 'Paddleboard Rentals', 'Transit Friendly']
  },
  {
    id: 'acc-8',
    name: 'Taveuni Island Dive Resort & Holiday Homes',
    category: 'accommodation',
    subType: 'Holiday Homes',
    islandRegion: 'taveuni',
    locationName: 'Matei, Taveuni Island',
    coordinates: { x: 88, y: 28, lat: -16.698, lng: 179.882 },
    description: 'Private clifftop holiday villas perched high above the Somosomo Strait with panoramic views across the rainbow reef. Self-catering kitchens, private plunge pools, and private boat charters.',
    image: HERO_IMAGE,
    priceLevel: '$$$',
    priceEstimate: 'FJD $490 - $980 / night',
    rating: 4.8,
    reviewsCount: 180,
    contact: {
      phone: '+679 888 0555',
      email: 'stay@taveunidiveresort.com',
      website: 'taveunidiveresort.com',
      address: 'Matei Coast Road, Taveuni'
    },
    amenities: ['Full Kitchen', 'Private Plunge Pool', 'High Speed Starlink Wifi', 'Charter Boat', 'Airport Pickup'],
    roomTypes: ['Two-Bedroom Ocean Villa', 'Three-Bedroom Plantation Estate'],
    features: ['Rainbow Reef View', 'Private Chef Available', 'Secluded Paradise']
  }
];

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Nadina Authentic Fijian Restaurant',
    category: 'food',
    subType: 'Local Food',
    islandRegion: 'viti-levu-west',
    locationName: 'Port Denarau Marina',
    coordinates: { x: 28, y: 56, lat: -17.771, lng: 177.378 },
    description: 'Fiji\'s celebrated traditional restaurant at Port Denarau. Famous for traditional Kokoda (raw walu marinated in fresh lime juice, coconut milk, diced tomato, chili, and coriander), Lovo platters, and Rourou leaves simmered in coconut cream.',
    image: DINING_IMAGE,
    cuisineType: 'Authentic Fijian (iTaukei & Indo-Fijian)',
    signatureDishes: ['Fresh Walu Kokoda in Coconut Shell', 'Lovo Pork & Taro Leaf Rourou', 'Cassava Chips with Chili Aioli', 'Vudi Vakasoso (Banana Dessert)'],
    priceLevel: '$$',
    priceEstimate: 'FJD $35 - $65 per person',
    rating: 4.8,
    reviewsCount: 780,
    contact: {
      phone: '+679 675 0855',
      email: 'info@nadinafijian.com',
      address: 'Shop 14, Commercial Building, Port Denarau'
    },
    features: ['Waterfront Marina Seating', 'Live Acoustic Fijian Music', 'Vegetarian Options'],
    hours: '11:30 AM - 10:00 PM Daily'
  },
  {
    id: 'food-2',
    name: 'Cloud 9 Floating Bar & Woodfired Pizzeria',
    category: 'food',
    subType: 'Bars',
    islandRegion: 'mamanucas-yasawas',
    locationName: 'Ro Ro Reef, Mamanucas',
    coordinates: { x: 21, y: 53, lat: -17.794, lng: 177.102 },
    description: 'World-famous two-level floating paradise platform surrounded by turquoise waters and barrier reef. Serves authentic Italian woodfired pizzas, international cocktails, sundeck daybeds, and guest DJs.',
    image: REEF_IMAGE,
    cuisineType: 'Italian Woodfired Pizza & Craft Cocktails',
    signatureDishes: ['Signature Diavola Chili Pizza', 'Tropical Coconut Mojito', 'Cloud 9 Spritz'],
    priceLevel: '$$$',
    priceEstimate: 'FJD $60 - $120 per person',
    rating: 4.9,
    reviewsCount: 1450,
    contact: {
      phone: '+679 869 7776',
      email: 'book@cloud9.com.fj',
      website: 'cloud9.com.fj',
      address: 'Ro Ro Reef, Mamanuca Islands'
    },
    features: ['Boat Transfer Included from Denarau', 'Snorkel Equipment', 'Live DJ Sets', 'Sundeck Lounges'],
    hours: '10:00 AM - 4:00 PM Daily'
  },
  {
    id: 'food-3',
    name: 'Wicked Walu Seafood Restaurant',
    category: 'food',
    subType: 'Restaurants',
    islandRegion: 'coral-coast',
    locationName: 'Warwick Fiji, Coral Coast',
    coordinates: { x: 44, y: 78, lat: -18.212, lng: 177.728 },
    description: 'Voted one of Fiji\'s top seafood dining experiences, situated on its own private islet. Dine with your toes in the sand listening to gentle reef waves while enjoying freshly caught yellowfin tuna and mud crab.',
    image: DINING_IMAGE,
    cuisineType: 'Pacific Seafood & Chargrill',
    signatureDishes: ['Fresh Mud Crab in Garlic Butter', 'Pan-seared Coral Trout', 'Grilled Rock Lobster Tail'],
    priceLevel: '$$$$',
    priceEstimate: 'FJD $85 - $160 per person',
    rating: 4.8,
    reviewsCount: 520,
    contact: {
      phone: '+679 653 0555',
      website: 'warwickhotels.com/wicked-walu',
      address: 'Warwick Fiji, Korolevu, Coral Coast'
    },
    features: ['Private Island Setting', 'Adults-Only Atmosphere', 'Fresh Catch of the Day'],
    hours: '6:00 PM - 10:30 PM (Bookings Required)'
  },
  {
    id: 'food-4',
    name: 'Tu\'s Place & Takeaway',
    category: 'food',
    subType: 'Cafes',
    islandRegion: 'viti-levu-west',
    locationName: 'Martintar, Nadi',
    coordinates: { x: 32, y: 53, lat: -17.788, lng: 177.442 },
    description: 'Beloved local and traveler hotspot run by Tu and his family. Famous for oversized fish and chips using fresh local mahi-mahi, authentic Indo-Fijian goat curries with warm roti, and homemade tropical juices.',
    image: DINING_IMAGE,
    cuisineType: 'Local Fijian, Indo-Fijian & Seafood',
    signatureDishes: ['Crispy Beer Battered Mahi-Mahi', 'Slow-cooked Goat Curry with Dhal & Roti', 'Papaya Lime Smoothie'],
    priceLevel: '$',
    priceEstimate: 'FJD $18 - $35 per person',
    rating: 4.7,
    reviewsCount: 680,
    contact: {
      phone: '+679 672 5757',
      address: 'Queen\'s Highway, Martintar, Nadi'
    },
    features: ['Budget Friendly', 'Takeaway Available', 'Air Conditioned & Verandah'],
    hours: '8:00 AM - 9:30 PM (Closed Mondays)'
  },
  {
    id: 'food-5',
    name: 'Traps Bar & Nightclub',
    category: 'food',
    subType: 'Nightclubs',
    islandRegion: 'suva-east',
    locationName: 'Victoria Parade, Suva',
    coordinates: { x: 67, y: 73, lat: -18.148, lng: 178.428 },
    description: 'The heartbeat of Suva\'s weekend nightlife. Multiple bar zones featuring live local reggae and Pacific fusion bands in the courtyard, followed by high-energy club anthems with top Fijian DJs.',
    image: DINING_IMAGE,
    cuisineType: 'Cocktails, Fiji Bitter & Bar Bites',
    signatureDishes: ['Fiji Gold & Fiji Bitter on tap', 'Island Spiced Rum Punch', 'Spicy BBQ Chicken Wings'],
    priceLevel: '$$',
    priceEstimate: 'FJD $20 - $50 per person',
    rating: 4.5,
    reviewsCount: 390,
    contact: {
      phone: '+679 331 2922',
      address: '305 Victoria Parade, Suva'
    },
    features: ['Live Reggae Bands', 'Outdoor Courtyard', 'Dancing till 3:00 AM on Weekends'],
    hours: '5:00 PM - 3:00 AM Thursday - Saturday'
  }
];

export const TRANSPORT_ITEMS: TransportItem[] = [
  {
    id: 'trans-1',
    name: 'Nadi Airport Express & Shared Shuttles',
    category: 'transport',
    subType: 'Airport Transfers',
    islandRegion: 'viti-levu-west',
    locationName: 'Nadi International Airport',
    coordinates: { x: 33, y: 51, lat: -17.755, lng: 177.443 },
    description: 'Air-conditioned modern coaches and private vans operating 24/7 directly from Nadi International Airport arrivals hall to all Denarau resorts, Coral Coast hotels, and Suva.',
    image: HERO_IMAGE,
    schedule: 'Departs continuously with international flight arrivals (every 30 mins)',
    fareEstimate: 'FJD $25 Denarau / FJD $55 Coral Coast / FJD $95 Suva',
    bookingTip: 'Book upon arrival at the tourist transport counter or pre-book for a personalized welcome shell lei.',
    contact: {
      phone: '+679 672 2433',
      email: 'transfers@touristtransportfiji.com',
      website: 'touristtransportfiji.com'
    },
    priceLevel: '$$'
  },
  {
    id: 'trans-2',
    name: 'South Sea Cruises Ferry Catamarans',
    category: 'transport',
    subType: 'Ferries',
    islandRegion: 'mamanucas-yasawas',
    locationName: 'Port Denarau Marina',
    coordinates: { x: 28, y: 56, lat: -17.771, lng: 177.378 },
    description: 'High-speed modern air-conditioned catamarans with viewing decks linking Port Denarau to 20+ islands in the Mamanucas and Yasawas (Yasawa Flyer).',
    image: HERO_IMAGE,
    schedule: 'Mamanuca departures: 9:00 AM, 12:15 PM, 3:15 PM. Yasawa Flyer: 8:45 AM daily.',
    fareEstimate: 'FJD $140 - $280 one way depending on island distance',
    bookingTip: 'Get the "Bula Pass" for multi-day hop-on hop-off travel between Yasawa islands.',
    contact: {
      phone: '+679 675 0500',
      email: 'info@ssc.com.fj',
      website: 'southseacruisesfiji.com'
    },
    priceLevel: '$$$'
  },
  {
    id: 'trans-3',
    name: 'Pacific Transport & Sunbeam Coaches (Public Express)',
    category: 'transport',
    subType: 'Buses',
    islandRegion: 'coral-coast',
    locationName: 'Queens Road (Nadi - Suva)',
    coordinates: { x: 50, y: 70, lat: -18.150, lng: 178.000 },
    description: 'The affordable, scenic way to travel between Nadi and Suva along the Queens Highway via the Coral Coast. Modern air-conditioned coaches stopping at major resorts, towns, and junctions.',
    image: VILLAGE_IMAGE,
    schedule: 'Departs Nadi & Suva hourly between 6:00 AM and 6:30 PM',
    fareEstimate: 'FJD $22.50 Nadi to Suva (One Way)',
    bookingTip: 'Buy a disposable bus card at bus station counters as cash is not accepted onboard buses under Fiji law.',
    contact: {
      phone: '+679 670 0043',
      address: 'Nadi Bus Station / Suva Bus Station'
    },
    priceLevel: '$'
  },
  {
    id: 'trans-4',
    name: 'Fiji Link (Fiji Airways Domestic Flights)',
    category: 'transport',
    subType: 'Domestic Flights',
    islandRegion: 'viti-levu-west',
    locationName: 'Nadi Airport Domestic Terminal',
    coordinates: { x: 33, y: 51, lat: -17.755, lng: 177.443 },
    description: 'Scheduled twin-otter and ATR flights connecting Nadi and Suva to Savusavu (Vanua Levu), Taveuni (Matei), Kadavu (Vunisea), and Rotuma. Spectacular bird\'s-eye views over barrier reefs.',
    image: HERO_IMAGE,
    schedule: 'Daily multiple frequencies to Suva, Savusavu, and Taveuni',
    fareEstimate: 'FJD $160 - $350 one way',
    bookingTip: 'Check baggage weight allowances carefully on Twin Otter flights (15kg checked + 5kg cabin).',
    contact: {
      phone: '+679 672 0888',
      website: 'fijiairways.com'
    },
    priceLevel: '$$$'
  },
  {
    id: 'trans-5',
    name: 'Licensed Yellow Airport & Town Taxis',
    category: 'transport',
    subType: 'Taxis',
    islandRegion: 'viti-levu-west',
    locationName: 'Nadi, Denarau, Suva & Lautoka',
    coordinates: { x: 31, y: 54, lat: -17.770, lng: 177.430 },
    description: 'Official metered yellow taxis in Nadi and Suva. Look for yellow registration plates starting with "LT" or "LH". Fixed rates apply for airport pickups with surcharge after 10 PM.',
    schedule: 'Available 24/7 at airport ranks, taxi stands, and resort lobbies',
    fareEstimate: 'Flagfall FJD $5.00 (Airport) / FJD $2.00 (Town); approx FJD $25 Nadi to Denarau',
    bookingTip: 'Always request the driver turn on the meter ("Mita kerekere") or agree on the price before boarding.',
    contact: {
      phone: '+679 672 2777',
      address: 'Airport Rank & Port Denarau Rank'
    },
    priceLevel: '$$'
  },
  {
    id: 'trans-6',
    name: 'Patterson Brothers Shipping (Vanua Levu & Ovalau Ferry)',
    category: 'transport',
    subType: 'Ferries',
    islandRegion: 'suva-east',
    locationName: 'Natovi Jetty, Tailevu',
    coordinates: { x: 72, y: 54, lat: -17.650, lng: 178.600 },
    description: 'Roll-on roll-off passenger and vehicle ferry service linking Viti Levu (Natovi Jetty) to Nabouwalu (Vanua Levu) and Buresala (Ovalau / Levuka historical town). Includes connecting bus from Suva.',
    schedule: 'Daily departures linking Suva bus terminal to Vanua Levu',
    fareEstimate: 'FJD $55 - $75 per adult (Bus + Ferry combined)',
    bookingTip: 'Reserve 48 hours in advance during school holidays and festive seasons.',
    contact: {
      phone: '+679 331 5644',
      website: 'pattersons.com.fj'
    },
    priceLevel: '$'
  }
];

export const ATTRACTION_ITEMS: AttractionItem[] = [
  {
    id: 'attr-1',
    name: 'Natadola Beach & Bay',
    category: 'attractions',
    subType: 'Beaches',
    islandRegion: 'coral-coast',
    locationName: 'Natadola, Coral Coast',
    coordinates: { x: 32, y: 68, lat: -18.005, lng: 177.315 },
    description: 'Widely praised as mainland Fiji\'s finest white-sand beach. Crystal turquoise waters safe for swimming at all tides, rolling shore break for body surfing, and beachside horse riding with local villagers.',
    image: REEF_IMAGE,
    priceLevel: 'Free',
    rating: 4.9,
    reviewsCount: 1120,
    features: ['All-Tide Swimming', 'White Sand Lagoon', 'Horseback Riding', 'Fresh Coconut Stalls'],
    bestTimeToVisit: 'Morning to mid-afternoon before trade winds rise',
    accessibilityNotes: 'Paved access road from Queen\'s Highway, public beach car park available'
  },
  {
    id: 'attr-2',
    name: 'Bouma National Heritage Park & Tavoro Falls',
    category: 'attractions',
    subType: 'Waterfalls',
    islandRegion: 'taveuni',
    locationName: 'Bouma, Taveuni Island',
    coordinates: { x: 91, y: 27, lat: -16.820, lng: 179.910 },
    description: 'Spectacular protected rainforest sanctuary managed by the local indigenous community. Features three cascading waterfalls with deep volcanic swimming pools surrounded by giant ferns and tropical birds.',
    image: VILLAGE_IMAGE,
    priceLevel: '$',
    priceEstimate: 'FJD $30 park entry fee (directly funds Bouma village school & clinic)',
    rating: 4.9,
    reviewsCount: 460,
    features: ['Three Tier Waterfall Hike', 'Natural Freshwater Pools', 'Rare Orange Dove Spotting', 'Indigenous Community Run'],
    bestTimeToVisit: 'Early morning for birdwatching and tranquil swimming',
    accessibilityNotes: 'First waterfall is an easy flat 10-minute walk; second and third require moderate steep hiking'
  },
  {
    id: 'attr-3',
    name: 'Sigatoka Sand Dunes National Park',
    category: 'attractions',
    subType: 'Parks',
    islandRegion: 'coral-coast',
    locationName: 'Kulukulu, Sigatoka',
    coordinates: { x: 36, y: 74, lat: -18.165, lng: 177.495 },
    description: 'Fiji\'s first National Park and a UNESCO tentative world heritage site. Parabolic sand dunes towering up to 60 meters high holding 2,600-year-old Lapita archaeological pottery fragments and mahogany forest trails.',
    image: HERO_IMAGE,
    priceLevel: '$',
    priceEstimate: 'FJD $15 entry fee',
    rating: 4.7,
    reviewsCount: 580,
    features: ['Lapita Archaeological Site', 'Panoramic Ocean Vistas', 'Two Marked Walking Loops (1hr & 2hr)', 'Visitor Center'],
    bestTimeToVisit: '7:30 AM - 10:00 AM to avoid hot sand under midday sun',
    accessibilityNotes: 'Visitor center has parking; dunes require walking on soft sand'
  },
  {
    id: 'attr-4',
    name: 'Garden of the Sleeping Giant',
    category: 'attractions',
    subType: 'Parks',
    islandRegion: 'viti-levu-west',
    locationName: 'Sabeto Valley, Nadi',
    coordinates: { x: 34, y: 48, lat: -17.701, lng: 177.495 },
    description: 'Nestled in the shadows of the Sleeping Giant mountain ridge, this 20-hectare paradise was originally founded by actor Raymond Burr. Showcases over 2,000 species of exotic Asian orchids, Cattleya hybrids, lily ponds, and boardwalks through native rainforest.',
    image: VILLAGE_IMAGE,
    priceLevel: '$$',
    priceEstimate: 'FJD $25 adult / FJD $12.50 child (includes iced tropical punch)',
    rating: 4.8,
    reviewsCount: 890,
    features: ['Over 2,000 Orchid Varieties', 'Native Rainforest Canopy Walkway', 'Complimentary Fruit Juice', 'Sabeto Mountain Backdrop'],
    hours: '9:00 AM - 5:00 PM Daily'
  },
  {
    id: 'attr-5',
    name: 'Sri Siva Subramaniya Swami Temple',
    category: 'attractions',
    subType: 'Cultural Locations',
    islandRegion: 'viti-levu-west',
    locationName: 'Southern End, Nadi Town',
    coordinates: { x: 31, y: 56, lat: -17.808, lng: 177.417 },
    description: 'The largest Hindu temple in the Southern Hemisphere. Features vibrant Dravidian gopuram towers hand-carved and painted by master temple artisans from South India, dedicated to Lord Murugan.',
    image: CULTURE_IMAGE,
    priceLevel: '$',
    priceEstimate: 'FJD $5 entry fee (includes sarong loan)',
    rating: 4.6,
    reviewsCount: 740,
    features: ['Dravidian Temple Architecture', 'Intricate Ceiling Murals', 'Photography in Courtyards'],
    visitorGuidelines: [
      'Remove shoes at entrance gate',
      'Shoulders and knees must be covered (sarongs provided)',
      'No photography permitted inside the sanctum inner shrines',
      'Vegetarian and alcohol-free mindset required on temple grounds'
    ]
  },
  {
    id: 'attr-6',
    name: 'Levuka Historical Port (UNESCO World Heritage Site)',
    category: 'attractions',
    subType: 'Historical Sites',
    islandRegion: 'kadavu-outer',
    locationName: 'Ovalau Island, Lomaiviti',
    coordinates: { x: 76, y: 55, lat: -17.683, lng: 178.833 },
    description: 'Fiji\'s 19th-century colonial capital and a rare surviving Pacific maritime port town. Preserves timber shopfronts along Beach Street, the 1874 Deed of Cession stone monument, and Sacred Heart Church.',
    image: HERO_IMAGE,
    priceLevel: 'Free',
    rating: 4.8,
    reviewsCount: 220,
    features: ['UNESCO World Heritage', '19th-Century Timber Architecture', 'Deed of Cession Stone', 'Community Museum']
  }
];

export const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: 'act-1',
    name: 'Shark Reef Marine Reserve Scuba Diving (Beqa Lagoon)',
    category: 'activities',
    subType: 'Diving',
    islandRegion: 'coral-coast',
    locationName: 'Pacific Harbour, Coral Coast',
    coordinates: { x: 56, y: 76, lat: -18.235, lng: 178.078 },
    description: 'The world-famous cage-free bull shark dive in a protected marine sanctuary. Certified divers witness up to eight species of sharks, including massive bull sharks, tiger sharks, nurse sharks, and hundreds of giant trevally in crystal visibility.',
    image: REEF_IMAGE,
    duration: 'Full Day (2 Dives)',
    fitnessLevel: 'Moderate',
    equipmentProvided: true,
    priceLevel: '$$$$',
    priceEstimate: 'FJD $420 - $550 (Includes marine park conservation levy)',
    rating: 5.0,
    reviewsCount: 840,
    contact: {
      phone: '+679 345 0048',
      email: 'dive@fijisharkdive.com',
      website: 'fijisharkdive.com'
    },
    features: ['PADI Dive Center', 'Shark Conservation Certified', 'High Marine Sanctuary Diversity']
  },
  {
    id: 'act-2',
    name: 'Cloudbreak World-Class Surf Charter',
    category: 'activities',
    subType: 'Surfing',
    islandRegion: 'mamanucas-yasawas',
    locationName: 'Tavarua Barrier Reef, Mamanucas',
    coordinates: { x: 22, y: 56, lat: -17.854, lng: 177.202 },
    description: 'Ride the world\'s most legendary left-hand reef break. Boat charters depart daily from Port Denarau and Namotu/Tavarua with professional surf guides assessing tide, wind, and swell conditions.',
    image: REEF_IMAGE,
    duration: 'Half Day (4 - 5 Hours)',
    fitnessLevel: 'Challenging',
    equipmentProvided: false,
    priceLevel: '$$$',
    priceEstimate: 'FJD $190 - $280 boat charter',
    rating: 4.9,
    reviewsCount: 310,
    contact: {
      phone: '+679 675 0888',
      email: 'surffiji@oceanadventures.com'
    },
    features: ['Advanced Surfers', 'Live Surf Forecasting', 'Rescue Boat on Standby']
  },
  {
    id: 'act-3',
    name: 'Sigatoka River Safari & Traditional Village Immersion',
    category: 'activities',
    subType: 'Adventure Activities',
    islandRegion: 'coral-coast',
    locationName: 'Sigatoka Valley ("The Salad Bowl")',
    coordinates: { x: 40, y: 72, lat: -18.120, lng: 177.530 },
    description: 'Cruise deep into the interior of Viti Levu aboard custom safari jet boats. Visit an authentic non-commercial village, take part in an ancient kava welcoming sevusevu ceremony, and dance the traditional meke.',
    image: CULTURE_IMAGE,
    duration: 'Half Day (4.5 Hours)',
    fitnessLevel: 'Easy',
    equipmentProvided: true,
    priceLevel: '$$$',
    priceEstimate: 'FJD $295 adult / FJD $150 child',
    rating: 4.9,
    reviewsCount: 1680,
    contact: {
      phone: '+679 650 1721',
      website: 'sigatokariver.com'
    },
    features: ['Custom Jet Boats with 360 Spins', 'Genuine Village Host Rotation', 'Traditional Fijian Feast Included']
  },
  {
    id: 'act-4',
    name: 'Lavena Coastal Walk & Secret Waterfall Swim',
    category: 'activities',
    subType: 'Hiking',
    islandRegion: 'taveuni',
    locationName: 'Lavena Point, Taveuni Island',
    coordinates: { x: 93, y: 29, lat: -16.885, lng: 179.940 },
    description: 'Breathtaking 5km coastal trail hugging volcanic black sand and white sand beaches, crossing suspension bridges, and ending with a refreshing swim up a dramatic gorge between twin waterfalls.',
    image: VILLAGE_IMAGE,
    duration: '3.5 - 4 Hours',
    fitnessLevel: 'Moderate',
    equipmentProvided: false,
    priceLevel: '$',
    priceEstimate: 'FJD $35 trail pass (Lavena Village Eco-Project)',
    rating: 4.9,
    reviewsCount: 520,
    contact: {
      phone: '+679 888 0033',
      address: 'Lavena Community Lodge, Taveuni'
    },
    features: ['Scenic Suspension Bridge', 'Volcanic Black & White Beaches', 'Secret Canyon Swim', 'Community-Owned Trail']
  },
  {
    id: 'act-5',
    name: 'Tivua Island Day Sailing Cruise & Coral Planting',
    category: 'activities',
    subType: 'Sailing',
    islandRegion: 'mamanucas-yasawas',
    locationName: 'Tivua Island, Mamanucas',
    coordinates: { x: 26, y: 48, lat: -17.600, lng: 177.360 },
    description: 'Set sail on the historic tall ship "Ra Marama" or luxury catamaran to private Tivua Island. Includes guided glass-bottom boat tour, coral propagation nursery, kayaking, buffet lunch, and kava ceremony.',
    image: HERO_IMAGE,
    duration: '7 Hours (10:00 AM - 5:00 PM)',
    fitnessLevel: 'Easy',
    equipmentProvided: true,
    priceLevel: '$$$',
    priceEstimate: 'FJD $249 adult / FJD $139 child',
    rating: 4.8,
    reviewsCount: 1240,
    contact: {
      phone: '+679 670 1200',
      website: 'captaincookcruisesfiji.com'
    },
    features: ['Tall Ship Sailing Experience', 'Coral Nursery Guided Tour', 'Free Hotel Coach Pickup', 'Kids Captain Club']
  }
];

export const EVENTS_DATA: EventItem[] = [
  {
    id: 'event-1',
    name: 'Denarau Sunset Polynesian Fire & Meke Night',
    category: 'events',
    subType: 'Cultural Events',
    islandRegion: 'viti-levu-west',
    locationName: 'Port Denarau Waterfront Stage',
    coordinates: { x: 28, y: 56, lat: -17.771, lng: 177.378 },
    description: 'Weekly spectacular cultural performance featuring authentic warrior meke war dances, fire knife spinning, harmony singing by choir troupes, and artisan coconut weaving demonstrations.',
    image: CULTURE_IMAGE,
    datePeriod: 'today',
    dateDisplay: 'Tonight · 6:30 PM - 8:30 PM',
    venue: 'Marina Amphitheatre, Port Denarau',
    admission: 'Free Admission (Open Seating)',
    contact: {
      phone: '+679 675 0600',
      address: 'Port Denarau Marina'
    }
  },
  {
    id: 'event-2',
    name: 'Suva Foreshore Street Food & Night Market',
    category: 'events',
    subType: 'Food Events',
    islandRegion: 'suva-east',
    locationName: 'Suva Seafront Promenade',
    coordinates: { x: 67, y: 72, lat: -18.140, lng: 178.430 },
    description: 'Vibrant outdoor culinary gathering with over 40 stalls serving piping hot Kokoda, Lovo pork buns, lamb palau, rotis, freshly pressed sugarcane juice, and live acoustic music by local indie bands.',
    image: DINING_IMAGE,
    datePeriod: 'weekend',
    dateDisplay: 'This Friday & Saturday · 5:00 PM - 10:00 PM',
    venue: 'My Suva Picnic Park & Seafront',
    admission: 'Free Entry · Food $5 - $15',
    contact: {
      address: 'Queen Elizabeth Drive, Suva'
    }
  },
  {
    id: 'event-3',
    name: 'Fiji Coral Coast 7s Rugby International Tournament',
    category: 'events',
    subType: 'Sports',
    islandRegion: 'coral-coast',
    locationName: 'Lawaqa Park, Sigatoka',
    coordinates: { x: 38, y: 73, lat: -18.150, lng: 177.510 },
    description: 'The rugby capital of Fiji comes alive! Experience the world-renowned high-octane 7s rugby featuring Olympic champions, international invitational teams, and electrifying crowd anthems.',
    image: HERO_IMAGE,
    datePeriod: 'month',
    dateDisplay: 'October 15 - 18 · Full Day Matches',
    venue: 'Lawaqa Park Stadium, Sigatoka',
    admission: 'FJD $15 Embankment / FJD $30 Grandstand',
    contact: {
      website: 'fijicoralcoast7s.com'
    }
  },
  {
    id: 'event-4',
    name: 'Hibiscus Festival Suva (Mother of All Festivals)',
    category: 'events',
    subType: 'Festivals',
    islandRegion: 'suva-east',
    locationName: 'Albert Park & Civic Centre, Suva',
    coordinates: { x: 68, y: 72, lat: -18.144, lng: 178.425 },
    description: 'Fiji\'s premier national carnival celebrating Pacific arts, cultural queen pageants, traditional marching bands, carnival rides, handicraft expos, and evening headline concerts.',
    image: CULTURE_IMAGE,
    datePeriod: 'upcoming',
    dateDisplay: 'Annual Festival Week',
    venue: 'Albert Park, Suva City',
    admission: 'Free Entry to Park Grounds',
    contact: {
      website: 'hibiscusfestival.com.fj'
    }
  },
  {
    id: 'event-5',
    name: 'Musket Cove Fiji Regatta Week & Yacht Race',
    category: 'events',
    subType: 'Sports',
    islandRegion: 'mamanucas-yasawas',
    locationName: 'Malolo Lailai Island',
    coordinates: { x: 24, y: 53, lat: -17.769, lng: 177.195 },
    description: 'The South Pacific\'s premier international sailing celebration. Brings together cruising yachts and catamarans from across the globe for island races, pirate-themed beach parties, and hog roasts.',
    image: REEF_IMAGE,
    datePeriod: 'month',
    dateDisplay: 'Mid-Month Regatta Week',
    venue: 'Musket Cove Island Resort & Marina',
    admission: 'Spectator Free / Boat Regatta Entry Fee Applies',
    contact: {
      website: 'musketcovefiji.com/regatta'
    }
  },
  {
    id: 'event-6',
    name: 'Bula Festival Nadi',
    category: 'events',
    subType: 'Festivals',
    islandRegion: 'viti-levu-west',
    locationName: 'Prince Charles Park, Nadi',
    coordinates: { x: 32, y: 55, lat: -17.795, lng: 177.420 },
    description: 'Week-long celebration in Nadi raising funds for local charities. Showcases Miss Bula pageants, agricultural shows, food alleys, and traditional Fijian and Indian cultural dance routines.',
    image: VILLAGE_IMAGE,
    datePeriod: 'upcoming',
    dateDisplay: 'Coming Next Month',
    venue: 'Prince Charles Park, Nadi Town',
    admission: 'FJD $5 Adults / FJD $2 Children',
    contact: {
      address: 'Prince Charles Park, Nadi'
    }
  }
];

export const VILLAGES_DIRECTORY: VillageItem[] = [
  {
    id: 'vil-1',
    name: 'Navala Village',
    category: 'village',
    subType: 'Village',
    islandRegion: 'viti-levu-west',
    province: 'Ba Province, Viti Levu Highlands',
    locationName: 'Ba River Valley, Nausori Highlands',
    coordinates: { x: 42, y: 44, lat: -17.653, lng: 177.671 },
    description: 'The iconic jewel of traditional Pacific architecture. Navala is the only village in Fiji where every single resident (over 800 villagers) still lives in authentic hand-thatched bures built with bamboo walls, timber framing, and wild mountain reed roofs.',
    image: VILLAGE_IMAGE,
    history: 'Founded over 200 years ago when four mountain clans united to protect their culture and maintain their ancestral way of life. The village council has consistently voted against concrete buildings in order to preserve their ancient heritage.',
    culturalSignificance: 'Living repository of iTaukei architectural knowledge and communal sharing (solesolevaki). Recognized by the Fiji Museum and international historians as a Pacific cultural treasure.',
    chiefProtocol: 'Head of village is the Turaga ni Yavusa (Chief). Every visitor must first be presented to the village hall by a designated local guide.',
    sevusevuGuide: {
      yaqonaRequirement: 'Bundle of dry Waka (kava root), minimum 0.5kg to 1kg purchased from the Ba or Nadi market (approx FJD $30 - $50).',
      presentationSteps: [
        'Arrive accompanied by your village guide or host.',
        'Enter the chief\'s bure or community hall quietly, removing footwear outside.',
        'Sit cross-legged on the voivoi woven mats (never point feet towards the chief or elders).',
        'Your guide will present the Waka roots with formal Fijian oratory, explaining your identity and peaceable intentions.',
        'The chief or village elder will accept with ceremonial clapping (cobo) and welcome you as family (taukei).'
      ],
      respectRules: [
        'DO NOT wear hats or sunglasses inside the village boundaries (an ancient taboo showing respect to chiefs).',
        'DO NOT wear sleeveless tops, tank tops, or short shorts. Both men and women must wear a sulu (sarong) covering the knees.',
        'DO NOT carry bags slung over the shoulder (carry by hand).',
        'NEVER touch anyone on the head, as the head is considered sacred (tabu).',
        'Always ask permission before photographing children, homes, or elders.'
      ]
    },
    visitorGuidelines: [
      'Advance notice recommended via Nadi tour desk or village liaison.',
      'Entry contribution fee: FJD $35 per person (goes towards village water supply, school funds, and bure maintenance).',
      'Sunday is sacred: Church services are held in the morning; quiet reverence is observed throughout the day.'
    ],
    experiences: [
      'Authentic Thatched Bure Homestay with Host Family',
      'Evening Kava Talanoa (Storytelling & Acoustic Singing)',
      'Swim in the pristine freshwater Ba River',
      'Wild reed harvesting and roof weaving demonstrations',
      'Traditional Lovo feast cooked beneath hot river stones'
    ],
    contact: {
      phone: '+679 834 1928',
      email: 'navala.ecotourism@gmail.com',
      address: 'Navala Village, Ba River Valley'
    },
    priceLevel: '$'
  },
  {
    id: 'vil-2',
    name: 'Viseisei Village',
    category: 'village',
    subType: 'Village',
    islandRegion: 'viti-levu-west',
    province: 'Ba Province (Vuda Point)',
    locationName: 'Vuda Point, between Nadi and Lautoka',
    coordinates: { x: 30, y: 50, lat: -17.698, lng: 177.399 },
    description: 'Believed in oral history to be the very first settlement founded in Fiji by Chief Lutunasobasoba and his voyaging canoes after sailing across the Pacific thousands of years ago.',
    image: CULTURE_IMAGE,
    history: 'The ancestral landing site of the indigenous Fijian people. Home to the high chiefs of the Vuda confederacy, including several past Presidents and Prime Ministers of Fiji.',
    culturalSignificance: 'Regarded as the "Cradle of Fiji". Houses a royal monument, historic Methodist church, and handcraft artisan women\'s cooperative.',
    chiefProtocol: 'Respectful entrance through the visitor reception. The village chief\'s residence faces the sacred central green (rara).',
    sevusevuGuide: {
      yaqonaRequirement: 'Waka bundle (0.5kg) or standard cultural donation at the visitor greeting post.',
      presentationSteps: [
        'Check in at the Viseisei Community Craft Center at the entrance.',
        'Participate in the brief welcoming blessing before strolling through the village lanes.',
        'Respect the sacred grassy rara in front of the chief\'s residence.'
      ],
      respectRules: [
        'Sulu required below knees.',
        'Remove hats and sunglasses upon entering the village gate.',
        'Modest attire covering shoulders.'
      ]
    },
    visitorGuidelines: [
      'Accessible by taxi or bus along Queens Road (15 mins from Nadi Airport).',
      'Local women\'s craft market at entrance sells genuine tapa cloth and woven baskets.'
    ],
    experiences: [
      'Guided historical walking tour through ancestral sites',
      'Handmade Voivoi weaving workshop with village artisans',
      'Visit the historic 19th-century Methodist stone church'
    ],
    contact: {
      phone: '+679 666 8211',
      address: 'Viseisei Village, Vuda Point Road'
    },
    priceLevel: '$'
  },
  {
    id: 'vil-3',
    name: 'Nakabuta Pottery Village',
    category: 'village',
    subType: 'Village',
    islandRegion: 'coral-coast',
    province: 'Nadroga-Navosa Province',
    locationName: 'Sigatoka Valley ("The Salad Bowl")',
    coordinates: { x: 39, y: 71, lat: -18.080, lng: 177.520 },
    description: 'Renowned throughout the South Pacific for keeping alive the 3,000-year-old Lapita ceramic pottery techniques, using clay dug from the banks of the Sigatoka River and glazed with natural tree resin.',
    image: VILLAGE_IMAGE,
    history: 'Descendants of ancient Lapita voyagers who have preserved earthen pit firing without modern pottery wheels for millennia.',
    culturalSignificance: 'Only a few villages in Fiji still possess the spiritual and technical knowledge to fire Lapita cooking pots, bowls, and kava water vessels (dari).',
    chiefProtocol: 'Turaga ni Koro welcome ceremony followed by demonstration in the open community bure.',
    sevusevuGuide: {
      yaqonaRequirement: 'Yaqona waka root or participation in the Sigatoka Valley safari itinerary.',
      presentationSteps: [
        'Welcome song by village matriarchs.',
        'Short sevusevu ceremony and shared coconut shell of kava.',
        'Hands-on clay molding demonstration.'
      ],
      respectRules: [
        'Cover shoulders and knees with sulu.',
        'Shoes off inside the demonstration bure.'
      ]
    },
    visitorGuidelines: [
      'Pottery items can be purchased directly from the artisan women.',
      'Cash preferred for handicrafts.'
    ],
    experiences: [
      'Live clay molding & natural resin sealing demonstration',
      'Traditional singing and meke performance',
      'Village kindergarten visit and school donation opportunities'
    ],
    contact: {
      phone: '+679 650 0988',
      address: 'Sigatoka Valley Road, Nadroga'
    },
    priceLevel: '$'
  },
  {
    id: 'vil-4',
    name: 'Silana Village & Dolphin Sanctuary',
    category: 'village',
    subType: 'Village',
    islandRegion: 'suva-east',
    province: 'Tailevu Province',
    locationName: 'Dawasamu, Tailevu North Coast',
    coordinates: { x: 73, y: 52, lat: -17.610, lng: 178.580 },
    description: 'Tranquil coastal eco-village pioneering marine conservation. Custodians of sacred Moon Reef (Makutu), where a resident pod of over 100 playful spinner dolphins gathers daily inside the reef lagoon.',
    image: REEF_IMAGE,
    history: 'A proud fishing community that self-imposed a marine protected tabu zone to protect the sacred spinner dolphin breeding waters and rebuild coral fisheries.',
    culturalSignificance: 'The dolphins are deeply connected to village lineage and ancestral totems. The community runs homestays that fund the village scholarship fund.',
    chiefProtocol: 'Formal sevusevu presented in the central village hall prior to boarding the community boat.',
    sevusevuGuide: {
      yaqonaRequirement: 'Bundle of waka root (0.5kg) given to the village Turaga ni Koro.',
      presentationSteps: [
        'Warm greeting by village elders.',
        'Sevusevu blessing in the hall.',
        'Explanation of marine protected tabu rules.'
      ],
      respectRules: [
        'No sunscreens containing oxybenzone before entering dolphin waters.',
        'Respect quiet hours after 9 PM in the village.'
      ]
    },
    visitorGuidelines: [
      'Homestays include all 3 meals prepared with fresh coconut milk and garden root crops.',
      'Dolphin boat departs at 8:30 AM when waters are glassy.'
    ],
    experiences: [
      'Boat safari to watch acrobatic spinner dolphins at Moon Reef',
      'Snorkeling the protected coral garden reserve',
      'Village cooking class: learn how to scrape fresh coconut and prepare Kokoda'
    ],
    contact: {
      phone: '+679 932 4589',
      website: 'silanaecotourism.com'
    },
    priceLevel: '$$'
  },
  {
    id: 'vil-5',
    name: 'Somosomo Village',
    category: 'village',
    subType: 'Village',
    islandRegion: 'taveuni',
    province: 'Cakaudrove Province, Taveuni',
    locationName: 'Somosomo Strait, Taveuni Island',
    coordinates: { x: 87, y: 31, lat: -16.780, lng: 179.970 },
    description: 'The royal seat of the Tui Cakau, one of Fiji\'s three highest paramount chiefs. Located along the scenic Somosomo Strait right near the 180-degree International Date Line meridian.',
    image: CULTURE_IMAGE,
    history: 'Capital of the ancient Tovata confederacy. Highly influential in the shaping of modern Fiji and the arrival of early Christian missionaries.',
    culturalSignificance: 'Epicenter of Cakaudrove culture, famous for distinctive meke choreography, royal protocols, and traditional mats.',
    chiefProtocol: 'Strict ceremonial respect: only accredited visitors accompanied by a local elder may approach the paramount chief\'s compound.',
    sevusevuGuide: {
      yaqonaRequirement: 'High-grade waka kava root bundle (1kg).',
      presentationSteps: [
        'Arranged through Taveuni local council liaison.',
        'High ceremonial respect observed.'
      ],
      respectRules: [
        'Never wear hats, caps, or umbrellas in the village.',
        'Absolute quiet in proximity to the royal residence.'
      ]
    },
    visitorGuidelines: [
      'Can be visited in combination with the 180-degree Meridian Date Line monument.',
      'Sunday church service at Somosomo Methodist Church features world-class 4-part choir harmonies.'
    ],
    experiences: [
      'Visit the International Date Line Meridian marker (stand in both yesterday and today)',
      'Experience the Sunday choral singing at the historic village church',
      'View traditional hand-carved outrigger canoes'
    ],
    contact: {
      phone: '+679 888 0122',
      address: 'Somosomo, Taveuni Island'
    },
    priceLevel: '$'
  }
];

export const ESSENTIAL_SERVICES: EssentialServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Lautoka Hospital (Major Western Referral Center)',
    category: 'service',
    subType: 'Hospital',
    islandRegion: 'viti-levu-west',
    locationName: 'Lautoka City',
    coordinates: { x: 31, y: 47, lat: -17.616, lng: 177.452 },
    description: '24-hour emergency department, modern hyperbaric decompression chamber (for diving emergencies), intensive care unit, and specialist medical care.',
    contact: { phone: '+679 666 0399', address: 'Hospital Road, Lautoka' },
    emergencyNumber: '911'
  },
  {
    id: 'srv-2',
    name: 'Colonial War Memorial Hospital (CWM Suva)',
    category: 'service',
    subType: 'Hospital',
    islandRegion: 'suva-east',
    locationName: 'Waimanu Road, Suva',
    coordinates: { x: 67, y: 71, lat: -18.130, lng: 178.435 },
    description: 'Fiji\'s largest tertiary public hospital with comprehensive 24/7 trauma emergency, surgery, pediatrics, and diagnostic facilities.',
    contact: { phone: '+679 331 3444', address: 'Waimanu Road, Suva' },
    emergencyNumber: '911'
  },
  {
    id: 'srv-3',
    name: 'Nadi Police Station & Tourist Police Unit',
    category: 'service',
    subType: 'Police',
    islandRegion: 'viti-levu-west',
    locationName: 'Hospital Road, Nadi Town',
    coordinates: { x: 32, y: 55, lat: -17.798, lng: 177.419 },
    description: '24/7 Police station with a dedicated Tourist Police officer desk assisting visitors with reporting, travel safety, lost passports, and general security.',
    contact: { phone: '+679 670 0222', address: 'Hospital Road, Nadi' },
    emergencyNumber: '917'
  },
  {
    id: 'srv-4',
    name: 'TotalEnergies Service Station & 24hr ATM Mart',
    category: 'service',
    subType: 'Fuel Station',
    islandRegion: 'viti-levu-west',
    locationName: 'Queens Road, Namaka, Nadi',
    coordinates: { x: 32, y: 52, lat: -17.760, lng: 177.435 },
    description: 'Full-service fuel station, clean restrooms, BSP and ANZ multi-currency ATMs, tire inflation, and convenience store with cold drinks and snacks.',
    contact: { phone: '+679 672 3111', address: 'Queens Road, Namaka' },
    hours: 'Open 24 Hours / 7 Days'
  },
  {
    id: 'srv-5',
    name: 'BSP & ANZ Bank & Currency Exchange',
    category: 'service',
    subType: 'Bank / ATM',
    islandRegion: 'viti-levu-west',
    locationName: 'Port Denarau Commercial Center',
    coordinates: { x: 28, y: 56, lat: -17.771, lng: 177.378 },
    description: 'Foreign currency exchange, Visa/Mastercard cash advance, 24/7 ATMs supporting international cards, and Western Union transfers.',
    contact: { phone: '+679 132 888', address: 'Port Denarau Marina' },
    hours: '8:30 AM - 4:00 PM Mon-Fri (ATMs 24/7)'
  },
  {
    id: 'srv-6',
    name: 'Savusavu Cottage Hospital & Medical Center',
    category: 'service',
    subType: 'Hospital',
    islandRegion: 'vanua-levu',
    locationName: 'Savusavu, Vanua Levu',
    coordinates: { x: 74, y: 35, lat: -16.780, lng: 179.330 },
    description: 'Outpatient clinic, emergency stabilization, doctor consultations, and pharmacy serving the Savusavu Bay region.',
    contact: { phone: '+679 885 0444', address: 'Main Street, Savusavu' },
    emergencyNumber: '911'
  }
];

export const FIJIAN_PHRASES: PhraseItem[] = [
  {
    fijian: 'Bula / Bula Vinaka',
    english: 'Hello / Warm Welcome / Good Health',
    phonetic: 'Boo-lah Vee-nah-kah',
    context: 'The universal warm Fijian greeting used everywhere you go.',
    category: 'Greetings'
  },
  {
    fijian: 'Vinaka / Vinaka Vakalevu',
    english: 'Thank you / Thank you very much',
    phonetic: 'Vee-nah-kah Vah-kah-leh-voo',
    context: 'Essential polite expression to say thank you for any service or kindness.',
    category: 'Respect & Etiquette'
  },
  {
    fijian: 'Moce',
    english: 'Goodbye / Good night',
    phonetic: 'Moh-they ("c" sounds like "th" in "the")',
    context: 'Said when parting ways or retiring to sleep.',
    category: 'Greetings'
  },
  {
    fijian: 'Kerekere',
    english: 'Please',
    phonetic: 'Keh-reh-keh-reh',
    context: 'Add after any request to demonstrate respectful manners.',
    category: 'Respect & Etiquette'
  },
  {
    fijian: 'Yadra / Yadra Vinaka',
    english: 'Good morning',
    phonetic: 'Yan-drah Vee-nah-kah ("d" has a gentle "n" before it)',
    context: 'Traditional morning greeting from sunrise until mid-morning.',
    category: 'Greetings'
  },
  {
    fijian: 'Tulou',
    english: 'Excuse me / Pardon',
    phonetic: 'Too-low',
    context: 'Crucial word whispered when passing in front of someone or walking through a village.',
    category: 'Respect & Etiquette'
  },
  {
    fijian: 'Io / Sega',
    english: 'Yes / No',
    phonetic: 'Ee-oh / Seh-ngah ("g" sounds like "ng" in "sing")',
    context: 'Basic affirmation or polite decline.',
    category: 'Dining & Village'
  },
  {
    fijian: 'Kana Vinaka',
    english: 'Delicious food / Enjoy your meal',
    phonetic: 'Kah-nah Vee-nah-kah',
    context: 'Compliment given to the cook after enjoying a home-cooked dish or feast.',
    category: 'Dining & Village'
  },
  {
    fijian: 'Sota Tale',
    english: 'See you again soon',
    phonetic: 'Soh-tah Tah-leh',
    context: 'Warm farewell to friends or hosts.',
    category: 'Greetings'
  },
  {
    fijian: 'Malo rogo',
    english: 'How is it going? / What\'s the news?',
    phonetic: 'Mah-loh Roh-ngoh',
    context: 'Friendly informal inquiry between locals.',
    category: 'Getting Around'
  },
  {
    fijian: 'Vanuinui vinaka e nomu gade',
    english: 'Have a wonderful vacation / Safe travels',
    phonetic: 'Vah-noo-ee-noo-ee vee-nah-kah eh noh-moo ngah-deh',
    context: 'Well-wishes spoken to arriving or departing travelers.',
    category: 'Getting Around'
  },
  {
    fijian: 'Kaise Baat / Namaste',
    english: 'Hello / How are you? (Fiji Hindi)',
    phonetic: 'Kye-say Baht / Nah-mah-stay',
    context: 'Widely used greeting in Indo-Fijian businesses, shops, and taxis.',
    category: 'Fiji Hindi'
  },
  {
    fijian: 'Dhanyavaad / Bahut Accha',
    english: 'Thank you / Very Good (Fiji Hindi)',
    phonetic: 'Dhan-yah-vahd / Bah-hoot Ah-chah',
    context: 'Commonly spoken in markets, cafes, and curry houses.',
    category: 'Fiji Hindi'
  }
];

export const ALL_LISTINGS: ListingItem[] = [
  ...ACCOMMODATIONS,
  ...FOOD_ITEMS,
  ...TRANSPORT_ITEMS,
  ...ATTRACTION_ITEMS,
  ...ACTIVITY_ITEMS,
  ...EVENTS_DATA,
  ...VILLAGES_DIRECTORY,
  ...ESSENTIAL_SERVICES
];
