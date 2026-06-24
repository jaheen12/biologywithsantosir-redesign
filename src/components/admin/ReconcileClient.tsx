'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Loader2, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  Clock,
  Phone,
  MessageSquare
} from 'lucide-react';

interface PendingPayment {
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
  recorder: {
    full_name: string;
  } | null;
}

interface ReconcileClientProps {
  pendingPayments: PendingPayment[];
  currentAdminId: string;
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

export default function ReconcileClient({ pendingPayments, currentAdminId }: ReconcileClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Handle single payment verification confirmation
  const handleConfirm = async (paymentId: string) => {
    setActionLoadingId(paymentId);
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          reconciled: true,
          reconciled_by: currentAdminId,
          reconciled_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;
      
      router.refresh();
    } catch (err) {
      alert('পেমেন্ট যাচাই নিশ্চিত করা সম্ভব হয়নি, আবার চেষ্টা করুন।');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open rejection modal
  const openRejectModal = (paymentId: string) => {
    setRejectingPaymentId(paymentId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Handle single payment rejection confirmation
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPaymentId) return;

    setActionLoadingId(rejectingPaymentId);
    setShowRejectModal(false);

    const noteText = `REJECTED: ${rejectReason.trim() || 'কোনো কারণ উল্লেখ করা হয়নি'}`;

    try {
      const { error } = await supabase
        .from('payments')
        .update({
          note: noteText,
        })
        .eq('id', rejectingPaymentId);

      if (error) throw error;

      router.refresh();
    } catch (err) {
      alert('পেমেন্ট বাতিল করা সম্ভব হয়নি, আবার চেষ্টা করুন।');
    } finally {
      setActionLoadingId(null);
      setRejectingPaymentId(null);
    }
  };

  // Handle bulk confirmation for all pending payments in queue
  const handleBulkConfirm = async () => {
    if (pendingPayments.length === 0) return;
    
    const count = pendingPayments.length;
    const confirmMessage = `আপনি কি সব ${toBengaliNumerals(count)}টি পেমেন্ট একসাথে যাচাই করতে চান?`;
    if (!window.confirm(confirmMessage)) return;

    setBulkLoading(true);
    try {
      const promises = pendingPayments.map((payment) =>
        supabase
          .from('payments')
          .update({
            reconciled: true,
            reconciled_by: currentAdminId,
            reconciled_at: new Date().toISOString(),
          })
          .eq('id', payment.id)
      );

      await Promise.all(promises);
      router.refresh();
    } catch (err) {
      alert('সবগুলো পেমেন্ট একসাথে যাচাই করা সম্ভব হয়নি, আবার চেষ্টা করুন।');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Reconcile Header summary and Bulk Verify */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface p-5 rounded-2xl border border-border shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-text-secondary block">যাচাই বাকি</span>
            <span className="text-sm font-bold text-text-primary mt-0.5 block">
              {toBengaliNumerals(pendingPayments.length)} টি পেমেন্ট যাচাই বাকি আছে
            </span>
          </div>
        </div>

        {pendingPayments.length > 0 && (
          <button
            onClick={handleBulkConfirm}
            disabled={bulkLoading}
            className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark cursor-pointer disabled:opacity-50 transition duration-150 flex items-center justify-center gap-1.5"
          >
            {bulkLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>যাচাই করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>সবগুলো পেমেন্ট যাচাই করুন</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Reconcile Cards Queue */}
      {pendingPayments.length === 0 ? (
        <div className="bg-surface p-12 text-center rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-text-primary">🎉 সকল মোবাইল পেমেন্ট যাচাই সম্পন্ন!</h3>
          <p className="text-text-secondary text-xs mt-1">bKash বা Nagad-এর কোনো পেন্ডিং ট্রানজেকশন অবশিষ্ট নেই।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {pendingPayments.map((payment) => {
            const isRejected = payment.note?.startsWith('REJECTED:');
            
            return (
              <div 
                key={payment.id} 
                className={`bg-surface rounded-2xl border p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition duration-150 border-l-4 ${
                  isRejected ? 'border-error border-l-error' : 'border-border border-l-accent'
                }`}
              >
                {/* Information block */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-text-primary text-base">
                      {payment.student?.full_name || 'অজানা শিক্ষার্থী'}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-primary-light text-primary">
                      {payment.method}
                    </span>
                    {payment.is_installment && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-accent-light text-accent">
                        কিস্তি {toBengaliNumerals(payment.installment_number)}
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-error/10 text-error">
                        বাতিলকৃত পেমেন্ট
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-text-secondary font-medium space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-text-muted" />
                      <span>ফোন: {payment.student?.phone || 'মোবাইল নম্বর নেই'}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      <span>রেকর্ড করা হয়েছে: {formatBanglaDate(payment.paid_on)} (দ্বারা: {payment.recorder?.full_name || 'এডমিন'})</span>
                    </p>
                    <p>মাস: <span className="font-bold text-text-primary">{payment.month}</span></p>
                    <p>লেনদেন আইডি (TrxID): <span className="font-mono text-text-primary font-bold bg-surface-alt px-1.5 py-0.5 rounded">{payment.transaction_id || '—'}</span></p>
                    
                    {/* Display Note */}
                    {payment.note && (
                      <p className="p-2.5 bg-surface-alt rounded-lg border border-border flex items-start gap-1.5 text-text-primary mt-2">
                        <MessageSquare className="w-4 h-4 shrink-0 text-text-muted mt-0.5" />
                        <span>নোট: {payment.note}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount and Action Buttons */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t border-border md:border-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-text-secondary block">পেমেন্ট পরিমাণ</span>
                    <span className="text-2xl font-extrabold text-text-primary block mt-0.5">
                      <span className="font-bold text-primary mr-0.5">৳</span>
                      {toBengaliNumerals(payment.amount)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {actionLoadingId === payment.id ? (
                      <div className="flex items-center justify-center p-2.5">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => openRejectModal(payment.id)}
                          className="px-3 py-2 border border-error/20 hover:border-error hover:bg-error/5 text-error text-xs font-bold rounded-xl transition duration-150 cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>বাতিল</span>
                        </button>
                        <button
                          onClick={() => handleConfirm(payment.id)}
                          className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition duration-150 cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>নিশ্চিত করুন</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal dialog */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-error" />
              <span>পেমেন্ট বাতিলের কারণ</span>
            </h3>
            
            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs font-semibold text-text-secondary">
              <div className="space-y-1.5">
                <label className="block text-text-secondary">বাতিল করার বিবরণ লিখুন (ঐচ্ছিক)</label>
                <textarea
                  placeholder="উদাঃ TrxID ব্যাংকিং স্টেটমেন্টের সাথে মেলেনি..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-text-primary font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-2.5 border border-border hover:bg-surface-alt text-text-primary rounded-xl font-bold transition duration-150 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-error hover:bg-error/90 text-white rounded-xl font-bold transition duration-150 cursor-pointer"
                >
                  বাতিল চিহ্নিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
