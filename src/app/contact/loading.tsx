import React from 'react';
import { Container } from '@/components/ui/Container';

export default function ContactLoading() {
  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container className="animate-pulse max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 flex flex-col items-center gap-3">
          <div className="h-10 w-56 bg-border rounded" />
          <div className="h-5 w-full max-w-lg bg-border rounded" />
          <div className="h-5 w-3/4 max-w-md bg-border rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form Placeholder */}
          <div className="border border-border rounded-2xl p-6 space-y-5">
            <div className="h-6 w-32 bg-border rounded" />
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="h-4 w-16 bg-border rounded" />
                <div className="h-12 w-full bg-border rounded-lg" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-20 bg-border rounded" />
                <div className="h-12 w-full bg-border rounded-lg" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-24 bg-border rounded" />
                <div className="h-12 w-full bg-border rounded-lg" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-16 bg-border rounded" />
                <div className="h-32 w-full bg-border rounded-lg" />
              </div>
              <div className="h-12 w-32 bg-border rounded-lg" />
            </div>
          </div>

          {/* Contact Info Placeholder */}
          <div className="space-y-6">
            <div className="border border-border rounded-2xl p-6 space-y-4">
              <div className="h-6 w-40 bg-border rounded" />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-border rounded-lg" />
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-border rounded" />
                    <div className="h-4 w-40 bg-border rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-border rounded-lg" />
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-border rounded" />
                    <div className="h-4 w-36 bg-border rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-border rounded-lg" />
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-border rounded" />
                    <div className="h-4 w-48 bg-border rounded" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-2xl p-6 space-y-4">
              <div className="h-6 w-36 bg-border rounded" />
              <div className="flex gap-3">
                <div className="h-10 w-10 bg-border rounded-full" />
                <div className="h-10 w-10 bg-border rounded-full" />
                <div className="h-10 w-10 bg-border rounded-full" />
                <div className="h-10 w-10 bg-border rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}
