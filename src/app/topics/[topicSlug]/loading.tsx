import React from 'react';
import { Container } from '@/components/ui/Container';

export default function TopicHubLoading() {
  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container className="animate-pulse">
        {/* Header Placeholder */}
        <div className="mb-10 max-w-3xl flex flex-col gap-3">
          <div className="h-6 w-24 bg-border rounded" />
          <div className="h-10 w-64 bg-border rounded" />
          <div className="h-4 w-full bg-border rounded" />
          <div className="h-4 w-3/4 bg-border rounded" />
        </div>

        {/* Filter Buttons Placeholder */}
        <div className="flex items-center gap-2 mb-8 border-b border-border pb-6">
          <div className="h-5 w-16 bg-border rounded mr-2" />
          <div className="h-10 w-24 bg-border rounded" />
          <div className="h-10 w-20 bg-border rounded" />
          <div className="h-10 w-20 bg-border rounded" />
          <div className="h-10 w-24 bg-border rounded" />
        </div>

        {/* Grid Placeholder (6 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-border rounded-[10px] overflow-hidden flex flex-col h-[320px]">
              {/* Image box placeholder */}
              <div className="h-24 bg-border w-full" />
              {/* Body placeholder */}
              <div className="p-5 flex flex-col flex-grow gap-4">
                <div className="flex gap-2">
                  <div className="h-5 w-12 bg-border rounded" />
                  <div className="h-5 w-20 bg-border rounded" />
                </div>
                <div className="h-6 w-full bg-border rounded" />
                <div className="h-4 w-3/4 bg-border rounded" />
                <div className="h-4 w-1/2 bg-border rounded mt-auto" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
