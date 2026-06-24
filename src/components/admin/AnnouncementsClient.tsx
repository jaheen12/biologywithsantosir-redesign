'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Megaphone, 
  Trash2, 
  Users, 
  User, 
  Calendar, 
  HelpCircle,
  Loader2,
  X
} from 'lucide-react';
import AnnouncementForm from './AnnouncementForm';
import { formatBanglaDate } from '@/lib/bangla';

interface Batch {
  id: string;
  name: string;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  batch_id: string | null;
  created_at: string;
  batches: {
    name: string;
  } | null;
}

interface AnnouncementsClientProps {
  batches: Batch[];
  initialAnnouncements: Announcement[];
}

export default function AnnouncementsClient({
  batches,
  initialAnnouncements,
}: AnnouncementsClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setAnnouncements(initialAnnouncements);
  }, [initialAnnouncements]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setAnnouncements((prev) => prev.filter((item) => item.id !== deleteId));
      router.refresh();
    } catch (err) {
      console.error('Error deleting notice:', err);
      alert('নোটিশ মুছে ফেলার সময় সমস্যা হয়েছে।');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Creation form at the top */}
      <AnnouncementForm 
        batches={batches} 
        onSuccess={() => router.refresh()} 
      />

      {/* List section */}
      <div className="space-y-5">
        <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <span>ইতিপূর্বে প্রকাশিত নোটিশ সমূহ</span>
        </h3>

        {announcements.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center text-text-muted italic flex items-center justify-center gap-2 shadow-xs">
            <HelpCircle className="w-4 h-4 text-text-muted/60" />
            <span>কোনো প্রকাশিত নোটিশ নেই।</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {announcements.map((item) => {
              const isGlobal = !item.batch_id;
              const targetLabel = isGlobal ? 'সকল শিক্ষার্থী' : item.batches?.name || 'নির্দিষ্ট ব্যাচ';
              
              const badgeStyle = isGlobal 
                ? 'bg-primary-light text-primary border-primary/20' 
                : 'bg-blue-50 text-blue-600 border-blue-100';

              return (
                <div 
                  key={item.id} 
                  className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Header: Title and Date */}
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-bold text-text-primary text-base leading-snug">{item.title}</h4>
                      <span className="text-[10px] text-text-muted shrink-0 font-semibold bg-surface-alt border border-border px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatBanglaDate(item.created_at)}
                      </span>
                    </div>

                    {/* Target Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border z-10 w-fit select-none shadow-xs max-w-full truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${isGlobal ? 'bg-primary' : 'bg-blue-500'}`}></span>
                      <span className={`text-[10px] uppercase font-bold text-text-secondary truncate`}>{targetLabel}</span>
                    </div>

                    {/* Body Text */}
                    <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line pt-1">
                      {item.body}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div className="border-t border-border/60 pt-3 flex items-center justify-end">
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-text-muted hover:text-error transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>মুছে ফেলুন</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-bold text-text-primary text-lg text-center">নোটিশ মুছে ফেলুন</h3>
            <p className="text-sm text-text-secondary text-center leading-relaxed">
              আপনি কি নিশ্চিতভাবে এই নোটিশটি মুছে ফেলতে চান? এটি শিক্ষার্থীদের নোটিশ বোর্ড থেকেও মুছে যাবে।
            </p>
            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                disabled={deleting}
                onClick={() => setDeleteId(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-alt transition cursor-pointer disabled:opacity-50"
              >
                বাতিল
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl bg-error text-white text-sm font-semibold hover:bg-error/90 transition cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'মুছা হচ্ছে...' : 'হ্যাঁ, মুছুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
