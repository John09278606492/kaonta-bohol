import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AdminPermission } from '../types';
import { api, setApiToken, getApiToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isVisitor: boolean;
  isLoading: boolean;
  hasPermission: (perm: AdminPermission) => boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    pass: string,
    role?: 'owner' | 'visitor',
    phone?: string
  ) => Promise<User>;
  updateProfile: (payload: {
    name?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchDemoRole: (role: 'admin' | 'owner' | 'visitor') => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = getApiToken();
      if (token) {
        const res = await api.getMe();
        if (res.user && res.user.status !== 'suspended') {
          setUser(res.user);
        } else {
          setApiToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth verification error:', err);
      setApiToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    async function initAuth() {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await api.login(email, pass);
    setUser(res.user);
    return res.user;
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    role: 'owner' | 'visitor' = 'owner',
    phone?: string
  ): Promise<User> => {
    const res = await api.register(name, email, pass, role, phone);
    setUser(res.user);
    return res.user;
  };

  const updateProfile = async (payload: {
    name?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<User> => {
    const res = await api.updateProfile(payload);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const switchDemoRole = async (targetRole: 'admin' | 'owner' | 'visitor'): Promise<User> => {
    const res = await api.demoSwitchRole(targetRole);
    setUser(res.user);
    return res.user;
  };

  const role: UserRole = user?.role || 'visitor';
  const isAuthenticated = Boolean(user && user.status === 'active');
  const isAdmin = Boolean(user && user.role === 'admin' && user.status === 'active');
  const isOwner = Boolean(user && user.role === 'owner' && user.status === 'active');
  const isVisitor = !user || user.role === 'visitor';

  const hasPermission = (perm: AdminPermission): boolean => {
    if (!isAdmin || !user) return false;
    // Admins have all permissions or specific granted ones
    if (!user.permissions || user.permissions.length === 0) return true;
    return user.permissions.includes(perm);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        isOwner,
        isVisitor,
        isLoading,
        hasPermission,
        login,
        register,
        updateProfile,
        logout,
        refreshUser,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
