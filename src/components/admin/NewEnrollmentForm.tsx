'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, AlertCircle, CheckCircle } from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  phone: string | null;
}

interface Batch {
  id: string;
  name: string;
  capacity: number;
  enrolled_count: number;
  seats_remaining: number;
}

interface NewEnrollmentFormProps {
  students: Student[];
  batches: Batch[];
}

export default function NewEnrollmentForm({ students, batches }: NewEnrollmentFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter students based on search input
  const filteredStudents = students.filter((student) => {
    const search = studentSearch.toLowerCase();
    return (
      student.full_name?.toLowerCase().includes(search) ||
      student.phone?.includes(search)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedBatchId) {
      setErrorMessage('শিক্ষার্থী এবং ব্যাচ নির্বাচন করুন।');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Get the selected batch capacity check
    const batch = batches.find((b) => b.id === selectedBatchId);
    if (!batch) {
      setErrorMessage('নির্বাচিত ব্যাচ পাওয়া যায়নি।');
      setLoading(false);
      return;
    }

    if (batch.seats_remaining <= 0) {
      setErrorMessage('এই ব্যাচে আর কোনো আসন নেই');
      setLoading(false);
      return;
    }

    try {
      // 1. Insert into enrollments
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          student_id: selectedStudentId,
          batch_id: selectedBatchId,
          status: 'active',
        });

      if (enrollError) {
        if (enrollError.code === '23505' || enrollError.message?.includes('unique') || enrollError.message?.includes('duplicate')) {
          throw new Error('duplicate');
        }
        throw enrollError;
      }

      // 2. Sync profiles.batch_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ batch_id: selectedBatchId })
        .eq('id', selectedStudentId);

      if (profileError) throw profileError;

      // Success
      setSuccessMessage('ভর্তি সফল হয়েছে ✓');
      setSelectedStudentId('');
      setSelectedBatchId('');
      setStudentSearch('');
      
      // Refresh parent Server Component data
      router.refresh();

      // Clear success message after 4 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);

    } catch (err: any) {
      if (err.message === 'duplicate') {
        setErrorMessage('এই শিক্ষার্থী ইতিমধ্যে এই ব্যাচে ভর্তি আছেন');
      } else {
        setErrorMessage('ভর্তি সম্পন্ন করা সম্ভব হয়নি, আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-5">
      <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
        <Plus className="w-5 h-5 text-primary" />
        <span>নতুন ভর্তি (Add Enrollment)</span>
      </h2>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-primary-light border border-primary/20 rounded-xl text-primary text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Select Group */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-text-secondary">
            শিক্ষার্থী খুঁজুন
          </label>
          <input
            type="text"
            placeholder="নাম বা মোবাইল দিয়ে ফিল্টার করুন..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
          />
          
          <label className="block text-xs font-bold text-text-secondary pt-1">
            শিক্ষার্থী নির্বাচন করুন
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            required
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer text-text-primary font-medium"
          >
            <option value="">নির্বাচন করুন ({filteredStudents.length} জন)</option>
            {filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.phone || 'মোবাইল নেই'})
              </option>
            ))}
          </select>
        </div>

        {/* Batch Select Group */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-text-secondary">
            ব্যাচ নির্বাচন করুন
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            required
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer text-text-primary font-medium"
          >
            <option value="">ব্যাচ নির্বাচন করুন</option>
            {batches.map((b) => {
              const isFull = b.seats_remaining <= 0;
              return (
                <option key={b.id} value={b.id} disabled={isFull}>
                  {b.name} ({isFull ? 'পূর্ণ' : `${toBengaliNumerals(b.seats_remaining)} আসন বাকি`})
                </option>
              );
            })}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark cursor-pointer disabled:opacity-50 transition duration-150 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>ভর্তি করা হচ্ছে...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>ভর্তি করুন</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
