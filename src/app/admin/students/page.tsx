import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StudentsClient from '@/components/admin/StudentsClient';

export default async function AdminStudentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all profiles with role 'student', join enrollments (with batch details) and payment_due view
  const { data: studentsRaw } = await supabase
    .from('profiles')
    .select(`
      id, 
      full_name, 
      phone, 
      role, 
      created_at,
      enrollments(status, batch_id, batches(name)),
      payment_due(status, outstanding, paid_this_month, monthly_fee)
    `)
    .eq('role', 'student')
    .order('full_name');

  const students = studentsRaw || [];

  return (
    <div className="space-y-8 font-ui">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">শিক্ষার্থী তালিকা</h1>
        <p className="text-text-secondary text-sm mt-1">
          বায়োলজি উইথ সায়ন্ত স্যার প্ল্যাটফর্মের সব শিক্ষার্থীর তালিকা ও তাদের পেমেন্ট অবস্থা।
        </p>
      </div>

      <StudentsClient students={students} />
    </div>
  );
}
