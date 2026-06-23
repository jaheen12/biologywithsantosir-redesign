import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Badge from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import type { Post } from '../hooks/usePosts';
import { Search as SearchIcon, FileText, FolderOpen, ArrowRight, HelpCircle, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all posts once on load
  useEffect(() => {
    async function fetchAllPosts() {
      try {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (err) throw err;
        setAllPosts(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch search catalog.');
      } finally {
        setLoading(false);
      }
    }
    fetchAllPosts();
  }, []);

  const topicsList = [
    { id: 'genetics', title: 'জেনেটিক্স (Genetics)', desc: 'বংশগতিবিদ্যা ও ডিএনএ' },
    { id: 'cell-biology', title: 'কোষ জীববিজ্ঞান (Cell Biology)', desc: 'কোষের গঠন ও বিভাজন' },
    { id: 'physiology', title: 'শারীরবৃত্ত (Physiology)', desc: 'মানব ও উদ্ভিদের শারীরবৃত্তীয় প্রক্রিয়া' },
    { id: 'microbiology', title: 'অণুজীববিজ্ঞান (Microbiology)', desc: 'ভাইরাস ও ব্যাকটেরিয়া' },
  ];

  const cleanQuery = query.trim().toLowerCase();
  
  // 1. Match Topics
  const matchedTopics = cleanQuery 
    ? topicsList.filter(t => 
        t.id.includes(cleanQuery) || 
        t.title.toLowerCase().includes(cleanQuery) || 
        t.desc.toLowerCase().includes(cleanQuery)
      )
    : [];

  // 2. Match Posts
  const matchedPosts = cleanQuery
    ? allPosts.filter(p => 
        p.title.toLowerCase().includes(cleanQuery) || 
        p.excerpt.toLowerCase().includes(cleanQuery) || 
        p.content.toLowerCase().includes(cleanQuery) ||
        p.topic_id.toLowerCase().includes(cleanQuery)
      )
    : [];

  return (
    <>
      <SEO 
        title="নিবন্ধ অনুসন্ধান" 
        description="জীববিজ্ঞানের যেকোনো অধ্যায়, লেকচার নোটস, গুরুত্বপূর্ণ সংজ্ঞা বা টপিক সহজে খুঁজে পেতে আমাদের রিয়েল-টাইম অনুসন্ধান ইঞ্জিন ব্যবহার করুন।" 
      />
      <Container className="py-12 font-sans max-w-4xl">
      {/* Header */}
      <div className="border-b border-border pb-8 mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-3">
          নিবন্ধ অনুসন্ধান (Search Articles)
        </h1>
        <p className="text-text-secondary text-base max-w-3xl leading-relaxed">
          জীববিজ্ঞানের যেকোনো অধ্যায়, লেকচার নোটস, সংজ্ঞা বা টপিক সহজে খুঁজে পেতে নিচে টাইপ করুন।
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto my-8 relative">
        <input
          type="text"
          placeholder="সার্চ করতে টাইপ করুন (যেমন: ডিএনএ, কোষ, মেন্ডেল...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-10 py-3 rounded-xl border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-base shadow-xs transition-all"
          disabled={loading || error !== null}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
          {loading ? (
            <Loader2 className="animate-spin text-primary" size={20} aria-hidden="true" />
          ) : (
            <SearchIcon size={20} aria-hidden="true" />
          )}
        </div>
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-sm font-semibold cursor-pointer"
          >
            মুছুন
          </button>
        )}
      </div>

      {/* Search Status & Loading */}
      {loading && (
        <div className="text-center py-12 text-text-secondary font-medium">
          সার্চ ক্যাটালগ প্রস্তুত করা হচ্ছে...
        </div>
      )}

      {error && (
        <div className="p-6 text-center border border-error/20 bg-error/5 text-error rounded-xl max-w-lg mx-auto">
          ক্যাটালগ লোড করা যায়নি: {error}
        </div>
      )}

      {/* Search Results Display */}
      {!loading && !error && (
        <div className="space-y-10">
          {!query ? (
            <div className="text-center py-16 bg-surface-alt border border-border border-dashed rounded-2xl max-w-2xl mx-auto">
              <SearchIcon className="text-text-muted mx-auto mb-4" size={44} aria-hidden="true" />
              <h3 className="text-lg font-bold text-text-primary mb-2">অনুসন্ধান শুরু করুন</h3>
              <p className="text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">
                টাইপ করা শুরু করলেই আমরা রিয়েল-টাইমে জীববিজ্ঞান বিষয়ক পোস্ট এবং ক্যাগরিগুলো মিলিয়ে প্রদর্শন করব।
              </p>
            </div>
          ) : matchedTopics.length === 0 && matchedPosts.length === 0 ? (
            <div className="text-center py-16 bg-surface-alt border border-border rounded-2xl max-w-2xl mx-auto">
              <HelpCircle className="text-text-muted mx-auto mb-4" size={44} aria-hidden="true" />
              <h3 className="text-lg font-bold text-text-primary mb-2">কোন ফলাফল মেলেনি</h3>
              <p className="text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">
                দুঃখিত, "{query}" এর সাথে মিলে যায় এমন কোনো বিষয় বা নিবন্ধ খুঁজে পাওয়া যায়নি। দয়া করে অন্য কোনো শব্দ টাইপ করুন।
              </p>
            </div>
          ) : (
            <div className="grid gap-8">
              {/* 1. Matched Topics */}
              {matchedTopics.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border pb-2 flex items-center gap-2">
                    <FolderOpen size={16} className="text-primary" aria-hidden="true" />
                    টপিকসমূহ ({matchedTopics.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matchedTopics.map((topic) => (
                      <Link
                        key={topic.id}
                        to={`/topics/${topic.id}`}
                        className="flex items-center justify-between p-4 border border-border rounded-xl bg-surface hover:border-primary/50 hover:shadow-xs transition-all duration-150"
                      >
                        <div>
                          <h4 className="text-base font-bold text-text-primary">{topic.title}</h4>
                          <p className="text-xs text-text-secondary mt-0.5">{topic.desc}</p>
                        </div>
                        <ArrowRight size={16} className="text-primary" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Matched Posts */}
              {matchedPosts.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border pb-2 flex items-center gap-2">
                    <FileText size={16} className="text-primary" aria-hidden="true" />
                    নিবন্ধসমূহ ({matchedPosts.length})
                  </h2>
                  <div className="space-y-4">
                    {matchedPosts.map((post) => (
                      <article 
                        key={post.id}
                        className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex gap-2 mb-2 flex-wrap">
                          <Badge variant={post.academic_level}>{post.academic_level}</Badge>
                          <Badge variant="default" className="bg-surface-alt border border-border text-text-secondary capitalize">
                            {post.topic_id.replace('-', ' ')}
                          </Badge>
                        </div>
                        <Link to={`/topics/${post.topic_id}/${post.slug}`}>
                          <h3 className="text-lg font-bold text-text-primary hover:text-primary mb-2 transition-colors duration-150">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Container>
    </>
  );
};

export default Search;
