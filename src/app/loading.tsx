import React from 'react';
import { Container } from '@/components/ui/Container';

export default function RootLoading() {
  return (
    <main className="w-full bg-surface font-ui">
      {/* Hero Section Placeholder */}
      <section className="bg-surface-alt py-16 md:py-24">
        <Container className="animate-pulse">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-5">
            <div className="h-6 w-32 bg-border rounded" />
            <div className="h-12 md:h-14 w-3/4 bg-border rounded" />
            <div className="h-5 w-full max-w-lg bg-border rounded" />
            <div className="h-5 w-2/3 bg-border rounded" />
            <div className="h-12 w-40 bg-border rounded-xl mt-4" />
          </div>
        </Container>
      </section>

      {/* QuickNav Cards Placeholder */}
      <section className="py-12">
        <Container className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-border rounded-2xl p-6 flex flex-col items-center gap-3">
                <div className="h-12 w-12 bg-border rounded-xl" />
                <div className="h-5 w-24 bg-border rounded" />
                <div className="h-4 w-32 bg-border rounded" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Latest Posts Grid Placeholder */}
      <section className="py-12 bg-surface-alt">
        <Container className="animate-pulse">
          <div className="h-8 w-48 bg-border rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-border rounded-[10px] overflow-hidden flex flex-col h-[320px] bg-surface">
                <div className="h-24 bg-border w-full" />
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
      </section>
    </main>
  )
}
