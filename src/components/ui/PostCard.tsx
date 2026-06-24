import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

type LevelVariant = 'ssc' | 'hsc' | 'honours' | 'topic';

export interface PostCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    level: string;
    topic_id: string;
    read_time_min: number;
    published_at: string | null;
    author?: string;
    topics?: {
      name_en: string;
      name_bn: string | null;
      slug: string;
    } | null;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const authorName = post.author || 'Santo Sir';

  // Format published date in Bangla
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Get topic slug and name
  const topicSlug = post.topics?.slug || post.topic_id;
  const topicName = post.topics?.name_bn || post.topics?.name_en || post.topic_id;

  // Fallback gradient based on topic slug for visual interest
  const getGradientClass = (slug: string) => {
    switch (slug) {
      case 'genetics':
        return 'from-teal-600/10 to-primary-mid/20';
      case 'cell-biology':
        return 'from-blue-600/10 to-teal-500/20';
      case 'microbiology':
        return 'from-purple-600/10 to-pink-500/20';
      default:
        return 'from-primary/10 to-accent/20';
    }
  };

  const levelVariant: LevelVariant = ['ssc', 'hsc', 'honours', 'topic'].includes(post.level)
    ? (post.level as LevelVariant)
    : 'topic';

  return (
    <Link
      href={`/topics/${topicSlug}/${post.slug}`}
      className="group block bg-surface border border-border rounded-[10px] overflow-hidden transition-all duration-200 hover:border-primary hover:-translate-y-0.5 hover:shadow-md h-full flex flex-col font-ui"
    >
      {/* Decorative Top Gradient Block (since no thumbnail is available) */}
      <div className={`aspect-video w-full bg-gradient-to-br ${getGradientClass(topicSlug)} flex items-center justify-center border-b border-border`}>
        <svg
          className="w-10 h-10 text-primary/30 group-hover:text-primary/50 transition-colors duration-200"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fill="currentColor" d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7,18.5C15.5,18.5 19,13 22,8C19,10 16,8 17,8M12,2C11.5,4 8.5,8 3,8C3.5,6 6.5,2 12,2Z" />
        </svg>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant={levelVariant}>
            {post.level.toUpperCase()}
          </Badge>
          <Badge variant="topic">
            {topicName}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-[1.125rem] font-bold text-text-primary leading-snug mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-[0.9375rem] text-text-secondary leading-relaxed mb-5 line-clamp-2 flex-grow">
          {post.excerpt}
        </p>

        {/* Metadata */}
        <div className="text-[0.8125rem] text-text-secondary flex items-center justify-between border-t border-border pt-3 mt-auto">
          <span>{authorName}</span>
          <div className="flex items-center gap-1.5 text-text-muted">
            <span>{dateStr}</span>
            <span>&middot;</span>
            <span>{post.read_time_min} মিনিট পঠিত</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
