import React, { Suspense } from 'react';
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
        <Suspense fallback={
          <div className="bg-bg-card p-6 rounded-2xl border border-border-color shadow-sm animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          </div>
        }>
          <NewPaymentForm 
            students={students} 
            batches={batches} 
            recordedBy={user.id} 
          />
        </Suspense>
      </div>
    </div>
  );
}
