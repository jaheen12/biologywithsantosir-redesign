import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RoutineClient from '@/components/admin/RoutineClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ batch?: string }>;
}

export default async function AdminRoutinePage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route Guard: Admin only
  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all active batches
  const { data: batchesRaw } = await supabase
    .from('batches')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  const batches = batchesRaw || [];

  // Await search params for batch filter
  const resolvedSearchParams = await searchParams;
  const selectedBatchId = resolvedSearchParams.batch ?? batches[0]?.id;

  // Fetch routines for selected batch
  let routines: any[] = [];
  if (selectedBatchId) {
    const { data: routinesRaw } = await supabase
      .from('routines')
      .select('*')
      .eq('batch_id', selectedBatchId);
    
    routines = routinesRaw || [];
  }

  return (
    <div className="space-y-8 font-ui">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">সাপ্তাহিক রুটিন ব্যবস্থাপনা</h1>
        <p className="text-text-secondary text-sm mt-1">
          বায়োলজি উইথ সায়ন্ত স্যার প্ল্যাটফর্মের ব্যাচভিত্তিক ক্লাস রুটিন তৈরি ও সম্পাদনা করুন।
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-12 bg-surface border border-border rounded-2xl shadow-sm">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <RoutineClient 
          batches={batches}
          selectedBatchId={selectedBatchId}
          initialRoutines={routines}
        />
      </Suspense>
    </div>
  );
}
