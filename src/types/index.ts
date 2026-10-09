export type UserRole = 'visitor' | 'owner' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending_verification';

export type AdminPermission =
  | 'manage_users'
  | 'manage_businesses'
  | 'review_submissions'
  | 'manage_reports'
  | 'view_audit_logs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatarUrl?: string;
  permissions?: AdminPermission[];
  businessIds?: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalBusinesses: number;
  approvedBusinesses: number;
  pendingSubmissions: number;
  openReports: number;
  totalAuditLogs: number;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'returned' | 'suspended';

export interface Municipality {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zone: 'North' | 'South' | 'East' | 'West' | 'Central';
}

export interface Category {
  id: string;
  name: string;
  type: 'food' | 'pasalubong' | 'both';
  icon: string;
  description: string;
}

export interface Branch {
  id: string;
  businessId: string;
  branchName: string;
  address: string;
  municipality: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  operatingHours: string; // e.g. "Mon-Sun 8:00 AM - 8:00 PM" or "Hours not provided"
  isMainBranch: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductAvailability = 'available' | 'seasonal' | 'out_of_stock';

export interface Product {
  id: string;
  businessId: string;
  branchIds: string[]; // Branches offering this product
  name: string;
  category: string;
  description: string;
  price: number | null; // PHP, null if not provided
  availability: ProductAvailability;
  image?: string;
  isPasalubong: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  ownerId: string;
  ownerEmail?: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  contactPhone: string;
  contactEmail?: string;
  websiteUrl?: string;
  socialUrl?: string;
  bannerImage: string;
  logoImage?: string;
  status: SubmissionStatus;
  moderationReason?: string;
  isDemo: boolean;
  branches: Branch[];
  products: Product[];
  createdAt: string;
  updatedAt: string;
  lastApprovedData?: Partial<Business>;
}

export interface BusinessWithDistance extends Business {
  closestBranch?: Branch;
  distanceKm?: number; // straight-line distance to closest branch
}

export interface ProductWithDistance extends Product {
  businessName?: string;
  businessStatus?: SubmissionStatus;
  offeringBranch?: Branch;
  distanceKm?: number; // straight-line distance to offering branch
}

export interface Submission {
  id: string;
  businessId: string;
  ownerId: string;
  ownerEmail: string;
  businessName: string;
  type: 'new_business' | 'update_business';
  proposedData: {
    name?: string;
    categoryId?: string;
    categoryName?: string;
    description?: string;
    contactPhone?: string;
    contactEmail?: string;
    websiteUrl?: string;
    socialUrl?: string;
    bannerImage?: string;
    branches?: Partial<Branch>[];
    products?: Partial<Product>[];
    [key: string]: any;
  };
  status: SubmissionStatus;
  feedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  businessId: string;
  businessName: string;
  branchId?: string;
  branchName?: string;
  reporterEmail: string;
  reporterName: string;
  issueType: 'closed' | 'wrong_hours' | 'wrong_location' | 'wrong_prices' | 'inappropriate' | 'other';
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

export type LiveNearbyStatus =
  | 'idle'
  | 'getting_location'
  | 'active'
  | 'permission_denied'
  | 'low_accuracy'
  | 'connection_lost'
  | 'paused'
  | 'outside_covered_area'
  | 'unsupported';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  isSimulated?: boolean;
}

export interface FilterState {
  searchQuery: string;
  categoryId: string;
  municipality: string;
  maxPrice: number | null; // null for any
  availability: string;
  radiusKm: number; // 1, 3, 5, 10
  onlyPasalubong: boolean;
  sortBy: 'distance' | 'name' | 'newest';
}
