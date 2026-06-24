import React from 'react';
import { Container } from '@/components/ui/Container';

export default function NotesPageLoading() {
  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container className="animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-10 text-center md:text-left max-w-3xl flex flex-col gap-3">
          <div className="h-6 w-24 bg-border rounded" />
          <div className="h-10 w-64 bg-border rounded" />
          <div className="h-4 w-full bg-border rounded" />
        </div>

        {/* Filter Tabs Skeleton */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-5 mb-8">
          <div className="h-10 w-28 bg-border rounded-lg" />
          <div className="h-10 w-20 bg-border rounded-lg" />
          <div className="h-10 w-20 bg-border rounded-lg" />
          <div className="h-10 w-24 bg-border rounded-lg" />
        </div>

        {/* Note Cards Grid Skeleton (6 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-border rounded-xl p-5 flex flex-col h-[220px]">
              <div className="flex justify-between items-start mb-4">
                {/* Icon box placeholder */}
                <div className="h-12 w-12 bg-border rounded-xl" />
                {/* Badge placeholder */}
                <div className="h-5 w-12 bg-border rounded" />
              </div>
              {/* Title lines */}
              <div className="h-5 w-3/4 bg-border rounded mb-2" />
              <div className="h-4 w-full bg-border rounded mb-6" />
              {/* Button placeholder */}
              <div className="h-11 w-full bg-border rounded mt-auto" />
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
