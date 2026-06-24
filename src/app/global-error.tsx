'use client'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html>
      <body className="bg-surface text-text-primary font-ui antialiased">
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🚨</div>
            <h1 className="text-3xl font-bold mb-4">
              গুরুতর সমস্যা হয়েছে
            </h1>
            <p className="text-text-secondary mb-8 leading-relaxed">
              একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে পেজ রিফ্রেশ করে আবার চেষ্টা করুন।
            </p>
            <button
              onClick={() => unstable_retry()}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold text-sm"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
