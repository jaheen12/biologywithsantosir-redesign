'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function PostError({
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
    <main className="w-full py-16 bg-surface font-ui">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">📝</div>
          <h1 className="text-2xl font-bold text-text-primary mb-3">
            পোস্ট লোড করতে সমস্যা
          </h1>
          <p className="text-text-secondary mb-6 leading-relaxed">
            এই আর্টিকেলটি লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => unstable_retry()}
              className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold text-sm"
            >
              আবার চেষ্টা করুন
            </button>
            <Link
              href="/topics"
              className="px-5 py-2.5 border border-border text-text-primary rounded-xl hover:bg-surface-alt transition-colors font-semibold text-sm"
            >
              সব টপিক
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 border border-border text-text-primary rounded-xl hover:bg-surface-alt transition-colors font-semibold text-sm"
            >
              হোম পেজ
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
