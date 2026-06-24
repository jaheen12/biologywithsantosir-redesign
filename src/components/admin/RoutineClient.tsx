'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Video, 
  Link as LinkIcon, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import RoutineForm from './RoutineForm';
import { formatBanglaTime } from '@/lib/bangla';

interface Routine {
  id: string;
  batch_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string;
  platform: 'Physical' | 'Zoom' | 'Google Meet';
  link: string | null;
}

interface Batch {
  id: string;
  name: string;
}

interface RoutineClientProps {
  batches: Batch[];
  selectedBatchId: string;
  initialRoutines: Routine[];
}

const DAY_ORDER = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DAY_BN: Record<string, string> = {
  Saturday: 'শনিবার',
  Sunday: 'রবিবার',
  Monday: 'সোমবার',
  Tuesday: 'মঙ্গলবার',
  Wednesday: 'বুধবার',
  Thursday: 'বৃহস্পতিবার',
  Friday: 'শুক্রবার',
};

export default function RoutineClient({
  batches,
  selectedBatchId,
  initialRoutines,
}: RoutineClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [prefilledDay, setPrefilledDay] = useState<string | null>(null);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setRoutines(initialRoutines);
  }, [initialRoutines]);

  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/admin/routine?batch=${e.target.value}`);
  };

  const handleAddClick = (day: string) => {
    setEditingRoutine(null);
    setPrefilledDay(day);
    setIsModalOpen(true);
  };

  const handleEditClick = (routine: Routine) => {
    setEditingRoutine(routine);
    setPrefilledDay(null);
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
        .from('routines')
        .delete()
        .eq('id', deleteConfirmId);

      if (error) throw error;

      setRoutines(prev => prev.filter(r => r.id !== deleteConfirmId));
      router.refresh();
    } catch (err) {
      console.error('Error deleting routine:', err);
      alert('ক্লাস মুছে ফেলার সময় সমস্যা হয়েছে।');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Batch Select Card */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">সাপ্তাহিক ক্লাস সমূহের সূচি</h2>
          <p className="text-xs text-text-secondary mt-0.5">ব্যাচ সিলেক্ট করে ক্লাস শিডিউল আপডেট বা পরিবর্তন করুন।</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-text-secondary shrink-0">ব্যাচ নির্বাচন:</label>
          <select
            value={selectedBatchId}
            onChange={handleBatchChange}
            className="px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 transition outline-none text-sm font-semibold text-text-primary bg-surface min-w-[200px]"
          >
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Routine Days Grid */}
      <div className="grid grid-cols-1 gap-6">
        {DAY_ORDER.map((day) => {
          const dayRoutines = routines
            .filter((r) => r.day_of_week === day)
            // Sort by start_time ascending
            .sort((a, b) => a.start_time.localeCompare(b.start_time));

          return (
            <div 
              key={day}
              className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              {/* Day Header */}
              <div className="bg-surface-alt border-b border-border px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-bold text-text-primary text-base">{DAY_BN[day]}</span>
                  <span className="text-xs px-2 py-0.5 bg-primary-light text-primary font-bold rounded-full">
                    {dayRoutines.length} টি ক্লাস
                  </span>
                </div>
                <button
                  onClick={() => handleAddClick(day)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ক্লাস যোগ করুন</span>
                </button>
              </div>

              {/* Class List */}
              <div className="p-5 divide-y divide-border/60">
                {dayRoutines.length === 0 ? (
                  <div className="py-6 text-center text-sm text-text-muted italic flex items-center justify-center gap-2">
                    <HelpCircle className="w-4 h-4 text-text-muted/60" />
                    <span>এই দিনে কোনো ক্লাস শিডিউল করা নেই।</span>
                  </div>
                ) : (
                  dayRoutines.map((routine, idx) => {
                    const isPhysical = routine.platform === 'Physical';
                    const hasLink = !!routine.link;

                    return (
                      <div 
                        key={routine.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 ${
                          idx === 0 ? 'pt-1' : ''
                        } ${idx === dayRoutines.length - 1 ? 'pb-1' : ''}`}
                      >
                        {/* Left: Time & Subject */}
                        <div className="flex items-start gap-4">
                          {/* Time Indicator */}
                          <div className="bg-surface-alt border border-border/80 rounded-xl px-3 py-2 text-center min-w-[110px] shrink-0">
                            <span className="text-xs text-text-secondary block font-semibold">
                              {formatBanglaTime(routine.start_time)}
                            </span>
                            <span className="text-[10px] text-text-muted block mt-0.5 uppercase tracking-wider font-semibold">
                              থেকে
                            </span>
                            <span className="text-xs text-text-secondary block font-semibold mt-0.5">
                              {formatBanglaTime(routine.end_time)}
                            </span>
                          </div>

                          {/* Subject details */}
                          <div className="space-y-1.5">
                            <h3 className="font-bold text-text-primary text-base">
                              {routine.subject}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Platform Badge */}
                              {isPhysical ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-light text-primary border border-primary/20">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>সরাসরি (Physical)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                                  <Video className="w-3.5 h-3.5" />
                                  <span>{routine.platform} Online</span>
                                </span>
                              )}

                              {/* Link Button if online */}
                              {!isPhysical && hasLink && (
                                <a
                                  href={routine.link!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 transition duration-150"
                                >
                                  <LinkIcon className="w-3.5 h-3.5" />
                                  <span>লিংকে যান</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => handleEditClick(routine)}
                            className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-primary-light/30 transition cursor-pointer border border-transparent hover:border-primary/10"
                            title="সম্পাদনা"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(routine.id)}
                            className="p-2 rounded-xl text-text-secondary hover:text-error hover:bg-error/5 transition cursor-pointer border border-transparent hover:border-error/10"
                            title="মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-alt">
              <h3 className="font-bold text-text-primary text-base">
                {editingRoutine ? 'ক্লাস রুটিন সম্পাদন' : 'নতুন ক্লাস যুক্তকরণ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <RoutineForm
                batchId={selectedBatchId}
                editRoutine={editingRoutine}
                prefilledDay={prefilledDay}
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
            <h3 className="font-bold text-text-primary text-lg text-center">ক্লাস মুছে ফেলুন</h3>
            <p className="text-sm text-text-secondary text-center leading-relaxed">
              আপনি কি নিশ্চিতভাবে এই ক্লাসটি রুটিন থেকে মুছে ফেলতে চান? এই অ্যাকশনটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।
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
