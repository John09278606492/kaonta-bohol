import React, { useState, useEffect } from 'react';
import {
  Store,
  MapPin,
  Plus,
  Trash2,
  Clock,
  Phone,
  Save,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Tag,
  Gift,
  Utensils,
  Layers,
} from 'lucide-react';
import { api } from '../lib/api';
import { Business, Branch, Product, Category, Municipality } from '../types';
import { ReviewStatusBadge } from '../components/common/ReviewStatusBadge';

interface OwnerBusinessEditPageProps {
  businessId: string;
  onNavigate: (path: string) => void;
}

export const OwnerBusinessEditPage: React.FC<OwnerBusinessEditPageProps> = ({
  businessId,
  onNavigate,
}) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'branches' | 'products'>('profile');

  // Business form state
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [socialUrl, setSocialUrl] = useState('');

  // Add Branch Modal / Form state
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [bName, setBName] = useState('');
  const [bAddress, setBAddress] = useState('');
  const [bMunicipality, setBMunicipality] = useState('Tagbilaran City');
  const [bLat, setBLat] = useState('9.6496');
  const [bLng, setBLng] = useState('123.8547');
  const [bHours, setBHours] = useState('Mon-Sun 8:00 AM - 8:00 PM');
  const [bPhone, setBPhone] = useState('');

  // Add Product Modal / Form state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('Main Dish');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pAvailability, setPAvailability] = useState<'available' | 'seasonal' | 'out_of_stock'>(
    'available'
  );
  const [pIsPasalubong, setPIsPasalubong] = useState(false);
  const [pBranchIds, setPBranchIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [biz, cats, munis] = await Promise.all([
        api.getBusinessById(businessId),
        api.getCategories(),
        api.getMunicipalities(),
      ]);
      setBusiness(biz);
      setCategories(cats);
      setMunicipalities(munis);

      setName(biz.name);
      setCategoryId(biz.categoryId);
      setDescription(biz.description);
      setContactPhone(biz.contactPhone || '');
      setWebsiteUrl(biz.websiteUrl || '');
      setSocialUrl(biz.socialUrl || '');
      if (biz.branches.length > 0) {
        setPBranchIds(biz.branches.map((b) => b.id));
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Error loading business details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusNotice(null);
    setErrorNotice(null);

    try {
      const res = await api.updateBusiness(businessId, {
        name,
        categoryId,
        description,
        contactPhone,
        websiteUrl,
        socialUrl,
      });
      setStatusNotice(res.message);
      await loadData();
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bAddress || !bMunicipality) return;

    try {
      await api.addBranch({
        businessId,
        branchName: bName || `${bMunicipality} Branch`,
        address: bAddress,
        municipality: bMunicipality,
        latitude: parseFloat(bLat),
        longitude: parseFloat(bLng),
        operatingHours: bHours,
        contactPhone: bPhone || contactPhone,
        isMainBranch: business?.branches.length === 0,
      });
      setShowAddBranch(false);
      setBName('');
      setBAddress('');
      setStatusNotice('Branch added successfully.');
      await loadData();
    } catch (err: any) {
      setErrorNotice(err.message);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to remove this branch?')) return;
    try {
      await api.deleteBranch(branchId);
      setStatusNotice('Branch deleted.');
      await loadData();
    } catch (err: any) {
      setErrorNotice(err.message);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName) return;

    try {
      await api.addProduct({
        businessId,
        name: pName,
        category: pCategory,
        description: pDesc,
        price: pPrice ? parseFloat(pPrice) : null,
        availability: pAvailability,
        isPasalubong: pIsPasalubong,
        branchIds: pBranchIds.length > 0 ? pBranchIds : business?.branches.map((b) => b.id) || [],
      });
      setShowAddProduct(false);
      setPName('');
      setPDesc('');
      setPPrice('');
      setStatusNotice('Item added to menu/pasalubong list.');
      await loadData();
    } catch (err: any) {
      setErrorNotice(err.message);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    try {
      await api.deleteProduct(prodId);
      setStatusNotice('Item deleted.');
      await loadData();
    } catch (err: any) {
      setErrorNotice(err.message);
    }
  };

  if (isLoading || !business) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-xs text-stone-500">
        Loading business editor...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-stone-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <button
            onClick={() => onNavigate('/owner')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-2 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-[#164E3D]">{business.name}</h1>
            <ReviewStatusBadge status={business.status} isDemo={business.isDemo} />
          </div>
        </div>

        {/* Tab switchers */}
        <div className="inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-100 text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'profile' ? 'bg-[#164E3D] text-white shadow-2xs' : 'text-stone-700'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'branches' ? 'bg-[#164E3D] text-white shadow-2xs' : 'text-stone-700'
            }`}
          >
            Branches ({business.branches.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'products' ? 'bg-[#164E3D] text-white shadow-2xs' : 'text-stone-700'
            }`}
          >
            Dishes & Pasalubong ({business.products.length})
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{statusNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* TAB 1: PROFILE INFO */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <h2 className="text-base font-bold font-serif text-stone-900">
            Edit Establishment Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Business Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
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
            <label className="block font-semibold text-stone-700 mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Website URL</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Social URL</label>
              <input
                type="url"
                value={socialUrl}
                onChange={(e) => setSocialUrl(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <p className="text-[11px] text-stone-400">
            Note: Submitting updates queues a revision for administrator review. Your currently
            approved public details remain active until the update is approved.
          </p>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#164E3D] hover:bg-[#123E30] text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Submitting Revisions...' : 'Submit Profile Updates for Review'}</span>
          </button>
        </form>
      )}

      {/* TAB 2: BRANCHES */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-serif text-stone-900">
              Branch Locations ({business.branches.length})
            </h2>
            <button
              onClick={() => setShowAddBranch(true)}
              className="px-3.5 py-1.5 bg-[#164E3D] hover:bg-[#123E30] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Branch</span>
            </button>
          </div>

          {/* Add Branch Modal Form */}
          {showAddBranch && (
            <form onSubmit={handleCreateBranch} className="bg-stone-50 p-5 rounded-2xl border border-stone-300 space-y-3 text-xs">
              <h3 className="font-bold text-stone-900 text-sm">Add New Branch Location</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Branch Name</label>
                  <input
                    type="text"
                    required
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                    placeholder="e.g. Panglao Alona Branch"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Municipality</label>
                  <select
                    value={bMunicipality}
                    onChange={(e) => {
                      setBMunicipality(e.target.value);
                      const m = municipalities.find((mun) => mun.name === e.target.value);
                      if (m) {
                        setBLat(m.lat.toString());
                        setBLng(m.lng.toString());
                      }
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none"
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
                  <label className="block font-semibold mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={bAddress}
                    onChange={(e) => setBAddress(e.target.value)}
                    placeholder="Poblacion / Highway / Landmark"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={bHours}
                    onChange={(e) => setBHours(e.target.value)}
                    placeholder="Mon-Sun 8:00 AM - 8:00 PM"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono">
                <div>
                  <label className="block font-sans font-semibold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={bLat}
                    onChange={(e) => setBLat(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-stone-300 rounded-lg focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={bLng}
                    onChange={(e) => setBLng(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-stone-300 rounded-lg focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold mb-1">Branch Phone</label>
                  <input
                    type="text"
                    value={bPhone}
                    onChange={(e) => setBPhone(e.target.value)}
                    placeholder="Same as main"
                    className="w-full px-2 py-1 bg-white border border-stone-300 rounded-lg focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranch(false)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#164E3D] text-white rounded-lg font-bold"
                >
                  Save Branch
                </button>
              </div>
            </form>
          )}

          {/* Branch list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {business.branches.map((branch) => (
              <div
                key={branch.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span className="text-sm font-serif">{branch.branchName}</span>
                  {branch.isMainBranch && (
                    <span className="text-[10px] bg-[#164E3D] text-white px-2 py-0.5 rounded-full">
                      Main Branch
                    </span>
                  )}
                </div>

                <div className="text-stone-600 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span>
                    {branch.address}, {branch.municipality}
                  </span>
                </div>

                <div className="text-stone-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{branch.operatingHours || 'Hours not provided'}</span>
                </div>

                <div className="text-stone-500 font-mono text-[11px]">
                  Coords: {branch.latitude.toFixed(4)}, {branch.longitude.toFixed(4)}
                </div>

                {!branch.isMainBranch && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleDeleteBranch(branch.id)}
                      className="text-red-600 hover:text-red-800 p-1 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS & DISHES */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-serif text-stone-900">
              Dishes & Pasalubong Delicacies ({business.products.length})
            </h2>
            <button
              onClick={() => setShowAddProduct(true)}
              className="px-3.5 py-1.5 bg-[#164E3D] hover:bg-[#123E30] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Dish / Pasalubong</span>
            </button>
          </div>

          {/* Add Product Modal Form */}
          {showAddProduct && (
            <form onSubmit={handleCreateProduct} className="bg-stone-50 p-5 rounded-2xl border border-stone-300 space-y-3 text-xs">
              <h3 className="font-bold text-stone-900 text-sm">Add New Product</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Native Chicken Halang-Halang or Calamay"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    placeholder="e.g. Main Dish, Dessert, Beverage"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="Ingredients, preparation style, or packaging..."
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Indicative Price (₱ PHP)</label>
                  <input
                    type="number"
                    step="1"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="Leave empty for 'Price not provided'"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Availability</label>
                  <select
                    value={pAvailability}
                    onChange={(e) => setPAvailability(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none"
                  >
                    <option value="available">In Stock / Available</option>
                    <option value="seasonal">Seasonal / Limited</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="inline-flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pIsPasalubong}
                      onChange={(e) => setPIsPasalubong(e.target.checked)}
                      className="rounded text-[#164E3D]"
                    />
                    <span>Is Pasalubong Item</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Offering Branches</label>
                <div className="flex flex-wrap gap-2">
                  {business.branches.map((b) => {
                    const isChecked = pBranchIds.includes(b.id);
                    return (
                      <label
                        key={b.id}
                        className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer ${
                          isChecked
                            ? 'bg-[#164E3D] text-white border-[#164E3D]'
                            : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPBranchIds([...pBranchIds, b.id]);
                            } else {
                              setPBranchIds(pBranchIds.filter((id) => id !== b.id));
                            }
                          }}
                        />
                        <span>{b.branchName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#164E3D] text-white rounded-lg font-bold"
                >
                  Save Item
                </button>
              </div>
            </form>
          )}

          {/* Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {business.products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        prod.isPasalubong
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-[#E8F3EE] text-[#164E3D]'
                      }`}
                    >
                      {prod.isPasalubong ? 'Pasalubong' : prod.category}
                    </span>

                    <span className="font-extrabold text-stone-900 text-sm">
                      {prod.price !== null ? `₱${prod.price.toLocaleString()}` : 'Price not provided'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm font-serif text-stone-900 mt-1">{prod.name}</h3>
                  {prod.description && <p className="text-stone-600 text-xs">{prod.description}</p>}
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    Status:{' '}
                    <strong className="text-stone-700">
                      {prod.availability === 'available'
                        ? 'In Stock'
                        : prod.availability === 'seasonal'
                        ? 'Seasonal'
                        : 'Out of Stock'}
                    </strong>
                  </span>

                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="text-red-600 hover:text-red-800 p-1 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
