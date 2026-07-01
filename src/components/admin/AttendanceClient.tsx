'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ClipboardList,
  Loader2,
  AlertCircle,
  X as CloseIcon,
  CheckCircle2,
  XCircle,
  BookOpen,
  Users,
  Filter,
} from 'lucide-react';
import { toBengaliNumerals, formatBanglaDate } from '@/lib/bangla';

/* ─────────────── Types ─────────────── */
interface Batch {
  id: string;
  name: string;
}

interface Exam {
  id: string;
  title: string;
  exam_date: string;
  type: string;
  total_marks: number;
}

interface Student {
  id: string;
  full_name: string;
  phone: string | null;
}

interface ResultRecord {
  exam_id: string;
  student_id: string;
}

interface StudentSummary extends Student {
  present: number;
  absent: number;
  total: number;
  rate: number;
}

// Used when a specific exam is selected
interface ExamStudentRow extends Student {
  status: 'present' | 'absent';
}

type StatusFilter = 'all' | 'present' | 'absent';

interface AttendanceClientProps {
  batches: Batch[];
  adminId: string;
}

/* ─────────────── Helpers ─────────────── */
const examTypeBn: Record<string, string> = {
  written: 'লিখিত',
  mcq: 'MCQ',
  mock: 'মক টেস্ট',
};

function RateBadge({ rate }: { rate: number }) {
  let cls = 'text-primary';
  if (rate < 50) cls = 'text-error';
  else if (rate < 75) cls = 'text-accent';
  return <span className={`font-bold text-xs ${cls}`}>{toBengaliNumerals(rate)}%</span>;
}

function ProgressBar({ rate }: { rate: number }) {
  let color = 'bg-primary-mid';
  if (rate < 50) color = 'bg-error';
  else if (rate < 75) color = 'bg-accent';
  return (
    <div className="w-full bg-border rounded-full h-1.5 overflow-hidden mt-1">
      <div className={`h-1.5 rounded-full transition-all duration-500 ${color}`} style={{ width: `${rate}%` }} />
    </div>
  );
}

/* ─────────────── Main Component ─────────────── */
export default function AttendanceClient({ batches, adminId: _adminId }: AttendanceClientProps) {
  const supabase = createClient();

  /* ── Core data ── */
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [loading, setLoading] = useState(false);

  /* ── Filters ── */
  const [selectedExamId, setSelectedExamId] = useState<string>(''); // '' = all exams
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  /* ── Modal ── */
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  /* ── Fetch data when batch changes ── */
  useEffect(() => {
    if (!selectedBatchId) return;

    async function fetchAll() {
      setLoading(true);
      setSelectedStudent(null);
      setSelectedExamId('');   // reset exam filter on batch change
      setStatusFilter('all');  // reset status filter on batch change
      try {
        // 1. Enrolled students
        const { data: enrollmentsRaw } = await supabase
          .from('enrollments')
          .select('student_id, profiles!student_id(full_name, phone)')
          .eq('batch_id', selectedBatchId)
          .eq('status', 'active');

        const activeStudents: Student[] =
          enrollmentsRaw?.map((e) => ({
            id: e.student_id,
            full_name: (e.profiles as any)?.full_name || 'অজানা শিক্ষার্থী',
            phone: (e.profiles as any)?.phone || null,
          })) || [];
        setStudents(activeStudents);

        // 2. All exams for this batch
        const { data: examsData } = await supabase
          .from('exams')
          .select('id, title, exam_date, type, total_marks')
          .eq('batch_id', selectedBatchId)
          .order('exam_date', { ascending: false });

        const batchExams = (examsData as Exam[]) || [];
        setExams(batchExams);

        // 3. All results for those exams (= exam attendance)
        if (batchExams.length > 0) {
          const examIds = batchExams.map((e) => e.id);
          const { data: resultsData } = await supabase
            .from('results')
            .select('exam_id, student_id')
            .in('exam_id', examIds);
          setResults((resultsData as ResultRecord[]) || []);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Attendance fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [selectedBatchId]);

  /* ── All-exams summary per student ── */
  const studentSummaries = useMemo<StudentSummary[]>(() => {
    return students
      .map((student) => {
        const attendedExamIds = new Set(
          results.filter((r) => r.student_id === student.id).map((r) => r.exam_id)
        );
        const present = attendedExamIds.size;
        const absent = exams.length - present;
        const rate = exams.length > 0 ? Math.round((present / exams.length) * 100) : 0;
        return { ...student, present, absent, total: exams.length, rate };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [students, exams, results]);

  /* ── Per-exam student rows (when a specific exam is selected) ── */
  const examSpecificRows = useMemo<ExamStudentRow[]>(() => {
    if (!selectedExamId) return [];
    const attendedStudentIds = new Set(
      results.filter((r) => r.exam_id === selectedExamId).map((r) => r.student_id)
    );
    return students.map((s) => ({
      ...s,
      status: attendedStudentIds.has(s.id) ? 'present' : 'absent',
    }));
  }, [selectedExamId, students, results]);

  /* ── Final filtered display list ── */
  const displayRows = useMemo(() => {
    if (selectedExamId) {
      // Specific exam mode — filter by status
      let rows: ExamStudentRow[] = examSpecificRows;
      if (statusFilter !== 'all') rows = rows.filter((r) => r.status === statusFilter);
      return rows;
    } else {
      // All exams mode — filter summary list by status
      let rows: StudentSummary[] = studentSummaries;
      if (statusFilter === 'present') rows = rows.filter((s) => s.present > 0);
      if (statusFilter === 'absent')  rows = rows.filter((s) => s.absent > 0);
      return rows;
    }
  }, [selectedExamId, examSpecificRows, studentSummaries, statusFilter]);

  /* ── Exam counts for exam-specific mode ── */
  const examSpecificStats = useMemo(() => {
    if (!selectedExamId) return null;
    const presentCount = examSpecificRows.filter((r) => r.status === 'present').length;
    const absentCount  = examSpecificRows.filter((r) => r.status === 'absent').length;
    return { presentCount, absentCount };
  }, [selectedExamId, examSpecificRows]);

  /* ── Batch-level overview stats (all exams mode) ── */
  const batchStats = useMemo(() => {
    const totalSlots = students.length * exams.length;
    const totalPresent = new Set(results.map((r) => `${r.student_id}-${r.exam_id}`)).size;
    const overallRate = totalSlots > 0 ? Math.round((totalPresent / totalSlots) * 100) : 0;
    return { totalExams: exams.length, totalStudents: students.length, overallRate };
  }, [students, exams, results]);

  /* ── Selected student's per-exam detail (for modal) ── */
  const selectedStudentExams = useMemo(() => {
    if (!selectedStudent) return [];
    const attendedExamIds = new Set(
      results.filter((r) => r.student_id === selectedStudent.id).map((r) => r.exam_id)
    );
    return exams.map((exam) => ({
      ...exam,
      status: attendedExamIds.has(exam.id) ? ('present' as const) : ('absent' as const),
    }));
  }, [selectedStudent, exams, results]);

  const selectedSummary = selectedStudent
    ? studentSummaries.find((s) => s.id === selectedStudent.id)
    : null;

  /* ── Empty batches guard ── */
  if (batches.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-secondary shadow-sm flex flex-col items-center gap-3">
        <BookOpen className="w-10 h-10 text-text-muted/65" />
        <p className="font-bold text-text-primary text-base">কোনো সক্রিয় ব্যাচ নেই</p>
        <p className="text-xs">ব্যাচ ব্যবস্থাপনা পেজ থেকে ব্যাচ তৈরি করুন।</p>
      </div>
    );
  }

  /* ─────────────── JSX ─────────────── */
  return (
    <div className="space-y-6">

      {/* ── Filter Bar ── */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
        {/* Row 1 — Controls */}
        <div className="flex flex-wrap gap-4 items-end">

          {/* Batch */}
          <div className="flex flex-col gap-1 shrink-0">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">ব্যাচ</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition outline-none text-sm font-semibold text-text-primary bg-surface min-w-[200px]"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Exam filter */}
          <div className="flex flex-col gap-1 shrink-0">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">পরীক্ষা</label>
            <select
              value={selectedExamId}
              onChange={(e) => { setSelectedExamId(e.target.value); setStatusFilter('all'); }}
              disabled={loading || exams.length === 0}
              className="px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition outline-none text-sm font-semibold text-text-primary bg-surface min-w-[240px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">— সব পরীক্ষা —</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} ({formatBanglaDate(exam.exam_date)})
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex flex-col gap-1 shrink-0">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">অবস্থা</label>
            <div className="flex gap-2">
              {(['all', 'present', 'absent'] as StatusFilter[]).map((val) => {
                const label = val === 'all' ? 'সব' : val === 'present' ? 'উপস্থিত' : 'অনুপস্থিত';
                const isActive = statusFilter === val;
                const activeClass =
                  val === 'all'     ? 'bg-primary text-white border-primary' :
                  val === 'present' ? 'bg-primary-light text-primary border-primary/40 font-bold' :
                                      'bg-error/10 text-error border-error/30 font-bold';
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setStatusFilter(val)}
                    disabled={loading}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-50 ${
                      isActive ? activeClass : 'border-border text-text-secondary bg-surface hover:bg-surface-alt hover:border-border-strong'
                    }`}
                  >
                    {val === 'present' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                    {val === 'absent'  && <XCircle      className="w-3 h-3 inline mr-1" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Row 2 — Stats strip (only when data is loaded and exams exist) */}
        {!loading && exams.length > 0 && (
          <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-border pt-4">
            {!selectedExamId ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">মোট পরীক্ষা:</span>
                  <span className="font-bold text-text-primary text-sm">{toBengaliNumerals(batchStats.totalExams)} টি</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">শিক্ষার্থী:</span>
                  <span className="font-bold text-text-primary text-sm">{toBengaliNumerals(batchStats.totalStudents)} জন</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">গড় উপস্থিতি:</span>
                  <span className="font-bold text-primary text-sm">{toBengaliNumerals(batchStats.overallRate)}%</span>
                </div>
              </>
            ) : examSpecificStats ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">উপস্থিত:</span>
                  <span className="font-bold text-primary text-sm">{toBengaliNumerals(examSpecificStats.presentCount)} জন</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">অনুপস্থিত:</span>
                  <span className="font-bold text-error text-sm">{toBengaliNumerals(examSpecificStats.absentCount)} জন</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">মোট:</span>
                  <span className="font-bold text-text-primary text-sm">
                    {toBengaliNumerals(examSpecificStats.presentCount + examSpecificStats.absentCount)} জন
                  </span>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* ── Content Area ── */}
      {loading ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-text-secondary mt-2">তথ্য লোড হচ্ছে...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-secondary shadow-sm flex flex-col items-center gap-3">
          <ClipboardList className="w-10 h-10 text-text-muted/65" />
          <p className="font-bold text-text-primary text-base">এই ব্যাচে এখনো কোনো পরীক্ষা নেই</p>
          <p className="text-xs">পরীক্ষা পরিচালনা পেজ থেকে পরীক্ষা যোগ করলে উপস্থিতি ট্র্যাক করা যাবে।</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-secondary shadow-sm flex flex-col items-center gap-2">
          <AlertCircle className="w-10 h-10 text-error" />
          <p className="font-bold text-text-primary text-base">এই ব্যাচে কোনো সক্রিয় শিক্ষার্থী নেই</p>
        </div>
      ) : displayRows.length === 0 ? (
        /* Empty filter result */
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-secondary shadow-sm flex flex-col items-center gap-3">
          <Filter className="w-10 h-10 text-text-muted/65" />
          <p className="font-bold text-text-primary text-base">ফিল্টার অনুযায়ী কোনো শিক্ষার্থী পাওয়া যায়নি</p>
          <p className="text-xs">অন্য ফিল্টার নির্বাচন করে চেষ্টা করুন।</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="bg-surface-alt border-b border-border px-6 py-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {selectedExamId
                  ? `${exams.find(e => e.id === selectedExamId)?.title} — উপস্থিতি`
                  : 'শিক্ষার্থীভিত্তিক পরীক্ষার উপস্থিতি'
                }
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {selectedExamId
                  ? 'কোনো শিক্ষার্থীর সারিতে ক্লিক করলে সব পরীক্ষার বিস্তারিত দেখা যাবে।'
                  : 'কোনো শিক্ষার্থীর সারিতে ক্লিক করলে পরীক্ষাওয়ারি বিস্তারিত দেখা যাবে।'
                }
              </p>
            </div>
            <span className="text-xs font-semibold text-text-muted bg-surface border border-border px-3 py-1 rounded-full shrink-0">
              {toBengaliNumerals(displayRows.length)} জন
            </span>
          </div>

          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">

            {/* ── ALL EXAMS MODE ── */}
            {!selectedExamId && (
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-border/80 text-xs font-bold text-text-secondary bg-surface-alt/40 uppercase tracking-wider">
                    <th className="px-6 py-3">শিক্ষার্থী</th>
                    <th className="px-4 py-3 text-center">উপস্থিত</th>
                    <th className="px-4 py-3 text-center">অনুপস্থিত</th>
                    <th className="px-6 py-3 text-center w-[160px]">উপস্থিতির হার</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {(displayRows as StudentSummary[]).map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className="hover:bg-surface-alt/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-text-primary block group-hover:text-primary transition-colors">
                          {s.full_name}
                        </span>
                        {s.phone && (
                          <span className="text-xs text-text-muted mt-0.5 block">{toBengaliNumerals(s.phone)}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-primary">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {toBengaliNumerals(s.present)} টি
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-error">
                          <XCircle className="w-3.5 h-3.5" />
                          {toBengaliNumerals(s.absent)} টি
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex justify-end">
                            <RateBadge rate={s.rate} />
                          </div>
                          <ProgressBar rate={s.rate} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ── SPECIFIC EXAM MODE ── */}
            {selectedExamId && (
              <table className="w-full text-left border-collapse min-w-[420px]">
                <thead>
                  <tr className="border-b border-border/80 text-xs font-bold text-text-secondary bg-surface-alt/40 uppercase tracking-wider">
                    <th className="px-6 py-3">শিক্ষার্থী</th>
                    <th className="px-6 py-3 text-right">অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {(displayRows as ExamStudentRow[]).map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className="hover:bg-surface-alt/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-text-primary block group-hover:text-primary transition-colors">
                          {s.full_name}
                        </span>
                        {s.phone && (
                          <span className="text-xs text-text-muted mt-0.5 block">{toBengaliNumerals(s.phone)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {s.status === 'present' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border text-primary bg-primary-light/50 border-primary/20">
                            <CheckCircle2 className="w-3 h-3" /> উপস্থিত
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border text-error bg-error/10 border-error/20">
                            <XCircle className="w-3 h-3" /> অনুপস্থিত
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <p className="text-xs text-text-muted text-right md:hidden mt-1 px-4 pb-2">
              &#8592; স্ক্রোল করুন &#8594;
            </p>
          </div>
        </div>
      )}

      {/* ──────── Student Detail Modal ──────── */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedStudent(null); }}
        >
          <div className="bg-surface border border-border w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-alt shrink-0">
              <div>
                <h3 className="font-bold text-text-primary text-base">{selectedStudent.full_name}</h3>
                <p className="text-xs text-text-secondary mt-0.5">পরীক্ষাভিত্তিক উপস্থিতির বিস্তারিত</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Stats row */}
            {selectedSummary && (
              <div className="px-6 py-5 grid grid-cols-3 gap-4 border-b border-border bg-surface shrink-0">
                <div className="text-center">
                  <span className="text-2xl font-bold text-primary block">{toBengaliNumerals(selectedSummary.present)}</span>
                  <span className="text-xs text-text-muted">উপস্থিত</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-error block">{toBengaliNumerals(selectedSummary.absent)}</span>
                  <span className="text-xs text-text-muted">অনুপস্থিত</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-text-primary block">{toBengaliNumerals(selectedSummary.rate)}%</span>
                  <span className="text-xs text-text-muted">উপস্থিতির হার</span>
                </div>
              </div>
            )}

            {/* Exam list */}
            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              {selectedStudentExams.length === 0 ? (
                <p className="text-center text-text-muted text-sm py-6">কোনো পরীক্ষা নেই।</p>
              ) : (
                selectedStudentExams.map((exam) => (
                  <div
                    key={exam.id}
                    className={`flex items-center justify-between gap-3 p-4 rounded-xl border transition-colors ${
                      exam.status === 'present'
                        ? 'border-primary/20 bg-primary-light/15'
                        : 'border-error/20 bg-error/5'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-text-primary text-sm block truncate">{exam.title}</span>
                      <span className="text-xs text-text-secondary mt-0.5 block">
                        {formatBanglaDate(exam.exam_date)} &middot; {examTypeBn[exam.type] || exam.type}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 ${
                        exam.status === 'present'
                          ? 'text-primary bg-primary-light/50 border-primary/20'
                          : 'text-error bg-error/10 border-error/20'
                      }`}
                    >
                      {exam.status === 'present' ? (
                        <><CheckCircle2 className="w-3 h-3" /> উপস্থিত</>
                      ) : (
                        <><XCircle className="w-3 h-3" /> অনুপস্থিত</>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
