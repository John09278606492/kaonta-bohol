import React from 'react';
import { useTranslations } from '../../context/LanguageContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t, isBisaya } = useTranslations();

  return (
    <footer className="bg-stone-100 text-stone-600 border-t border-black/[0.06] pt-12 pb-10 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-2">
            <div className="font-semibold text-stone-900 text-sm tracking-tight">
              KaonTa Bohol
            </div>
            <p className="text-[12px] text-stone-500 leading-relaxed">
              {isBisaya
                ? 'Pangitaa ang lami sa Bohol. Tabangi ang mga lokal nga negosyo.'
                : 'Discover local flavors. Support local businesses. Free for everyone.'}
            </p>
          </div>

          {/* Directory */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-stone-900 text-[12px]">{t('navExplore')}</h4>
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {t('navHome')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/explore')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {t('navMap')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/pasalubong')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {t('navPasalubong')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/search')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {t('homeSearchBtn')}
                </button>
              </li>
            </ul>
          </div>

          {/* Businesses */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-stone-900 text-[12px]">
              {isBisaya ? 'Para sa Negosyo' : 'For Businesses'}
            </h4>
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <button
                  onClick={() => onNavigate('/register')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {t('navListBusiness')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/login')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {isBisaya ? 'Sulod sa Tag-iya' : 'Owner Sign In'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/guidelines')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {isBisaya ? 'Mga Giya sa Paglista' : 'Listing Guidelines'}
                </button>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-stone-900 text-[12px]">
              {isBisaya ? 'Impormasyon' : 'Information'}
            </h4>
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {t('navAbout')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/privacy')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {isBisaya ? 'Polisiya sa Pribasiya' : 'Privacy Policy'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-400">
          <div>&copy; {new Date().getFullYear()} KaonTa Bohol. All rights reserved.</div>
          <div className="flex gap-4">
            <button onClick={() => onNavigate('/privacy')} className="hover:text-stone-600 cursor-pointer">
              Privacy
            </button>
            <button onClick={() => onNavigate('/guidelines')} className="hover:text-stone-600 cursor-pointer">
              Guidelines
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
