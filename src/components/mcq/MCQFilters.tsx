'use client';

import React from 'react';

export interface Topic {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
}

interface MCQFiltersProps {
  selectedTopic: string;
  setSelectedTopic: (topic: string) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  topics: Topic[];
}

export default function MCQFilters({
  selectedTopic,
  setSelectedTopic,
  selectedLevel,
  setSelectedLevel,
  topics,
}: MCQFiltersProps) {
  const levels = [
    { label: 'সব লেভেল (All Levels)', value: 'all' },
    { label: 'SSC', value: 'ssc' },
    { label: 'HSC', value: 'hsc' },
    { label: 'Honours', value: 'honours' },
  ];

  return (
    <div className="bg-surface border border-border p-5 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 font-ui">
      {/* Topic Filter */}
      <div className="flex flex-col gap-2">
        <label htmlFor="topic-select" className="text-[0.875rem] font-bold text-text-primary">
          বিষয় নির্বাচন করো (Select Topic):
        </label>
        <select
          id="topic-select"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-[0.9375rem] text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition duration-150 cursor-pointer min-h-[48px]"
        >
          <option value="all">সব বিষয় (All Topics)</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name_bn} ({t.name_en})
            </option>
          ))}
        </select>
      </div>

      {/* Level Filter */}
      <div className="flex flex-col gap-2">
        <label htmlFor="level-select" className="text-[0.875rem] font-bold text-text-primary">
          শ্রেণী/লেভেল নির্বাচন করো (Select Level):
        </label>
        <select
          id="level-select"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-[0.9375rem] text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition duration-150 cursor-pointer min-h-[48px]"
        >
          {levels.map((lvl) => (
            <option key={lvl.value} value={lvl.value}>
              {lvl.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
