import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Check, Calendar, ArrowRight, MessageSquare, ChevronRight, GraduationCap } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'প্রিমিয়াম জীববিজ্ঞান কোর্সসমূহ | BiologywithSantosir',
  description: 'সান্তো স্যারের প্রিমিয়াম অনলাইন জীববিজ্ঞান ব্যাচসমূহে ভর্তি হয়ে সম্পূর্ণ সিলেবাস, পরীক্ষা ও স্পেশাল গাইডলাইন অর্জন করুন।',
  openGraph: {
    title: 'প্রিমিয়াম জীববিজ্ঞান কোর্সসমূহ | BiologywithSantosir',
    description: 'অনলাইন জীববিজ্ঞান ব্যাচসমূহে ভর্তি হয়ে সম্পূর্ণ সিলেবাস ও গাইডলাইন অর্জন করুন।',
  },
};

export default function CoursesPage() {
  const courses = [
    {
      id: 'hsc-zoology-course',
      title: 'এইচএসসি প্রাণিবিজ্ঞান (HSC Zoology) অ্যাডমিশন ও একাডেমিক কোর্স',
      level: 'hsc',
      price: '৳১,৫০০',
      type: '১কালীন ফি',
      badge: 'জনপ্রিয়',
      description: 'উচ্চ মাধ্যমিক (HSC) জীববিজ্ঞান ২য় পত্রের সম্পূর্ণ সিলেবাস শেষ করার পাশাপাশি মেডিকেল ও ভার্সিটি অ্যাডমিশন প্রস্তুতির স্পেশাল ব্যাচ।',
      features: [
        '৬০+ ইন্টারেক্টিভ লাইভ ক্লাস ও রেকর্ডেড ক্লাস অ্যাক্সেস',
        '২০+ অধ্যায়ভিত্তিক রঙিন ডিজিটাল লেকচার শিট (PDF)',
        'সাপ্তাহিক ও মাসিক CQ এবং MCQ ওএমআর পরীক্ষা',
        'বোর্ড প্রশ্ন সলভিং ও মেডিকেল ওয়ান-টু-ওয়ান ডাউট ক্লিয়ারিং',
      ],
    },
    {
      id: 'ssc-biology-course',
      title: 'এসএসসি জীববিজ্ঞান (SSC Biology) সম্পূর্ণ প্রস্তুতি কোর্স',
      level: 'ssc',
      price: '৳১,০০০',
      type: '১কালীন ফি',
      description: 'এসএসসি ও নবম-দশম শ্রেণীর শিক্ষার্থীদের জীববিজ্ঞানের জটিল বেসিক পরিষ্কার করে বোর্ডে জিপিএ-৫ নিশ্চিত করার সম্পূর্ণ প্যাকেজ।',
      features: [
        '৪০+ এইচডি ভিডিও লেকচার ও বিশেষ সাজেশন্স ক্লাস',
        'এসএসসি শর্ট সিলেবাস কমপ্লিট অধ্যায়ভিত্তিক শিট',
        '১০+ চূড়ান্ত মক টেস্ট ও অধ্যায়ভিত্তিক সৃজনশীল প্রশ্ন সলভ',
        '২৪/৭ ফেসবুক মেসেঞ্জার স্টাডি সাপোর্ট ও মনিটরিং গ্রুপ',
      ],
    },
    {
      id: 'honours-zoology-course',
      title: 'প্রাণিবিদ্যা (Honours Zoology) একাডেমিক মেন্টরশিপ কোর্স',
      level: 'honours',
      price: '৳২,০০০',
      type: '১কালীন ফি',
      description: 'জাতীয় বিশ্ববিদ্যালয় ও ঢাকা বিশ্ববিদ্যালয়ের অধিভুক্ত কলেজের প্রাণিবিদ্যা বিভাগের অনার্স শিক্ষার্থীদের জন্য তৈরি করা বিশেষ মডিউল।',
      features: [
        'মেজর ও নন-মেজর বিষয়ের অধ্যায়ভিত্তিক লেকচার গাইড',
        'সকল চ্যাপ্টারের হ্যান্ডনোট ও মেথডলজি স্পেশাল পিডিএফ',
        'আউটলাইন ম্যাপ ও ডায়াগ্রাম আঁকার বিশেষ ট্রিক্স',
        'প্র্যাকটিকাল এক্সাম সাপোর্ট ও ভাইভা গাইডলাইন',
      ],
    },
  ];

  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.8125rem] text-text-secondary mb-6 font-semibold">
          <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight size={14} className="text-text-muted" />
          <span className="text-text-primary">কোর্সসমূহ</span>
        </nav>

        {/* Page Header */}
        <div className="mb-12 max-w-2xl">
          <span className="text-[0.75rem] font-bold text-primary uppercase tracking-wider bg-primary-light px-2.5 py-1 rounded-md mb-3 inline-block">
            প্রিমিয়াম একাডেমিক প্রোগ্রাম
          </span>
          <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-text-primary leading-tight mb-4">
            সান্তো স্যারের অনলাইন জীববিজ্ঞান ব্যাচসমূহ
          </h1>
          <p className="text-[1rem] leading-relaxed text-text-secondary">
            প্রতিটি কোর্স বিশেষভাবে সাজানো হয়েছে যাতে শিক্ষার্থীরা জীববিজ্ঞান বুঝে বুঝে ও ভিজ্যুয়ালের সাহায্যে মনে রাখতে পারে। বিস্তারিত দেখে আপনার পছন্দের কোর্সে আজই যুক্ত হোন।
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-12">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`border rounded-2xl p-6 md:p-8 flex flex-col justify-between transition duration-200 bg-surface shadow-sm ${
                course.badge
                  ? 'border-2 border-primary ring-4 ring-primary-light/50 relative'
                  : 'border-border hover:border-primary-mid hover:shadow-md'
              }`}
            >
              {course.badge && (
                <span className="absolute -top-3.5 left-6 bg-accent text-[0.75rem] font-bold text-white px-3 py-1 rounded-full shadow-sm">
                  {course.badge}
                </span>
              )}
              
              <div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <Badge variant={course.level as 'ssc' | 'hsc' | 'honours'}>{course.level.toUpperCase()}</Badge>
                  <div className="text-right">
                    <span className="text-[1.5rem] font-bold text-primary block leading-none">
                      {course.price}
                    </span>
                    <span className="text-[0.6875rem] text-text-muted font-bold block mt-1">
                      {course.type}
                    </span>
                  </div>
                </div>

                <h2 className="text-[1.1875rem] font-bold text-text-primary leading-snug mb-3 min-h-[3rem]">
                  {course.title}
                </h2>

                <p className="text-[0.875rem] text-text-secondary leading-relaxed mb-6">
                  {course.description}
                </p>

                <div className="border-t border-border pt-5 mb-6">
                  <h3 className="text-[0.8125rem] font-bold text-text-primary uppercase tracking-wider mb-3">
                    কোর্সের প্রধান বৈশিষ্ট্যসমূহ:
                  </h3>
                  <ul className="flex flex-col gap-2.5">
                    {course.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-text-primary">
                        <Check size={16} className="text-primary flex-shrink-0 mt-1" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href="/contact"
                className={`inline-flex items-center justify-center gap-2 text-center text-[0.9375rem] font-bold py-3 rounded-lg w-full transition duration-150 ${
                  course.badge
                    ? 'bg-primary hover:bg-primary-dark text-white shadow-sm'
                    : 'bg-primary-light hover:bg-primary text-primary hover:text-white'
                }`}
              >
                <MessageSquare size={16} />
                ভর্তি হতে যোগাযোগ করুন
              </Link>
            </div>
          ))}
        </div>

        {/* Note/Guidance banner */}
        <div className="bg-surface-alt border border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-primary-light text-primary rounded-xl hidden sm:block">
              <GraduationCap size={32} />
            </div>
            <div>
              <h3 className="text-[1.125rem] font-bold text-text-primary mb-1">কোন কোর্সটি আপনার জন্য মানানসই?</h3>
              <p className="text-[0.875rem] text-text-secondary leading-relaxed max-w-xl">
                ভর্তির বিষয়ে কোনো দ্বিধাদ্বন্দ্ব বা প্রশ্ন থাকলে সরাসরি সান্তো স্যারের সাথে পরামর্শ করতে পারেন। আমরা প্রতিটি শিক্ষার্থীকে সঠিক দিকনির্দেশনা প্রদান করি।
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-[0.875rem] font-bold text-white bg-primary hover:bg-primary-dark transition duration-150 px-6 py-3 rounded-lg flex-shrink-0 shadow-sm"
          >
            যোগাযোগ করুন
            <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </main>
  );
}
