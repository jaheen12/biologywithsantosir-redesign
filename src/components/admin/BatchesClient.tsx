'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Edit2, Loader2, FileText, CheckCircle, XCircle } from 'lucide-react';
import BatchForm from './BatchForm';

interface Batch {
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

// Converts numbers to Bengali numerals
function toBengaliNumerals(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '';
  const numStr = num.toString();
  const banglaDigits: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return numStr.replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
}

// Formats short date e.g. "2026-01-01" -> "১ জানু"
function formatShortDate(dateStr: string | null) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'short'
  });
}

export default function BatchesClient({ initialBatches }: { initialBatches: Batch[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);

  const handleActiveToggle = async (batchId: string, currentStatus: boolean) => {
    setToggleLoadingId(batchId);
    try {
      const { error } = await supabase
        .from('batches')
        .update({ is_active: !currentStatus })
        .eq('id', batchId);

      if (error) throw error;
      
      // If we are currently editing this batch, update its state too
      if (editingBatch && editingBatch.id === batchId) {
        setEditingBatch({ ...editingBatch, is_active: !currentStatus });
      }

      router.refresh();
    } catch (err) {
      alert('সক্রিয়তা পরিবর্তন করা সম্ভব হয়নি, আবার চেষ্টা করুন।');
    } finally {
      setToggleLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Batches List (takes 2 cols) */}
      <div className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-surface">
          <h2 className="text-base font-bold text-text-primary">বিদ্যমান ব্যাচ সমূহ</h2>
        </div>

        {initialBatches.length === 0 ? (
          <p className="p-8 text-center text-xs text-text-muted font-medium">কোনো ব্যাচ তৈরি করা হয়নি।</p>
        ) : (
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-surface-alt border-b border-border text-xs font-bold text-text-secondary uppercase">
                  <th className="px-6 py-3.5">ব্যাচের নাম</th>
                  <th className="px-6 py-3.5">মাসিক ফি</th>
                  <th className="px-6 py-3.5">শুরু ও শেষ</th>
                  <th className="px-6 py-3.5">আসন ও ভর্তি</th>
                  <th className="px-6 py-3.5">সক্রিয়</th>
                  <th className="px-6 py-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {initialBatches.map((batch) => {
                  const percent = Math.min(100, Math.round((batch.enrolled_count / batch.capacity) * 100));
                  const isFull = batch.seats_remaining <= 0;
                  
                  // Color configuration based on seats remaining
                  let barColorClass = 'bg-primary';
                  let textColorClass = 'text-primary';
                  let badgeBgClass = 'bg-primary-light text-primary';
                  
                  if (batch.seats_remaining <= 0) {
                    barColorClass = 'bg-error';
                    textColorClass = 'text-error';
                    badgeBgClass = 'bg-error/10 text-error';
                  } else if (batch.seats_remaining <= 10) {
                    barColorClass = 'bg-accent';
                    textColorClass = 'text-accent';
                    badgeBgClass = 'bg-accent-light text-accent';
                  }

                  return (
                    <tr key={batch.id} className="hover:bg-surface-alt/25 transition-colors">
                      <td className="px-6 py-4 font-semibold text-text-primary">
                        {batch.name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-text-primary">
                        <span className="font-bold text-primary mr-0.5">৳</span>
                        {toBengaliNumerals(batch.fee)}
                      </td>
                      <td className="px-6 py-4 text-text-secondary text-xs">
                        {formatShortDate(batch.start_date)} - {formatShortDate(batch.end_date)}
                      </td>
                      <td className="px-6 py-4 space-y-1 max-w-[150px]">
                        <div className="flex justify-between items-center text-[10px] text-text-secondary font-medium">
                          <span>{toBengaliNumerals(batch.enrolled_count)}/{toBengaliNumerals(batch.capacity)}</span>
                          <span className={`px-1.5 py-0.5 rounded font-bold ${badgeBgClass}`}>
                            {isFull ? 'পূর্ণ' : `${toBengaliNumerals(batch.seats_remaining)} বাকি`}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-surface-alt border border-border/40 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${barColorClass}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {toggleLoadingId === batch.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : (
                          <input
                            type="checkbox"
                            checked={batch.is_active}
                            onChange={() => handleActiveToggle(batch.id, batch.is_active)}
                            className="w-4 h-4 text-primary focus:ring-primary border-border rounded cursor-pointer"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setEditingBatch(batch)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-border hover:bg-surface-alt hover:text-primary rounded-lg text-xs font-semibold text-text-secondary transition duration-150 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>সম্পাদনা</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Mobile scroll hint */}
            <p className="text-xs text-text-muted text-right md:hidden mt-1">&#8592; স্ক্রোল করুন &#8594;</p>
          </div>
        )}
      </div>

      {/* Right: Form Sidebar (takes 1 col) */}
      <div>
        <BatchForm editBatch={editingBatch} onCancelEdit={() => setEditingBatch(null)} />
      </div>
    </div>
  );
}
