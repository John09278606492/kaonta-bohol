import React, { useState, useEffect } from 'react';
import {
  Search,
  Navigation,
  MapPin,
  Utensils,
  Gift,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';
import { BusinessWithDistance, Category, Municipality } from '../types';
import { formatStraightLineDistance } from '../lib/geo';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSearch: (query: string, municipality?: string, category?: string) => void;
}

// Bohol food & delicacy curated hero backgrounds
const BOHOL_FOOD_BACKGROUNDS = [
  {
    title: 'Bohol Island Seafood Feast',
    subtitle: 'Fresh grilled squid, prawns, & catch of the day on banana leaves',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2200&q=85',
    category: 'cat-seafood',
  },
  {
    title: 'Native Chicken Halang-Halang & Eateries',
    subtitle: 'Rich coconut chicken broth, carinderia favorites & island stews',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=2200&q=85',
    category: 'cat-native',
  },
  {
    title: 'Authentic Jagna Calamay & Delicacies',
    subtitle: 'Sticky sweet coconut Calamay in polished shells & Peanut Kisses',
    image:
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=2200&q=85',
    category: 'cat-pasalubong',
  },
  {
    title: 'Sinuglaw & Seaside Barbecue',
    subtitle: 'Charcoal-grilled pork belly with fresh tuna ceviche and local spices',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2200&q=85',
    category: 'cat-heritage',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSearch }) => {
  const {
    enableLiveNearby,
    isLiveNearbyActive,
    userLocation,
    setManualMunicipality,
  } = useLocation();

  const { t, isBisaya } = useLanguage();
  const [activeBgIndex, setActiveBgIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<BusinessWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-rotate hero Bohol food background every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBgIndex((prev) => (prev + 1) % BOHOL_FOOD_BACKGROUNDS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, munis, bizRes] = await Promise.all([
          api.getCategories(),
          api.getMunicipalities(),
          api.getBusinesses({
            lat: userLocation?.latitude,
            lng: userLocation?.longitude,
          }),
        ]);
        setCategories(cats);
        setMunicipalities(munis);
        setFeaturedBusinesses(bizRes.businesses.slice(0, 6));
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [userLocation]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, selectedMunicipality === 'all' ? undefined : selectedMunicipality);
    onNavigate('/search');
  };

  const handleCategoryClick = (categoryId: string) => {
    onSearch('', undefined, categoryId);
    onNavigate('/search');
  };

  const handleMunicipalityClick = (muni: Municipality) => {
    setManualMunicipality(muni.name, muni.lat, muni.lng);
    onSearch('', muni.name);
    onNavigate('/explore');
  };

  const currentBg = BOHOL_FOOD_BACKGROUNDS[activeBgIndex];
  const heroSubtitle = isBisaya
    ? activeBgIndex === 0
      ? t('bgSeafoodSub')
      : activeBgIndex === 1
      ? t('bgNativeSub')
      : activeBgIndex === 2
      ? t('bgCalamaySub')
      : t('bgSinuglawSub')
    : currentBg.subtitle;

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section with Immersive Bohol Food & Delicacies Background */}
      <section className="relative min-h-[600px] sm:min-h-[660px] flex items-center justify-center text-white overflow-hidden">
        {/* Layered Bohol Food Backgrounds with smooth cross-fade */}
        {BOHOL_FOOD_BACKGROUNDS.map((bg, idx) => (
          <div
            key={bg.title}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeBgIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={bg.image}
              alt={bg.title}
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-10000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40" />
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 pt-12 pb-16">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white drop-shadow-sm">
              {t('homeHeroTitle')}
            </h1>
            <p className="text-base sm:text-xl text-white/90 max-w-xl mx-auto font-normal tracking-tight">
              {heroSubtitle}
            </p>
          </div>

          {/* Apple-Style Minimalist Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="apple-glass p-1.5 sm:p-2 rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-1 max-w-2xl mx-auto border border-white/20 text-[#1D1D1F]"
          >
            <div className="flex items-center gap-2.5 px-4 py-2 w-full sm:flex-1">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('homeSearchPlaceholder')}
                className="w-full text-sm placeholder-stone-400 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto px-2 pb-1 sm:pb-0">
              <select
                value={selectedMunicipality}
                onChange={(e) => setSelectedMunicipality(e.target.value)}
                className="text-xs font-medium text-stone-600 bg-black/[0.04] hover:bg-black/[0.07] px-3 py-2 rounded-full focus:outline-none cursor-pointer"
              >
                <option value="all">{t('homeAllBohol')}</option>
                {municipalities.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#164E3D] hover:bg-[#113B2E] text-white text-xs font-semibold transition-all cursor-pointer shrink-0"
              >
                {t('homeSearchBtn')}
              </button>
            </div>
          </form>

          {/* Quick Delicacy Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs pt-1">
            <span className="text-white/60 text-[11px] font-medium mr-1">{t('homePopularDelicacies')}</span>
            {[
              { label: 'Jagna Calamay', q: 'Calamay' },
              { label: 'Peanut Kisses', q: 'Peanut Kisses' },
              { label: 'Halang-Halang', q: 'Halang-Halang' },
              { label: 'Sinuglaw', q: 'Sinuglaw' },
              { label: 'Fresh Seafood', q: 'Seafood' },
            ].map((tag) => (
              <button
                key={tag.label}
                onClick={() => {
                  onSearch(tag.q);
                  onNavigate('/search');
                }}
                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white/90 text-[11px] font-medium border border-white/20 transition-colors cursor-pointer"
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Live Nearby & Browse shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={enableLiveNearby}
              className="px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-medium text-xs sm:text-sm transition-all border border-white/25 flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-300" />
              <span>{isLiveNearbyActive ? t('homeLiveNearbyActive') : t('homeEnableLiveNearby')}</span>
            </button>

            <button
              onClick={() => onNavigate('/explore')}
              className="px-5 py-2.5 rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-md text-white font-medium text-xs sm:text-sm transition-all border border-white/15 cursor-pointer"
            >
              {t('homeOpenMapView')}
            </button>
          </div>

          {/* Background Bohol Delicacy Switcher Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4">
            {BOHOL_FOOD_BACKGROUNDS.map((bg, idx) => (
              <button
                key={bg.title}
                onClick={() => setActiveBgIndex(idx)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  idx === activeBgIndex
                    ? 'bg-white text-stone-900 shadow-sm font-semibold'
                    : 'bg-black/35 text-white/70 hover:bg-black/50 hover:text-white'
                }`}
              >
                {bg.title.split(' ')[0]} {bg.title.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F]">
            {t('homeBrowseCategory')}
          </h2>
          <button
            onClick={() => onNavigate('/search')}
            className="text-xs font-medium text-[#164E3D] hover:underline cursor-pointer"
          >
            {t('homeSeeAll')}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="bg-white p-4 rounded-2xl border border-black/[0.06] hover:border-black/20 hover:shadow-sm transition-all text-center flex flex-col items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-black/[0.03] group-hover:bg-[#164E3D] group-hover:text-white text-[#164E3D] flex items-center justify-center transition-colors">
                {cat.type === 'pasalubong' ? (
                  <Gift className="w-5 h-5" />
                ) : (
                  <Utensils className="w-5 h-5" />
                )}
              </div>
              <span className="text-xs font-medium text-stone-800 leading-snug">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Places (Apple Card Style) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F]">
              {t('homePopularPlaces')}
            </h2>
            <p className="text-xs text-stone-500 font-normal mt-0.5">
              {t('homePopularPlacesSub')}
            </p>
          </div>

          <button
            onClick={() => onNavigate('/explore')}
            className="text-xs font-medium text-[#164E3D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t('homeExploreOnMap')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredBusinesses.map((biz) => {
            const mainBranch = biz.branches.find((b) => b.isMainBranch) || biz.branches[0];
            return (
              <div
                key={biz.id}
                onClick={() => onNavigate(`/business/${biz.id}`)}
                className="bg-white rounded-3xl overflow-hidden border border-black/[0.06] hover:border-black/15 hover:shadow-lg transition-all cursor-pointer flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <img
                    src={biz.bannerImage}
                    alt={biz.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/90 text-stone-900 backdrop-blur-md shadow-xs">
                      {biz.categoryName}
                    </span>
                  </div>
                  {biz.distanceKm !== undefined && (
                    <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                      {formatStraightLineDistance(biz.distanceKm)}
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-semibold text-base text-[#1D1D1F] tracking-tight group-hover:text-[#164E3D] transition-colors">
                      {biz.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {biz.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{mainBranch?.municipality || 'Bohol'}</span>
                    </div>
                    <span className="text-[#164E3D] font-medium text-[12px] group-hover:translate-x-0.5 transition-transform">
                      {t('homeViewMenu')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Towns Filter Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-stone-50 p-6 rounded-3xl border border-black/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#1D1D1F]">
              {t('homeBrowseByTown')}
            </h2>
            <button
              onClick={() => onNavigate('/search')}
              className="text-xs text-[#164E3D] hover:underline"
            >
              {t('homeAllTowns')}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {municipalities.slice(0, 14).map((muni) => (
              <button
                key={muni.id}
                onClick={() => handleMunicipalityClick(muni)}
                className="px-3.5 py-1.5 bg-white hover:bg-[#164E3D] hover:text-white text-stone-700 rounded-full border border-black/[0.06] transition-colors cursor-pointer font-medium"
              >
                {muni.name}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
