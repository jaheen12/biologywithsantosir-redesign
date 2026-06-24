import React from 'react';
import { Container } from '@/components/ui/Container';

export default function AboutLoading() {
  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container className="animate-pulse max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 flex flex-col items-center gap-3">
          <div className="h-10 w-64 bg-border rounded" />
          <div className="h-5 w-full max-w-lg bg-border rounded" />
        </div>

        {/* Content Blocks */}
        <div className="space-y-8">
          <div className="flex flex-col gap-3">
            <div className="h-7 w-48 bg-border rounded" />
            <div className="h-5 w-full bg-border rounded" />
            <div className="h-5 w-full bg-border rounded" />
            <div className="h-5 w-3/4 bg-border rounded" />
          </div>

          <div className="flex flex-col gap-3">
            <div className="h-7 w-40 bg-border rounded" />
            <div className="h-5 w-full bg-border rounded" />
            <div className="h-5 w-5/6 bg-border rounded" />
            <div className="h-5 w-full bg-border rounded" />
          </div>

          <div className="flex flex-col gap-3">
            <div className="h-7 w-36 bg-border rounded" />
            <div className="h-5 w-full bg-border rounded" />
            <div className="h-5 w-4/5 bg-border rounded" />
          </div>

          {/* Image Placeholder */}
          <div className="h-64 w-full bg-border rounded-xl" />

          <div className="flex flex-col gap-3">
            <div className="h-7 w-44 bg-border rounded" />
            <div className="h-5 w-full bg-border rounded" />
            <div className="h-5 w-full bg-border rounded" />
            <div className="h-5 w-2/3 bg-border rounded" />
          </div>
        </div>
      </Container>
    </main>
  )
}
