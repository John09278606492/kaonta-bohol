import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Home,
  Navigation,
  Pause,
  Play,
  RotateCw,
  Search,
  Filter,
  MapPin,
  Map as MapIcon,
  List,
  Compass,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown,
  X,
  ExternalLink,
  Flag,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';
import { BusinessWithDistance, Category, Municipality } from '../types';
import { LeafletMap } from '../components/map/LeafletMap';
import { ReviewStatusBadge } from '../components/common/ReviewStatusBadge';
import { ReportModal } from '../components/common/ReportModal';
import { formatStraightLineDistance } from '../lib/geo';

interface ExplorePageProps {
  onNavigate: (path: string) => void;
  initialQuery?: string;
  initialMunicipality?: string;
  initialCategory?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onNavigate,
  initialQuery = '',
  initialMunicipality = '',
  initialCategory = 'all',
}) => {
  const {
    isLiveNearbyActive,
    status,
    statusMessage,
    userLocation,
    radiusKm,
    setRadius,
    lastRefreshedAt,
    enableLiveNearby,
    pauseLiveNearby,
    resumeLiveNearby,
    refreshNow,
    isManualMode,
    selectedMunicipality,
    setManualMunicipality,
    clearManualMode,
    isSimulating,
  } = useLocation();

  const { t } = useLanguage();

  // Filters
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedMuniFilter, setSelectedMuniFilter] = useState(initialMunicipality || 'all');
  const [onlyPasalubong, setOnlyPasalubong] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');

  // View state
  const [mobileView, setMobileView] = useState<'split' | 'map' | 'list'>('split');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | undefined>();
  const [businesses, setBusinesses] = useState<BusinessWithDistance[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Reporting modal state
  const [reportingBiz, setReportingBiz] = useState<{ id: string; name: string } | null>(null);

  // Fetch categories & municipalities on mount
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [cats, munis] = await Promise.all([
          api.getCategories(),
          api.getMunicipalities(),
        ]);
        setCategories(cats);
        setMunicipalities(munis);
      } catch (err) {
        console.error('Failed to load categories/municipalities', err);
      }
    }
    loadMetadata();
  }, []);

  // Fetch businesses whenever location, radius, or filters change
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const muniParam =
        isManualMode && selectedMunicipality
          ? selectedMunicipality
          : selectedMuniFilter !== 'all'
          ? selectedMuniFilter
          : undefined;

      const res = await api.getBusinesses({
        search: searchQuery.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        municipality: muniParam,
        lat: userLocation?.latitude,
        lng: userLocation?.longitude,
        radius: isLiveNearbyActive || userLocation ? radiusKm : undefined,
        isPasalubong: onlyPasalubong,
        sortBy,
      });

      setBusinesses(res.businesses);
    } catch (err: any) {
      if (err.message !== 'SUPERSEDED_REQUEST') {
        console.error('Fetch error:', err);
        setFetchError('Failed to load nearby listings. Please check connection and retry.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    selectedCategory,
    selectedMuniFilter,
    isManualMode,
    selectedMunicipality,
    userLocation,
    isLiveNearbyActive,
    radiusKm,
    onlyPasalubong,
    sortBy,
  ]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Handle switching to a manual municipality from the dropdown
  const handleMunicipalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedMuniFilter(val);
    if (val !== 'all') {
      const found = municipalities.find((m) => m.name === val);
      if (found) {
        setManualMunicipality(found.name, found.lat, found.lng);
      }
    } else {
      clearManualMode();
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#FBFBFA] text-[#1D1D1F]">
      {/* Top Controller Bar */}
      <section className="bg-white/80 backdrop-blur-xl border-b border-black/[0.06] px-4 py-2.5 sm:px-6 sticky top-14 sm:top-16 z-30">
        <div className="max-w-6xl mx-auto space-y-2.5">
          {/* Status & Live Nearby Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Live Nearby status badge & Home button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-stone-700 hover:text-stone-900 bg-black/[0.04] hover:bg-black/[0.08] transition-colors cursor-pointer"
                title="Go to Home"
              >
                <Home className="w-3.5 h-3.5 text-[#164E3D]" />
                <span>{t('navHome')}</span>
              </button>

              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                  status === 'active'
                    ? isSimulating
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-50 text-emerald-950 border-emerald-200'
                    : status === 'paused'
                    ? 'bg-stone-100 text-stone-700 border-stone-200'
                    : status === 'getting_location'
                    ? 'bg-blue-50 text-blue-900 border-blue-200 animate-pulse'
                    : 'bg-black/[0.04] text-stone-600 border-transparent'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === 'active'
                      ? isSimulating
                        ? 'bg-amber-600 animate-ping'
                        : 'bg-emerald-600 animate-ping'
                      : status === 'paused'
                      ? 'bg-stone-400'
                      : status === 'getting_location'
                      ? 'bg-blue-600'
                      : 'bg-stone-400'
                  }`}
                />
                <span>
                  {status === 'active'
                    ? isSimulating
                      ? t('navSimulating')
                      : t('exploreActive')
                    : status === 'paused'
                    ? t('explorePaused')
                    : status === 'getting_location'
                    ? t('exploreGettingLocation')
                    : statusMessage}
                </span>
              </div>

              {isManualMode && selectedMunicipality && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/[0.04] text-stone-700">
                  <MapPin className="w-3 h-3 text-stone-500" />
                  <span>{selectedMunicipality}</span>
                  <button
                    onClick={clearManualMode}
                    className="p-0.5 hover:text-stone-900 cursor-pointer"
                    title="Clear manual override"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              {!isLiveNearbyActive ? (
                <button
                  onClick={enableLiveNearby}
                  className="px-3.5 py-1.5 rounded-full bg-[#164E3D] hover:bg-[#113B2E] text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t('homeEnableLiveNearby')}</span>
                </button>
              ) : status === 'paused' ? (
                <button
                  onClick={resumeLiveNearby}
                  className="px-3 py-1.5 rounded-full bg-[#164E3D] hover:bg-[#113B2E] text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{t('exploreResume')}</span>
                </button>
              ) : (
                <button
                  onClick={pauseLiveNearby}
                  className="px-3 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-stone-700 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>{t('explorePause')}</span>
                </button>
              )}

              <button
                onClick={() => {
                  refreshNow();
                  fetchListings();
                }}
                disabled={isLoading}
                className="p-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-stone-700 text-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title={t('exploreRefresh')}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#164E3D]' : ''}`} />
              </button>

              {/* Mobile View Toggle */}
              <div className="inline-flex lg:hidden rounded-full p-0.5 bg-black/[0.04]">
                <button
                  onClick={() => setMobileView('map')}
                  className={`p-1.5 rounded-full text-xs font-medium ${
                    mobileView === 'map' ? 'bg-[#164E3D] text-white' : 'text-stone-700'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMobileView('list')}
                  className={`p-1.5 rounded-full text-xs font-medium ${
                    mobileView === 'list' ? 'bg-[#164E3D] text-white' : 'text-stone-700'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMobileView('split')}
                  className={`p-1.5 rounded-full text-xs font-medium ${
                    mobileView === 'split' ? 'bg-[#164E3D] text-white' : 'text-stone-700'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-black/[0.04] text-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('exploreSearchPlaceholder')}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-black/[0.03] focus:bg-white border border-transparent focus:border-black/20 rounded-full focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-black/[0.03] hover:bg-black/[0.06] rounded-full font-medium text-stone-700 focus:outline-none cursor-pointer"
            >
              <option value="all">{t('exploreAllCategories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Municipality Selector */}
            <select
              value={selectedMuniFilter}
              onChange={handleMunicipalityChange}
              className="px-3 py-1.5 bg-black/[0.03] hover:bg-black/[0.06] rounded-full font-medium text-stone-700 focus:outline-none cursor-pointer"
            >
              <option value="all">{t('exploreAllTowns')}</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* Radius Selector: 1 km, 3 km, 5 km, 10 km */}
            <div className="flex items-center gap-1 bg-black/[0.03] p-0.5 rounded-full">
              {[1, 3, 5, 10].map((km) => (
                <button
                  key={km}
                  onClick={() => setRadius(km)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    radiusKm === km
                      ? 'bg-[#164E3D] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {km}km
                </button>
              ))}
            </div>

            {/* Pasalubong Checkbox */}
            <label className="inline-flex items-center gap-1.5 font-medium text-stone-700 px-3 py-1 bg-black/[0.03] hover:bg-black/[0.06] rounded-full cursor-pointer">
              <input
                type="checkbox"
                checked={onlyPasalubong}
                onChange={(e) => setOnlyPasalubong(e.target.checked)}
                className="rounded text-[#164E3D] focus:ring-0"
              />
              <span>{t('navPasalubong')}</span>
            </label>
          </div>
        </div>
      </section>

      {/* Main Split Layout: Map & Results Directory */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Map Column */}
        <div
          className={`lg:w-1/2 flex flex-col ${
            mobileView === 'list' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="sticky top-44 space-y-2">
            <LeafletMap
              businesses={businesses}
              userLocation={userLocation}
              radiusKm={radiusKm}
              selectedBusinessId={selectedBusinessId}
              onSelectBusiness={(id) => setSelectedBusinessId(id)}
              className="h-[400px] sm:h-[500px] lg:h-[calc(100vh-16rem)] w-full"
            />
            <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
              <span>Showing approved establishments within {radiusKm} km radius</span>
              <span className="italic">Straight-line distance calculation</span>
            </div>
          </div>
        </div>

        {/* Directory Column */}
        <div
          className={`lg:w-1/2 flex flex-col space-y-4 ${
            mobileView === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Header count & sort */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight text-[#1D1D1F]">
              {businesses.length} {businesses.length === 1 ? 'place' : 'places'} found
            </h2>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 bg-black/[0.03] hover:bg-black/[0.06] rounded-full text-xs font-medium text-stone-700 focus:outline-none"
              >
                <option value="distance">{t('exploreSortDistance')}</option>
                <option value="name">{t('exploreSortName')}</option>
              </select>
            </div>
          </div>

          {/* Fallback Empty State as requested */}
          {businesses.length === 0 && !isLoading && (
            <div className="bg-white rounded-3xl p-8 text-center border border-black/[0.06] space-y-3 shadow-sm my-4">
              <div className="w-12 h-12 rounded-2xl bg-black/[0.03] text-stone-600 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-semibold text-stone-900">
                  {t('exploreNoResults')}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {t('exploreNoResultsSub')}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setRadius(5)}
                  className="px-3.5 py-1.5 bg-[#164E3D] text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
                >
                  5 km radius
                </button>
                <button
                  onClick={() => setRadius(10)}
                  className="px-3.5 py-1.5 bg-[#164E3D] text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
                >
                  10 km radius
                </button>
                <button
                  onClick={() => setManualMunicipality('Tagbilaran City', 9.6496, 123.8547)}
                  className="px-3.5 py-1.5 bg-black/[0.04] hover:bg-black/[0.08] text-stone-800 rounded-full text-xs font-medium transition-colors cursor-pointer"
                >
                  Explore Tagbilaran City
                </button>
              </div>
            </div>
          )}

          {/* Business Cards Grid */}
          <div className="space-y-3">
            {businesses.map((biz) => {
              const isSelected = selectedBusinessId === biz.id;
              const mainBranch = biz.closestBranch || biz.branches[0];
              const googleMapsDirUrl = mainBranch
                ? `https://www.google.com/maps/dir/?api=1&destination=${mainBranch.latitude},${mainBranch.longitude}`
                : '#';

              return (
                <div
                  key={biz.id}
                  className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col sm:flex-row hover:shadow-md ${
                    isSelected
                      ? 'border-[#164E3D] shadow-sm'
                      : 'border-black/[0.06]'
                  }`}
                  onMouseEnter={() => setSelectedBusinessId(biz.id)}
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => onNavigate(`/business/${biz.id}`)}
                    className="sm:w-44 h-40 sm:h-auto bg-stone-100 relative shrink-0 cursor-pointer overflow-hidden"
                  >
                    <img
                      src={biz.bannerImage}
                      alt={biz.name}
                      className="w-full h-full object-cover hover:scale-103 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-stone-900 backdrop-blur-xs">
                        {biz.categoryName}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <ReviewStatusBadge status={biz.status} isDemo={biz.isDemo} />
                        {biz.distanceKm !== undefined && (
                          <span className="text-[11px] font-medium text-[#164E3D] bg-[#E8F3EE] px-2 py-0.5 rounded-full whitespace-nowrap">
                            {formatStraightLineDistance(biz.distanceKm)}
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => onNavigate(`/business/${biz.id}`)}
                        className="font-semibold text-base text-[#1D1D1F] hover:text-[#164E3D] cursor-pointer tracking-tight transition-colors"
                      >
                        {biz.name}
                      </h3>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {biz.description}
                      </p>
                    </div>

                    {/* Branches info */}
                    {mainBranch && (
                      <div className="text-[11px] text-stone-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">
                          {mainBranch.branchName} • {mainBranch.municipality}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.04]">
                      <button
                        onClick={() => onNavigate(`/business/${biz.id}`)}
                        className="px-3.5 py-1.5 rounded-full bg-[#164E3D] hover:bg-[#113B2E] text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        View Details
                      </button>

                      <div className="flex items-center gap-2">
                        <a
                          href={googleMapsDirUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-stone-700 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Directions</span>
                        </a>

                        <button
                          onClick={() => setReportingBiz({ id: biz.id, name: biz.name })}
                          className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-black/[0.04] transition-colors cursor-pointer"
                          title="Report inaccuracy"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportingBiz && (
        <ReportModal
          businessId={reportingBiz.id}
          businessName={reportingBiz.name}
          isOpen={true}
          onClose={() => setReportingBiz(null)}
        />
      )}
    </div>
  );
};
