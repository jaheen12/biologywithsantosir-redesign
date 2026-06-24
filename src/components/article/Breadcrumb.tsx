import React from 'react';
import Link from 'next/link';

export interface BreadcrumbProps {
  topicName: string;
  topicSlug: string;
  postTitle: string;
}

export default function Breadcrumb({ topicName, topicSlug, postTitle }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-[0.8125rem] text-text-secondary mb-6 font-ui flex-wrap">
      <Link href="/" className="hover:text-primary transition duration-150">
        Home
      </Link>
      <span>&gt;</span>
      <Link href="/topics" className="hover:text-primary transition duration-150">
        Topics
      </Link>
      <span>&gt;</span>
      <Link href={`/topics/${topicSlug}`} className="hover:text-primary transition duration-150">
        {topicName}
      </Link>
      <span>&gt;</span>
      <span className="text-text-muted truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
        {postTitle}
      </span>
    </nav>
  );
}
