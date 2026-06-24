import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';

export default function InstructorSection() {
  return (
    <section className="w-full py-16 bg-surface border-b border-border font-ui">
      <Container>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 max-w-3xl mx-auto">
          {/* Circular Instructor Avatar */}
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border shadow-md">
              <Image
                src="/instructor.png"
                alt="Santo Sir — Biology Teacher"
                fill
                className="object-cover"
                preload
                sizes="96px"
              />
            </div>
          </div>

          {/* Instructor Info */}
          <div className="flex-grow text-center md:text-left flex flex-col items-center md:items-start">
            <span className="text-[0.75rem] font-bold text-primary uppercase tracking-wider bg-primary-light px-2.5 py-1 rounded-md mb-2">
              ইনস্ট্রাকটর
            </span>
            <h2 className="text-[1.5rem] font-bold text-text-primary mb-1">
              Santo Sir
            </h2>
            <p className="text-[0.875rem] text-text-secondary font-medium mb-3">
              MSc Zoology, University of Dhaka
            </p>
            <p className="text-[0.9375rem] text-text-secondary leading-relaxed mb-4 max-w-xl">
              "আমি একজন শিক্ষক। পড়ানো পেশা থেকে নেশায় পরিণত হয়েছে কখন তা বুঝতেই পারিনি। মানুষকে শেখাতে ভালোলাগে। ক্লাশরুমের বাইরেও শেখানোর ইচ্ছা থেকেই এই ব্লগটি তৈরি করেছি।"
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1 text-primary font-semibold hover:text-primary-dark transition duration-150 text-[0.9375rem]"
            >
              আরও জানুন &rarr;
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
