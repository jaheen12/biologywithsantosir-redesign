import React from 'react';
import { Container } from '@/components/ui/Container';

export default function ArticlePageLoading() {
  return (
    <main className="w-full py-8 bg-surface">
      <Container className="animate-pulse">
        {/* Breadcrumbs Placeholder */}
        <div className="flex gap-2 mb-6">
          <div className="h-4 w-12 bg-border rounded" />
          <div className="h-4 w-4 bg-border rounded" />
          <div className="h-4 w-16 bg-border rounded" />
          <div className="h-4 w-4 bg-border rounded" />
          <div className="h-4 w-24 bg-border rounded" />
        </div>

        {/* Article Header Placeholder */}
        <header className="mb-8 pb-6 border-b border-border flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="h-5 w-12 bg-border rounded" />
            <div className="h-5 w-20 bg-border rounded" />
          </div>
          <div className="h-10 md:h-12 w-3/4 bg-border rounded" />
          <div className="flex gap-6 mt-2">
            <div className="h-5 w-24 bg-border rounded" />
            <div className="h-5 w-32 bg-border rounded" />
            <div className="h-5 w-20 bg-border rounded" />
          </div>
        </header>

        {/* Content Layout Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* TOC Sidebar Placeholder (desktop) */}
          <aside className="lg:col-span-3 lg:order-2 hidden lg:flex flex-col gap-4 sticky top-24">
            <div className="h-6 w-24 bg-border rounded mb-2" />
            <div className="h-4 w-full bg-border rounded" />
            <div className="h-4 w-5/6 bg-border rounded" />
            <div className="h-4 w-4/5 bg-border rounded" />
            <div className="h-4 w-full bg-border rounded" />
            <div className="h-4 w-3/4 bg-border rounded" />
          </aside>

          {/* Article Body Placeholder */}
          <article className="lg:col-span-9 lg:order-1 flex flex-col gap-6">
            <div className="h-6 w-full bg-border rounded" />
            <div className="h-6 w-full bg-border rounded" />
            <div className="h-6 w-5/6 bg-border rounded" />
            
            <div className="h-8 w-1/3 bg-border rounded mt-6 mb-2" />
            <div className="h-6 w-full bg-border rounded" />
            <div className="h-6 w-4/5 bg-border rounded" />
            
            {/* Callout box placeholder */}
            <div className="h-28 bg-[#FFF8E8]/40 border-l-4 border-accent rounded-r-lg p-5 flex flex-col gap-3 my-4">
              <div className="h-5 w-16 bg-border rounded" />
              <div className="h-4 w-full bg-border rounded" />
            </div>

            <div className="h-6 w-full bg-border rounded" />
            <div className="h-6 w-3/4 bg-border rounded" />
          </article>
        </div>

        {/* Related Posts Section Placeholder */}
        <section className="mt-16 border-t border-border pt-12">
          <div className="h-8 w-48 bg-border rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border rounded-[10px] overflow-hidden flex flex-col h-[320px]">
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
        </section>
      </Container>
    </main>
  );
}
