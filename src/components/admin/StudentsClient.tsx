'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Eye, CreditCard, UserCheck, UserX, AlertCircle, Phone, BookOpen } from 'lucide-react';

interface StudentProps {
  id: string;
  full_name: string;
  phone: string | null;
  role: string;
  created_at: string;
  enrollments: any;
  payment_due: any;
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

export default function StudentsClient({ students }: { students: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'due' | 'paid'>('all');

  const filteredStudents = students.filter((student) => {
    // 1. Process search
    const nameMatch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = student.phone?.includes(searchTerm);
    const searchMatch = nameMatch || phoneMatch;

    if (!searchMatch) return false;

    // 2. Process active enrollment
    const activeEnrollment = student.enrollments?.find((e: any) => e.status === 'active');
    
    // 3. Process payment status
    const payment = Array.isArray(student.payment_due) 
      ? student.payment_due[0] 
      : student.payment_due;
    const paymentStatus = payment?.status || null;

    if (filterType === 'active') {
      return !!activeEnrollment;
    }
    if (filterType === 'due') {
      return paymentStatus === 'overdue' || paymentStatus === 'partial';
    }
    if (filterType === 'paid') {
      return paymentStatus === 'paid';
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2.5 rounded-xl font-bold transition duration-150 cursor-pointer ${
              filterType === 'all'
                ? 'bg-primary text-white'
                : 'bg-surface-alt text-text-secondary border border-border hover:bg-surface-alt/75 hover:text-primary'
            }`}
          >
            সকল ({toBengaliNumerals(students.length)})
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-4 py-2.5 rounded-xl font-bold transition duration-150 cursor-pointer ${
              filterType === 'active'
                ? 'bg-primary text-white'
                : 'bg-surface-alt text-text-secondary border border-border hover:bg-surface-alt/75 hover:text-primary'
            }`}
          >
            সক্রিয় ব্যাচ ({toBengaliNumerals(students.filter(s => s.enrollments?.some((e: any) => e.status === 'active')).length)})
          </button>
          <button
            onClick={() => setFilterType('due')}
            className={`px-4 py-2.5 rounded-xl font-bold transition duration-150 cursor-pointer ${
              filterType === 'due'
                ? 'bg-error/10 text-error border border-error/20'
                : 'bg-surface-alt text-text-secondary border border-border hover:bg-surface-alt/75 hover:text-primary'
            }`}
          >
            বেতন বাকি ({toBengaliNumerals(students.filter(s => {
              const p = Array.isArray(s.payment_due) ? s.payment_due[0] : s.payment_due;
              return p?.status === 'overdue' || p?.status === 'partial';
            }).length)})
          </button>
          <button
            onClick={() => setFilterType('paid')}
            className={`px-4 py-2.5 rounded-xl font-bold transition duration-150 cursor-pointer ${
              filterType === 'paid'
                ? 'bg-primary-light text-primary border border-primary/20'
                : 'bg-surface-alt text-text-secondary border border-border hover:bg-surface-alt/75 hover:text-primary'
            }`}
          >
            সম্পূর্ণ পরিশোধিত ({toBengaliNumerals(students.filter(s => {
              const p = Array.isArray(s.payment_due) ? s.payment_due[0] : s.payment_due;
              return p?.status === 'paid';
            }).length)})
          </button>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="text-sm text-text-secondary font-semibold">
        মোট {toBengaliNumerals(filteredStudents.length)} জন শিক্ষার্থী পাওয়া গেছে
      </div>

      {/* Students Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-surface-alt text-text-muted flex items-center justify-center mb-3">
              <UserX className="w-6 h-6" />
            </div>
            <p className="text-text-primary font-bold text-sm">কোনো শিক্ষার্থী পাওয়া যায়নি</p>
            <p className="text-text-secondary text-xs mt-1">সার্চ ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-alt border-b border-border text-xs font-bold text-text-secondary uppercase">
                  <th className="px-6 py-4">নাম ও মোবাইল</th>
                  <th className="px-6 py-4">ব্যাচ</th>
                  <th className="px-6 py-4">ভর্তির অবস্থা</th>
                  <th className="px-6 py-4">পেমেন্ট অবস্থা</th>
                  <th className="px-6 py-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredStudents.map((student) => {
                  const activeEnrollment = student.enrollments?.find((e: any) => e.status === 'active');
                  const batchName = activeEnrollment?.batches?.name || 'কোনো ব্যাচ নেই';

                  const payment = Array.isArray(student.payment_due) 
                    ? student.payment_due[0] 
                    : student.payment_due;
                  const paymentStatus = payment?.status || null;
                  const outstanding = payment?.outstanding || 0;
                  const monthlyFee = payment?.monthly_fee || 0;

                  // Render payment status badge
                  let paymentBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-surface-alt text-text-secondary">
                      ভর্তি নেই
                    </span>
                  );

                  if (activeEnrollment) {
                    if (paymentStatus === 'paid') {
                      paymentBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-primary-light text-primary">
                          সম্পূর্ণ ✓
                        </span>
                      );
                    } else if (paymentStatus === 'partial') {
                      paymentBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-accent-light text-accent">
                          আংশিক (৳{toBengaliNumerals(outstanding)} বাকি)
                        </span>
                      );
                    } else if (paymentStatus === 'overdue') {
                      paymentBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-error/10 text-error">
                          বাকি আছে (৳{toBengaliNumerals(monthlyFee)})
                        </span>
                      );
                    } else {
                      paymentBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-surface-alt text-text-secondary">
                          কোনো রেকর্ড নেই
                        </span>
                      );
                    }
                  }

                  // Render enrollment status badge
                  let enrollmentBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-alt text-text-muted">
                      নিবন্ধিত
                    </span>
                  );

                  if (activeEnrollment) {
                    enrollmentBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-light text-primary">
                        সক্রিয়
                      </span>
                    );
                  } else if (student.enrollments?.[0]) {
                    const status = student.enrollments[0].status;
                    if (status === 'dropped') {
                      enrollmentBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-error/10 text-error">
                          বাতিল
                        </span>
                      );
                    } else if (status === 'completed') {
                      enrollmentBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-alt text-text-secondary">
                          সম্পন্ন
                        </span>
                      );
                    }
                  }

                  return (
                    <tr key={student.id} className="hover:bg-surface-alt/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-primary text-sm">{student.full_name}</div>
                        <div className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{student.phone || 'মোবাইল নেই'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-text-secondary flex items-center gap-1 text-xs">
                          <BookOpen className="w-3.5 h-3.5 text-text-muted" />
                          <span>{batchName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {enrollmentBadge}
                      </td>
                      <td className="px-6 py-4">
                        {paymentBadge}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                        {activeEnrollment && (
                          <Link
                            href={`/admin/payments/new?student_id=${student.id}`}
                            className="inline-flex items-center gap-1 p-2 border border-border text-text-secondary hover:text-primary hover:bg-surface-alt rounded-lg transition duration-150"
                            title="পেমেন্ট নিন"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/students/${student.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition duration-150"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>বিস্তারিত</span>
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
    </div>
  );
}
