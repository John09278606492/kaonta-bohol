import React from 'react';
import {
  Compass,
  MapPin,
  Utensils,
  Gift,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Home,
} from 'lucide-react';
import { useTranslations } from '../context/LanguageContext';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { t, isBisaya } = useTranslations();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 text-[#1D1D1F]">
      {/* Breadcrumb with Home Navigation */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 font-medium text-stone-700 hover:text-[#164E3D] transition-colors bg-white px-3 py-1.5 rounded-full border border-black/[0.06] shadow-2xs cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-[#164E3D]" />
          <span>{t('navHome')}</span>
        </button>
        <span className="text-stone-300">/</span>
        <span className="text-stone-900 font-medium">{t('navAbout')}</span>
      </div>

      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-[#1D1D1F]">
          {t('aboutTitle')}
        </h1>
        <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed">
          {t('aboutSub')}
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="apple-card p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F3EE] text-[#164E3D] flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
            {isBisaya ? 'Pangita Duol sa Lokasyon' : 'Location-Based Discovery'}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed font-normal">
            {isBisaya
              ? 'Nagsuroy ka man sa Tagbilaran, nagpahulay sa Panglao, o nagbaktas sa Jagna ug Carmen, ang among Live Nearby nag-update sa mga kan-anan ug pasalubong nga duol kanimo.'
              : 'Whether you are strolling through Tagbilaran, exploring Panglao beaches, or road-tripping through Jagna and Carmen, our Live Nearby feature dynamically refreshes dining spots and delicacies around you.'}
          </p>
        </div>

        <div className="apple-card p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F3EE] text-[#164E3D] flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
            {isBisaya ? 'Tinuod nga mga Delikasiya sa Bohol' : 'Authentic Bohol Delicacies'}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed font-normal">
            {isBisaya
              ? 'Gikan sa tradisyonal nga Jagna Calamay sa bagol hangtod sa tam-is nga Peanut Kisses, halang nga native chicken halang-halang, ug preskong isda, tilawi ang tinuod nga kultura sa Bohol.'
              : 'From traditional Jagna Calamay in coconut shells to crispy Peanut Kisses, spicy native chicken halang-halang, and freshly caught seafood, find the genuine tastes of Boholano culture.'}
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div className="apple-card p-8 sm:p-10 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
            {isBisaya ? 'Mga Baruganan sa Plataporma' : 'Platform Principles'}
          </h2>
          <p className="text-sm text-stone-500 mt-1 font-normal">
            {isBisaya
              ? 'Gihimo uban ang katin-aw, kasayon, ug pagtutok sa komunidad.'
              : 'Built with transparency, simplicity, and community focus.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1.5">
            <h3 className="font-semibold text-sm text-[#1D1D1F]">
              {isBisaya ? 'Libre ug Bukas' : 'Free & Open Access'}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              {isBisaya
                ? 'Walay bayad o suskrisyon aron makita ug makapangita sa mga kan-anan sa tibuok Bohol.'
                : 'No paywalls, subscriptions, or fees to browse and search food listings across Bohol.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-semibold text-sm text-[#1D1D1F]">
              {isBisaya ? 'Tabang sa Lokal nga Negosyo' : 'Local Business Visibility'}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              {isBisaya
                ? 'Paghatag og kahigayonan sa mga lokal nga kan-anan ug tigbuhat og pasalubong nga ipaila ang ilang produkto.'
                : 'Empowering neighborhood diners, family kitchens, and pasalubong artisans to share their menus with visitors.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-semibold text-sm text-[#1D1D1F]">
              {isBisaya ? 'Seguridad sa Impormasyon' : 'Privacy Conscious'}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              {isBisaya
                ? 'Ang pagkalkula sa gilay-on ginahimo lamang sulod sa imong browser ug dili gina-rekord o ibaligya.'
                : 'Location updates happen purely inside your browser to calculate distances, with no personal tracking or resale.'}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('/explore')}
          className="px-8 py-3.5 rounded-full bg-[#164E3D] hover:bg-[#113B2E] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          {isBisaya ? 'Susiha ang mga Kan-anan Duol Kanimo' : 'Explore Nearby Food Spots'}
        </button>
      </div>
    </div>
  );
};
