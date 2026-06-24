import React from 'react';
import { supabasePublic as supabase } from '@/lib/supabase/public';
import HeroSection from '@/components/home/HeroSection';
import QuickNavCards from '@/components/home/QuickNavCards';
import LatestPostsGrid from '@/components/home/LatestPostsGrid';
import InstructorSection from '@/components/home/InstructorSection';
import PopularTopics from '@/components/home/PopularTopics';

export const revalidate = 3600; // Revalidate cache every hour

export default async function HomePage() {

  // Fetch posts and topics in parallel
  const [postsResult, topicsResult] = await Promise.all([
    supabase
      .from('posts')
      .select('id, slug, title, excerpt, level, topic_id, read_time_min, published_at, topics(name_en, slug)')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(6),
    supabase
      .from('topics')
      .select('id, slug, name_en, name_bn')
      .order('sort_order', { ascending: true }),
  ]);

  const posts = postsResult.data?.map((post: any) => ({
    ...post,
    topics: Array.isArray(post.topics) ? post.topics[0] : post.topics,
  })) || [];

  const topics = topicsResult.data || [];

  return (
    <main className="w-full flex flex-col">
      <HeroSection />
      <QuickNavCards />
      <LatestPostsGrid posts={posts} />
      <InstructorSection />
      <PopularTopics topics={topics || []} />
    </main>
  );
}
