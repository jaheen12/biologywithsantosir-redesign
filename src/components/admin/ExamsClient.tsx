'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Trophy, 
  ChevronRight, 
  Search, 
  X,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import ExamForm from './ExamForm';
import { toBengaliNumerals, formatBanglaDate } from '@/lib/bangla';

interface Batch {
  id: string;
  name: string;
}

interface Exam {
  id: string;
  batch_id: string;
  title: string;
  exam_date: string;
  total_marks: number;
  type: string;
  batch_name: string;
  enrolled_count: number;
  results_count: number;
}

interface ExamsClientProps {
  batches: Batch[];
  initialExams: Exam[];
}

export default function ExamsClient({ batches, initialExams }: ExamsClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setExams(initialExams);
  }, [initialExams]);

  // Filtered exams
  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.batch_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (exam: Exam) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingExam(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', deleteConfirmId);

      if (error) throw error;

      setExams(prev => prev.filter(e => e.id !== deleteConfirmId));
      router.refresh();
    } catch (err) {
      console.error('Error deleting exam:', err);
      alert('পরীক্ষা মুছে ফেলার সময় সমস্যা হয়েছে।');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const getExamTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      written: 'লিখিত',
      mcq: 'MCQ',
      mock: 'মক টেস্ট',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Action Header Card */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="পরীক্ষার নাম বা ব্যাচ দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition outline-none text-sm text-text-primary bg-surface-alt/25"
          />
        </div>
        
        {/* Add Button */}
        <button
          onClick={handleAddClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন পরীক্ষা যোগ করুন</span>
        </button>
      </div>

      {/* Exams Table Card */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {filteredExams.length === 0 ? (
          <div className="p-12 text-center text-text-secondary flex flex-col items-center gap-2">
            <ClipboardList className="w-12 h-12 text-text-muted/65" />
            <p className="font-bold text-text-primary text-base">কোনো পরীক্ষা পাওয়া যায়নি</p>
            <p className="text-xs">নতুন পরীক্ষা যুক্ত করতে ডান পাশের বাটনে ক্লিক করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border text-xs font-bold text-text-secondary bg-surface-alt/40 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">পরীক্ষার নাম</th>
                  <th className="px-6 py-4 font-semibold">ব্যাচ</th>
                  <th className="px-6 py-4 font-semibold">তারিখ</th>
                  <th className="px-6 py-4 font-semibold">ধরন</th>
                  <th className="px-6 py-4 font-semibold text-center">মোট নম্বর</th>
                  <th className="px-6 py-4 font-semibold text-center w-[200px]">ফলাফল প্রবেশ</th>
                  <th className="px-6 py-4 font-semibold text-center w-[120px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {filteredExams.map((exam) => {
                  const isComplete = exam.enrolled_count > 0 && exam.results_count === exam.enrolled_count;
                  const isStarted = exam.results_count > 0;

                  let progressColor = 'bg-border text-text-secondary border-border/80';
                  let progressText = 'কোনো এন্ট্রি নেই';
                  if (isComplete) {
                    progressColor = 'bg-primary-light text-primary border-primary/20 font-bold';
                    progressText = 'সম্পূর্ণ';
                  } else if (isStarted) {
                    progressColor = 'bg-accent-light/50 text-accent border-accent/20 font-semibold';
                    progressText = 'চলমান';
                  }

                  return (
                    <tr key={exam.id} className="hover:bg-surface-alt/25 transition-colors">
                      <td className="px-6 py-4 font-bold text-text-primary">
                        {exam.title}
                      </td>
                      <td className="px-6 py-4 font-semibold text-text-secondary">
                        {exam.batch_name}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {formatBanglaDate(exam.exam_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-alt border border-border text-text-secondary">
                          {getExamTypeLabel(exam.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-text-primary">
                        {toBengaliNumerals(exam.total_marks)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] border ${progressColor}`}>
                            {progressText} ({toBengaliNumerals(exam.results_count)}/{toBengaliNumerals(exam.enrolled_count)})
                          </span>
                          <Link 
                            href={`/admin/results?exam_id=${exam.id}`}
                            className="text-xs font-bold text-primary hover:text-primary-dark hover:underline flex items-center gap-0.5 transition duration-150"
                          >
                            <span>নম্বর ইনপুট</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEditClick(exam)}
                            className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-primary-light/30 transition cursor-pointer border border-transparent hover:border-primary/10"
                            title="সম্পাদনা"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(exam.id)}
                            className="p-2 rounded-xl text-text-secondary hover:text-error hover:bg-error/5 transition cursor-pointer border border-transparent hover:border-error/10"
                            title="মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Mobile scroll hint */}
            <p className="text-xs text-text-muted text-right md:hidden mt-1">&#8592; স্ক্রোল করুন &#8594;</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-alt">
              <h3 className="font-bold text-text-primary text-base">
                {editingExam ? 'পরীক্ষা সম্পাদনা' : 'নতুন পরীক্ষা যোগ করুন'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <ExamForm
                batches={batches}
                editExam={editingExam}
                onSuccess={() => {
                  setIsModalOpen(false);
                  router.refresh();
                }}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex justify-center">
              <span className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </span>
            </div>
            <h3 className="font-bold text-text-primary text-lg text-center">পরীক্ষা মুছে ফেলুন</h3>
            <p className="text-sm text-text-secondary text-center leading-relaxed">
              আপনি কি নিশ্চিতভাবে এই পরীক্ষাটি মুছে ফেলতে চান? পরীক্ষাটি মুছে ফেললে এর অধীনে থাকা সকল শিক্ষার্থীর ফলাফলও স্থায়ীভাবে মুছে যাবে।
            </p>
            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-alt transition cursor-pointer disabled:opacity-50"
              >
                বাতিল
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2.5 rounded-xl bg-error text-white text-sm font-semibold hover:bg-error/90 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'মুছা হচ্ছে...' : 'হ্যাঁ, মুছুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
