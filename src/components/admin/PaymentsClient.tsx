'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Download, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  Search,
  Plus,
  BookOpen,
  Filter
} from 'lucide-react';

interface PaymentDetail {
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
  profiles: {
    full_name: string;
    phone: string | null;
  } | null;
  batches: {
    name: string;
    fee: number;
  } | null;
}

interface DueStudent {
  student_id: string;
  full_name: string;
  phone: string | null;
  batch_id: string;
  batch_name: string;
  monthly_fee: number;
  due_month: string;
  paid_this_month: number;
  outstanding: number;
  status: 'overdue' | 'partial';
}

interface BatchItem {
  id: string;
  name: string;
}

interface PaymentsClientProps {
  initialPayments: PaymentDetail[];
  initialDueStudents: DueStudent[];
  batches: BatchItem[];
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

export default function PaymentsClient({ initialPayments, initialDueStudents, batches }: PaymentsClientProps) {
  const [activeTab, setActiveTab] = useState<'ledger' | 'dues'>('ledger');
  
  // Tab 1 Filters
  const [ledgerBatchId, setLedgerBatchId] = useState('');
  const [ledgerMonth, setLedgerMonth] = useState('');
  const [ledgerMethod, setLedgerMethod] = useState('');
  const [ledgerReconciled, setLedgerReconciled] = useState('');
  const [ledgerSearch, setLedgerSearch] = useState('');

  // Tab 2 Filters
  const [duesBatchId, setDuesBatchId] = useState('');
  const [duesSearch, setDuesSearch] = useState('');

  // Filter Ledger Payments
  const filteredPayments = initialPayments.filter((payment) => {
    // 1. Batch Filter
    if (ledgerBatchId && payment.batch_id !== ledgerBatchId) return false;
    
    // 2. Month Filter
    if (ledgerMonth && !payment.month.toLowerCase().includes(ledgerMonth.toLowerCase())) return false;
    
    // 3. Method Filter
    if (ledgerMethod && payment.method !== ledgerMethod) return false;
    
    // 4. Reconciled Filter
    if (ledgerReconciled) {
      const isReconciled = ledgerReconciled === 'true';
      if (payment.reconciled !== isReconciled) return false;
    }

    // 5. Search Filter (Student Name/Phone/Receipt)
    if (ledgerSearch) {
      const search = ledgerSearch.toLowerCase();
      const nameMatch = payment.profiles?.full_name?.toLowerCase().includes(search);
      const phoneMatch = payment.profiles?.phone?.includes(search);
      const receiptMatch = payment.receipt_number?.toLowerCase().includes(search);
      const trxMatch = payment.transaction_id?.toLowerCase().includes(search);
      if (!nameMatch && !phoneMatch && !receiptMatch && !trxMatch) return false;
    }

    return true;
  });

  // Filter Dues Students
  const filteredDueStudents = initialDueStudents.filter((student) => {
    // 1. Batch Filter
    if (duesBatchId && student.batch_id !== duesBatchId) return false;

    // 2. Search Filter (Student Name/Phone)
    if (duesSearch) {
      const search = duesSearch.toLowerCase();
      const nameMatch = student.full_name?.toLowerCase().includes(search);
      const phoneMatch = student.phone?.includes(search);
      if (!nameMatch && !phoneMatch) return false;
    }

    return true;
  });

  // Export to CSV with BOM for correct Bangla characters in Excel
  const handleExportCSV = () => {
    const headers = ['Student Name', 'Phone', 'Batch', 'Month', 'Installment', 'Amount (BDT)', 'Method', 'TrxID', 'Verification', 'Date', 'Receipt Number'];
    
    const rows = filteredPayments.map((p) => [
      p.profiles?.full_name || '',
      p.profiles?.phone || '',
      p.batches?.name || '',
      p.month,
      p.is_installment ? `কিস্তি ${toBengaliNumerals(p.installment_number)}` : 'পূর্ণ পেমেন্ট',
      p.amount,
      p.method,
      p.transaction_id || '—',
      p.reconciled ? 'যাচাই হয়েছে' : 'যাচাই বাকি',
      p.paid_on,
      p.receipt_number
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(','), 
      ...rows.map((row) => row.map((val) => `"${val.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payment_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Tabs and Actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border gap-4 pb-0">
        {/* Tab switcher */}
        <div className="flex gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`pb-3.5 px-1 border-b-2 cursor-pointer transition duration-150 ${
              activeTab === 'ledger'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-text-secondary hover:text-primary'
            }`}
          >
            সকল পেমেন্ট ({toBengaliNumerals(initialPayments.length)})
          </button>
          <button
            onClick={() => setActiveTab('dues')}
            className={`pb-3.5 px-1 border-b-2 cursor-pointer transition duration-150 ${
              activeTab === 'dues'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-text-secondary hover:text-primary'
            }`}
          >
            বাকি / বেতন অবস্থা ({toBengaliNumerals(initialDueStudents.length)})
          </button>
        </div>

        {/* Action Button */}
        <div className="pb-3 flex gap-2">
          {activeTab === 'ledger' && (
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 border border-border bg-surface text-text-primary text-xs font-bold rounded-xl hover:bg-surface-alt hover:text-primary transition duration-150 cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>CSV ডাউনলোড</span>
            </button>
          )}
          <Link
            href="/admin/payments/new"
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition duration-150 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন পেমেন্ট নিন</span>
          </Link>
        </div>
      </div>

      {/* TAB 1: ALL PAYMENTS LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end text-xs font-bold text-text-secondary">
            
            {/* Search filter */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="block text-text-secondary">সার্চ (নাম, ফোন, রশিদ)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="খুঁজুন..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-surface border border-border rounded-xl font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary placeholder:text-text-muted"
                />
                <Search className="w-4 h-4 text-text-muted absolute left-2.5 top-3" />
              </div>
            </div>

            {/* Batch filter */}
            <div className="space-y-1.5">
              <label className="block text-text-secondary">ব্যাচ</label>
              <select
                value={ledgerBatchId}
                onChange={(e) => setLedgerBatchId(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl font-semibold cursor-pointer text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">সকল ব্যাচ</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="space-y-1.5">
              <label className="block text-text-secondary">মাস (উদাঃ June 2026)</label>
              <input
                type="text"
                placeholder="মাসের নাম..."
                value={ledgerMonth}
                onChange={(e) => setLedgerMonth(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary placeholder:text-text-muted"
              />
            </div>

            {/* Method Filter */}
            <div className="space-y-1.5">
              <label className="block text-text-secondary">পদ্ধতি</label>
              <select
                value={ledgerMethod}
                onChange={(e) => setLedgerMethod(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl font-semibold cursor-pointer text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">সকল পদ্ধতি</option>
                <option value="cash">নগদ (Cash)</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="bank">ব্যাংক</option>
              </select>
            </div>

            {/* Reconciled Filter */}
            <div className="space-y-1.5">
              <label className="block text-text-secondary">যাচাই অবস্থা</label>
              <select
                value={ledgerReconciled}
                onChange={(e) => setLedgerReconciled(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl font-semibold cursor-pointer text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">সকল অবস্থা</option>
                <option value="false">⏳ যাচাই বাকি</option>
                <option value="true">✓ যাচাই সম্পন্ন</option>
              </select>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            {filteredPayments.length === 0 ? (
              <div className="p-12 text-center text-xs text-text-muted font-medium">
                কোনো পেমেন্টের রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-surface-alt border-b border-border text-xs font-bold text-text-secondary uppercase">
                      <th className="px-6 py-4">শিক্ষার্থী ও ফোন</th>
                      <th className="px-6 py-4">ব্যাচ</th>
                      <th className="px-6 py-4">মাস</th>
                      <th className="px-6 py-4">ধরণ</th>
                      <th className="px-6 py-4">পরিমাণ</th>
                      <th className="px-6 py-4">পদ্ধতি / TrxID</th>
                      <th className="px-6 py-4">অবস্থা</th>
                      <th className="px-6 py-4">তারিখ</th>
                      <th className="px-6 py-4 text-right">রশিদ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {filteredPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className={`hover:bg-surface-alt/25 transition-colors ${
                          !payment.reconciled ? 'border-l-4 border-l-accent' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-text-primary">{payment.profiles?.full_name || 'অজানা শিক্ষার্থী'}</div>
                          <div className="text-xs text-text-muted mt-0.5">{payment.profiles?.phone || '—'}</div>
                        </td>
                        <td className="px-6 py-4 text-text-secondary text-xs">
                          {payment.batches?.name || 'অজানা ব্যাচ'}
                        </td>
                        <td className="px-6 py-4 font-medium text-text-secondary text-xs">
                          {payment.month}
                        </td>
                        <td className="px-6 py-4 text-text-secondary text-xs">
                          {payment.is_installment ? (
                            <span className="px-2 py-0.5 rounded bg-accent-light text-accent text-[10px] font-bold">
                              কিস্তি {toBengaliNumerals(payment.installment_number)}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-primary-light text-primary text-[10px] font-bold">
                              পূর্ণ
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-text-primary">
                          <span className="font-bold text-primary mr-0.5">৳</span>
                          {toBengaliNumerals(payment.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-primary-light text-primary uppercase">
                              {payment.method}
                            </span>
                            {payment.transaction_id && (
                              <span className="font-mono text-xs font-semibold text-text-secondary bg-surface-alt px-1.5 py-0.5 rounded">
                                {payment.transaction_id}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold">
                          {payment.reconciled ? (
                            <span className="text-primary flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>যাচাই সম্পন্ন</span>
                            </span>
                          ) : (
                            <span className="text-accent flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>যাচাই বাকি</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-text-secondary text-xs">
                          {formatBanglaDate(payment.paid_on)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/payments/${payment.id}/receipt`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                          >
                            <span>রশিদ {toBengaliNumerals(payment.receipt_number)}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* TAB 2: DUES / OUTSTANDING STATS */}
      {activeTab === 'dues' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-bold text-text-secondary">
            
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="শিক্ষার্থীর নাম বা মোবাইল..."
                value={duesSearch}
                onChange={(e) => setDuesSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-surface border border-border rounded-xl font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary placeholder:text-text-muted"
              />
              <Search className="w-4 h-4 text-text-muted absolute left-2.5 top-3" />
            </div>

            {/* Batch Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-muted" />
              <select
                value={duesBatchId}
                onChange={(e) => setDuesBatchId(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-xl font-semibold cursor-pointer text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">সকল ব্যাচ</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dues Table */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            {filteredDueStudents.length === 0 ? (
              <div className="p-12 text-center text-xs text-text-muted font-medium">
                কোনো বকেয়া বেতনের শিক্ষার্থী পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-surface-alt border-b border-border text-xs font-bold text-text-secondary uppercase">
                      <th className="px-6 py-4">শিক্ষার্থীর নাম ও মোবাইল</th>
                      <th className="px-6 py-4">ব্যাচ</th>
                      <th className="px-6 py-4">বকেয়া মাস</th>
                      <th className="px-6 py-4">মাসিক ফি</th>
                      <th className="px-6 py-4">পরিশোধিত</th>
                      <th className="px-6 py-4">বাকির পরিমাণ</th>
                      <th className="px-6 py-4">অবস্থা</th>
                      <th className="px-6 py-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {filteredDueStudents.map((student) => (
                      <tr key={student.student_id} className="hover:bg-surface-alt/25 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-text-primary">{student.full_name}</div>
                          <div className="text-xs text-text-muted mt-0.5">{student.phone || '—'}</div>
                        </td>
                        <td className="px-6 py-4 text-text-secondary text-xs">
                          {student.batch_name}
                        </td>
                        <td className="px-6 py-4 text-text-secondary font-medium text-xs">
                          {student.due_month}
                        </td>
                        <td className="px-6 py-4 text-text-secondary font-medium">
                          <span className="font-bold text-primary mr-0.5">৳</span>
                          {toBengaliNumerals(student.monthly_fee)}
                        </td>
                        <td className="px-6 py-4 text-primary font-semibold">
                          <span className="font-bold text-primary mr-0.5">৳</span>
                          {toBengaliNumerals(student.paid_this_month)}
                        </td>
                        <td className="px-6 py-4 text-error font-semibold">
                          <span className="font-bold text-error mr-0.5">৳</span>
                          {toBengaliNumerals(student.outstanding)}
                        </td>
                        <td className="px-6 py-4">
                          {student.status === 'overdue' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-error/10 text-error">
                              বাকি আছে
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-accent-light text-accent">
                              আংশিক
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/payments/new?student_id=${student.student_id}&prefill_amount=${student.outstanding}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition duration-150"
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
        </div>
      )}
    </div>
  );
}
