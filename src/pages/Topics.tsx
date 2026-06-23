import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTopicPosts } from '../hooks/usePosts';
import Container from '../components/ui/Container';
import PostCard from '../components/PostCard';
import SEO from '../components/SEO';

const Topics: React.FC = () => {
  const { topicId } = useParams<{ topicId?: string }>();
  const [levelFilter, setLevelFilter] = useState<'all' | 'ssc' | 'hsc' | 'honours'>('all');
  
  // Fetch posts filtered by topicId and levelFilter
  const { posts, loading, error } = useTopicPosts(topicId, levelFilter);

  // Topic Metadata
  const topicMap: Record<string, { title: string; desc: string }> = {
    genetics: {
      title: 'জেনেটিক্স (Genetics)',
      desc: 'বংশগতিবিদ্যা ও ডিএনএ সম্পর্কিত গুরুত্বপূর্ণ আলোচনা, মেন্ডেলের সূত্রাবলী এবং জীবপ্রযুক্তি বিষয়ক প্রবন্ধসমূহ।',
    },
    'cell-biology': {
      title: 'কোষ জীববিজ্ঞান (Cell Biology)',
      desc: 'কোষের গঠন, সাইটোপ্লাজমীয় অঙ্গাণু এবং কোষ বিভাজনের বিভিন্ন পর্যায় (মাইটোসিস, মিয়োসিস) নিয়ে বিস্তারিত পাঠ।',
    },
    physiology: {
      title: 'শারীরবৃত্ত (Physiology)',
      desc: 'মানব ও উদ্ভিদের শারীরবৃত্তীয় প্রক্রিয়া যেমন সালোকসংশ্লেষণ, শ্বসন, রক্ত সংবহন এবং রেচন নিয়ে বিস্তারিত আলোচনা।',
    },
    microbiology: {
      title: 'অণুজীববিজ্ঞান (Microbiology)',
      desc: 'ভাইরাস, ব্যাকটেরিয়া ও অন্যান্য অণুজীবের গঠন, জীবনচক্র এবং মানবদেহে এদের রোগসৃষ্টিকারী প্রতিক্রিয়া।',
    },
    all: {
      title: 'সকল জীববিজ্ঞান পাঠসমূহ',
      desc: 'এসএসসি, এইচএসসি এবং বিশ্ববিদ্যালয় অনার্স কোর্সের জীববিজ্ঞানের সকল লিখিত ক্লাস নোট ও লেকচার।',
    },
  };

  const currentTopic = (topicId && topicMap[topicId]) || topicMap.all;

  const filters: { label: string; value: typeof levelFilter }[] = [
    { label: 'সব লেভেল', value: 'all' },
    { label: 'এসএসসি (SSC)', value: 'ssc' },
    { label: 'এইচএসসি (HSC)', value: 'hsc' },
    { label: 'অনার্স (Honours)', value: 'honours' },
  ];

  return (
    <>
      <SEO 
        title={currentTopic.title} 
        description={currentTopic.desc} 
      />
      <Container className="py-12 font-sans">
      <div className="border-b border-border pb-8 mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-3">
          {currentTopic.title}
        </h1>
        <p className="text-text-secondary text-base max-w-3xl leading-relaxed">
          {currentTopic.desc}
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setLevelFilter(filter.value)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
              levelFilter === filter.value
                ? 'bg-primary border-primary text-white shadow-xs'
                : 'border-border bg-transparent text-text-secondary hover:bg-surface-alt hover:text-text-primary'
            }`}
          >
            {filter.label}
          </button>
        ))}
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
          এই লেভেলের অধীনে কোন পোস্ট পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </Container>
    </>
  );
};

export default Topics;
