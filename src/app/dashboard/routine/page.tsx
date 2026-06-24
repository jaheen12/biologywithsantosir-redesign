import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Video, MapPin, ExternalLink, Info } from 'lucide-react';

const dayBn: Record<string, string> = {
  Saturday: 'শনিবার', 
  Sunday: 'রবিবার', 
  Monday: 'সোমবার',
  Tuesday: 'মঙ্গলবার', 
  Wednesday: 'বুধবার', 
  Thursday: 'বৃহস্পতিবার', 
  Friday: 'শুক্রবার'
};

const weekdayOrder = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Formats Postgres time e.g. "16:00:00" -> "বিকাল ৪:০০"
function formatBanglaTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '—';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  const minute = parts[1];
  
  let period = 'সকাল';
  if (hour >= 12 && hour < 16) {
    period = 'দুপুর';
  } else if (hour >= 16 && hour < 18) {
    period = 'বিকাল';
  } else if (hour >= 18 && hour < 20) {
    period = 'সন্ধ্যা';
  } else if (hour >= 20 || hour < 5) {
    period = 'রাত';
  }
  
  if (hour > 12) hour = hour - 12;
  if (hour === 0) hour = 12;
  
  const banglaDigits: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  
  const banglaHour = hour.toString().replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
  const banglaMinute = minute.replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
  
  return `${period} ${banglaHour}:${banglaMinute}`;
}

export default async function RoutinePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get student's batch_id from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('batch_id')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.batch_id) {
    return (
      <div className="space-y-6 font-ui max-w-5xl mx-auto pb-12">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <Calendar className="w-7 h-7 text-primary" />
          <span>সাপ্তাহিক ক্লাস রুটিন</span>
        </h1>
        <div className="bg-surface border border-border rounded-2xl p-8 text-center text-text-muted shadow-sm">
          আপনি কোনো সক্রিয় ব্যাচে ভর্তি হননি।
        </div>
      </div>
    );
  }

  // Get routines for their batch
  const { data: routines } = await supabase
    .from('routines')
    .select('*')
    .eq('batch_id', profile.batch_id);

  // Sort routines chronologically by Bangladesh day order (Sat -> Fri)
  const sortedRoutines = (routines ?? []).sort((a, b) => {
    const indexA = weekdayOrder.indexOf(a.day_of_week);
    const indexB = weekdayOrder.indexOf(b.day_of_week);
    return indexA - indexB;
  });

  // Get today's long name in English (e.g., "Monday")
  const todayEnglish = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="space-y-8 font-ui max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <Calendar className="w-7 h-7 text-primary" />
          <span>সাপ্তাহিক ক্লাস রুটিন</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          আপনার ব্যাচের নির্ধারিত সাপ্তাহিক ক্লাস রুটিন ও জয়েন লিংক।
        </p>
      </div>

      {/* Routine list */}
      {!sortedRoutines || sortedRoutines.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center text-text-muted shadow-sm">
          এই ব্যাচের জন্য কোনো রুটিন তৈরি হয়নি।
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <table className="w-full text-left border-collapse text-sm min-w-[650px]">
              <thead>
                <tr className="border-b border-border text-xs text-text-muted uppercase font-medium bg-surface-alt/40">
                  <th className="px-6 py-4">দিন</th>
                  <th className="px-6 py-4">বিষয়</th>
                  <th className="px-6 py-4">সময়</th>
                  <th className="px-6 py-4">প্ল্যাটফর্ম</th>
                  <th className="px-6 py-4 text-right">ক্লাস লিংক</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedRoutines.map((routine) => {
                  const isToday = routine.day_of_week === todayEnglish;
                  const displayDay = dayBn[routine.day_of_week] || routine.day_of_week;

                  return (
                    <tr
                      key={routine.id}
                      className={`transition-colors ${
                        isToday
                          ? 'bg-primary-light/50 hover:bg-primary-light/70 font-semibold'
                          : 'hover:bg-surface-alt/30'
                      }`}
                    >
                      {/* Day Column */}
                      <td className="px-6 py-5 text-text-primary">
                        <div className="flex items-center gap-2">
                          <span>{displayDay}</span>
                          {isToday && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                              আজ
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Subject Column */}
                      <td className="px-6 py-5 text-text-primary font-medium">
                        {routine.subject || '—'}
                      </td>

                      {/* Time Column */}
                      <td className="px-6 py-5 text-text-secondary text-xs sm:text-sm">
                        {formatBanglaTime(routine.start_time)} – {formatBanglaTime(routine.end_time)}
                      </td>

                      {/* Platform Column */}
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          routine.platform === 'Zoom' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          routine.platform === 'Google Meet' ? 'bg-teal-50 text-teal-600 border border-teal-100' :
                          'bg-stone-50 text-stone-600 border border-stone-100'
                        }`}>
                          {routine.platform === 'Physical' ? (
                            <>
                              <MapPin className="w-3.5 h-3.5" />
                              সরাসরি (অফলাইন)
                            </>
                          ) : (
                            <>
                              <Video className="w-3.5 h-3.5" />
                              {routine.platform} (অনলাইন)
                            </>
                          )}
                        </span>
                      </td>

                      {/* Join Link Column */}
                      <td className="px-6 py-5 text-right">
                        {routine.platform !== 'Physical' && routine.link ? (
                          <Link
                            href={routine.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-dark transition-colors cursor-pointer"
                          >
                            <span>জয়েন করুন</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-text-muted text-xs mr-4">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Mobile scroll hint */}
            <p className="text-xs text-text-muted text-right md:hidden mt-1">&#8592; স্ক্রোল করুন &#8594;</p>
          </div>
        </div>
      )}

      {/* Info Callout */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex gap-3 text-xs text-text-secondary">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          অনলাইন ক্লাস সাধারণত নির্ধারিত সময়ের ৫ মিনিট পূর্বে শুরু হয়। লিংকে কোনো সমস্যা হলে আপনার এডমিনের সাথে যোগাযোগ করুন।
        </p>
      </div>
    </div>
  );
}
