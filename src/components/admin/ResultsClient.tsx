'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ClipboardList, 
  Check, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { toBengaliNumerals, formatBanglaDate } from '@/lib/bangla';

interface Exam {
  id: string;
  title: string;
  exam_date: string;
  total_marks: number;
  batch_id: string;
  batch_name: string;
}

interface Student {
  student_id: string;
  full_name: string;
  phone: string | null;
}

interface ResultRecord {
  student_id: string;
  marks_obtained: number;
  remarks: string | null;
  grade: string | null;
}

interface ResultsClientProps {
  exams: Exam[];
  selectedExam: Exam;
  enrolledStudents: Student[];
  initialResults: ResultRecord[];
}

const gradeColor: Record<string, string> = {
  'A+': 'bg-green-50 text-green-700 border-green-200',
  'A':  'bg-green-50 text-green-700 border-green-200',
  'A-': 'bg-blue-50 text-blue-700 border-blue-200',
  'B':  'bg-yellow-50 text-yellow-700 border-yellow-200',
  'C':  'bg-orange-50 text-orange-700 border-orange-200',
  'D':  'bg-red-50 text-red-700 border-red-200',
  'F':  'bg-red-100 text-red-900 border-red-300',
};

function calcGrade(marks: number, total: number): string {
  if (total <= 0) return 'F';
  const pct = (marks / total) * 100;
  if (pct >= 80) return 'A+';
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'A-';
  if (pct >= 50) return 'B';
  if (pct >= 40) return 'C';
  if (pct >= 33) return 'D';
  return 'F';
}

export default function ResultsClient({
  exams,
  selectedExam,
  enrolledStudents,
  initialResults,
}: ResultsClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [marksMap, setMarksMap] = useState<Record<string, string>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state with incoming props (e.g. when changing the selected exam)
  useEffect(() => {
    const initialMarks: Record<string, string> = {};
    const initialRemarks: Record<string, string> = {};

    enrolledStudents.forEach((student) => {
      const result = initialResults.find((r) => r.student_id === student.student_id);
      if (result) {
        initialMarks[student.student_id] = result.marks_obtained.toString();
        initialRemarks[student.student_id] = result.remarks || '';
      } else {
        initialMarks[student.student_id] = '';
        initialRemarks[student.student_id] = '';
      }
    });

    setMarksMap(initialMarks);
    setRemarksMap(initialRemarks);
    setSuccessMessage(null);
    setErrorMessage(null);
  }, [selectedExam, enrolledStudents, initialResults]);

  const handleExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/admin/results?exam_id=${e.target.value}`);
  };

  const handleMarksChange = (studentId: string, value: string) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleRemarksChange = (studentId: string, value: string) => {
    setRemarksMap((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSaveResults = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Validation & Payload Preparation
    const recordsToUpsert: any[] = [];
    const studentIdsToDelete: string[] = [];
    let validationFailed = false;

    enrolledStudents.forEach((student) => {
      const markStr = marksMap[student.student_id];
      const hasPreviousResult = initialResults.some(r => r.student_id === student.student_id);

      if (markStr !== undefined && markStr.trim() !== '') {
        const marks = Number(markStr);
        
        // Check range limits
        if (isNaN(marks) || marks < 0 || marks > selectedExam.total_marks) {
          validationFailed = true;
        } else {
          recordsToUpsert.push({
            exam_id: selectedExam.id,
            student_id: student.student_id,
            marks_obtained: marks,
            remarks: remarksMap[student.student_id]?.trim() || null,
          });
        }
      } else if (hasPreviousResult) {
        // Marks cleared, and we had a previous result -> Delete
        studentIdsToDelete.push(student.student_id);
      }
    });

    if (validationFailed) {
      setErrorMessage(`প্রাপ্ত নম্বর অবশ্যই ০ থেকে ${toBengaliNumerals(selectedExam.total_marks)} এর মধ্যে হতে হবে।`);
      return;
    }

    if (recordsToUpsert.length === 0 && studentIdsToDelete.length === 0) {
      setErrorMessage('সংরক্ষণ করার জন্য কোনো পরিবর্তন করা হয়নি।');
      return;
    }

    // 2. Database Save (Upsert + Delete)
    setSaving(true);
    try {
      if (recordsToUpsert.length > 0) {
        const { error: upsertError } = await supabase
          .from('results')
          .upsert(recordsToUpsert, {
            onConflict: 'exam_id,student_id',
          });
        if (upsertError) throw upsertError;
      }

      if (studentIdsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('results')
          .delete()
          .eq('exam_id', selectedExam.id)
          .in('student_id', studentIdsToDelete);
        if (deleteError) throw deleteError;
      }

      setSuccessMessage(`ফলাফল সফলভাবে সংরক্ষণ করা হয়েছে ✓`);
      router.refresh();
      
      // Auto-clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Error saving results:', err);
      setErrorMessage(err.message || 'ফলাফল সংরক্ষণ করার সময় একটি ত্রুটি ঘটেছে।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector Card */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">শ্রেণীভিত্তিক পরীক্ষার ফলাফল এন্ট্রি</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            পরীক্ষা নির্বাচন করে প্রাপ্ত নম্বরের তথ্য বসান। এডিট বা সংশোধন করতে একই শিটে নম্বর পরিবর্তন করে সেভ করুন।
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-text-secondary shrink-0">পরীক্ষা নির্বাচন:</label>
          <select
            value={selectedExam.id}
            onChange={handleExamChange}
            className="px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition outline-none text-sm font-semibold text-text-primary bg-surface min-w-[240px]"
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} ({exam.batch_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Form Sheet */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden space-y-4">
        {/* Subheader */}
        <div className="bg-surface-alt border-b border-border px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-text-primary text-base">
              {selectedExam.title} (মোট নম্বর: {toBengaliNumerals(selectedExam.total_marks)})
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              ব্যাচ: {selectedExam.batch_name} | তারিখ: {formatBanglaDate(selectedExam.exam_date)}
            </p>
          </div>
          <div className="text-xs text-text-muted italic flex items-center gap-1.5 self-start sm:self-center">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>নম্বর ঘর খালি রাখলে তা ডাটাবেজে সেভ হবে না।</span>
          </div>
        </div>

        {/* Status Alerts */}
        {successMessage && (
          <div className="mx-6 bg-primary-light/50 border border-primary/20 text-primary rounded-xl p-3.5 flex items-center gap-2.5 text-sm animate-in fade-in duration-200">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mx-6 bg-error/10 border border-error/20 text-error rounded-xl p-3.5 flex items-start gap-2.5 text-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Marksheet Form */}
        {enrolledStudents.length === 0 ? (
          <div className="p-12 text-center text-text-secondary flex flex-col items-center gap-2">
            <AlertCircle className="w-10 h-10 text-text-muted/65" />
            <p className="font-bold text-text-primary text-base">এই ব্যাচে কোনো সক্রিয় শিক্ষার্থী নেই</p>
            <p className="text-xs">ফলাফল ইনপুট দিতে হলে শিক্ষার্থীদের এই ব্যাচে অন্তর্ভুক্ত করতে হবে।</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs font-bold text-text-secondary bg-surface-alt/40 uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold w-[300px]">শিক্ষার্থীর নাম</th>
                    <th className="px-6 py-4 font-semibold text-center w-[160px]">প্রাপ্ত নম্বর</th>
                    <th className="px-6 py-4 font-semibold text-center w-[120px]">গ্রেড</th>
                    <th className="px-6 py-4 font-semibold">শিক্ষক মন্তব্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {enrolledStudents.map((student) => {
                    const markVal = marksMap[student.student_id] || '';
                    const remarkVal = remarksMap[student.student_id] || '';
                    const markNum = Number(markVal);
                    
                    // Validation ranges
                    const isExceeded = markVal !== '' && (isNaN(markNum) || markNum < 0 || markNum > selectedExam.total_marks);
                    
                    // Grade calculation
                    const computedGrade = markVal !== '' && !isExceeded ? calcGrade(markNum, selectedExam.total_marks) : '—';

                    // Check if result already exists in database (to show badge indicator)
                    const alreadyHasResult = initialResults.some(r => r.student_id === student.student_id);

                    return (
                      <tr key={student.student_id} className="hover:bg-surface-alt/25 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-2">
                          <div>
                            <span className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                              {student.full_name}
                              {alreadyHasResult && (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold" title="ফলাফল এন্ট্রি করা আছে">
                                  ✓
                                </span>
                              )}
                            </span>
                            {student.phone && (
                              <span className="text-xs text-text-muted mt-0.5 block">
                                {toBengaliNumerals(student.phone)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <input
                              type="number"
                              step="any"
                              value={markVal}
                              onChange={(e) => handleMarksChange(student.student_id, e.target.value)}
                              placeholder="যেমন: ৮০"
                              className={`w-28 px-3 py-1.5 rounded-lg border text-center font-bold text-sm outline-none transition focus:ring-2 ${
                                isExceeded
                                  ? 'border-error focus:border-error focus:ring-error/15 text-error bg-error/5'
                                  : 'border-border focus:border-primary focus:ring-primary/10 text-text-primary bg-surface'
                              }`}
                              min="0"
                              max={selectedExam.total_marks}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {computedGrade !== '—' ? (
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${gradeColor[computedGrade] || 'bg-surface-alt text-text-secondary border-border'}`}>
                              {computedGrade}
                            </span>
                          ) : (
                            <span className="text-text-muted font-bold">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={remarkVal}
                            onChange={(e) => handleRemarksChange(student.student_id, e.target.value)}
                            placeholder="যেমন: চমৎকার পরীক্ষা হয়েছে"
                            className="w-full px-3 py-1.5 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary bg-surface"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Save Row */}
            <div className="px-6 py-4 border-t border-border bg-surface-alt/25 flex items-center justify-end">
              <button
                onClick={handleSaveResults}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>সংরক্ষণ করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>সকলের ফলাফল সংরক্ষণ করুন</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
