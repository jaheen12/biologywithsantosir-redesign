import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminLeaderboardClient from '@/components/admin/AdminLeaderboardClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ batch?: string }>;
}

export default async function AdminLeaderboardPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route Guard: Admin only
  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // 1. Fetch active batches for the batch filter dropdown
  const { data: batchesRaw } = await supabase
    .from('batches')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  const batches = batchesRaw || [];
  
  // Await search params for batch filter
  const resolvedSearchParams = await searchParams;
  const selectedBatchId = resolvedSearchParams.batch ?? batches[0]?.id;

  // 2. Fetch leaderboard entries if a batch is selected
  let leaderboard: any[] = [];
  let exams: any[] = [];
  let results: any[] = [];

  if (selectedBatchId) {
    // Query batch leaderboard RPC
    const { data: leaderboardRaw } = await supabase
      .rpc('get_batch_leaderboard', { p_batch_id: selectedBatchId });
    
    leaderboard = leaderboardRaw || [];

    // Query historical exams for this batch to construct pivot column headers
    const { data: examsRaw } = await supabase
      .from('exams')
      .select('id, title, total_marks, exam_date')
      .eq('batch_id', selectedBatchId)
      .order('exam_date', { ascending: true }); // chronological order
    
    exams = examsRaw || [];

    // Query all student exam results present in the leaderboard
    const studentIds = leaderboard.map((r: any) => r.student_id);
    if (studentIds.length > 0) {
      const { data: resultsRaw } = await supabase
        .from('results')
        .select('student_id, exam_id, marks_obtained, grade')
        .in('student_id', studentIds);
      
      results = resultsRaw || [];
    }
  }

  return (
    <div className="space-y-8 font-ui">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">ব্যাচ র‍্যাংকিং বোর্ড</h1>
      </div>

      {batches.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-secondary shadow-sm">
          <p className="font-bold text-text-primary text-base">কোনো সক্রিয় ব্যাচ পাওয়া যায়নি</p>
          <p className="text-xs">র‍্যাংকিং দেখার আগে প্রথমে ব্যাচ ট্যাবে গিয়ে সক্রিয় ব্যাচ তৈরি করুন।</p>
        </div>
      ) : (
        <Suspense fallback={
          <div className="flex items-center justify-center p-12 bg-surface border border-border rounded-2xl shadow-sm">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <AdminLeaderboardClient 
            batches={batches}
            selectedBatchId={selectedBatchId}
            leaderboard={leaderboard}
            exams={exams}
            results={results}
          />
        </Suspense>
      )}
    </div>
  );
}
