'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Phone, Mail, Award, Calendar, Edit2, CheckCircle2, AlertCircle, Save, X } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

interface ProfileFormProps {
  profile: Profile;
  email: string | undefined;
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

export default function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isEditMode, setIsEditMode] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [loading, setLoading] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setToast({ message: 'নাম খালি রাখা যাবে না।', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setToast({ message: 'তথ্য সফলভাবে আপডেট হয়েছে ✓', type: 'success' });
      setIsEditMode(false);
      router.refresh(); // Sync layouts & sidebar
    } catch (err: any) {
      setToast({ message: 'তথ্য সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getInitial = () => {
    return fullName.trim().charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || 'S';
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-fade-in transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-primary-light text-primary border-primary/20' 
            : 'bg-error/10 text-error border-error/20'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Profile Cover */}
      <div className="h-32 bg-gradient-to-r from-primary to-primary-mid relative" />

      {/* Profile Info Container */}
      <div className="px-6 pb-6 pt-1">
        {/* Avatar Circle overlapping cover */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 mb-6 gap-4">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-full bg-surface border-4 border-surface shadow-md flex items-center justify-center text-primary font-bold text-3xl select-none">
              {getInitial()}
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-text-primary leading-tight font-ui">
                {profile.full_name || 'শিক্ষার্থী'}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-light text-primary border border-primary/10 mt-1 uppercase">
                {profile.role === 'admin' ? 'এডমিন' : 'ছাত্র'}
              </span>
            </div>
          </div>

          {/* Toggle Edit Mode Button */}
          {!isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-border hover:bg-surface-alt rounded-xl transition duration-150 cursor-pointer shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>তথ্য পরিবর্তন করুন</span>
            </button>
          )}
        </div>

        {/* Profile Card Fields */}
        {isEditMode ? (
          <form onSubmit={handleSave} className="space-y-4 max-w-lg mt-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs text-text-secondary font-medium">
                পূর্ণ নাম <span className="text-error">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-mid transition duration-150"
                placeholder="আপনার নাম লিখুন"
                required
              />
            </div>

            {/* Phone Input */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs text-text-secondary font-medium">
                মোবাইল নম্বর
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-mid transition duration-150"
                placeholder="মোবাইল নম্বর লিখুন"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-primary text-white hover:bg-primary-dark rounded-xl transition duration-150 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>সংরক্ষণ করুন</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFullName(profile.full_name || '');
                  setPhone(profile.phone || '');
                  setIsEditMode(false);
                }}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold border border-border hover:bg-surface-alt rounded-xl transition duration-150 cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>বাতিল</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-6 max-w-2xl">
            {/* Full Name Display */}
            <div className="flex items-center gap-3 py-1">
              <User className="w-5 h-5 text-text-muted" />
              <div>
                <span className="text-text-muted block text-xs">পূর্ণ নাম</span>
                <span className="text-sm font-medium text-text-primary">{profile.full_name || '—'}</span>
              </div>
            </div>

            {/* Phone Display */}
            <div className="flex items-center gap-3 py-1">
              <Phone className="w-5 h-5 text-text-muted" />
              <div>
                <span className="text-text-muted block text-xs">মোবাইল নম্বর</span>
                <span className="text-sm font-medium text-text-primary">
                  {profile.phone ? toBengaliNumerals(profile.phone) : '—'}
                </span>
              </div>
            </div>

            {/* Email Display */}
            <div className="flex items-center gap-3 py-1">
              <Mail className="w-5 h-5 text-text-muted" />
              <div>
                <span className="text-text-muted block text-xs">ইমেইল ঠিকানা (পরিবর্তনযোগ্য নয়)</span>
                <span className="text-sm font-medium text-text-primary">{email || '—'}</span>
              </div>
            </div>

            {/* Member Since Display */}
            <div className="flex items-center gap-3 py-1">
              <Calendar className="w-5 h-5 text-text-muted" />
              <div>
                <span className="text-text-muted block text-xs">কোচিং এ ভর্তির তারিখ</span>
                <span className="text-sm font-medium text-text-primary">
                  {formatBanglaDate(profile.created_at)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
