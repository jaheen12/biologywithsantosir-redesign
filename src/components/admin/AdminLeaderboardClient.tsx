'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Download, 
  Users, 
  HelpCircle, 
  Award, 
  Percent,
  Medal
} from 'lucide-react';
import { toBengaliNumerals } from '@/lib/bangla';

interface Batch {
  id: string;
  name: string;
}

interface LeaderboardEntry {
  student_id: string;
  full_name: string;
  total_marks: number;
  exams_count: number;
}

interface Exam {
  id: string;
  title: string;
  total_marks: number;
  exam_date: string;
}

interface ResultRecord {
  student_id: string;
  exam_id: string;
  marks_obtained: number;
  grade: string | null;
}

interface AdminLeaderboardClientProps {
  batches: Batch[];
  selectedBatchId: string;
  leaderboard: LeaderboardEntry[];
  exams: Exam[];
  results: ResultRecord[];
}

export default function AdminLeaderboardClient({
  batches,
  selectedBatchId,
  leaderboard,
  exams,
  results,
}: AdminLeaderboardClientProps) {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<'leaderboard' | 'examwise' | 'pivot'>('leaderboard');
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/admin/leaderboard?batch=${e.target.value}`);
  };

  const currentExamId = exams.some((e) => e.id === selectedExamId)
    ? selectedExamId
    : (exams[0]?.id || '');

  const selectedExam = exams.find((e) => e.id === currentExamId);
  const totalMarks = selectedExam?.total_marks || 100;

  const examStats = useMemo(() => {
    if (!currentExamId) return null;
    const examResults = results.filter((r) => r.exam_id === currentExamId);
    if (examResults.length === 0) return null;

    const marks = examResults.map((r) => r.marks_obtained);
    const highest = Math.max(...marks);
    const average = Math.round((marks.reduce((a, b) => a + b, 0) / marks.length) * 10) / 10;

    return {
      highest,
      average,
      totalParticipants: examResults.length,
    };
  }, [currentExamId, results]);

  const examLeaderboard = useMemo(() => {
    if (!currentExamId) return [];

    const examResults = results.filter((r) => r.exam_id === currentExamId);

    const entries = leaderboard.map((student) => {
      const result = examResults.find((r) => r.student_id === student.student_id);
      return {
        student_id: student.student_id,
        full_name: student.full_name,
        marks_obtained: result ? result.marks_obtained : null,
        grade: result ? result.grade : null,
        participated: !!result,
      };
    });

    // Sort: participated first, then by marks_obtained descending
    return entries.sort((a, b) => {
      if (a.participated && !b.participated) return -1;
      if (!a.participated && b.participated) return 1;
      if (a.participated && b.participated) {
        return (b.marks_obtained ?? 0) - (a.marks_obtained ?? 0);
      }
      return a.full_name.localeCompare(b.full_name);
    });
  }, [currentExamId, results, leaderboard]);

  // CSV Exporter with BOM for correct Bangla characters in Excel
  const handleExportCSV = () => {
    if (leaderboard.length === 0) return;

    const headers = ['র‍্যাংক', 'নাম', 'মোট প্রাপ্ত নম্বর', 'অংশগ্রহণকৃত পরীক্ষা সংখ্যা'];
    const rows = leaderboard.map((r, index) => [
      (index + 1).toString(),
      r.full_name,
      r.total_marks.toString(),
      r.exams_count.toString()
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const batchName = batches.find(b => b.id === selectedBatchId)?.name || 'Batch';
    link.setAttribute('download', `Leaderboard_${batchName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Exporter for examwise leaderboard
  const handleExportExamCSV = () => {
    if (examLeaderboard.length === 0 || !selectedExam) return;

    const headers = ['র‍্যাংক', 'নাম', 'প্রাপ্ত নম্বর', 'শতকরা (%)', 'গ্রেড', 'উপস্থিতি'];
    
    // Count how many students before had higher marks (standard dense ranking)
    const participants = examLeaderboard.filter(s => s.participated);
    
    const rows = examLeaderboard.map((student) => {
      let rank = '—';
      if (student.participated) {
        const participantRank = participants.findIndex(s => s.student_id === student.student_id);
        rank = (participantRank + 1).toString();
      }
      const percent = student.participated 
        ? Math.round(((student.marks_obtained ?? 0) / totalMarks) * 100) + '%'
        : '—';
      
      return [
        rank,
        student.full_name,
        student.participated ? student.marks_obtained?.toString() || '0' : '—',
        percent,
        student.grade || '—',
        student.participated ? 'উপস্থিত' : 'অনুপস্থিত'
      ];
    });

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    link.setAttribute('download', `ResultSheet_${selectedExam.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderRank = (index: number) => {
    const numBn = toBengaliNumerals(index + 1);
    
    if (index === 0) {
      return (
        <div className="flex items-center justify-center gap-1 text-amber-500">
          <Trophy className="w-4 h-4 shrink-0 fill-amber-500/10" />
          <span className="font-black text-sm">{numBn}</span>
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="flex items-center justify-center gap-1 text-slate-400">
          <Medal className="w-4 h-4 shrink-0 fill-slate-400/10" />
          <span className="font-black text-sm">{numBn}</span>
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="flex items-center justify-center gap-1 text-amber-700">
          <Medal className="w-4 h-4 shrink-0 fill-amber-700/10" />
          <span className="font-black text-sm">{numBn}</span>
        </div>
      );
    }
    
    return <span className="text-text-secondary font-semibold text-sm">{numBn}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Batch Filter Card */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">শ্রেণীভিত্তিক র‍্যাংকিং এবং রিপোর্ট</h2>
          <p className="text-xs text-text-secondary mt-0.5">ব্যাচ সিলেক্ট করে মেধা তালিকা এবং তুলনামূলক নম্বর শীট দেখুন।</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-text-secondary shrink-0">ব্যাচ নির্বাচন:</label>
          <select
            value={selectedBatchId}
            onChange={handleBatchChange}
            className="px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition outline-none text-sm font-semibold text-text-primary bg-surface min-w-[200px]"
          >
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub Tabs Switcher & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-0.5">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 cursor-pointer transition ${
              activeSubTab === 'leaderboard'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-text-secondary hover:text-primary'
            }`}
          >
            মেধা তালিকা (Leaderboard)
          </button>
          <button
            onClick={() => setActiveSubTab('examwise')}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 cursor-pointer transition ${
              activeSubTab === 'examwise'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-text-secondary hover:text-primary'
            }`}
          >
            পরীক্ষাভিত্তিক মেধা তালিকা (Exam Leaderboard)
          </button>
          <button
            onClick={() => setActiveSubTab('pivot')}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 cursor-pointer transition ${
              activeSubTab === 'pivot'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-text-secondary hover:text-primary'
            }`}
          >
            ফলাফল গ্রিড (Pivot Sheet)
          </button>
        </div>

        {activeSubTab === 'leaderboard' && leaderboard.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:border-border-strong rounded-xl text-xs font-bold text-text-primary hover:text-primary transition bg-surface cursor-pointer shadow-xs self-start sm:self-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV ডাউনলোড (Excel)</span>
          </button>
        )}

        {activeSubTab === 'examwise' && examLeaderboard.length > 0 && (
          <button
            onClick={handleExportExamCSV}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:border-border-strong rounded-xl text-xs font-bold text-text-primary hover:text-primary transition bg-surface cursor-pointer shadow-xs self-start sm:self-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ফলাফল CSV ডাউনলোড</span>
          </button>
        )}
      </div>

      {/* --- Sub Tab 1: Leaderboard --- */}
      {activeSubTab === 'leaderboard' && (
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="p-12 text-center text-text-secondary flex flex-col items-center gap-2">
              <Trophy className="w-12 h-12 text-text-muted/65" />
              <p className="font-bold text-text-primary text-base">মেধা তালিকা ফাঁকা</p>
              <p className="text-xs">এই ব্যাচের কোনো শিক্ষার্থীর পরীক্ষার ফলাফল এখন পর্যন্ত প্রকাশ করা হয়নি।</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-border text-xs font-bold text-text-secondary bg-surface-alt/40 uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold text-center w-[100px]">স্থান (Rank)</th>
                    <th className="px-6 py-4 font-semibold">শিক্ষার্থীর নাম</th>
                    <th className="px-6 py-4 font-semibold text-center">মোট প্রাপ্ত নম্বর</th>
                    <th className="px-6 py-4 font-semibold text-center">অংশগ্রহণকৃত পরীক্ষা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {leaderboard.map((student, idx) => (
                    <tr
                      key={student.student_id}
                      className={`hover:bg-surface-alt/25 transition-colors ${
                        idx < 3 ? 'bg-primary-light/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-center align-middle">
                        {renderRank(idx)}
                      </td>
                      <td className="px-6 py-4 font-bold text-text-primary">
                        {student.full_name}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-primary text-base">
                        {toBengaliNumerals(student.total_marks)}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-text-secondary">
                        {toBengaliNumerals(student.exams_count)} টি
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mobile scroll hint */}
              <p className="text-xs text-text-muted text-right md:hidden mt-1">&#8592; স্ক্রোল করুন &#8594;</p>
            </div>
          )}
        </div>
      )}

      {/* --- Sub Tab 2: Examwise Leaderboard --- */}
      {activeSubTab === 'examwise' && (
        <div className="space-y-6">
          {/* Exam Selection Dropdown & Summary Stats */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-text-primary">পরীক্ষা নির্বাচন করুন</h3>
                <p className="text-xs text-text-secondary mt-0.5">যে পরীক্ষার মেধা তালিকা দেখতে চান তা নির্বাচন করুন।</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={currentExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition outline-none text-sm font-semibold text-text-primary bg-surface min-w-[220px] max-w-xs truncate"
                >
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {examStats && (
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/60">
                <div className="bg-surface-alt/40 p-3 rounded-xl border border-border/40 text-center">
                  <span className="text-[10px] font-bold text-text-secondary uppercase block">সর্বোচ্চ নম্বর</span>
                  <span className="text-lg font-black text-primary mt-0.5 block">
                    {toBengaliNumerals(examStats.highest)} / {toBengaliNumerals(totalMarks)}
                  </span>
                </div>
                <div className="bg-surface-alt/40 p-3 rounded-xl border border-border/40 text-center">
                  <span className="text-[10px] font-bold text-text-secondary uppercase block">গড় নম্বর</span>
                  <span className="text-lg font-black text-text-primary mt-0.5 block">
                    {toBengaliNumerals(examStats.average)}
                  </span>
                </div>
                <div className="bg-surface-alt/40 p-3 rounded-xl border border-border/40 text-center">
                  <span className="text-[10px] font-bold text-text-secondary uppercase block">মোট পরীক্ষার্থী</span>
                  <span className="text-lg font-black text-text-secondary mt-0.5 block">
                    {toBengaliNumerals(examStats.totalParticipants)} জন
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Exam Leaderboard Table */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            {examLeaderboard.length === 0 ? (
              <div className="p-12 text-center text-text-secondary flex flex-col items-center gap-2">
                <Trophy className="w-12 h-12 text-text-muted/65" />
                <p className="font-bold text-text-primary text-base">মেধা তালিকা ফাঁকা</p>
                <p className="text-xs">এই পরীক্ষার কোনো ফলাফল এন্ট্রি করা হয়নি।</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead>
                    <tr className="border-b border-border text-xs font-bold text-text-secondary bg-surface-alt/40 uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold text-center w-[100px] text-left">স্থান (Rank)</th>
                      <th className="px-6 py-4 font-semibold text-left">শিক্ষার্থীর নাম</th>
                      <th className="px-6 py-4 font-semibold text-center text-left">প্রাপ্ত নম্বর</th>
                      <th className="px-6 py-4 font-semibold text-center text-left">শতকরা (%)</th>
                      <th className="px-6 py-4 font-semibold text-center text-left">গ্রেড</th>
                      <th className="px-6 py-4 font-semibold text-right">অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-sm">
                    {examLeaderboard.map((student, idx) => {
                      const percent = student.participated 
                        ? Math.round(((student.marks_obtained ?? 0) / totalMarks) * 100)
                        : null;

                      let rankDisplay: React.ReactNode = <span className="text-text-muted/60">—</span>;
                      if (student.participated) {
                        const participantRank = examLeaderboard
                          .filter(s => s.participated)
                          .findIndex(s => s.student_id === student.student_id);
                        rankDisplay = renderRank(participantRank);
                      }

                      return (
                        <tr
                          key={student.student_id}
                          className={`hover:bg-surface-alt/25 transition-colors ${
                            student.participated && idx < 3 ? 'bg-primary-light/10' : ''
                          }`}
                        >
                          <td className="px-6 py-4 text-center align-middle">
                            {rankDisplay}
                          </td>
                          <td className="px-6 py-4 font-bold text-text-primary align-middle text-left">
                            {student.full_name}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-primary text-base align-middle text-left">
                            {student.participated ? `${toBengaliNumerals(student.marks_obtained)}` : '—'}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-text-secondary align-middle text-left">
                            {percent !== null ? `${toBengaliNumerals(percent)}%` : '—'}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-text-secondary align-middle text-left">
                            {student.grade ? (
                              <span className="px-2 py-0.5 rounded-lg border border-primary/20 bg-primary-light/40 text-xs font-bold text-primary">
                                {student.grade}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-6 py-4 text-right align-middle">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                              student.participated 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-red-50 text-error border-red-100'
                            }`}>
                              {student.participated ? 'উপস্থিত' : 'অনুপস্থিত'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Sub Tab 3: Pivot Performance Sheet --- */}
      {activeSubTab === 'pivot' && (
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          {leaderboard.length === 0 || exams.length === 0 ? (
            <div className="p-12 text-center text-text-secondary flex flex-col items-center gap-2">
              <Award className="w-12 h-12 text-text-muted/65" />
              <p className="font-bold text-text-primary text-base">ফলাফল গ্রিড ফাঁকা</p>
              <p className="text-xs">গ্রিড দেখার জন্য পরীক্ষা এবং ফলাফল উভয়ই এন্ট্রি করা থাকতে হবে।</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              <table className="w-full text-left border-collapse text-sm min-w-[650px]">
                <thead>
                  <tr className="border-b border-border text-xs font-bold text-text-secondary bg-surface-alt/40 uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold min-w-[180px] sticky left-0 bg-surface-alt/100 z-10">নাম</th>
                    {exams.map((exam) => (
                      <th key={exam.id} className="px-6 py-4 font-semibold text-center min-w-[130px]">
                        <div className="flex flex-col items-center">
                          <span className="block truncate max-w-[150px]">{exam.title}</span>
                          <span className="block text-[10px] text-text-muted mt-0.5 lowercase font-semibold">
                            (মোট: {toBengaliNumerals(exam.total_marks)})
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 font-semibold text-center min-w-[100px] bg-primary-light/30">মোট প্রাপ্ত</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {leaderboard.map((student) => {
                    const studentResults = results.filter(r => r.student_id === student.student_id);

                    return (
                      <tr key={student.student_id} className="hover:bg-surface-alt/25 transition-colors">
                        <td className="px-6 py-4 font-bold text-text-primary sticky left-0 bg-surface z-10 border-r border-border/40">
                          {student.full_name}
                        </td>
                        {exams.map((exam) => {
                          const result = studentResults.find(r => r.exam_id === exam.id);

                          return (
                            <td key={exam.id} className="px-6 py-4 text-center">
                              {result ? (
                                <div className="space-y-0.5">
                                  <span className="font-bold text-text-primary">
                                    {toBengaliNumerals(result.marks_obtained)}
                                  </span>
                                  {result.grade && (
                                    <span className="block text-[10px] text-primary font-bold">
                                      ({result.grade})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-text-muted/60">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 text-center bg-primary-light/10 font-bold text-primary text-base">
                          {toBengaliNumerals(student.total_marks)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Mobile scroll hint */}
              <p className="text-xs text-text-muted text-right md:hidden mt-1">&#8592; স্ক্রোল করুন &#8594;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
