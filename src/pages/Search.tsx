import React, { useState } from 'react';
import Container from '../components/ui/Container';
import { Search as SearchIcon, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');

  return (
    <Container className="py-12 font-sans">
      <div className="border-b border-border pb-8 mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-3">
          নিবন্ধ অনুসন্ধান (Search Articles)
        </h1>
        <p className="text-text-secondary text-base max-w-3xl leading-relaxed mx-auto md:mx-0">
          জীববিজ্ঞানের যেকোনো জটিল টপিক, সংজ্ঞা বা অধ্যায়ের লেকচার শিট খুঁজে পেতে নিচে অনুসন্ধান করুন।
        </p>
      </div>

      <div className="max-w-2xl mx-auto my-8">
        <div className="relative">
          <input
            type="text"
            placeholder="যেমন: ডিএনএ, মাইটোসিস, ক্রেবস চক্র..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} aria-hidden="true" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-surface-alt border border-border rounded-2xl p-8 md:p-12 text-center my-12 shadow-sm relative overflow-hidden">
        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
          <SearchIcon className="text-primary" size={32} aria-hidden="true" />
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-4">
          রিয়েল-টাইম সার্চ ইঞ্জিন আসছে!
        </h3>
        <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto mb-8">
          আমাদের পরবর্তী ফেইজ (Phase 3) রিলিজের অংশ হিসেবে একটি আধুনিক ফ্লায়িং সার্চ (Fuse.js ভিত্তিক) ইন্টিগ্রেশন চালু করা হবে, যা প্রতিটি কিওয়ার্ড লেখার সাথে সাথে মুহূর্তের মধ্যে মিল থাকা কন্টেন্টগুলো ফিল্টার করে প্রদর্শন করবে।
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="mailto:contact@biologywithsantosir.com">
            <Button size="lg" className="w-full sm:w-auto">
              সার্চ ফিচার আপডেট পেতে মেইল করুন
              <ArrowRight size={16} className="ml-2" aria-hidden="true" />
            </Button>
          </a>
        </div>
      </div>
    </Container>
  );
};

export default Search;
