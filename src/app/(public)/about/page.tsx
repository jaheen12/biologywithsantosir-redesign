import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { GraduationCap, Award, Mail, BookOpen } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'সান্তো স্যার সম্পর্কে | BiologywithSantosir',
  description: 'সান্তো স্যার (MSc Zoology, University of Dhaka) এর জীববিজ্ঞান শিক্ষা যাত্রা, শিক্ষকতা দর্শন ও ঢাকা বিশ্ববিদ্যালয়ের যোগ্যতা সম্পর্কে বিস্তারিত জানুন।',
  openGraph: {
    title: 'সান্তো স্যার সম্পর্কে | BiologywithSantosir',
    description: 'সান্তো স্যার (MSc Zoology, University of Dhaka) এর জীববিজ্ঞান শিক্ষা যাত্রা ও শিক্ষকতা দর্শন।',
    type: 'profile',
  },
};

export default function AboutPage() {
  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container className="max-w-3xl">
        {/* Widescreen Banner Image */}
        <div className="relative w-full h-[200px] sm:h-[300px] md:h-[350px] rounded-2xl overflow-hidden shadow-md border border-border mb-8">
          <Image
            src="/instructor.png"
            alt="Santo Sir — Biology Teacher"
            fill
            className="object-cover"
            preload
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {/* Introduction */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-border">
            <div>
              <span className="text-[0.75rem] font-bold text-primary uppercase tracking-wider bg-primary-light px-2.5 py-1 rounded-md mb-2.5 inline-block">
                ইনস্ট্রাকটর পরিচিতি
              </span>
              <h1 className="text-[1.75rem] md:text-[2.5rem] font-bold text-text-primary leading-tight">
                সান্তো স্যার (Santo Sir)
              </h1>
              <p className="text-[1rem] text-text-secondary font-medium mt-1">
                জীববিজ্ঞান শিক্ষক ও প্রতিষ্ঠাতা, BiologywithSantosir.com
              </p>
            </div>
          </div>

          {/* Core Grid: Dhaka University & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            {/* DU Credentials */}
            <div className="p-5 border border-border rounded-xl bg-surface-alt flex gap-4">
              <div className="p-3 bg-primary-light text-primary rounded-xl h-fit">
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 className="text-[0.9375rem] font-bold text-text-primary mb-1">শিক্ষাগত যোগ্যতা</h3>
                <p className="text-[0.875rem] text-text-secondary leading-relaxed font-semibold">
                  MSc in Zoology
                </p>
                <p className="text-[0.8125rem] text-text-muted leading-relaxed">
                  ঢাকা বিশ্ববিদ্যালয় (University of Dhaka)
                </p>
              </div>
            </div>

            {/* Teaching Experience */}
            <div className="p-5 border border-border rounded-xl bg-surface-alt flex gap-4">
              <div className="p-3 bg-primary-light text-primary rounded-xl h-fit">
                <Award size={24} />
              </div>
              <div>
                <h3 className="text-[0.9375rem] font-bold text-text-primary mb-1">শিক্ষকতার অভিজ্ঞতা</h3>
                <p className="text-[0.875rem] text-text-secondary leading-relaxed font-semibold">
                  ৫+ বছরের শিক্ষকতা অভিজ্ঞতা
                </p>
                <p className="text-[0.8125rem] text-text-muted leading-relaxed">
                  হাজার হাজার শিক্ষার্থীকে জীববিজ্ঞান শিক্ষাদান
                </p>
              </div>
            </div>
          </div>

          {/* Philosophy / Story */}
          <section className="mt-4 flex flex-col gap-4">
            <h2 className="text-[1.25rem] md:text-[1.375rem] font-bold text-text-primary flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              আমার শিক্ষকতা দর্শন
            </h2>
            <div className="text-[1rem] text-text-primary leading-relaxed space-y-4">
              <p>
                আমি বিশ্বাস করি জীববিজ্ঞান কেবল মুখস্থ করার বিষয় নয়, এটি বোঝার এবং অনুভব করার বিষয়। প্রকৃতির জটিল বৈচিত্র্য ও জীবনের স্পন্দনকে যদি আমরা সঠিক ও সহজ উপায়ে বুঝতে পারি, তবে বিজ্ঞান শিখন আনন্দময় হয়ে ওঠে।
              </p>
              <p>
                ঢাকা বিশ্ববিদ্যালয়ের প্রাণিবিদ্যা বিভাগ থেকে স্নাতকোত্তর সম্পন্ন করার পর, আমার মূল উদ্দেশ্য ছিল কীভাবে শিক্ষার্থীদের সামনে জীববিজ্ঞানের জটিল ধারণাগুলোকে অত্যন্ত সহজভাবে উপস্থাপন করা যায়। এই ওয়েবসাইটটি তৈরির লক্ষ্য হলো দেশের প্রতিটি কোণ থেকে শিক্ষার্থীরা যাতে মানসম্মত জীববিজ্ঞান শিক্ষা ও লেকচার শিট সহজেই পেতে পারে।
              </p>
            </div>
          </section>

          {/* Vision Callout Box */}
          <div className="p-5 bg-primary-light border-l-4 border-primary rounded-r-xl mt-4">
            <p className="text-[1rem] italic leading-relaxed text-primary-dark font-medium">
              "জীববিজ্ঞান মুখস্থ করার বিষয় নয়, এটি বোঝার এবং অনুভব করার বিষয়। আমি চেষ্টা করি প্রতিটি ক্লাসে জীবন রহস্যকে সহজ বাংলায় উন্মোচন করতে।" — সান্তো স্যার
            </p>
          </div>

          {/* Contact Box */}
          <section className="mt-6 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Mail className="text-primary w-5 h-5" />
              <span className="text-[0.875rem] font-semibold text-text-secondary">
                যেকোনো প্রয়োজনে যোগাযোগ করুন: <a href="mailto:santo@biologywithsantosir.com" className="text-primary hover:underline">santo@biologywithsantosir.com</a>
              </span>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
