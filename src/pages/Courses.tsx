import React from 'react';
import Container from '../components/ui/Container';
import { BookOpen, Star, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const Courses: React.FC = () => {
  return (
    <Container className="py-12 font-sans">
      <div className="border-b border-border pb-8 mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-3">
          পেইড কোর্সসমূহ (Premium Courses)
        </h1>
        <p className="text-text-secondary text-base max-w-3xl leading-relaxed mx-auto md:mx-0">
          সান্টো স্যারের বিশেষ তত্ত্বাবধানে জীববিজ্ঞান প্রিপারেশন। লাইভ ক্লাস, নিয়মিত পরীক্ষা এবং ডাউট সলভিং সেশন।
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-surface-alt border border-border rounded-2xl p-8 md:p-12 text-center my-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full flex items-center justify-center">
          <Star className="text-primary/40" size={24} aria-hidden="true" />
        </div>

        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="text-primary" size={32} aria-hidden="true" />
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-4">
          কোর্স পোর্টালটি খুব শীঘ্রই আসছে!
        </h3>
        <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto mb-8">
          আমাদের পূর্বের WordPress সাইটের TutorLMS কোর্স পোর্টালটি নতুন আধুনিক ওয়েব প্ল্যাটফর্মে স্থানান্তরিত করা হচ্ছে। এই আধুনিক পোর্টালে শিক্ষার্থীরা আরও দ্রুত গতিতে ও আকর্ষণীয় ইউজার ইন্টারফেসে লাইভ কোর্সগুলো করতে পারবে।
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="mailto:contact@biologywithsantosir.com">
            <Button size="lg" className="w-full sm:w-auto">
              নতুন কোর্স আপডেট পেতে মেইল করুন
              <ArrowRight size={16} className="ml-2" aria-hidden="true" />
            </Button>
          </a>
        </div>
      </div>
    </Container>
  );
};

export default Courses;
