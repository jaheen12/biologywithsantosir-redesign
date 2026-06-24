import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ExamsClient from '@/components/admin/ExamsClient';

export const dynamic = 'force-dynamic';

interface BatchData {
  id: string;
  name: string;
  enrolled_count: number;
  is_active: boolean;
}

export default async function AdminExamsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route Guard: Admin only
  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all batches with enrollment counts (to map batch names and counts in memory)
  const { data: allBatchesRaw } = await supabase
    .from('batches_with_counts')
    .select('id, name, enrolled_count, is_active')
    .order('name');

  const allBatches = (allBatchesRaw as unknown as BatchData[]) || [];
  const activeBatches = allBatches.filter(b => b.is_active);

  // Fetch all exams
  const { data: examsRaw } = await supabase
    .from('exams')
    .select('*, results(count)')
    .order('exam_date', { ascending: false });

  // Map batch name, enrolled count, and results count in memory
  const exams = (examsRaw || []).map((exam: any) => {
    const batch = allBatches.find((b) => b.id === exam.batch_id);
    return {
      ...exam,
      batch_name: batch?.name || 'অজানা ব্যাচ',
      enrolled_count: batch?.enrolled_count ?? 0,
      results_count: exam.results?.[0]?.count ?? 0,
    };
  });

  return (
    <div className="space-y-8 font-ui">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">পরীক্ষা ব্যবস্থাপনা</h1>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-12 bg-surface border border-border rounded-2xl shadow-sm">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <ExamsClient 
          batches={activeBatches} 
          initialExams={exams} 
        />
      </Suspense>
    </div>
  );
}
