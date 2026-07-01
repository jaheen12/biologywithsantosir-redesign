import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Receipt, 
  Calendar,
  History,
  FileText
} from 'lucide-react';

import MakePaymentModal from '@/components/dashboard/MakePaymentModal';

const monthMap: Record<string, string> = {
  'January': 'জানুয়ারি',
  'February': 'ফেব্রুয়ারি',
  'March': 'মার্চ',
  'April': 'এপ্রিল',
  'May': 'মে',
  'June': 'জুন',
  'July': 'জুলাই',
  'August': 'আগস্ট',
  'September': 'সেপ্টেম্বর',
  'October': 'অক্টোবর',
  'November': 'নভেম্বর',
  'December': 'ডিসেম্বর'
};

interface PaymentRecord {
  id: string;
  student_id: string;
  batch_id: string;
  amount: number | string;
  month: string;
  paid_on: string;
  method: 'bKash' | 'Nagad' | 'cash' | 'bank';
  is_installment: boolean;
  installment_number: number | null;
  transaction_id: string | null;
  reconciled: boolean;
  receipt_number: string | null;
  batches: {
    name: string;
    fee: number | string;
  } | null;
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

// Formats price with bold BDT symbol
function formatPrice(amount: number | string | null | undefined) {
  if (amount === null || amount === undefined) return '';
  const formatted = toBengaliNumerals(amount);
  return (
    <span className="font-semibold text-text-primary">
      <strong className="font-bold text-primary mr-0.5">৳</strong>
      {formatted}
    </span>
  );
}

// Formats month year strings to Bangla (e.g. "June 2026" -> "জুন ২০২৬")
function formatMonth(monthYear: string | null | undefined) {
  if (!monthYear) return '';
  const parts = monthYear.trim().split(/\s+/);
  if (parts.length < 2) return monthYear;
  const month = parts[0];
  const year = parts[1];
  const banglaMonth = monthMap[month] || month;
  const banglaYear = toBengaliNumerals(year);
  return `${banglaMonth} ${banglaYear}`;
}

// Formats date string into Bangla format (e.g. "2026-06-10" -> "১০ জুন ২০২৬")
function formatBanglaDate(dateStr: string | null | undefined) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Helper to mask Transaction IDs (e.g. "TRX123456" -> "****3456")
function maskTransactionId(trxId: string | null | undefined, method: string) {
  if (method === 'cash') return 'নগদ';
  if (!trxId) return '—';
  const cleanTrx = trxId.trim();
  if (cleanTrx.length <= 4) return cleanTrx;
  return `****${cleanTrx.slice(-4)}`;
}

export default async function PaymentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Current month status
  const { data: dueStatus } = await supabase
    .from('payment_due')
    .select('*')
    .eq('student_id', user.id)
    .maybeSingle();

  // Fetch enrollment details to get enrolled_at and batch_id
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('enrolled_at, batch_id')
    .eq('student_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  // Fetch student profile to get batch_id if enrollment is not available
  const { data: profile } = await supabase
    .from('profiles')
    .select('batch_id')
    .eq('id', user.id)
    .single();

  const studentBatchId = dueStatus?.batch_id || enrollment?.batch_id || profile?.batch_id || null;

  // 2. Full payment history, newest first
  const { data: paymentsData } = await supabase
    .from('payments')
    .select('*, batches(name, fee)')
    .eq('student_id', user.id)
    .order('paid_on', { ascending: false });

  const payments = paymentsData as unknown as PaymentRecord[] | null;

  // Generate due months list
  const unpaidMonths: Array<{
    month: string;
    fee: number;
    paid: number;
    outstanding: number;
    status: 'overdue' | 'partial';
  }> = [];

  if (enrollment && dueStatus) {
    const enrolledDate = new Date(enrollment.enrolled_at || new Date().toISOString());
    const today = new Date();
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    const monthlyFee = Number(dueStatus.monthly_fee);
    
    // Generate months from enrolledDate to prevMonth
    const current = new Date(enrolledDate.getFullYear(), enrolledDate.getMonth(), 1);
    const target = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
    
    while (current <= target) {
      const monthStr = current.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      
      // Calculate payments for this month
      const paymentsForMonth = payments?.filter(p => p.month === monthStr) || [];
      const paidForMonth = paymentsForMonth.reduce((sum, p) => sum + Number(p.amount), 0);
      const outstandingForMonth = monthlyFee - paidForMonth;
      
      if (outstandingForMonth > 0) {
        unpaidMonths.push({
          month: monthStr,
          fee: monthlyFee,
          paid: paidForMonth,
          outstanding: outstandingForMonth,
          status: paidForMonth === 0 ? 'overdue' : 'partial'
        });
      }
      
      current.setMonth(current.getMonth() + 1);
    }
  }

  // Generate all months of the current year and filter out fully paid ones, as well as months before enrollment
  const currentYear = new Date().getFullYear();
  const enrolledDate = new Date(enrollment?.enrolled_at || new Date().toISOString());
  const enrolledStartOfMonth = new Date(enrolledDate.getFullYear(), enrolledDate.getMonth(), 1);

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const eligiblePaymentMonths = monthNamesEn.map((monthName, index) => {
    const monthStr = `${monthName} ${currentYear}`;
    const monthDate = new Date(currentYear, index, 1);
    
    // Check if this month is before the student's enrollment month
    const isBeforeEnrollment = monthDate < enrolledStartOfMonth;

    const paymentsForMonth = payments?.filter(p => p.month === monthStr) || [];
    const paidForMonth = paymentsForMonth.reduce((sum, p) => sum + Number(p.amount), 0);
    const monthlyFee = Number(dueStatus?.monthly_fee || 0);
    const outstandingForMonth = Math.max(0, monthlyFee - paidForMonth);
    return {
      month: monthStr,
      outstanding: outstandingForMonth,
      isPaid: paidForMonth >= monthlyFee,
      isBeforeEnrollment
    };
  }).filter(item => !item.isPaid && !item.isBeforeEnrollment);

  // Pre-fill amount for the oldest unpaid month of the current year, or cumulative outstanding if no unpaid months
  const defaultAmount = eligiblePaymentMonths.length > 0
    ? eligiblePaymentMonths[0].outstanding
    : (dueStatus ? (Number(dueStatus.outstanding) > 0 ? Number(dueStatus.outstanding) : Number(dueStatus.monthly_fee)) : 0);

  const dueMonthForModal = eligiblePaymentMonths.length > 0
    ? eligiblePaymentMonths[0].month
    : null;

  // Group payments by month
  const grouped = payments?.reduce((acc, payment) => {
    const month = payment.month;
    if (!acc[month]) acc[month] = [];
    acc[month].push(payment);
    return acc;
  }, {} as Record<string, PaymentRecord[]>) || {};

  // Sort months: most recent first
  const sortedMonths = Object.keys(grouped ?? {}).sort((a, b) => {
    // Parse e.g. "June 2026" -> Date
    return new Date(`1 ${b}`).getTime() - new Date(`1 ${a}`).getTime();
  });

  // Calculate total paid across all months
  const totalPaid = payments?.reduce((sum: number, p) => sum + Number(p.amount), 0) || 0;

  // Find active batch name (from payments or dueStatus)
  const batchName = dueStatus?.batch_name || (payments && payments.length > 0 && payments[0].batches?.name) || 'কোনো সক্রিয় ব্যাচ নেই';

  return (
    <div className="space-y-8 font-ui max-w-5xl mx-auto pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-primary" />
            <span>ফি ও পেমেন্ট</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            আপনার মাসিক ফি ও পরিশোধের ইতিহাস এখানে পর্যবেক্ষণ করুন।
          </p>
        </div>
        <MakePaymentModal 
          studentId={user.id}
          batchId={studentBatchId}
          defaultAmount={defaultAmount}
          dueMonth={dueMonthForModal}
          dueMonths={eligiblePaymentMonths.map(m => ({ month: m.month, outstanding: m.outstanding }))}
          monthlyFee={Number(dueStatus?.monthly_fee || 0)}
        />
      </div>

      {/* Section 1: Current Month Status Card */}
      <div>
        {!dueStatus ? (
          <div className="bg-surface border border-border rounded-2xl p-6 text-center text-text-muted shadow-sm">
            কোনো সক্রিয় ভর্তি নেই
          </div>
        ) : (
          <div className={`bg-surface border rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-200 ${
            dueStatus.status === 'paid' ? 'border-primary-mid/30 ring-1 ring-primary-mid/10' :
            dueStatus.status === 'partial' ? 'border-accent/30 ring-1 ring-accent/10' :
            'border-error/30 ring-1 ring-error/10'
          }`}>
            {/* Status Background Accent Bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              dueStatus.status === 'paid' ? 'bg-primary-mid' :
              dueStatus.status === 'partial' ? 'bg-accent' :
              'bg-error'
            }`} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs text-text-secondary font-medium tracking-wider uppercase">বকেয়া বেতন স্ট্যাটাস</span>
                <h3 className="text-xl font-bold text-text-primary">
                  সর্বমোট বকেয়া বেতন
                </h3>
                
                {/* Due status details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 pt-2 text-sm">
                  <div>
                    <span className="text-text-muted block text-xs">মোট ফি</span>
                    <span className="font-medium text-text-primary text-base">
                      {formatPrice(Number(dueStatus.outstanding) + Number(dueStatus.paid_this_month))}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-xs">মোট পরিশোধিত</span>
                    <span className="font-medium text-text-primary text-base">{formatPrice(dueStatus.paid_this_month)}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-xs">মোট বকেয়া / বাকি</span>
                    <span className={`font-semibold text-base ${Number(dueStatus.outstanding) > 0 ? 'text-error' : 'text-primary-mid'}`}>
                      {formatPrice(dueStatus.outstanding)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex md:justify-end">
                {dueStatus.status === 'paid' ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-primary-light text-primary border border-primary/20">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    সম্পূর্ণ পরিশোধিত ✓
                  </span>
                ) : dueStatus.status === 'partial' ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-accent-light text-accent border border-accent/20">
                    <AlertTriangle className="w-5 h-5 text-accent" />
                    আংশিক পরিশোধ
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-error/10 text-error border border-error/20">
                    <AlertTriangle className="w-5 h-5 text-error" />
                    বাকি আছে
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 1.5: Individual Unpaid Months */}
      {dueStatus && unpaidMonths.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <span>মাসভিত্তিক বকেয়ার তালিকা</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpaidMonths.map((item, idx) => (
              <div key={idx} className="p-4 border border-border rounded-xl bg-surface-alt/40 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-bold text-text-primary text-sm">{formatMonth(item.month)}</h4>
                  <p className="text-xs text-text-secondary mt-1">
                    মাসিক ফি: {formatPrice(item.fee)}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'overdue' ? 'bg-error/10 text-error' : 'bg-accent/10 text-accent'
                  }`}>
                    {item.status === 'overdue' ? 'বকেয়া' : 'আংশিক বকেয়া'}
                  </span>
                  <p className="font-semibold text-text-primary">
                    বাকি: <span className="text-error">{formatPrice(item.outstanding)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Payment History Table */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <span>পেমেন্টের ইতিহাস</span>
        </h2>

        {!payments || payments.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center text-text-muted shadow-sm">
            এখনো কোনো পেমেন্ট রেকর্ড নেই
          </div>
        ) : (
          <div className="space-y-8">
            {sortedMonths.map((month) => {
              const monthPayments = grouped[month] || [];
              const batchFee = Number(monthPayments[0]?.batches?.fee || 0);
              const totalMonthPaid = monthPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
              const remaining = batchFee - totalMonthPaid;

              return (
                <div key={month} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                  {/* Month Header Banner */}
                  <div className="px-6 py-4 bg-surface-alt border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="font-bold text-text-primary flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{formatMonth(month)}</span>
                    </h3>
                    <div className="text-xs sm:text-sm font-medium flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="text-text-secondary">
                        মাসিক মোট: {formatPrice(totalMonthPaid)} / {formatPrice(batchFee)}
                      </span>
                      {totalMonthPaid >= batchFee ? (
                        <span className="text-primary-mid font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          সম্পূর্ণ ✓
                        </span>
                      ) : totalMonthPaid > 0 ? (
                        <span className="text-accent font-semibold">
                          বাকি: {formatPrice(remaining)}
                        </span>
                      ) : (
                        <span className="text-error font-semibold">
                          বাকি: {formatPrice(batchFee)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Payment Rows / Table */}
                  <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                    <table className="w-full text-left border-collapse text-sm min-w-[600px]">
                      <thead>
                        <tr className="border-b border-border text-xs text-text-muted uppercase font-medium bg-surface-alt/20">
                          <th className="px-6 py-3">ধরণ</th>
                          <th className="px-6 py-3">পরিমাণ</th>
                          <th className="px-6 py-3">পদ্ধতি</th>
                          <th className="px-6 py-3">TrxID</th>
                          <th className="px-6 py-3">তারিখ</th>
                          <th className="px-6 py-3 text-right">রশিদ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {monthPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-surface-alt/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-text-primary">
                              {payment.is_installment
                                ? `কিস্তি ${toBengaliNumerals(payment.installment_number)}`
                                : 'পূর্ণ পেমেন্ট'
                              }
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {formatPrice(payment.amount)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                payment.method === 'bKash' ? 'bg-pink-50 text-pink-600 border border-pink-100' :
                                payment.method === 'Nagad' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                payment.method === 'cash' ? 'bg-teal-50 text-teal-600 border border-teal-100' :
                                'bg-blue-50 text-blue-600 border border-blue-100'
                              }`}>
                                {payment.method === 'cash' ? 'নগদ' : payment.method}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-text-secondary">
                              {maskTransactionId(payment.transaction_id, payment.method)}
                            </td>
                            <td className="px-6 py-4 text-xs text-text-secondary">
                              {formatBanglaDate(payment.paid_on)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {payment.reconciled ? (
                                <Link
                                  href={`/dashboard/payments/${payment.id}/receipt`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  <span>রশিদ দেখুন</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                  পেন্ডিং
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Mobile scroll hint */}
                    <p className="text-xs text-text-muted text-right md:hidden mt-1">&#8592; স্ক্রোল করুন &#8594;</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Summary Footer */}
      <div className="bg-surface-alt border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-text-muted" />
          <span className="text-sm text-text-secondary font-medium">
            ব্যাচ: <span className="text-text-primary font-semibold">{batchName}</span>
          </span>
        </div>
        <div className="text-sm sm:text-base font-semibold text-text-secondary">
          মোট পরিশোধিত (সকল মাস): <span className="text-text-primary text-lg ml-1">{formatPrice(totalPaid)}</span>
        </div>
      </div>
    </div>
  );
}
