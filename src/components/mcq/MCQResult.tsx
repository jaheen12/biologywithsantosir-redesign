'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';

interface MCQResultProps {
  correctOption: string;
  selectedOption: string;
  explanation?: string | null;
  onNext: () => void;
  isLast: boolean;
  mcqOptions: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
}

export default function MCQResult({
  correctOption,
  selectedOption,
  explanation,
  onNext,
  isLast,
  mcqOptions,
}: MCQResultProps) {
  const isCorrect = selectedOption === correctOption;
  
  const prefixMap: Record<string, string> = {
    a: 'ক',
    b: 'খ',
    c: 'গ',
    d: 'ঘ',
  };

  const getOptionText = (key: string) => {
    return `${prefixMap[key]}. ${mcqOptions[key as keyof typeof mcqOptions]}`;
  };

  return (
    <div className="bg-surface border border-border p-6 rounded-xl shadow-sm font-ui flex flex-col gap-6 animate-fade-in">
      {/* Alert Header Banner */}
      {isCorrect ? (
        <div className="p-4 bg-[#E8F5F0] border border-primary/20 rounded-xl flex items-start gap-3.5">
          <CheckCircle2 className="text-primary w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[0.9375rem] font-bold text-primary mb-1">
              অভিনন্দন! আপনার উত্তর সঠিক হয়েছে।
            </h4>
            <p className="text-[0.875rem] text-text-secondary">
              আপনি সঠিকভাবে উত্তর দিয়েছেন: <strong className="font-semibold text-text-primary">{getOptionText(selectedOption)}</strong>
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#FDFCEA] border border-error/20 rounded-xl flex items-start gap-3.5">
          <AlertTriangle className="text-error w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[0.9375rem] font-bold text-error mb-1">
              দুঃখিত! আপনার উত্তরটি সঠিক নয়।
            </h4>
            <p className="text-[0.875rem] text-text-secondary">
              আপনার উত্তর: <strong className="font-semibold text-error">{getOptionText(selectedOption)}</strong> (ভুল)
            </p>
            <p className="text-[0.875rem] text-text-secondary mt-1">
              সঠিক উত্তর: <strong className="font-semibold text-primary">{getOptionText(correctOption)}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Explanation Box */}
      <Callout title="ব্যাখ্যা (Explanation)" className="my-0">
        {explanation || 'এই প্রশ্নের কোনো ব্যাখ্যা নেই।'}
      </Callout>

      {/* Navigation Button */}
      <div className="flex justify-end mt-2">
        <Button onClick={onNext} className="w-full sm:w-auto px-8 gap-2">
          {isLast ? (
            <>
              ফলাফল দেখো (Finish) <Award size={18} />
            </>
          ) : (
            <>
              পরবর্তী প্রশ্ন (Next) <ArrowRight size={18} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
