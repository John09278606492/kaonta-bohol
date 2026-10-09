export type Language = 'en' | 'ceb';

export interface Translations {
  // Navigation
  navHome: string;
  navExplore: string;
  navPasalubong: string;
  navAbout: string;
  navListBusiness: string;
  navNearby: string;
  navLiveNearby: string;
  navSimulating: string;
  navMap: string;

  // Roles & Auth
  roleVisitor: string;
  roleOwner: string;
  roleAdmin: string;
  roleSwitcher: string;
  publicMode: string;
  adminDashboard: string;
  ownerDashboard: string;
  signIn: string;
  signOut: string;

  // Home Page
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  homeSearchPlaceholder: string;
  homeAllBohol: string;
  homeSearchBtn: string;
  homePopularDelicacies: string;
  homeEnableLiveNearby: string;
  homeLiveNearbyActive: string;
  homeOpenMapView: string;
  homeBrowseCategory: string;
  homeSeeAll: string;
  homePopularPlaces: string;
  homePopularPlacesSub: string;
  homeExploreOnMap: string;
  homeViewMenu: string;
  homeBrowseByTown: string;
  homeAllTowns: string;

  // Hero backgrounds subtitles
  bgSeafoodSub: string;
  bgNativeSub: string;
  bgCalamaySub: string;
  bgSinuglawSub: string;

  // Explore Page
  exploreSearchPlaceholder: string;
  exploreRadius: string;
  explorePause: string;
  exploreResume: string;
  exploreRefresh: string;
  exploreAllTowns: string;
  exploreAllCategories: string;
  explorePasalubongOnly: string;
  exploreSortDistance: string;
  exploreSortName: string;
  exploreGettingLocation: string;
  explorePaused: string;
  exploreActive: string;
  exploreAccuracyLow: string;
  exploreDenied: string;
  exploreNoResults: string;
  exploreNoResultsSub: string;

  // Business Details Page
  bizBackToListings: string;
  bizBranches: string;
  bizSelectBranch: string;
  bizMainBranch: string;
  bizMenuOfferings: string;
  bizTabAll: string;
  bizTabFood: string;
  bizTabPasalubong: string;
  bizAvailableAt: string;
  bizInStock: string;
  bizSeasonal: string;
  bizCheckStock: string;
  bizDirections: string;
  bizShare: string;
  bizReport: string;
  bizCopied: string;
  bizOfflineCached: string;
  bizOfflineBanner: string;
  bizLoading: string;
  bizNotFound: string;

  // Pasalubong Page
  pasalubongTitle: string;
  pasalubongSub: string;
  pasalubongSearchPlaceholder: string;
  pasalubongPriceAll: string;
  pasalubongUnder100: string;
  pasalubongUnder300: string;
  pasalubongUnder500: string;

  // Search Results Page
  searchTitle: string;
  searchSub: string;

  // About Page
  aboutTitle: string;
  aboutSub: string;

  // Offline Drawer
  offlineMode: string;
  offlineSavedCount: string;
  offlineDrawerTitle: string;
  offlineDrawerSub: string;
  offlineContinue: string;

  // Common
  loading: string;
  distanceKm: string;
  verified: string;
  sample: string;
  priceNotProvided: string;
  languageLabel: string;
}

export type TranslationKey = keyof Translations;

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    navHome: 'Home',
    navExplore: 'Explore',
    navPasalubong: 'Pasalubong',
    navAbout: 'About',
    navListBusiness: 'List a Business',
    navNearby: 'Nearby',
    navLiveNearby: 'Live Nearby',
    navSimulating: 'Simulating',
    navMap: 'Map',

    // Roles & Auth
    roleVisitor: 'Visitor',
    roleOwner: 'Owner',
    roleAdmin: 'Admin',
    roleSwitcher: 'Role Switcher',
    publicMode: 'Public mode',
    adminDashboard: 'Admin Dashboard',
    ownerDashboard: 'Owner Dashboard',
    signIn: 'Sign In',
    signOut: 'Sign Out',

    // Home Page
    homeHeroTitle: 'Discover Bohol Eats.',
    homeHeroSubtitle: 'Explore local kitchens, coastal seafood, and authentic delicacies right around you.',
    homeSearchPlaceholder: 'What would you like to eat or bring home?',
    homeAllBohol: 'All Bohol',
    homeSearchBtn: 'Search',
    homePopularDelicacies: 'Popular Delicacies:',
    homeEnableLiveNearby: 'Enable Live Nearby',
    homeLiveNearbyActive: 'Live Nearby Active',
    homeOpenMapView: 'Open Map View',
    homeBrowseCategory: 'Browse by Category',
    homeSeeAll: 'See all',
    homePopularPlaces: 'Popular Places & Treats',
    homePopularPlacesSub: 'Approved food spots and delicacies across Bohol',
    homeExploreOnMap: 'Explore on map',
    homeViewMenu: 'View Menu →',
    homeBrowseByTown: 'Browse by Town',
    homeAllTowns: 'All Towns',

    // Hero background subtitles
    bgSeafoodSub: 'Fresh grilled squid, prawns, & catch of the day on banana leaves',
    bgNativeSub: 'Rich coconut chicken broth, carinderia favorites & island stews',
    bgCalamaySub: 'Sticky sweet coconut Calamay in polished shells & Peanut Kisses',
    bgSinuglawSub: 'Charcoal-grilled pork belly with fresh tuna ceviche and local spices',

    // Explore Page
    exploreSearchPlaceholder: 'Search dish or eatery...',
    exploreRadius: 'Radius:',
    explorePause: 'Pause',
    exploreResume: 'Resume',
    exploreRefresh: 'Refresh',
    exploreAllTowns: 'All Municipalities',
    exploreAllCategories: 'All Categories',
    explorePasalubongOnly: 'Pasalubong Only',
    exploreSortDistance: 'Closest First',
    exploreSortName: 'Alphabetical',
    exploreGettingLocation: 'Getting your location...',
    explorePaused: 'Updates paused',
    exploreActive: 'Live Nearby active',
    exploreAccuracyLow: 'Location accuracy low',
    exploreDenied: 'Location permission denied',
    exploreNoResults: 'No establishments found in this radius',
    exploreNoResultsSub: 'Try expanding the search radius or adjusting your filters.',

    // Business Details Page
    bizBackToListings: 'Back to Nearby Listings',
    bizBranches: 'Branches',
    bizSelectBranch: 'Select branch',
    bizMainBranch: 'Main',
    bizMenuOfferings: 'Menu & Offerings',
    bizTabAll: 'All Items',
    bizTabFood: 'Dishes & Drinks',
    bizTabPasalubong: 'Pasalubong',
    bizAvailableAt: 'Available at:',
    bizInStock: 'In Stock',
    bizSeasonal: 'Seasonal',
    bizCheckStock: 'Call to check',
    bizDirections: 'Get Directions',
    bizShare: 'Share',
    bizReport: 'Report',
    bizCopied: 'Link Copied!',
    bizOfflineCached: 'Cached Offline',
    bizOfflineBanner: 'Offline Mode Active: You are viewing previously cached details saved by the service worker.',
    bizLoading: 'Loading details...',
    bizNotFound: 'Establishment Not Found',

    // Pasalubong Page
    pasalubongTitle: 'Bohol Pasalubong Directory',
    pasalubongSub: 'Discover iconic takeout treats, Jagna calamay, peanut kisses, and local delicacies directly from verified shops across Bohol.',
    pasalubongSearchPlaceholder: 'Search Calamay, Peanut Kisses, Broas, Honey, Tableya...',
    pasalubongPriceAll: 'All Prices',
    pasalubongUnder100: 'Under ₱100',
    pasalubongUnder300: 'Under ₱300',
    pasalubongUnder500: 'Under ₱500',

    // Search Results Page
    searchTitle: 'Find Bohol Delicacies & Eateries',
    searchSub: 'Showing matching food establishments and products across Bohol',

    // About Page
    aboutTitle: 'About KaonTa Bohol',
    aboutSub: 'A dedicated food discovery platform connecting residents and travelers to authentic eateries, coastal seafood, and iconic pasalubong across the island of Bohol.',

    // Offline Drawer
    offlineMode: 'Offline — Cached details active',
    offlineSavedCount: 'Saved',
    offlineDrawerTitle: 'Saved Offline Restaurants',
    offlineDrawerSub: 'These restaurant profiles were cached during your previous visits and can be viewed without an active internet connection:',
    offlineContinue: 'Continue Offline Browsing',

    // Common
    loading: 'Loading...',
    distanceKm: 'km',
    verified: 'Verified Listing',
    sample: 'Sample',
    priceNotProvided: 'Price not provided',
    languageLabel: 'Language',
  },
  ceb: {
    // Navigation
    navHome: 'Balay',
    navExplore: 'Susiha',
    navPasalubong: 'Pasalubong',
    navAbout: 'Bahin Kanato',
    navListBusiness: 'Ilista ang Negosyo',
    navNearby: 'Duol Kanimo',
    navLiveNearby: 'Live Duol Kanimo',
    navSimulating: 'Gisundog',
    navMap: 'Mapa',

    // Roles & Auth
    roleVisitor: 'Bisita',
    roleOwner: 'Tag-iya',
    roleAdmin: 'Tigdumala',
    roleSwitcher: 'Ilis og Papel',
    publicMode: 'Publikong paagi',
    adminDashboard: 'Dashboard sa Tigdumala',
    ownerDashboard: 'Dashboard sa Tag-iya',
    signIn: 'Sulod',
    signOut: 'Gawas',

    // Home Page
    homeHeroTitle: 'Pangitaa ang Lami sa Bohol.',
    homeHeroSubtitle: 'Susiha ang mga lokal nga kan-anan, preskong pagkaong-dagat, ug tinuod nga mga delikasiya duol kanimo.',
    homeSearchPlaceholder: 'Unsay lami kaonon o dad-on pauli karon?',
    homeAllBohol: 'Tibuok Bohol',
    homeSearchBtn: 'Pangitaa',
    homePopularDelicacies: 'Sikat nga mga Pagkaon:',
    homeEnableLiveNearby: 'Paandara ang Live Nearby',
    homeLiveNearbyActive: 'Aktibo ang Live Nearby',
    homeOpenMapView: 'Ablihi ang Mapa',
    homeBrowseCategory: 'Pilia pinaagi sa Kategoriya',
    homeSeeAll: 'Tan-awa Tanan',
    homePopularPlaces: 'Mga Sikat nga Kan-anan ug Pasalubong',
    homePopularPlacesSub: 'Kumpirmadong mga kan-anan ug pagkaon sa Bohol',
    homeExploreOnMap: 'Susiha sa mapa',
    homeViewMenu: 'Tan-awa ang Menu →',
    homeBrowseByTown: 'Pilia pinaagi sa Lungsod',
    homeAllTowns: 'Tanan nga Lungsod',

    // Hero background subtitles
    bgSeafoodSub: 'Preskong sinugbang nukos, pasayan, ug isda sa dahon sa saging',
    bgNativeSub: 'Lamiang sabaw sa native chicken halang-halang, lutong-balay ug linat-an',
    bgCalamaySub: 'Pilit ug tam-is nga Calamay sa bagol gikan sa Jagna ug Peanut Kisses',
    bgSinuglawSub: 'Sinugbang liempo gisagol sa preskong kinilawng isda ug lokal nga panakot',

    // Explore Page
    exploreSearchPlaceholder: 'Pangitaa ang pagkaon o kan-anan...',
    exploreRadius: 'Gilay-on:',
    explorePause: 'Pahunonga',
    exploreResume: 'Ipadayon',
    exploreRefresh: 'Bag-oha',
    exploreAllTowns: 'Tanan nga Lungsod',
    exploreAllCategories: 'Tanan nga Kategoriya',
    explorePasalubongOnly: 'Pasalubong Lamang',
    exploreSortDistance: 'Pinakaduol Una',
    exploreSortName: 'Alpabetiko',
    exploreGettingLocation: 'Gikuha pa ang imong lokasyon...',
    explorePaused: 'Gipahunong ang pag-update',
    exploreActive: 'Aktibo ang Live Nearby',
    exploreAccuracyLow: 'Ubos ang katin-aw sa lokasyon',
    exploreDenied: 'Gibabagan ang pagtugot sa lokasyon',
    exploreNoResults: 'Walay kan-anan nga nakit-an sa kini nga gilay-on',
    exploreNoResultsSub: 'Sulayi pagpadako ang gilay-on o usba ang imong gipangita.',

    // Business Details Page
    bizBackToListings: 'Balik sa mga Duol nga Kan-anan',
    bizBranches: 'Mga Sangay',
    bizSelectBranch: 'Pilia ang sangay',
    bizMainBranch: 'Panguna',
    bizMenuOfferings: 'Menu ug mga Pagkaon',
    bizTabAll: 'Tanan nga Pagkaon',
    bizTabFood: 'Mga Lutong Pagkaon',
    bizTabPasalubong: 'Pasalubong',
    bizAvailableAt: 'Mapalit sa:',
    bizInStock: 'Anaa Na',
    bizSeasonal: 'Panahon Lamang',
    bizCheckStock: 'Tawag aron masiguro',
    bizDirections: 'Pangitaa ang Dalan',
    bizShare: 'Ipaambit',
    bizReport: 'Isumbong',
    bizCopied: 'Kopya na ang Link!',
    bizOfflineCached: 'Gitipigan sa Offline',
    bizOfflineBanner: 'Aktibo ang Offline: Ang gipakita naggikan sa gitipigang impormasyon sa imong galamiton.',
    bizLoading: 'Gikarga pa ang mga impormasyon...',
    bizNotFound: 'Wala Makita ang Kan-anan',

    // Pasalubong Page
    pasalubongTitle: 'Direktoryo sa Pasalubong sa Bohol',
    pasalubongSub: 'Pangitaa ang mga sikat nga pasalubong, Jagna calamay, peanut kisses, ug mga lamiang pagkaon direkta sa mga tindahan sa Bohol.',
    pasalubongSearchPlaceholder: 'Pangitaa ang Calamay, Peanut Kisses, Broas, Dugos, Tableya...',
    pasalubongPriceAll: 'Tanan nga Presyo',
    pasalubongUnder100: 'Ubos sa ₱100',
    pasalubongUnder300: 'Ubos sa ₱300',
    pasalubongUnder500: 'Ubos sa ₱500',

    // Search Results Page
    searchTitle: 'Pangita og mga Pagkaon ug Kan-anan sa Bohol',
    searchSub: 'Nagpakita sa mga tugmang kan-anan ug mga produkto sa tibuok Bohol',

    // About Page
    aboutTitle: 'Bahin sa KaonTa Bohol',
    aboutSub: 'Usa ka plataporma nga nagtabang sa mga molupyo ug mga bisita sa pagdiskobre sa mga lamiang kan-anan, preskong pagkaong-dagat, ug sikat nga pasalubong sa isla sa Bohol.',

    // Offline Drawer
    offlineMode: 'Offline — Aktibo ang gitipigang impormasyon',
    offlineSavedCount: 'Gitipigan',
    offlineDrawerTitle: 'Mga Gitipigang Kan-anan sa Offline',
    offlineDrawerSub: 'Kini nga mga kan-anan na-save sa imong miaging pagbisita ug mahimong matan-aw bisan walay koneksyon sa internet:',
    offlineContinue: 'Padayon sa Offline nga Pagtan-aw',

    // Common
    loading: 'Gikarga pa...',
    distanceKm: 'km',
    verified: 'Kumpirmadong Listahan',
    sample: 'Pananglitan',
    priceNotProvided: 'Walay gibutang nga presyo',
    languageLabel: 'Pinulongan',
  },
};

/**
 * Returns the localized text for the provided key and language,
 * falling back to English and then to the provided fallback string.
 */
export function getTranslation(
  language: Language,
  key: TranslationKey,
  fallback?: string
): string {
  return translations[language]?.[key] || translations.en[key] || fallback || '';
}
