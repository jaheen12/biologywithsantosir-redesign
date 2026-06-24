import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { User } from 'lucide-react';
import ProfileForm from '@/components/dashboard/ProfileForm';

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch student profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, full_name, phone, avatar_url, role, created_at')
    .eq('id', user.id)
    .single();

  const profile = profileData as unknown as Profile;

  if (!profile) {
    return (
      <div className="space-y-6 font-ui max-w-4xl mx-auto pb-12">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <User className="w-7 h-7 text-primary" />
          <span>প্রোফাইল সেটিংস</span>
        </h1>
        <div className="bg-surface border border-border rounded-2xl p-8 text-center text-text-muted shadow-sm">
          প্রোফাইল লোড করা সম্ভব হয়নি। আবার চেষ্টা করুন।
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-ui max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <User className="w-7 h-7 text-primary" />
          <span>প্রোফাইল সেটিংস</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          আপনার ব্যক্তিগত প্রোফাইল তথ্য দেখুন এবং আপডেট করুন।
        </p>
      </div>

      {/* Profile Form (Client Component) */}
      <ProfileForm profile={profile} email={user.email} />
    </div>
  );
}
