import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FileText, ArrowLeft } from 'lucide-react';
import PrintButton from '@/components/admin/PrintButton';

interface PaymentReceiptData {
  id: string;
  student_id: string;
  batch_id: string;
  amount: number;
  month: string;
  paid_on: string;
  method: string;
  is_installment: boolean;
  installment_number: number | null;
  transaction_id: string | null;
  reconciled: boolean;
  note: string | null;
  receipt_number: string;
  created_at: string;
  student: {
    full_name: string;
    phone: string | null;
  } | null;
  batches: {
    name: string;
    fee: number;
  } | null;
  recorder: {
    full_name: string;
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

// Number to Bengali words mapping (handles up to 99,999)
function toBengaliWords(amount: number): string {
  const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
  const teens = ['দশ', 'এগারো', 'বারো', 'তেরো', 'চোদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ'];
  const tens = ['', 'দশ', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
  
  if (amount === 0) return 'শূণ্য';
  
  let words = '';
  
  if (amount >= 1000) {
    const thousands = Math.floor(amount / 1000);
    words += toBengaliWords(thousands).replace(' টাকা মাত্র', '') + ' হাজার ';
    amount %= 1000;
  }
  
  if (amount >= 100) {
    const hundreds = Math.floor(amount / 100);
    words += units[hundreds] + 'শত ';
    amount %= 100;
  }
  
  if (amount > 0) {
    if (amount < 10) {
      words += units[amount];
    } else if (amount >= 10 && amount < 20) {
      words += teens[amount - 10];
    } else {
      const tenVal = Math.floor(amount / 10);
      const unitVal = amount % 10;
      words += tens[tenVal] + (unitVal > 0 ? ' ' + units[unitVal] : '');
    }
  }
  
  return words.trim() + ' টাকা মাত্র';
}

export default async function PaymentReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const paymentId = resolvedParams.id;

  // Query payment, join aliased student profile, batch details and admin recorder profile
  const { data: paymentRaw } = await supabase
    .from('payments')
    .select('*, student:profiles!student_id(full_name, phone), batches(name, fee), recorder:profiles!recorded_by(full_name)')
    .eq('id', paymentId)
    .single();

  const payment = paymentRaw as unknown as PaymentReceiptData;

  if (!payment) {
    redirect('/dashboard');
  }

  // Authorization: Only admin or the student who owns the payment can view the receipt
  const isAdmin = user.app_metadata?.role === 'admin';
  const isOwner = user.id === payment.student_id;

  if (!isAdmin && !isOwner) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-8 font-ui">
      {/* Back link & Print action (hidden in print) */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link 
          href={isAdmin ? "/admin/payments" : "/dashboard/payments"} 
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary font-semibold text-sm transition duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>পেমেন্ট তালিকায় ফিরুন</span>
        </Link>
        
        <PrintButton />
      </div>

      {/* Receipt Layout Voucher */}
      <div className="max-w-2xl mx-auto bg-surface p-6 md:p-10 rounded-2xl border border-border shadow-sm receipt-container relative overflow-hidden">
        {/* Style injection for browser printing */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            nav, aside, header, footer, .print\\:hidden, [role="navigation"], button, a {
              display: none !important;
            }
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .receipt-container {
              border: 1px solid #ccc !important;
              box-shadow: none !important;
              max-width: 100% !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 24px !important;
              border-radius: 0 !important;
            }
          }
        `}} />

        {/* Voucher Top Header */}
        <div className="text-center border-b border-dashed border-border pb-6 space-y-2">
          <div className="text-primary font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-2">
            🌿 Biology with Santo Sir
          </div>
          <h2 className="text-xl font-extrabold text-text-primary">অফিসিয়াল পেমেন্ট রশিদ</h2>
          <p className="text-text-secondary text-xs">ধন্যবাদ, আপনার জীববিজ্ঞানের পড়াশোনা আনন্দময় হোক!</p>
        </div>

        {/* Invoice Meta */}
        <div className="grid grid-cols-2 gap-4 py-4 text-xs font-semibold border-b border-border">
          <div>
            <span className="text-text-muted uppercase tracking-wider">রশিদ নম্বর</span>
            <span className="text-text-primary text-sm font-bold block mt-0.5">
              {payment.receipt_number}
            </span>
          </div>
          <div className="text-right">
            <span className="text-text-muted uppercase tracking-wider">তারিখ</span>
            <span className="text-text-primary text-sm font-bold block mt-0.5">
              {formatBanglaDate(payment.paid_on)}
            </span>
          </div>
        </div>

        {/* Student details */}
        <div className="py-5 border-b border-border space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <span className="text-text-muted uppercase block">শিক্ষার্থীর নাম</span>
              <span className="text-text-primary text-sm font-bold block mt-0.5">
                {payment.student?.full_name || 'অজানা শিক্ষার্থী'}
              </span>
            </div>
            <div>
              <span className="text-text-muted uppercase block">মোবাইল</span>
              <span className="text-text-primary text-sm font-bold block mt-0.5">
                {payment.student?.phone || 'মোবাইল নম্বর নেই'}
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold">
            <span className="text-text-muted uppercase block">ব্যাচ</span>
            <span className="text-text-primary text-sm font-bold block mt-0.5">
              {payment.batches?.name || 'অজানা ব্যাচ'}
            </span>
          </div>
        </div>

        {/* Receipt particulars */}
        <div className="py-5 border-b border-border space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-text-muted uppercase block">বেতনের মাস</span>
              <span className="text-text-primary text-sm font-bold block mt-0.5">
                {payment.month}
              </span>
            </div>
            <div>
              <span className="text-text-muted uppercase block">পেমেন্টের ধরন</span>
              <span className="text-text-primary text-sm font-bold block mt-0.5">
                {payment.is_installment ? (
                  `কিস্তি (কিস্তি নং ${toBengaliNumerals(payment.installment_number)})`
                ) : (
                  'পূর্ণ পেমেন্ট'
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-text-muted uppercase block">পদ্ধতি</span>
              <span className="text-text-primary text-sm font-bold block mt-0.5">
                {payment.method}
              </span>
            </div>
            {payment.transaction_id && (
              <div>
                <span className="text-text-muted uppercase block">লেনদেন আইডি (TrxID)</span>
                <span className="text-text-primary text-sm font-mono font-bold block mt-0.5">
                  {payment.transaction_id}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Financial particulars */}
        <div className="py-6 border-b border-dashed border-border flex justify-between items-center bg-surface-alt -mx-6 px-6 md:-mx-10 md:px-10">
          <div>
            <span className="text-text-muted uppercase text-xs font-bold block">পরিশোধিত টাকা (কথায়)</span>
            <span className="text-text-primary text-sm font-bold block mt-0.5">
              {toBengaliWords(payment.amount)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-text-muted uppercase text-xs font-bold block">পরিমাণ</span>
            <span className="text-text-primary text-2xl font-extrabold flex items-center justify-end mt-0.5">
              <span className="font-bold text-primary mr-0.5 text-xl">৳</span>
              {toBengaliNumerals(payment.amount)}
            </span>
          </div>
        </div>

        {/* Verification & Footnote */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">অবস্থা:</span>
            {payment.reconciled ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-light text-primary font-bold">
                যাচাই সম্পন্ন
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-light text-accent font-bold">
                যাচাই পেন্ডিং
              </span>
            )}
          </div>
          <div className="text-left sm:text-right">
            <span className="text-text-muted">রিসিভ করেছেন:</span>{' '}
            <span className="text-text-primary font-bold">
              {payment.recorder?.full_name || 'সান্তো স্যার এডমিন'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
