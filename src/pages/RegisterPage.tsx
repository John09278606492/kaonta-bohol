import React, { useState, useEffect } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Category, Municipality } from '../types';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { user, register, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);

  // Account fields (if not authenticated)
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [password, setPassword] = useState('');

  // Business fields
  const [businessName, setBusinessName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [socialUrl, setSocialUrl] = useState('');

  // Initial branch fields
  const [branchName, setBranchName] = useState('Main Branch');
  const [municipality, setMunicipality] = useState('Tagbilaran City');
  const [address, setAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('Mon-Sun 8:00 AM - 8:00 PM');
  const [latitude, setLatitude] = useState('9.6496');
  const [longitude, setLongitude] = useState('123.8547');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successSubmission, setSuccessSubmission] = useState<any>(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, munis] = await Promise.all([
          api.getCategories(),
          api.getMunicipalities(),
        ]);
        setCategories(cats);
        setMunicipalities(munis);
        if (cats.length > 0) setCategoryId(cats[0].id);
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  // Update default coordinates when municipality changes
  const handleMunicipalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const muniName = e.target.value;
    setMunicipality(muniName);
    const found = municipalities.find((m) => m.name === muniName);
    if (found) {
      setLatitude(found.lat.toString());
      setLongitude(found.lng.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. If not authenticated, register owner account first
      if (!isAuthenticated) {
        if (!ownerName || !ownerEmail || !password) {
          throw new Error('Please fill in your owner name, email, and password.');
        }
        await register(ownerName, ownerEmail, password, 'owner', contactPhone);
      }

      // 2. Submit business listing
      const res = await api.submitNewBusiness({
        name: businessName,
        categoryId,
        description,
        contactPhone,
        websiteUrl,
        socialUrl,
        branchName,
        address,
        municipality,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        operatingHours,
      });

      setSuccessSubmission(res.submission);
    } catch (err: any) {
      setError(err.message || 'Failed to submit business registration. Please check fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-stone-800">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3EE] text-[#164E3D] text-xs font-bold border border-[#C5E1D4]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Free Forever • Zero Commission</span>
        </div>
        <h1 className="text-3xl font-black font-serif text-[#164E3D]">
          Register Your Bohol Food Business
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          Gain free visibility for your Boholano restaurant, eatery, or authentic pasalubong products.
        </p>
      </div>

      {successSubmission ? (
        <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-stone-900">
            Listing Submitted for Review!
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            Salamat! Your business <strong>"{businessName}"</strong> has been recorded. It is
            currently in <strong>Pending Administrator Review</strong> status to verify local
            authenticity. It remains hidden publicly until an administrator approves it.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('/owner')}
              className="px-5 py-2.5 bg-[#164E3D] text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Go to Owner Dashboard
            </button>
            <button
              onClick={() => onNavigate('/explore')}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
            >
              Explore Other Listings
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-xs">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Owner Account Section if not signed in */}
          {!isAuthenticated && (
            <div className="space-y-3 pb-6 border-b border-stone-200">
              <h3 className="font-bold text-sm text-stone-900 font-serif">1. Owner Account Details</h3>
              <p className="text-stone-500 text-[11px]">
                You will use this account to manage your business branches and products.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Maria Elena Chatto"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="name@business.ph"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Create Password (min. 8 characters) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full sm:w-1/2 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
                />
              </div>
            </div>
          )}

          {/* Business Profile */}
          <div className="space-y-4 pb-6 border-b border-stone-200">
            <h3 className="font-bold text-sm text-stone-900 font-serif">2. Business Profile</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Loboc Native River Kitchen"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share your culinary heritage, specialties, or pasalubong offerings..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Website URL (Optional)</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Social Media Link (Optional)</label>
                <input
                  type="url"
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Initial Branch */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-stone-900 font-serif">
              3. Initial Branch Location
            </h3>
            <p className="text-stone-500 text-[11px]">
              You can add more branches later inside your Owner Dashboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Main Branch"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Municipality *</label>
                <select
                  required
                  value={municipality}
                  onChange={handleMunicipalityChange}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
                >
                  {municipalities.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Physical Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street / Barangay / Landmark"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="Mon-Sun 8:00 AM - 8:00 PM"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D6] text-[11px] text-stone-500 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <span>
              By registering, you confirm that this is a genuine Boholano food establishment. Your
              listing will undergo administrator review before becoming publicly visible in search
              and Live Nearby.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#164E3D] hover:bg-[#123E30] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Submitting Registration...' : 'Submit Business Listing (Free)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
