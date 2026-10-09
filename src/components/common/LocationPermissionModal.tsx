import React from 'react';
import { MapPin, Navigation, Shield, CheckCircle2, X } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export const LocationPermissionModal: React.FC = () => {
  const { showPermissionExplanation, cancelPermissionRequest, confirmAndRequestPermission } =
    useLocation();

  if (!showPermissionExplanation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E0D8] text-[#1E2922] relative">
        <button
          onClick={cancelPermissionRequest}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F3EE] text-[#164E3D] flex items-center justify-center">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#164E3D] font-serif">
              Enable Live Nearby Discovery
            </h3>
            <p className="text-xs text-stone-500">Why KaonTa Bohol needs your location</p>
          </div>
        </div>

        <div className="space-y-3.5 text-sm text-stone-600 mb-6">
          <p className="leading-relaxed">
            As you explore Bohol—whether strolling through downtown Tagbilaran, walking along Panglao
            beaches, or passing through Loboc—<strong>Live Nearby</strong> automatically updates the
            map and lists approved local food spots and pasalubong makers entering your chosen radius
            (1 km to 10 km).
          </p>

          <div className="bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2EBE6] space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#164E3D] shrink-0 mt-0.5" />
              <span>
                <strong>Straight-line calculation:</strong> Used only to calculate approximate
                distance to nearby kitchen doors and pasalubong shops.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#164E3D] shrink-0 mt-0.5" />
              <span>
                <strong>Strict Privacy Promise:</strong> We never log, store, or sell your movement
                history. Your coordinates remain in your browser session only.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#164E3D] shrink-0 mt-0.5" />
              <span>
                <strong>Manual alternative:</strong> If you prefer not to share GPS, you can freely
                browse by selecting any Bohol municipality at any time.
              </span>
            </div>
          </div>

          <p className="text-[11px] text-stone-400 italic">
            Note: "Real-time" means results refresh as your location changes. It does not imply live
            inventory or guaranteed store opening hours.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
          <button
            onClick={cancelPermissionRequest}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium text-sm transition-colors"
          >
            I'll Search Manually
          </button>
          <button
            onClick={confirmAndRequestPermission}
            className="px-5 py-2.5 rounded-xl bg-[#164E3D] hover:bg-[#123E30] text-white font-semibold text-sm transition-all shadow-md shadow-[#164E3D]/20 flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Allow & Enable Live Nearby
          </button>
        </div>
      </div>
    </div>
  );
};
