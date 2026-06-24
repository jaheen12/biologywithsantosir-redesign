import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NewEnrollmentForm from '@/components/admin/NewEnrollmentForm';
import EnrollmentRow from '@/components/admin/EnrollmentRow';

interface StudentData {
  id: string;
  full_name: string;
  phone: string | null;
}

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

  // 1. Fetch all enrollments
  const { data: enrollmentsRaw } = await supabase
    .from('enrollments')
    .select('*, profiles(full_name, phone), batches(name)')
    .order('enrolled_at', { ascending: false });

  const enrollments = (enrollmentsRaw as unknown as EnrollmentDetail[]) || [];

  // 2. Fetch active batches for form dropdown
  const { data: batchesRaw } = await supabase
    .from('batches_with_counts')
    .select('id, name, capacity, enrolled_count, seats_remaining')
    .eq('is_active', true);

  const batches = (batchesRaw as unknown as BatchData[]) || [];

  // 3. Fetch all student profiles to select from
  const { data: studentsRaw } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .eq('role', 'student')
    .order('full_name');

  const students = (studentsRaw as unknown as StudentData[]) || [];

  return (
    <div className="space-y-8 font-ui">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">ভর্তি ব্যবস্থাপনা</h1>
        <p className="text-text-secondary text-sm mt-1">
          নতুন শিক্ষার্থী ভর্তি এবং তাদের ভর্তির বর্তমান অবস্থা পরিচালনা করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Enrollment list table (takes 2 cols) */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-surface">
            <h2 className="text-base font-bold text-text-primary">ভর্তি হওয়া শিক্ষার্থীদের তালিকা</h2>
          </div>

          {enrollments.length === 0 ? (
            <p className="p-8 text-center text-xs text-text-muted font-medium">কোনো ভর্তির রেকর্ড পাওয়া যায়নি।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-alt border-b border-border text-xs font-bold text-text-secondary uppercase">
                    <th className="px-6 py-3.5">শিক্ষার্থী</th>
                    <th className="px-6 py-3.5">মোবাইল</th>
                    <th className="px-6 py-3.5">ব্যাচ</th>
                    <th className="px-6 py-3.5">ভর্তির তারিখ</th>
                    <th className="px-6 py-3.5">অবস্থা</th>
                    <th className="px-6 py-3.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {enrollments.map((enrollment) => (
                    <EnrollmentRow key={enrollment.id} enrollment={enrollment} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: New Enrollment Form (takes 1 col) */}
        <div className="space-y-6">
          <NewEnrollmentForm students={students} batches={batches} />
        </div>
      </div>
    </div>
  );
}
