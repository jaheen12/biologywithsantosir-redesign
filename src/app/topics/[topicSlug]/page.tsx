import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import PostCard from '@/components/ui/PostCard';
import { Container } from '@/components/ui/Container';

interface PageProps {
  params: Promise<{ topicSlug: string }>;
  searchParams: Promise<{ level?: string }>;
}

export async function generateStaticParams() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: topics } = await supabase.from('topics').select('slug');
  if (!topics) return [];
  return topics.map((t) => ({ topicSlug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ topicSlug: string }> }): Promise<Metadata> {
  const { topicSlug } = await params;
  const supabase = await createClient();
  const { data: topic } = await supabase
    .from('topics')
    .select('name_en, name_bn, description')
    .eq('slug', topicSlug)
    .single();

  if (!topic) {
    return {
      title: 'Topic Not Found',
    };
  }

  return {
    title: `${topic.name_bn} (${topic.name_en})`,
    description: topic.description || `${topic.name_bn} সম্পর্কিত লেকচার ও টিউটোরিয়াল।`,
    openGraph: {
      title: `${topic.name_bn} (${topic.name_en})`,
      description: topic.description || `${topic.name_bn} সম্পর্কিত লেকচার ও টিউটোরিয়াল।`,
      type: 'website',
    },
  };
}

export default async function TopicHubPage({ params, searchParams }: PageProps) {
  const { topicSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const levelFilter = resolvedSearchParams.level ?? 'all';

  const supabase = await createClient();

  // Fetch the topic details
  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('slug', topicSlug)
    .single();

  if (!topic) {
    notFound();
  }

  // Fetch posts under this topic with joined topics slug/name
  let query = supabase
    .from('posts')
    .select('id, slug, title, excerpt, level, topic_id, read_time_min, published_at, topics(name_en, slug)')
    .eq('topic_id', topic.id)
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (levelFilter !== 'all') {
    query = query.eq('level', levelFilter);
  }

  const { data: postsData } = await query;

  const posts = postsData?.map((post: any) => ({
    ...post,
    topics: Array.isArray(post.topics) ? post.topics[0] : post.topics,
  })) || [];

  const levels = [
    { label: 'সব লেভেল', value: 'all' },
    { label: 'SSC', value: 'ssc' },
    { label: 'HSC', value: 'hsc' },
    { label: 'Honours', value: 'honours' },
  ];

  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container>
        {/* Header */}
        <div className="mb-10 text-center md:text-left max-w-3xl">
          <span className="text-[0.75rem] font-bold text-primary uppercase tracking-wider bg-primary-light px-2.5 py-1 rounded-md mb-3 inline-block">
            বিষয়ভিত্তিক হাব
          </span>
          <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-text-primary leading-tight mb-3">
            {topic.name_bn} <span className="text-text-secondary font-medium text-[1.5rem] md:text-[1.75rem]">({topic.name_en})</span>
          </h1>
          <p className="text-[1rem] text-text-secondary leading-relaxed">
            {topic.description}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-border pb-6">
          <span className="text-[0.875rem] font-bold text-text-primary mr-2">ফিল্টার করো:</span>
          {levels.map((lvl) => {
            const isActive = levelFilter === lvl.value;
            const href = lvl.value === 'all' 
              ? `/topics/${topicSlug}`
              : `/topics/${topicSlug}?level=${lvl.value}`;
            
            return (
              <Link key={lvl.value} href={href}>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-[0.875rem] font-semibold transition duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-primary-light text-primary hover:bg-primary-mid hover:text-white'
                  }`}
                >
                  {lvl.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Posts Grid */}
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="w-full bg-surface-alt border border-border rounded-xl p-12 text-center text-text-secondary">
            এই লেভেলে কোনো পোস্ট পাওয়া যায়নি। অন্য কোনো লেভেল নির্বাচন করুন।
          </div>
        )}
      </Container>
    </main>
  );
}
