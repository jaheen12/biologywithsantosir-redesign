'use client';

import React from 'react';

interface MCQProgressProps {
  current: number;
  total: number;
}

export default function MCQProgress({ current, total }: MCQProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full font-ui mb-6">
      <div className="flex justify-between items-center text-[0.875rem] text-text-secondary font-bold mb-2">
        <span>প্রশ্ন: {current} / {total}</span>
        <span>{percentage}% সম্পূর্ণ</span>
      </div>
      
      {/* Outer progress container */}
      <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
        {/* Inner animated bar */}
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
