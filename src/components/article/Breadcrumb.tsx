import React from 'react';
import Link from 'next/link';

export interface BreadcrumbProps {
  topicName: string;
  topicSlug: string;
  postTitle: string;
}

export default function Breadcrumb({ topicName, topicSlug, postTitle }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 font-ui">
      <ol className="flex items-center gap-1.5 text-[0.8125rem] text-text-secondary flex-wrap">
        <li>
          <Link href="/" className="hover:text-primary transition duration-150">
            হোম
          </Link>
        </li>
        <li aria-hidden="true" className="text-text-muted">&gt;</li>
        <li>
          <Link href={`/topics/${topicSlug}`} className="hover:text-primary transition duration-150">
            {topicName}
          </Link>
        </li>
        <li aria-hidden="true" className="text-text-muted">&gt;</li>
        <li>
          <span className="text-text-muted truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
            {postTitle}
          </span>
        </li>
      </ol>
    </nav>
  );
}
