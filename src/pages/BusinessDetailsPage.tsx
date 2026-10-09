import React, { useState, useEffect } from 'react';
import {
  Home,
  MapPin,
  Phone,
  Globe,
  Clock,
  ExternalLink,
  Flag,
  ChevronLeft,
  Share2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Tag,
  Gift,
  Utensils,
  Layers,
  WifiOff,
} from 'lucide-react';
import { api } from '../lib/api';
import { Business, Branch, Product } from '../types';
import { LeafletMap } from '../components/map/LeafletMap';
import { ReviewStatusBadge } from '../components/common/ReviewStatusBadge';
import { ReportModal } from '../components/common/ReportModal';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import { formatStraightLineDistance } from '../lib/geo';

interface BusinessDetailsPageProps {
  businessId: string;
  onNavigate: (path: string) => void;
}

export const BusinessDetailsPage: React.FC<BusinessDetailsPageProps> = ({
  businessId,
  onNavigate,
}) => {
  const { userLocation, radiusKm } = useLocation();
  const { t } = useLanguage();
  const [business, setBusiness] = useState<
    (Business & { reviewStatusExplanation?: string; isOfflineCached?: boolean }) | null
  >(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'food' | 'pasalubong'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    async function loadBusiness() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getBusinessById(businessId);
        setBusiness(data);
        if (data.branches && data.branches.length > 0) {
          const main = data.branches.find((b) => b.isMainBranch) || data.branches[0];
          setSelectedBranchId(main.id);
        }
      } catch (err: any) {
        setError(err.message || 'Unable to load establishment details.');
      } finally {
        setIsLoading(false);
      }
    }
    loadBusiness();
  }, [businessId]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#164E3D] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-stone-600">Loading details...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
          isOffline ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
        }`}>
          {isOffline ? <WifiOff className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
          {isOffline ? 'Not Available Offline Yet' : 'Establishment Not Found'}
        </h2>
        <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          {error || 'This business listing may have been moved, archived, or is awaiting approval.'}
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => onNavigate('/')}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Home</span>
          </button>
          <button
            onClick={() => onNavigate('/explore')}
            className="px-4 py-2 bg-[#164E3D] text-white rounded-full text-xs font-semibold transition-colors cursor-pointer"
          >
            {isOffline ? 'View Saved Offline Listings' : 'Explore Nearby'}
          </button>
        </div>
      </div>
    );
  }

  const selectedBranch =
    business.branches.find((b) => b.id === selectedBranchId) || business.branches[0];

  const googleMapsUrl = selectedBranch
    ? `https://www.google.com/maps/dir/?api=1&destination=${selectedBranch.latitude},${selectedBranch.longitude}`
    : '#';

  const filteredProducts = business.products.filter((p) => {
    if (activeTab === 'food') return !p.isPasalubong;
    if (activeTab === 'pasalubong') return p.isPasalubong;
    return true;
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Offline Alert Banner if offline or served from cache */}
      {(business.isOfflineCached || isOffline) && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-950 text-xs font-semibold flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {t('bizOfflineBanner')}
            </span>
          </div>
          <span className="text-[11px] bg-amber-200/80 px-2 py-0.5 rounded-md font-mono">
            CACHED
          </span>
        </div>
      )}

      {/* Breadcrumbs with visible Home navigation button */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 font-medium text-stone-700 hover:text-[#164E3D] transition-colors bg-white px-3 py-1.5 rounded-full border border-black/[0.06] shadow-2xs cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-[#164E3D]" />
          <span>{t('navHome')}</span>
        </button>
        <span className="text-stone-300">/</span>
        <button
          onClick={() => onNavigate('/explore')}
          className="inline-flex items-center gap-1 text-stone-600 hover:text-[#164E3D] transition-colors px-2 py-1 cursor-pointer"
        >
          <span>{t('navExplore')}</span>
        </button>
        <span className="text-stone-300">/</span>
        <span className="text-stone-900 font-medium truncate max-w-[240px]">{business.name}</span>
      </div>

      {/* Header Banner & Title */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm">
        <div className="h-64 sm:h-80 w-full relative bg-stone-100 overflow-hidden">
          <img
            src={business.bannerImage}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 text-[#164E3D] backdrop-blur-xs shadow-md">
              {business.categoryName}
            </span>
            <ReviewStatusBadge status={business.status} isDemo={business.isDemo} />
            {business.isOfflineCached && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950 flex items-center gap-1 shadow-md">
                <WifiOff className="w-3.5 h-3.5" />
                <span>{t('bizOfflineCached')}</span>
              </span>
            )}
          </div>

          {/* Share & Report action buttons on top right */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-stone-800 backdrop-blur-xs shadow-md text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copiedLink ? t('bizCopied') : t('bizShare')}</span>
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-stone-800 backdrop-blur-xs shadow-md text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Report inaccurate info"
            >
              <Flag className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">{t('bizReport')}</span>
            </button>
          </div>

          {/* Bottom Title Info */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
            <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight drop-shadow-md">
              {business.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-200 max-w-2xl line-clamp-2">
              {business.description}
            </p>
          </div>
        </div>

        {/* Quick Contact & Info Bar */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-stone-600">
            {business.contactPhone && (
              <a
                href={`tel:${business.contactPhone}`}
                className="flex items-center gap-1.5 font-semibold text-stone-800 hover:text-[#164E3D]"
              >
                <Phone className="w-4 h-4 text-[#164E3D]" />
                <span>{business.contactPhone}</span>
              </a>
            )}
            {business.websiteUrl && (
              <a
                href={business.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#164E3D]"
              >
                <Globe className="w-4 h-4 text-[#164E3D]" />
                <span>Official Website ↗</span>
              </a>
            )}
            {business.socialUrl && (
              <a
                href={business.socialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#164E3D]"
              >
                <Share2 className="w-4 h-4 text-[#164E3D]" />
                <span>Social Media ↗</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Available offline on this device</span>
            </div>
            <span className="text-[11px] text-stone-400">
              Last updated: {new Date(business.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Review Status */}
      <ReviewStatusBadge status={business.status} isDemo={business.isDemo} showExplanation={false} />

      {/* Split Layout: Branches & Menu Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Branches & Directions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-serif text-[#164E3D]">
                {t('bizBranches')} ({business.branches.length})
              </h2>
              <span className="text-[11px] text-stone-400">{t('bizSelectBranch')}</span>
            </div>

            {/* Branch Cards */}
            <div className="space-y-2.5">
              {business.branches.map((branch) => {
                const isSelected = branch.id === selectedBranch?.id;
                return (
                  <div
                    key={branch.id}
                    onClick={() => setSelectedBranchId(branch.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#164E3D] bg-[#E8F3EE]/40 shadow-xs'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs text-stone-900 mb-1">
                      <span>{branch.branchName}</span>
                      {branch.isMainBranch && (
                        <span className="text-[10px] bg-[#164E3D] text-white px-2 py-0.5 rounded-full font-bold">
                          {t('bizMainBranch')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>
                        {branch.address}, {branch.municipality}
                      </span>
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-2">
                      <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{branch.operatingHours || 'Hours not provided'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1">
                      <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{branch.contactPhone || 'Phone not provided'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* External Directions Link */}
            {selectedBranch && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#164E3D] hover:bg-[#123E30] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t('bizDirections')}</span>
              </a>
            )}
          </div>

          {/* Interactive Branch Map Preview */}
          {selectedBranch && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Map Location: {selectedBranch.branchName}
              </h3>
              <LeafletMap
                businesses={[business]}
                userLocation={userLocation}
                radiusKm={radiusKm}
                className="h-64 w-full"
              />
            </div>
          )}
        </div>

        {/* Right Column: Listed Dishes, Menus, and Pasalubong Products */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#164E3D]">
                  {t('bizMenuOfferings')} ({business.products.length})
                </h2>
                <p className="text-xs text-stone-500">
                  Indicative prices in Philippine pesos (₱) and owner-reported availability.
                </p>
              </div>

              {/* Product Type Filter Pills */}
              <div className="inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-100 text-xs">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    activeTab === 'all' ? 'bg-[#164E3D] text-white' : 'text-stone-600'
                  }`}
                >
                  {t('bizTabAll')} ({business.products.length})
                </button>
                <button
                  onClick={() => setActiveTab('food')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    activeTab === 'food' ? 'bg-[#164E3D] text-white' : 'text-stone-600'
                  }`}
                >
                  {t('bizTabFood')}
                </button>
                <button
                  onClick={() => setActiveTab('pasalubong')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    activeTab === 'pasalubong' ? 'bg-[#164E3D] text-white' : 'text-stone-600'
                  }`}
                >
                  {t('bizTabPasalubong')}
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <Utensils className="w-8 h-8 mx-auto" />
                <p className="text-xs font-semibold">No products listed in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map((prod) => {
                  const offeringBranches = business.branches.filter((b) =>
                    prod.branchIds.includes(b.id)
                  );

                  return (
                    <div
                      key={prod.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-all flex flex-col justify-between space-y-3"
                    >
                      {prod.image && (
                        <div className="h-36 rounded-xl overflow-hidden bg-stone-100 mb-1">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              prod.isPasalubong
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-[#E8F3EE] text-[#164E3D]'
                            }`}
                          >
                            {prod.isPasalubong ? 'Pasalubong' : prod.category}
                          </span>

                          {/* Availability badge */}
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              prod.availability === 'available'
                                ? 'bg-emerald-50 text-emerald-800'
                                : prod.availability === 'seasonal'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {prod.availability === 'available'
                              ? 'In Stock'
                              : prod.availability === 'seasonal'
                              ? 'Seasonal'
                              : 'Call to check'}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-stone-900 font-serif">
                          {prod.name}
                        </h3>

                        {prod.description && (
                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>
                        )}
                      </div>

                      {/* Offering Branches association */}
                      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                        <div className="text-[11px] text-stone-500 truncate max-w-[160px]">
                          <strong>Available at:</strong>{' '}
                          {offeringBranches.map((b) => b.branchName).join(', ') || 'All Branches'}
                        </div>

                        <div className="font-bold text-[#164E3D] text-sm whitespace-nowrap">
                          {prod.price !== null ? `₱${prod.price.toLocaleString()}` : 'Price not provided'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        businessId={business.id}
        businessName={business.name}
        branchId={selectedBranch?.id}
        branchName={selectedBranch?.branchName}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
