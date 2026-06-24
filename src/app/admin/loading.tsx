import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 font-ui animate-pulse">
      {/* Header */}
      <div>
        <div className="h-8 w-56 bg-border rounded" />
        <div className="h-4 w-96 bg-border rounded mt-2" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-border rounded" />
              <div className="h-8 w-24 bg-border rounded" />
              <div className="h-3 w-16 bg-border rounded" />
            </div>
            <div className="h-12 w-12 bg-border rounded-xl" />
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overdue Table Placeholder */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-surface">
              <div className="h-5 w-48 bg-border rounded" />
            </div>
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-4 w-36 bg-border rounded" />
                    <div className="h-3 w-20 bg-border rounded" />
                  </div>
                  <div className="h-3 w-16 bg-border rounded" />
                  <div className="h-8 w-24 bg-border rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          {/* Unreconciled Payments Placeholder */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-surface">
              <div className="h-5 w-48 bg-border rounded" />
            </div>
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1.5">
                    <div className="h-4 w-40 bg-border rounded" />
                    <div className="h-3 w-32 bg-border rounded" />
                  </div>
                  <div className="h-8 w-24 bg-border rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-5">
            <div className="h-5 w-40 bg-border rounded" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-border rounded" />
                  <div className="h-4 w-20 bg-border rounded" />
                </div>
                <div className="h-2.5 w-full bg-border rounded-full" />
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-border rounded" />
                  <div className="h-3 w-12 bg-border rounded" />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-5">
            <div className="h-5 w-32 bg-border rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-l-2 border-border pl-3 space-y-1.5">
                <div className="h-4 w-full bg-border rounded" />
                <div className="h-3 w-32 bg-border rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
