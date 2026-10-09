import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  LogOut,
  Calendar,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { user, role, logout, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setIsSubmitting(true);

    try {
      await updateProfile({
        name,
        phone,
        currentPassword: showPasswordFields ? currentPassword : undefined,
        newPassword: showPasswordFields ? newPassword : undefined,
      });
      setNotice({ type: 'success', message: 'Profile updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordFields(false);
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    onNavigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-5 text-xs text-stone-800">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#164E3D] text-white flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">{user.name}</h3>
              <p className="text-[11px] text-stone-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Account Badges */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              user.role === 'admin'
                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                : user.role === 'owner'
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            Role: {user.role}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Status: {user.status}
          </span>
          <span className="text-[10px] text-stone-400 ml-auto">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Permissions summary for Admins */}
        {user.role === 'admin' && user.permissions && (
          <div className="space-y-1 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <span className="text-[11px] font-bold text-blue-900">Assigned Admin Privileges:</span>
            <div className="flex flex-wrap gap-1 pt-1">
              {user.permissions.map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 bg-blue-100/80 text-blue-800 rounded font-mono text-[9px]"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {notice && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{notice.message}</span>
          </div>
        )}

        {/* Edit Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+63 9XX XXX XXXX"
              className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
            />
          </div>

          {!showPasswordFields ? (
            <button
              type="button"
              onClick={() => setShowPasswordFields(true)}
              className="text-[#164E3D] hover:underline font-semibold text-xs flex items-center gap-1 cursor-pointer pt-1"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Change account password</span>
            </button>
          ) : (
            <div className="space-y-2.5 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800 text-[11px]">Change Password</span>
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(false)}
                  className="text-stone-400 hover:text-stone-600 text-[11px]"
                >
                  Cancel
                </button>
              </div>
              <div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  className="w-full p-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password (min 8 chars)"
                  className="w-full p-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#164E3D] hover:bg-[#123E30] text-white font-bold rounded-xl text-xs disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
