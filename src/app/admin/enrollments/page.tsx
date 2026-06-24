import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EnrollmentsClient from '@/components/admin/EnrollmentsClient';

interface BatchData {
  id: string;
  name: string;
  capacity: number;
  enrolled_count: number;
  seats_remaining: number;
}

interface EnrollmentDetail {
  id: string;
  student_id: string;
  batch_id: string;
  status: 'active' | 'dropped' | 'completed';
  enrolled_at: string;
  profiles: {
    full_name: string;
    phone: string | null;
  } | null;
  batches: {
    name: string;
  } | null;
}

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all enrollments
  const { data: enrollmentsRaw } = await supabase
    .from('enrollments')
    .select('*, profiles(full_name, phone), batches(name)')
    .order('enrolled_at', { ascending: false });

  const enrollments = (enrollmentsRaw as unknown as EnrollmentDetail[]) || [];

  // Fetch active batches for inline dropdown
  const { data: batchesRaw } = await supabase
    .from('batches_with_counts')
    .select('id, name, capacity, enrolled_count, seats_remaining')
    .eq('is_active', true);

  const batches = (batchesRaw as unknown as BatchData[]) || [];

  return (
    <div className="space-y-8 font-ui max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">ভর্তি ব্যবস্থাপনা</h1>
      </div>

      <EnrollmentsClient initialEnrollments={enrollments} batches={batches} />
    </div>
  );
}
