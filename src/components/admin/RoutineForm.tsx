'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, AlertCircle, Save, X } from 'lucide-react';

interface Routine {
  id: string;
  batch_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string;
  platform: 'Physical' | 'Zoom' | 'Google Meet';
  link: string | null;
}

interface RoutineFormProps {
  batchId: string;
  editRoutine: Routine | null;
  prefilledDay: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const DAYS_OF_WEEK = [
  { value: 'Saturday', label: 'শনিবার' },
  { value: 'Sunday', label: 'রবিবার' },
  { value: 'Monday', label: 'সোমবার' },
  { value: 'Tuesday', label: 'মঙ্গলবার' },
  { value: 'Wednesday', label: 'বুধবার' },
  { value: 'Thursday', label: 'বৃহস্পতিবার' },
  { value: 'Friday', label: 'শুক্রবার' },
];

export default function RoutineForm({
  batchId,
  editRoutine,
  prefilledDay,
  onSuccess,
  onCancel,
}: RoutineFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [dayOfWeek, setDayOfWeek] = useState('Saturday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [subject, setSubject] = useState('');
  const [platform, setPlatform] = useState<'Physical' | 'Zoom' | 'Google Meet'>('Physical');
  const [link, setLink] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when editing or changing prefill
  useEffect(() => {
    if (editRoutine) {
      setDayOfWeek(editRoutine.day_of_week);
      // PostgreSQL time might return "16:00:00". We need "16:00" for input type="time"
      setStartTime(editRoutine.start_time.slice(0, 5));
      setEndTime(editRoutine.end_time.slice(0, 5));
      setSubject(editRoutine.subject);
      setPlatform(editRoutine.platform);
      setLink(editRoutine.link || '');
    } else {
      setDayOfWeek(prefilledDay || 'Saturday');
      setStartTime('');
      setEndTime('');
      setSubject('');
      setPlatform('Physical');
      setLink('');
    }
    setErrorMessage(null);
  }, [editRoutine, prefilledDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validations
    if (!subject.trim()) {
      setErrorMessage('দয়া করে বিষয়ের নাম লিখুন।');
      return;
    }
    if (!startTime) {
      setErrorMessage('শুরুর সময় নির্বাচন করুন।');
      return;
    }
    if (!endTime) {
      setErrorMessage('শেষের সময় নির্বাচন করুন।');
      return;
    }
    if ((platform === 'Zoom' || platform === 'Google Meet') && !link.trim()) {
      setErrorMessage('অনলাইন ক্লাসের জন্য লিংক প্রদান করা আবশ্যক।');
      return;
    }

    setLoading(true);

    const routineData = {
      batch_id: batchId,
      day_of_week: dayOfWeek,
      start_time: startTime + ':00', // Append seconds for Postgres format
      end_time: endTime + ':00',
      subject: subject.trim(),
      platform,
      link: platform === 'Physical' ? null : link.trim(),
    };

    try {
      if (editRoutine) {
        // Edit Mode
        const { error } = await supabase
          .from('routines')
          .update(routineData)
          .eq('id', editRoutine.id);

        if (error) throw error;
      } else {
        // Create Mode
        const { error } = await supabase
          .from('routines')
          .insert(routineData);

        if (error) throw error;
      }

      router.refresh();
      onSuccess();
    } catch (err: any) {
      console.error('Error saving routine:', err);
      setErrorMessage(err.message || 'রুটিন সংরক্ষণ করার সময় একটি ত্রুটি ঘটেছে।');
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

      {/* Subject */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-1.5">
          বিষয়ের নাম <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="যেমন: জীববিজ্ঞান প্রথম পত্র (অধ্যায় ৪)"
          className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-mid focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary"
          required
        />
      </div>

      {/* Day of Week */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-1.5">
          দিন <span className="text-error">*</span>
        </label>
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-mid focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary bg-surface"
        >
          {DAYS_OF_WEEK.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            শুরুর সময় <span className="text-error">*</span>
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-mid focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary bg-surface"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            শেষের সময় <span className="text-error">*</span>
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-mid focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary bg-surface"
            required
          />
        </div>
      </div>

      {/* Platform */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          ক্লাস প্ল্যাটফর্ম <span className="text-error">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['Physical', 'Zoom', 'Google Meet'] as const).map((p) => {
            const isSelected = platform === p;
            const labelsBn = { Physical: 'সরাসরি (Physical)', Zoom: 'Zoom Online', 'Google Meet': 'Google Meet' };
            return (
              <label
                key={p}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center cursor-pointer transition ${
                  isSelected
                    ? 'border-primary bg-primary-light/40 text-primary font-semibold'
                    : 'border-border hover:border-border-strong text-text-secondary bg-surface'
                }`}
              >
                <input
                  type="radio"
                  name="platform"
                  value={p}
                  checked={isSelected}
                  onChange={() => {
                    setPlatform(p);
                    if (p === 'Physical') setLink('');
                  }}
                  className="sr-only"
                />
                <span className="text-xs">{labelsBn[p]}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Online Link */}
      {platform !== 'Physical' && (
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            ক্লাস লিংক (URL) <span className="text-error">*</span>
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://zoom.us/j/... বা meet.google.com/..."
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-mid focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary"
            required
          />
        </div>
      )}

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
