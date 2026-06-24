import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, User, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { supabasePublic as supabase } from '@/lib/supabase/public';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import Breadcrumb from '@/components/article/Breadcrumb';
import TableOfContents from '@/components/article/TableOfContents';
import PostCard from '@/components/ui/PostCard';
import { parseBlocks, extractHeadings } from '@/lib/markdown';
import ReadingProgress from '@/components/article/ReadingProgress';
import { articleSchema, breadcrumbSchema } from '@/lib/structured-data';

interface PageProps {
  params: Promise<{ topicSlug: string; postSlug: string }>;
}

export const revalidate = 3600; // Cache for 1 hour

export async function generateStaticParams() {
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, topic_id')
    .eq('published', true);
  
  if (!posts) return [];
  
  return posts.map((post) => ({
    topicSlug: post.topic_id,
    postSlug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ topicSlug: string; postSlug: string }> }): Promise<Metadata> {
  const { postSlug } = await params;
  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt')
    .eq('slug', postSlug)
    .eq('published', true)
    .single();

  if (!post) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt || 'biologywithsantosir.com এর একটি চমৎকার লেকচার।',
    openGraph: {
      title: post.title,
      description: post.excerpt || 'biologywithsantosir.com এর একটি চমৎকার লেকচার।',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || 'biologywithsantosir.com এর একটি চমৎকার লেকচার।',
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { topicSlug, postSlug } = await params;

  // Fetch the article details with joined topics
  const { data: postData } = await supabase
    .from('posts')
    .select('*, topics(name_en, name_bn, slug)')
    .eq('slug', postSlug)
    .eq('published', true)
    .single();

  // 404 if not found
  if (!postData) {
    notFound();
  }

  const post = {
    ...postData,
    topics: Array.isArray(postData.topics) ? postData.topics[0] : postData.topics,
  };

  // 404 if the topic slug doesn't match the URL
  if (!post.topics || post.topics.slug !== topicSlug) {
    notFound();
  }

  const topicName = post.topics?.name_bn || post.topics?.name_en || post.topic_id;
  const authorName = post.author || 'Santo Sir';

  // Format published date in Bangla
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Extract headings for Table of Contents
  const headings = extractHeadings(post.content || '');

  // Fetch 3 related posts, previous post, and next post in parallel
  const [relatedPostsResult, prevPostResult, nextPostResult] = await Promise.all([
    supabase
      .from('posts')
      .select('id, slug, title, excerpt, level, topic_id, read_time_min, published_at, topics(name_en, slug)')
      .eq('topic_id', post.topic_id)
      .eq('published', true)
      .neq('id', post.id)
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('posts')
      .select('title, slug')
      .eq('topic_id', post.topic_id)
      .eq('published', true)
      .lt('published_at', post.published_at)
      .order('published_at', { ascending: false })
      .limit(1),
    supabase
      .from('posts')
      .select('title, slug')
      .eq('topic_id', post.topic_id)
      .eq('published', true)
      .gt('published_at', post.published_at)
      .order('published_at', { ascending: true })
      .limit(1),
  ]);

  const relatedPostsData = relatedPostsResult.data;
  const relatedPosts = relatedPostsData?.map((p: any) => ({
    ...p,
    topics: Array.isArray(p.topics) ? p.topics[0] : p.topics,
  })) || [];
  const prevPostData = prevPostResult.data;
  const prevPost = prevPostData?.[0] || null;
  const nextPostData = nextPostResult.data;
  const nextPost = nextPostData?.[0] || null;

  const breadcrumbItems = [
    { name: 'Home', url: 'https://biologywithsantosir.com' },
    { name: 'Topics', url: 'https://biologywithsantosir.com/topics' },
    { name: topicName, url: `https://biologywithsantosir.com/topics/${topicSlug}` },
    { name: post.title, url: `https://biologywithsantosir.com/topics/${topicSlug}/${post.slug}` },
  ];

  return (
    <main className="w-full py-8 bg-surface">
      {/* Phospholipid Reading Progress Bar */}
      <ReadingProgress />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              title: post.title,
              excerpt: post.excerpt,
              published_at: post.published_at,
              updated_at: post.updated_at,
              slug: post.slug,
              topicSlug: topicSlug,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbItems)),
        }}
      />
      <Container>
        {/* Breadcrumbs */}
        <Breadcrumb
          topicName={topicName}
          topicSlug={topicSlug}
          postTitle={post.title}
        />

        {/* Article Header */}
        <header className="mb-8 pb-6 border-b border-border">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant={post.level as any}>{post.level.toUpperCase()}</Badge>
            <Badge variant="topic">{topicName}</Badge>
          </div>
          
          <h1 className="text-[1.75rem] md:text-[2.5rem] font-bold text-text-primary leading-tight mb-4 tracking-tight">
            {post.title}
          </h1>

          {/* Meta Information Row */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[0.875rem] text-text-secondary font-ui">
            <div className="flex items-center gap-1.5">
              <User size={16} className="text-primary" />
              <span className="font-semibold text-text-primary">{authorName}</span>
            </div>
            
            {dateStr && (
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-primary" />
                <span>{dateStr}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-primary" />
              <span>{post.read_time_min} মিনিট পাঠ</span>
            </div>
          </div>
        </header>

        {/* Article Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Table of Contents (collapsible on mobile, sticky on desktop) */}
          <aside className="lg:col-span-3 lg:order-2">
            <TableOfContents headings={headings} />
          </aside>

          {/* Article Body */}
          <article className="lg:col-span-9 lg:order-1 prose-bio animate-fade-in">
            {parseBlocks(post.content || '')}
          </article>
        </div>

        {/* Prev / Next Pagination */}
        {(prevPost || nextPost) && (
          <nav className="mt-12 py-8 border-t border-b border-border flex flex-col sm:flex-row justify-between gap-4 font-ui">
            {prevPost ? (
              <Link
                href={`/topics/${topicSlug}/${prevPost.slug}`}
                className="flex-1 p-5 border border-border rounded-xl bg-surface-alt hover:border-primary transition group text-left flex items-start gap-3.5"
              >
                <ChevronLeft size={20} className="text-text-secondary group-hover:text-primary transition mt-1 flex-shrink-0" />
                <div>
                  <span className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider block mb-1">পূর্ববর্তী পোস্ট</span>
                  <span className="text-[0.9375rem] font-bold text-text-primary group-hover:text-primary transition line-clamp-2">
                    {prevPost.title}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex-1 hidden sm:block" />
            )}

            {nextPost ? (
              <Link
                href={`/topics/${topicSlug}/${nextPost.slug}`}
                className="flex-1 p-5 border border-border rounded-xl bg-surface-alt hover:border-primary transition group text-right flex items-start justify-end gap-3.5"
              >
                <div>
                  <span className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider block mb-1">পরবর্তী পোস্ট</span>
                  <span className="text-[0.9375rem] font-bold text-text-primary group-hover:text-primary transition line-clamp-2">
                    {nextPost.title}
                  </span>
                </div>
                <ChevronRight size={20} className="text-text-secondary group-hover:text-primary transition mt-1 flex-shrink-0" />
              </Link>
            ) : (
              <div className="flex-1 hidden sm:block" />
            )}
          </nav>
        )}

        {/* Related Posts Section */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="mt-16">
            <h3 className="text-[1.25rem] md:text-[1.375rem] font-bold text-text-primary mb-6 flex items-center gap-2 font-ui">
              <BookOpen size={20} className="text-primary" />
              সম্পর্কিত অন্যান্য পোস্ট
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((rPost) => (
                <PostCard key={rPost.id} post={rPost} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
