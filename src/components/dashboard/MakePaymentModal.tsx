'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  CreditCard, 
  X, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { toBengaliNumerals } from '@/lib/bangla';

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

function getBanglaMonthLabel(enMonthYear: string): string {
  const parts = enMonthYear.trim().split(/\s+/);
  if (parts.length < 2) return enMonthYear;
  const month = parts[0];
  const year = parts[1];
  const banglaMonth = monthMap[month] || month;
  const banglaYear = toBengaliNumerals(year);
  return `${banglaMonth} ${banglaYear}`;
}

interface MakePaymentModalProps {
  studentId: string;
  batchId: string | null;
  defaultAmount: number;
  dueMonth: string | null;
}

export default function MakePaymentModal({
  studentId,
  batchId,
  defaultAmount,
  dueMonth,
}: MakePaymentModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [method, setMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [transactionId, setTransactionId] = useState('');
  
  // Get month options sorted chronologically
  const getMonthOptions = () => {
    const today = new Date();
    const optionsMap = new Map<number, string>();
    const formatValue = (d: Date) => d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    
    // Last 3 months, current month, and next 2 months
    for (let i = -3; i <= 2; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      optionsMap.set(d.getTime(), formatValue(d));
    }
    
    // Explicitly include dueMonth if it exists
    if (dueMonth) {
      const dueTime = new Date(`1 ${dueMonth}`).getTime();
      if (!isNaN(dueTime)) {
        optionsMap.set(dueTime, dueMonth);
      } else {
        optionsMap.set(0, dueMonth);
      }
    }
    
    const sortedTimestamps = Array.from(optionsMap.keys()).sort((a, b) => a - b);
    return sortedTimestamps.map(ts => optionsMap.get(ts) as string);
  };
  
  const monthOptions = getMonthOptions();

  // Find default month: dueMonth if present, otherwise current month (format: "June 2026")
  const getDefaultMonth = () => {
    if (dueMonth && monthOptions.includes(dueMonth)) {
      return dueMonth;
    }
    const current = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    if (monthOptions.includes(current)) {
      return current;
    }
    return monthOptions[0] || '';
  };

  const [selectedMonth, setSelectedMonth] = useState(getDefaultMonth());

  // Payment numbers (configurable/hardcoded)
  const paymentNumbers = {
    bKash: '01712-345678', // bKash personal number
    Nagad: '01812-345678', // Nagad personal number
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId) {
      setErrorMessage('পেমেন্ট করার জন্য আপনাকে একটি ব্যাচে ভর্তি হতে হবে।');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('সঠিক পেমেন্টের পরিমাণ লিখুন।');
      return;
    }
    if (!transactionId.trim()) {
      setErrorMessage('ট্রানজেকশন আইডি (TrxID) প্রদান করা আবশ্যক।');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const payload = {
      student_id: studentId,
      batch_id: batchId,
      amount: parseFloat(amount),
      month: selectedMonth,
      paid_on: new Date().toLocaleDateString('en-CA'),
      method,
      is_installment: false,
      installment_number: null,
      transaction_id: transactionId.trim(),
      reconciled: false, // goes to pending verification
      note: 'শিক্ষার্থী কর্তৃক সাবমিটকৃত পেমেন্ট',
    };

    try {
      const { error } = await supabase
        .from('payments')
        .insert(payload);

      if (error) throw error;

      setSuccess(true);
      setTransactionId('');
      router.refresh();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'আবার চেষ্টা করুন।';
      setErrorMessage(`পেমেন্ট সাবমিট করা যায়নি: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setSuccess(false);
    setErrorMessage(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-all duration-150 shadow-sm cursor-pointer active:scale-95 shrink-0"
      >
        <CreditCard className="w-4 h-4" />
        <span>পেমেন্ট করুন</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto animate-none">
          {/* Backdrop click */}
          <div className="fixed inset-0" onClick={closeModal} />
          
          <div className="relative bg-surface w-full max-w-md p-6 rounded-2xl border border-border shadow-xl z-10 space-y-6 font-ui my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span>পেমেন্ট করুন</span>
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-alt transition-colors animate-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-light text-primary">
                  <CheckCircle2 className="w-8 h-8 animate-none" />
                </div>
                <h4 className="text-lg font-bold text-text-primary">পেমেন্ট সফলভাবে সাবমিট হয়েছে!</h4>
                <p className="text-sm text-text-secondary leading-relaxed font-normal">
                  আপনার পেমেন্টটি বর্তমানে যাচাইয়ের জন্য পেন্ডিং অবস্থায় রয়েছে। এডমিন এটি অনুমোদন করলে রশিদ তৈরি হবে এবং স্ট্যাটাস আপডেট হবে।
                </p>
                <button
                  onClick={closeModal}
                  className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition duration-150 cursor-pointer"
                >
                  ঠিক আছে
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-sm font-semibold text-text-secondary">
                {errorMessage && (
                  <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {!batchId && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>পেমেন্ট সাবমিট করতে হলে অবশ্যই প্রথমে কোনো ব্যাচে যুক্ত হতে হবে।</span>
                  </div>
                )}

                {/* Month Selection */}
                <div className="space-y-1">
                  <label htmlFor="month" className="block text-xs font-bold text-text-muted uppercase">
                    কোন মাসের জন্য পেমেন্ট
                  </label>
                  <select
                    id="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    required
                    disabled={!batchId}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary text-sm font-medium cursor-pointer"
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {getBanglaMonthLabel(opt)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Method */}
                <div className="space-y-1">
                  <label htmlFor="method" className="block text-xs font-bold text-text-muted uppercase">
                    পেমেন্ট পদ্ধতি
                  </label>
                  <select
                    id="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value as 'bKash' | 'Nagad')}
                    required
                    disabled={!batchId}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary text-sm font-medium cursor-pointer"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>

                {/* Dynamic Information Display Box */}
                {batchId && (
                  <div className="p-4 bg-surface-alt border border-border rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>সেন্ড মানি করতে হবে:</span>
                      <span className="font-bold text-primary">{method === 'bKash' ? 'বিকাশ পার্সোনাল' : 'নগদ পার্সোনাল'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 bg-surface border border-border rounded-lg">
                      <span className="font-mono text-sm font-bold text-text-primary tracking-wider">
                        {paymentNumbers[method]}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(paymentNumbers[method])}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-primary-mid" />
                            <span className="text-primary-mid text-[11px]">কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>কপি করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] leading-relaxed text-text-muted font-normal">
                      উক্ত নম্বরে <strong className="text-text-primary">৳{toBengaliNumerals(amount || '০')}</strong> সেন্ড মানি (Send Money) সম্পন্ন করার পর নিচের ইনপুটে আপনার প্রাপ্ত ট্রানজেকশন আইডিটি দিন।
                    </p>
                  </div>
                )}

                {/* Amount */}
                <div className="space-y-1">
                  <label htmlFor="amount" className="block text-xs font-bold text-text-muted uppercase">
                    পেমেন্টের পরিমাণ (৳)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={!batchId}
                    placeholder="পরিমাণ (উদা: ১০০০)"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary text-sm font-medium"
                  />
                </div>

                {/* Transaction ID */}
                <div className="space-y-1">
                  <label htmlFor="transactionId" className="block text-xs font-bold text-text-muted uppercase">
                    ট্রানজেকশন আইডি (TrxID)
                  </label>
                  <input
                    type="text"
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                    disabled={!batchId}
                    placeholder="উদা: 8N7X2K9Lp"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary text-sm font-mono tracking-wider"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !batchId}
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>প্রসেসিং হচ্ছে...</span>
                      </>
                    ) : (
                      <span>পেমেন্ট সাবমিট করুন</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
