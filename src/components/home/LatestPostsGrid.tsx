import React from 'react';
import Link from 'next/link';
import PostCard from '@/components/ui/PostCard';
import { Container } from '@/components/ui/Container';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  level: string;
  topic_id: string;
  read_time_min: number;
  published_at: string;
  author?: string;
  topics?: {
    name_en: string;
    name_bn?: string;
    slug: string;
  } | null;
}

export interface LatestPostsGridProps {
  posts: Post[];
}

export default function LatestPostsGrid({ posts }: LatestPostsGridProps) {
  return (
    <section className="w-full py-12 md:py-16 bg-surface-alt border-t border-b border-border font-ui">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-[1.75rem] font-bold text-text-primary leading-tight">
              সাম্প্রতিক পোস্ট
            </h2>
            <p className="text-[0.9375rem] text-text-secondary mt-1">
               Santo Sir-এর লেটেস্ট আপলোড করা টিউটোরিয়াল এবং গাইডসমূহ।
            </p>
          </div>
          <Link
            href="/topics"
            className="inline-flex items-center gap-1.5 text-primary font-semibold hover:text-primary-dark transition duration-150 text-[0.9375rem]"
          >
            সব পোস্ট দেখো &rarr;
          </Link>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="w-full bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
            কোনো পোস্ট পাওয়া যায়নি। শীঘ্রই নতুন পোস্ট যোগ করা হবে।
          </div>
        )}
      </Container>
    </section>
  );
}
