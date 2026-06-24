'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Shield, 
  UserCheck, 
  UserMinus, 
  HelpCircle, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Search,
  History,
  X
} from 'lucide-react';
import { toBengaliNumerals, formatBanglaDate } from '@/lib/bangla';

interface User {
  id: string;
  email: string;
  last_sign_in_at: string | null;
  full_name: string;
  phone: string;
  role: string;
}

interface AuditLogEntry {
  id: string;
  changed_at: string;
  old_role: string;
  new_role: string;
  changer_name: string;
  target_name: string;
}

interface RoleTableProps {
  initialUsers: User[];
  currentAdminId: string;
  initialAuditLog: AuditLogEntry[];
}

export default function RoleTable({
  initialUsers,
  currentAdminId,
  initialAuditLog,
}: RoleTableProps) {
  const router = useRouter();
  const supabase = createClient();

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(initialAuditLog);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'student' | 'admin'>('all');
  
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ user: User; targetRole: 'admin' | 'student' } | null>(null);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  useEffect(() => {
    setAuditLog(initialAuditLog);
  }, [initialAuditLog]);

  // Tab & search filtering
  const filteredUsers = users.filter((u) => {
    // 1. Role tab filter
    if (activeTab === 'student' && u.role !== 'student') return false;
    if (activeTab === 'admin' && u.role !== 'admin') return false;

    // 2. Search match
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      const nameMatch = u.full_name.toLowerCase().includes(search);
      const emailMatch = u.email.toLowerCase().includes(search);
      const phoneMatch = u.phone.includes(search);
      return nameMatch || emailMatch || phoneMatch;
    }
    return true;
  });

  const handleRoleChange = async () => {
    if (!confirmTarget) return;

    const targetUserId = confirmTarget.user.id;
    const newRole = confirmTarget.targetRole;

    setLoadingUserId(targetUserId);
    setConfirmTarget(null);
    setToast(null);

    try {
      // 1. Get current session's JWT token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('সেশন পাওয়া যায়নি। দয়া করে আবার লগইন করুন।');

      // 2. Call the set-user-role Edge Function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/set-user-role`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ target_user_id: targetUserId, new_role: newRole }),
        }
      );

      let result: any = {};
      try {
        result = await response.json();
      } catch (jsonErr) {
        throw new Error(`সার্ভার ত্রুটি (স্ট্যাটাস কোড: ${response.status})`);
      }

      if (result.error || response.status !== 200) {
        throw new Error(result.error || 'রোল পরিবর্তন করতে ব্যর্থ হয়েছে।');
      }

      setToast({ message: 'রোল সফলভাবে পরিবর্তন হয়েছে ✓', type: 'success' });
      
      // Update local state to show immediately
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
      
      // Trigger page refresh to reload backend audit logs
      router.refresh();
      
      // Auto-clear toast alert
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error('Edge function error:', err);
      setToast({ 
        message: err.message.includes('own role')
          ? 'নিজের অ্যাকাউন্টের রোল পরিবর্তন করা যাবে না'
          : `রোল পরিবর্তন ব্যর্থ: ${err.message || 'নেটওয়ার্ক সমস্যা'}`, 
        type: 'error' 
      });
    } finally {
      setLoadingUserId(null);
    }
  };

  const getRoleLabelBn = (role: string) => {
    return role === 'admin' ? 'এডমিন (Admin)' : 'শিক্ষার্থী (Student)';
  };

  return (
    <div className="space-y-8">
      {/* Search and Tab Filter Header */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex gap-1.5 bg-surface-alt/60 p-1.5 rounded-xl border border-border/80 w-fit">
          {(['all', 'student', 'admin'] as const).map((tab) => {
            const labels = { all: 'সকল', student: 'শিক্ষার্থী', admin: 'এডমিন' };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  isActive
                    ? 'bg-surface text-primary shadow-xs font-bold'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary bg-surface-alt/25"
          />
        </div>
      </div>

      {/* Toast Alert logs */}
      {toast && (
        <div className={`bg-surface border rounded-xl p-3.5 flex items-center gap-2.5 text-sm animate-in fade-in duration-200 ${
          toast.type === 'success' 
            ? 'bg-primary-light/50 border-primary/20 text-primary' 
            : 'bg-error/10 border-error/20 text-error'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* User Roles Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-text-secondary flex flex-col items-center gap-2">
            <AlertCircle className="w-10 h-10 text-text-muted/65" />
            <p className="font-bold text-text-primary text-base font-ui">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs font-bold text-text-secondary bg-surface-alt/40 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">নাম ও ইমেইল</th>
                  <th className="px-6 py-4 font-semibold">ফোন নম্বর</th>
                  <th className="px-6 py-4 font-semibold text-center">বর্তমান রোল</th>
                  <th className="px-6 py-4 text-center">সর্বশেষ লগইন</th>
                  <th className="px-6 py-4 text-center w-[180px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {filteredUsers.map((user) => {
                  const isAdmin = user.role === 'admin';
                  const isSelf = user.id === currentAdminId;
                  const isLoading = loadingUserId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-surface-alt/25 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-text-primary text-sm block">
                          {user.full_name} {isSelf && <span className="text-[10px] text-primary bg-primary-light border border-primary/20 rounded-full px-2 py-0.5 ml-1 select-none font-bold">নিজ</span>}
                        </span>
                        <span className="text-xs text-text-muted block mt-0.5">
                          {user.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-semibold">
                        {toBengaliNumerals(user.phone)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          isAdmin 
                            ? 'bg-primary-light text-primary border-primary/20 font-bold' 
                            : 'bg-surface-alt text-text-secondary border-border'
                        }`}>
                          {getRoleLabelBn(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-text-secondary">
                        {user.last_sign_in_at 
                          ? formatBanglaDate(new Date(user.last_sign_in_at).toLocaleDateString('en-CA'))
                          : 'লগইন হয়নি'
                        }
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isSelf ? (
                          <button
                            disabled
                            className="w-full text-xs font-bold py-2 rounded-xl bg-border text-text-muted border border-border/80 opacity-60 cursor-not-allowed select-none"
                            title="নিজের অ্যাকাউন্ট পরিবর্তন করা যাবে না"
                          >
                            পরিকল্পনা অবরুদ্ধ
                          </button>
                        ) : isAdmin ? (
                          <button
                            onClick={() => setConfirmTarget({ user, targetRole: 'student' })}
                            disabled={loadingUserId !== null}
                            className="w-full inline-flex items-center justify-center gap-1 text-xs font-bold py-2 px-3 rounded-xl border border-error/20 bg-error/5 hover:bg-error hover:text-white text-error transition cursor-pointer disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserMinus className="w-3.5 h-3.5" />
                            )}
                            <span>Student করুন</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmTarget({ user, targetRole: 'admin' })}
                            disabled={loadingUserId !== null}
                            className="w-full inline-flex items-center justify-center gap-1 text-xs font-bold py-2 px-3 rounded-xl border border-primary/20 bg-primary-light text-primary hover:bg-primary hover:text-white transition cursor-pointer disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                            <span>Admin করুন</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Role Audit Logs Table --- */}
      <div className="space-y-4">
        <h3 className="font-bold text-text-primary text-base flex items-center gap-2 border-b border-border/60 pb-2">
          <History className="w-5 h-5 text-primary" />
          <span>রোল পরিবর্তন হিস্টোরি (সাম্প্রতিক ২০টি)</span>
        </h3>
        
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          {auditLog.length === 0 ? (
            <div className="p-8 text-center text-text-muted italic flex items-center justify-center gap-2">
              <span>ইতিপূর্বে কোনো রোল পরিবর্তন করা হয়নি।</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-bold text-text-secondary bg-surface-alt/40 uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">তারিখ</th>
                    <th className="px-6 py-4 font-semibold">পরিবর্তনকারী</th>
                    <th className="px-6 py-4 font-semibold">যার রোল পরিবর্তন হয়েছে</th>
                    <th className="px-6 py-4 font-semibold text-center">আগের রোল</th>
                    <th className="px-6 py-4 font-semibold text-center">নতুন রোল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {auditLog.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-alt/25 transition-colors">
                      <td className="px-6 py-4 text-xs text-text-secondary">
                        {formatBanglaDate(new Date(log.changed_at).toLocaleDateString('en-CA'))}
                      </td>
                      <td className="px-6 py-4 font-bold text-text-primary">
                        {log.changer_name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-text-secondary">
                        {log.target_name}
                      </td>
                      <td className="px-6 py-4 text-center text-xs">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-surface-alt border border-border text-text-secondary font-medium">
                          {log.old_role === 'admin' ? 'Admin' : 'Student'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-semibold">
                        <span className={`inline-flex px-2 py-0.5 rounded-full border ${
                          log.new_role === 'admin' 
                            ? 'bg-primary-light text-primary border-primary/20 font-bold' 
                            : 'bg-surface-alt text-text-secondary border-border'
                        }`}>
                          {log.new_role === 'admin' ? 'Admin' : 'Student'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-bold text-text-primary text-lg text-center">রোল পরিবর্তন নিশ্চিত করুন</h3>
            <p className="text-sm text-text-secondary text-center leading-relaxed">
              আপনি কি নিশ্চিতভাবে <strong className="text-text-primary font-bold">{confirmTarget.user.full_name}</strong>-কে <strong className="text-primary font-bold">{getRoleLabelBn(confirmTarget.targetRole)}</strong> করতে চান?
            </p>
            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                onClick={() => setConfirmTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-alt transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleRoleChange}
                className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition cursor-pointer"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
