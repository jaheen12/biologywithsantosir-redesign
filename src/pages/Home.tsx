import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, GraduationCap, ArrowRight, Dna } from 'lucide-react';
import { useLatestPosts } from '../hooks/usePosts';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PostCard from '../components/PostCard';
import SEO from '../components/SEO';

const Home: React.FC = () => {
  const { posts, loading, error } = useLatestPosts(6);

  const quickNavs = [
    {
      title: 'SSC Biology',
      subTitle: 'দশম শ্রেণী',
      link: '/classes/ssc-biology',
      icon: <BookOpen className="text-primary" size={24} aria-hidden="true" />,
      bg: 'bg-primary-light border-primary/20',
    },
    {
      title: 'HSC Zoology',
      subTitle: 'একাদশ-দ্বাদশ প্রাণিবিজ্ঞান',
      link: '/classes/hsc-zoology',
      icon: <Dna className="text-primary" size={24} aria-hidden="true" />,
      bg: 'bg-primary-light border-primary/20',
    },
    {
      title: 'HSC Botany',
      subTitle: 'একাদশ-দ্বাদশ উদ্ভিদবিজ্ঞান',
      link: '/classes/hsc-botany',
      icon: <GraduationCap className="text-primary" size={24} aria-hidden="true" />,
      bg: 'bg-primary-light border-primary/20',
    },
    {
      title: 'Honours Biology',
      subTitle: 'বিশ্ববিদ্যালয় কোর্স',
      link: '/classes/honours',
      icon: <Award className="text-primary" size={24} aria-hidden="true" />,
      bg: 'bg-primary-light border-primary/20',
    },
  ];

  return (
    <>
      <SEO 
        title="জীববিজ্ঞান সহজভাবে, বুঝে বুঝে" 
        description="এসএসসি, এইচএসসি এবং অনার্স স্তরের জীববিজ্ঞান সিলেবাসের জটিল বিষয়গুলো সহজ বাংলায় শিখুন সান্টো স্যারের সাথে।" 
      />
      <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="bg-surface-alt border-y border-border py-16 md:py-24 relative overflow-hidden">
        {/* Subtle leaf cell SVG background pattern */}
        <div className="absolute inset-0 opacity-4 pointer-events-none flex items-center justify-center">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <defs>
              <pattern id="cells" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 60 15 L 60 45 L 30 60 L 0 45 L 0 15 Z" fill="none" stroke="#1A7A5E" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cells)" />
          </svg>
        </div>

        <Container className="relative z-10 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-text-primary tracking-tight mb-6 leading-tight">
            জীববিজ্ঞান শেখো <span className="underline decoration-accent decoration-4 underline-offset-8">সহজভাবে</span>, বুঝে বুঝে
          </h1>
          <p className="text-lg md:text-xl font-sans text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            এসএসসি, এইচএসসি এবং অনার্স স্তরের শিক্ষার্থীদের জন্য জিনের গঠন থেকে শুরু করে বিশাল বাস্তুতন্ত্রের জটিল টপিকগুলো সহজ বাংলায় ব্যাখ্যা।
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/topics/genetics">
              <Button size="lg" className="w-full sm:w-auto">
                পড়া শুরু করো
              </Button>
            </Link>
            <Link to="/notes">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                পিডিএফ নোটস ডাউনলোড
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto mt-16 border-t border-border/50 pt-8 font-sans">
            <div>
              <span className="block text-3xl font-bold text-primary">50,000+</span>
              <span className="text-base text-text-secondary">সন্তুষ্ট শিক্ষার্থী</span>
            </div>
            <div>
              <span className="block text-3xl font-bold text-primary">200+</span>
              <span className="text-base text-text-secondary">ফ্রি ভিডিও ও পোস্ট</span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="block text-3xl font-bold text-primary">10+ বছর</span>
              <span className="text-base text-text-secondary">শিক্ষাদানের অভিজ্ঞতা</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Quick Navigation Cards */}
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
          {quickNavs.map((nav, index) => (
            <Link 
              key={index} 
              to={nav.link}
              className={`flex items-center gap-4 p-5 rounded-xl border hover:border-primary/50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 ${nav.bg}`}
            >
              <div className="p-3 bg-white rounded-lg shadow-xs">
                {nav.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">{nav.title}</h3>
                <p className="text-base text-text-secondary mt-0.5">{nav.subTitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>

      {/* Latest Posts Grid */}
      <Container>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-sans font-bold text-text-primary">
              সাম্প্রতিক জীববিজ্ঞান পাঠসমূহ
            </h2>
            <p className="text-text-secondary text-base mt-1">স্যার কর্তৃক লিখিত সর্বশেষ তথ্যবহুল পোস্টসমূহ</p>
          </div>
          <Link to="/topics/all" className="hidden sm:inline-flex items-center gap-1 text-base font-semibold text-primary hover:text-primary-mid">
            সবগুলো দেখো
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-border rounded-xl p-5 animate-pulse flex flex-col justify-between h-48 bg-surface-alt">
                <div>
                  <div className="h-4 bg-border rounded-sm w-1/3 mb-4"></div>
                  <div className="h-6 bg-border rounded-sm w-3/4 mb-3"></div>
                  <div className="h-4 bg-border rounded-sm w-full mb-1"></div>
                  <div className="h-4 bg-border rounded-sm w-5/6"></div>
                </div>
                <div className="h-4 bg-border rounded-sm w-1/2 mt-4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center border border-error/20 bg-error/5 text-error rounded-xl font-sans">
            পোস্ট লোড করা যায়নি: {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-text-secondary border border-dashed border-border rounded-xl">
            কোন পোস্ট পাওয়া যায়নি। Supabase-এ ডেটা সেড করা হয়েছে কি না নিশ্চিত করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="text-center sm:hidden mt-8">
          <Link to="/topics/all">
            <Button variant="outline" className="w-full">
              সবগুলো পোস্ট দেখো
              <ArrowRight size={16} className="ml-1 inline" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </Container>

      {/* About Instructor Snippet */}
      <section className="bg-surface-alt border-y border-border py-16">
        <Container className="grid grid-cols-1 md:grid-cols-3 items-center gap-12">
            <img 
              src="/favicon.png" 
              alt="Santo Sir" 
              width="192"
              height="192"
              loading="lazy"
              className="w-48 h-48 rounded-full object-cover border-4 border-primary/20 shadow-md"
            />
          <div className="md:col-span-2 text-center md:text-left font-sans">
            <Badge variant="hsc" className="mb-2">শিক্ষক পরিচিতি</Badge>
            <h2 className="text-3xl font-bold text-text-primary mb-4">Santo Sir (সান্টো স্যার)</h2>
            <h4 className="text-primary font-semibold text-lg mb-4">MSc in Zoology, University of Dhaka</h4>
            <p className="text-text-secondary text-base leading-relaxed mb-6">
              আমি একজন শিক্ষক। পড়ানো পেশা থেকে কখন নেশায় পরিণত হয়েছে তা আমি নিজেই বুঝতে পারিনি। ক্লাসরুমের বাইরেও সব স্তরের শিক্ষার্থীদের মাঝে জীববিজ্ঞানের সঠিক ও নির্ভেজাল জ্ঞান ছড়িয়ে দেওয়ার তীব্র ইচ্ছা থেকেই মূলত এই ব্লগসাইট তৈরি করেছি। স্বপ্ন দেখি একদিন এই প্ল্যাটফর্মটি প্রতিটি শিক্ষার্থীর দরজায় পৌঁছাবে এবং সবার জ্ঞান ভাণ্ডার সমৃদ্ধ করবে।
            </p>
            <Link to="/about">
              <Button>বিস্তারিত সার্টিফিকেট ও অভিজ্ঞতা দেখুন</Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
    </>
  );
};

export default Home;
