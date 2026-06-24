'use client';

import React, { useState } from 'react';
import NoteCard, { Note } from './NoteCard';

interface NotesClientProps {
  initialNotes: Note[];
}

type FilterLevel = 'all' | 'ssc' | 'hsc' | 'honours';

export default function NotesClient({ initialNotes }: NotesClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterLevel>('all');

  const filterTabs: { label: string; value: FilterLevel }[] = [
    { label: 'সব নোট (All)', value: 'all' },
    { label: 'SSC', value: 'ssc' },
    { label: 'HSC', value: 'hsc' },
    { label: 'Honours', value: 'honours' },
  ];

  const filteredNotes = activeFilter === 'all'
    ? initialNotes
    : initialNotes.filter((n) => n.level === activeFilter);

  return (
    <div className="flex flex-col gap-8 font-ui">
      {/* Level Filtering Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-5">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-5 py-2.5 rounded-lg text-[0.875rem] font-bold transition duration-150 cursor-pointer min-h-[44px] ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-primary-light text-primary hover:bg-primary-mid hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="bg-surface-alt border border-border rounded-xl p-16 text-center text-text-secondary">
          <p className="text-[1.0625rem] font-bold">কোনো নোট পাওয়া যায়নি</p>
          <p className="text-[0.875rem] text-text-muted mt-1">
            এই লেভেলে বর্তমানে কোনো নোট বা PDF উপলব্ধ নেই। অনুগ্রহ করে অন্য লেভেল দেখুন।
          </p>
        </div>
      )}
    </div>
  );
}
