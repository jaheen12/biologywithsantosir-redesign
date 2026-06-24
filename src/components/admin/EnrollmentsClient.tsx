'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import EnrollmentRow from './EnrollmentRow';

interface Batch {
  id: string;
  name: string;
  seats_remaining: number;
}

interface EnrollmentDetail {
  id: string;
  student_id: string;
  batch_id: string;
  status: 'active' | 'dropped' | 'completed';
  enrolled_at: string;
  profiles: {
    full_name: string;
    phone: string | null;
  } | null;
  batches: {
    name: string;
  } | null;
}

export default function EnrollmentsClient({
  initialEnrollments,
  batches,
}: {
  initialEnrollments: EnrollmentDetail[];
  batches: Batch[];
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEnrollments = useMemo(() => {
    if (!searchTerm.trim()) return initialEnrollments;
    const lowerSearch = searchTerm.toLowerCase();
    return initialEnrollments.filter((e) => {
      const name = e.profiles?.full_name?.toLowerCase() || '';
      const phone = e.profiles?.phone || '';
      const batchName = e.batches?.name?.toLowerCase() || '';
      return (
        name.includes(lowerSearch) ||
        phone.includes(lowerSearch) ||
        batchName.includes(lowerSearch)
      );
    });
  }, [initialEnrollments, searchTerm]);

  return (
    <div className="bg-surface rounded-2xl border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Header with Search */}
      <div className="px-6 py-4.5 border-b border-border/60 bg-surface flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-base font-bold text-text-primary shrink-0">ভর্তি হওয়া শিক্ষার্থীদের তালিকা</h2>
        
        {/* Sleek Search Box */}
        <div className="relative w-full sm:w-64 md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="শিক্ষার্থী বা ব্যাচ খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-surface-alt/40 hover:bg-surface-alt/70 focus:bg-surface border border-border/80 hover:border-border rounded-xl text-xs focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition duration-150 placeholder:text-text-muted"
          />
        </div>
      </div>

      {filteredEnrollments.length === 0 ? (
        <p className="p-8 text-center text-xs text-text-muted font-medium">কোনো ভর্তির রেকর্ড পাওয়া যায়নি।</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-surface-alt/60 border-b border-border/60 text-xs font-bold text-text-muted uppercase tracking-wider">
                <th className="px-6 py-3.5 text-left">শিক্ষার্থী</th>
                <th className="px-6 py-3.5 text-left">ব্যাচ</th>
                <th className="px-6 py-3.5 text-left">ভর্তির তারিখ</th>
                <th className="px-6 py-3.5 text-left">অবস্থা</th>
                <th className="px-6 py-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredEnrollments.map((enrollment) => (
                <EnrollmentRow 
                  key={enrollment.id} 
                  enrollment={enrollment} 
                  batches={batches}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
