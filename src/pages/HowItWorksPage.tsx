import React from 'react';
import {
  Navigation,
  Compass,
  MapPin,
  ShieldCheck,
  Store,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-stone-800">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#164E3D]">
          How KaonTa Bohol Works
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
          A step-by-step guide to our Live Nearby geolocation discovery and free business listing
          workflow.
        </p>
      </div>

      {/* For Visitors: Live Nearby */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#E8F3EE] text-[#164E3D] flex items-center justify-center">
            <Navigation className="w-5 h-5 text-[#D97706]" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-[#164E3D]">For Visitors & Foodies</h2>
            <p className="text-xs text-stone-500">How Live Nearby behaves as you travel</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <strong className="text-stone-900 block font-serif">1. Enable Live Nearby</strong>
            <p>
              Click "Enable Live Nearby". You will see an explanation dialog before browser
              permission is requested. Once granted, KaonTa Bohol watches your position using the
              device's GPS or network location.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <strong className="text-stone-900 block font-serif">
              2. Dynamic Radius Calculation
            </strong>
            <p>
              Choose your discovery radius: 1 km, 3 km, 5 km, or 10 km. As you move between Bohol
              towns, straight-line distances recalculate instantly. Eateries entering your radius
              appear on the map and card list; those leaving the radius drop off seamlessly.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <strong className="text-stone-900 block font-serif">3. Smart Power & Privacy Saving</strong>
            <p>
              When you minimize your browser or switch tabs, location watching pauses to save device
              battery. When you return to KaonTa Bohol, it fetches a fresh location update
              automatically.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <strong className="text-stone-900 block font-serif">4. Manual Search Fallback</strong>
            <p>
              Prefer not to share GPS? You can select any Bohol municipality (e.g. Panglao, Carmen,
              Jagna) to browse in Manual Mode without automatic movement overwriting your view.
            </p>
          </div>
        </div>
      </div>

      {/* For Business Owners */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#E8F3EE] text-[#164E3D] flex items-center justify-center">
            <Store className="w-5 h-5 text-[#D97706]" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-[#164E3D]">For Local Business Owners</h2>
            <p className="text-xs text-stone-500">Free, transparent listing and verification</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <strong className="text-stone-900 block font-serif">1. Register Free</strong>
            <p>
              Sign up as a business owner in seconds with your name, contact phone, and email. No
              payment details required.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <strong className="text-stone-900 block font-serif">2. Add Branches & Products</strong>
            <p>
              Input your physical branches with exact Bohol municipality and coordinates. Add your
              signature dishes and pasalubong items with indicative prices and availability. Link
              products directly to the branches that actually carry them.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <strong className="text-stone-900 block font-serif">3. Volunteer Admin Review</strong>
            <p>
              Our moderation team checks your listing for clarity and local authenticity. Once
              approved, your establishment appears in public search results and Live Nearby.
            </p>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={() => onNavigate('/register')}
            className="px-6 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs shadow-md transition-all"
          >
            Register Your Business (100% Free)
          </button>
        </div>
      </div>
    </div>
  );
};
