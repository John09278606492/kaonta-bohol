import React, { useState, useEffect } from 'react';
import {
  Home,
  Gift,
  Search,
  MapPin,
  ExternalLink,
  Tag,
  Sparkles,
  ShoppingBag,
  Store,
  ChevronRight,
} from 'lucide-react';
import { api } from '../lib/api';
import { ProductWithDistance, Municipality } from '../types';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import { formatStraightLineDistance } from '../lib/geo';

interface PasalubongPageProps {
  onNavigate: (path: string) => void;
}

export const PasalubongPage: React.FC<PasalubongPageProps> = ({ onNavigate }) => {
  const { userLocation, radiusKm } = useLocation();
  const { t } = useLanguage();
  const [products, setProducts] = useState<ProductWithDistance[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuni, setSelectedMuni] = useState('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [prodRes, munis] = await Promise.all([
          api.getProducts({
            isPasalubong: true,
            search: searchQuery || undefined,
            municipality: selectedMuni !== 'all' ? selectedMuni : undefined,
            maxPrice: maxPriceFilter !== 'all' ? parseFloat(maxPriceFilter) : undefined,
            lat: userLocation?.latitude,
            lng: userLocation?.longitude,
            radius: userLocation ? radiusKm : undefined,
          }),
          api.getMunicipalities(),
        ]);
        setProducts(prodRes.products);
        setMunicipalities(munis);
      } catch (err) {
        console.error('Failed to load pasalubong products', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [searchQuery, selectedMuni, maxPriceFilter, userLocation, radiusKm]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
          <span className="text-stone-900 font-medium">{t('pasalubongTitle')}</span>
        </div>

        <button
          onClick={() => onNavigate('/explore')}
          className="text-xs font-medium text-[#164E3D] hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>{t('navMap')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#164E3D] text-white p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-sm">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium">
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('navPasalubong')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
            {t('pasalubongTitle')}
          </h1>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed font-normal">
            {t('pasalubongSub')}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('pasalubongSearchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
          />
        </div>

        <select
          value={selectedMuni}
          onChange={(e) => setSelectedMuni(e.target.value)}
          className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-700 focus:outline-none"
        >
          <option value="all">{t('homeAllTowns')}</option>
          {municipalities.map((m) => (
            <option key={m.id} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={maxPriceFilter}
          onChange={(e) => setMaxPriceFilter(e.target.value)}
          className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-700 focus:outline-none"
        >
          <option value="all">{t('pasalubongPriceAll')}</option>
          <option value="100">{t('pasalubongUnder100')}</option>
          <option value="300">{t('pasalubongUnder300')}</option>
          <option value="500">{t('pasalubongUnder500')}</option>
        </select>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Calamay, Peanut Kisses, Broas, Honey, Tableya..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
          />
        </div>

        <select
          value={selectedMuni}
          onChange={(e) => setSelectedMuni(e.target.value)}
          className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-700 focus:outline-none"
        >
          <option value="all">All Bohol Towns</option>
          {municipalities.map((m) => (
            <option key={m.id} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={maxPriceFilter}
          onChange={(e) => setMaxPriceFilter(e.target.value)}
          className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-700 focus:outline-none"
        >
          <option value="all">Any Price</option>
          <option value="100">Under ₱100</option>
          <option value="200">Under ₱200</option>
          <option value="300">Under ₱300</option>
        </select>

        {(searchQuery || selectedMuni !== 'all' || maxPriceFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedMuni('all');
              setMaxPriceFilter('all');
            }}
            className="text-stone-500 hover:text-stone-900 underline font-medium px-2"
          >
            Reset
          </button>
        )}
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-serif text-[#164E3D]">
            {products.length} Delicacies Available
          </h2>
          {userLocation && (
            <span className="text-xs text-stone-500">
              Straight-line distances calculated from your location
            </span>
          )}
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
            <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-bold text-stone-800">No pasalubong items found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try adjusting your search criteria or viewing all municipalities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-[#164E3D] hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-48 overflow-hidden bg-stone-100 relative">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                        Pasalubong
                      </span>
                    </div>

                    {prod.distanceKm !== undefined && (
                      <div className="absolute bottom-3 right-3 bg-[#164E3D] text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-md">
                        {formatStraightLineDistance(prod.distanceKm)}
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#164E3D] truncate">
                        {prod.businessName}
                      </span>
                      <span className="font-extrabold text-stone-900 text-sm">
                        {prod.price !== null ? `₱${prod.price.toLocaleString()}` : 'Price not provided'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-stone-900 font-serif group-hover:text-[#164E3D] transition-colors">
                      {prod.name}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-3">
                  {prod.offeringBranch && (
                    <div className="text-[11px] text-stone-500 pt-3 border-t border-stone-100 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">
                        {prod.offeringBranch.branchName} • {prod.offeringBranch.municipality}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => onNavigate(`/business/${prod.businessId}`)}
                    className="w-full py-2 px-3 rounded-xl bg-[#E8F3EE] hover:bg-[#D5EADF] text-[#164E3D] text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View Establishment & Map</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
