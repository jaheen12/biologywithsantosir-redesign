'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
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
    <main className="w-full min-h-[80vh] flex items-center justify-center px-4 bg-surface font-ui">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">😕</div>
        <h1 className="text-3xl font-bold text-text-primary mb-4">
          কিছু একটা সমস্যা হয়েছে
        </h1>
        <p className="text-text-secondary mb-8 leading-relaxed">
          Something went wrong. Please try again or go back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => unstable_retry()}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold text-sm"
          >
            আবার চেষ্টা করুন
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-border text-text-primary rounded-xl hover:bg-surface-alt transition-colors font-semibold text-sm"
          >
            হোম পেজে যান
          </Link>
        </div>
      </div>
    </main>
  )
}
