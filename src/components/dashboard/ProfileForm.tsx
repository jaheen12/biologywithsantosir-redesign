'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  X,
  BookOpen,
  DollarSign,
  Users,
  Activity,
  Award,
  Check
} from 'lucide-react';

interface BatchInfo {
  name: string;
  fee: number;
  start_date: string | null;
  capacity: number;
  is_active: boolean;
}

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  batch?: BatchInfo | null;
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
    <div className="space-y-6 font-ui">
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

      {/* Profile Cover & Header Card */}
      <div className="bg-surface border border-border/80 rounded-3xl overflow-hidden shadow-sm relative transition-all duration-300">
        <div className="h-36 bg-gradient-to-r from-emerald-500 via-primary to-primary-dark relative" />
        
        <div className="px-6 pb-6">
          {/* Avatar & Action Button Row */}
          <div className="flex items-end justify-between -mt-16 mb-4 relative z-10 gap-4">
            <div className="w-28 h-28 rounded-2xl bg-surface border-4 border-surface shadow-md flex items-center justify-center text-primary font-bold text-4xl select-none relative z-10 shrink-0">
              {getInitial()}
            </div>

            {/* Toggle Edit Mode Button */}
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-border bg-surface hover:border-primary/20 hover:bg-primary-light hover:text-primary rounded-xl transition duration-150 cursor-pointer shadow-sm active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>প্রোফাইল সম্পাদন</span>
              </button>
            )}
          </div>

          {/* Student Name & Role Badge (Cleanly underneath) */}
          <div className="space-y-1.5 mt-2">
            <h2 className="text-2xl font-black text-text-primary tracking-tight">
              {profile.full_name || 'শিক্ষার্থী'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-primary-light text-primary border border-primary/20">
                <Award className="w-3 h-3" />
                {profile.role === 'admin' ? 'এডমিন' : 'শিক্ষার্থী'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Information Form/Display */}
        <div className="lg:col-span-2 bg-surface border border-border/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-text-primary">ব্যক্তিগত তথ্য</h3>
            <p className="text-xs text-text-secondary mt-0.5">আপনার অ্যাকাউন্টের ব্যক্তিগত বিবরণ এখানে দেখুন বা পরিবর্তন করুন।</p>
          </div>

          {isEditMode ? (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs text-text-muted font-bold uppercase tracking-wider">
                  পূর্ণ নাম <span className="text-error">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary font-medium transition duration-150"
                  placeholder="আপনার নাম লিখুন"
                  required
                />
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs text-text-muted font-bold uppercase tracking-wider">
                  মোবাইল নম্বর
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary font-medium transition duration-150"
                  placeholder="মোবাইল নম্বর লিখুন"
                />
              </div>

              {/* Readonly fields display in edit mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5 opacity-60">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">ইমেইল ঠিকানা</span>
                  <span className="text-sm font-medium text-text-secondary block px-4 py-2.5 bg-surface-alt border border-border rounded-xl">{email || '—'}</span>
                </div>
                <div className="space-y-1.5 opacity-60">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">ভর্তির তারিখ</span>
                  <span className="text-sm font-medium text-text-secondary block px-4 py-2.5 bg-surface-alt border border-border rounded-xl">{formatBanglaDate(profile.created_at)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/50">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary hover:bg-primary-dark text-white rounded-xl transition duration-150 cursor-pointer disabled:opacity-50 shadow-sm select-none"
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-border hover:bg-surface-alt rounded-xl transition duration-150 cursor-pointer disabled:opacity-50 select-none"
                >
                  <X className="w-4 h-4" />
                  <span>বাতিল</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name Display */}
              <div className="flex items-start gap-3 p-3 hover:bg-surface-alt/40 rounded-2xl border border-border/40 transition-colors">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider">পূর্ণ নাম</span>
                  <span className="text-sm font-bold text-text-primary mt-0.5 block">{profile.full_name || '—'}</span>
                </div>
              </div>

              {/* Phone Display */}
              <div className="flex items-start gap-3 p-3 hover:bg-surface-alt/40 rounded-2xl border border-border/40 transition-colors">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider">মোবাইল নম্বর</span>
                  <span className="text-sm font-bold text-text-primary mt-0.5 block">
                    {profile.phone ? toBengaliNumerals(profile.phone) : '—'}
                  </span>
                </div>
              </div>

              {/* Email Display */}
              <div className="flex items-start gap-3 p-3 hover:bg-surface-alt/40 rounded-2xl border border-border/40 transition-colors">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider">ইমেইল ঠিকানা</span>
                  <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">{email || '—'}</span>
                </div>
              </div>

              {/* Member Since Display */}
              <div className="flex items-start gap-3 p-3 hover:bg-surface-alt/40 rounded-2xl border border-border/40 transition-colors">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider">কোচিং এ ভর্তির তারিখ</span>
                  <span className="text-sm font-bold text-text-primary mt-0.5 block">
                    {formatBanglaDate(profile.created_at)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Academic & Batch Information */}
        <div className="bg-surface border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-text-primary">ব্যাচ ও ভর্তি তথ্য</h3>
              <p className="text-xs text-text-secondary mt-0.5">আপনার বর্তমান ভর্তিকৃত কোর্সের বিশদ বিবরণ।</p>
            </div>

            {profile.batch ? (
              <div className="space-y-4">
                {/* Batch Name */}
                <div className="flex items-center gap-3 p-3 bg-surface-alt/50 border border-border/50 rounded-2xl">
                  <div className="p-2 bg-primary-light text-primary rounded-xl">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider">ব্যাচের নাম</span>
                    <span className="text-sm font-black text-text-primary mt-0.5 block">{profile.batch.name}</span>
                  </div>
                </div>

                {/* Monthly Fee */}
                <div className="flex items-center gap-3 p-3 bg-surface-alt/50 border border-border/50 rounded-2xl">
                  <div className="p-2 bg-pink-50 text-pink-600 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider">মাসিক বেতন</span>
                    <span className="text-sm font-bold text-text-primary mt-0.5 block">
                      ৳{toBengaliNumerals(profile.batch.fee)}
                    </span>
                  </div>
                </div>

                {/* Batch Capacity */}
                <div className="flex items-center gap-3 p-3 bg-surface-alt/50 border border-border/50 rounded-2xl">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider">আসন সংখ্যা</span>
                    <span className="text-sm font-bold text-text-primary mt-0.5 block">
                      {toBengaliNumerals(profile.batch.capacity)} জন
                    </span>
                  </div>
                </div>

                {/* Batch Start Date */}
                {profile.batch.start_date && (
                  <div className="flex items-center gap-3 p-3 bg-surface-alt/50 border border-border/50 rounded-2xl">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider">ব্যাচ শুরুর তারিখ</span>
                      <span className="text-sm font-bold text-text-primary mt-0.5 block">
                        {formatBanglaDate(profile.batch.start_date)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-border rounded-2xl bg-surface-alt/20 space-y-3">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-bold text-text-primary block">ব্যাচ অ্যাসাইন করা নেই</span>
                  <span className="text-xs text-text-muted max-w-[200px] block leading-relaxed">
                    আপনাকে এখনো কোনো ব্যাচে যুক্ত করা হয়নি। অনুগ্রহ করে শিক্ষকের সাথে যোগাযোগ করুন।
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Active status indicator bottom */}
          {profile.batch && (
            <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-xs font-bold ${
              profile.batch.is_active 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-error/5 text-error border-error/10'
            }`}>
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 animate-none" />
                <span>ভর্তির স্ট্যাটাস</span>
              </span>
              <span className="flex items-center gap-1 bg-white border px-2 py-0.5 rounded-full shadow-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${profile.batch.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-error'}`} />
                {profile.batch.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
