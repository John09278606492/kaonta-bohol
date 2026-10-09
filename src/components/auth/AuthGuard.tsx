import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Lock, Shield } from 'lucide-react';

interface AuthGuardProps {
  requiredRole?: 'admin' | 'owner';
  children: React.ReactNode;
  onNavigate: (path: string) => void;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  requiredRole,
  children,
  onNavigate,
}) => {
  const { isAdmin, isOwner, isLoading, switchDemoRole } = useAuth();

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-stone-400 space-y-2">
        <div className="w-6 h-6 border-2 border-[#164E3D] border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Verifying authentication credentials...</p>
      </div>
    );
  }

  // Admin page protection
  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-serif text-[#164E3D]">
            Administrator Access Required
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            You must be authenticated as a verified administrator to access the moderation queue,
            user management, and security audit logs.
          </p>
        </div>
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-3">
          <button
            onClick={async () => {
              await switchDemoRole('admin');
            }}
            className="w-full py-2.5 px-4 bg-[#164E3D] hover:bg-[#113B2E] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Shield className="w-4 h-4 text-blue-300" />
            <span>Switch to Demo Administrator</span>
          </button>
          <button
            onClick={() => onNavigate('/login')}
            className="w-full py-2 px-3 text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
          >
            Sign In with Administrator Credentials
          </button>
        </div>
      </div>
    );
  }

  // Owner page protection
  if (requiredRole === 'owner' && !isOwner && !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-serif text-[#164E3D]">
            Business Owner Portal
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            This management area is reserved for registered Bohol food and delicacy business owners.
          </p>
        </div>
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-3">
          <button
            onClick={async () => {
              await switchDemoRole('owner');
            }}
            className="w-full py-2.5 px-4 bg-[#164E3D] hover:bg-[#113B2E] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <span>Switch to Demo Business Owner</span>
          </button>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => onNavigate('/register')}
              className="text-[#164E3D] hover:underline font-bold text-xs cursor-pointer"
            >
              List your business
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={() => onNavigate('/login')}
              className="text-stone-600 hover:text-stone-900 font-medium text-xs cursor-pointer"
            >
              Owner Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
