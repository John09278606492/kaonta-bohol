import React, { useState } from 'react';
import { Lock, Mail, Store, Shield, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'admin') {
        onNavigate('/admin');
      } else if (loggedInUser.role === 'owner') {
        onNavigate('/owner');
      } else {
        onNavigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'owner' | 'visitor') => {
    const user = await switchDemoRole(role);
    if (user.role === 'admin') onNavigate('/admin');
    else if (user.role === 'owner') onNavigate('/owner');
    else onNavigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8 text-stone-800">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#E8F3EE] text-[#164E3D] flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-6 h-6 text-[#164E3D]" />
        </div>
        <h1 className="text-2xl font-black font-serif text-[#164E3D]">Sign In to KaonTa Bohol</h1>
        <p className="text-xs text-stone-500">
          For business owners and community administrators
        </p>
      </div>

      {/* Quick Demo Switcher Box */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EAE3D6] space-y-2.5 text-xs">
        <div className="font-bold text-stone-800 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#D97706]" />
          <span>Quick Testing Shortcuts:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('owner')}
            className="p-2.5 bg-white hover:bg-amber-50 text-left rounded-xl border border-stone-200 transition-colors flex items-center gap-2"
          >
            <Store className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold text-stone-900">Owner Demo</div>
              <div className="text-[10px] text-stone-500">Maria Elena Chatto</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            className="p-2.5 bg-white hover:bg-blue-50 text-left rounded-xl border border-stone-200 transition-colors flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="font-bold text-stone-900">Admin Demo</div>
              <div className="text-[10px] text-stone-500">Review Submissions</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('visitor')}
            className="p-2.5 bg-white hover:bg-emerald-50 text-left rounded-xl border border-stone-200 transition-colors flex items-center gap-2"
          >
            <User className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-stone-900">Visitor Demo</div>
              <div className="text-[10px] text-stone-500">Juana Dela Cruz</div>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@boholflavors.ph"
                className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164E3D]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164E3D]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#164E3D] hover:bg-[#123E30] text-white font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-stone-500">
          Don't have an owner account yet?{' '}
          <button
            onClick={() => onNavigate('/register')}
            className="font-bold text-[#164E3D] hover:underline"
          >
            Register your business for free
          </button>
        </div>
      </div>
    </div>
  );
};
