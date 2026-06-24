'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  CheckSquare, 
  Calendar, 
  Smile, 
  Frown, 
  Watch, 
  Check, 
  X as CloseIcon, 
  Loader2, 
  AlertCircle, 
  Search, 
  ClipboardList, 
  History 
} from 'lucide-react';
import { 
  toBengaliNumerals, 
  formatBanglaDate, 
  formatBanglaTime, 
  formatBanglaShortDate 
} from '@/lib/bangla';

interface Batch {
  id: string;
  name: string;
}

interface Routine {
  id: string;
  day_of_week: string;
  subject: string;
  start_time: string;
}

interface Student {
  id: string;
  full_name: string;
  phone: string | null;
}

interface AttendanceRecord {
  id: string;
  routine_id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  student?: {
    full_name: string;
  } | null;
  marker?: {
    full_name: string;
  } | null;
  routines?: {
    subject: string;
    day_of_week: string;
    start_time: string;
  } | null;
}

interface AttendanceClientProps {
  batches: Batch[];
  adminId: string;
}

const statusDisplay = {
  present: { label: 'উপস্থিত ✓', color: 'text-primary bg-primary-light/50 border-primary/20 hover:bg-primary-light' },
  absent:  { label: 'অনুপস্থিত ✗', color: 'text-error bg-error/10 border-error/20 hover:bg-error/20' },
  late:    { label: 'দেরি হয়েছে', color: 'text-accent bg-accent-light/50 border-accent/20 hover:bg-accent-light' },
};

export default function AttendanceClient({ batches, adminId }: AttendanceClientProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');

  // Filter States (common)
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');

  // --- Tab 1: Mark Attendance States ---
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutineId, setSelectedRoutineId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [markedStatuses, setMarkedStatuses] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // --- Tab 2: View History States ---
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [historyStudents, setHistoryStudents] = useState<Student[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Helper for generating month list for history
  const monthOptions = React.useMemo(() => {
    const options = [];
    const today = new Date();
    const monthNamesBn = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const value = `${year}-${month}`;
      const monthBn = monthNamesBn[d.getMonth()];
      const yearBn = toBengaliNumerals(year);
      options.push({
        value,
        label: `${monthBn} ${yearBn}`
      });
    }
    return options;
  }, []);

  // --- Fetch Routines for Selected Batch ---
  useEffect(() => {
    if (!selectedBatchId) return;

    async function fetchRoutines() {
      setLoadingClasses(true);
      try {
        const { data, error } = await supabase
          .from('routines')
          .select('id, day_of_week, subject, start_time')
          .eq('batch_id', selectedBatchId)
          .order('start_time');

        if (error) throw error;
        setRoutines(data || []);
      } catch (err) {
        console.error('Error fetching routines:', err);
      } finally {
        setLoadingClasses(false);
      }
    }

    fetchRoutines();
  }, [selectedBatchId]);

  // --- Get Classes matching Selected Date's Weekday ---
  const classesForDay = React.useMemo(() => {
    if (routines.length === 0 || !selectedDate) return [];
    
    // Parse date safely without timezone offset issues
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }); // "Saturday", etc.
    
    return routines.filter((r) => r.day_of_week === dayOfWeek);
  }, [routines, selectedDate]);

  // Sync Class Selection
  useEffect(() => {
    if (classesForDay.length > 0) {
      // Default to first class if current selection is not in list
      if (!classesForDay.some((c) => c.id === selectedRoutineId)) {
        setSelectedRoutineId(classesForDay[0].id);
      }
    } else {
      setSelectedRoutineId('');
    }
  }, [classesForDay, selectedRoutineId]);

  // --- Fetch Enrolled Students & Existing Attendance ---
  useEffect(() => {
    if (!selectedBatchId || !selectedRoutineId || !selectedDate) {
      setStudents([]);
      setMarkedStatuses({});
      return;
    }

    async function fetchStudentsAndAttendance() {
      setLoadingStudents(true);
      setSaveSuccess(false);
      setSaveError(null);
      try {
        // 1. Fetch active students enrolled in this batch
        const { data: enrollmentsRaw, error: enrollError } = await supabase
          .from('enrollments')
          .select('student_id, profiles!student_id(full_name, phone)')
          .eq('batch_id', selectedBatchId)
          .eq('status', 'active');

        if (enrollError) throw enrollError;

        const activeStudents = enrollmentsRaw?.map((e) => ({
          id: e.student_id,
          full_name: (e.profiles as any)?.full_name || 'অজানা শিক্ষার্থী',
          phone: (e.profiles as any)?.phone || null,
        })) || [];

        setStudents(activeStudents);

        // 2. Fetch existing attendance for this date + class
        const { data: attendanceRaw, error: attError } = await supabase
          .from('attendance')
          .select('student_id, status')
          .eq('routine_id', selectedRoutineId)
          .eq('date', selectedDate);

        if (attError) throw attError;

        // 3. Map statuses (pre-fill)
        const initialStatuses: Record<string, 'present' | 'absent' | 'late'> = {};
        
        // If attendance records exist in DB
        if (attendanceRaw && attendanceRaw.length > 0) {
          attendanceRaw.forEach((record) => {
            initialStatuses[record.student_id] = record.status as 'present' | 'absent' | 'late';
          });
        } else {
          // If brand new sheet, default everyone to 'present' for easy marking
          activeStudents.forEach((student) => {
            initialStatuses[student.id] = 'present';
          });
        }

        setMarkedStatuses(initialStatuses);
      } catch (err) {
        console.error('Error fetching students or attendance:', err);
      } finally {
        setLoadingStudents(false);
      }
    }

    fetchStudentsAndAttendance();
  }, [selectedBatchId, selectedRoutineId, selectedDate]);

  // --- Mass Mark All as Present ---
  const handleMarkAllPresent = () => {
    const updated: Record<string, 'present' | 'absent' | 'late'> = {};
    students.forEach((student) => {
      updated[student.id] = 'present';
    });
    setMarkedStatuses(updated);
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setMarkedStatuses((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // --- Save marked attendance ---
  const handleSaveAttendance = async () => {
    if (students.length === 0 || !selectedRoutineId) return;

    setSavingAttendance(true);
    setSaveSuccess(false);
    setSaveError(null);

    const records = students.map((s) => ({
      routine_id: selectedRoutineId,
      student_id: s.id,
      date: selectedDate,
      status: markedStatuses[s.id] ?? 'absent',
      marked_by: adminId,
      marked_at: new Date().toISOString(),
    }));

    try {
      const { error } = await supabase
        .from('attendance')
        .upsert(records, {
          onConflict: 'routine_id,student_id,date',
        });

      if (error) throw error;
      
      setSaveSuccess(true);
      // Auto-clear success checkmark after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      setSaveError(err.message || 'উপস্থিতি সংরক্ষণ করার সময় কোনো সমস্যা হয়েছে।');
    } finally {
      setSavingAttendance(false);
    }
  };

  // --- Tab 2: Fetch History & Student Summaries ---
  useEffect(() => {
    if (activeTab !== 'history' || !selectedBatchId || !selectedMonth) return;

    async function fetchHistoryAndSummaries() {
      setLoadingHistory(true);
      try {
        // Calculate month start and end dates
        const [year, month] = selectedMonth.split('-').map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        const lastDayStr = String(lastDay).padStart(2, '0');

        // 1. Fetch active students in this batch for the summary table
        const { data: enrollmentsRaw, error: enrollError } = await supabase
          .from('enrollments')
          .select('student_id, profiles!student_id(full_name, phone)')
          .eq('batch_id', selectedBatchId)
          .eq('status', 'active');

        if (enrollError) throw enrollError;

        const activeStudents = enrollmentsRaw?.map((e) => ({
          id: e.student_id,
          full_name: (e.profiles as any)?.full_name || 'অজানা শিক্ষার্থী',
          phone: (e.profiles as any)?.phone || null,
        })) || [];

        setHistoryStudents(activeStudents);

        // 2. Fetch history records joining routines with inner join
        const { data: attendanceRaw, error: attError } = await supabase
          .from('attendance')
          .select(`
            id,
            routine_id,
            student_id,
            date,
            status,
            student:profiles!student_id(full_name),
            marker:profiles!marked_by(full_name),
            routines!inner(subject, day_of_week, start_time, batch_id)
          `)
          .eq('routines.batch_id', selectedBatchId)
          .gte('date', `${selectedMonth}-01`)
          .lte('date', `${selectedMonth}-${lastDayStr}`)
          .order('date', { ascending: false });

        if (attError) throw attError;

        // Cast to AttendanceRecord format
        const historyData = (attendanceRaw as unknown as AttendanceRecord[]) || [];
        setHistoryRecords(historyData);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchHistoryAndSummaries();
  }, [activeTab, selectedBatchId, selectedMonth]);

  // Compute student-by-student summary stats
  const studentSummaries = React.useMemo(() => {
    if (activeTab !== 'history') return [];

    return historyStudents.map((student) => {
      const studentRecords = historyRecords.filter((r) => r.student_id === student.id);
      const present = studentRecords.filter((r) => r.status === 'present').length;
      const absent = studentRecords.filter((r) => r.status === 'absent').length;
      const late = studentRecords.filter((r) => r.status === 'late').length;
      const total = studentRecords.length;
      
      const rate = total > 0 
        ? Math.round(((present + late) / total) * 100) 
        : 0;

      return {
        id: student.id,
        name: student.full_name,
        present,
        absent,
        late,
        total,
        rate
      };
    }).sort((a, b) => b.rate - a.rate); // Sort by attendance rate desc
  }, [activeTab, historyStudents, historyRecords]);

  return (
    <div className="space-y-6">
      {/* Tabs Switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('mark')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition border-b-2 cursor-pointer ${
            activeTab === 'mark'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text-secondary hover:text-primary'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>উপস্থিতি নিন</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition border-b-2 cursor-pointer ${
            activeTab === 'history'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text-secondary hover:text-primary'
          }`}
        >
          <History className="w-4 h-4" />
          <span>উপস্থিতির ইতিহাস</span>
        </button>
      </div>

      {/* Main Grid Filters */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Batch Selector */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-xs font-bold text-text-secondary">ব্যাচ</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition outline-none text-sm font-semibold text-text-primary bg-surface min-w-[200px]"
            >
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selector (Mark Tab only) */}
          {activeTab === 'mark' && (
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-xs font-bold text-text-secondary">তারিখ</label>
              <input
                type="date"
                value={selectedDate}
                max={new Date().toLocaleDateString('en-CA')}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition outline-none text-sm font-semibold text-text-primary bg-surface min-w-[180px]"
              />
            </div>
          )}

          {/* Month Selector (History Tab only) */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-xs font-bold text-text-secondary">মাস</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition outline-none text-sm font-semibold text-text-primary bg-surface min-w-[180px]"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Step 1 Class dropdown info (Mark Tab only) */}
        {activeTab === 'mark' && classesForDay.length > 0 && (
          <div className="flex flex-col gap-1 w-full sm:w-auto self-end">
            <label className="text-xs font-bold text-text-secondary">আজকের ক্লাস নির্ধারণ</label>
            <select
              value={selectedRoutineId}
              onChange={(e) => setSelectedRoutineId(e.target.value)}
              className="px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition outline-none text-sm font-semibold text-text-primary bg-surface min-w-[240px]"
            >
              {classesForDay.map((c) => (
                <option key={c.id} value={c.id}>
                  {formatBanglaTime(c.start_time)} | {c.subject}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* --- Tab 1: MARK ATTENDANCE CONTENT --- */}
      {activeTab === 'mark' && (
        <div className="space-y-6">
          {/* Edge Cases: Loading / Class Missing / Students Missing */}
          {loadingClasses ? (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-text-secondary mt-2">ক্লাস রুটিন লোড হচ্ছে...</p>
            </div>
          ) : classesForDay.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-secondary shadow-sm flex flex-col items-center gap-3">
              <Calendar className="w-10 h-10 text-text-muted/65" />
              <p className="font-bold text-text-primary text-base">এই তারিখে কোনো ক্লাস শিডিউল নেই</p>
              <p className="text-xs max-w-sm">
                নির্বাচনকৃত তারিখটি সপ্তাহের যে দিন (যেমন: {new Date(selectedDate).toLocaleDateString('bn-BD', { weekday: 'long' })}), সেই দিন এই ব্যাচের কোনো ক্লাস রুটিনে নেই। রুটিন ট্যাবে গিয়ে ক্লাস যোগ করুন।
              </p>
            </div>
          ) : loadingStudents ? (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-text-secondary mt-2">শিক্ষার্থীদের তালিকা লোড হচ্ছে...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-secondary shadow-sm flex flex-col items-center gap-2">
              <AlertCircle className="w-10 h-10 text-error" />
              <p className="font-bold text-text-primary text-base">এই ব্যাচে কোনো সক্রিয় শিক্ষার্থী নেই</p>
              <p className="text-xs">উপস্থিতি নেয়ার আগে শিক্ষার্থীদের এই ব্যাচে ভর্তি করুন।</p>
            </div>
          ) : (
            /* Student marking table */
            <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden space-y-4">
              {/* Header inside Card */}
              <div className="bg-surface-alt border-b border-border px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-text-primary text-base">
                    {classesForDay.find(c => c.id === selectedRoutineId)?.subject}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    তারিখ: {formatBanglaDate(selectedDate)} | {formatBanglaTime(classesForDay.find(c => c.id === selectedRoutineId)?.start_time)}
                  </p>
                </div>
                <button
                  onClick={handleMarkAllPresent}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-primary/20 bg-primary-light text-primary text-xs font-bold rounded-xl hover:bg-primary-light/80 transition cursor-pointer self-start sm:self-center"
                >
                  <Check className="w-4 h-4" />
                  <span>সকলকে উপস্থিত করুন</span>
                </button>
              </div>

              {/* Status Alert logs */}
              {saveSuccess && (
                <div className="mx-6 bg-primary-light/50 border border-primary/20 text-primary rounded-xl p-3.5 flex items-center gap-2.5 text-sm animate-in fade-in duration-200">
                  <Check className="w-5 h-5 shrink-0" />
                  <span className="font-semibold">উপস্থিতি সফলভাবে সংরক্ষণ করা হয়েছে! ✓</span>
                </div>
              )}
              {saveError && (
                <div className="mx-6 bg-error/10 border border-error/20 text-error rounded-xl p-3.5 flex items-start gap-2.5 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Students attendance rows */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 text-xs font-bold text-text-secondary bg-surface-alt/40 uppercase tracking-wider">
                      <th className="px-6 py-3 font-semibold">শিক্ষার্থীর নাম</th>
                      <th className="px-6 py-3 font-semibold text-center w-[360px]">উপস্থিতির অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {students.map((student) => {
                      const currentStatus = markedStatuses[student.id];
                      return (
                        <tr key={student.id} className="hover:bg-surface-alt/20 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-text-primary text-sm block">
                              {student.full_name}
                            </span>
                            {student.phone && (
                              <span className="text-xs text-text-muted mt-0.5 block">
                                {toBengaliNumerals(student.phone)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="grid grid-cols-3 gap-2 max-w-[340px] mx-auto">
                              {(['present', 'absent', 'late'] as const).map((status) => {
                                const isSelected = currentStatus === status;
                                const display = statusDisplay[status];
                                
                                return (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleStatusChange(student.id, status)}
                                    className={`px-2 py-2 text-xs font-semibold rounded-xl border text-center transition cursor-pointer ${
                                      isSelected
                                        ? display.color + ' border-current font-bold'
                                        : 'border-border text-text-secondary bg-surface hover:border-border-strong'
                                    }`}
                                  >
                                    {display.label}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer Save Button */}
              <div className="px-6 py-4 border-t border-border bg-surface-alt/25 flex items-center justify-end">
                <button
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition cursor-pointer disabled:opacity-50"
                >
                  {savingAttendance ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>সংরক্ষণ করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>উপস্থিতি সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Tab 2: HISTORY LOGS CONTENT --- */}
      {activeTab === 'history' && (
        <div className="space-y-8">
          {loadingHistory ? (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-text-secondary mt-2">ইতিহাস ও পরিসংখ্যান লোড হচ্ছে...</p>
            </div>
          ) : historyRecords.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-secondary shadow-sm flex flex-col items-center gap-3">
              <ClipboardList className="w-10 h-10 text-text-muted/65" />
              <p className="font-bold text-text-primary text-base">এই মাসে কোনো উপস্থিতি রেকর্ড নেই</p>
              <p className="text-xs">অন্য ব্যাচ বা অন্য মাস নির্বাচন করে চেষ্টা করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Summary Stats Grid (Lhs - 2 Columns on large screen) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-surface-alt border-b border-border px-6 py-4">
                    <h3 className="font-bold text-text-primary text-base">শিক্ষার্থীভিত্তিক সারসংক্ষেপ</h3>
                    <p className="text-xs text-text-secondary mt-0.5">চলতি মাসে শিক্ষার্থীদের উপস্থিতির হার ও দিনসমূহ।</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/80 text-xs font-bold text-text-secondary bg-surface-alt/40 uppercase tracking-wider">
                          <th className="px-6 py-3 font-semibold">শিক্ষার্থী</th>
                          <th className="px-4 py-3 font-semibold text-center">উপস্থিত</th>
                          <th className="px-4 py-3 font-semibold text-center">দেরি</th>
                          <th className="px-4 py-3 font-semibold text-center">অনুপস্থিত</th>
                          <th className="px-6 py-3 font-semibold text-center w-[120px]">উপস্থিতির হার</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-sm">
                        {studentSummaries.map((summary) => {
                          let progressColor = 'bg-primary-mid';
                          let textColor = 'text-primary';
                          if (summary.rate < 50) {
                            progressColor = 'bg-error';
                            textColor = 'text-error';
                          } else if (summary.rate < 75) {
                            progressColor = 'bg-accent';
                            textColor = 'text-accent';
                          }

                          return (
                            <tr key={summary.id} className="hover:bg-surface-alt/20 transition-colors">
                              <td className="px-6 py-4 font-bold text-text-primary">
                                {summary.name}
                              </td>
                              <td className="px-4 py-4 text-center font-semibold text-text-secondary">
                                {toBengaliNumerals(summary.present)} দিন
                              </td>
                              <td className="px-4 py-4 text-center font-semibold text-text-secondary">
                                {toBengaliNumerals(summary.late)} দিন
                              </td>
                              <td className="px-4 py-4 text-center font-semibold text-text-secondary">
                                {toBengaliNumerals(summary.absent)} দিন
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <span className={`font-bold block text-right text-xs ${textColor}`}>
                                    {toBengaliNumerals(summary.rate)}%
                                  </span>
                                  {/* Progress Bar */}
                                  <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className={`h-1.5 rounded-full ${progressColor}`}
                                      style={{ width: `${summary.rate}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Detailed logs feed (Rhs - 1 Column) */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-surface-alt border-b border-border px-5 py-4">
                    <h3 className="font-bold text-text-primary text-base">উপস্থিতির বিস্তারিত লগ</h3>
                    <p className="text-xs text-text-secondary mt-0.5">সাম্প্রতিককালে মার্ক করা উপস্থিতি তালিকা।</p>
                  </div>
                  <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin">
                    {historyRecords.map((record) => {
                      const isPresent = record.status === 'present';
                      const isLate = record.status === 'late';
                      
                      let statusText = 'অনুপস্থিত';
                      let badgeStyle = 'bg-error/10 text-error border-error/25';
                      
                      if (isPresent) {
                        statusText = 'উপস্থিত';
                        badgeStyle = 'bg-primary-light text-primary border-primary/20';
                      } else if (isLate) {
                        statusText = 'দেরিতে উপস্থিত';
                        badgeStyle = 'bg-accent-light/50 text-accent border-accent/25';
                      }

                      return (
                        <div 
                          key={record.id}
                          className="border border-border/80 rounded-xl p-4 space-y-2 hover:border-border-strong/60 transition duration-150 bg-surface"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-text-muted font-semibold">
                              📅 {formatBanglaShortDate(record.date)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}>
                              {statusText}
                            </span>
                          </div>
                          
                          <div>
                            <span className="font-bold text-text-primary text-sm block">
                              {record.student?.full_name}
                            </span>
                            <span className="text-xs text-text-secondary block mt-0.5">
                              📚 {record.routines?.subject}
                            </span>
                          </div>

                          <div className="text-[10px] text-text-muted border-t border-border/60 pt-1.5 flex items-center justify-between">
                            <span>চিহ্নিতকারী: {record.marker?.full_name || 'এডমিন'}</span>
                            <span>{formatBanglaTime(record.routines?.start_time)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
