import React from 'react';
import { Metadata } from 'next';
import MCQClient from '@/components/mcq/MCQClient';

export const metadata: Metadata = {
  title: 'বহুনির্বাচনী প্রশ্ন (MCQ) অনুশীলন | BiologywithSantosir',
  description: 'জীববিজ্ঞান বিষয়ের অধ্যায়ভিত্তিক বহুনির্বাচনী প্রশ্ন (MCQ) সমাধান করে প্রস্তুতি ও দক্ষতা যাচাই করুন।',
  openGraph: {
    title: 'বহুনির্বাচনী প্রশ্ন (MCQ) অনুশীলন | BiologywithSantosir',
    description: 'জীববিজ্ঞান বিষয়ের অধ্যায়ভিত্তিক বহুনির্বাচনী প্রশ্ন (MCQ) সমাধান করে প্রস্তুতি ও দক্ষতা যাচাই করুন।',
    type: 'website',
  },
};

export default function MCQPage() {
  return <MCQClient />;
}
