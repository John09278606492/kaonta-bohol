import React, { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  FileEdit,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Business } from '../types';
import { ReviewStatusBadge } from '../components/common/ReviewStatusBadge';

interface OwnerDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const OwnerDashboardPage: React.FC<OwnerDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBusinesses() {
      setIsLoading(true);
      try {
        const list = await api.getOwnerBusinesses();
        setBusinesses(list);
      } catch (err) {
        console.error('Error fetching owner businesses:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBusinesses();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-stone-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97706] uppercase tracking-wider mb-1">
            <Store className="w-3.5 h-3.5" />
            <span>Owner Management Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#164E3D]">
            Welcome, {user?.name || 'Business Owner'}
          </h1>
          <p className="text-xs text-stone-500">
            Manage your Bohol food establishments, branch locations, and products.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/register')}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#164E3D] hover:bg-[#123E30] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Another Business</span>
        </button>
      </div>

      {/* Business Listings */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-serif text-stone-900">
          Your Registered Businesses ({businesses.length})
        </h2>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-stone-500">
            Loading your business records...
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4">
            <Store className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-bold text-stone-800">No businesses listed yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Register your first Bohol eatery or pasalubong shop to gain free visibility.
            </p>
            <button
              onClick={() => onNavigate('/register')}
              className="px-5 py-2.5 bg-[#164E3D] text-white rounded-xl text-xs font-bold"
            >
              List Your Business Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map((biz) => {
              const mainBranch = biz.branches.find((b) => b.isMainBranch) || biz.branches[0];

              return (
                <div
                  key={biz.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs hover:border-[#164E3D] transition-all flex flex-col sm:flex-row justify-between gap-6"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-stone-100 overflow-hidden shrink-0">
                      <img
                        src={biz.bannerImage}
                        alt={biz.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <ReviewStatusBadge status={biz.status} isDemo={biz.isDemo} />
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-semibold">
                          {biz.categoryName}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-stone-900 font-serif">{biz.name}</h3>

                      <p className="text-xs text-stone-600 line-clamp-1 max-w-xl">
                        {biz.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          {biz.branches.length} {biz.branches.length === 1 ? 'Branch' : 'Branches'}{' '}
                          ({mainBranch?.municipality || 'Bohol'})
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-stone-400" />
                          {biz.products.length} {biz.products.length === 1 ? 'Product' : 'Products'}
                        </span>
                      </div>

                      {/* Administrator Feedback Notice if rejected or returned */}
                      {biz.moderationReason && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <span>
                            <strong>Administrator Note:</strong> {biz.moderationReason}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                    <button
                      onClick={() => onNavigate(`/owner/business/${biz.id}`)}
                      className="px-4 py-2 bg-[#164E3D] hover:bg-[#123E30] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Manage Branches & Dishes</span>
                    </button>

                    {biz.status === 'approved' && (
                      <button
                        onClick={() => onNavigate(`/business/${biz.id}`)}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Public Listing</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
