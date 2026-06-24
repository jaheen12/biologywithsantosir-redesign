import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/Container';

export default async function Footer() {
  const supabase = await createClient();
  const { data: topics } = await supabase
    .from('topics')
    .select('name_bn, slug')
    .order('sort_order', { ascending: true })
    .limit(6);

  return (
    <footer className="w-full bg-surface-alt border-t border-border mt-auto font-ui text-[0.9375rem] text-text-secondary">
      <Container className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        {/* Column 1: Logo & Tagline */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-lg font-ui">
            <svg
              className="w-6 h-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7,18.5C15.5,18.5 19,13 22,8C19,10 16,8 17,8M12,2C11.5,4 8.5,8 3,8C3.5,6 6.5,2 12,2Z" />
            </svg>
            <span>Santo Sir Biology</span>
          </Link>
          <p className="text-text-secondary leading-relaxed">
            জীববিজ্ঞান শেখো সহজভাবে, বুঝে বুঝে।
          </p>
          <p className="text-[0.8125rem] text-text-muted">
            HSC • SSC • Honours স্তরের শিক্ষার্থীদের জন্য একটি পূর্ণাঙ্গ জীববিজ্ঞান শিক্ষা প্ল্যাটফর্ম।
          </p>
        </div>

        {/* Column 2: Classes */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[0.75rem] font-bold text-text-primary uppercase tracking-wider mb-1">
            Classes
          </h3>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/classes/ssc-biology" className="hover:text-primary transition duration-150">
                SSC Biology
              </Link>
            </li>
            <li>
              <Link href="/classes/hsc-zoology" className="hover:text-primary transition duration-150">
                HSC Zoology
              </Link>
            </li>
            <li>
              <Link href="/classes/hsc-botany" className="hover:text-primary transition duration-150">
                HSC Botany
              </Link>
            </li>
            <li>
              <Link href="/classes/honours-3rd-year" className="hover:text-primary transition duration-150">
                Honours 3rd Year
              </Link>
            </li>
            <li>
              <Link href="/classes/honours-4th-year" className="hover:text-primary transition duration-150">
                Honours 4th Year
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Popular Topics */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[0.75rem] font-bold text-text-primary uppercase tracking-wider mb-1">
            Popular Topics
          </h3>
          <ul className="flex flex-col gap-2">
            {topics && topics.length > 0 ? (
              topics.map((topic) => (
                <li key={topic.slug}>
                  <Link href={`/topics/${topic.slug}`} className="hover:text-primary transition duration-150">
                    {topic.name_bn}
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-[0.875rem] text-text-muted">No topics seeded yet</li>
            )}
          </ul>
        </div>

        {/* Column 4: Links & Follow Us */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[0.75rem] font-bold text-text-primary uppercase tracking-wider mb-1">
            Quick Links
          </h3>
          <ul className="flex flex-col gap-2 mb-3">
            <li>
              <Link href="/about" className="hover:text-primary transition duration-150">
                • About (সান্তো স্যার সম্পর্কে)
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary transition duration-150">
                • Contact (যোগাযোগ)
              </Link>
            </li>
            <li>
              <Link href="/courses" className="hover:text-primary transition duration-150">
                • Courses (কোর্সসমূহ)
              </Link>
            </li>
            <li>
              <Link href="/mcq" className="hover:text-primary transition duration-150">
                • MCQ Practice
              </Link>
            </li>
            <li>
              <Link href="/notes" className="hover:text-primary transition duration-150">
                • Download Notes
              </Link>
            </li>
          </ul>
          
          <h3 className="text-[0.75rem] font-bold text-text-primary uppercase tracking-wider mt-2 mb-1">
            Follow Us
          </h3>
          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com/biologywithsantosir"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-text-secondary hover:text-primary transition duration-150 rounded-lg hover:bg-surface border border-border flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="Facebook page"
            >
              <svg
                className="w-5 h-5 animate-fade-in"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-text-secondary hover:text-primary transition duration-150 rounded-lg hover:bg-surface border border-border flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="YouTube channel"
            >
              <svg
                className="w-5 h-5 animate-fade-in"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-text-secondary hover:text-primary transition duration-150 rounded-lg hover:bg-surface border border-border flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="Instagram profile"
            >
              <svg
                className="w-5 h-5 animate-fade-in"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
      </Container>

      {/* Bottom Copyright Bar */}
      <div className="w-full border-t border-border py-6 bg-surface-alt">
        <Container className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[0.8125rem] text-text-muted">
          <span>
            &copy; 2026 BiologywithSantosir.com &middot; All rights reserved.
          </span>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-primary">About</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
