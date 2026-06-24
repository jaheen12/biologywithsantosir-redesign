import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import dynamic from 'next/dynamic';
import {
  Users,
  TrendingUp, 
  AlertTriangle, 
  CheckSquare, 
  Calendar, 
  ArrowRight,
  UserX,
  CreditCard,
  Percent,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { toBengaliNumerals, formatBanglaDate } from '@/lib/bangla';

interface OverdueStudent {
  student_id: string;
  full_name: string;
  phone: string | null;
  batch_id: string;
  batch_name: string;
  monthly_fee: number;
  due_month: string;
  paid_this_month: number;
  outstanding: number;
  status: 'paid' | 'partial' | 'overdue';
}

interface UnreconciledPayment {
  id: string;
  student_id: string;
  amount: number;
  month: string;
  paid_on: string;
  method: string;
  transaction_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    phone: string | null;
  } | null;
}

interface UpcomingExam {
  id: string;
  title: string;
  exam_date: string;
  total_marks: number;
  type: string;
  batches: {
    name: string;
  } | null;
}

interface BatchCapacity {
  id: string;
  name: string;
  capacity: number;
  enrolled_count: number;
  seats_remaining: number;
}

// Local helpers removed, imported from bangla.ts

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // 1. KPI Data: Total Active Students
  const { count: totalStudents } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // 2. KPI Data: Revenue this month
  const now = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonth = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  const currentMonthBn = now.toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });

  const { data: revenueData } = await supabase
    .from('payments')
    .select('amount')
    .eq('month', currentMonth);
  const revenueThisMonth = revenueData?.reduce((s: number, r) => s + Number(r.amount), 0) ?? 0;

  // 3. KPI Data: Overdue students count
  const { count: overdueCount } = await supabase
    .from('payment_due')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'overdue');

  // 4. KPI Data: Unreconciled bKash/Nagad payments count
  const { count: unreconciledCount } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('reconciled', false)
    .in('method', ['bKash', 'Nagad']);

  // 5. Overdue student list (top 10)
  const { data: overdueStudentsRaw } = await supabase
    .from('payment_due')
    .select('*')
    .eq('status', 'overdue')
    .limit(10);
  const overdueStudents = (overdueStudentsRaw as unknown as OverdueStudent[]) || [];

  // 6. Unreconciled payment list (top 5)
  const { data: unreconciledPaymentsRaw } = await supabase
    .from('payments')
    .select('*, profiles(full_name, phone)')
    .eq('reconciled', false)
    .in('method', ['bKash', 'Nagad'])
    .order('created_at', { ascending: false })
    .limit(5);
  const unreconciledPayments = (unreconciledPaymentsRaw as unknown as UnreconciledPayment[]) || [];

  // 7. Upcoming exams (from today onwards, next 5 exams)
  const todayStr = now.toISOString().split('T')[0];
  const { data: upcomingExamsRaw } = await supabase
    .from('exams')
    .select('*, batches(name)')
    .gte('exam_date', todayStr)
    .order('exam_date')
    .limit(5);
  const upcomingExams = (upcomingExamsRaw as unknown as UpcomingExam[]) || [];

  // 8. Batch capacity overview
  const { data: batchesRaw } = await supabase
    .from('batches_with_counts')
    .select('id, name, enrolled_count, capacity, seats_remaining')
    .eq('is_active', true);
  const batches = (batchesRaw as unknown as BatchCapacity[]) || [];

  return (
    <div className="space-y-8 font-ui">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">ড্যাশবোর্ড হোম</h1>
        <p className="text-text-secondary text-sm mt-1">
          বায়োলজি উইথ সায়ন্ত স্যার এডমিন প্যানেল। এখানে আজকের কার্যক্রমের একটি সারসংক্ষেপ দেওয়া হলো।
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* Total Active Students */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">মোট শিক্ষার্থী</span>
            <span className="text-3xl font-bold text-text-primary mt-1 block">
              {toBengaliNumerals(totalStudents ?? 0)} <span className="text-base font-medium text-text-secondary">জন</span>
            </span>
            <span className="text-xs text-primary font-medium mt-1 inline-block">সক্রিয় ভর্তি</span>
          </div>
          <div className="p-3.5 bg-primary-light rounded-xl text-primary">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Month's Revenue */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">এ মাসের আয়</span>
            <span className="text-3xl font-bold text-text-primary mt-1 block flex items-baseline">
              <span className="font-bold text-primary mr-0.5 text-2xl">৳</span>
              {toBengaliNumerals(revenueThisMonth)}
            </span>
            <span className="text-xs text-text-secondary mt-1 inline-block">{currentMonthBn}</span>
          </div>
          <div className="p-3.5 bg-primary-light rounded-xl text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Students */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">বেতন বাকি</span>
            <span className={`text-3xl font-bold mt-1 block ${(overdueCount ?? 0) > 0 ? 'text-error animate-pulse' : 'text-text-primary'}`}>
              {toBengaliNumerals(overdueCount ?? 0)} <span className="text-base font-medium text-text-secondary">জন</span>
            </span>
            <span className="text-xs text-text-secondary mt-1 inline-block">এই মাসে অপরিশোধিত</span>
          </div>
          <div className={`p-3.5 rounded-xl ${ (overdueCount ?? 0) > 0 ? 'bg-error/10 text-error' : 'bg-surface-alt text-text-muted'}`}>
            <UserX className="w-6 h-6" />
          </div>
        </div>

        {/* Unreconciled Payments */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">যাচাই বাকি</span>
            <span className={`text-3xl font-bold mt-1 block ${(unreconciledCount ?? 0) > 0 ? 'text-accent' : 'text-text-primary'}`}>
              {toBengaliNumerals(unreconciledCount ?? 0)} <span className="text-base font-medium text-text-secondary">টি</span>
            </span>
            <span className="text-xs text-text-secondary mt-1 inline-block">bKash/Nagad পেমেন্ট</span>
          </div>
          <div className={`p-3.5 rounded-xl ${ (unreconciledCount ?? 0) > 0 ? 'bg-accent-light text-accent' : 'bg-surface-alt text-text-muted'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Overdue Table + Unreconciled Feed */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Overdue Table */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-surface flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span>⚠️ এই মাসের বেতন বাকি আছে</span>
                {overdueCount !== null && overdueCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-error/10 text-error rounded-full">
                    {toBengaliNumerals(overdueCount)} জন
                  </span>
                )}
              </h2>
              {overdueStudents.length > 0 && (
                <Link href="/admin/payments" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  সব দেখুন <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            
            {overdueStudents.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-text-primary font-bold text-sm">সকলের পেমেন্ট সম্পন্ন ✓</p>
                <p className="text-text-secondary text-xs mt-1">এই মাসের জন্য কোনো শিক্ষার্থীর বেতন বাকি নেই।</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead>
                    <tr className="bg-surface-alt border-b border-border">
                      <th className="px-6 py-3.5 text-xs font-bold text-text-secondary uppercase">শিক্ষার্থীর নাম</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-text-secondary uppercase">ব্যাচ</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-text-secondary uppercase">বাকির পরিমাণ</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-text-secondary uppercase text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {overdueStudents.map((student) => (
                      <tr key={student.student_id} className="hover:bg-surface-alt/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-sm text-text-primary">{student.full_name}</div>
                          <div className="text-xs text-text-muted mt-0.5">{student.phone || 'মোবাইল নেই'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {student.batch_name}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-error">
                          <span className="font-bold text-error mr-0.5">৳</span>
                          {toBengaliNumerals(student.outstanding)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/payments/new?student_id=${student.student_id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition duration-150"
                          >
                            পেমেন্ট নিন →
                          </Link>
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

          {/* Unreconciled Feed */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-surface flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span>📱 bKash/Nagad যাচাই বাকি</span>
                {unreconciledCount !== null && unreconciledCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-accent-light text-accent rounded-full">
                    {toBengaliNumerals(unreconciledCount)} টি
                  </span>
                )}
              </h2>
              {unreconciledPayments.length > 0 && (
                <Link href="/admin/payments/reconcile" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  যাচাই প্যানেল <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {unreconciledPayments.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-text-primary font-bold text-sm">কোনো পেন্ডিং ট্রানজেকশন নেই</p>
                <p className="text-text-secondary text-xs mt-1">সব মোবাইল ব্যাংকিং পেমেন্ট যাচাই করা হয়েছে।</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {unreconciledPayments.map((payment) => (
                  <div key={payment.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-alt/20 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-text-primary">
                          {payment.profiles?.full_name || 'অজানা শিক্ষার্থী'}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-primary-light text-primary">
                          {payment.method}
                        </span>
                      </div>
                      <div className="text-xs text-text-muted mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span>TrxID: <span className="font-mono text-text-secondary font-semibold">{payment.transaction_id}</span></span>
                        <span>তারিখ: {formatBanglaDate(payment.paid_on)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border sm:border-0 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-text-secondary block">আমানত</span>
                        <span className="text-base font-bold text-text-primary">
                          <span className="font-bold text-primary mr-0.5">৳</span>
                          {toBengaliNumerals(payment.amount)}
                        </span>
                      </div>
                      <Link 
                        href={`/admin/payments/reconcile`}
                        className="px-3 py-1.5 border border-border text-text-primary text-xs font-semibold rounded-lg hover:bg-surface-alt hover:text-primary transition duration-150"
                      >
                        যাচাই করুন →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Batch Capacity + Upcoming Exams */}
        <div className="space-y-8">
          
          {/* Batch Capacity Overview */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
            <h2 className="text-base font-bold text-text-primary mb-5 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <span>ব্যাচের আসন সংখ্যা</span>
            </h2>
            
            {batches.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">কোনো সক্রিয় ব্যাচ পাওয়া যায়নি।</p>
            ) : (
              <div className="space-y-5">
                {batches.map((batch) => {
                  const percent = Math.min(100, Math.round((batch.enrolled_count / batch.capacity) * 100));
                  const seatsRemaining = batch.seats_remaining;
                  
                  // Color configuration based on seats remaining
                  let barColorClass = 'bg-primary';
                  let textColorClass = 'text-primary';
                  let badgeBgClass = 'bg-primary-light text-primary';
                  
                  if (seatsRemaining <= 5) {
                    barColorClass = 'bg-error';
                    textColorClass = 'text-error';
                    badgeBgClass = 'bg-error/10 text-error';
                  } else if (seatsRemaining <= 10) {
                    barColorClass = 'bg-accent';
                    textColorClass = 'text-accent';
                    badgeBgClass = 'bg-accent-light text-accent';
                  }

                  return (
                    <div key={batch.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-text-primary truncate max-w-[130px]" title={batch.name}>
                          {batch.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${badgeBgClass}`}>
                          অবশিষ্ট আসন: {toBengaliNumerals(seatsRemaining)}
                        </span>
                      </div>
                      
                      {/* Progress Bar Container */}
                      <div className="relative w-full h-2.5 bg-surface-alt rounded-full overflow-hidden border border-border/50">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px] text-text-secondary">
                        <span>ভর্তি: {toBengaliNumerals(batch.enrolled_count)} জন</span>
                        <span>আসন: {toBengaliNumerals(batch.capacity)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Exams Widget */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>আসন্ন পরীক্ষা</span>
              </h2>
              {upcomingExams.length > 0 && (
                <Link href="/admin/exams" className="text-xs font-bold text-primary hover:underline">
                  সব দেখুন
                </Link>
              )}
            </div>

            {upcomingExams.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-text-secondary text-sm font-semibold">কোনো আসন্ন পরীক্ষা নেই</p>
                <p className="text-text-muted text-xs mt-1">সব শিডিউল সম্পন্ন হয়েছে।</p>
                <Link 
                  href="/admin/exams" 
                  className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
                >
                  পরীক্ষা তৈরি করুন →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className="border-l-2 border-primary pl-3 py-0.5 space-y-1">
                    <h3 className="text-xs font-bold text-text-primary truncate" title={exam.title}>
                      {exam.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-text-secondary">
                      <span>ব্যাচ: {exam.batches?.name || 'সব ব্যাচ'}</span>
                      <span className="font-semibold">{formatBanglaDate(exam.exam_date)}</span>
                    </div>
                  </div>
                ))}
                
                <Link 
                  href="/admin/exams"
                  className="w-full py-2 border border-dashed border-border hover:border-primary hover:text-primary rounded-xl text-center text-xs font-semibold text-text-secondary mt-2 block transition-all duration-150"
                >
                  পরীক্ষা পরিচালনা করুন →
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
