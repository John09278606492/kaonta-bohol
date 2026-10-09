import React from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ListingGuidelinesPageProps {
  onNavigate: (path: string) => void;
}

export const ListingGuidelinesPage: React.FC<ListingGuidelinesPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-stone-800">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#164E3D]">
          KaonTa Bohol Listing Guidelines
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
          Standards for maintaining an authentic, reliable community food directory for residents
          and visitors.
        </p>
      </div>

      {/* Review Status Explanation Box */}
      <div className="bg-[#E8F3EE] p-6 rounded-3xl border border-[#C5E1D4] space-y-3 text-xs sm:text-sm text-[#164E3D]">
        <div className="flex items-center gap-2 font-bold font-serif text-base">
          <Info className="w-5 h-5 text-[#164E3D]" />
          <span>Understanding Administrator Review Status</span>
        </div>
        <p className="leading-relaxed">
          An administrator-reviewed listing confirms that the business is an authentic physical
          establishment located within the province of Bohol, operating within our non-profit
          community framework.
        </p>
        <p className="leading-relaxed font-semibold">
          Important: An administrator review is NOT a health inspection, government sanitary permit,
          or food safety certification. All food safety responsibilities remain with the business
          and municipal licensing authorities.
        </p>
      </div>

      {/* What is accepted vs rejected */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-bold font-serif text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Eligible Listings</span>
          </div>
          <ul className="space-y-2.5 text-stone-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                Locally operating Boholano restaurants, native diners, roadside carinderias, and
                eateries.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                Authentic Bohol pasalubong producers (Calamay, Broas, Peanut Kisses, Tableya, Honey,
                native bakery goods).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                Food trucks, seaside sutukil and paluto stalls with fixed operating locations in
                Bohol.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Accurate operating hours and working contact numbers or social media links.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-red-700 font-bold font-serif text-base">
            <XCircle className="w-5 h-5 text-red-600" />
            <span>Ineligible Listings</span>
          </div>
          <ul className="space-y-2.5 text-stone-600">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>
                Businesses located outside the province of Bohol or lacking physical presence.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>
                Duplicate submissions for an existing branch or spam keyword stuffing.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>
                Misleading price claims, expired offers, or non-food commercial retail listings.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>Unauthorized use of copyrighted photos belonging to third parties.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Reporting inaccuracies */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-3 text-xs sm:text-sm text-stone-600">
        <h3 className="font-bold text-stone-900 font-serif text-base">
          Community Inaccuracy Reporting
        </h3>
        <p className="leading-relaxed">
          If you encounter a listing with outdated operating hours, an incorrect map pin, or a
          permanently closed branch, please use the "Report Inaccurate Information" button on any
          listing page. Our volunteer moderators review all notices and update the directory.
        </p>
      </div>
    </div>
  );
};
