'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, BookOpen, Tag, Loader2, ArrowRight } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';
import type { Tables } from '@/lib/database.types';

interface SearchPostResult {
  slug: string;
  title: string;
  level: string;
  topic_id: string;
  topics: { name_en: string; name_bn: string; slug: string } | null;
}

interface SearchTopicResult {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
}


export default function SearchModal() {
  const { isOpen, closeSearch, toggleSearch } = useSearch();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ posts: SearchPostResult[]; topics: SearchTopicResult[] }>({ posts: [], topics: [] });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Keyboard shortcut listener (Ctrl+K / Cmd+K / Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleSearch, closeSearch]);

  // Focus input and toggle body scroll lock, save/restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults({ posts: [], topics: [] });
      setHasSearched(false);
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        requestAnimationFrame(() => {
          previousFocusRef.current?.focus();
        });
        previousFocusRef.current = null;
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debounced search query fetching
  useEffect(() => {
    if (!query.trim()) {
      setResults({ posts: [], topics: [] });
      setHasSearched(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();

    const fetchResults = async () => {
      try {
        const supabase = createClient();

        // 1. Search posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('slug, title, level, topic_id, topics(name_en, name_bn, slug)')
          .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
          .eq('published', true)
          .limit(6)
          .abortSignal(controller.signal);

        // 2. Search topics
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select('id, name_en, name_bn, slug')
          .or(`name_en.ilike.%${query}%,name_bn.ilike.%${query}%`)
          .limit(4)
          .abortSignal(controller.signal);

        if (!postsError && !topicsError) {
          const formattedPosts: SearchPostResult[] = (postsData || []).map((p: Record<string, unknown>) => {
            const topics = Array.isArray(p.topics)
              ? (p.topics[0] as SearchPostResult['topics'])
              : (p.topics as SearchPostResult['topics']);
            return { slug: p.slug, title: p.title, level: p.level, topic_id: p.topic_id, topics } as SearchPostResult;
          });
          setResults({ posts: formattedPosts, topics: topicsData || [] });

          setResults({
            posts: formattedPosts,
            topics: topicsData || [],
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query]);

  // Accessibility Focus Trap
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    if (!modalRef.current) return;

    const focusable = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex="0"]'
    );
    if (focusable.length === 0) return;

    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  };

  const handleResultClick = (href: string) => {
    closeSearch();
    router.push(href);
  };

  if (!isOpen) return null;

  const noResults = hasSearched && results.posts.length === 0 && results.topics.length === 0;

  return (
    <div
      className="fixed inset-0 bg-text-primary/45 backdrop-blur-sm z-50 flex items-start justify-center p-4 md:p-10 transition-opacity duration-200 animate-fade-in"
      onClick={closeSearch}
    >
      <div
        ref={modalRef}
        className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden mt-10 md:mt-20 flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleTabKey}
        role="dialog"
        aria-modal="true"
        aria-label="Search posts and topics"
      >
        {/* Header Search Box */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-surface">
          <Search size={22} className="text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="জীববিজ্ঞান খুঁজুন (উদাঃ কোষ বিভাজন, Genetics)..."
            aria-label="জীববিজ্ঞান খুঁজুন"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-[1.0625rem] text-text-primary placeholder-text-muted outline-none border-none py-1 font-ui"
          />
          {loading ? (
            <Loader2 size={20} className="text-primary animate-spin flex-shrink-0" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="text-text-muted hover:text-text-primary p-1 rounded-lg transition"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          ) : (
            <span className="hidden sm:inline text-[0.75rem] font-bold text-text-muted border border-border px-2 py-1 rounded bg-surface-alt font-mono">
              ESC
            </span>
          )}
          <button
            onClick={closeSearch}
            className="text-text-muted hover:text-text-primary p-1.5 rounded-lg transition sm:hidden"
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="flex-grow overflow-y-auto p-5 font-ui">
          {/* Welcome Screen */}
          {!query && (
            <div className="text-center py-10">
              <p className="text-[1rem] text-text-secondary leading-relaxed">
                biologywithsantosir.com এর পোস্ট ও অধ্যায়সমূহ অনুসন্ধান করুন।
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3 text-[0.8125rem]">
                <button
                  onClick={() => setQuery('কোষ')}
                  className="bg-primary-light text-primary hover:bg-primary-mid hover:text-white px-3 py-1.5 rounded-md font-semibold transition"
                >
                  কোষ বিভাজন
                </button>
                <button
                  onClick={() => setQuery('genetics')}
                  className="bg-primary-light text-primary hover:bg-primary-mid hover:text-white px-3 py-1.5 rounded-md font-semibold transition"
                >
                  Genetics
                </button>
                <button
                  onClick={() => setQuery('ভাইরাস')}
                  className="bg-primary-light text-primary hover:bg-primary-mid hover:text-white px-3 py-1.5 rounded-md font-semibold transition"
                >
                  ভাইরাস ও অণুজীব
                </button>
              </div>
            </div>
          )}

          {/* Loading placeholders */}
          {loading && results.posts.length === 0 && results.topics.length === 0 && (
            <div className="space-y-4 animate-pulse">
              <div className="h-5 w-24 bg-border rounded" />
              <div className="h-12 w-full bg-border rounded" />
              <div className="h-12 w-full bg-border rounded" />
            </div>
          )}

          {/* Empty State */}
          {noResults && (
            <div className="text-center py-12 text-text-secondary">
              <p className="text-[1.0625rem] font-medium">কোনো ফলাফল পাওয়া যায়নি।</p>
              <p className="text-[0.875rem] text-text-muted mt-1">অন্য কোনো শব্দ দিয়ে আবার চেষ্টা করুন।</p>
            </div>
          )}

          {/* Topics Results */}
          {results.topics.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Tag size={12} className="text-primary" />
                বিষয়সমূহ
              </h3>
              <ul className="space-y-1.5">
                {results.topics.map((topic) => (
                  <li key={topic.id}>
                    <button
                      onClick={() => handleResultClick(`/topics/${topic.slug}`)}
                      className="w-full text-left p-3 border border-border hover:border-primary hover:bg-primary-light/35 rounded-xl transition flex items-center justify-between group"
                    >
                      <div>
                        <span className="text-[0.9375rem] font-bold text-text-primary group-hover:text-primary transition">
                          {topic.name_bn}
                        </span>
                        <span className="text-[0.8125rem] text-text-secondary ml-1.5">
                          ({topic.name_en})
                        </span>
                      </div>
                      <ArrowRight size={16} className="text-text-muted group-hover:text-primary transition -translate-x-1 group-hover:translate-x-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Posts Results */}
          {results.posts.length > 0 && (
            <div>
              <h3 className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <BookOpen size={12} className="text-primary" />
                পোস্ট ও লেকচারসমূহ
              </h3>
              <ul className="space-y-1.5">
                {results.posts.map((post) => {
                  const topicSlug = post.topics?.slug || post.topic_id;
                  const topicName = post.topics?.name_bn || post.topics?.name_en || post.topic_id;
                  return (
                    <li key={post.slug}>
                      <button
                        onClick={() => handleResultClick(`/topics/${topicSlug}/${post.slug}`)}
                        className="w-full text-left p-3 border border-border hover:border-primary hover:bg-primary-light/35 rounded-xl transition flex flex-col gap-2 group"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[0.9375rem] font-bold text-text-primary group-hover:text-primary transition line-clamp-1">
                            {post.title}
                          </span>
                          <ArrowRight size={16} className="text-text-muted group-hover:text-primary transition -translate-x-1 group-hover:translate-x-0 flex-shrink-0" />
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={post.level as 'ssc' | 'hsc' | 'honours' | 'topic'}>{post.level.toUpperCase()}</Badge>
                          <Badge variant="topic">{topicName}</Badge>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="bg-surface-alt px-5 py-3 border-t border-border hidden sm:flex items-center justify-between text-[0.75rem] text-text-secondary font-ui">
          <div className="flex gap-4">
            <span>
              <kbd className="bg-surface border border-border px-1.5 py-0.5 rounded font-mono shadow-sm">↑↓</kbd> নেভিগেট করো
            </span>
            <span>
              <kbd className="bg-surface border border-border px-1.5 py-0.5 rounded font-mono shadow-sm">Enter</kbd> নির্বাচন করো
            </span>
          </div>
          <span>
            বন্ধ করতে <kbd className="bg-surface border border-border px-1.5 py-0.5 rounded font-mono shadow-sm">ESC</kbd> চাপুন
          </span>
        </div>
      </div>
    </div>
  );
}
