import React from 'react';
import Container from '../components/ui/Container';
import { FileText, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const Notes: React.FC = () => {
  return (
    <Container className="py-12 font-sans">
      <div className="border-b border-border pb-8 mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-3">
          ফ্রি পিডিএফ নোটস (Free PDF Notes)
        </h1>
        <p className="text-text-secondary text-base max-w-3xl leading-relaxed mx-auto md:mx-0">
          এসএসসি, এইচএসসি এবং অনার্স জীববিজ্ঞানের গুরুত্বপূর্ণ চিত্রসমূহ এবং লেকচার শিটের ফ্রি ডাউনলোডেবল পিডিএফ কপি।
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-surface-alt border border-border rounded-2xl p-8 md:p-12 text-center my-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full flex items-center justify-center">
          <FileText className="text-primary/40" size={24} aria-hidden="true" />
        </div>

        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="text-primary" size={32} aria-hidden="true" />
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-4">
          পিডিএফ নোটস লাইব্রেরি আসছে!
        </h3>
        <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto mb-8">
          আমাদের পূর্বের ড্রাইভ ও ওয়ার্ডপ্রেসের সকল ক্লাস নোট, শিট এবং চিত্রাবলীকে সুবিন্যস্তভাবে সরাসরি Supabase Storage-এ যুক্ত করা হচ্ছে। খুব শীঘ্রই শিক্ষার্থীরা একদম ফ্রিতে এই শিটগুলো এক ক্লিকে ডাউনলোড করতে পারবে।
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="mailto:contact@biologywithsantosir.com">
            <Button size="lg" className="w-full sm:w-auto">
              নোটস রিলিজ আপডেট পেতে মেইল করুন
              <ArrowRight size={16} className="ml-2" aria-hidden="true" />
            </Button>
          </a>
        </div>
      </div>
    </Container>
  );
};

export default Notes;
