import React from 'react';
import { Container } from '@/components/ui/Container';

export default function MCQPageLoading() {
  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container className="max-w-3xl animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="h-6 w-24 bg-border rounded" />
          <div className="h-10 w-64 bg-border rounded" />
          <div className="h-4 w-full max-w-sm bg-border rounded" />
        </div>

        {/* Filter Panel Skeleton */}
        <div className="bg-surface border border-border p-5 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 bg-border rounded" />
            <div className="h-12 w-full bg-border rounded" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-4 w-40 bg-border rounded" />
            <div className="h-12 w-full bg-border rounded" />
          </div>
        </div>

        {/* Card Block Skeleton */}
        <div className="bg-surface border border-border p-6 rounded-xl flex flex-col gap-6">
          <div className="flex gap-2">
            <div className="h-5 w-24 bg-border rounded" />
            <div className="h-5.5 w-12 bg-border rounded" />
          </div>
          
          {/* Question lines */}
          <div className="flex flex-col gap-2.5">
            <div className="h-6 w-full bg-border rounded" />
            <div className="h-6 w-4/5 bg-border rounded" />
          </div>

          {/* Option buttons */}
          <div className="flex flex-col gap-3.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 w-full bg-border rounded-xl" />
            ))}
          </div>

          {/* Action button */}
          <div className="flex justify-end mt-2">
            <div className="h-11 w-32 bg-border rounded" />
          </div>
        </div>
      </Container>
    </main>
  );
}
