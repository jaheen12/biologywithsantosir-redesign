'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 font-ui">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📋</div>
        <h1 className="text-2xl font-bold text-text-primary mb-3">
          ড্যাশবোর্ডে সমস্যা
        </h1>
        <p className="text-text-secondary mb-6 leading-relaxed">
          আপনার ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => unstable_retry()}
            className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold text-sm"
          >
            আবার চেষ্টা করুন
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 border border-border text-text-primary rounded-xl hover:bg-surface-alt transition-colors font-semibold text-sm"
          >
            ড্যাশবোর্ড হোম
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 border border-border text-text-primary rounded-xl hover:bg-surface-alt transition-colors font-semibold text-sm"
          >
            মূল পেজ
          </Link>
        </div>
      </div>
    </div>
  )
}
