import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, FileDown, GraduationCap, School, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Container } from '@/components/ui/Container';
import PostCard from '@/components/ui/PostCard';
import { Badge } from '@/components/ui/Badge';

interface PageProps {
  params: Promise<{ level: string }>;
}

export function generateStaticParams() {
  return [
    { level: 'ssc-biology' },
    { level: 'hsc-zoology' },
    { level: 'hsc-botany' },
    { level: 'honours-3rd-year' },
    { level: 'honours-4th-year' },
  ];
}

function getLevelInfo(levelSlug: string) {
  switch (levelSlug) {
    case 'ssc-biology':
      return {
        titleBn: 'এসএসসি জীববিজ্ঞান',
        titleEn: 'SSC Biology',
        dbLevel: 'ssc',
        description: 'নবম-দশম ও এসএসসি পরীক্ষার্থীদের জন্য জীববিজ্ঞানের সম্পূর্ণ লেকচার শিট, সাজেশন্স এবং গুরুত্বপূর্ণ পোস্টসমূহ।',
        icon: <School className="w-8 h-8 text-primary" />,
      };
    case 'hsc-zoology':
      return {
        titleBn: 'এইচএসসি প্রাণিবিজ্ঞান',
        titleEn: 'HSC Zoology',
        dbLevel: 'hsc',
        description: 'উচ্চ মাধ্যমিক (HSC) পরীক্ষার্থীদের জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান) বিষয়ের লেকচার, লাইভ ক্লাস নোট এবং গুরুত্বপূর্ণ অধ্যায়সমূহ।',
        icon: <GraduationCap className="w-8 h-8 text-primary" />,
      };
    case 'hsc-botany':
      return {
        titleBn: 'এইচএসসি উদ্ভিদবিজ্ঞান',
        titleEn: 'HSC Botany',
        dbLevel: 'hsc',
        description: 'উচ্চ মাধ্যমিক (HSC) পরীক্ষার্থীদের জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান) বিষয়ের অধ্যায়ভিত্তিক নোট, ব্যাখ্যা ও লেকচার গাইড।',
        icon: <GraduationCap className="w-8 h-8 text-primary" />,
      };
    case 'honours-3rd-year':
      return {
        titleBn: 'অনার্স ৩য় বর্ষ (প্রাণিবিদ্যা)',
        titleEn: 'Honours 3rd Year (Zoology)',
        dbLevel: 'honours',
        description: 'ঢাকা বিশ্ববিদ্যালয় ও জাতীয় বিশ্ববিদ্যালয়ের প্রাণিবিদ্যা বিভাগের অনার্স ৩য় বর্ষের শিক্ষার্থীদের জন্য লেকচার নোট ও একাডেমিক সমাধান।',
        icon: <GraduationCap className="w-8 h-8 text-primary" />,
      };
    case 'honours-4th-year':
      return {
        titleBn: 'অনার্স ৪র্থ বর্ষ (প্রাণিবিদ্যা)',
        titleEn: 'Honours 4th Year (Zoology)',
        dbLevel: 'honours',
        description: 'ঢাকা বিশ্ববিদ্যালয় ও জাতীয় বিশ্ববিদ্যালয়ের প্রাণিবিদ্যা বিভাগের অনার্স ৪র্থ বর্ষের শিক্ষার্থীদের জন্য স্পেশাল লেকচার শিট ও মেথডলজি গাইড।',
        icon: <GraduationCap className="w-8 h-8 text-primary" />,
      };
    default:
      return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  const info = getLevelInfo(level);

  if (!info) {
    return {
      title: 'Class Not Found',
    };
  }

  return {
    title: `${info.titleBn} (${info.titleEn})`,
    description: info.description,
    openGraph: {
      title: `${info.titleBn} (${info.titleEn}) | BiologywithSantosir`,
      description: info.description,
    },
  };
}

export default async function ClassesPage({ params }: PageProps) {
  const { level } = await params;
  const info = getLevelInfo(level);

  if (!info) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch posts and notes for this database level
  const { data: postsData } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, level, topic_id, read_time_min, published_at, topics(name_en, name_bn, slug)')
    .eq('level', info.dbLevel)
    .eq('published', true)
    .order('published_at', { ascending: false });

  const { data: notesData } = await supabase
    .from('notes')
    .select('*, topics(name_en, name_bn, slug)')
    .eq('level', info.dbLevel)
    .order('created_at', { ascending: false });

  let posts = (postsData || []).map((p: any) => ({
    ...p,
    topics: Array.isArray(p.topics) ? p.topics[0] : p.topics,
  }));

  let notes = (notesData || []).map((n: any) => ({
    ...n,
    topics: Array.isArray(n.topics) ? n.topics[0] : n.topics,
  }));

  // Apply smart sub-filtering
  if (level === 'hsc-zoology') {
    posts = posts.filter(p => p.topic_id === 'genetics');
    notes = notes.filter(n => n.topic_id === 'genetics' || n.title.includes('প্রাণি') || n.description?.includes('প্রাণি'));
  } else if (level === 'hsc-botany') {
    posts = posts.filter(p => ['cell-biology', 'microbiology', 'physiology'].includes(p.topic_id));
    notes = notes.filter(n => ['cell-biology', 'microbiology', 'physiology'].includes(n.topic_id) && !n.title.includes('প্রাণি'));
  } else if (level === 'honours-3rd-year') {
    notes = notes.filter(n => n.title.includes('৩য়') || n.description?.includes('৩য়') || n.title.toLowerCase().includes('3rd'));
  } else if (level === 'honours-4th-year') {
    notes = notes.filter(n => n.title.includes('৪র্থ') || n.description?.includes('৪র্থ') || n.title.toLowerCase().includes('4th'));
  }

  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.8125rem] text-text-secondary mb-6 font-semibold">
          <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight size={14} className="text-text-muted" />
          <span className="text-text-muted">ক্লাসেস</span>
          <ChevronRight size={14} className="text-text-muted" />
          <span className="text-text-primary">{info.titleBn}</span>
        </nav>

        {/* Hero header */}
        <div className="flex flex-col md:flex-row items-start gap-5 p-6 md:p-8 border border-border bg-surface-alt rounded-2xl mb-12 shadow-sm">
          <div className="p-4 bg-primary-light rounded-2xl flex-shrink-0">
            {info.icon}
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <Badge variant={info.dbLevel as any}>{info.dbLevel.toUpperCase()}</Badge>
              <h1 className="text-[1.75rem] md:text-[2.25rem] font-bold text-text-primary leading-tight">
                {info.titleBn}
              </h1>
            </div>
            <p className="text-[0.875rem] text-text-secondary font-medium mb-3">
              {info.titleEn}
            </p>
            <p className="text-[1rem] leading-relaxed text-text-secondary max-w-3xl">
              {info.description}
            </p>
          </div>
        </div>

        {/* Content Tabs / Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Post Grid (Left/Main side) */}
          <div className="lg:col-span-8">
            <h2 className="text-[1.375rem] font-bold text-text-primary mb-6 flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              লেকচার ও পোস্টসমূহ ({posts.length})
            </h2>

            {posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="border border-border bg-surface-alt rounded-xl p-10 text-center text-text-secondary">
                এই শ্রেণীতে বর্তমানে কোনো অনলাইন লেকচার পাওয়া যায়নি। শীঘ্রই নতুন কনটেন্ট আপলোড করা হবে।
              </div>
            )}
          </div>

          {/* Notes List (Right/Sidebar side) */}
          <div className="lg:col-span-4">
            <h2 className="text-[1.375rem] font-bold text-text-primary mb-6 flex items-center gap-2">
              <FileDown size={20} className="text-primary" />
              লেকচার শিট ও পিডিএফ ({notes.length})
            </h2>

            {notes.length > 0 ? (
              <div className="flex flex-col gap-4">
                {notes.map((note) => (
                  <div key={note.id} className="p-4 border border-border hover:border-primary-mid rounded-xl bg-surface transition duration-150 shadow-sm flex flex-col gap-3 group">
                    <div>
                      <span className="text-[0.6875rem] font-bold text-primary bg-primary-light px-2 py-0.5 rounded uppercase tracking-wider mb-1.5 inline-block">
                        {note.topics?.name_bn || 'জীববিজ্ঞান'}
                      </span>
                      <h3 className="text-[0.9375rem] font-bold text-text-primary leading-snug group-hover:text-primary transition-colors">
                        {note.title}
                      </h3>
                      {note.description && (
                        <p className="text-[0.8125rem] text-text-secondary leading-relaxed mt-1">
                          {note.description}
                        </p>
                      )}
                    </div>
                    <a
                      href={note.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 text-center text-[0.875rem] font-bold text-white bg-primary hover:bg-primary-dark transition duration-150 px-4 py-2.5 rounded-lg w-full"
                    >
                      <FileDown size={16} />
                      ডাউনলোড করুন (PDF)
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-border bg-surface-alt rounded-xl p-8 text-center text-text-secondary text-[0.875rem]">
                ডাউনলোড করার মতো কোনো লেকচার শিট এই শ্রেণীতে এখন যুক্ত করা হয়নি।
              </div>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
