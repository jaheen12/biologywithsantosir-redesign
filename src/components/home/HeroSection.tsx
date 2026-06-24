import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-surface-alt py-16 lg:py-24 border-b border-border font-ui">
      {/* Background SVG Leaf-Cell Pattern (4% opacity) */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cell-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M30 0 C45 10, 55 25, 30 50 C5 25, 15 10, 30 0 Z"
                fill="none"
                stroke="#1A7A5E"
                strokeWidth="1.5"
              />
              <path
                d="M30 15 C37 20, 42 27, 30 40 C18 27, 23 20, 30 15 Z"
                fill="none"
                stroke="#2EA87A"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cell-pattern)" />
        </svg>
      </div>

      <Container className="relative z-10 flex flex-col items-center text-center">
        {/* Eyebrow / Tag */}
        <span className="text-[0.75rem] font-bold text-primary uppercase tracking-widest bg-primary-light px-3.5 py-1.5 rounded-full mb-6">
          বাংলায় জীববিজ্ঞান শিক্ষা
        </span>

        {/* Heading */}
        <h1 className="text-text-primary font-bold leading-tight tracking-tight mb-6 max-w-3xl text-[2.25rem] md:text-[3.25rem] lg:text-[3.75rem] font-hero">
          <span className="relative inline-block">
            জীববিজ্ঞান
            {/* SVG Wavy Underline */}
            <svg
              className="absolute left-0 bottom-[-8px] w-full h-[12px] text-primary"
              viewBox="0 0 160 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M3 8.5C25.5 3.5 48 -1.5 70.5 3.5C93 8.5 115.5 8.5 138 3.5C146.5 1.6 153.5 3.8 157 5.5"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </span>{' '}
          শেখো সহজভাবে, বুঝে বুঝে
        </h1>

        {/* Subtitle */}
        <p className="text-[1.125rem] text-text-secondary leading-relaxed max-w-2xl mb-8">
          SSC &middot; HSC &middot; Honours স্তরের শিক্ষার্থীদের জন্য Santo Sir-এর তৈরি বিশেষ ও গোছানো পাঠ। কোনো মুখস্থ নয়, কেবল বুঝে পড়ার আনন্দ।
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-10">
          <Link href="/topics">
            <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[180px]">
              শেখা শুরু করো
            </Button>
          </Link>
          <Link href="/notes">
            <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[180px]">
              নোটস ডাউনলোড করো
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="text-[0.875rem] text-text-muted flex items-center justify-center gap-2 flex-wrap">
          <span className="font-semibold text-text-secondary">৫০,০০০+</span> শিক্ষার্থী
          <span>&middot;</span>
          <span className="font-semibold text-text-secondary">২০০+</span> বিস্তারিত টপিক
          <span>&middot;</span>
          <span className="text-primary font-semibold">সম্পূর্ণ বিনামূল্যে</span>
        </div>
      </Container>
    </section>
  );
}
