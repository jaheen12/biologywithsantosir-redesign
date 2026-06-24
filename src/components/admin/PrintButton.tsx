'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow print:hidden"
    >
      <Printer className="w-4.5 h-4.5" />
      <span>প্রিন্ট করুন</span>
    </button>
  );
}
