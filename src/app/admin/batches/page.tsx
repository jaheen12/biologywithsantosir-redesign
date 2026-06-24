import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BatchesClient from '@/components/admin/BatchesClient';

interface BatchData {
  id: string;
  name: string;
  fee: number;
  capacity: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  enrolled_count: number;
  seats_remaining: number;
}

export default async function AdminBatchesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch batches with their enrollment counts
  const { data: batchesRaw } = await supabase
    .from('batches_with_counts')
    .select('*')
    .order('created_at', { ascending: false });

  const batches = (batchesRaw as unknown as BatchData[]) || [];

  return (
    <div className="space-y-8 font-ui">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">ব্যাচ ব্যবস্থাপনা</h1>
        <p className="text-text-secondary text-sm mt-1">
          কোচিং সেন্টারের সব ব্যাচ ও কোর্সের আসন সংখ্যা ও ভর্তি ফি পরিচালনা করুন।
        </p>
      </div>

      <BatchesClient initialBatches={batches} />
    </div>
  );
}
