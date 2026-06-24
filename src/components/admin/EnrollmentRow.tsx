'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

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

export default function EnrollmentRow({ enrollment }: EnrollmentRowProps) {
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

  return (
    <tr className="hover:bg-surface-alt/25 transition-colors text-sm">
      <td className="px-6 py-4">
        <div className="font-semibold text-text-primary">{enrollment.profiles?.full_name || 'অজানা শিক্ষার্থী'}</div>
      </td>
      <td className="px-6 py-4 text-text-secondary">
        {enrollment.profiles?.phone || 'মোবাইল নেই'}
      </td>
      <td className="px-6 py-4 font-medium text-text-secondary">
        {enrollment.batches?.name || 'অজানা ব্যাচ'}
      </td>
      <td className="px-6 py-4 text-text-muted">
        {formatBanglaDate(enrollment.enrolled_at)}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
          enrollment.status === 'active' 
            ? 'bg-primary-light text-primary' 
            : enrollment.status === 'dropped' 
            ? 'bg-error/10 text-error' 
            : 'bg-surface-alt text-text-secondary'
        }`}>
          {enrollment.status === 'active' ? 'সক্রিয়' : enrollment.status === 'dropped' ? 'বাতিল' : 'সম্পন্ন'}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        {loading ? (
          <div className="flex items-center justify-end">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 text-xs">
            {enrollment.status === 'active' ? (
              <>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="px-2 py-1 bg-surface-alt text-text-primary border border-border rounded-lg hover:bg-primary-light hover:text-primary transition font-semibold cursor-pointer"
                >
                  সম্পন্ন করুন
                </button>
                <button
                  onClick={() => handleStatusChange('dropped')}
                  className="px-2 py-1 bg-error/10 text-error border border-error/20 rounded-lg hover:bg-error hover:text-white transition font-semibold cursor-pointer"
                >
                  বাদ দিন
                </button>
              </>
            ) : (
              <button
                onClick={() => handleStatusChange('active')}
                className="px-2 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold cursor-pointer"
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
