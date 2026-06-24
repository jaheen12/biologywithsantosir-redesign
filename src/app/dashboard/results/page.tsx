import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Award, Calendar, BookOpen, BarChart2, Star, User, Trophy } from 'lucide-react';
import { toBengaliNumerals, formatBanglaDate } from '@/lib/bangla';

interface ExamDetails {
  id: string;
  title: string;
  exam_date: string;
  total_marks: number | string;
  batch_id: string;
}

interface ResultRecord {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number | string;
  grade: string | null;
  remarks: string | null;
  created_at: string;
  exams: ExamDetails | null;
}

interface ExamStats {
  class_avg: number;
  student_rank: number;
  total_appeared: number;
}

const gradeColor: Record<string, string> = {
  'A+': 'bg-green-50 text-green-700 border-green-100',
  'A':  'bg-green-50 text-green-700 border-green-100',
  'A-': 'bg-blue-50 text-blue-700 border-blue-100',
  'B':  'bg-yellow-50 text-yellow-700 border-yellow-100',
  'C':  'bg-orange-50 text-orange-700 border-orange-100',
  'D':  'bg-red-50 text-red-700 border-red-100',
  'F':  'bg-red-100 text-red-900 border-red-200',
};

export default async function ResultsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Query all results for student
  const { data: resultsData } = await supabase
    .from('results')
    .select('*, exams(id, title, exam_date, total_marks, batch_id)')
    .eq('student_id', user.id);

  const rawResults = (resultsData as unknown as ResultRecord[]) || [];

  // Sort by exam_date descending
  const results = rawResults.sort((a, b) => {
    const dateA = a.exams?.exam_date ? new Date(a.exams.exam_date).getTime() : 0;
    const dateB = b.exams?.exam_date ? new Date(b.exams.exam_date).getTime() : 0;
    return dateB - dateA;
  });

  // Fetch all stats at once using the new bulk RPC to avoid N+1 queries
  const { data: allStats } = await supabase
    .rpc('get_all_exam_stats_for_student', { p_student_id: user.id });

  const statsMap = new Map(
    (allStats as any[])?.map((s) => [s.exam_id, s]) || []
  );

  const resultsWithStats = results.map((r) => {
    const stats = statsMap.get(r.exam_id) || { class_avg: 0, student_rank: 0, total_appeared: 0 };
    return {
      ...r,
      stats
    };
  });

  return (
    <div className="space-y-8 font-ui max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <Award className="w-7 h-7 text-primary" />
          <span>পরীক্ষার ফলাফল</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          আপনার নেওয়া পরীক্ষার ফলাফল, ক্লাস গড় এবং র‍্যাংকিং পর্যবেক্ষণ করুন।
        </p>
      </div>

      {/* Results List */}
      {resultsWithStats.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center text-text-muted shadow-sm text-sm">
          এখনো কোনো পরীক্ষার ফলাফল প্রকাশিত হয়নি।
        </div>
      ) : (
        <div className="space-y-6">
          {resultsWithStats.map((r) => {
            const marks = Number(r.marks_obtained);
            const total = Number(r.exams?.total_marks || 100);
            const percentage = total > 0 ? Math.round((marks / total) * 100) : 0;
            const grade = r.grade || '—';

            // Determine progress bar color based on grade
            let progressColor = 'bg-primary';
            if (grade.startsWith('A')) {
              progressColor = 'bg-primary-mid';
            } else if (grade.startsWith('B') || grade.startsWith('C')) {
              progressColor = 'bg-accent';
            } else if (grade.startsWith('D') || grade.startsWith('F')) {
              progressColor = 'bg-error';
            }

            return (
              <div key={r.id} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:border-primary-mid/30 transition-all duration-200">
                {/* Header Banner */}
                <div className="px-6 py-4 bg-surface-alt border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>{r.exams?.title || 'পরীক্ষা'}</span>
                  </h3>
                  <span className="text-xs text-text-secondary flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                    {formatBanglaDate(r.exams?.exam_date)}
                  </span>
                </div>

                {/* Score Stats Grid */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center divide-x divide-border">
                    {/* Marks Obtained */}
                    <div>
                      <span className="text-text-muted block text-xs mb-1">প্রাপ্ত নম্বর</span>
                      <span className="text-lg font-bold text-text-primary">
                        {toBengaliNumerals(marks)} <span className="text-xs text-text-secondary font-normal">/ {toBengaliNumerals(total)}</span>
                      </span>
                    </div>

                    {/* Class Average */}
                    <div>
                      <span className="text-text-muted block text-xs mb-1">শ্রেণী গড়</span>
                      <span className="text-lg font-bold text-text-primary">
                        {toBengaliNumerals(Number(r.stats.class_avg || 0).toFixed(1))}
                      </span>
                    </div>

                    {/* Class Rank */}
                    <div>
                      <span className="text-text-muted block text-xs mb-1">শ্রেণীতে পজিশন</span>
                      <span className="text-lg font-bold text-text-primary flex items-center justify-center gap-1">
                        <Trophy className="w-4 h-4 text-accent shrink-0" />
                        <span>
                          {r.stats.student_rank > 0 ? toBengaliNumerals(r.stats.student_rank) : '—'}{' '}
                          <span className="text-xs text-text-secondary font-normal">
                            / {toBengaliNumerals(r.stats.total_appeared)}
                          </span>
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Progress and Grade Section */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-xs">পারফরম্যান্স:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${gradeColor[grade] || 'bg-stone-50 text-stone-600 border-stone-100'}`}>
                          গ্রেড: {grade}
                        </span>
                      </div>
                      <span className="text-text-primary text-xs font-mono">{toBengaliNumerals(percentage)}%</span>
                    </div>

                    {/* Custom progress bar */}
                    <div className="w-full bg-surface-alt rounded-full h-3.5 overflow-hidden border border-border/40">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Teacher's Remarks */}
                  {r.remarks && (
                    <div className="p-4 bg-surface-alt/40 border border-border rounded-xl text-sm flex gap-3">
                      <Star className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-text-muted block font-medium mb-0.5">শিক্ষকের মন্তব্য</span>
                        <span className="text-text-secondary">{r.remarks}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
