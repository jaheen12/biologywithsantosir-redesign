import React from 'react';
import { useParams } from 'react-router-dom';
import { useTopicPosts } from '../hooks/usePosts';
import Container from '../components/ui/Container';
import PostCard from '../components/PostCard';

const Classes: React.FC = () => {
  const { classId } = useParams<{ classId?: string }>();

  const getLevelFromClassId = (id?: string): 'ssc' | 'hsc' | 'honours' => {
    if (!id) return 'ssc';
    const lower = id.toLowerCase();
    if (lower.includes('ssc')) return 'ssc';
    if (lower.includes('hsc')) return 'hsc';
    if (lower.includes('honours')) return 'honours';
    return 'ssc';
  };

  const level = getLevelFromClassId(classId);
  const { posts, loading, error } = useTopicPosts('all', level);

  const classMetadata: Record<string, { title: string; desc: string }> = {
    'ssc-biology': {
      title: 'এসএসসি জীববিজ্ঞান হাব (SSC Biology Hub)',
      desc: 'মাধ্যমিক (SSC) স্তরের জীববিজ্ঞান বিষয়ের সকল অধ্যায়ের বিস্তারিত লেকচার, গুরুত্বপূর্ণ সংজ্ঞা এবং চিত্রসহ আলোচনা।',
    },
    'hsc-zoology': {
      title: 'এইচএসসি প্রাণিবিজ্ঞান হাব (HSC Zoology Hub)',
      desc: 'উচ্চ মাধ্যমিক (HSC) স্তরের প্রাণিবিজ্ঞান (Zoology) বিষয়ের সকল গুরুত্বপূর্ণ চ্যাপ্টার, সিকিউ ও এমসিকিউ টিউটোরিয়াল।',
    },
    'hsc-botany': {
      title: 'এইচএসসি উদ্ভিদবিজ্ঞান হাব (HSC Botany Hub)',
      desc: 'উচ্চ মাধ্যমিক (HSC) স্তরের উদ্ভিদবিজ্ঞান (Botany) বিষয়ের বিভিন্ন শারীরবৃত্তীয় চক্র, সালোকসংশ্লেষণ ও কোষ বিভাজনের বিস্তারিত ব্যাখ্যা।',
    },
    'honours': {
      title: 'অনার্স জীববিজ্ঞান হাব (Honours Biology Hub)',
      desc: 'বিশ্ববিদ্যালয় পর্যায়ে প্রাণিবিজ্ঞান ও উদ্ভিদবিজ্ঞান অনার্স কোর্সের গুরুত্বপূর্ণ ও বিস্তারিত লেকচার নোটস।',
    },
  };

  const currentClass = (classId && classMetadata[classId]) || {
    title: `${level.toUpperCase()} জীববিজ্ঞান হাব`,
    desc: `${level.toUpperCase()} স্তরের সকল জীববিজ্ঞান অধ্যায়ের লেকচার ও আলোচনা।`,
  };

  return (
    <Container className="py-12 font-sans">
      <div className="border-b border-border pb-8 mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-3">
          {currentClass.title}
        </h1>
        <p className="text-text-secondary text-base max-w-3xl leading-relaxed">
          {currentClass.desc}
        </p>
      </div>

      {/* Posts Grid */}
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
        <div className="p-6 text-center border border-error/20 bg-error/5 text-error rounded-xl">
          পোস্ট লোড করা যায়নি: {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center text-text-secondary border border-dashed border-border rounded-xl">
          এই ক্লাসের অধীনে কোন পোস্ট পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </Container>
  );
};

export default Classes;
