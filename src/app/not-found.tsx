import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="w-full min-h-[80vh] flex items-center justify-center px-4 bg-surface font-ui">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">৪০৪</h1>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">পেজটি পাওয়া যায়নি</h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          আপনি যে পেজটি খুঁজছেন, সেটি বিদ্যমান নেই অথবা সরানো হয়েছে।
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold text-sm"
        >
          হোম পেজে ফিরে যান
        </Link>
      </div>
    </main>
  )
}
