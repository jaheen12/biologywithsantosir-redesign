import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch payment due status
  const { data: paymentDue } = await supabase
    .from('payment_due')
    .select('status')
    .eq('student_id', user.id)
    .single();

  const paymentStatus = paymentDue ? paymentDue.status : null;

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-surface-alt">
      {/* Responsive Left Sidebar */}
      <Sidebar profile={profile} paymentStatus={paymentStatus} />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto min-h-0">
        {children}
      </main>
    </div>
  );
}
