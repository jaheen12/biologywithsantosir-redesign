'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

export interface MCQ {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
  chapter?: string;
  level: string;
}

interface MCQCardProps {
  mcq: MCQ;
  selectedOption: string | null;
  setSelectedOption: (option: 'a' | 'b' | 'c' | 'd') => void;
  onSubmit: () => void;
  isAnswered: boolean;
}

export default function MCQCard({
  mcq,
  selectedOption,
  setSelectedOption,
  onSubmit,
  isAnswered,
}: MCQCardProps) {
  const options = [
    { key: 'a', prefix: 'ক', text: mcq.option_a },
    { key: 'b', prefix: 'খ', text: mcq.option_b },
    { key: 'c', prefix: 'গ', text: mcq.option_c },
    { key: 'd', prefix: 'ঘ', text: mcq.option_d },
  ];

  return (
    <div className="bg-surface border border-border p-6 rounded-xl shadow-sm font-ui flex flex-col gap-6">
      {/* Chapter & Level badges */}
      <div className="flex flex-wrap gap-2 items-center text-[0.8125rem] text-text-secondary">
        {mcq.chapter && (
          <span className="bg-surface-alt px-2.5 py-1 border border-border rounded-md font-semibold">
            অধ্যায়: {mcq.chapter}
          </span>
        )}
        <span className="bg-primary-light text-primary px-2.5 py-1 rounded-md font-bold uppercase">
          {mcq.level.toUpperCase()}
        </span>
      </div>

      {/* Question */}
      <h2 className="text-[1.125rem] md:text-[1.25rem] font-bold text-text-primary leading-snug">
        {mcq.question}
      </h2>

      {/* Options List */}
      <div className="flex flex-col gap-3.5">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.key;
          return (
            <button
              key={opt.key}
              disabled={isAnswered}
              onClick={() => setSelectedOption(opt.key as any)}
              className={`w-full text-left px-5 py-4 border rounded-xl flex items-center gap-4 transition duration-150 min-h-[48px] cursor-pointer select-none active:scale-[0.99] ${
                isSelected
                  ? 'bg-primary-light border-primary text-primary font-bold shadow-sm'
                  : 'bg-surface border-border text-text-primary hover:bg-surface-alt hover:border-primary-mid'
              } ${isAnswered ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {/* Option Bullet */}
              <span
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[0.8125rem] font-bold flex-shrink-0 transition duration-150 ${
                  isSelected
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-alt border-border text-text-secondary'
                }`}
              >
                {opt.prefix}
              </span>
              {/* Option Text */}
              <span className="text-[0.9375rem] font-semibold leading-relaxed">
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Button */}
      {!isAnswered && (
        <div className="mt-2 flex justify-end">
          <Button
            onClick={onSubmit}
            disabled={!selectedOption}
            className="w-full sm:w-auto px-8"
          >
            উত্তর জমা দাও (Submit)
          </Button>
        </div>
      )}
    </div>
  );
}
