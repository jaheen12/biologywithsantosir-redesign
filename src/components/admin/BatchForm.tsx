'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, Edit3, AlertCircle, CheckCircle } from 'lucide-react';

interface Batch {
  id: string;
  name: string;
  fee: number;
  capacity: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

interface BatchFormProps {
  editBatch: Batch | null;
  onCancelEdit: () => void;
}

export default function BatchForm({ editBatch, onCancelEdit }: BatchFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [fee, setFee] = useState(800);
  const [capacity, setCapacity] = useState(40);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state with editBatch if editing
  useEffect(() => {
    if (editBatch) {
      setName(editBatch.name);
      setFee(editBatch.fee);
      setCapacity(editBatch.capacity);
      setStartDate(editBatch.start_date || '');
      setEndDate(editBatch.end_date || '');
      setIsActive(editBatch.is_active);
    } else {
      setName('');
      setFee(800);
      setCapacity(40);
      setStartDate('');
      setEndDate('');
      setIsActive(true);
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [editBatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || fee < 0 || capacity < 1) {
      setErrorMessage('দয়া করে সঠিক তথ্য প্রদান করুন।');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const batchData = {
      name: name.trim(),
      fee,
      capacity,
      start_date: startDate || null,
      end_date: endDate || null,
      is_active: isActive,
    };

    try {
      if (editBatch) {
        // Edit Mode
        const { error } = await supabase
          .from('batches')
          .update(batchData)
          .eq('id', editBatch.id);

        if (error) throw error;
        setSuccessMessage('ব্যাচ আপডেট হয়েছে ✓');
        onCancelEdit();
      } else {
        // Create Mode
        const { error } = await supabase
          .from('batches')
          .insert(batchData);

        if (error) throw error;
        setSuccessMessage('ব্যাচ তৈরি হয়েছে ✓');
        
        // Reset form
        setName('');
        setFee(800);
        setCapacity(40);
        setStartDate('');
        setEndDate('');
        setIsActive(true);
        onCancelEdit();
      }

      router.refresh();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);

    } catch (err: any) {
      setErrorMessage('ব্যাচ সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-5">
      <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
        {editBatch ? (
          <>
            <Edit3 className="w-5 h-5 text-primary" />
            <span>ব্যাচ সম্পাদনা (Edit Batch)</span>
          </>
        ) : (
          <>
            <Plus className="w-5 h-5 text-primary" />
            <span>নতুন ব্যাচ তৈরি করুন (Create Batch)</span>
          </>
        )}
      </h2>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 bg-primary-light border border-primary/20 rounded-xl text-primary text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-4 text-base md:text-xs font-medium text-text-secondary">
        {/* Batch Name */}
        <div className="space-y-1.5">
          <label className="block font-bold text-text-secondary">
            ব্যাচের নাম
          </label>
          <input
            type="text"
            required
            placeholder="উদাঃ HSC 2026 Batch A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Monthly Fee */}
          <div className="space-y-1.5">
            <label className="block font-bold text-text-secondary">
              মাসিক ফি (৳)
            </label>
            <input
              type="number"
              required
              min="0"
              value={fee}
              onChange={(e) => setFee(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
            />
          </div>

          {/* Seat Capacity */}
          <div className="space-y-1.5">
            <label className="block font-bold text-text-secondary">
              আসন সংখ্যা
            </label>
            <input
              type="number"
              required
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="block font-bold text-text-secondary">
              শুরুর তারিখ
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="block font-bold text-text-secondary">
              শেষের তারিখ
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
            />
          </div>
        </div>

        {/* Active Status Checkbox */}
        <div className="flex items-center gap-2 py-1">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-primary focus:ring-primary border-border rounded cursor-pointer"
          />
          <label htmlFor="isActive" className="font-bold text-text-primary cursor-pointer select-none">
            ব্যাচটি সক্রিয় আছে
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex-1 py-3 md:py-2.5 border border-border hover:bg-surface-alt rounded-xl font-bold transition duration-150 cursor-pointer text-center text-text-primary select-none"
          >
            বাতিল করুন
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 md:py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition duration-150 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 select-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <span>{editBatch ? 'হালনাগাদ করুন' : 'ব্যাচ তৈরি করুন'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
