import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CheckSquare, Calendar, Smile, Frown, Watch, BarChart2, Info } from 'lucide-react';
import AttendanceFilter from '@/components/dashboard/AttendanceFilter';

interface AttendanceRecord {
  id: string;
  routine_id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  routines: {
    day_of_week: string;
    subject: string;
    start_time: string;
  } | null;
}

const statusDisplay = {
  present: { label: 'উপস্থিত ✓', color: 'text-primary bg-primary-light/50 border-primary/20' },
  absent:  { label: 'অনুপস্থিত ✗', color: 'text-error bg-error/10 border-error/20' },
  late:    { label: 'দেরি হয়েছে', color: 'text-accent bg-accent-light/50 border-accent/20' },
};

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

// Formats date string into Bangla format (e.g. "2026-06-10" -> "১০ জুন ২০২৬")
function formatBanglaDate(dateStr: string | null | undefined) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getLast6MonthsOptions() {
  const options = [];
  const today = new Date();
  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  
  for (let i = 0; i < 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = d.toISOString().slice(0, 7); // "YYYY-MM"
    const monthBn = monthNamesBn[d.getMonth()];
    const yearBn = toBengaliNumerals(d.getFullYear());
    options.push({
      value,
      label: `${monthBn} ${yearBn}`
    });
  }
  return options;
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get dynamic ?month search parameter (defaults to current month)
  const resolvedSearchParams = await searchParams;
  const monthParam = resolvedSearchParams.month ?? new Date().toISOString().slice(0, 7); // "YYYY-MM"

  // Calculate boundary for next month to perform LT date comparison safely
  const [yearStr, monthStr] = monthParam.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  const nextMonthParam = `${nextYear}-${nextMonth.toString().padStart(2, '0')}`;

  // Query attendance records for the month
  const { data: recordsData } = await supabase
    .from('attendance')
    .select('*, routines(day_of_week, subject, start_time)')
    .eq('student_id', user.id)
    .gte('date', `${monthParam}-01`)
    .lt('date', `${nextMonthParam}-01`)
    .order('date', { ascending: false });

  const records = (recordsData as unknown as AttendanceRecord[]) || [];

  // Summary counts
  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const lateCount = records.filter((r) => r.status === 'late').length;
  const totalClasses = records.length;

  // Attendance rate (present + late count divided by total)
  const attendanceRate = totalClasses > 0 
    ? Math.round(((presentCount + lateCount) / totalClasses) * 100) 
    : 0;

  // Determine progress bar color
  let progressColor = 'bg-primary-mid';
  if (attendanceRate < 50) {
    progressColor = 'bg-error';
  } else if (attendanceRate < 75) {
    progressColor = 'bg-accent';
  }

  const monthOptions = getLast6MonthsOptions();

  return (
    <div className="space-y-8 font-ui max-w-4xl mx-auto pb-12">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <CheckSquare className="w-7 h-7 text-primary" />
            <span>উপস্থিতির রেকর্ড</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            আপনার ক্লাসে অংশগ্রহণের ইতিহাস ও উপস্থিতি হার পর্যবেক্ষণ করুন।
          </p>
        </div>
        <AttendanceFilter currentMonth={monthParam} options={monthOptions} />
      </div>

      {/* Empty State */}
      {records.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center text-text-muted shadow-sm">
          এই মাসে কোনো উপস্থিতি রেকর্ড নেই।
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Present Card */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm text-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-light text-primary mb-2">
                <Smile className="w-4 h-4" />
              </span>
              <span className="text-text-muted block text-xs font-medium">উপস্থিত</span>
              <span className="text-lg sm:text-xl font-bold text-text-primary mt-1 block">
                {toBengaliNumerals(presentCount)} দিন
              </span>
            </div>

            {/* Absent Card */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm text-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-error/10 text-error mb-2">
                <Frown className="w-4 h-4" />
              </span>
              <span className="text-text-muted block text-xs font-medium">অনুপস্থিত</span>
              <span className="text-lg sm:text-xl font-bold text-text-primary mt-1 block">
                {toBengaliNumerals(absentCount)} দিন
              </span>
            </div>

            {/* Late Card */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm text-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent-light text-accent mb-2">
                <Watch className="w-4 h-4" />
              </span>
              <span className="text-text-muted block text-xs font-medium">বিলম্বিত</span>
              <span className="text-lg sm:text-xl font-bold text-text-primary mt-1 block">
                {toBengaliNumerals(lateCount)} দিন
              </span>
            </div>
          </div>

          {/* Attendance Rate Progress Card */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                <span className="text-text-secondary text-xs">উপস্থিতির হার:</span>
              </div>
              <span className="text-text-primary font-bold text-base">{toBengaliNumerals(attendanceRate)}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-surface-alt rounded-full h-3 overflow-hidden border border-border/30">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </div>

          {/* Attendance Logs Table */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted uppercase font-medium bg-surface-alt/40">
                    <th className="px-6 py-4">তারিখ</th>
                    <th className="px-6 py-4">বিষয়</th>
                    <th className="px-6 py-4">সময়</th>
                    <th className="px-6 py-4 text-right">অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {records.map((r) => {
                    const status = statusDisplay[r.status] || { label: r.status, color: 'text-text-primary' };

                    return (
                      <tr key={r.id} className="hover:bg-surface-alt/30 transition-colors">
                        {/* Date */}
                        <td className="px-6 py-4 text-text-primary font-medium">
                          {formatBanglaDate(r.date)}
                        </td>

                        {/* Subject */}
                        <td className="px-6 py-4 text-text-primary">
                          {r.routines?.subject || '—'}
                        </td>

                        {/* Time */}
                        <td className="px-6 py-4 text-text-secondary text-xs">
                          {r.routines?.start_time ? formatBanglaTime(r.routines.start_time) : '—'}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Policy Callout */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex gap-3 text-xs text-text-secondary">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          কোচিং সেন্টারের নীতি অনুযায়ী ক্লাসে অন্তত **৭৫% উপস্থিতি** থাকা বাধ্যতামূলক। উপস্থিতি এর নিচে নামলে পরীক্ষার যোগ্যতা এবং সুবিধা ব্যাহত হতে পারে।
        </p>
      </div>
    </div>
  );
}
