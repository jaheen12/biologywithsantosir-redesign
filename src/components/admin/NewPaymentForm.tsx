'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, AlertCircle, Info } from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  phone: string | null;
}

interface Batch {
  id: string;
  name: string;
}

interface NewPaymentFormProps {
  students: Student[];
  batches: Batch[];
  recordedBy: string;
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

// Helper to generate months from -3 to +3 relative to current month
const getMonthOptions = () => {
  const options = [];
  const today = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const value = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    options.push({ value, label: value });
  }
  return options;
};

export default function NewPaymentForm({ students, batches, recordedBy }: NewPaymentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // URL Params prefill
  const prefillStudentId = searchParams.get('student_id');
  const prefillAmount = searchParams.get('prefill_amount');

  // Form state
  const [studentSearch, setStudentSearch] = useState('');
  const [studentId, setStudentId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [month, setMonth] = useState('');
  const [method, setMethod] = useState('Cash');
  const [amount, setAmount] = useState('');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentNumber, setInstallmentNumber] = useState('1');
  const [transactionId, setTransactionId] = useState('');
  const [note, setNote] = useState('');

  // Info details from query
  const [dueInfo, setDueInfo] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Month Options
  const monthOptions = getMonthOptions();

  // Set default month to current month on load
  useEffect(() => {
    const today = new Date();
    const monthNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    setMonth(`${monthNames[today.getMonth()]} ${today.getFullYear()}`);
  }, []);

  // Handle student search filtering
  const filteredStudents = students.filter((s) => {
    const search = studentSearch.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(search) ||
      s.phone?.includes(search)
    );
  });

  // Fetch student info on selection change
  const handleStudentChange = async (selectedId: string) => {
    setStudentId(selectedId);
    if (!selectedId) {
      setBatchId('');
      setBatchName('');
      setDueInfo(null);
      setAmount('');
      return;
    }

    setQueryLoading(true);
    try {
      // 1. Fetch active enrollment details
      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .select('batch_id, batches(name)')
        .eq('student_id', selectedId)
        .eq('status', 'active')
        .single();

      if (enrollError && enrollError.code !== 'PGRST116') throw enrollError;

      if (enrollment) {
        setBatchId(enrollment.batch_id);
        const name = (enrollment.batches as any)?.name || 'অজানা ব্যাচ';
        setBatchName(name);
      } else {
        setBatchId('');
        setBatchName('কোনো সক্রিয় ভর্তি নেই');
      }

      // 2. Fetch payment due information
      const { data: due, error: dueError } = await supabase
        .from('payment_due')
        .select('*')
        .eq('student_id', selectedId)
        .single();

      if (dueError && dueError.code !== 'PGRST116') throw dueError;

      if (due) {
        setDueInfo(due);
        setAmount(due.outstanding.toString());
      } else {
        setDueInfo(null);
        setAmount('');
      }

    } catch (err) {
      console.error(err);
    } finally {
      setQueryLoading(false);
    }
  };

  // Trigger prefill logic if URL params exist
  useEffect(() => {
    if (prefillStudentId) {
      handleStudentChange(prefillStudentId);
      if (prefillAmount) {
        setAmount(prefillAmount);
      }
    }
  }, [prefillStudentId, prefillAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId || !batchId || !month || !method || !amount) {
      setErrorMessage('সবগুলো প্রয়োজনীয় ক্ষেত্র পূরণ করুন।');
      return;
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      setErrorMessage('পেমেন্টের পরিমাণ ১ টাকা বা তার বেশি হতে হবে।');
      return;
    }

    const isMobileMethod = ['bKash', 'Nagad'].includes(method);
    if (isMobileMethod && !transactionId.trim()) {
      setErrorMessage('bKash বা Nagad পেমেন্টের জন্য TrxID আবশ্যক।');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const payload = {
      student_id: studentId,
      batch_id: batchId,
      amount: payAmount,
      month,
      paid_on: new Date().toISOString().split('T')[0],
      method,
      is_installment: isInstallment,
      installment_number: isInstallment ? parseInt(installmentNumber, 10) : null,
      transaction_id: isMobileMethod ? transactionId.trim() : null,
      reconciled: !isMobileMethod, // Cash and bank are auto-reconciled
      recorded_by: recordedBy,
      note: note.trim() || null,
    };

    try {
      const { data: newPayment, error: insertError } = await supabase
        .from('payments')
        .insert(payload)
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/admin/payments/${newPayment.id}/receipt`);
      router.refresh();

    } catch (err: any) {
      setErrorMessage(`পেমেন্ট সংরক্ষণ করা যায়নি: ${err.message || 'আবার চেষ্টা করুন।'}`);
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-6 font-ui">
      {errorMessage && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 text-xs font-medium text-text-secondary">
        {/* Student Search and Selection */}
        <div className="space-y-2">
          <label className="block font-bold text-text-secondary">
            শিক্ষার্থী নির্বাচন করুন
          </label>
          
          {!prefillStudentId && (
            <input
              type="text"
              placeholder="শিক্ষার্থীর নাম বা মোবাইল দিয়ে খুঁজুন..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary mb-2"
            />
          )}

          <select
            value={studentId}
            onChange={(e) => handleStudentChange(e.target.value)}
            disabled={!!prefillStudentId}
            required
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-text-primary font-semibold disabled:bg-surface-alt disabled:cursor-not-allowed focus:outline-none focus:border-primary"
          >
            <option value="">নির্বাচন করুন</option>
            {filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.phone || 'মোবাইল নেই'})
              </option>
            ))}
          </select>
        </div>

        {/* Batch Info (auto-filled) */}
        {batchId && (
          <div className="space-y-1.5">
            <label className="block font-bold text-text-secondary">ব্যাচ</label>
            <input
              type="text"
              readOnly
              value={batchName}
              className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-text-primary font-semibold focus:outline-none"
            />
          </div>
        )}

        {/* Dynamic Payment Due Details */}
        {queryLoading ? (
          <div className="flex items-center gap-2 text-text-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>বকেয়া তথ্য লোড করা হচ্ছে...</span>
          </div>
        ) : (
          dueInfo && (
            <div className="p-4 bg-primary-light border border-primary/20 rounded-xl space-y-1">
              <span className="flex items-center gap-1.5 text-primary font-bold">
                <Info className="w-4 h-4" />
                <span>বকেয়া তথ্য ({dueInfo.due_month})</span>
              </span>
              <div className="text-text-secondary text-[11px] font-medium space-y-0.5 mt-1">
                <p>মাসিক ফি: ৳{toBengaliNumerals(dueInfo.monthly_fee)}</p>
                <p>ইতিমধ্যে পরিশোধিত: ৳{toBengaliNumerals(dueInfo.paid_this_month)}</p>
                <p className="font-bold text-primary">অবশিষ্ট বকেয়া: ৳{toBengaliNumerals(dueInfo.outstanding)}</p>
              </div>
            </div>
          )
        )}

        {/* Month Selection */}
        <div className="space-y-1.5">
          <label className="block font-bold text-text-secondary">
            পেমেন্টের মাস
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-text-primary font-semibold focus:outline-none focus:border-primary"
          >
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Method and Amount Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="block font-bold text-text-secondary">
              পেমেন্ট পদ্ধতি
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-text-primary font-semibold focus:outline-none focus:border-primary"
            >
              <option value="Cash">নগদ (Cash)</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Bank">ব্যাংক (Bank)</option>
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="block font-bold text-text-secondary">
              পরিমাণ (BDT)
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder="উদাঃ 800"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-text-primary font-semibold focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Installment Toggle */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              id="isInstallment"
              type="checkbox"
              checked={isInstallment}
              onChange={(e) => setIsInstallment(e.target.checked)}
              className="w-4 h-4 text-primary focus:ring-primary border-border rounded cursor-pointer"
            />
            <label htmlFor="isInstallment" className="font-bold text-text-primary cursor-pointer select-none">
              আংশিক পেমেন্ট (কিস্তি)
            </label>
          </div>

          {isInstallment && (
            <div className="space-y-1.5 animate-fadeIn max-w-[200px]">
              <label className="block font-bold text-text-secondary">
                কিস্তি নম্বর
              </label>
              <select
                value={installmentNumber}
                onChange={(e) => setInstallmentNumber(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text-primary font-semibold focus:outline-none focus:border-primary"
              >
                <option value="1">১ম কিস্তি</option>
                <option value="2">২য় কিস্তি</option>
                <option value="3">৩য় কিস্তি</option>
                <option value="4">৪র্থ কিস্তি</option>
              </select>
            </div>
          )}
        </div>

        {/* Transaction ID for bKash/Nagad */}
        {['bKash', 'Nagad'].includes(method) && (
          <div className="space-y-1.5 animate-fadeIn">
            <label className="block font-bold text-text-secondary">
              লেনদেন আইডি (TrxID) <span className="text-error font-bold">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="উদাঃ BK20260610ABCD"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-text-primary font-mono font-semibold focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {/* Note */}
        <div className="space-y-1.5">
          <label className="block font-bold text-text-secondary">
            নোট (ঐচ্ছিক)
          </label>
          <textarea
            placeholder="পেমেন্ট সংক্রান্ত অতিরিক্ত কোনো তথ্য..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-text-primary font-medium focus:outline-none focus:border-primary"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || queryLoading}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition duration-150 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>পেমেন্ট রেকর্ড করা হচ্ছে...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>পেমেন্ট সংরক্ষণ করুন</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
