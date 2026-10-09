import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Business,
  Branch,
  Product,
  Category,
  Municipality,
  Submission,
  Report,
  AuditLog,
} from '../types';

export interface DatabaseSchema {
  users: (User & { passwordHash: string; salt: string })[];
  categories: Category[];
  municipalities: Municipality[];
  businesses: Business[];
  branches: Branch[];
  products: Product[];
  submissions: Submission[];
  reports: Report[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'kaonta_db.json');

// Helper to hash passwords safely
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 1000, 64, 'sha256').toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const rehashed = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return rehashed === hash;
}

// Complete Bohol Municipalities
export const BOHOL_MUNICIPALITIES: Municipality[] = [
  { id: 'tagbilaran', name: 'Tagbilaran City', lat: 9.6496, lng: 123.8547, zone: 'South' },
  { id: 'panglao', name: 'Panglao', lat: 9.5787, lng: 123.7712, zone: 'South' },
  { id: 'dauis', name: 'Dauis', lat: 9.6256, lng: 123.8647, zone: 'South' },
  { id: 'baclayon', name: 'Baclayon', lat: 9.6225, lng: 123.9042, zone: 'South' },
  { id: 'alburquerque', name: 'Alburquerque', lat: 9.6083, lng: 123.9583, zone: 'South' },
  { id: 'loay', name: 'Loay', lat: 9.6000, lng: 124.0167, zone: 'South' },
  { id: 'lila', name: 'Lila', lat: 9.5833, lng: 124.0833, zone: 'South' },
  { id: 'dimiao', name: 'Dimiao', lat: 9.6000, lng: 124.1667, zone: 'South' },
  { id: 'valencia', name: 'Valencia', lat: 9.6167, lng: 124.2500, zone: 'South' },
  { id: 'garcia-hernandez', name: 'Garcia Hernandez', lat: 9.6167, lng: 124.3000, zone: 'South' },
  { id: 'jagna', name: 'Jagna', lat: 9.6533, lng: 124.3686, zone: 'East' },
  { id: 'duero', name: 'Duero', lat: 9.6833, lng: 124.4167, zone: 'East' },
  { id: 'guindulman', name: 'Guindulman', lat: 9.7333, lng: 124.4833, zone: 'East' },
  { id: 'anda', name: 'Anda', lat: 9.7431, lng: 124.5764, zone: 'East' },
  { id: 'candijay', name: 'Candijay', lat: 9.8167, lng: 124.5500, zone: 'East' },
  { id: 'mabini', name: 'Mabini', lat: 9.8667, lng: 124.5167, zone: 'East' },
  { id: 'alicia', name: 'Alicia', lat: 9.8972, lng: 124.4417, zone: 'East' },
  { id: 'ubay', name: 'Ubay', lat: 10.0544, lng: 124.4756, zone: 'North' },
  { id: 'trinidad', name: 'Trinidad', lat: 10.0833, lng: 124.3500, zone: 'North' },
  { id: 'talibon', name: 'Talibon', lat: 10.1500, lng: 124.3333, zone: 'North' },
  { id: 'bien-unido', name: 'Bien Unido', lat: 10.1333, lng: 124.2167, zone: 'North' },
  { id: 'pres-carlos-p-garcia', name: 'Pres. Carlos P. Garcia', lat: 10.1167, lng: 124.5667, zone: 'North' },
  { id: 'getafe', name: 'Getafe', lat: 10.1500, lng: 124.1500, zone: 'North' },
  { id: 'buenavista', name: 'Buenavista', lat: 10.0833, lng: 124.1167, zone: 'North' },
  { id: 'inabanga', name: 'Inabanga', lat: 10.0333, lng: 124.0667, zone: 'North' },
  { id: 'clarin', name: 'Clarin', lat: 9.9611, lng: 124.0228, zone: 'West' },
  { id: 'tubigon', name: 'Tubigon', lat: 9.9514, lng: 123.9619, zone: 'West' },
  { id: 'calape', name: 'Calape', lat: 9.8833, lng: 123.8667, zone: 'West' },
  { id: 'loon', name: 'Loon', lat: 9.7997, lng: 123.7919, zone: 'West' },
  { id: 'maribojoc', name: 'Maribojoc', lat: 9.7439, lng: 123.8406, zone: 'West' },
  { id: 'cortes', name: 'Cortes', lat: 9.7167, lng: 123.8833, zone: 'West' },
  { id: 'antequera', name: 'Antequera', lat: 9.7833, lng: 123.9000, zone: 'West' },
  { id: 'san-isidro', name: 'San Isidro', lat: 9.8833, lng: 123.9167, zone: 'West' },
  { id: 'corella', name: 'Corella', lat: 9.6869, lng: 123.9214, zone: 'South' },
  { id: 'sikatuna', name: 'Sikatuna', lat: 9.6833, lng: 123.9667, zone: 'Central' },
  { id: 'balilihan', name: 'Balilihan', lat: 9.7500, lng: 123.9667, zone: 'Central' },
  { id: 'catigbian', name: 'Catigbian', lat: 9.8333, lng: 124.0333, zone: 'Central' },
  { id: 'sagbayan', name: 'Sagbayan', lat: 9.9167, lng: 124.1000, zone: 'Central' },
  { id: 'danao', name: 'Danao', lat: 9.9500, lng: 124.2000, zone: 'Central' },
  { id: 'san-miguel', name: 'San Miguel', lat: 9.9833, lng: 124.3167, zone: 'Central' },
  { id: 'dagohoy', name: 'Dagohoy', lat: 9.9000, lng: 124.3000, zone: 'Central' },
  { id: 'pilar', name: 'Pilar', lat: 9.8167, lng: 124.3167, zone: 'Central' },
  { id: 'sierra-bullones', name: 'Sierra Bullones', lat: 9.7833, lng: 124.3000, zone: 'Central' },
  { id: 'carmen', name: 'Carmen', lat: 9.8333, lng: 124.1972, zone: 'Central' },
  { id: 'batuan', name: 'Batuan', lat: 9.7833, lng: 124.1500, zone: 'Central' },
  { id: 'bilar', name: 'Bilar', lat: 9.7125, lng: 124.1167, zone: 'Central' },
  { id: 'sevilla', name: 'Sevilla', lat: 9.6833, lng: 124.0500, zone: 'Central' },
  { id: 'loboc', name: 'Loboc', lat: 9.6375, lng: 124.0322, zone: 'Central' },
];

export const CATEGORIES: Category[] = [
  {
    id: 'heritage-eats',
    name: 'Heritage Boholano Eateries',
    type: 'food',
    icon: 'UtensilsCrossed',
    description: 'Traditional home-cooked Boholano recipes, native chicken, sinuglaw, and carinderias.',
  },
  {
    id: 'pasalubong-delicacies',
    name: 'Pasalubong & Native Delicacies',
    type: 'pasalubong',
    icon: 'Gift',
    description: 'Iconic Bohol takeout treats: Jagna Calamay, Peanut Kisses, Broas, and Tableya.',
  },
  {
    id: 'seafood-grill',
    name: 'Seafood & Native Grill',
    type: 'food',
    icon: 'Fish',
    description: 'Fresh Bohol Strait catch, grilled squid, takla (crayfish), and seaside sutukil.',
  },
  {
    id: 'farm-organic',
    name: 'Farm-to-Table & Organic',
    type: 'both',
    icon: 'Leaf',
    description: 'Natural ingredients, organic honey, garden salads, and local botanical ice cream.',
  },
  {
    id: 'bakery-coffee',
    name: 'Native Bakeries & Sikwate Cafes',
    type: 'both',
    icon: 'Coffee',
    description: 'Traditional wood-fired pastries, hot pure Bohol cacao sikwate, and puto maya.',
  },
  {
    id: 'coastal-resort-dining',
    name: 'Island & Resort Dining',
    type: 'food',
    icon: 'Palmtree',
    description: 'Casual beachfront dining, tropical fruit shakes, pizza, and regional favorites.',
  },
];

function generateSeedData(): DatabaseSchema {
  // Pre-seed 3 test accounts:
  // Admin: admin@kaontabohol.ph / BoholAdmin2026!
  // Owner: owner@boholflavors.ph / BoholOwner2026!
  // Visitor: visitor@bohol.local / Visitor2026!
  const adminPass = hashPassword('BoholAdmin2026!');
  const ownerPass = hashPassword('BoholOwner2026!');
  const visitorPass = hashPassword('Visitor2026!');

  const users: (User & { passwordHash: string; salt: string })[] = [
    {
      id: 'usr-admin-01',
      name: 'KaonTa Administrator',
      email: 'admin@kaontabohol.ph',
      role: 'admin',
      status: 'active',
      phone: '+63 38 412 0000',
      permissions: [
        'manage_users',
        'manage_businesses',
        'review_submissions',
        'manage_reports',
        'view_audit_logs',
      ],
      passwordHash: adminPass.hash,
      salt: adminPass.salt,
      createdAt: '2026-01-01T00:00:00.000Z',
      lastLoginAt: '2026-10-08T08:00:00.000Z',
    },
    {
      id: 'usr-owner-01',
      name: 'Maria Elena Chatto',
      email: 'owner@boholflavors.ph',
      role: 'owner',
      status: 'active',
      phone: '+63 917 555 4321',
      businessIds: ['biz-gerardas', 'biz-bee-farm', 'biz-jagna-calamay'],
      permissions: [],
      passwordHash: ownerPass.hash,
      salt: ownerPass.salt,
      createdAt: '2026-01-10T00:00:00.000Z',
      lastLoginAt: '2026-10-07T14:30:00.000Z',
    },
    {
      id: 'usr-visitor-01',
      name: 'Juana Dela Cruz',
      email: 'visitor@bohol.local',
      role: 'visitor',
      status: 'active',
      phone: '+63 920 123 4567',
      permissions: [],
      passwordHash: visitorPass.hash,
      salt: visitorPass.salt,
      createdAt: '2026-02-01T00:00:00.000Z',
      lastLoginAt: '2026-10-06T19:15:00.000Z',
    },
    {
      id: 'usr-visitor-02',
      name: 'Pedro Calungsod (Suspended Demo)',
      email: 'pedro.flagged@bohol.local',
      role: 'visitor',
      status: 'suspended',
      phone: '+63 918 888 9999',
      permissions: [],
      passwordHash: visitorPass.hash,
      salt: visitorPass.salt,
      createdAt: '2026-02-15T00:00:00.000Z',
      lastLoginAt: '2026-03-01T10:00:00.000Z',
    },
  ];

  // Authentic Bohol Demo Businesses (Clearly marked as Demo Data)
  const businesses: Business[] = [
    {
      id: 'biz-gerardas',
      ownerId: 'usr-owner-01',
      ownerEmail: 'owner@boholflavors.ph',
      name: "Gerarda's Family Restaurant",
      categoryId: 'heritage-eats',
      categoryName: 'Heritage Boholano Eateries',
      description: 'Generations of authentic Boholano culinary heritage. Celebrated for native chicken halang-halang, crispy takla crayfish, and home-style seafood sutukil.',
      contactPhone: '+63 38 412 3181',
      contactEmail: 'gerardas.tagbilaran@gmail.com',
      websiteUrl: 'https://gerardasbohol.ph',
      socialUrl: 'https://facebook.com/gerardasfamilyrestaurant',
      bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      logoImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80',
      status: 'approved',
      isDemo: true,
      branches: [],
      products: [],
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 'biz-bee-farm',
      ownerId: 'usr-owner-01',
      ownerEmail: 'owner@boholflavors.ph',
      name: 'Bohol Bee Farm Restaurant & Organic Store',
      categoryId: 'farm-organic',
      categoryName: 'Farm-to-Table & Organic',
      description: 'Pioneering organic farm-to-table dining, pure Bohol honeycombs, organic teas, and artisanal malunggay and ube ice cream cones.',
      contactPhone: '+63 38 510 1822',
      contactEmail: 'vicky.beefarm@gmail.com',
      websiteUrl: 'https://boholbeefarm.com',
      socialUrl: 'https://facebook.com/boholbeefarm',
      bannerImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
      logoImage: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=300&q=80',
      status: 'approved',
      isDemo: true,
      branches: [],
      products: [],
      createdAt: '2026-01-16T09:00:00.000Z',
      updatedAt: '2026-03-05T12:00:00.000Z',
    },
    {
      id: 'biz-jagna-calamay',
      ownerId: 'usr-owner-01',
      ownerEmail: 'owner@boholflavors.ph',
      name: "Ching's Jagna Calamay & Delicacies",
      categoryId: 'pasalubong-delicacies',
      categoryName: 'Pasalubong & Native Delicacies',
      description: 'Authentic Jagna Calamay cooked slowly in giant copper vats with fresh coconut milk, brown sugar, and sticky glutinous rice. Sealed with the signature red crepe band.',
      contactPhone: '+63 919 455 1209',
      contactEmail: 'chings.calamay@yahoo.com',
      websiteUrl: '',
      socialUrl: 'https://facebook.com/chingscalamayjagna',
      bannerImage: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=1200&q=80',
      logoImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',
      status: 'approved',
      isDemo: true,
      branches: [],
      products: [],
      createdAt: '2026-01-20T10:00:00.000Z',
      updatedAt: '2026-03-10T14:00:00.000Z',
    },
    {
      id: 'biz-baclayon-broas',
      ownerId: 'usr-owner-01',
      ownerEmail: 'owner@boholflavors.ph',
      name: 'Baclayon Heritage Broas Bakery',
      categoryId: 'bakery-coffee',
      categoryName: 'Native Bakeries & Sikwate Cafes',
      description: 'Preserving the centuries-old Spanish colonial recipe for feather-light crisp ladyfingers (Broas), baked fresh daily beside historical Baclayon Church.',
      contactPhone: '+63 38 540 9122',
      contactEmail: 'baclayonbroas@gmail.com',
      websiteUrl: '',
      socialUrl: '',
      bannerImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
      logoImage: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=300&q=80',
      status: 'approved',
      isDemo: true,
      branches: [],
      products: [],
      createdAt: '2026-01-22T11:00:00.000Z',
      updatedAt: '2026-03-12T16:00:00.000Z',
    },
    {
      id: 'biz-chocolate-hills-cafe',
      ownerId: 'usr-owner-01',
      ownerEmail: 'owner@boholflavors.ph',
      name: 'Chocolate Hills View Cafe & Pasalubong',
      categoryId: 'pasalubong-delicacies',
      categoryName: 'Pasalubong & Native Delicacies',
      description: 'Perched overlooking the iconic conical limestone karst hills of Carmen. Serving pure Boholano hot Sikwate, Puto Maya, and the authentic Peanut Kisses.',
      contactPhone: '+63 920 891 3341',
      contactEmail: 'carmenhillsview@gmail.com',
      websiteUrl: '',
      socialUrl: 'https://facebook.com/chocolatehillsviewcafe',
      bannerImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      logoImage: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=300&q=80',
      status: 'approved',
      isDemo: true,
      branches: [],
      products: [],
      createdAt: '2026-01-25T14:00:00.000Z',
      updatedAt: '2026-03-15T09:00:00.000Z',
    },
    {
      id: 'biz-payag-tagbilaran',
      ownerId: 'usr-owner-01',
      ownerEmail: 'owner@boholflavors.ph',
      name: 'Payag Restaurant Native Grill',
      categoryId: 'heritage-eats',
      categoryName: 'Heritage Boholano Eateries',
      description: 'The beloved home of Boholano Chicken Inato, charcoal-grilled to golden perfection with calamansi and annatto oil, paired with spicy native dipping sauces.',
      contactPhone: '+63 38 411 4111',
      contactEmail: 'payagbohol@yahoo.com',
      websiteUrl: 'https://payagbohol.com',
      socialUrl: 'https://facebook.com/payagrestaurantbohol',
      bannerImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      logoImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      status: 'approved',
      isDemo: true,
      branches: [],
      products: [],
      createdAt: '2026-01-28T09:30:00.000Z',
      updatedAt: '2026-03-18T11:00:00.000Z',
    },
    {
      id: 'biz-loboc-river',
      ownerId: 'usr-owner-01',
      ownerEmail: 'owner@boholflavors.ph',
      name: 'Loboc River Floating Restaurant',
      categoryId: 'heritage-eats',
      categoryName: 'Heritage Boholano Eateries',
      description: 'Cruising through the emerald green waters of Loboc River while enjoying an authentic Boholano feast accompanied by acoustic folk serenades.',
      contactPhone: '+63 38 537 9410',
      contactEmail: 'lobocfloating@gmail.com',
      websiteUrl: '',
      socialUrl: 'https://facebook.com/lobocrivercruisebuffet',
      bannerImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      logoImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80',
      status: 'approved',
      isDemo: true,
      branches: [],
      products: [],
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-03-20T10:00:00.000Z',
    },
    {
      id: 'biz-tubigon-crafts',
      ownerId: 'usr-owner-01',
      ownerEmail: 'owner@boholflavors.ph',
      name: 'Tubigon Port Native Delicacy & Snack Hub',
      categoryId: 'pasalubong-delicacies',
      categoryName: 'Pasalubong & Native Delicacies',
      description: 'Located right by Tubigon Seaport terminal. Famous for warm bibingka sa dahon, toasted pinipig, and freshly sliced sweet Bohol banana chips.',
      contactPhone: '+63 928 333 4455',
      contactEmail: 'tubigondelicacies@gmail.com',
      websiteUrl: '',
      socialUrl: '',
      bannerImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
      logoImage: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=300&q=80',
      status: 'approved',
      isDemo: true,
      branches: [],
      products: [],
      createdAt: '2026-02-05T11:00:00.000Z',
      updatedAt: '2026-03-22T13:00:00.000Z',
    },
    {
      id: 'biz-anda-seafood',
      ownerId: 'usr-owner-01',
      ownerEmail: 'owner@boholflavors.ph',
      name: 'Anda White Beach Seafood Paluto',
      categoryId: 'seafood-grill',
      categoryName: 'Seafood & Native Grill',
      description: 'Cooked-to-order fresh seafood along the pristine powder-white sands of Quinale Beach. Catch of the day prepared in traditional Visayan sabaw, sugba, or tuwa.',
      contactPhone: '+63 917 889 0012',
      contactEmail: 'andaseafood@gmail.com',
      websiteUrl: '',
      socialUrl: 'https://facebook.com/andaseafoodpaluto',
      bannerImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
      logoImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=300&q=80',
      status: 'approved',
      isDemo: true,
      branches: [],
      products: [],
      createdAt: '2026-02-10T12:00:00.000Z',
      updatedAt: '2026-03-25T15:00:00.000Z',
    },
  ];

  // Specific Branches for each business with authentic Bohol coordinates
  const branches: Branch[] = [
    // Gerarda's Main
    {
      id: 'br-gerardas-01',
      businessId: 'biz-gerardas',
      branchName: 'Main Heritage House',
      address: '30 J.S. Torralba St., Poblacion II',
      municipality: 'Tagbilaran City',
      latitude: 9.6482,
      longitude: 123.8531,
      contactPhone: '+63 38 412 3181',
      operatingHours: 'Mon-Sun 10:00 AM - 9:00 PM',
      isMainBranch: true,
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-03-01T10:00:00.000Z',
    },
    // Bohol Bee Farm - Dauis Main & Tagbilaran Kiosk
    {
      id: 'br-beefarm-dauis',
      businessId: 'biz-bee-farm',
      branchName: 'Main Resort & Organic Cliff Restaurant',
      address: 'Dao, Dauis, Panglao Island',
      municipality: 'Dauis',
      latitude: 9.5982,
      longitude: 123.8291,
      contactPhone: '+63 38 510 1822',
      operatingHours: 'Mon-Sun 7:00 AM - 9:30 PM',
      isMainBranch: true,
      createdAt: '2026-01-16T09:00:00.000Z',
      updatedAt: '2026-03-05T12:00:00.000Z',
    },
    {
      id: 'br-beefarm-alona',
      businessId: 'biz-bee-farm',
      branchName: 'Alona Beach Ice Cream & Honey Kiosk',
      address: 'Alona Beachfront Path, Tawala',
      municipality: 'Panglao',
      latitude: 9.5492,
      longitude: 123.7725,
      contactPhone: '+63 38 510 1823',
      operatingHours: 'Mon-Sun 9:00 AM - 11:00 PM',
      isMainBranch: false,
      createdAt: '2026-01-18T10:00:00.000Z',
      updatedAt: '2026-03-05T12:00:00.000Z',
    },
    {
      id: 'br-beefarm-tagbilaran',
      businessId: 'biz-bee-farm',
      branchName: 'Tagbilaran Galleria Luisa Express',
      address: 'Ground Floor, Galleria Luisa, CPG North Ave',
      municipality: 'Tagbilaran City',
      latitude: 9.6515,
      longitude: 123.8562,
      contactPhone: '+63 38 411 2000',
      operatingHours: 'Mon-Sat 9:00 AM - 8:00 PM',
      isMainBranch: false,
      createdAt: '2026-01-19T10:00:00.000Z',
      updatedAt: '2026-03-05T12:00:00.000Z',
    },
    // Ching's Jagna Calamay
    {
      id: 'br-jagna-01',
      businessId: 'biz-jagna-calamay',
      branchName: 'Jagna Port Highway Workshop & Store',
      address: 'National Highway, Poblacion',
      municipality: 'Jagna',
      latitude: 9.6538,
      longitude: 124.3695,
      contactPhone: '+63 919 455 1209',
      operatingHours: 'Mon-Sun 6:00 AM - 7:00 PM',
      isMainBranch: true,
      createdAt: '2026-01-20T10:00:00.000Z',
      updatedAt: '2026-03-10T14:00:00.000Z',
    },
    // Baclayon Broas
    {
      id: 'br-baclayon-01',
      businessId: 'biz-baclayon-broas',
      branchName: 'Heritage Church Plaza Outlet',
      address: 'Plaza Rizal, Poblacion',
      municipality: 'Baclayon',
      latitude: 9.6228,
      longitude: 123.9045,
      contactPhone: '+63 38 540 9122',
      operatingHours: 'Mon-Sun 7:30 AM - 6:00 PM',
      isMainBranch: true,
      createdAt: '2026-01-22T11:00:00.000Z',
      updatedAt: '2026-03-12T16:00:00.000Z',
    },
    // Chocolate Hills View Cafe
    {
      id: 'br-carmen-01',
      businessId: 'biz-chocolate-hills-cafe',
      branchName: 'Main Observation Complex',
      address: 'Chocolate Hills Complex, Barangay Buenos Aires',
      municipality: 'Carmen',
      latitude: 9.8335,
      longitude: 124.1975,
      contactPhone: '+63 920 891 3341',
      operatingHours: 'Mon-Sun 6:30 AM - 6:30 PM',
      isMainBranch: true,
      createdAt: '2026-01-25T14:00:00.000Z',
      updatedAt: '2026-03-15T09:00:00.000Z',
    },
    // Payag Restaurant Tagbilaran
    {
      id: 'br-payag-cpg',
      businessId: 'biz-payag-tagbilaran',
      branchName: 'CPG Avenue Flagship',
      address: 'CPG North Avenue, Tagbilaran City',
      municipality: 'Tagbilaran City',
      latitude: 9.6540,
      longitude: 123.8575,
      contactPhone: '+63 38 411 4111',
      operatingHours: 'Mon-Sun 9:00 AM - 9:00 PM',
      isMainBranch: true,
      createdAt: '2026-01-28T09:30:00.000Z',
      updatedAt: '2026-03-18T11:00:00.000Z',
    },
    // Loboc River Floating Restaurant
    {
      id: 'br-loboc-dock',
      businessId: 'biz-loboc-river',
      branchName: 'Loboc Tourism Complex Docking Port',
      address: 'Poblacion Sawang, Loboc River',
      municipality: 'Loboc',
      latitude: 9.6382,
      longitude: 124.0325,
      contactPhone: '+63 38 537 9410',
      operatingHours: 'Mon-Sun 10:30 AM - 3:30 PM',
      isMainBranch: true,
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-03-20T10:00:00.000Z',
    },
    // Tubigon Port
    {
      id: 'br-tubigon-01',
      businessId: 'biz-tubigon-crafts',
      branchName: 'Seaport Terminal Road',
      address: 'Port Area, Centro, Tubigon',
      municipality: 'Tubigon',
      latitude: 9.9525,
      longitude: 123.9622,
      contactPhone: '+63 928 333 4455',
      operatingHours: 'Mon-Sun 5:00 AM - 7:00 PM',
      isMainBranch: true,
      createdAt: '2026-02-05T11:00:00.000Z',
      updatedAt: '2026-03-22T13:00:00.000Z',
    },
    // Anda Seafood Paluto
    {
      id: 'br-anda-01',
      businessId: 'biz-anda-seafood',
      branchName: 'Quinale Beachfront',
      address: 'Quinale Beach Boardwalk, Poblacion',
      municipality: 'Anda',
      latitude: 9.7435,
      longitude: 124.5768,
      contactPhone: '+63 917 889 0012',
      operatingHours: 'Mon-Sun 10:00 AM - 8:30 PM',
      isMainBranch: true,
      createdAt: '2026-02-10T12:00:00.000Z',
      updatedAt: '2026-03-25T15:00:00.000Z',
    },
  ];

  // Specific Products linked to their offering branches
  const products: Product[] = [
    // Gerarda's
    {
      id: 'prod-gerardas-01',
      businessId: 'biz-gerardas',
      branchIds: ['br-gerardas-01'],
      name: 'Authentic Boholano Native Chicken Halang-Halang',
      category: 'Main Dish',
      description: 'Free-range native chicken stewed in fresh coconut milk, fiery native chili (siling labuyo), and aromatic ginger.',
      price: 260,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
      isPasalubong: false,
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 'prod-gerardas-02',
      businessId: 'biz-gerardas',
      branchIds: ['br-gerardas-01'],
      name: 'Crispy Takla Crayfish with Garlic Butter',
      category: 'Seafood',
      description: 'Bohol river crayfish fried to a crisp and tossed in rich garlic butter and calamansi.',
      price: 320,
      availability: 'seasonal',
      image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80',
      isPasalubong: false,
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-03-01T10:00:00.000Z',
    },
    // Bohol Bee Farm products
    {
      id: 'prod-beefarm-01',
      businessId: 'biz-bee-farm',
      branchIds: ['br-beefarm-dauis', 'br-beefarm-alona', 'br-beefarm-tagbilaran'],
      name: 'Pure Bohol Wildflower Organic Honey (250ml)',
      category: 'Pasalubong',
      description: 'Unfiltered, raw wildflower honey sustainably harvested from Dauis apiaries.',
      price: 280,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
      isPasalubong: true,
      createdAt: '2026-01-16T09:00:00.000Z',
      updatedAt: '2026-03-05T12:00:00.000Z',
    },
    {
      id: 'prod-beefarm-02',
      businessId: 'biz-bee-farm',
      branchIds: ['br-beefarm-dauis', 'br-beefarm-alona'],
      name: 'Signature Malunggay & Ube Ice Cream in Cassava Cone',
      category: 'Dessert',
      description: 'All-natural herbal and tuber ice cream served in freshly rolled, crispy cassava cones.',
      price: 85,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80',
      isPasalubong: false,
      createdAt: '2026-01-16T09:00:00.000Z',
      updatedAt: '2026-03-05T12:00:00.000Z',
    },
    // Ching's Jagna Calamay
    {
      id: 'prod-calamay-01',
      businessId: 'biz-jagna-calamay',
      branchIds: ['br-jagna-01'],
      name: 'Authentic Jagna Calamay in Coconut Shell',
      category: 'Pasalubong',
      description: 'Rich, sticky Visayan delicacy prepared with glutinous rice flour, dark muscovado sugar, and pure coconut cream.',
      price: 120,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      isPasalubong: true,
      createdAt: '2026-01-20T10:00:00.000Z',
      updatedAt: '2026-03-10T14:00:00.000Z',
    },
    // Baclayon Broas
    {
      id: 'prod-broas-01',
      businessId: 'biz-baclayon-broas',
      branchIds: ['br-baclayon-01'],
      name: 'Baclayon Crisp Heritage Broas (Box of 30)',
      category: 'Pasalubong',
      description: 'Feather-light golden ladyfingers hand-whipped to heirloom perfection since the 1800s.',
      price: 150,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=600&q=80',
      isPasalubong: true,
      createdAt: '2026-01-22T11:00:00.000Z',
      updatedAt: '2026-03-12T16:00:00.000Z',
    },
    // Chocolate Hills Peanut Kisses & Sikwate
    {
      id: 'prod-peanuts-01',
      businessId: 'biz-chocolate-hills-cafe',
      branchIds: ['br-carmen-01'],
      name: 'Original Bohol Peanut Kisses (Pack of 4)',
      category: 'Pasalubong',
      description: 'Iconic triangular cookies made from high-grade peanuts and egg whites, modeled after the Chocolate Hills.',
      price: 95,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
      isPasalubong: true,
      createdAt: '2026-01-25T14:00:00.000Z',
      updatedAt: '2026-03-15T09:00:00.000Z',
    },
    {
      id: 'prod-sikwate-01',
      businessId: 'biz-chocolate-hills-cafe',
      branchIds: ['br-carmen-01'],
      name: 'Hot Boholano Sikwate with Sweet Mango and Puto Maya',
      category: 'Beverage & Snack',
      description: 'Traditional hot chocolate prepared from 100% pure roasted cacao tableya, served with steamed sticky rice and ripe carabao mango.',
      price: 110,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
      isPasalubong: false,
      createdAt: '2026-01-25T14:00:00.000Z',
      updatedAt: '2026-03-15T09:00:00.000Z',
    },
    // Payag Inato
    {
      id: 'prod-payag-inato',
      businessId: 'biz-payag-tagbilaran',
      branchIds: ['br-payag-cpg'],
      name: 'Payag Chicken Inato (Quarter Leg with Rice)',
      category: 'Grill',
      description: 'Specially marinated grilled native-style chicken basted in achuete and lemongrass oil.',
      price: 175,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      isPasalubong: false,
      createdAt: '2026-01-28T09:30:00.000Z',
      updatedAt: '2026-03-18T11:00:00.000Z',
    },
    // Loboc Buffet
    {
      id: 'prod-loboc-buffet',
      businessId: 'biz-loboc-river',
      branchIds: ['br-loboc-dock'],
      name: 'Full River Cruise Boholano Heritage Buffet',
      category: 'Buffet',
      description: 'Unlimited feast featuring lechon kawali, grilled squid, pansit bam-i, lato seaweed salad, and tropical fruits.',
      price: 850,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      isPasalubong: false,
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-03-20T10:00:00.000Z',
    },
    // Tubigon Snacks
    {
      id: 'prod-tubigon-chips',
      businessId: 'biz-tubigon-crafts',
      branchIds: ['br-tubigon-01'],
      name: 'Crispy Sweetened Bohol Banana Chips (300g)',
      category: 'Pasalubong',
      description: 'Thinly sliced saba bananas glazed with raw cane sugar and fried until golden crispy.',
      price: 65,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80',
      isPasalubong: true,
      createdAt: '2026-02-05T11:00:00.000Z',
      updatedAt: '2026-03-22T13:00:00.000Z',
    },
    // Anda Seafood
    {
      id: 'prod-anda-kinilaw',
      businessId: 'biz-anda-seafood',
      branchIds: ['br-anda-01'],
      name: 'Fresh Reef Fish Kinilaw sa Tabon-Tabon',
      category: 'Seafood',
      description: 'Authentic Visayan ceviche infused with grated tabon-tabon seed extract and spicy coconut vinegar.',
      price: 240,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
      isPasalubong: false,
      createdAt: '2026-02-10T12:00:00.000Z',
      updatedAt: '2026-03-25T15:00:00.000Z',
    },
  ];

  // Attach branches and products into businesses
  for (const b of businesses) {
    b.branches = branches.filter((br) => br.businessId === b.id);
    b.products = products.filter((p) => p.businessId === b.id);
  }

  // Pre-seed some Submissions and Reports for Admin verification demonstration
  const submissions: Submission[] = [
    {
      id: 'sub-01',
      businessId: 'biz-gerardas',
      ownerId: 'usr-owner-01',
      ownerEmail: 'owner@boholflavors.ph',
      businessName: "Gerarda's Family Restaurant",
      type: 'new_business',
      proposedData: {
        name: "Gerarda's Family Restaurant",
        description: 'Authentic heritage Boholano eatery.',
      },
      status: 'approved',
      feedback: 'Approved after verification of physical establishment address.',
      reviewedBy: 'admin@kaontabohol.ph',
      reviewedAt: '2026-01-15T12:00:00.000Z',
      createdAt: '2026-01-15T08:00:00.000Z',
    },
    {
      id: 'sub-02',
      businessId: 'biz-jagna-calamay',
      ownerId: 'usr-owner-01',
      ownerEmail: 'owner@boholflavors.ph',
      businessName: "Ching's Jagna Calamay & Delicacies",
      type: 'new_business',
      proposedData: {
        name: "Ching's Jagna Calamay & Delicacies",
      },
      status: 'approved',
      feedback: 'Approved. Official traditional pasalubong producer.',
      reviewedBy: 'admin@kaontabohol.ph',
      reviewedAt: '2026-01-20T14:00:00.000Z',
      createdAt: '2026-01-20T10:00:00.000Z',
    },
  ];

  const reports: Report[] = [
    {
      id: 'rep-01',
      businessId: 'biz-chocolate-hills-cafe',
      businessName: 'Chocolate Hills View Cafe & Pasalubong',
      branchId: 'br-carmen-01',
      branchName: 'Main Observation Complex',
      reporterEmail: 'traveler.juan@gmail.com',
      reporterName: 'Juan Dela Cruz',
      issueType: 'wrong_hours',
      description: 'Observation deck cafe now opens slightly earlier at 6:00 AM on sunrise weekends.',
      status: 'pending',
      createdAt: '2026-03-28T09:00:00.000Z',
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-01',
      timestamp: '2026-01-15T12:00:00.000Z',
      userId: 'usr-admin-01',
      userEmail: 'admin@kaontabohol.ph',
      action: 'SUBMISSION_APPROVED',
      entityType: 'business',
      entityId: 'biz-gerardas',
      details: "Approved initial business listing for Gerarda's Family Restaurant",
    },
    {
      id: 'log-02',
      timestamp: '2026-01-20T14:00:00.000Z',
      userId: 'usr-admin-01',
      userEmail: 'admin@kaontabohol.ph',
      action: 'SUBMISSION_APPROVED',
      entityType: 'business',
      entityId: 'biz-jagna-calamay',
      details: "Approved listing for Ching's Jagna Calamay",
    },
  ];

  return {
    users,
    categories: CATEGORIES,
    municipalities: BOHOL_MUNICIPALITIES,
    businesses,
    branches,
    products,
    submissions,
    reports,
    auditLogs,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(raw);
        // Normalize users to guarantee status and permissions are present
        if (parsed.users && Array.isArray(parsed.users)) {
          parsed.users = parsed.users.map((u) => ({
            ...u,
            status: u.status || 'active',
            permissions:
              u.permissions ||
              (u.role === 'admin'
                ? [
                    'manage_users',
                    'manage_businesses',
                    'review_submissions',
                    'manage_reports',
                    'view_audit_logs',
                  ]
                : []),
          }));
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading database file, falling back to seed data:', e);
    }
    const seed = generateSeedData();
    this.persist(seed);
    return seed;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error persisting database:', e);
    }
  }

  public save() {
    this.persist();
  }

  // Getters
  public getUsers() {
    return this.data.users;
  }

  public getUserById(id: string) {
    return this.data.users.find((u) => u.id === id) || null;
  }

  public updateUser(id: string, updates: Partial<User & { passwordHash?: string; salt?: string }>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
    };
    this.save();
    return this.data.users[idx];
  }

  public deleteUser(id: string) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.save();
    return true;
  }

  public getAdminStats() {
    const totalUsers = this.data.users.length;
    const activeUsers = this.data.users.filter((u) => u.status !== 'suspended').length;
    const suspendedUsers = this.data.users.filter((u) => u.status === 'suspended').length;
    const totalBusinesses = this.data.businesses.length;
    const approvedBusinesses = this.data.businesses.filter((b) => b.status === 'approved').length;
    const pendingSubmissions = this.data.submissions.filter((s) => s.status === 'pending').length;
    const openReports = this.data.reports.filter((r) => r.status === 'pending').length;
    const totalAuditLogs = this.data.auditLogs.length;

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalBusinesses,
      approvedBusinesses,
      pendingSubmissions,
      openReports,
      totalAuditLogs,
    };
  }

  public getCategories() {
    return this.data.categories;
  }

  public getMunicipalities() {
    return this.data.municipalities;
  }

  public getBusinesses(approvedOnly = true) {
    if (approvedOnly) {
      return this.data.businesses.filter((b) => b.status === 'approved');
    }
    return this.data.businesses;
  }

  public getBusinessById(id: string) {
    const biz = this.data.businesses.find((b) => b.id === id);
    if (!biz) return null;
    // ensure branches and products are attached
    biz.branches = this.data.branches.filter((br) => br.businessId === id);
    biz.products = this.data.products.filter((p) => p.businessId === id);
    return biz;
  }

  public getBranches() {
    return this.data.branches;
  }

  public getProducts(approvedBusinessesOnly = true) {
    if (approvedBusinessesOnly) {
      const approvedIds = new Set(
        this.data.businesses.filter((b) => b.status === 'approved').map((b) => b.id)
      );
      return this.data.products.filter((p) => approvedIds.has(p.businessId));
    }
    return this.data.products;
  }

  public getSubmissions() {
    return this.data.submissions;
  }

  public getReports() {
    return this.data.reports;
  }

  public getAuditLogs() {
    return this.data.auditLogs;
  }

  // Mutations
  public addUser(user: User & { passwordHash: string; salt: string }) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public addBusiness(biz: Business) {
    this.data.businesses.push(biz);
    this.save();
    return biz;
  }

  public updateBusiness(id: string, updates: Partial<Business>) {
    const idx = this.data.businesses.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.data.businesses[idx] = {
      ...this.data.businesses[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.businesses[idx];
  }

  public addBranch(branch: Branch) {
    this.data.branches.push(branch);
    // sync in business
    const biz = this.data.businesses.find((b) => b.id === branch.businessId);
    if (biz) {
      biz.branches = this.data.branches.filter((br) => br.businessId === biz.id);
    }
    this.save();
    return branch;
  }

  public updateBranch(id: string, updates: Partial<Branch>) {
    const idx = this.data.branches.findIndex((br) => br.id === id);
    if (idx === -1) return null;
    this.data.branches[idx] = {
      ...this.data.branches[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const bId = this.data.branches[idx].businessId;
    const biz = this.data.businesses.find((b) => b.id === bId);
    if (biz) {
      biz.branches = this.data.branches.filter((br) => br.businessId === biz.id);
    }
    this.save();
    return this.data.branches[idx];
  }

  public deleteBranch(id: string) {
    const idx = this.data.branches.findIndex((br) => br.id === id);
    if (idx === -1) return false;
    const bId = this.data.branches[idx].businessId;
    this.data.branches.splice(idx, 1);
    const biz = this.data.businesses.find((b) => b.id === bId);
    if (biz) {
      biz.branches = this.data.branches.filter((br) => br.businessId === biz.id);
    }
    this.save();
    return true;
  }

  public addProduct(prod: Product) {
    this.data.products.push(prod);
    const biz = this.data.businesses.find((b) => b.id === prod.businessId);
    if (biz) {
      biz.products = this.data.products.filter((p) => p.businessId === biz.id);
    }
    this.save();
    return prod;
  }

  public updateProduct(id: string, updates: Partial<Product>) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const bId = this.data.products[idx].businessId;
    const biz = this.data.businesses.find((b) => b.id === bId);
    if (biz) {
      biz.products = this.data.products.filter((p) => p.businessId === biz.id);
    }
    this.save();
    return this.data.products[idx];
  }

  public deleteProduct(id: string) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const bId = this.data.products[idx].businessId;
    this.data.products.splice(idx, 1);
    const biz = this.data.businesses.find((b) => b.id === bId);
    if (biz) {
      biz.products = this.data.products.filter((p) => p.businessId === biz.id);
    }
    this.save();
    return true;
  }

  public addSubmission(sub: Submission) {
    this.data.submissions.unshift(sub);
    this.save();
    return sub;
  }

  public updateSubmission(id: string, updates: Partial<Submission>) {
    const idx = this.data.submissions.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.submissions[idx] = {
      ...this.data.submissions[idx],
      ...updates,
    };
    this.save();
    return this.data.submissions[idx];
  }

  public addReport(rep: Report) {
    this.data.reports.unshift(rep);
    this.save();
    return rep;
  }

  public updateReport(id: string, updates: Partial<Report>) {
    const idx = this.data.reports.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.data.reports[idx] = {
      ...this.data.reports[idx],
      ...updates,
    };
    this.save();
    return this.data.reports[idx];
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    this.save();
    return newLog;
  }
}

export const db = new Database();
