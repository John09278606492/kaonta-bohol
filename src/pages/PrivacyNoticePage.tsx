import React from 'react';
import { Shield, Lock, EyeOff, Navigation, CheckCircle2 } from 'lucide-react';

interface PrivacyNoticePageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyNoticePage: React.FC<PrivacyNoticePageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-stone-800">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F3EE] text-[#164E3D] text-xs font-bold border border-[#C5E1D4]">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Non-Profit Privacy Charter</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#164E3D]">
          Privacy Notice & Geolocation Policy
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
          We protect your privacy by design. Learn how location data is handled in KaonTa Bohol.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-xs sm:text-sm text-stone-600 leading-relaxed">
        <div className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#164E3D]" />
            <span>1. How Your Coordinates Are Used</span>
          </h2>
          <p>
            When you select <strong>“Enable Live Nearby”</strong>, KaonTa Bohol asks for your
            browser's geolocation permission. Your coordinates (latitude and longitude) are used
            solely to calculate approximate straight-line distances to registered Boholano
            establishments and determine which businesses fall within your selected radius (1 km to
            10 km).
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-stone-100">
          <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-[#164E3D]" />
            <span>2. Zero Movement Tracking & No Coordinate Logging</span>
          </h2>
          <p>
            We strictly enforce a <strong>no-tracking policy</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-700">
            <li>We do not store your travel or movement history.</li>
            <li>We do not write precise coordinates into routine server access logs.</li>
            <li>
              Coordinates sent to the search endpoint are processed in-memory to filter nearby
              businesses and discarded immediately.
            </li>
            <li>
              When you close the browser tab or disable Live Nearby, all location state in the browser
              is cleared.
            </li>
          </ul>
        </div>

        <div className="space-y-3 pt-4 border-t border-stone-100">
          <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#164E3D]" />
            <span>3. No Sale or Monetization of Personal Information</span>
          </h2>
          <p>
            KaonTa Bohol is a 100% non-profit community project. We never sell, rent, license, or
            monetize user personal data, contact details, or location footprints to advertisers,
            brokers, or third-party networks.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-stone-100">
          <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#164E3D]" />
            <span>4. Manual Search Without GPS</span>
          </h2>
          <p>
            You are never required to share your device location. You can browse the entire directory
            by selecting any Bohol municipality manually, or typing any delicacy name directly into
            the search bar.
          </p>
        </div>
      </div>
    </div>
  );
};
