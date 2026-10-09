import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileCheck,
  Flag,
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Key,
  Mail,
  Phone,
  Calendar,
  Lock,
  Search,
  SlidersHorizontal,
  Store,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Submission,
  Report,
  AuditLog,
  User,
  AdminStats,
  UserRole,
  AdminPermission,
} from '../types';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user: currentUser, role, isAdmin, hasPermission, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'submissions' | 'reports' | 'users' | 'audit'>(
    'submissions'
  );
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Review submission modal state
  const [reviewingSub, setReviewingSub] = useState<Submission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // User Management modals state
  const [editingUserRole, setEditingUserRole] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('visitor');
  const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>([]);

  const [suspendingUser, setSuspendingUser] = useState<User | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('visitor');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserError, setNewUserError] = useState<string | null>(null);

  // Users tab search & filter
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');

  const allPermissionsList: { id: AdminPermission; label: string; desc: string }[] = [
    {
      id: 'manage_users',
      label: 'Manage Users & Admins',
      desc: 'Can view, promote, suspend, and configure permissions of user accounts',
    },
    {
      id: 'review_submissions',
      label: 'Review Submissions',
      desc: 'Can approve, reject, or request changes on restaurant and product listings',
    },
    {
      id: 'manage_businesses',
      label: 'Manage Establishments',
      desc: 'Can edit details, verify badges, or suspend listed businesses',
    },
    {
      id: 'manage_reports',
      label: 'Handle Inaccuracy Reports',
      desc: 'Can review and action reports filed by community members and tourists',
    },
    {
      id: 'view_audit_logs',
      label: 'Inspect Audit Logs',
      desc: 'Can review the audit trail of all administrative and user operations',
    },
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subs, reps, logs, userList, statsRes] = await Promise.all([
        api.getAdminSubmissions().catch(() => []),
        api.getAdminReports().catch(() => []),
        api.getAdminAuditLogs().catch(() => []),
        api.getAdminUsers().catch(() => []),
        api.getAdminStats().catch(() => null),
      ]);
      setSubmissions(subs);
      setReports(reps);
      setAuditLogs(logs);
      setUsers(userList);
      setStats(statsRes);
    } catch (err: any) {
      console.error('Failed loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const handleReviewAction = async (action: 'approve' | 'reject' | 'return') => {
    if (!reviewingSub) return;
    try {
      await api.reviewSubmission(reviewingSub.id, action, feedbackText);
      setActionNotice(`Submission marked as ${action}d successfully.`);
      setReviewingSub(null);
      setFeedbackText('');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReportAction = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await api.actionReport(reportId, status, 'Resolved by Administrator');
      setActionNotice(`Report marked as ${status}.`);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveUserRole = async () => {
    if (!editingUserRole) return;
    try {
      await api.updateUserRole(editingUserRole.id, selectedRole, selectedPermissions);
      setActionNotice(`Role for ${editingUserRole.name} updated to ${selectedRole}.`);
      setEditingUserRole(null);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConfirmStatusChange = async (targetStatus: 'active' | 'suspended') => {
    if (!suspendingUser) return;
    try {
      await api.setUserStatus(suspendingUser.id, targetStatus, suspendReason);
      setActionNotice(`Account ${suspendingUser.name} has been ${targetStatus === 'suspended' ? 'suspended' : 'reactivated'}.`);
      setSuspendingUser(null);
      setSuspendReason('');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserError(null);
    try {
      await api.createAdminUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        phone: newUserPhone || undefined,
        permissions:
          newUserRole === 'admin'
            ? [
                'manage_users',
                'manage_businesses',
                'review_submissions',
                'manage_reports',
                'view_audit_logs',
              ]
            : [],
      });
      setActionNotice(`New ${newUserRole} account created for ${newUserName}.`);
      setIsCreatingUser(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserPhone('');
      await loadData();
    } catch (err: any) {
      setNewUserError(err.message || 'Failed to create user account.');
    }
  };

  // If user is not admin, show clear authorization barrier
  if (!isAdmin && !isLoading) {
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
            You must be signed in with an authorized Administrator account to access the moderation
            queue, user management, and security audit logs.
          </p>
        </div>
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-3">
          <div className="font-semibold text-stone-800">Switch to Administrator for Testing:</div>
          <button
            onClick={async () => {
              await switchDemoRole('admin');
              await loadData();
            }}
            className="w-full py-2.5 px-4 bg-[#164E3D] hover:bg-[#113B2E] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Shield className="w-4 h-4 text-blue-300" />
            <span>Use Administrator Account</span>
          </button>
          <button
            onClick={() => onNavigate('/login')}
            className="w-full py-2 px-3 text-stone-600 hover:text-stone-900 font-medium"
          >
            Sign in with existing credentials
          </button>
        </div>
      </div>
    );
  }

  const pendingSubsCount = submissions.filter((s) => s.status === 'pending').length;
  const pendingRepsCount = reports.filter((r) => r.status === 'pending').length;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-stone-800">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#164E3D]">
            Governance & User Administration
          </h1>
          <p className="text-xs text-stone-500">
            RBAC modeling, user account management, submission reviews, and platform audit records.
          </p>
        </div>

        {/* Global Stats / Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Refresh administrative data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#164E3D]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Ribbon */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>Total Accounts</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900">{stats.totalUsers}</div>
            <div className="text-[11px] text-stone-400">
              {stats.activeUsers} active, {stats.suspendedUsers} suspended
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>Submissions Queue</span>
              <FileCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900">{stats.pendingSubmissions}</div>
            <div className="text-[11px] text-stone-400">Awaiting approval or return</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>Open Reports</span>
              <Flag className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900">{stats.openReports}</div>
            <div className="text-[11px] text-stone-400">Inaccurate hours, closed, etc.</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>Active Establishments</span>
              <Store className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900">{stats.approvedBusinesses}</div>
            <div className="text-[11px] text-stone-400">Verified Bohol eateries & shops</div>
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-[#164E3D] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Submissions ({pendingSubsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#164E3D] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User & Admin Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-[#164E3D] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Visitor Reports ({pendingRepsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-[#164E3D] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center justify-between gap-2 border border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: SUBMISSIONS REVIEW */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-serif text-stone-900">
              Pending Submissions Review Queue
            </h2>
          </div>

          {submissions.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200">
              No submissions currently in the review queue.
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sub.status === 'pending'
                            ? 'bg-amber-100 text-amber-900'
                            : sub.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-red-100 text-red-900'
                        }`}
                      >
                        {sub.status.toUpperCase()}
                      </span>
                      <span className="text-stone-400 font-mono text-[10px]">{sub.id}</span>
                      <span className="text-stone-400 text-[10px]">
                        Submitted {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-stone-900">{sub.businessName}</h3>
                    <div className="text-stone-500 text-[11px]">
                      Submitted by: <span className="font-medium">{sub.ownerEmail}</span> ({sub.type.replace('_', ' ')})
                    </div>

                    {sub.feedback && (
                      <div className="p-2 bg-stone-50 rounded-lg text-stone-600 text-[11px] border border-stone-200">
                        Admin Note: {sub.feedback}
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-end justify-center gap-2 shrink-0">
                    {sub.status === 'pending' ? (
                      <button
                        onClick={() => {
                          setReviewingSub(sub);
                          setFeedbackText('');
                        }}
                        className="px-4 py-2 bg-[#164E3D] hover:bg-[#123E30] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Review Listing
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setReviewingSub(sub);
                          setFeedbackText(sub.feedback || '');
                        }}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-xs transition-colors"
                      >
                        Re-evaluate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER & ADMIN MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold font-serif text-stone-900">
                User Accounts & Role-Based Access Control (RBAC)
              </h2>
              <p className="text-xs text-stone-500">
                Configure user roles, grant administrator privileges, and enforce account statuses.
              </p>
            </div>

            <button
              onClick={() => {
                setIsCreatingUser(true);
                setNewUserError(null);
              }}
              className="px-4 py-2 bg-[#164E3D] hover:bg-[#123E30] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* User Filters & Search */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-medium">Role:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 font-medium focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="owner">Business Owners</option>
                <option value="visitor">Visitors</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-medium">Status:</span>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 font-medium focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* User Cards / Table */}
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="p-10 text-center text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">
                No users matching criteria.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isCurrent = u.id === currentUser?.id;
                return (
                  <div
                    key={u.id}
                    className={`bg-white p-5 rounded-2xl border transition-all shadow-xs flex flex-col md:flex-row justify-between gap-4 text-xs ${
                      u.status === 'suspended'
                        ? 'border-red-200 bg-red-50/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-stone-900">{u.name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F3EE] text-[#164E3D]">
                            YOU
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : u.role === 'owner'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {u.role}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'suspended'
                              ? 'bg-red-100 text-red-900'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {u.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-stone-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <span>{u.email}</span>
                        </span>
                        {u.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            <span>{u.phone}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                        </span>
                        {u.lastLoginAt && (
                          <span className="text-stone-400">
                            Last Active: {new Date(u.lastLoginAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Display assigned permissions for admins */}
                      {u.role === 'admin' && (
                        <div className="pt-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-stone-500 mr-1">
                            Privileges:
                          </span>
                          {(u.permissions || []).map((perm) => (
                            <span
                              key={perm}
                              className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md text-[10px] font-mono border border-blue-100"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                      <button
                        onClick={() => {
                          setEditingUserRole(u);
                          setSelectedRole(u.role);
                          setSelectedPermissions(u.permissions || []);
                        }}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Key className="w-3 h-3 text-stone-500" />
                        <span>Edit Role</span>
                      </button>

                      {!isCurrent && (
                        <button
                          onClick={() => {
                            setSuspendingUser(u);
                            setSuspendReason('');
                          }}
                          className={`px-3 py-1.5 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                            u.status === 'suspended'
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          }`}
                        >
                          {u.status === 'suspended' ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              <span>Reactivate</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3" />
                              <span>Suspend</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VISITOR REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold font-serif text-stone-900">
            Community & Visitor Reports ({reports.length})
          </h2>

          {reports.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200">
              No reports filed.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between gap-4 text-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rep.status === 'pending'
                            ? 'bg-amber-100 text-amber-900'
                            : rep.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {rep.status.toUpperCase()}
                      </span>
                      <span className="font-bold text-stone-900">{rep.businessName}</span>
                      <span className="text-stone-400 text-[10px]">
                        Issue: {rep.issueType.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-stone-700 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      "{rep.description}"
                    </p>

                    <div className="text-stone-400 text-[10px]">
                      Reported by {rep.reporterName || rep.reporterEmail} on{' '}
                      {new Date(rep.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleReportAction(rep.id, 'resolved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleReportAction(rep.id, 'dismissed')}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-serif text-stone-900">
              Administrative & Security Audit Logs
            </h2>
            <span className="text-xs text-stone-400">Chronological activity record</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200">
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs divide-y divide-stone-100 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-stone-50 transition-colors space-y-1">
                  <div className="flex items-center justify-between text-stone-400 text-[10px]">
                    <span className="font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-mono font-semibold">
                      {log.action}
                    </span>
                  </div>
                  <div className="text-stone-800 font-medium">{log.details}</div>
                  <div className="text-stone-400 text-[10px]">User: {log.userEmail}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: REVIEW SUBMISSION */}
      {reviewingSub && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-stone-900">
                Review: {reviewingSub.businessName}
              </h3>
              <button
                onClick={() => setReviewingSub(null)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="font-semibold text-stone-800">Proposed Business Details:</div>
              <div className="text-stone-600 space-y-1 text-xs">
                <div>
                  <span className="font-semibold">Name:</span> {reviewingSub.proposedData.name}
                </div>
                <div>
                  <span className="font-semibold">Description:</span>{' '}
                  {reviewingSub.proposedData.description}
                </div>
                <div>
                  <span className="font-semibold">Contact:</span>{' '}
                  {reviewingSub.proposedData.contactPhone}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Moderator Feedback / Notes to Owner:
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Explain why approved or reason for returning / rejecting..."
                rows={3}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D] text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setReviewingSub(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewAction('return')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs"
              >
                Return for Edits
              </button>
              <button
                onClick={() => handleReviewAction('reject')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Reject
              </button>
              <button
                onClick={() => handleReviewAction('approve')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs"
              >
                Approve Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER ROLE & PERMISSIONS */}
      {editingUserRole && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  Configure Role: {editingUserRole.name}
                </h3>
                <span className="text-stone-400 text-[11px]">{editingUserRole.email}</span>
              </div>
              <button
                onClick={() => setEditingUserRole(null)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="block font-semibold text-stone-800">Assigned Role:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['visitor', 'owner', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r);
                      if (r === 'admin' && selectedPermissions.length === 0) {
                        setSelectedPermissions([
                          'manage_users',
                          'manage_businesses',
                          'review_submissions',
                          'manage_reports',
                          'view_audit_logs',
                        ]);
                      }
                    }}
                    className={`py-2 px-3 rounded-xl border text-center font-bold capitalize transition-all cursor-pointer ${
                      selectedRole === r
                        ? 'border-[#164E3D] bg-[#E8F3EE] text-[#164E3D]'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {selectedRole === 'admin' && (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="block font-semibold text-stone-800">
                  Granular Admin Permissions:
                </label>
                <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  {allPermissionsList.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className="flex items-start gap-2 cursor-pointer hover:bg-stone-100/50 p-1 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, perm.id]);
                            } else {
                              setSelectedPermissions(
                                selectedPermissions.filter((p) => p !== perm.id)
                              );
                            }
                          }}
                          className="mt-0.5 rounded text-[#164E3D] focus:ring-0"
                        />
                        <div>
                          <div className="font-semibold text-stone-800 text-[11px]">
                            {perm.label}
                          </div>
                          <div className="text-[10px] text-stone-500">{perm.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setEditingUserRole(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserRole}
                className="px-4 py-2 bg-[#164E3D] hover:bg-[#123E30] text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Save Role & Privileges
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SUSPEND / REACTIVATE USER */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-stone-900">
                {suspendingUser.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
              </h3>
            </div>

            <p className="text-stone-600 leading-relaxed">
              {suspendingUser.status === 'suspended' ? (
                <>
                  Are you sure you want to reactivate access for{' '}
                  <span className="font-bold">{suspendingUser.name}</span> ({suspendingUser.email})?
                </>
              ) : (
                <>
                  Suspending <span className="font-bold">{suspendingUser.name}</span> (
                  {suspendingUser.email}) will immediately revoke their session tokens and prevent
                  them from signing in or editing listings.
                </>
              )}
            </p>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Reason (recorded in audit trail):
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Reason for moderation action..."
                rows={2}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D] text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setSuspendingUser(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleConfirmStatusChange(
                    suspendingUser.status === 'suspended' ? 'active' : 'suspended'
                  )
                }
                className={`px-4 py-2 font-bold rounded-xl text-xs text-white cursor-pointer ${
                  suspendingUser.status === 'suspended'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {suspendingUser.status === 'suspended' ? 'Reactivation' : 'Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE NEW USER */}
      {isCreatingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-stone-900">Provision New User Account</h3>
              <button
                onClick={() => setIsCreatingUser(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {newUserError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{newUserError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Maria Clara"
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="maria@bohol.local"
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+63 9XX XXX XXXX (optional)"
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#164E3D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Initial Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
                >
                  <option value="visitor">Visitor</option>
                  <option value="owner">Business Owner</option>
                  <option value="admin">Administrator (Full Privileges)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreatingUser(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#164E3D] hover:bg-[#123E30] text-white font-bold rounded-xl text-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
