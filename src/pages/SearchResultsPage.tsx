import React, { useState, useEffect } from 'react';
import {
  Home,
  Search,
  MapPin,
  Utensils,
  Gift,
  ExternalLink,
  ChevronRight,
  Filter,
  X,
  Compass,
} from 'lucide-react';
import { api } from '../lib/api';
import { BusinessWithDistance, Category, Municipality } from '../types';
import { useLocation } from '../context/LocationContext';
import { useTranslations } from '../context/LanguageContext';
import { formatStraightLineDistance } from '../lib/geo';
import { ReviewStatusBadge } from '../components/common/ReviewStatusBadge';

interface SearchResultsPageProps {
  onNavigate: (path: string) => void;
  searchQuery: string;
  selectedMuni?: string;
  selectedCat?: string;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  onNavigate,
  searchQuery: initialQuery,
  selectedMuni: initialMuni,
  selectedCat: initialCat,
}) => {
  const { userLocation, radiusKm, isLiveNearbyActive } = useLocation();
  const { t, isBisaya } = useTranslations();
  const [query, setQuery] = useState(initialQuery || '');
  const [category, setCategory] = useState(initialCat || 'all');
  const [municipality, setMunicipality] = useState(initialMuni || 'all');
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');
  const [categories, setCategories] = useState<Category[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [results, setResults] = useState<BusinessWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, munis] = await Promise.all([
          api.getCategories(),
          api.getMunicipalities(),
        ]);
        setCategories(cats);
        setMunicipalities(munis);
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function performSearch() {
      setIsLoading(true);
      try {
        const res = await api.getBusinesses({
          search: query || undefined,
          category: category !== 'all' ? category : undefined,
          municipality: municipality !== 'all' ? municipality : undefined,
          lat: userLocation?.latitude,
          lng: userLocation?.longitude,
          radius: isLiveNearbyActive || userLocation ? radiusKm : undefined,
          sortBy,
        });
        setResults(res.businesses);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    performSearch();
  }, [query, category, municipality, sortBy, userLocation, isLiveNearbyActive, radiusKm]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb with Home Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 font-medium text-stone-700 hover:text-[#164E3D] transition-colors bg-white px-3 py-1.5 rounded-full border border-black/[0.06] shadow-2xs cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-[#164E3D]" />
            <span>{t('navHome')}</span>
          </button>
          <span className="text-stone-300">/</span>
          <span className="text-stone-900 font-medium">{t('searchTitle')}</span>
        </div>

        <button
          onClick={() => onNavigate('/explore')}
          className="text-xs font-medium text-[#164E3D] hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>{t('homeOpenMapView')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F]">
          {t('searchTitle')}
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {t('searchSub')}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('homeSearchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-700 focus:outline-none"
        >
          <option value="all">{t('exploreAllCategories')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={municipality}
          onChange={(e) => setMunicipality(e.target.value)}
          className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-700 focus:outline-none"
        >
          <option value="all">{t('exploreAllTowns')}</option>
          {municipalities.map((m) => (
            <option key={m.id} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-700 focus:outline-none"
        >
          <option value="distance">{t('exploreSortDistance')}</option>
          <option value="name">{t('exploreSortName')}</option>
        </select>

        {(query || category !== 'all' || municipality !== 'all') && (
          <button
            onClick={() => {
              setQuery('');
              setCategory('all');
              setMunicipality('all');
            }}
            className="text-stone-500 hover:text-stone-900 underline font-medium px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span className="font-semibold text-stone-800">
          {results.length} {isBisaya ? 'Kumpirmadong Kan-anan ang Nakit-an' : 'Approved Establishments Found'}
        </span>
        {userLocation && (
          <span>
            {isBisaya
              ? 'Gikalkula ang gilay-on gikan sa imong lokasyon'
              : 'Distances calculated from your coordinates'}
          </span>
        )}
      </div>

      {/* Results List */}
      {results.length === 0 && !isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <Utensils className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-900">
            {isBisaya
              ? 'Walay kan-anan nga nakit-an sa pagkakaron.'
              : 'No listings found in this area yet.'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {isBisaya
              ? 'Sulayi pagpangita gamit ang lain nga mga pulong o pagpili og laing lungsod.'
              : 'Try searching for broader terms or selecting a different municipality.'}
          </p>
          <button
            onClick={() => {
              setQuery('');
              setCategory('all');
              setMunicipality('all');
            }}
            className="px-4 py-2 bg-[#164E3D] text-white rounded-xl text-xs font-bold"
          >
            {isBisaya ? 'Ibalik sa Sinugdanan' : 'Reset All Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((biz) => {
            const mainBranch = biz.closestBranch || biz.branches[0];
            const googleMapsDirUrl = mainBranch
              ? `https://www.google.com/maps/dir/?api=1&destination=${mainBranch.latitude},${mainBranch.longitude}`
              : '#';

            return (
              <div
                key={biz.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-[#164E3D] hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-44 bg-stone-100 overflow-hidden relative">
                    <img
                      src={biz.bannerImage}
                      alt={biz.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-[#164E3D] shadow-xs">
                        {biz.categoryName}
                      </span>
                    </div>

                    {biz.distanceKm !== undefined && (
                      <div className="absolute bottom-2 right-2 bg-[#164E3D] text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-md">
                        {formatStraightLineDistance(biz.distanceKm)}
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <ReviewStatusBadge status={biz.status} isDemo={biz.isDemo} />
                    <h3
                      onClick={() => onNavigate(`/business/${biz.id}`)}
                      className="font-bold text-lg text-stone-900 group-hover:text-[#164E3D] cursor-pointer font-serif transition-colors"
                    >
                      {biz.name}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {biz.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-3">
                  {mainBranch && (
                    <div className="text-xs text-stone-500 pt-3 border-t border-stone-100 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">
                        {mainBranch.branchName} • {mainBranch.municipality}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onNavigate(`/business/${biz.id}`)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#164E3D] hover:bg-[#123E30] text-white text-xs font-semibold transition-colors text-center"
                    >
                      View Details
                    </button>
                    <a
                      href={googleMapsDirUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors flex items-center gap-1"
                      title="Open directions in external map"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
