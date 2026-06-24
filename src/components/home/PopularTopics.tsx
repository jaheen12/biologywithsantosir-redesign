import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';

interface Topic {
  id: string;
  slug: string;
  name_en: string;
  name_bn: string;
}

export interface PopularTopicsProps {
  topics: Topic[];
}

export default function PopularTopics({ topics }: PopularTopicsProps) {
  return (
    <section className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container className="text-center">
        <h2 className="text-[1.5rem] font-bold text-text-primary mb-3">
          জনপ্রিয় বিষয়
        </h2>
        <p className="text-[0.9375rem] text-text-secondary mb-8 max-w-md mx-auto">
          পছন্দের টপিকটি নির্বাচন করে বিস্তারিত পড়া শুরু করো।
        </p>

        {topics && topics.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-3.5 max-w-3xl mx-auto">
            {topics.map((topic) => (
              <Link key={topic.id} href={`/topics/${topic.slug}`}>
                <Badge
                  variant="topic"
                  className="px-4 py-2 hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer text-[0.875rem] lowercase first-letter:uppercase"
                >
                  {topic.name_bn}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-text-muted text-[0.875rem]">কোনো বিষয় পাওয়া যায়নি।</div>
        )}
      </Container>
    </section>
  );
}
