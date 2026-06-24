'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, AlertCircle, Save } from 'lucide-react';

interface Batch {
  id: string;
  name: string;
}

interface Exam {
  id: string;
  batch_id: string;
  title: string;
  exam_date: string;
  total_marks: number;
  type: string;
}

interface ExamFormProps {
  batches: Batch[];
  editExam: Exam | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ExamForm({
  batches,
  editExam,
  onSuccess,
  onCancel,
}: ExamFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [batchId, setBatchId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [type, setType] = useState('written'); // 'mcq' | 'written' | 'mock'
  const [totalMarks, setTotalMarks] = useState(100);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editExam) {
      setTitle(editExam.title);
      setBatchId(editExam.batch_id);
      setExamDate(editExam.exam_date);
      setType(editExam.type);
      setTotalMarks(editExam.total_marks);
    } else {
      setTitle('');
      setBatchId(batches[0]?.id || '');
      // Default to today's date in local YYYY-MM-DD
      const local = new Date();
      const offset = local.getTimezoneOffset();
      const localDate = new Date(local.getTime() - offset * 60 * 1000);
      setExamDate(localDate.toISOString().slice(0, 10));
      setType('written');
      setTotalMarks(100);
    }
    setErrorMessage(null);
  }, [editExam, batches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validations
    if (!title.trim()) {
      setErrorMessage('পরীক্ষার নাম প্রদান করুন।');
      return;
    }
    if (!batchId) {
      setErrorMessage('ব্যাচ নির্বাচন করুন।');
      return;
    }
    if (!examDate) {
      setErrorMessage('পরীক্ষার তারিখ নির্বাচন করুন।');
      return;
    }
    if (totalMarks <= 0) {
      setErrorMessage('মোট নম্বর অবশ্যই ০ থেকে বড় হতে হবে।');
      return;
    }

    setLoading(true);

    const examData = {
      title: title.trim(),
      batch_id: batchId,
      exam_date: examDate,
      type,
      total_marks: totalMarks,
    };

    try {
      if (editExam) {
        // Edit Mode
        const { error } = await supabase
          .from('exams')
          .update(examData)
          .eq('id', editExam.id);

        if (error) throw error;
      } else {
        // Create Mode
        const { error } = await supabase
          .from('exams')
          .insert(examData);

        if (error) throw error;
      }

      router.refresh();
      onSuccess();
    } catch (err: any) {
      console.error('Error saving exam:', err);
      setErrorMessage(err.message || 'পরীক্ষা সংরক্ষণ করার সময় একটি ত্রুটি ঘটেছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="bg-error/10 border border-error/20 text-error rounded-xl p-3.5 flex items-start gap-2.5 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Exam Title */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-1.5">
          পরীক্ষার নাম <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="যেমন: সাপ্তাহিক পরীক্ষা ৩ (অধ্যায় ৫)"
          className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-mid focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary bg-surface"
          required
        />
      </div>

      {/* Batch Selector */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-1.5">
          ব্যাচ <span className="text-error">*</span>
        </label>
        <select
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-mid focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary bg-surface"
          required
        >
          <option value="" disabled>সিলেক্ট করুন</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date and Total Marks */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            পরীক্ষার তারিখ <span className="text-error">*</span>
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-mid focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary bg-surface"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            মোট নম্বর <span className="text-error">*</span>
          </label>
          <input
            type="number"
            value={totalMarks}
            onChange={(e) => setTotalMarks(parseInt(e.target.value, 10) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-mid focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary bg-surface"
            min="1"
            required
          />
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          পরীক্ষার ধরন <span className="text-error">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['written', 'mcq', 'mock'] as const).map((t) => {
            const isSelected = type === t;
            const labelsBn = { written: 'লিখিত (Written)', mcq: 'MCQ পরীক্ষা', mock: 'মক টেস্ট (Mock)' };
            return (
              <label
                key={t}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center cursor-pointer transition ${
                  isSelected
                    ? 'border-primary bg-primary-light/40 text-primary font-semibold'
                    : 'border-border hover:border-border-strong text-text-secondary bg-surface'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={isSelected}
                  onChange={() => setType(t)}
                  className="sr-only"
                />
                <span className="text-xs">{labelsBn[t]}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-3 md:py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-alt transition cursor-pointer disabled:opacity-50 select-none"
        >
          বাতিল
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 md:py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition cursor-pointer disabled:opacity-50 select-none"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>সংরক্ষণ করুন</span>
        </button>
      </div>
    </form>
  );
}
