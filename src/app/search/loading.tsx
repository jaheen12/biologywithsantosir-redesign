import React from 'react';
import { Container } from '@/components/ui/Container';

export default function SearchLoading() {
  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container className="animate-pulse">
        {/* Search Input Placeholder */}
        <div className="mb-8">
          <div className="h-14 w-full bg-border rounded-xl" />
        </div>

        {/* Filter Chips Placeholder */}
        <div className="flex flex-wrap gap-2 mb-8">
          <div className="h-8 w-20 bg-border rounded" />
          <div className="h-8 w-24 bg-border rounded" />
          <div className="h-8 w-16 bg-border rounded" />
          <div className="h-8 w-28 bg-border rounded" />
        </div>

        {/* Results Count Placeholder */}
        <div className="h-5 w-32 bg-border rounded mb-6" />

        {/* Results List Placeholder */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border border-border rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-border rounded" />
                <div className="h-5 w-24 bg-border rounded" />
              </div>
              <div className="h-6 w-3/4 bg-border rounded" />
              <div className="h-4 w-full bg-border rounded" />
              <div className="h-4 w-5/6 bg-border rounded" />
              <div className="flex items-center gap-4 mt-2">
                <div className="h-4 w-20 bg-border rounded" />
                <div className="h-4 w-24 bg-border rounded" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  )
}
