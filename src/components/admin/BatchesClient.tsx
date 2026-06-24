'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Edit2, Loader2, Plus } from 'lucide-react';
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
  const [isFormOpen, setIsFormOpen] = useState(false);
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
    <div className="space-y-6">
      {/* Batches List (Full-Width Card) */}
      <div className="bg-surface rounded-2xl border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Header with "Create Batch" Button on the right */}
        <div className="px-6 py-4.5 border-b border-border/60 bg-surface flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-bold text-text-primary">বিদ্যমান ব্যাচ সমূহ</h2>
          <button
            onClick={() => {
              setEditingBatch(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ব্যাচ তৈরি</span>
          </button>
        </div>

        {initialBatches.length === 0 ? (
          <p className="p-8 text-center text-xs text-text-muted font-medium">কোনো ব্যাচ তৈরি করা হয়নি।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-surface-alt/60 border-b border-border/60 text-xs font-bold text-text-secondary uppercase tracking-wider">
                  <th className="px-6 py-3.5 text-left">ব্যাচের নাম</th>
                  <th className="px-6 py-3.5 text-left">মাসিক ফি</th>
                  <th className="px-6 py-3.5 text-left">শুরু ও শেষ</th>
                  <th className="px-6 py-3.5 text-left">আসন ও ভর্তি</th>
                  <th className="px-6 py-3.5 text-left">সক্রিয়</th>
                  <th className="px-6 py-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {initialBatches.map((batch) => {
                  const percent = Math.min(100, Math.round((batch.enrolled_count / batch.capacity) * 100));
                  const isFull = batch.seats_remaining <= 0;
                  
                  // Color configuration based on seats remaining
                  let barColorClass = 'bg-gradient-to-r from-emerald-400 to-primary';
                  let badgeBgClass = 'bg-emerald-50/60 text-emerald-700 border border-emerald-100/70';
                  
                  if (batch.seats_remaining <= 0) {
                    barColorClass = 'bg-gradient-to-r from-red-400 to-error';
                    badgeBgClass = 'bg-red-50/60 text-error border border-red-100/70';
                  } else if (batch.seats_remaining <= 10) {
                    barColorClass = 'bg-gradient-to-r from-amber-400 to-accent';
                    badgeBgClass = 'bg-amber-50/60 text-amber-700 border border-amber-200/60';
                  }

                  return (
                    <tr key={batch.id} className="hover:bg-surface-alt/25 transition-colors">
                      <td className="px-6 py-4 font-semibold text-text-primary align-middle">
                        {batch.name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-text-primary align-middle">
                        <span className="font-bold text-primary mr-0.5">৳</span>
                        {toBengaliNumerals(batch.fee)}
                      </td>
                      <td className="px-6 py-4 text-text-secondary text-xs align-middle">
                        {formatShortDate(batch.start_date)} - {formatShortDate(batch.end_date)}
                      </td>
                      <td className="px-6 py-4 space-y-1.5 min-w-[180px] max-w-[220px] align-middle">
                        <div className="flex justify-between items-center text-xs font-semibold text-text-secondary gap-2">
                          <span className="shrink-0">
                            ভর্তি: <span className="text-text-primary font-bold">{toBengaliNumerals(batch.enrolled_count)}</span>
                            <span className="text-text-muted mx-0.5">/</span>
                            আসন: {toBengaliNumerals(batch.capacity)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${badgeBgClass}`}>
                            {isFull ? 'পূর্ণ' : `${toBengaliNumerals(batch.seats_remaining)} বাকি`}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-surface-alt border border-border/40 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
                          <div 
                            className={`h-full rounded-full ${barColorClass} transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
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
                      <td className="px-6 py-4 text-right align-middle">
                        <button
                          onClick={() => {
                            setEditingBatch(batch);
                            setIsFormOpen(true);
                          }}
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
          </div>
        )}
      </div>

      {/* Pop-up Modal Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-md w-full overflow-hidden animate-scaleUp">
            <BatchForm 
              editBatch={editingBatch} 
              onCancelEdit={() => {
                setEditingBatch(null);
                setIsFormOpen(false);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
