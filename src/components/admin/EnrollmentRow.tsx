'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface Batch {
  id: string;
  name: string;
  seats_remaining: number;
}

interface EnrollmentRowProps {
  enrollment: {
    id: string;
    student_id: string;
    batch_id: string;
    status: 'active' | 'dropped' | 'completed';
    enrolled_at: string;
    profiles: {
      full_name: string;
      phone: string | null;
    } | null;
    batches: {
      name: string;
    } | null;
  };
  batches: Batch[];
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

// Formats date string into Bangla format
function formatBanglaDate(dateStr: string | null | undefined) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export default function EnrollmentRow({ enrollment, batches }: EnrollmentRowProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: 'active' | 'dropped' | 'completed') => {
    setLoading(true);
    try {
      // 1. Update enrollment status
      const { error: enrollError } = await supabase
        .from('enrollments')
        .update({ status: newStatus })
        .eq('id', enrollment.id);

      if (enrollError) throw enrollError;

      // 2. Update student profiles batch_id sync
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ batch_id: newStatus === 'active' ? enrollment.batch_id : null })
        .eq('id', enrollment.student_id);

      if (profileError) throw profileError;

      router.refresh();
    } catch (err) {
      alert('ভর্তির অবস্থা পরিবর্তন করা যায়নি, আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = async (newBatchId: string) => {
    setLoading(true);
    try {
      // 1. Update enrollment batch_id
      const { error: enrollError } = await supabase
        .from('enrollments')
        .update({ batch_id: newBatchId })
        .eq('id', enrollment.id);

      if (enrollError) throw enrollError;

      // 2. Update student profiles batch_id sync
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ batch_id: newBatchId })
        .eq('id', enrollment.student_id);

      if (profileError) throw profileError;

      router.refresh();
    } catch (err) {
      alert('ব্যাচ পরিবর্তন করা যায়নি, আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const initial = enrollment.profiles?.full_name ? enrollment.profiles.full_name.charAt(0) : 'শ';
  const bgColors = [
    'bg-emerald-50 text-emerald-700 border-emerald-100',
    'bg-blue-50 text-blue-700 border-blue-100',
    'bg-purple-50 text-purple-700 border-purple-100',
    'bg-amber-50 text-amber-700 border-amber-100',
    'bg-rose-50 text-rose-700 border-rose-100'
  ];
  const colorIndex = (enrollment.profiles?.full_name?.length || 0) % bgColors.length;
  const colorClass = bgColors[colorIndex];

  // Defensive check: ensure the current assigned batch is in the select dropdown list,
  // even if it's not active or has 0 seats remaining.
  const currentBatchInList = batches.some((b) => b.id === enrollment.batch_id);
  const selectBatches = currentBatchInList
    ? batches
    : enrollment.batch_id
    ? [
        {
          id: enrollment.batch_id,
          name: enrollment.batches?.name || 'অজানা ব্যাচ',
          seats_remaining: 0,
        },
        ...batches,
      ]
    : batches;

  return (
    <tr className="hover:bg-surface-alt/40 transition-colors text-sm">
      <td className="px-6 py-4.5 align-middle text-left">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border ${colorClass} shrink-0`}>
            {initial}
          </div>
          <div>
            <div className="font-bold text-sm text-text-primary">{enrollment.profiles?.full_name || 'অজানা শিক্ষার্থী'}</div>
            <div className="text-xs text-text-muted mt-0.5 font-mono">{enrollment.profiles?.phone || 'মোবাইল নেই'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4.5 text-left text-text-secondary font-medium align-middle">
        {enrollment.status === 'active' ? (
          <select
            value={enrollment.batch_id}
            onChange={(e) => handleBatchChange(e.target.value)}
            disabled={loading}
            className="bg-surface border border-border/80 hover:border-primary/45 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer text-text-primary transition duration-150 max-w-[180px] truncate"
          >
            {selectBatches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.seats_remaining <= 0 && b.id !== enrollment.batch_id ? 'পূর্ণ' : `বাকি: ${toBengaliNumerals(b.seats_remaining)}`})
              </option>
            ))}
          </select>
        ) : (
          <span className="inline-block border border-border/80 bg-surface-alt/50 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
            {enrollment.batches?.name || 'অজানা ব্যাচ'}
          </span>
        )}
      </td>
      <td className="px-6 py-4.5 text-left text-text-secondary font-medium align-middle">
        {formatBanglaDate(enrollment.enrolled_at)}
      </td>
      <td className="px-6 py-4.5 text-left align-middle">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
          enrollment.status === 'active' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
            : enrollment.status === 'dropped' 
            ? 'bg-red-50 text-error border-red-100' 
            : 'bg-surface-alt text-text-secondary border-border/80'
        }`}>
          {enrollment.status === 'active' ? 'সক্রিয়' : enrollment.status === 'dropped' ? 'বাতিল' : 'সম্পন্ন'}
        </span>
      </td>
      <td className="px-6 py-4.5 text-right align-middle">
        {loading ? (
          <div className="flex items-center justify-end">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2">
            {enrollment.status === 'active' ? (
              <>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="px-2.5 py-1 bg-surface hover:bg-surface-alt text-text-primary hover:text-primary border border-border/80 hover:border-primary/30 rounded-lg text-xs font-bold transition duration-150 cursor-pointer"
                >
                  সম্পন্ন করুন
                </button>
                <button
                  onClick={() => handleStatusChange('dropped')}
                  className="px-2.5 py-1 bg-surface hover:bg-red-50 text-error border border-border/80 hover:border-error/30 rounded-lg text-xs font-bold transition duration-150 cursor-pointer"
                >
                  বাদ দিন
                </button>
              </>
            ) : (
              <button
                onClick={() => handleStatusChange('active')}
                className="px-2.5 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-xs font-bold shadow-2xs hover:shadow-xs cursor-pointer"
              >
                পুনরায় সক্রিয়
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
