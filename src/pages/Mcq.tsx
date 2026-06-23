import React from 'react';
import Container from '../components/ui/Container';
import { Award, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const Mcq: React.FC = () => {
  return (
    <Container className="py-12 font-sans">
      <div className="border-b border-border pb-8 mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-3">
          MCQ অনুশীলন (MCQ Practice)
        </h1>
        <p className="text-text-secondary text-base max-w-3xl leading-relaxed mx-auto md:mx-0">
          বোর্ড পরীক্ষা ও বিশ্ববিদ্যালয় ভর্তি পরীক্ষার সিলেবাস অনুযায়ী অধ্যায়ভিত্তিক কুইজ এবং নিজের মেধা যাচাই।
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-surface-alt border border-border rounded-2xl p-8 md:p-12 text-center my-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full flex items-center justify-center">
          <Award className="text-primary/40" size={24} aria-hidden="true" />
        </div>

        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="text-primary" size={32} aria-hidden="true" />
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-4">
          ইন্টারেক্টিভ কুইজ ইঞ্জিন আসছে!
        </h3>
        <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto mb-8">
          আমাদের পরবর্তী ফেইজ (Phase 3) রিলিজের অংশ হিসেবে একটি আধুনিক এমসিকিউ কু্ইজ প্লাটফর্ম যুক্ত করা হবে। যেখানে শিক্ষার্থীরা ইনস্ট্যান্ট মার্কস, ভুল উত্তরের সঠিক ব্যাখ্যা এবং লিডারবোর্ড অ্যাক্সেস করতে পারবে।
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="mailto:contact@biologywithsantosir.com">
            <Button size="lg" className="w-full sm:w-auto">
              নতুন ফিচার রিলিজ নোটিফিকেশন পেতে মেইল করুন
              <ArrowRight size={16} className="ml-2" aria-hidden="true" />
            </Button>
          </a>
        </div>
      </div>
    </Container>
  );
};

export default Mcq;
