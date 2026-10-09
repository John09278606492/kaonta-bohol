import {
  Business,
  BusinessWithDistance,
  ProductWithDistance,
  Category,
  Municipality,
  Submission,
  Report,
  AuditLog,
  User,
  AdminStats,
  UserRole,
  AdminPermission,
} from '../types';
import {
  saveRestaurantToOfflineCache,
  getRestaurantFromOfflineCache,
  getCachedRestaurantIds,
} from './serviceWorker';

let currentAuthToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem('kaonta_auth_token') : null;

export function setApiToken(token: string | null) {
  currentAuthToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('kaonta_auth_token', token);
    } else {
      localStorage.removeItem('kaonta_auth_token');
    }
  }
}

export function getApiToken(): string | null {
  return currentAuthToken;
}

// Sequence counter to prevent older asynchronous network responses from overwriting newer location queries
let lastBusinessRequestId = 0;
let lastProductRequestId = 0;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (currentAuthToken) {
    headers.set('Authorization', `Bearer ${currentAuthToken}`);
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.error || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Metadata
  async getStatus() {
    return request<{ status: string; platform: string; motto: string }>('/status');
  },

  async getCategories(): Promise<Category[]> {
    return request<Category[]>('/categories');
  },

  async getMunicipalities(): Promise<Municipality[]> {
    return request<Municipality[]>('/municipalities');
  },

  // Discovery with race condition guard
  async getBusinesses(params: {
    search?: string;
    category?: string;
    municipality?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    isPasalubong?: boolean;
    sortBy?: string;
  }): Promise<{
    total: number;
    businesses: BusinessWithDistance[];
    radiusApplied: number | null;
    origin: { lat: number; lng: number } | null;
  }> {
    const requestId = ++lastBusinessRequestId;
    const query = new URLSearchParams();

    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.municipality && params.municipality !== 'all') query.set('municipality', params.municipality);
    if (params.lat !== undefined && params.lng !== undefined) {
      query.set('lat', params.lat.toString());
      query.set('lng', params.lng.toString());
    }
    if (params.radius) query.set('radius', params.radius.toString());
    if (params.isPasalubong) query.set('isPasalubong', 'true');
    if (params.sortBy) query.set('sortBy', params.sortBy);

    try {
      const result = await request<{
        total: number;
        businesses: BusinessWithDistance[];
        radiusApplied: number | null;
        origin: { lat: number; lng: number } | null;
      }>(`/businesses?${query.toString()}`);

      // Check if a newer request was made in the meantime
      if (requestId !== lastBusinessRequestId) {
        throw new Error('SUPERSEDED_REQUEST');
      }

      // Also cache these businesses for offline browsing
      result.businesses.forEach((biz) => {
        saveRestaurantToOfflineCache(biz);
      });

      return result;
    } catch (err: any) {
      if (err.message === 'SUPERSEDED_REQUEST') {
        throw err;
      }
      // If offline or network error, return previously cached restaurants
      const cachedIds = getCachedRestaurantIds();
      if (cachedIds.length > 0 && typeof navigator !== 'undefined' && !navigator.onLine) {
        const cachedList: BusinessWithDistance[] = cachedIds
          .map((cid) => getRestaurantFromOfflineCache(cid))
          .filter((b): b is Business => b !== null)
          .map((b) => ({
            ...b,
            closestBranch: b.branches[0],
          }));

        return {
          total: cachedList.length,
          businesses: cachedList,
          radiusApplied: null,
          origin: null,
        };
      }
      throw err;
    }
  },

  async getBusinessById(
    id: string
  ): Promise<Business & { reviewStatusExplanation?: string; isOfflineCached?: boolean }> {
    try {
      const data = await request<Business & { reviewStatusExplanation?: string }>(
        `/businesses/${id}`
      );
      // Save successfully retrieved restaurant to offline cache
      saveRestaurantToOfflineCache(data);
      return data;
    } catch (err: any) {
      // Check offline cache fallback
      const cached = getRestaurantFromOfflineCache(id);
      if (cached) {
        return {
          ...cached,
          reviewStatusExplanation:
            'KaonTa Bohol administrator review confirms physical presence, local authenticity, and non-profit listing guidelines. (Loaded from offline cache)',
          isOfflineCached: true,
        };
      }
      throw new Error(
        typeof navigator !== 'undefined' && !navigator.onLine
          ? 'You are currently offline, and this restaurant details have not been viewed yet. Please reconnect to the internet to load this listing.'
          : err.message || 'Failed to load restaurant details.'
      );
    }
  },

  async getProducts(params: {
    search?: string;
    category?: string;
    municipality?: string;
    isPasalubong?: boolean;
    maxPrice?: number | null;
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<{ total: number; products: ProductWithDistance[] }> {
    const requestId = ++lastProductRequestId;
    const query = new URLSearchParams();

    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.municipality && params.municipality !== 'all') query.set('municipality', params.municipality);
    if (params.isPasalubong) query.set('isPasalubong', 'true');
    if (params.maxPrice) query.set('maxPrice', params.maxPrice.toString());
    if (params.lat !== undefined && params.lng !== undefined) {
      query.set('lat', params.lat.toString());
      query.set('lng', params.lng.toString());
    }
    if (params.radius) query.set('radius', params.radius.toString());

    const result = await request<{ total: number; products: ProductWithDistance[] }>(
      `/products?${query.toString()}`
    );

    if (requestId !== lastProductRequestId) {
      throw new Error('SUPERSEDED_REQUEST');
    }

    return result;
  },

  // Issue / Inaccurate Information Report
  async submitReport(payload: {
    businessId: string;
    businessName: string;
    branchId?: string;
    branchName?: string;
    reporterEmail: string;
    reporterName?: string;
    issueType: string;
    description: string;
  }) {
    return request<{ message: string; report: Report }>('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setApiToken(res.token);
    return res;
  },

  async register(
    name: string,
    email: string,
    password: string,
    role: 'owner' | 'visitor' = 'owner',
    phone?: string
  ): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, phone }),
    });
    setApiToken(res.token);
    return res;
  },

  async updateProfile(payload: {
    name?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ user: User; message: string }> {
    return request<{ user: User; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async getMe(): Promise<{ user: User | null; token?: string }> {
    return request<{ user: User | null; token?: string }>('/auth/me');
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      setApiToken(null);
    }
  },

  async demoSwitchRole(role: 'admin' | 'owner' | 'visitor'): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    setApiToken(res.token);
    return res;
  },

  // Owner Portal
  async getOwnerBusinesses(): Promise<Business[]> {
    return request<Business[]>('/owner/businesses');
  },

  async submitNewBusiness(payload: any) {
    return request<{ message: string; business: Business; submission: Submission }>(
      '/owner/businesses',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async updateBusiness(id: string, payload: any) {
    return request<{ message: string; submission: Submission }>(`/owner/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async addBranch(payload: any) {
    return request('/owner/branches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateBranch(id: string, payload: any) {
    return request(`/owner/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteBranch(id: string) {
    return request(`/owner/branches/${id}`, {
      method: 'DELETE',
    });
  },

  async addProduct(payload: any) {
    return request('/owner/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateProduct(id: string, payload: any) {
    return request(`/owner/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteProduct(id: string) {
    return request(`/owner/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin Portal
  async getAdminSubmissions(): Promise<Submission[]> {
    return request<Submission[]>('/admin/submissions');
  },

  async reviewSubmission(id: string, action: 'approve' | 'reject' | 'return', feedback: string) {
    return request(`/admin/submissions/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, feedback }),
    });
  },

  async getAdminReports(): Promise<Report[]> {
    return request<Report[]>('/admin/reports');
  },

  async actionReport(id: string, status: 'resolved' | 'dismissed', adminNotes: string) {
    return request(`/admin/reports/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ status, adminNotes }),
    });
  },

  async setBusinessStatus(id: string, status: 'approved' | 'suspended', reason: string) {
    return request(`/admin/businesses/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    });
  },

  async getAdminAuditLogs(): Promise<AuditLog[]> {
    return request<AuditLog[]>('/admin/audit-logs');
  },

  async getAdminStats(): Promise<AdminStats> {
    return request<AdminStats>('/admin/stats');
  },

  async getAdminUsers(): Promise<User[]> {
    return request<User[]>('/admin/users');
  },

  async createAdminUser(payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    permissions?: AdminPermission[];
  }): Promise<User> {
    return request<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateUserRole(
    userId: string,
    role: UserRole,
    permissions?: AdminPermission[]
  ): Promise<{ message: string; user: User }> {
    return request<{ message: string; user: User }>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role, permissions }),
    });
  },

  async setUserStatus(
    userId: string,
    status: 'active' | 'suspended',
    reason?: string
  ): Promise<{ message: string; user: User }> {
    return request<{ message: string; user: User }>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  },
};
