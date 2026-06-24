'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Eye, 
  CreditCard, 
  UserCheck, 
  UserX, 
  AlertCircle, 
  CheckCircle,
  Phone, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Loader2 
} from 'lucide-react';
import { createStudent, updateStudent, deleteStudent } from '@/app/admin/students/actions';

interface Batch {
  id: string;
  name: string;
  is_active: boolean;
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

export default function StudentsClient({ 
  students,
  batches
}: { 
  students: any[];
  batches: Batch[];
}) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'due' | 'paid'>('all');

  // Modal Open states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form states - Create
  const [createName, setCreateName] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createBatchId, setCreateBatchId] = useState('');

  // Form states - Edit
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBatchId, setEditBatchId] = useState('');

  // Delete state
  const [studentToDelete, setStudentToDelete] = useState<any>(null);

  // Form submit loading / errors / success states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!createName || !createEmail || !createPassword) {
      setError('দয়া করে নাম, ইমেল এবং পাসওয়ার্ড প্রদান করুন।');
      setLoading(false);
      return;
    }

    try {
      const res = await createStudent({
        fullName: createName,
        phone: createPhone,
        email: createEmail,
        password: createPassword,
        batchId: createBatchId || undefined,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        showToast('শিক্ষার্থী সফলভাবে তৈরি হয়েছে ✓', 'success');
        setIsCreateOpen(false);
        // Reset states
        setCreateName('');
        setCreatePhone('');
        setCreateEmail('');
        setCreatePassword('');
        setCreateBatchId('');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'শিক্ষার্থী তৈরিতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (student: any) => {
    setSelectedStudent(student);
    setEditName(student.full_name || '');
    setEditPhone(student.phone || '');
    const activeEnrollment = student.enrollments?.find((e: any) => e.status === 'active');
    setEditBatchId(activeEnrollment?.batch_id || '');
    setIsEditOpen(true);
    setError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setLoading(true);
    setError(null);

    try {
      const res = await updateStudent(selectedStudent.id, {
        fullName: editName,
        phone: editPhone,
        batchId: editBatchId || undefined,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        showToast('শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে ✓', 'success');
        setIsEditOpen(false);
        setSelectedStudent(null);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'তথ্য পরিবর্তনে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (student: any) => {
    setStudentToDelete(student);
    setIsDeleteOpen(true);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setLoading(true);
    setError(null);

    try {
      const res = await deleteStudent(studentToDelete.id);

      if (res?.error) {
        setError(res.error);
      } else {
        showToast('শিক্ষার্থী সফলভাবে ডিলিট হয়েছে ✓', 'success');
        setIsDeleteOpen(false);
        setStudentToDelete(null);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'ডিলিট করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

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
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 bg-surface border rounded-xl p-4 flex items-center gap-3 shadow-lg text-sm animate-in slide-in-from-bottom-5 duration-200 ${
          toast.type === 'success' 
            ? 'bg-primary-light/95 border-primary/20 text-primary' 
            : 'bg-error/10 border-error/20 text-error'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

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
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
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

      {/* Results Count Banner and Add Student Button */}
      <div className="flex justify-between items-center gap-4">
        <div className="text-sm text-text-secondary font-semibold">
          মোট {toBengaliNumerals(filteredStudents.length)} জন শিক্ষার্থী পাওয়া গেছে
        </div>
        <button
          onClick={() => {
            setError(null);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs md:text-sm font-bold rounded-xl hover:bg-primary-dark shadow-sm transition duration-150 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>নতুন শিক্ষার্থী যোগ করুন</span>
        </button>
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
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
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
                          className="inline-flex items-center gap-1 p-2 border border-border text-text-secondary hover:text-primary hover:bg-surface-alt rounded-lg transition duration-150"
                          title="বিস্তারিত"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEditClick(student)}
                          className="inline-flex items-center gap-1 p-2 border border-border text-text-secondary hover:text-accent hover:bg-surface-alt rounded-lg transition duration-150 cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
                          className="inline-flex items-center gap-1 p-2 border border-border text-text-secondary hover:text-error hover:bg-surface-alt rounded-lg transition duration-150 cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. Add Student Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-text-primary text-base">নতুন শিক্ষার্থী যোগ করুন</h3>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary">সম্পূর্ণ নাম <span className="text-error">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সায়মন রহমান"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
                />
              </div>

              {/* Phone field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  placeholder="যেমন: 017XXXXXXXX"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
                />
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary">ইমেইল ঠিকানা <span className="text-error">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="যেমন: student@email.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted font-sans"
                />
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary">লগইন পাসওয়ার্ড <span className="text-error">*</span></label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted font-sans"
                />
              </div>

              {/* Batch selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary">ব্যাচ ভর্তি</label>
                <select
                  value={createBatchId}
                  onChange={(e) => setCreateBatchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer text-text-primary font-medium"
                >
                  <option value="">কোনো ব্যাচ নেই (পরে ভর্তি করুন)</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} {!batch.is_active && '(নিষ্ক্রিয়)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 justify-end pt-2 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-surface-alt border border-border text-xs font-semibold text-text-secondary rounded-xl hover:bg-surface-alt/75 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>শিক্ষার্থী তৈরি করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Student Modal */}
      {isEditOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-text-primary text-base">শিক্ষার্থীর তথ্য সম্পাদনা</h3>
              <button 
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedStudent(null);
                }}
                className="text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary">সম্পূর্ণ নাম <span className="text-error">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সায়মন রহমান"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
                />
              </div>

              {/* Phone field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  placeholder="যেমন: 017XXXXXXXX"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
                />
              </div>

              {/* Batch selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary">ব্যাচ পরিবর্তন</label>
                <select
                  value={editBatchId}
                  onChange={(e) => setEditBatchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer text-text-primary font-medium"
                >
                  <option value="">কোনো ব্যাচ নেই (ভর্তি বাতিল)</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} {!batch.is_active && '(নিষ্ক্রিয়)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 justify-end pt-2 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="px-4 py-2 bg-surface-alt border border-border text-xs font-semibold text-text-secondary rounded-xl hover:bg-surface-alt/75 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>তথ্য আপডেট করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Student Confirmation Modal */}
      {isDeleteOpen && studentToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-text-primary text-base">শিক্ষার্থী ডিলিট নিশ্চিত করুন</h3>
              <button 
                onClick={() => {
                  setIsDeleteOpen(false);
                  setStudentToDelete(null);
                }}
                className="text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-start gap-3 bg-error/5 p-4 border border-error/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1">
                  <p className="text-text-primary font-bold text-sm">সতর্কতা!</p>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    আপনি কি নিশ্চিতভাবে <strong className="text-text-primary">{studentToDelete.full_name}</strong>-কে ডিলিট করতে চান? ডিলিট করলে তার পেমেন্ট হিস্টোরি, উপস্থিতি এবং পরীক্ষার ফলাফল সহ ডাটাবেজের সকল তথ্য চিরতরে মুছে যাবে। এই কাজ আর ফিরিয়ে আনা যাবে না।
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end pt-2 border-t border-border mt-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setIsDeleteOpen(false);
                    setStudentToDelete(null);
                  }}
                  className="px-4 py-2 bg-surface-alt border border-border text-xs font-semibold text-text-secondary rounded-xl hover:bg-surface-alt/75 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-error text-white text-xs font-bold rounded-xl hover:bg-error/90 transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>হ্যাঁ, ডিলিট করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
