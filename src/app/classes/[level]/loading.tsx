import React from 'react';
import { Container } from '@/components/ui/Container';

export default function ClassLevelLoading() {
  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container className="animate-pulse">
        {/* Breadcrumbs */}
        <div className="flex gap-2 mb-6">
          <div className="h-4 w-12 bg-border rounded" />
          <div className="h-4 w-4 bg-border rounded" />
          <div className="h-4 w-20 bg-border rounded" />
        </div>

        {/* Header */}
        <div className="mb-10 max-w-3xl flex flex-col gap-3">
          <div className="h-6 w-24 bg-border rounded" />
          <div className="h-10 w-64 bg-border rounded" />
          <div className="h-4 w-full bg-border rounded" />
          <div className="h-4 w-3/4 bg-border rounded" />
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-border rounded-[10px] overflow-hidden flex flex-col h-[280px]">
              <div className="h-20 bg-border w-full" />
              <div className="p-5 flex flex-col flex-grow gap-3">
                <div className="h-6 w-3/4 bg-border rounded" />
                <div className="h-4 w-full bg-border rounded" />
                <div className="h-4 w-2/3 bg-border rounded" />
                <div className="flex gap-2 mt-auto">
                  <div className="h-4 w-16 bg-border rounded" />
                  <div className="h-4 w-20 bg-border rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  )
}
