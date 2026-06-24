import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NewPaymentForm from '@/components/admin/NewPaymentForm';

interface StudentData {
  id: string;
  full_name: string;
  phone: string | null;
}

interface BatchData {
  id: string;
  name: string;
}

export default async function AdminNewPaymentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all students
  const { data: studentsRaw } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .eq('role', 'student')
    .order('full_name');

  const students = (studentsRaw as unknown as StudentData[]) || [];

  // Fetch all active batches
  const { data: batchesRaw } = await supabase
    .from('batches')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  const batches = (batchesRaw as unknown as BatchData[]) || [];

  return (
    <div className="space-y-8 font-ui">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">পেমেন্ট গ্রহণ করুন</h1>
        <p className="text-text-secondary text-sm mt-1">
          শিক্ষার্থীর মাসিক বেতন নগদ বা মোবাইল ব্যাংকিংয়ের (bKash/Nagad) মাধ্যমে রেকর্ড করুন।
        </p>
      </div>

      <div className="max-w-2xl">
        <NewPaymentForm 
          students={students} 
          batches={batches} 
          recordedBy={user.id} 
        />
      </div>
    </div>
  );
}
