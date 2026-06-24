import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClipboardList, Calendar, CheckSquare, Clock, HelpCircle, Trophy } from 'lucide-react';

const typeBn: Record<string, string> = {
  mcq: 'MCQ পরীক্ষা',
  written: 'লিখিত পরীক্ষা',
  mock: 'মক টেস্ট'
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

export default async function ExamsPage() {
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
          <ClipboardList className="w-7 h-7 text-primary" />
          <span>পরীক্ষার সময়সূচী ও তথ্য</span>
        </h1>
        <div className="bg-surface border border-border rounded-2xl p-8 text-center text-text-muted shadow-sm">
          আপনি কোনো সক্রিয় ব্যাচে ভর্তি হননি।
        </div>
      </div>
    );
  }

  // Get exams for their batch
  const { data: examsData } = await supabase
    .from('exams')
    .select('*, results(marks_obtained, grade)')
    .eq('batch_id', profile.batch_id)
    .order('exam_date', { ascending: false });

  const exams = examsData || [];

  // Categorize exams into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingExams: typeof exams = [];
  const pastExams: typeof exams = [];

  exams.forEach((exam) => {
    const examDate = new Date(exam.exam_date);
    examDate.setHours(0, 0, 0, 0);

    if (examDate >= today) {
      upcomingExams.push(exam);
    } else {
      pastExams.push(exam);
    }
  });

  // Sort upcoming exams so the closest one is first
  upcomingExams.sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());

  return (
    <div className="space-y-8 font-ui max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-primary" />
          <span>পরীক্ষার সময়সূচী ও তথ্য</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          আপনার ব্যাচের আগামী পরীক্ষা ও পূর্ববর্তী পরীক্ষার ফলাফল পর্যালোচনা করুন।
        </p>
      </div>

      {/* Section 1: Upcoming Exams */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          <span>আসন্ন পরীক্ষা</span>
        </h2>

        {upcomingExams.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-6 text-center text-text-muted shadow-sm text-sm">
            আপাতত কোনো আসন্ন পরীক্ষা নির্ধারিত নেই।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingExams.map((exam) => {
              const examDate = new Date(exam.exam_date);
              examDate.setHours(0, 0, 0, 0);
              const diffTime = examDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              let countdownText = 'আজ পরীক্ষা';
              if (diffDays === 1) {
                countdownText = 'আগামীকাল';
              } else if (diffDays > 1) {
                countdownText = `আর ${toBengaliNumerals(diffDays)} দিন বাকি`;
              }

              return (
                <div key={exam.id} className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-primary-mid/40 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        exam.type === 'mcq' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        exam.type === 'written' ? 'bg-teal-50 text-teal-600 border border-teal-100' :
                        'bg-orange-50 text-orange-600 border border-orange-100'
                      }`}>
                        {typeBn[exam.type] || exam.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent bg-accent-light px-2.5 py-0.5 rounded-full border border-accent/10">
                        {countdownText}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-text-primary text-base">
                      {exam.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-xs text-text-secondary pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-text-muted" />
                        <span>{formatBanglaDate(exam.exam_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-text-muted" />
                        <span>মোট নম্বর: {toBengaliNumerals(exam.total_marks)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Past Exams */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          <span>গত পরীক্ষা ও ফলাফল</span>
        </h2>

        {pastExams.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center text-text-muted shadow-sm text-sm">
            পূর্বে নেওয়া কোনো পরীক্ষার রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted uppercase font-medium bg-surface-alt/40">
                    <th className="px-6 py-4">পরীক্ষার নাম</th>
                    <th className="px-6 py-4">তারিখ</th>
                    <th className="px-6 py-4">ধরন</th>
                    <th className="px-6 py-4">মোট নম্বর</th>
                    <th className="px-6 py-4">প্রাপ্ত নম্বর</th>
                    <th className="px-6 py-4 text-right">গ্রেড</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pastExams.map((exam) => {
                    const result = exam.results && exam.results.length > 0 ? exam.results[0] : null;
                    const marksObtained = result ? Number(result.marks_obtained) : null;
                    const grade = result ? result.grade : null;

                    return (
                      <tr key={exam.id} className="hover:bg-surface-alt/30 transition-colors">
                        {/* Title */}
                        <td className="px-6 py-4 text-text-primary font-medium">
                          {exam.title}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-text-secondary text-xs">
                          {formatBanglaDate(exam.exam_date)}
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4 text-text-secondary text-xs">
                          {typeBn[exam.type] || exam.type}
                        </td>

                        {/* Total Marks */}
                        <td className="px-6 py-4 text-text-secondary font-medium">
                          {toBengaliNumerals(exam.total_marks)}
                        </td>

                        {/* Marks Obtained */}
                        <td className="px-6 py-4 font-semibold">
                          {marksObtained !== null ? (
                            <span className="text-primary">{toBengaliNumerals(marksObtained)}</span>
                          ) : (
                            <span className="text-text-muted font-normal">—</span>
                          )}
                        </td>

                        {/* Grade */}
                        <td className="px-6 py-4 text-right">
                          {grade ? (
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                              grade === 'A+' || grade === 'A' ? 'bg-green-50 text-green-600 border border-green-100' :
                              grade === 'B' || grade === 'C' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                              'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {grade}
                            </span>
                          ) : (
                            <span className="text-text-muted mr-3">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
