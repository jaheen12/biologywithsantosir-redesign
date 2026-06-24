import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ResultsClient from '@/components/admin/ResultsClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ exam_id?: string }>;
}

export default async function AdminResultsPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route Guard: Admin only
  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Await search params for exam selection
  const resolvedSearchParams = await searchParams;
  const examId = resolvedSearchParams.exam_id;

  // 1. Fetch all exams (with batch name) to show in the dropdown selector
  const { data: examsRaw } = await supabase
    .from('exams')
    .select('id, title, exam_date, total_marks, batch_id, batches(name)')
    .order('exam_date', { ascending: false });

  const exams = (examsRaw || []).map((exam: any) => ({
    id: exam.id,
    title: exam.title,
    exam_date: exam.exam_date,
    total_marks: exam.total_marks,
    batch_id: exam.batch_id,
    batch_name: exam.batches?.name || 'অজানা ব্যাচ',
  }));

  // Identify the selected exam (defaults to the most recent one)
  const selectedExam = exams.find((e) => e.id === examId) ?? exams[0];

  // 2. Fetch enrolled students and existing results if an exam is selected
  let enrolledStudents: any[] = [];
  let existingResults: any[] = [];

  if (selectedExam) {
    // Query active student enrollments for this batch
    const { data: enrollmentsRaw } = await supabase
      .from('enrollments')
      .select('student_id, profiles!student_id(full_name, phone)')
      .eq('batch_id', selectedExam.batch_id)
      .eq('status', 'active');

    enrolledStudents = (enrollmentsRaw || []).map((e: any) => ({
      student_id: e.student_id,
      full_name: e.profiles?.full_name || 'অজানা শিক্ষার্থী',
      phone: e.profiles?.phone || '',
    })).sort((a, b) => a.full_name.localeCompare(b.full_name));

    // Query existing results for this exam
    const { data: resultsRaw } = await supabase
      .from('results')
      .select('student_id, marks_obtained, remarks, grade')
      .eq('exam_id', selectedExam.id);

    existingResults = resultsRaw || [];
  }

  return (
    <div className="space-y-8 font-ui">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">ফলাফল এন্ট্রি বোর্ড</h1>
        <p className="text-text-secondary text-sm mt-1">
          একটি নির্দিষ্ট পরীক্ষা সিলেক্ট করুন এবং সব শিক্ষার্থীর প্রাপ্ত নম্বর ও মন্তব্য একবারে সংরক্ষণ করুন।
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-secondary shadow-sm flex flex-col items-center gap-2">
          <p className="font-bold text-text-primary text-base">কোনো পরীক্ষা পাওয়া যায়নি</p>
          <p className="text-xs">ফলাফল প্রবেশ করার আগে প্রথমে পরীক্ষা তালিকায় একটি পরীক্ষা তৈরি করুন।</p>
          <Link 
            href="/admin/exams" 
            className="mt-3 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition"
          >
            পরীক্ষা তৈরি করুন
          </Link>
        </div>
      ) : (
        <Suspense fallback={
          <div className="flex items-center justify-center p-12 bg-surface border border-border rounded-2xl shadow-sm">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <ResultsClient 
            exams={exams}
            selectedExam={selectedExam}
            enrolledStudents={enrolledStudents}
            initialResults={existingResults}
          />
        </Suspense>
      )}
    </div>
  );
}

// Helper inline Link import since we reference it in the empty state
import Link from 'next/link';
