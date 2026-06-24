'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, AlertCircle, Send } from 'lucide-react';

interface Batch {
  id: string;
  name: string;
}

interface AnnouncementFormProps {
  batches: Batch[];
  onSuccess: () => void;
}

export default function AnnouncementForm({ batches, onSuccess }: AnnouncementFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<'all' | 'batch'>('all');
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validations
    if (!title.trim()) {
      setErrorMsg('শিরোনাম প্রদান করা আবশ্যক।');
      return;
    }
    if (!body.trim()) {
      setErrorMsg('বার্তার বিবরণ প্রদান করা আবশ্যক।');
      return;
    }
    if (target === 'batch' && !selectedBatchId) {
      setErrorMsg('দয়া করে নির্দিষ্ট ব্যাচ সিলেক্ট করুন।');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: title.trim(),
          body: body.trim(),
          batch_id: target === 'batch' ? selectedBatchId : null,
        });

      if (error) throw error;

      setSuccessMsg('নোটিশটি সফলভাবে প্রকাশিত হয়েছে ✓');
      setTitle('');
      setBody('');
      setTarget('all');
      
      router.refresh();
      onSuccess();
      
      // Clear success alert after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Error creating announcement:', err);
      setErrorMsg(err.message || 'নোটিশ প্রকাশ করার সময় সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-text-primary text-base border-b border-border/60 pb-2">নতুন নোটিশ তৈরি করুন</h3>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="bg-primary-light/50 border border-primary/20 text-primary rounded-xl p-3.5 flex items-center gap-2 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-error/10 border border-error/20 text-error rounded-xl p-3.5 flex items-start gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-1.5">
          শিরোনাম (Title) <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="যেমন: ক্লাস রুটিন পরিবর্তন নোটিশ"
          className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-mid focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary bg-surface"
          required
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-1.5">
          বার্তার বিবরণ (Body) <span className="text-error">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="সব শিক্ষার্থীদের জন্য বার্তাটি এখানে বিস্তারিত লিখুন..."
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-mid focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary bg-surface resize-y"
          required
        />
      </div>

      {/* Target Audience Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target selection */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            কাদের উদ্দেশ্যে প্রকাশ করবেন? <span className="text-error">*</span>
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-text-secondary font-semibold">
              <input
                type="radio"
                name="target"
                value="all"
                checked={target === 'all'}
                onChange={() => setTarget('all')}
                className="text-primary focus:ring-primary w-4 h-4"
              />
              <span>সকল শিক্ষার্থী</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-text-secondary font-semibold">
              <input
                type="radio"
                name="target"
                value="batch"
                checked={target === 'batch'}
                onChange={() => setTarget('batch')}
                className="text-primary focus:ring-primary w-4 h-4"
              />
              <span>নির্দিষ্ট ব্যাচ</span>
            </label>
          </div>
        </div>

        {/* Conditional Batch Selector */}
        {target === 'batch' && (
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              ব্যাচ সিলেক্ট করুন <span className="text-error">*</span>
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-mid focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary bg-surface font-semibold"
              required
            >
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Submit button */}
      <div className="flex items-center justify-end border-t border-border/60 pt-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>নোটিশ প্রকাশ করুন</span>
        </button>
      </div>
    </form>
  );
}

// Inline helper CheckCircle since it was referenced in alerts
import { CheckCircle } from 'lucide-react';
