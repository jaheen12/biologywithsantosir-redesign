import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Search, BookOpen, Tag, ArrowRight, Loader2, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/Container';
import PostCard from '@/components/ui/PostCard';
import { Badge } from '@/components/ui/Badge';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export const metadata: Metadata = {
  title: 'অনুসন্ধান করুন | BiologywithSantosir',
  description: 'জীববিজ্ঞান লেকচার, অধ্যায় ও শিটসমূহ অনুসন্ধান করে আপনার প্রয়োজনীয় পড়া খুঁজে নিন।',
};

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() || '';

  let results = { posts: [] as any[], topics: [] as any[] };
  let hasSearched = false;

  if (query) {
    hasSearched = true;
    const supabase = await createClient();

    // 1. Search posts matching title or excerpt
    const { data: postsData } = await supabase
      .from('posts')
      .select('id, slug, title, excerpt, level, topic_id, read_time_min, published_at, topics(name_en, name_bn, slug)')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .eq('published', true)
      .limit(10);

    // 2. Search topics matching name_en or name_bn
    const { data: topicsData } = await supabase
      .from('topics')
      .select('id, name_en, name_bn, slug, description')
      .or(`name_en.ilike.%${query}%,name_bn.ilike.%${query}%`)
      .limit(6);

    results = {
      posts: postsData?.map((p: any) => ({
        ...p,
        topics: Array.isArray(p.topics) ? p.topics[0] : p.topics,
      })) || [],
      topics: topicsData || [],
    };
  }

  const suggestionChips = [
    { label: 'কোষ বিভাজন', value: 'কোষ' },
    { label: 'বংশগতি ও জিন', value: 'genetics' },
    { label: 'অণুজীব (ভাইরাস)', value: 'ভাইরাস' },
    { label: 'শারীরতত্ত্ব', value: 'physiology' },
  ];

  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container className="max-w-4xl">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.8125rem] text-text-secondary mb-6 font-semibold">
          <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight size={14} className="text-text-muted" />
          <span className="text-text-primary">অনুসন্ধান</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <span className="text-[0.75rem] font-bold text-primary uppercase tracking-wider bg-primary-light px-2.5 py-1 rounded-md mb-3 inline-block">
            সার্চ ইঞ্জিন
          </span>
          <h1 className="text-[2rem] md:text-[2.25rem] font-bold text-text-primary leading-tight mb-2">
            জীববিজ্ঞান অনুসন্ধান করুন
          </h1>
        </div>

        {/* Search Console Input Form */}
        <form method="GET" action="/search" className="mb-8 flex gap-2">
          <div className="relative flex-grow flex items-center border border-border focus-within:border-primary-mid rounded-xl bg-surface transition overflow-hidden shadow-sm">
            <Search className="absolute left-4 text-text-muted w-5 h-5" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="কী খুঁজতে চান? (উদাঃ কোষ, জেনেটিক্স, DNA)..."
              className="w-full pl-12 pr-4 py-3.5 text-[1.0625rem] text-text-primary placeholder-text-muted outline-none border-none font-ui"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-[0.9375rem] rounded-xl transition shadow-sm"
          >
            সার্চ করুন
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2.5 mb-10 text-[0.875rem]">
          <span className="text-text-secondary font-bold">পপুলার ট্যাগ:</span>
          {suggestionChips.map((chip) => (
            <Link key={chip.value} href={`/search?q=${chip.value}`}>
              <span className="bg-primary-light hover:bg-primary hover:text-white text-primary font-semibold px-3 py-1.5 rounded-lg transition duration-150 cursor-pointer">
                {chip.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Search Results Area */}
        {hasSearched ? (
          <div className="space-y-10">
            {/* Summary statistics */}
            <div className="text-[0.875rem] font-bold text-text-secondary pb-4 border-b border-border">
              "কিউরি: <span className="text-primary font-semibold font-mono">{query}</span>" — এ মোট{' '}
              <span className="text-primary font-semibold">
                {results.posts.length + results.topics.length}
              </span>{' '}
              টি ফলাফল পাওয়া গেছে।
            </div>

            {/* Empty state */}
            {results.posts.length === 0 && results.topics.length === 0 && (
              <div className="text-center py-12 text-text-secondary">
                <p className="text-[1.125rem] font-bold">দুঃখিত, কোনো ফলাফল পাওয়া যায়নি।</p>
                <p className="text-[0.875rem] text-text-muted mt-1">অন্য কোনো শব্দ বা ভিন্ন বানানে আবার চেষ্টা করুন।</p>
              </div>
            )}

            {/* Matching Topics */}
            {results.topics.length > 0 && (
              <div>
                <h3 className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Tag size={14} className="text-primary" />
                  বিষয়সমূহ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.topics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/topics/${topic.slug}`}
                      className="p-4 border border-border hover:border-primary bg-surface rounded-xl flex items-center justify-between group transition duration-150 shadow-sm"
                    >
                      <div>
                        <h4 className="text-[1rem] font-bold text-text-primary group-hover:text-primary transition-colors">
                          {topic.name_bn}
                        </h4>
                        <p className="text-[0.8125rem] text-text-secondary mt-0.5">
                          {topic.name_en}
                        </p>
                      </div>
                      <ArrowRight size={18} className="text-text-muted group-hover:text-primary transition -translate-x-1 group-hover:translate-x-0 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Posts */}
            {results.posts.length > 0 && (
              <div>
                <h3 className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-primary" />
                  লেকচার ও পোস্টসমূহ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {results.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-border bg-surface-alt rounded-2xl p-10 text-center text-text-secondary py-16">
            <p className="text-[1.125rem] font-bold text-text-primary mb-2">আপনি কি খুঁজছেন?</p>
            <p className="text-[0.875rem] leading-relaxed text-text-secondary max-w-md mx-auto">
              সান্তো স্যারের জীববিজ্ঞান ওয়েবসাইটের সকল লেকচার শিট, হ্যান্ডনোট ও অধ্যায়ভিত্তিক সৃজনশীল প্রশ্ন সলভিং লেকচার খুঁজে বের করতে ওপরে সার্চ করুন।
            </p>
          </div>
        )}
      </Container>
    </main>
  );
}
