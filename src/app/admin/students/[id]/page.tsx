import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Phone, 
  CreditCard, 
  CheckSquare, 
  Award,
  Clock,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface EnrollmentDetail {
  id: string;
  status: 'active' | 'dropped' | 'completed';
  enrolled_at: string;
  batches: {
    name: string;
  } | null;
}

interface PaymentDetail {
  id: string;
  amount: number;
  month: string;
  method: string;
  paid_on: string;
  receipt_number: string;
}

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

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  const resolvedParams = await params;
  const studentId = resolvedParams.id;

  // 1. Fetch student profile, join enrollments and payments
  const { data: student } = await supabase
    .from('profiles')
    .select(`
      *, 
      enrollments(*, batches(name)),
      payments(amount, month, method, paid_on, receipt_number, id)
    `)
    .eq('id', studentId)
    .single();

  if (!student) {
    redirect('/admin/students');
  }

  // 2. Fetch attendance this month
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { data: attendanceRaw } = await supabase
    .from('attendance')
    .select('status')
    .eq('student_id', studentId)
    .gte('date', startOfMonth);

  const attendance = attendanceRaw || [];
  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const absentCount = attendance.filter((a) => a.status === 'absent').length;
  const lateCount = attendance.filter((a) => a.status === 'late').length;
  const totalClasses = attendance.length;

  const enrollments = (student.enrollments as unknown as EnrollmentDetail[]) || [];
  const payments = (student.payments as unknown as PaymentDetail[]) || [];
  
  // Sort payments descending by paid_on/created_at, limit to 5
  const lastPayments = [...payments]
    .sort((a, b) => new Date(b.paid_on).getTime() - new Date(a.paid_on).getTime())
    .slice(0, 5);

  const activeEnrollment = enrollments.find((e) => e.status === 'active');

  return (
    <div className="space-y-8 font-ui">
      {/* Back Button */}
      <div>
        <Link 
          href="/admin/students" 
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary font-semibold text-sm transition duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>শিক্ষার্থী তালিকায় ফিরুন</span>
        </Link>
      </div>

      {/* Header Profile Section */}
      <div className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-2xl border border-primary/20">
            {student.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-text-primary">{student.full_name}</h1>
              {activeEnrollment ? (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-primary-light text-primary rounded-full">
                  সক্রিয় শিক্ষার্থী
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-surface-alt text-text-muted rounded-full">
                  ভর্তি নেই
                </span>
              )}
            </div>
            <div className="text-xs text-text-secondary mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-text-muted" />
                {student.phone || 'মোবাইল নেই'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                নিবন্ধনের তারিখ: {formatBanglaDate(student.created_at)}
              </span>
            </div>
          </div>
        </div>

        {activeEnrollment && (
          <Link
            href={`/admin/payments/new?student_id=${student.id}`}
            className="px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-dark transition duration-150 inline-flex items-center gap-2 justify-center"
          >
            <CreditCard className="w-4 h-4" />
            <span>নতুন পেমেন্ট নিন</span>
          </Link>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns (Details & Logs) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Last 5 Payments */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-surface flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span>সাম্প্রতিক পেমেন্ট সমূহ (সর্বোচ্চ ৫টি)</span>
              </h2>
            </div>
            
            {lastPayments.length === 0 ? (
              <p className="p-8 text-center text-xs text-text-muted font-medium">কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-alt border-b border-border text-xs font-bold text-text-secondary uppercase">
                      <th className="px-6 py-3.5">পেমেন্ট মাস</th>
                      <th className="px-6 py-3.5">পরিমাণ</th>
                      <th className="px-6 py-3.5">পদ্ধতি</th>
                      <th className="px-6 py-3.5">তারিখ</th>
                      <th className="px-6 py-3.5 text-right">রশিদ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {lastPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-surface-alt/25 transition-colors">
                        <td className="px-6 py-4 font-semibold text-text-primary">
                          {payment.month}
                        </td>
                        <td className="px-6 py-4 font-semibold text-text-primary">
                          <span className="font-bold text-primary mr-0.5">৳</span>
                          {toBengaliNumerals(payment.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 text-xs font-bold rounded bg-primary-light text-primary uppercase">
                            {payment.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {formatBanglaDate(payment.paid_on)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/payments/${payment.id}/receipt`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                          >
                            <span>রশিদ {toBengaliNumerals(payment.receipt_number)}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Enrollment History */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-surface flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-text-primary">ভর্তির ইতিহাস (Enrollment History)</h2>
            </div>
            
            {enrollments.length === 0 ? (
              <p className="p-8 text-center text-xs text-text-muted font-medium">শিক্ষার্থী কোনো ব্যাচে ভর্তি হননি।</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-alt border-b border-border text-xs font-bold text-text-secondary uppercase">
                      <th className="px-6 py-3.5">ব্যাচের নাম</th>
                      <th className="px-6 py-3.5">ভর্তির তারিখ</th>
                      <th className="px-6 py-3.5 text-right">অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-surface-alt/25 transition-colors">
                        <td className="px-6 py-4 font-semibold text-text-primary">
                          {enrollment.batches?.name || 'অজানা ব্যাচ'}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {formatBanglaDate(enrollment.enrolled_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            enrollment.status === 'active' 
                              ? 'bg-primary-light text-primary' 
                              : enrollment.status === 'dropped' 
                              ? 'bg-error/10 text-error' 
                              : 'bg-surface-alt text-text-secondary'
                          }`}>
                            {enrollment.status === 'active' 
                              ? 'সক্রিয়' 
                              : enrollment.status === 'dropped' 
                              ? 'বাদ পড়েছে' 
                              : 'সম্পন্ন'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Attendance & Stats) */}
        <div>
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-6">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              <span>এ মাসের উপস্থিতি</span>
            </h2>

            {totalClasses === 0 ? (
              <div className="text-center py-6 text-text-muted text-xs">
                এই মাসে এখনো কোনো ক্লাসের উপস্থিতি রেকর্ড করা হয়নি।
              </div>
            ) : (
              <div className="space-y-5">
                {/* Attendance Rate */}
                <div className="text-center pb-4 border-b border-border">
                  <span className="text-3xl font-extrabold text-text-primary block">
                    {toBengaliNumerals(Math.round(((presentCount + lateCount) / totalClasses) * 100))}%
                  </span>
                  <span className="text-xs text-text-secondary font-medium mt-1 inline-block">উপস্থিতির হার</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="bg-primary-light p-3 rounded-xl border border-primary/10">
                    <span className="font-bold text-primary text-base block">{toBengaliNumerals(presentCount)}</span>
                    <span className="text-[10px] text-text-secondary block mt-0.5">উপস্থিত</span>
                  </div>
                  <div className="bg-accent-light p-3 rounded-xl border border-accent/10">
                    <span className="font-bold text-accent text-base block">{toBengaliNumerals(lateCount)}</span>
                    <span className="text-[10px] text-text-secondary block mt-0.5">দেরি</span>
                  </div>
                  <div className="bg-error/10 p-3 rounded-xl border border-error/10">
                    <span className="font-bold text-error text-base block">{toBengaliNumerals(absentCount)}</span>
                    <span className="text-[10px] text-text-secondary block mt-0.5">অনুপস্থিত</span>
                  </div>
                </div>

                <div className="text-[11px] text-text-muted text-center">
                  মোট ক্লাস রেকর্ড: {toBengaliNumerals(totalClasses)} টি
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
