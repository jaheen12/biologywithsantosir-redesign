import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 font-ui animate-pulse">
      {/* Welcome Card Placeholder */}
      <div className="bg-surface-alt border border-border p-6 sm:p-8 rounded-3xl">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-border rounded" />
          <div className="h-8 w-64 bg-border rounded" />
          <div className="h-4 w-40 bg-border rounded" />
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface border border-border p-6 rounded-2xl min-h-[160px] space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-border rounded" />
              <div className="h-10 w-10 bg-border rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-border rounded" />
              <div className="h-4 w-1/2 bg-border rounded" />
              <div className="h-4 w-2/3 bg-border rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Notice Board Placeholder */}
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <div className="h-6 w-32 bg-border rounded" />
        <div className="space-y-4 divide-y divide-border">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="py-4 first:pt-0 last:pb-0 space-y-2">
              <div className="flex justify-between">
                <div className="h-5 w-48 bg-border rounded" />
                <div className="h-4 w-16 bg-border rounded" />
              </div>
              <div className="h-4 w-full bg-border rounded" />
              <div className="h-4 w-3/4 bg-border rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
