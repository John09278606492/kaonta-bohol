import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2, ChevronRight, Store, X } from 'lucide-react';
import { getCachedRestaurantIds, getRestaurantFromOfflineCache } from '../../lib/serviceWorker';
import { Business } from '../../types';

interface OfflineIndicatorProps {
  onNavigate?: (path: string) => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onNavigate }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [cachedBusinesses, setCachedBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      refreshCachedList();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    refreshCachedList();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshCachedList = () => {
    const ids = getCachedRestaurantIds();
    const list = ids
      .map((id) => getRestaurantFromOfflineCache(id))
      .filter((b): b is Business => b !== null);
    setCachedBusinesses(list);
  };

  if (isOnline) {
    return null;
  }

  return (
    <>
      {/* Floating Offline Toast Notification */}
      <div className="fixed bottom-4 left-4 z-50 max-w-sm apple-glass text-[#1D1D1F] px-4 py-2.5 rounded-full shadow-lg border border-black/[0.08] flex items-center justify-between gap-3 text-xs font-medium animate-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <WifiOff className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>Offline — Cached details active</span>
        </div>

        {cachedBusinesses.length > 0 && (
          <button
            onClick={() => {
              refreshCachedList();
              setShowDrawer(true);
            }}
            className="px-3 py-1 bg-[#164E3D] text-white rounded-full text-[11px] font-semibold shrink-0 hover:bg-[#113B2E] transition-colors cursor-pointer"
          >
            Saved ({cachedBusinesses.length})
          </button>
        )}
      </div>

      {/* Drawer showing previously viewed restaurants available offline */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08] text-[#1D1D1F] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1D1D1F] font-semibold text-base">
                <WifiOff className="w-4 h-4 text-amber-600" />
                <span>Saved Offline Restaurants</span>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              These restaurant profiles were cached during your previous visits and can be viewed
              without an active internet connection:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {cachedBusinesses.map((biz) => (
                <div
                  key={biz.id}
                  onClick={() => {
                    setShowDrawer(false);
                    if (onNavigate) {
                      onNavigate(`/business/${biz.id}`);
                    }
                  }}
                  className="p-3 bg-stone-50 hover:bg-[#E8F3EE]/60 rounded-2xl border border-black/[0.04] transition-colors cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="font-semibold text-stone-900 truncate">{biz.name}</div>
                    <div className="text-[11px] text-stone-500 truncate font-normal">
                      {biz.categoryName} • {biz.branches[0]?.municipality || 'Bohol'}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowDrawer(false)}
              className="w-full py-2.5 bg-[#164E3D] hover:bg-[#113B2E] text-white rounded-full text-xs font-semibold cursor-pointer transition-colors"
            >
              Continue Offline Browsing
            </button>
          </div>
        </div>
      )}
    </>
  );
};
