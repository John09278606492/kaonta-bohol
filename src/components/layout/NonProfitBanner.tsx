import React from 'react';
import { HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';

export const NonProfitBanner: React.FC = () => {
  return (
    <div className="bg-[#164E3D] text-[#E8F3EE] px-4 py-2.5 text-xs sm:text-sm font-medium border-b border-[#0F362A]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center md:text-left">
          <HeartHandshake className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>
            <strong className="text-white font-semibold">Non-Profit Bohol Food Platform:</strong>{' '}
            “Discover local flavors. Support local businesses. Free for everyone.”
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] sm:text-xs text-[#C5E1D4]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            100% Free Listings & Browsing
          </span>
          <span className="hidden sm:inline text-white/30">•</span>
          <span>Zero Commission</span>
          <span className="hidden sm:inline text-white/30">•</span>
          <span>No Paid Placements</span>
          <span className="hidden sm:inline text-white/30">•</span>
          <span>No Personal Data Sold</span>
        </div>
      </div>
    </div>
  );
};
