import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '../../context/LanguageContext';

interface LanguageToggleProps {
  variant?: 'pill' | 'compact' | 'drawer';
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center rounded-full bg-black/[0.05] p-0.5 border border-black/[0.04] text-xs font-medium select-none ${className}`}
        role="group"
        aria-label="Language Selector"
      >
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-white text-[#1D1D1F] shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          title="Switch to English"
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('ceb')}
          className={`px-2 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
            language === 'ceb'
              ? 'bg-[#164E3D] text-white shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          title="Balhin sa Bisaya"
        >
          BSY
        </button>
      </div>
    );
  }

  if (variant === 'drawer') {
    return (
      <div className={`flex items-center justify-between py-2 text-xs ${className}`}>
        <div className="flex items-center gap-2 text-stone-600 font-medium">
          <Globe className="w-3.5 h-3.5 text-stone-400" />
          <span>Pinulongan / Language:</span>
        </div>
        <div className="inline-flex items-center rounded-full bg-black/[0.05] p-0.5 border border-black/[0.04]">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              language === 'en'
                ? 'bg-white text-[#1D1D1F] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ceb')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              language === 'ceb'
                ? 'bg-[#164E3D] text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Bisaya
          </button>
        </div>
      </div>
    );
  }

  // Default 'pill' variant for Desktop Header
  return (
    <div
      className={`inline-flex items-center rounded-full bg-black/[0.04] hover:bg-black/[0.06] p-0.5 border border-black/[0.04] transition-all select-none ${className}`}
      role="group"
      aria-label="Language Selector"
    >
      <div className="pl-2 pr-1 text-stone-400">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-white text-[#1D1D1F] shadow-xs'
            : 'text-stone-500 hover:text-stone-800'
        }`}
        title="English"
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ceb')}
        className={`px-2.5 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
          language === 'ceb'
            ? 'bg-[#164E3D] text-white shadow-xs'
            : 'text-stone-500 hover:text-stone-800'
        }`}
        title="Bisaya (Boholano)"
      >
        Bisaya
      </button>
    </div>
  );
};
