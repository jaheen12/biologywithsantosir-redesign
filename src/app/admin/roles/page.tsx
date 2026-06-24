import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import RoleTable from '@/components/admin/RoleTable';

export const dynamic = 'force-dynamic';

export default async function AdminRolesPage() {
  const supabase = await createClient();

  const {
    data: { user: currentAdmin },
  } = await supabase.auth.getUser();

  // Route Guard: Admin only
  if (!currentAdmin || currentAdmin.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Admin client for auth.users access (server-side only)
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all registered auth users
  const { data: { users: authUsersRaw } } = await supabaseAdmin.auth.admin.listUsers();
  const authUsers = authUsersRaw || [];

  // Fetch profiles to merge info and roles
  const { data: profilesRaw } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role');
  
  const profiles = profilesRaw || [];

  // Merge Auth Users and Profiles
  const mergedUsers = authUsers.map((u) => {
    const profile = profiles.find((p) => p.id === u.id);
    return {
      id: u.id,
      email: u.email || '—',
      last_sign_in_at: u.last_sign_in_at || null,
      full_name: profile?.full_name || 'অজানা ব্যবহারকারী',
      phone: profile?.phone || '—',
      role: profile?.role || 'student', // default role
    };
  });

  // Fetch recent role audit logs
  const { data: auditLogRaw } = await supabase
    .from('role_audit_log')
    .select(`
      id,
      changed_by,
      target_user,
      old_role,
      new_role,
      changed_at,
      changer:profiles!changed_by(full_name),
      target:profiles!target_user(full_name)
    `)
    .order('changed_at', { ascending: false })
    .limit(20);

  const auditLog = (auditLogRaw || []).map((log: any) => ({
    id: log.id,
    changed_at: log.changed_at,
    old_role: log.old_role,
    new_role: log.new_role,
    changer_name: log.changer?.full_name || 'অজানা এডমিন',
    target_name: log.target?.full_name || 'অজানা ব্যবহারকারী',
  }));

  return (
    <div className="space-y-8 font-ui">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">ব্যবহারকারী ও রোল ব্যবস্থাপনা</h1>
        <p className="text-text-secondary text-sm mt-1">
          অফিসিয়াল শিক্ষকদের এডমিন প্রিভিলেজ দিন এবং শিক্ষার্থীদের রোল ও দায়িত্ব নিয়ন্ত্রণ করুন।
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-12 bg-surface border border-border rounded-2xl shadow-sm">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <RoleTable 
          initialUsers={mergedUsers}
          currentAdminId={currentAdmin.id}
          initialAuditLog={auditLog}
        />
      </Suspense>
    </div>
  );
}
