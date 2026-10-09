import React, { useState } from 'react';
import {
  Home,
  Navigation,
  Menu,
  X,
  Store,
  ChevronDown,
  LogOut,
  Shield,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../common/LanguageToggle';
import { ProfileModal } from '../auth/ProfileModal';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const { user, role, logout, switchDemoRole, isAuthenticated } = useAuth();
  const { isLiveNearbyActive, status, statusMessage, isSimulating } = useLocation();
  const { t, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isHomeActive = currentPath === '/' || currentPath === '' || currentPath === '#/';

  const navLinks = [
    { label: t('navExplore'), path: '/explore' },
    { label: t('navPasalubong'), path: '/pasalubong' },
    { label: t('navAbout'), path: '/about' },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 apple-glass border-b border-black/[0.06] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#164E3D] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-sm">
              KT
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-base sm:text-lg tracking-tight text-[#1D1D1F]">
                KaonTa
              </span>
              <span className="font-normal text-base sm:text-lg tracking-tight text-[#164E3D]">
                Bohol
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-[13px] font-medium text-[#1D1D1F]/80">
            {/* Prominent Home Button */}
            <button
              onClick={() => handleNavClick('/')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                isHomeActive
                  ? 'bg-[#164E3D] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-black/[0.04]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('navHome')}</span>
            </button>

            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-black/[0.06] text-[#164E3D] font-semibold'
                      : 'hover:text-[#1D1D1F] hover:bg-black/[0.03]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            <button
              onClick={() => handleNavClick(isAuthenticated && role === 'owner' ? '/owner' : '/register')}
              className="px-3 py-1.5 text-[#164E3D] hover:text-[#0E3328] font-semibold transition-colors cursor-pointer rounded-full hover:bg-[#E8F3EE]/60"
            >
              {t('navListBusiness')}
            </button>
          </nav>

          {/* Right Action: Language Toggle, Live Status & Account */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Desktop Language Toggle */}
            <LanguageToggle variant="pill" />

            {/* Live Nearby status pill */}
            <button
              onClick={() => handleNavClick('/explore')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                isLiveNearbyActive
                  ? isSimulating
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-[#E8F3EE] text-[#164E3D] border border-[#C5E1D4]'
                  : 'bg-black/[0.04] text-stone-600 hover:bg-black/[0.07]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveNearbyActive
                    ? isSimulating
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-emerald-600 animate-ping'
                    : 'bg-stone-400'
                }`}
              />
              <span className="text-[12px]">
                {isLiveNearbyActive
                  ? isSimulating
                    ? t('navSimulating')
                    : t('navLiveNearby')
                  : t('navNearby')}
              </span>
            </button>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-black/[0.04] text-xs font-medium text-stone-700 transition-colors cursor-pointer"
              >
                <span className="capitalize">
                  {role === 'visitor' ? t('roleVisitor') : role === 'owner' ? t('roleOwner') : t('roleAdmin')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-black/[0.08] py-1.5 text-xs z-50">
                  <div className="px-3 py-1.5 border-b border-black/[0.06] text-stone-500">
                    <p className="font-semibold text-stone-800 truncate">{user ? user.name : t('roleVisitor')}</p>
                    <p className="text-[10px] text-stone-400 truncate">{user?.email || t('publicMode')}</p>
                  </div>

                  {role === 'admin' && (
                    <button
                      onClick={() => {
                        handleNavClick('/admin');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-stone-800 hover:bg-black/[0.04] font-medium flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      {t('adminDashboard')}
                    </button>
                  )}

                  {role === 'owner' && (
                    <button
                      onClick={() => {
                        handleNavClick('/owner');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-stone-800 hover:bg-black/[0.04] font-medium flex items-center gap-2"
                    >
                      <Store className="w-3.5 h-3.5 text-amber-600" />
                      {t('ownerDashboard')}
                    </button>
                  )}

                  {user && (
                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-stone-800 hover:bg-black/[0.04] font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-stone-600" />
                      <span>Account Profile & Security</span>
                    </button>
                  )}

                  <div className="px-3 py-1 text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
                    {t('roleSwitcher')}
                  </div>

                  <button
                    onClick={async () => {
                      await switchDemoRole('visitor');
                      setRoleDropdownOpen(false);
                      handleNavClick('/');
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-black/[0.04] ${
                      role === 'visitor' ? 'font-semibold text-[#164E3D]' : 'text-stone-600'
                    }`}
                  >
                    <span>{t('roleVisitor')}</span>
                    {role === 'visitor' && <span className="text-[10px] text-emerald-600">✓</span>}
                  </button>

                  <button
                    onClick={async () => {
                      await switchDemoRole('owner');
                      setRoleDropdownOpen(false);
                      handleNavClick('/owner');
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-black/[0.04] ${
                      role === 'owner' ? 'font-semibold text-[#164E3D]' : 'text-stone-600'
                    }`}
                  >
                    <span>{t('roleOwner')}</span>
                    {role === 'owner' && <span className="text-[10px] text-amber-600">✓</span>}
                  </button>

                  <button
                    onClick={async () => {
                      await switchDemoRole('admin');
                      setRoleDropdownOpen(false);
                      handleNavClick('/admin');
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-black/[0.04] ${
                      role === 'admin' ? 'font-semibold text-[#164E3D]' : 'text-stone-600'
                    }`}
                  >
                    <span>{t('roleAdmin')}</span>
                    {role === 'admin' && <span className="text-[10px] text-blue-600">✓</span>}
                  </button>

                  <div className="border-t border-black/[0.06] mt-1 pt-1">
                    {isAuthenticated ? (
                      <button
                        onClick={async () => {
                          await logout();
                          setRoleDropdownOpen(false);
                          handleNavClick('/');
                        }}
                        className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t('signOut')}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleNavClick('/login');
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-[#164E3D] hover:bg-black/[0.04] font-semibold"
                      >
                        {t('signIn')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile top bar buttons */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Mobile Language Toggle */}
            <LanguageToggle variant="compact" />

            {/* Dedicated Visible Home Navigation Button */}
            <button
              onClick={() => handleNavClick('/')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isHomeActive
                  ? 'bg-[#164E3D] text-white shadow-xs'
                  : 'text-stone-700 bg-black/[0.04] hover:bg-black/[0.08]'
              }`}
              title="Return to Home"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('navHome')}</span>
            </button>

            <button
              onClick={() => handleNavClick('/explore')}
              className={`px-2 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                isLiveNearbyActive ? 'bg-[#E8F3EE] text-[#164E3D]' : 'text-stone-600 bg-black/[0.04]'
              }`}
              title="Map"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-stone-700 hover:bg-black/[0.04]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/[0.06] bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3">
          {/* Mobile Language Toggle in Drawer */}
          <LanguageToggle variant="drawer" className="border-b border-black/[0.06] pb-2" />

          <div className="space-y-1">
            {/* Mobile Home Button */}
            <button
              onClick={() => handleNavClick('/')}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                isHomeActive
                  ? 'bg-[#164E3D] text-white font-semibold'
                  : 'text-stone-800 hover:bg-black/[0.04]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t('navHome')}</span>
            </button>

            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#164E3D] text-white font-semibold'
                      : 'text-stone-800 hover:bg-black/[0.04]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={() => handleNavClick(isAuthenticated && role === 'owner' ? '/owner' : '/register')}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-[#164E3D] hover:bg-emerald-50"
            >
              {t('navListBusiness')}
            </button>
            {user && (
              <button
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-black/[0.04] flex items-center gap-2"
              >
                <User className="w-4 h-4 text-stone-500" />
                <span>Account Profile & Security</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs">
            <span className="text-stone-500">{t('roleSwitcher')}:</span>
            <div className="flex gap-1.5">
              {(['visitor', 'owner', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={async () => {
                    await switchDemoRole(r);
                    setMobileMenuOpen(false);
                    if (r === 'owner') handleNavClick('/owner');
                    else if (r === 'admin') handleNavClick('/admin');
                  }}
                  className={`px-2.5 py-1 rounded-full capitalize font-medium ${
                    role === r ? 'bg-[#164E3D] text-white' : 'bg-black/[0.04] text-stone-700'
                  }`}
                >
                  {r === 'visitor' ? t('roleVisitor') : r === 'owner' ? t('roleOwner') : t('roleAdmin')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Profile & Security Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onNavigate={onNavigate}
      />
    </header>
  );
};
