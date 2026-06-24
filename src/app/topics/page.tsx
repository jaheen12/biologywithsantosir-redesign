import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Tag, BookOpen, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'সকল জীববিজ্ঞান বিষয়সমূহ | BiologywithSantosir',
  description: 'কোষ জীববিজ্ঞান, জেনেটিক্স, অণুজীববিজ্ঞান ও শারীরতত্ত্ব সহ সান্তো স্যারের জীববিজ্ঞানের সকল বিষয়ের লেকচার এবং অধ্যায়সমূহ ব্রাউজ করুন।',
  openGraph: {
    title: 'সকল জীববিজ্ঞান বিষয়সমূহ | BiologywithSantosir',
    description: 'জীববিজ্ঞানের সকল বিষয়ের লেকচার এবং অধ্যায়সমূহ ব্রাউজ করুন।',
  },
};

export default async function TopicsPage() {
  const supabase = await createClient();
  const { data: topicsData } = await supabase
    .from('topics')
    .select('*')
    .order('sort_order', { ascending: true });

  const topics = topicsData || [];

  // Icon mapping helper for topics
  const getTopicIcon = (slug: string) => {
    switch (slug) {
      case 'genetics':
        return <span className="text-2xl">🧬</span>;
      case 'cell-biology':
        return <span className="text-2xl">🧫</span>;
      case 'microbiology':
        return <span className="text-2xl">🦠</span>;
      case 'physiology':
        return <span className="text-2xl">🌿</span>;
      default:
        return <span className="text-2xl">📖</span>;
    }
  };

  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.8125rem] text-text-secondary mb-6 font-semibold">
          <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight size={14} className="text-text-muted" />
          <span className="text-text-primary">বিষয়সমূহ</span>
        </nav>

        {/* Page Header */}
        <div className="mb-10 max-w-2xl">
          <span className="text-[0.75rem] font-bold text-primary uppercase tracking-wider bg-primary-light px-2.5 py-1 rounded-md mb-3 inline-block">
            বিষয়ভিত্তিক সূচীপত্র
          </span>
          <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-text-primary leading-tight mb-4">
            জীববিজ্ঞানের অধ্যায় ও বিষয়সমূহ
          </h1>
          <p className="text-[1rem] leading-relaxed text-text-secondary">
            নিচে জীববিজ্ঞানের গুরুত্বপূর্ণ বিষয়ভিত্তিক অধ্যায়গুলোর তালিকা দেওয়া হলো। আপনার প্রয়োজনীয় লেভেল ফিল্টার করে প্রতিটি বিষয়ের বিস্তারিত লেকচার নোট পড়তে পারেন।
          </p>
        </div>

        {/* Topics Grid */}
        {topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="border border-border bg-surface rounded-2xl p-6 transition duration-200 hover:border-primary hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-primary-light rounded-xl flex-shrink-0 w-12 h-12 flex items-center justify-center">
                      {getTopicIcon(topic.slug)}
                    </div>
                    <span className="text-[0.6875rem] font-mono font-bold text-text-muted border border-border px-2 py-0.5 rounded uppercase">
                      {topic.slug.toUpperCase()}
                    </span>
                  </div>
                  
                  <h2 className="text-[1.25rem] font-bold text-text-primary mb-1">
                    {topic.name_bn}
                  </h2>
                  <p className="text-[0.875rem] text-text-secondary font-medium mb-3">
                    {topic.name_en}
                  </p>
                  
                  {topic.description && (
                    <p className="text-[0.875rem] text-text-secondary leading-relaxed mb-6 line-clamp-3">
                      {topic.description}
                    </p>
                  )}
                </div>

                <Link
                  href={`/topics/${topic.slug}`}
                  className="inline-flex items-center justify-center gap-1.5 text-center text-[0.875rem] font-bold text-primary hover:text-white bg-primary-light hover:bg-primary transition duration-150 py-2.5 rounded-lg w-full mt-auto"
                >
                  <BookOpen size={16} />
                  লেকচারসমূহ দেখুন &rarr;
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border bg-surface-alt rounded-2xl p-12 text-center text-text-secondary">
            কোনো বিষয় পাওয়া যায়নি।
          </div>
        )}
      </Container>
    </main>
  );
}
