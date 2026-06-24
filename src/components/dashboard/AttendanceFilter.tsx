'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface MonthOption {
  value: string;
  label: string;
}

interface AttendanceFilterProps {
  currentMonth: string;
  options: MonthOption[];
}

export default function AttendanceFilter({ currentMonth, options }: AttendanceFilterProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-secondary font-medium">মাস নির্বাচন:</span>
      <select
        value={currentMonth}
        onChange={(e) => router.push(`/dashboard/attendance?month=${e.target.value}`)}
        className="px-4 py-2 border border-border rounded-xl bg-surface text-text-primary text-sm font-medium focus:outline-none focus:border-primary-mid transition-all duration-150 cursor-pointer shadow-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
