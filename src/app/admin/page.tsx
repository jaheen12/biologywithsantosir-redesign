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
    .select('*, profiles:profiles!student_id(full_name, phone)')
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
    <div className="space-y-8 font-ui max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight font-ui">ড্যাশবোর্ড হোম</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl border border-border/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-xs font-bold text-text-secondary self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-primary" />
          <span>আজ: {formatBanglaDate(new Date().toISOString().split('T')[0])}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Active Students */}
        <div className="group bg-surface p-5 rounded-2xl border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-primary/30 hover:shadow-[0_8px_24px_rgba(26,122,94,0.04)] transition-all duration-300 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">মোট শিক্ষার্থী</span>
            <div className="text-3xl font-black text-text-primary tracking-tight">
              {toBengaliNumerals(totalStudents ?? 0)} <span className="text-sm font-semibold text-text-muted">জন</span>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-primary">সক্রিয় ভর্তি</span>
            </div>
          </div>
          <div className="p-3 bg-primary-light rounded-xl text-primary group-hover:scale-110 transition-transform duration-300 self-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Month's Revenue */}
        <div className="group bg-surface p-5 rounded-2xl border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-primary/30 hover:shadow-[0_8px_24px_rgba(26,122,94,0.04)] transition-all duration-300 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">চলতি মাসের আয়</span>
            <div className="text-3xl font-black text-text-primary tracking-tight flex items-baseline gap-0.5">
              <span className="text-2xl font-bold text-primary">৳</span>
              {toBengaliNumerals(revenueThisMonth)}
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-mid"></span>
              <span className="text-xs font-semibold text-text-secondary">{currentMonthBn}</span>
            </div>
          </div>
          <div className="p-3 bg-primary-light rounded-xl text-primary group-hover:scale-110 transition-transform duration-300 self-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Overdue Students */}
        <div className={`group bg-surface p-5 rounded-2xl border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 flex items-center justify-between ${
          (overdueCount ?? 0) > 0
            ? 'hover:border-error/20 hover:shadow-[0_8px_24px_rgba(217,64,64,0.03)]'
            : 'hover:border-primary/30 hover:shadow-[0_8px_24px_rgba(26,122,94,0.04)]'
        }`}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">বকেয়া বেতন</span>
            <div className={`text-3xl font-black tracking-tight ${(overdueCount ?? 0) > 0 ? 'text-error' : 'text-text-primary'}`}>
              {toBengaliNumerals(overdueCount ?? 0)} <span className="text-sm font-semibold text-text-muted">জন</span>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${(overdueCount ?? 0) > 0 ? 'bg-error animate-pulse' : 'bg-text-muted'}`}></span>
              <span className="text-xs font-semibold text-text-secondary">অপরিশোধিত তালিকা</span>
            </div>
          </div>
          <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 self-center ${
            (overdueCount ?? 0) > 0 ? 'bg-red-50 text-error' : 'bg-primary-light text-primary'
          }`}>
            <UserX className="w-5 h-5" />
          </div>
        </div>

        {/* Unreconciled Payments */}
        <div className="group bg-surface p-5 rounded-2xl border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-accent/30 hover:shadow-[0_8px_24px_rgba(240,165,0,0.04)] transition-all duration-300 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">পেমেন্ট যাচাই</span>
            <div className={`text-3xl font-black tracking-tight ${(unreconciledCount ?? 0) > 0 ? 'text-accent' : 'text-text-primary'}`}>
              {toBengaliNumerals(unreconciledCount ?? 0)} <span className="text-sm font-semibold text-text-muted">টি</span>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${(unreconciledCount ?? 0) > 0 ? 'bg-accent animate-pulse' : 'bg-text-muted'}`}></span>
              <span className="text-xs font-semibold text-text-secondary">bKash/Nagad ট্রানজেকশন</span>
            </div>
          </div>
          <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 self-center ${ (unreconciledCount ?? 0) > 0 ? 'bg-accent-light text-accent' : 'bg-surface-alt text-text-muted'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column: Overdue Table + Unreconciled Feed */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          {/* Overdue Table */}
          <div className="bg-surface rounded-2xl border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-6 py-5 border-b border-border/60 bg-surface flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text-primary font-ui tracking-tight">বেতন বকেয়া তালিকা</h2>
                {overdueCount !== null && overdueCount > 0 && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-error/10 text-error rounded-full">
                    {toBengaliNumerals(overdueCount)} জন
                  </span>
                )}
              </div>
              {overdueStudents.length > 0 && (
                <Link href="/admin/payments" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 group">
                  সব দেখুন <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead>
                    <tr className="bg-surface-alt/60 border-b border-border/60">
                      <th className="px-6 py-3.5 text-xs font-bold text-text-secondary uppercase tracking-wider">শিক্ষার্থীর নাম</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-text-secondary uppercase tracking-wider">ব্যাচ</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-text-secondary uppercase tracking-wider">বাকির পরিমাণ</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {overdueStudents.map((student) => {
                      const initial = student.full_name ? student.full_name.charAt(0) : 'শ';
                      const bgColors = [
                        'bg-emerald-50 text-emerald-700 border-emerald-100',
                        'bg-blue-50 text-blue-700 border-blue-100',
                        'bg-purple-50 text-purple-700 border-purple-100',
                        'bg-amber-50 text-amber-700 border-amber-100',
                        'bg-rose-50 text-rose-700 border-rose-100'
                      ];
                      const colorIndex = (student.full_name?.length || 0) % bgColors.length;
                      const colorClass = bgColors[colorIndex];

                      return (
                        <tr key={student.student_id} className="hover:bg-surface-alt/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border ${colorClass} shrink-0`}>
                                {initial}
                              </div>
                              <div>
                                <div className="font-bold text-sm text-text-primary">{student.full_name}</div>
                                <div className="text-xs text-text-muted mt-0.5 font-mono">{student.phone || 'মোবাইল নেই'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            <span className="inline-block border border-border/80 bg-surface-alt/50 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                              {student.batch_name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-black text-text-primary">
                            <span className="font-bold text-text-secondary mr-0.5">৳</span>
                            {toBengaliNumerals(student.outstanding)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/admin/payments/new?student_id=${student.student_id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark shadow-xs hover:shadow-sm transition-all duration-200"
                            >
                              পেমেন্ট নিন →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Unreconciled Feed */}
          <div className="bg-surface rounded-2xl border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-6 py-5 border-b border-border/60 bg-surface flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text-primary font-ui tracking-tight">bKash/Nagad যাচাই বাকি</h2>
                {unreconciledCount !== null && unreconciledCount > 0 && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-accent-light text-accent rounded-full border border-accent/20">
                    {toBengaliNumerals(unreconciledCount)} টি
                  </span>
                )}
              </div>
              {unreconciledPayments.length > 0 && (
                <Link href="/admin/payments/reconcile" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 group">
                  যাচাই প্যানেল <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
              <div className="divide-y divide-border/50">
                {unreconciledPayments.map((payment) => {
                  const isBkash = payment.method === 'bKash';
                  const isNagad = payment.method === 'Nagad';
                  
                  const methodColor = isBkash 
                    ? 'bg-[#e2125f]/10 text-[#e2125f] border border-[#e2125f]/20' 
                    : isNagad 
                      ? 'bg-[#f47321]/10 text-[#f47321] border border-[#f47321]/20' 
                      : 'bg-primary-light text-primary border border-primary/20';

                  const accentBarColor = isBkash ? 'border-l-4 border-l-[#e2125f]' : 'border-l-4 border-l-[#f47321]';

                  return (
                    <div key={payment.id} className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-alt/30 transition-colors ${accentBarColor}`}>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-sm text-text-primary">
                            {payment.profiles?.full_name || 'অজানা শিক্ষার্থী'}
                          </span>
                          <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md ${methodColor}`}>
                            {payment.method}
                          </span>
                        </div>
                        <div className="text-xs text-text-muted mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>TrxID: <span className="font-mono text-text-secondary font-bold bg-surface-alt px-1.5 py-0.5 rounded border border-border/50 text-[10px]">{payment.transaction_id}</span></span>
                          <span className="text-text-muted/60">•</span>
                          <span>তারিখ: {formatBanglaDate(payment.paid_on)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-border/50 sm:border-0 pt-3 sm:pt-0 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">আমানত</span>
                          <span className="text-lg font-black text-text-primary">
                            <span className="font-bold text-primary mr-0.5">৳</span>
                            {toBengaliNumerals(payment.amount)}
                          </span>
                        </div>
                        <Link 
                          href={`/admin/payments/reconcile`}
                          className="px-4 py-2 bg-surface hover:bg-surface-alt text-text-primary hover:text-primary border border-border/80 hover:border-primary/45 text-xs font-bold rounded-xl shadow-2xs hover:shadow-xs transition-all duration-200"
                        >
                          যাচাই করুন →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Batch Capacity + Upcoming Exams */}
        <div className="space-y-6 md:space-y-8">
          
          {/* Batch Capacity Overview */}
          <div className="bg-surface p-6 rounded-2xl border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <h2 className="text-base font-bold text-text-primary mb-5 flex items-center gap-2 tracking-tight">
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
                  let barColorClass = 'bg-emerald-500';
                  let badgeBgClass = 'bg-primary-light text-primary border border-primary/20';
                  
                  if (seatsRemaining <= 5) {
                    barColorClass = 'bg-error';
                    badgeBgClass = 'bg-red-50 text-error border border-error/20';
                  } else if (seatsRemaining <= 15) {
                    barColorClass = 'bg-accent';
                    badgeBgClass = 'bg-accent-light text-accent border border-accent/20';
                  }

                  return (
                    <div key={batch.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="font-bold text-text-primary truncate max-w-[130px]" title={batch.name}>
                          {batch.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${badgeBgClass}`}>
                            অবশিষ্ট আসন: {toBengaliNumerals(seatsRemaining)}
                          </span>
                          <span className="font-bold text-text-muted text-[10px] bg-surface-alt border border-border/60 px-1.5 py-0.5 rounded-md">
                            {toBengaliNumerals(percent)}% পূর্ণ
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress Bar Container */}
                      <div className="relative w-full h-2 bg-surface-alt rounded-full overflow-hidden border border-border/30 shadow-inner">
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
          <div className="bg-surface p-6 rounded-2xl border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2 tracking-tight">
                <Calendar className="w-5 h-5 text-primary" />
                <span>আসন্ন পরীক্ষা</span>
              </h2>
              {upcomingExams.length > 0 && (
                <Link href="/admin/exams" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
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
                  className="mt-3 inline-block text-xs font-bold text-primary hover:underline"
                >
                  পরীক্ষা তৈরি করুন →
                </Link>
              </div>
            ) : (
              <div className="relative pl-1 space-y-5 after:absolute after:top-2 after:bottom-10 after:left-[27px] after:w-0.5 after:bg-border/60">
                {upcomingExams.map((exam) => {
                  const dateObj = new Date(exam.exam_date);
                  const dayBn = toBengaliNumerals(dateObj.getDate());
                  const monthBn = dateObj.toLocaleDateString('bn-BD', { month: 'short' });

                  const isWritten = exam.type?.toLowerCase().includes('written') || false;
                  const headerColor = isWritten ? 'bg-blue-600' : 'bg-primary';

                  return (
                    <div key={exam.id} className="relative z-10 flex items-center gap-3 py-1 hover:bg-surface-alt/50 p-2 rounded-xl transition-colors duration-150 border border-transparent hover:border-border/30">
                      <div className="flex flex-col items-center justify-center bg-surface border border-border/80 rounded-xl min-w-[54px] text-center overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.02)] shrink-0">
                        <div className={`w-full py-1 text-[8px] font-black text-white ${headerColor} uppercase tracking-wider leading-none`}>
                          {exam.type || 'EXAM'}
                        </div>
                        <div className="py-2 px-1 flex flex-col items-center justify-center bg-surface-alt/40 w-full">
                          <span className="text-sm font-black text-text-primary leading-none">{dayBn}</span>
                          <span className="text-[9px] font-bold text-text-muted mt-1 leading-none">{monthBn}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-text-primary truncate" title={exam.title}>
                          {exam.title}
                        </h3>
                        <div className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1.5">
                          <span className="bg-surface-alt border border-border/80 px-1.5 py-0.5 rounded text-[9px] font-semibold text-text-secondary">
                            {exam.batches?.name || 'সব ব্যাচ'}
                          </span>
                          <span>•</span>
                          <span>নম্বর: {toBengaliNumerals(exam.total_marks)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <Link 
                  href="/admin/exams"
                  className="w-full py-2 border border-dashed border-border hover:border-primary/50 hover:text-primary rounded-xl text-center text-xs font-bold text-text-secondary mt-2 block transition-all duration-150"
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
