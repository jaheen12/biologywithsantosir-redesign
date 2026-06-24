import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AnnouncementsClient from '@/components/admin/AnnouncementsClient';

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route Guard: Admin only
  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // 1. Fetch active batches
  const { data: batchesRaw } = await supabase
    .from('batches')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  const batches = batchesRaw || [];

  // 2. Fetch announcements newest first, joining batches name
  const { data: announcementsRaw } = await supabase
    .from('announcements')
    .select('*, batches(name)')
    .order('created_at', { ascending: false });

  const announcements = announcementsRaw || [];

  return (
    <div className="space-y-8 font-ui">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">নোটিশ বোর্ড ব্যবস্থাপনা</h1>
        <p className="text-text-secondary text-sm mt-1">
          সকল শিক্ষার্থীদের জন্য বা নির্দিষ্ট ব্যাচের জন্য নোটিশ প্রকাশ ও মুছে ফেলার প্যানেল।
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-12 bg-surface border border-border rounded-2xl shadow-sm">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <AnnouncementsClient 
          batches={batches}
          initialAnnouncements={announcements}
        />
      </Suspense>
    </div>
  );
}
