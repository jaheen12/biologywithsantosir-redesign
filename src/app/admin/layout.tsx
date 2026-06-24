import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth: Verify user is logged in and has the admin role
  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch admin's own profile name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const fullName = profile?.full_name || 'এডমিন';

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-surface-alt">
      {/* Admin Sidebar */}
      <AdminSidebar fullName={fullName} />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto min-h-0">
        {children}
      </main>
    </div>
  );
}
