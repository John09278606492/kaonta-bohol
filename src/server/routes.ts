import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db, hashPassword, verifyPassword } from './db';
import {
  Business,
  Branch,
  Product,
  Submission,
  Report,
  BusinessWithDistance,
  ProductWithDistance,
  User,
} from '../types';

export const apiRouter = Router();

// In-memory token store for authentication
interface Session {
  token: string;
  userId: string;
  email: string;
  role: 'visitor' | 'owner' | 'admin';
  name: string;
  createdAt: number;
}
const sessions = new Map<string, Session>();

// Seed active sessions for demo convenience
const demoAdminToken = 'demo-admin-session-token-bohol-2026';
const demoOwnerToken = 'demo-owner-session-token-bohol-2026';
const demoVisitorToken = 'demo-visitor-session-token-bohol-2026';

sessions.set(demoAdminToken, {
  token: demoAdminToken,
  userId: 'usr-admin-01',
  email: 'admin@kaontabohol.ph',
  role: 'admin',
  name: 'KaonTa Administrator',
  createdAt: Date.now(),
});

sessions.set(demoOwnerToken, {
  token: demoOwnerToken,
  userId: 'usr-owner-01',
  email: 'owner@boholflavors.ph',
  role: 'owner',
  name: 'Maria Elena Chatto',
  createdAt: Date.now(),
});

sessions.set(demoVisitorToken, {
  token: demoVisitorToken,
  userId: 'usr-visitor-01',
  email: 'visitor@bohol.local',
  role: 'visitor',
  name: 'Juana Dela Cruz',
  createdAt: Date.now(),
});

// Rate limiting map for reports and auth
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();
function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || record.expiresAt < now) {
    rateLimitMap.set(key, { count: 1, expiresAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) {
    return false;
  }
  record.count += 1;
  return true;
}

// Haversine straight-line distance
export function calculateStraightLineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Authentication middleware
export function getAuthenticatedUser(req: Request): Session | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  const session = sessions.get(token);
  if (!session) return null;

  // Verify against database to check user status and role changes
  const dbUser = db.getUserById(session.userId);
  if (!dbUser || dbUser.status === 'suspended') {
    sessions.delete(token);
    return null;
  }

  // Keep session in sync with any updated role, name, or email in DB
  session.role = dbUser.role;
  session.name = dbUser.name;
  session.email = dbUser.email;
  return session;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = getAuthenticatedUser(req);
  if (!session) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  (req as any).user = session;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = getAuthenticatedUser(req);
  if (!session || session.role !== 'admin') {
    res.status(403).json({ error: 'Administrator privileges required.' });
    return;
  }
  (req as any).user = session;
  next();
}

// ==========================================
// 1. PUBLIC GENERAL & METADATA
// ==========================================

apiRouter.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'KaonTa Bohol',
    type: 'Non-Profit Community Platform',
    motto: 'Discover local flavors. Support local businesses. Free for everyone.',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.get('/categories', (req, res) => {
  res.json(db.getCategories());
});

apiRouter.get('/municipalities', (req, res) => {
  res.json(db.getMunicipalities());
});

// ==========================================
// 2. PUBLIC BUSINESS DISCOVERY
// ==========================================

apiRouter.get('/businesses', (req, res) => {
  const {
    search,
    category,
    municipality,
    lat,
    lng,
    radius,
    isPasalubong,
    sortBy,
  } = req.query;

  // Only approved listings are ever returned to public
  const allBusinesses = db.getBusinesses(true);
  const userLat = lat ? parseFloat(lat as string) : null;
  const userLng = lng ? parseFloat(lng as string) : null;
  const radiusKm = radius ? parseFloat(radius as string) : null;

  let results: BusinessWithDistance[] = allBusinesses.map((b) => {
    // Find closest branch to origin (if origin supplied)
    let closestBranch: Branch | undefined;
    let minDistance = Infinity;

    if (userLat !== null && userLng !== null && b.branches.length > 0) {
      for (const branch of b.branches) {
        const d = calculateStraightLineDistance(
          userLat,
          userLng,
          branch.latitude,
          branch.longitude
        );
        if (d < minDistance) {
          minDistance = d;
          closestBranch = branch;
        }
      }
    } else if (b.branches.length > 0) {
      closestBranch = b.branches.find((br) => br.isMainBranch) || b.branches[0];
    }

    return {
      ...b,
      closestBranch,
      distanceKm: minDistance === Infinity ? undefined : minDistance,
    };
  });

  // Filter by category
  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((b) => b.categoryId === category);
  }

  // Filter by municipality
  if (municipality && typeof municipality === 'string' && municipality !== 'all') {
    results = results.filter((b) =>
      b.branches.some(
        (br) => br.municipality.toLowerCase() === municipality.toLowerCase()
      )
    );
  }

  // Filter by pasalubong presence
  if (isPasalubong === 'true') {
    results = results.filter(
      (b) =>
        b.categoryId === 'pasalubong-delicacies' ||
        b.products.some((p) => p.isPasalubong)
    );
  }

  // Filter by search query (name, description, product names)
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.branches.some((br) => br.municipality.toLowerCase().includes(q) || br.address.toLowerCase().includes(q)) ||
        b.products.some((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    );
  }

  // Filter by radius if location is provided and radiusKm is specified
  if (userLat !== null && userLng !== null && radiusKm !== null && !isNaN(radiusKm)) {
    results = results.filter((b) => {
      if (b.distanceKm === undefined) return false;
      return b.distanceKm <= radiusKm;
    });
  }

  // Sorting
  if (sortBy === 'distance' && userLat !== null && userLng !== null) {
    results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  } else if (sortBy === 'name') {
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Default newest or distance if coords available
    if (userLat !== null && userLng !== null) {
      results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    } else {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  res.json({
    total: results.length,
    businesses: results,
    radiusApplied: radiusKm,
    origin: userLat !== null && userLng !== null ? { lat: userLat, lng: userLng } : null,
  });
});

apiRouter.get('/businesses/:id', (req, res) => {
  const biz = db.getBusinessById(req.params.id);
  if (!biz) {
    res.status(404).json({ error: 'Business listing not found.' });
    return;
  }

  // If not approved, only owner or admin can view
  if (biz.status !== 'approved') {
    const session = getAuthenticatedUser(req);
    if (!session || (session.role !== 'admin' && session.userId !== biz.ownerId)) {
      res.status(403).json({
        error: 'This business listing is pending administrator review and is not yet publicly visible.',
      });
      return;
    }
  }

  res.json({
    ...biz,
    reviewStatusExplanation:
      'KaonTa Bohol administrator review confirms the physical presence, local authenticity, and compliance with our non-profit listing guidelines. It does not replace local sanitary or health department food safety certifications.',
  });
});

// ==========================================
// 3. PUBLIC PRODUCT DISCOVERY (Pasalubong & Dishes)
// ==========================================

apiRouter.get('/products', (req, res) => {
  const {
    search,
    category,
    municipality,
    isPasalubong,
    maxPrice,
    lat,
    lng,
    radius,
  } = req.query;

  const allProducts = db.getProducts(true);
  const businesses = db.getBusinesses(true);
  const branches = db.getBranches();

  const userLat = lat ? parseFloat(lat as string) : null;
  const userLng = lng ? parseFloat(lng as string) : null;
  const radiusKm = radius ? parseFloat(radius as string) : null;
  const parsedMaxPrice = maxPrice ? parseFloat(maxPrice as string) : null;

  let results: ProductWithDistance[] = allProducts.map((p) => {
    const parentBiz = businesses.find((b) => b.id === p.businessId);
    // Find offering branches
    const offeringBranches = branches.filter((br) => p.branchIds.includes(br.id));
    
    // Calculate closest offering branch
    let closestOfferingBranch: Branch | undefined;
    let minDistance = Infinity;

    if (userLat !== null && userLng !== null && offeringBranches.length > 0) {
      for (const br of offeringBranches) {
        const d = calculateStraightLineDistance(userLat, userLng, br.latitude, br.longitude);
        if (d < minDistance) {
          minDistance = d;
          closestOfferingBranch = br;
        }
      }
    } else if (offeringBranches.length > 0) {
      closestOfferingBranch = offeringBranches[0];
    }

    return {
      ...p,
      businessName: parentBiz?.name || 'Local Bohol Establishment',
      businessStatus: parentBiz?.status,
      offeringBranch: closestOfferingBranch,
      distanceKm: minDistance === Infinity ? undefined : minDistance,
    };
  });

  if (isPasalubong === 'true') {
    results = results.filter((p) => p.isPasalubong);
  }

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (parsedMaxPrice !== null && !isNaN(parsedMaxPrice)) {
    results = results.filter((p) => p.price !== null && p.price <= parsedMaxPrice);
  }

  if (municipality && typeof municipality === 'string' && municipality !== 'all') {
    results = results.filter((p) =>
      p.offeringBranch?.municipality.toLowerCase() === municipality.toLowerCase()
    );
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.businessName?.toLowerCase().includes(q)
    );
  }

  if (userLat !== null && userLng !== null && radiusKm !== null && !isNaN(radiusKm)) {
    results = results.filter((p) => {
      if (p.distanceKm === undefined) return false;
      return p.distanceKm <= radiusKm;
    });
  }

  if (userLat !== null && userLng !== null) {
    results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }

  res.json({
    total: results.length,
    products: results,
  });
});

// ==========================================
// 4. PUBLIC ISSUE / CORRECTION REPORTS
// ==========================================

apiRouter.post('/reports', (req, res) => {
  const ip = req.ip || 'anonymous';
  if (!checkRateLimit(`report-${ip}`, 5, 10 * 60 * 1000)) {
    res.status(429).json({ error: 'Too many reports submitted. Please try again later.' });
    return;
  }

  const {
    businessId,
    businessName,
    branchId,
    branchName,
    reporterEmail,
    reporterName,
    issueType,
    description,
  } = req.body;

  if (!businessId || !reporterEmail || !issueType || !description) {
    res.status(400).json({ error: 'Missing required report fields.' });
    return;
  }

  const validTypes = ['closed', 'wrong_hours', 'wrong_location', 'wrong_prices', 'inappropriate', 'other'];
  if (!validTypes.includes(issueType)) {
    res.status(400).json({ error: 'Invalid issue type specified.' });
    return;
  }

  const newReport: Report = {
    id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    businessId,
    businessName: businessName || 'Bohol Business',
    branchId,
    branchName,
    reporterEmail: reporterEmail.trim(),
    reporterName: reporterName ? reporterName.trim() : 'Anonymous Visitor',
    issueType,
    description: description.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.addReport(newReport);
  res.status(201).json({
    message: 'Thank you for helping keep KaonTa Bohol accurate. Our team will review this notice.',
    report: newReport,
  });
});

// ==========================================
// 5. AUTHENTICATION & SESSIONS
// ==========================================

apiRouter.post('/auth/register', (req, res) => {
  const { name, email, password, role = 'owner', phone } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    return;
  }

  const users = db.getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
    res.status(400).json({ error: 'An account with this email address already exists.' });
    return;
  }

  const userRole: 'visitor' | 'owner' = role === 'admin' ? 'owner' : (role as 'visitor' | 'owner');
  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();
  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role: userRole,
    status: 'active',
    phone: phone ? phone.trim() : undefined,
    permissions: [],
    createdAt: now,
    lastLoginAt: now,
  };

  db.addUser({ ...newUser, passwordHash: hash, salt });

  // Generate session token
  const token = `tok-${crypto.randomBytes(24).toString('hex')}`;
  const session: Session = {
    token,
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
    createdAt: Date.now(),
  };
  sessions.set(token, session);

  db.addAuditLog({
    userId: newUser.id,
    userEmail: newUser.email,
    action: 'USER_REGISTERED',
    entityType: 'user',
    entityId: newUser.id,
    details: `User ${newUser.name} registered with role ${newUser.role}`,
  });

  res.status(201).json({
    user: newUser,
    token,
    message: 'Account successfully registered.',
  });
});

apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const users = db.getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    res.status(401).json({ error: 'Invalid email or password credentials.' });
    return;
  }

  if (user.status === 'suspended') {
    res.status(403).json({
      error: 'Your account has been suspended by an administrator. Please contact platform support.',
    });
    return;
  }

  const now = new Date().toISOString();
  db.updateUser(user.id, { lastLoginAt: now });

  const token = `tok-${crypto.randomBytes(24).toString('hex')}`;
  const session: Session = {
    token,
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    createdAt: Date.now(),
  };
  sessions.set(token, session);

  db.addAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'USER_LOGIN',
    entityType: 'user',
    entityId: user.id,
    details: `User ${user.name} signed in successfully`,
  });

  const sanitizedUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone,
    permissions: user.permissions || [],
    businessIds: user.businessIds || [],
    createdAt: user.createdAt,
    lastLoginAt: now,
  };

  res.json({
    user: sanitizedUser,
    token,
  });
});

apiRouter.get('/auth/me', (req, res) => {
  const session = getAuthenticatedUser(req);
  if (!session) {
    res.json({ user: null });
    return;
  }
  const dbUser = db.getUserById(session.userId);
  if (!dbUser || dbUser.status === 'suspended') {
    res.json({ user: null });
    return;
  }

  const sanitizedUser: User = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    status: dbUser.status,
    phone: dbUser.phone,
    permissions: dbUser.permissions || [],
    businessIds: dbUser.businessIds || [],
    createdAt: dbUser.createdAt,
    lastLoginAt: dbUser.lastLoginAt,
  };

  res.json({
    user: sanitizedUser,
    token: session.token,
  });
});

apiRouter.put('/auth/profile', requireAuth, (req, res) => {
  const session = (req as any).user as Session;
  const { name, phone, currentPassword, newPassword } = req.body;

  const dbUser = db.getUserById(session.userId);
  if (!dbUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const updates: any = {};
  if (name && name.trim()) {
    updates.name = name.trim();
    session.name = updates.name;
  }
  if (phone !== undefined) {
    updates.phone = phone.trim();
  }

  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ error: 'Current password is required to change password.' });
      return;
    }
    if (!verifyPassword(currentPassword, dbUser.passwordHash, dbUser.salt)) {
      res.status(400).json({ error: 'Current password does not match.' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      return;
    }
    const { hash, salt } = hashPassword(newPassword);
    updates.passwordHash = hash;
    updates.salt = salt;
  }

  const updated = db.updateUser(dbUser.id, updates);
  if (!updated) {
    res.status(500).json({ error: 'Failed to update profile.' });
    return;
  }

  db.addAuditLog({
    userId: dbUser.id,
    userEmail: dbUser.email,
    action: 'PROFILE_UPDATED',
    entityType: 'user',
    entityId: dbUser.id,
    details: `User ${dbUser.name} updated profile information`,
  });

  const sanitizedUser: User = {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    status: updated.status,
    phone: updated.phone,
    permissions: updated.permissions || [],
    businessIds: updated.businessIds || [],
    createdAt: updated.createdAt,
    lastLoginAt: updated.lastLoginAt,
  };

  res.json({
    user: sanitizedUser,
    message: 'Profile updated successfully.',
  });
});

apiRouter.post('/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    sessions.delete(token);
  }
  res.json({ message: 'Signed out successfully.' });
});

// Quick demo login switch endpoint for ease of verifying all roles
apiRouter.post('/auth/demo-switch', (req, res) => {
  const { role } = req.body;
  let targetId = 'usr-visitor-01';
  let demoToken = demoVisitorToken;

  if (role === 'admin') {
    targetId = 'usr-admin-01';
    demoToken = demoAdminToken;
  } else if (role === 'owner') {
    targetId = 'usr-owner-01';
    demoToken = demoOwnerToken;
  }

  const dbUser = db.getUserById(targetId);
  const now = new Date().toISOString();
  if (dbUser) {
    db.updateUser(dbUser.id, { lastLoginAt: now });
  }

  const user: User = dbUser
    ? {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        status: dbUser.status,
        phone: dbUser.phone,
        permissions: dbUser.permissions || [],
        businessIds: dbUser.businessIds || [],
        createdAt: dbUser.createdAt,
        lastLoginAt: now,
      }
    : {
        id: targetId,
        name:
          role === 'admin'
            ? 'KaonTa Administrator'
            : role === 'owner'
            ? 'Maria Elena Chatto'
            : 'Juana Dela Cruz',
        email:
          role === 'admin'
            ? 'admin@kaontabohol.ph'
            : role === 'owner'
            ? 'owner@boholflavors.ph'
            : 'visitor@bohol.local',
        role: role as any,
        status: 'active',
        permissions:
          role === 'admin'
            ? [
                'manage_users',
                'manage_businesses',
                'review_submissions',
                'manage_reports',
                'view_audit_logs',
              ]
            : [],
        createdAt: '2026-01-01T00:00:00.000Z',
        lastLoginAt: now,
      };

  sessions.set(demoToken, {
    token: demoToken,
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    createdAt: Date.now(),
  });

  res.json({
    user,
    token: demoToken,
  });
});

// ==========================================
// 6. OWNER BUSINESS MANAGEMENT
// ==========================================

apiRouter.get('/owner/businesses', requireAuth, (req, res) => {
  const user = (req as any).user as Session;
  const all = db.getBusinesses(false);
  // Owners see only their own, admins can see all
  const owned = user.role === 'admin' ? all : all.filter((b) => b.ownerId === user.userId);
  res.json(owned);
});

apiRouter.post('/owner/businesses', requireAuth, (req, res) => {
  const user = (req as any).user as Session;
  const {
    name,
    categoryId,
    description,
    contactPhone,
    contactEmail,
    websiteUrl,
    socialUrl,
    bannerImage,
    branchName,
    address,
    municipality,
    latitude,
    longitude,
    operatingHours,
  } = req.body;

  if (!name || !categoryId || !description || !contactPhone || !municipality) {
    res.status(400).json({ error: 'Please provide all mandatory business listing fields.' });
    return;
  }

  const category = db.getCategories().find((c) => c.id === categoryId);
  const businessId = `biz-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const branchId = `br-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const initialBranch: Branch = {
    id: branchId,
    businessId,
    branchName: branchName || 'Main Branch',
    address: address || `${municipality}, Bohol`,
    municipality,
    latitude: latitude ? parseFloat(latitude) : 9.6496,
    longitude: longitude ? parseFloat(longitude) : 123.8547,
    contactPhone,
    operatingHours: operatingHours || 'Hours not provided',
    isMainBranch: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const newBusiness: Business = {
    id: businessId,
    ownerId: user.userId,
    ownerEmail: user.email,
    name: name.trim(),
    categoryId,
    categoryName: category?.name || 'Local Bohol Eatery',
    description: description.trim(),
    contactPhone: contactPhone.trim(),
    contactEmail: contactEmail ? contactEmail.trim() : user.email,
    websiteUrl: websiteUrl ? websiteUrl.trim() : undefined,
    socialUrl: socialUrl ? socialUrl.trim() : undefined,
    bannerImage:
      bannerImage ||
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    status: 'pending', // Starts in pending review
    isDemo: false,
    branches: [initialBranch],
    products: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addBusiness(newBusiness);
  db.addBranch(initialBranch);

  // Create submission record for administrator review queue
  const newSubmission: Submission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    businessId,
    ownerId: user.userId,
    ownerEmail: user.email,
    businessName: newBusiness.name,
    type: 'new_business',
    proposedData: {
      name: newBusiness.name,
      categoryId: newBusiness.categoryId,
      description: newBusiness.description,
      contactPhone: newBusiness.contactPhone,
      branches: [initialBranch],
    },
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.addSubmission(newSubmission);

  db.addAuditLog({
    userId: user.userId,
    userEmail: user.email,
    action: 'BUSINESS_SUBMITTED',
    entityType: 'business',
    entityId: businessId,
    details: `Owner ${user.name} submitted business "${newBusiness.name}" for review`,
  });

  res.status(201).json({
    message: 'Business listing submitted successfully. It will be reviewed by our volunteer administrators.',
    business: newBusiness,
    submission: newSubmission,
  });
});

// Update business details (Submits a revision for approval)
apiRouter.put('/owner/businesses/:id', requireAuth, (req, res) => {
  const user = (req as any).user as Session;
  const biz = db.getBusinessById(req.params.id);

  if (!biz) {
    res.status(404).json({ error: 'Business not found.' });
    return;
  }

  if (user.role !== 'admin' && biz.ownerId !== user.userId) {
    res.status(403).json({ error: 'You are only authorized to manage your own business.' });
    return;
  }

  const {
    name,
    categoryId,
    description,
    contactPhone,
    contactEmail,
    websiteUrl,
    socialUrl,
    bannerImage,
  } = req.body;

  const category = categoryId ? db.getCategories().find((c) => c.id === categoryId) : null;

  // Create proposed update submission
  const newSubmission: Submission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    businessId: biz.id,
    ownerId: user.userId,
    ownerEmail: user.email,
    businessName: name || biz.name,
    type: 'update_business',
    proposedData: {
      name: name || biz.name,
      categoryId: categoryId || biz.categoryId,
      categoryName: category?.name || biz.categoryName,
      description: description || biz.description,
      contactPhone: contactPhone || biz.contactPhone,
      contactEmail: contactEmail || biz.contactEmail,
      websiteUrl: websiteUrl || biz.websiteUrl,
      socialUrl: socialUrl || biz.socialUrl,
      bannerImage: bannerImage || biz.bannerImage,
    },
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.addSubmission(newSubmission);

  // If already approved, keep the last approved public version active while marking update pending review
  // If the updater is an admin, apply immediately
  if (user.role === 'admin') {
    db.updateBusiness(biz.id, {
      ...(newSubmission.proposedData as any),
      status: 'approved',
    });
    newSubmission.status = 'approved';
    newSubmission.feedback = 'Direct update applied by Administrator';
    newSubmission.reviewedBy = user.email;
    newSubmission.reviewedAt = new Date().toISOString();
    db.updateSubmission(newSubmission.id, newSubmission);
  }

  res.json({
    message:
      user.role === 'admin'
        ? 'Business updated immediately by administrator.'
        : 'Update submitted for review. Your current approved version remains visible to visitors until reviewed.',
    submission: newSubmission,
  });
});

// Branch CRUD for Owner
apiRouter.post('/owner/branches', requireAuth, (req, res) => {
  const user = (req as any).user as Session;
  const {
    businessId,
    branchName,
    address,
    municipality,
    latitude,
    longitude,
    contactPhone,
    operatingHours,
    isMainBranch,
  } = req.body;

  const biz = db.getBusinessById(businessId);
  if (!biz) {
    res.status(404).json({ error: 'Business not found.' });
    return;
  }

  if (user.role !== 'admin' && biz.ownerId !== user.userId) {
    res.status(403).json({ error: 'Unauthorized to add branches to this business.' });
    return;
  }

  const newBranch: Branch = {
    id: `br-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    businessId,
    branchName: branchName || 'Branch',
    address: address || `${municipality}, Bohol`,
    municipality: municipality || 'Tagbilaran City',
    latitude: parseFloat(latitude) || 9.6496,
    longitude: parseFloat(longitude) || 123.8547,
    contactPhone: contactPhone || biz.contactPhone,
    operatingHours: operatingHours || 'Hours not provided',
    isMainBranch: Boolean(isMainBranch),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addBranch(newBranch);
  res.status(201).json(newBranch);
});

apiRouter.put('/owner/branches/:id', requireAuth, (req, res) => {
  const user = (req as any).user as Session;
  const branch = db.getBranches().find((br) => br.id === req.params.id);
  if (!branch) {
    res.status(404).json({ error: 'Branch not found.' });
    return;
  }

  const biz = db.getBusinessById(branch.businessId);
  if (user.role !== 'admin' && biz?.ownerId !== user.userId) {
    res.status(403).json({ error: 'Unauthorized.' });
    return;
  }

  const updated = db.updateBranch(branch.id, req.body);
  res.json(updated);
});

apiRouter.delete('/owner/branches/:id', requireAuth, (req, res) => {
  const user = (req as any).user as Session;
  const branch = db.getBranches().find((br) => br.id === req.params.id);
  if (!branch) {
    res.status(404).json({ error: 'Branch not found.' });
    return;
  }

  const biz = db.getBusinessById(branch.businessId);
  if (user.role !== 'admin' && biz?.ownerId !== user.userId) {
    res.status(403).json({ error: 'Unauthorized.' });
    return;
  }

  db.deleteBranch(branch.id);
  res.json({ message: 'Branch removed successfully.' });
});

// Product CRUD for Owner
apiRouter.post('/owner/products', requireAuth, (req, res) => {
  const user = (req as any).user as Session;
  const {
    businessId,
    branchIds,
    name,
    category,
    description,
    price,
    availability,
    image,
    isPasalubong,
  } = req.body;

  const biz = db.getBusinessById(businessId);
  if (!biz) {
    res.status(404).json({ error: 'Business not found.' });
    return;
  }

  if (user.role !== 'admin' && biz.ownerId !== user.userId) {
    res.status(403).json({ error: 'Unauthorized.' });
    return;
  }

  const newProd: Product = {
    id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    businessId,
    branchIds: Array.isArray(branchIds) && branchIds.length > 0 ? branchIds : biz.branches.map((b) => b.id),
    name: name.trim(),
    category: category || 'General',
    description: description ? description.trim() : '',
    price: price !== undefined && price !== '' && price !== null ? parseFloat(price) : null,
    availability: availability || 'available',
    image:
      image ||
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isPasalubong: Boolean(isPasalubong),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addProduct(newProd);
  res.status(201).json(newProd);
});

apiRouter.put('/owner/products/:id', requireAuth, (req, res) => {
  const user = (req as any).user as Session;
  const prod = db.getProducts(false).find((p) => p.id === req.params.id);
  if (!prod) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const biz = db.getBusinessById(prod.businessId);
  if (user.role !== 'admin' && biz?.ownerId !== user.userId) {
    res.status(403).json({ error: 'Unauthorized.' });
    return;
  }

  const updated = db.updateProduct(prod.id, req.body);
  res.json(updated);
});

apiRouter.delete('/owner/products/:id', requireAuth, (req, res) => {
  const user = (req as any).user as Session;
  const prod = db.getProducts(false).find((p) => p.id === req.params.id);
  if (!prod) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const biz = db.getBusinessById(prod.businessId);
  if (user.role !== 'admin' && biz?.ownerId !== user.userId) {
    res.status(403).json({ error: 'Unauthorized.' });
    return;
  }

  db.deleteProduct(prod.id);
  res.json({ message: 'Product deleted successfully.' });
});

// ==========================================
// 7. ADMINISTRATOR REVIEW & AUDIT LOGS
// ==========================================

apiRouter.get('/admin/submissions', requireAdmin, (req, res) => {
  res.json(db.getSubmissions());
});

apiRouter.post('/admin/submissions/:id/review', requireAdmin, (req, res) => {
  const admin = (req as any).user as Session;
  const { action, feedback } = req.body; // 'approve' | 'reject' | 'return'

  if (!['approve', 'reject', 'return'].includes(action)) {
    res.status(400).json({ error: 'Action must be approve, reject, or return.' });
    return;
  }

  const submission = db.getSubmissions().find((s) => s.id === req.params.id);
  if (!submission) {
    res.status(404).json({ error: 'Submission not found.' });
    return;
  }

  const newStatus =
    action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'returned';

  db.updateSubmission(submission.id, {
    status: newStatus,
    feedback: feedback || `Reviewed by admin (${action})`,
    reviewedBy: admin.email,
    reviewedAt: new Date().toISOString(),
  });

  const biz = db.getBusinessById(submission.businessId);

  if (action === 'approve') {
    if (biz) {
      db.updateBusiness(biz.id, {
        status: 'approved',
        moderationReason: undefined,
        ...(submission.proposedData as any),
      });
    }
  } else if (action === 'reject') {
    if (biz) {
      db.updateBusiness(biz.id, {
        status: 'rejected',
        moderationReason: feedback || 'Submission rejected by administrator.',
      });
    }
  }

  db.addAuditLog({
    userId: admin.userId,
    userEmail: admin.email,
    action: `SUBMISSION_${action.toUpperCase()}`,
    entityType: 'submission',
    entityId: submission.id,
    details: `Admin ${admin.name} ${action}d submission for "${submission.businessName}". Feedback: ${feedback || 'None'}`,
  });

  res.json({
    message: `Submission marked as ${newStatus}.`,
    submission: db.getSubmissions().find((s) => s.id === req.params.id),
  });
});

apiRouter.get('/admin/reports', requireAdmin, (req, res) => {
  res.json(db.getReports());
});

apiRouter.post('/admin/reports/:id/action', requireAdmin, (req, res) => {
  const admin = (req as any).user as Session;
  const { status, adminNotes } = req.body; // 'resolved' | 'dismissed'

  if (!['resolved', 'dismissed'].includes(status)) {
    res.status(400).json({ error: 'Status must be resolved or dismissed.' });
    return;
  }

  const rep = db.getReports().find((r) => r.id === req.params.id);
  if (!rep) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }

  const updated = db.updateReport(rep.id, {
    status,
    adminNotes: adminNotes || '',
    resolvedAt: new Date().toISOString(),
  });

  db.addAuditLog({
    userId: admin.userId,
    userEmail: admin.email,
    action: `REPORT_${status.toUpperCase()}`,
    entityType: 'report',
    entityId: rep.id,
    details: `Admin ${admin.name} marked report ${rep.id} as ${status}. Notes: ${adminNotes || 'None'}`,
  });

  res.json(updated);
});

apiRouter.post('/admin/businesses/:id/status', requireAdmin, (req, res) => {
  const admin = (req as any).user as Session;
  const { status, reason } = req.body; // 'approved' | 'suspended'

  const biz = db.getBusinessById(req.params.id);
  if (!biz) {
    res.status(404).json({ error: 'Business not found.' });
    return;
  }

  db.updateBusiness(biz.id, {
    status,
    moderationReason: reason || undefined,
  });

  db.addAuditLog({
    userId: admin.userId,
    userEmail: admin.email,
    action: `BUSINESS_${status.toUpperCase()}`,
    entityType: 'business',
    entityId: biz.id,
    details: `Admin changed status of "${biz.name}" to ${status}. Reason: ${reason || 'N/A'}`,
  });

  res.json({ message: `Business status updated to ${status}.` });
});

apiRouter.get('/admin/audit-logs', requireAdmin, (req, res) => {
  res.json(db.getAuditLogs());
});

// Admin System Stats
apiRouter.get('/admin/stats', requireAdmin, (req, res) => {
  res.json(db.getAdminStats());
});

// Admin User Management: List all users
apiRouter.get('/admin/users', requireAdmin, (req, res) => {
  const users = db.getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    phone: u.phone,
    permissions: u.permissions || [],
    businessIds: u.businessIds || [],
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  }));
  res.json(users);
});

// Admin User Management: Create new user or administrator
apiRouter.post('/admin/users', requireAdmin, (req, res) => {
  const admin = (req as any).user as Session;
  const { name, email, password, role = 'visitor', permissions, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }

  const existing = db.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    res.status(400).json({ error: 'User with this email already exists.' });
    return;
  }

  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();
  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role,
    status: 'active',
    phone: phone ? phone.trim() : undefined,
    permissions:
      role === 'admin'
        ? permissions || [
            'manage_users',
            'manage_businesses',
            'review_submissions',
            'manage_reports',
            'view_audit_logs',
          ]
        : [],
    createdAt: now,
    lastLoginAt: now,
  };

  db.addUser({ ...newUser, passwordHash: hash, salt });

  db.addAuditLog({
    userId: admin.userId,
    userEmail: admin.email,
    action: 'USER_CREATED_BY_ADMIN',
    entityType: 'user',
    entityId: newUser.id,
    details: `Admin ${admin.name} created user "${newUser.name}" with role ${newUser.role}`,
  });

  res.status(201).json(newUser);
});

// Admin User Management: Update role & permissions
apiRouter.put('/admin/users/:id/role', requireAdmin, (req, res) => {
  const admin = (req as any).user as Session;
  const { role, permissions } = req.body;

  if (!['visitor', 'owner', 'admin'].includes(role)) {
    res.status(400).json({ error: 'Invalid role.' });
    return;
  }

  const target = db.getUserById(req.params.id);
  if (!target) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const defaultAdminPermissions = [
    'manage_users',
    'manage_businesses',
    'review_submissions',
    'manage_reports',
    'view_audit_logs',
  ];

  const updated = db.updateUser(target.id, {
    role,
    permissions:
      role === 'admin' ? permissions || target.permissions || defaultAdminPermissions : [],
  });

  db.addAuditLog({
    userId: admin.userId,
    userEmail: admin.email,
    action: 'USER_ROLE_CHANGED',
    entityType: 'user',
    entityId: target.id,
    details: `Admin ${admin.name} changed role of "${target.name}" from ${target.role} to ${role}`,
  });

  res.json({
    message: `User role updated to ${role}.`,
    user: updated,
  });
});

// Admin User Management: Suspend or activate user
apiRouter.put('/admin/users/:id/status', requireAdmin, (req, res) => {
  const admin = (req as any).user as Session;
  const { status, reason } = req.body;

  if (!['active', 'suspended'].includes(status)) {
    res.status(400).json({ error: 'Status must be active or suspended.' });
    return;
  }

  const target = db.getUserById(req.params.id);
  if (!target) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (target.id === admin.userId) {
    res.status(400).json({ error: 'Administrators cannot suspend their own account.' });
    return;
  }

  const updated = db.updateUser(target.id, { status });

  db.addAuditLog({
    userId: admin.userId,
    userEmail: admin.email,
    action: `USER_${status.toUpperCase()}`,
    entityType: 'user',
    entityId: target.id,
    details: `Admin ${admin.name} marked user "${target.name}" (${target.email}) as ${status}. Reason: ${reason || 'N/A'}`,
  });

  res.json({
    message: `User status changed to ${status}.`,
    user: updated,
  });
});
