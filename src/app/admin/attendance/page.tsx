import React from 'react';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const AttendanceClient = dynamic(() => import('@/components/admin/AttendanceClient'), {
  loading: () => <div className="animate-pulse h-96 bg-surface-secondary rounded-xl" />,
});

export default async function AdminAttendancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route Guard: Admin only
  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all active batches sorted by name
  const { data: batchesRaw } = await supabase
    .from('batches')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  const batches = batchesRaw || [];

  return (
    <div className="space-y-8 font-ui">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">পরীক্ষার উপস্থিতি</h1>
        <p className="text-sm text-text-secondary mt-1">ফলাফল এন্ট্রির ভিত্তিতে পরীক্ষায় শিক্ষার্থীদের উপস্থিতি ট্র্যাক করুন।</p>
      </div>

      <AttendanceClient batches={batches} adminId={user.id} />
    </div>
  );
}
