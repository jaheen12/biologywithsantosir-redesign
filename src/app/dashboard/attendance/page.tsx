import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  CheckSquare,
  Smile,
  Frown,
  BarChart2,
  ClipboardList,
  Info,
} from 'lucide-react';
import { toBengaliNumerals, formatBanglaDate } from '@/lib/bangla';

/* ─────────────── Types ─────────────── */
interface Exam {
  id: string;
  title: string;
  exam_date: string;
  type: string;
  total_marks: number;
  status: 'present' | 'absent';
}

/* ─────────────── Helpers ─────────────── */
const examTypeBn: Record<string, string> = {
  written: 'লিখিত',
  mcq: 'MCQ',
  mock: 'মক টেস্ট',
};

/* ─────────────── Page ─────────────── */
export default async function AttendancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  /* ── Get student's batch ── */
  const { data: profile } = await supabase
    .from('profiles')
    .select('batch_id')
    .eq('id', user.id)
    .single();

  /* ── No batch enrolled ── */
  if (!profile?.batch_id) {
    return (
      <div className="space-y-6 font-ui max-w-4xl mx-auto pb-12">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <CheckSquare className="w-7 h-7 text-primary" />
            <span>পরীক্ষার উপস্থিতি</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            পরীক্ষায় অংশগ্রহণের ইতিহাস ও উপস্থিতি হার পর্যবেক্ষণ করুন।
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-10 text-center text-text-muted shadow-sm">
          আপনি কোনো সক্রিয় ব্যাচে ভর্তি হননি।
        </div>
      </div>
    );
  }

  /* ── Fetch all exams for the batch ── */
  const { data: examsRaw } = await supabase
    .from('exams')
    .select('id, title, exam_date, type, total_marks')
    .eq('batch_id', profile.batch_id)
    .order('exam_date', { ascending: false });

  const examsBase = examsRaw || [];

  /* ── Fetch student's results (= presence) ── */
  let attendedExamIds = new Set<string>();

  if (examsBase.length > 0) {
    const examIds = examsBase.map((e) => e.id);
    const { data: resultsData } = await supabase
      .from('results')
      .select('exam_id')
      .eq('student_id', user.id)
      .in('exam_id', examIds);

    attendedExamIds = new Set((resultsData || []).map((r) => r.exam_id));
  }

  /* ── Build attendance records ── */
  const exams: Exam[] = examsBase.map((exam) => ({
    ...exam,
    status: attendedExamIds.has(exam.id) ? 'present' : 'absent',
  }));

  /* ── Summary counts ── */
  const presentCount = exams.filter((e) => e.status === 'present').length;
  const absentCount = exams.filter((e) => e.status === 'absent').length;
  const totalExams = exams.length;
  const attendanceRate =
    totalExams > 0 ? Math.round((presentCount / totalExams) * 100) : 0;

  /* ── Progress bar colour ── */
  let progressColor = 'bg-primary-mid';
  if (attendanceRate < 50) progressColor = 'bg-error';
  else if (attendanceRate < 75) progressColor = 'bg-accent';

  /* ── Render ── */
  return (
    <div className="space-y-8 font-ui max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <CheckSquare className="w-7 h-7 text-primary" />
          <span>পরীক্ষার উপস্থিতি</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          পরীক্ষায় অংশগ্রহণের ইতিহাস ও উপস্থিতি হার পর্যবেক্ষণ করুন।
        </p>
      </div>

      {/* Empty state */}
      {totalExams === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center text-text-muted shadow-sm flex flex-col items-center gap-3">
          <ClipboardList className="w-10 h-10 text-text-muted/65" />
          <p className="font-bold text-text-primary text-base">এখনো কোনো পরীক্ষা নেওয়া হয়নি</p>
          <p className="text-xs">আপনার ব্যাচে পরীক্ষা যোগ হলে এখানে দেখা যাবে।</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Present */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm text-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-light text-primary mb-2">
                <Smile className="w-4 h-4" />
              </span>
              <span className="text-text-muted block text-xs font-medium">উপস্থিত</span>
              <span className="text-lg sm:text-xl font-bold text-text-primary mt-1 block">
                {toBengaliNumerals(presentCount)} টি
              </span>
            </div>

            {/* Absent */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm text-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-error/10 text-error mb-2">
                <Frown className="w-4 h-4" />
              </span>
              <span className="text-text-muted block text-xs font-medium">অনুপস্থিত</span>
              <span className="text-lg sm:text-xl font-bold text-text-primary mt-1 block">
                {toBengaliNumerals(absentCount)} টি
              </span>
            </div>

            {/* Total */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm text-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-alt text-text-secondary mb-2">
                <ClipboardList className="w-4 h-4" />
              </span>
              <span className="text-text-muted block text-xs font-medium">মোট পরীক্ষা</span>
              <span className="text-lg sm:text-xl font-bold text-text-primary mt-1 block">
                {toBengaliNumerals(totalExams)} টি
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
              <span className="text-text-primary font-bold text-base">
                {toBengaliNumerals(attendanceRate)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-surface-alt rounded-full h-3 overflow-hidden border border-border/30">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </div>

          {/* Exam Table */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              <table className="w-full text-left border-collapse text-sm min-w-[520px]">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted uppercase font-medium bg-surface-alt/40">
                    <th className="px-6 py-4">পরীক্ষার নাম</th>
                    <th className="px-6 py-4">তারিখ</th>
                    <th className="px-6 py-4">ধরন</th>
                    <th className="px-6 py-4 text-right">অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-surface-alt/30 transition-colors">
                      {/* Title */}
                      <td className="px-6 py-4 font-medium text-text-primary">
                        {exam.title}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-text-secondary text-xs">
                        {formatBanglaDate(exam.exam_date)}
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-alt border border-border text-text-secondary">
                          {examTypeBn[exam.type] || exam.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-right">
                        {exam.status === 'present' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border text-primary bg-primary-light/50 border-primary/20">
                            উপস্থিত ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border text-error bg-error/10 border-error/20">
                            অনুপস্থিত ✗
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mobile scroll hint */}
              <p className="text-xs text-text-muted text-right md:hidden mt-1 px-4 pb-2">
                &#8592; স্ক্রোল করুন &#8594;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Policy callout */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex gap-3 text-xs text-text-secondary">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          পরীক্ষার ফলাফল এন্ট্রির ভিত্তিতে উপস্থিতি নির্ধারণ করা হয়। কোনো পরীক্ষায় নম্বর এন্ট্রি থাকলে সেই পরীক্ষায় উপস্থিত গণনা করা হয়।
        </p>
      </div>
    </div>
  );
}
