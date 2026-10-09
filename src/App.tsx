import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { LanguageProvider } from './context/LanguageContext';
import { NonProfitBanner } from './components/layout/NonProfitBanner';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LocationPermissionModal } from './components/common/LocationPermissionModal';
import { SimulatorControl } from './components/map/SimulatorControl';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { AuthGuard } from './components/auth/AuthGuard';

// Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { BusinessDetailsPage } from './pages/BusinessDetailsPage';
import { PasalubongPage } from './pages/PasalubongPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ListingGuidelinesPage } from './pages/ListingGuidelinesPage';
import { PrivacyNoticePage } from './pages/PrivacyNoticePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { OwnerBusinessEditPage } from './pages/OwnerBusinessEditPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  const [currentHash, setCurrentHash] = useState<string>(
    typeof window !== 'undefined' ? window.location.hash || '#/' : '#/'
  );

  // Search parameters for passing from home to search/explore
  const [searchParams, setSearchParams] = useState<{
    query: string;
    municipality?: string;
    category?: string;
  }>({ query: '' });

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path.startsWith('#') ? path : `#${path}`;
  };

  const handleHomeSearch = (query: string, municipality?: string, category?: string) => {
    setSearchParams({ query, municipality, category });
  };

  // Route matching
  const cleanPath = currentHash.replace(/^#/, '') || '/';

  let pageContent = <HomePage onNavigate={navigate} onSearch={handleHomeSearch} />;

  if (cleanPath === '/' || cleanPath === '') {
    pageContent = <HomePage onNavigate={navigate} onSearch={handleHomeSearch} />;
  } else if (cleanPath.startsWith('/explore')) {
    pageContent = (
      <ExplorePage
        onNavigate={navigate}
        initialQuery={searchParams.query}
        initialMunicipality={searchParams.municipality}
        initialCategory={searchParams.category}
      />
    );
  } else if (cleanPath.startsWith('/search')) {
    pageContent = (
      <SearchResultsPage
        onNavigate={navigate}
        searchQuery={searchParams.query}
        selectedMuni={searchParams.municipality}
        selectedCat={searchParams.category}
      />
    );
  } else if (cleanPath.startsWith('/business/')) {
    const id = cleanPath.split('/business/')[1];
    pageContent = <BusinessDetailsPage businessId={id} onNavigate={navigate} />;
  } else if (cleanPath === '/pasalubong') {
    pageContent = <PasalubongPage onNavigate={navigate} />;
  } else if (cleanPath === '/about') {
    pageContent = <AboutPage onNavigate={navigate} />;
  } else if (cleanPath === '/how-it-works') {
    pageContent = <HowItWorksPage onNavigate={navigate} />;
  } else if (cleanPath === '/guidelines') {
    pageContent = <ListingGuidelinesPage onNavigate={navigate} />;
  } else if (cleanPath === '/privacy') {
    pageContent = <PrivacyNoticePage onNavigate={navigate} />;
  } else if (cleanPath === '/login') {
    pageContent = <LoginPage onNavigate={navigate} />;
  } else if (cleanPath === '/register') {
    pageContent = <RegisterPage onNavigate={navigate} />;
  } else if (cleanPath === '/owner') {
    pageContent = (
      <AuthGuard requiredRole="owner" onNavigate={navigate}>
        <OwnerDashboardPage onNavigate={navigate} />
      </AuthGuard>
    );
  } else if (cleanPath.startsWith('/owner/business/')) {
    const id = cleanPath.split('/owner/business/')[1];
    pageContent = (
      <AuthGuard requiredRole="owner" onNavigate={navigate}>
        <OwnerBusinessEditPage businessId={id} onNavigate={navigate} />
      </AuthGuard>
    );
  } else if (cleanPath.startsWith('/admin')) {
    pageContent = (
      <AuthGuard requiredRole="admin" onNavigate={navigate}>
        <AdminDashboardPage onNavigate={navigate} />
      </AuthGuard>
    );
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <LocationProvider>
          <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#1E2922] font-sans selection:bg-[#E8F3EE] selection:text-[#164E3D]">
            {/* Navigation Bar */}
            <Header currentPath={cleanPath} onNavigate={navigate} />

            {/* Main Content Area */}
            <main className="flex-1">{pageContent}</main>

            {/* Footer */}
            <Footer onNavigate={navigate} />

            {/* Geolocation Explanation & Permission Dialog */}
            <LocationPermissionModal />

            {/* Dev Location Simulation Control Widget */}
            <SimulatorControl />

            {/* Connectivity Status & Offline Saved Restaurant Drawer */}
            <OfflineIndicator onNavigate={navigate} />
          </div>
        </LocationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
