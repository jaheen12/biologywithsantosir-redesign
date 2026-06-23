import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Clock, ChevronRight, Menu, X } from 'lucide-react';
import { usePost } from '../hooks/usePosts';
import Container from '../components/ui/Container';
import Badge from '../components/ui/Badge';
import Callout from '../components/Callout';

const Article: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error } = usePost(slug);
  const [tocOpen, setTocOpen] = useState(false);
  const [headings, setHeadings] = useState<string[]>([]);

  // Extract headings from markdown content for TOC
  useEffect(() => {
    if (post?.content) {
      const headingRegex = /^##\s+(.*)$/gm;
      const found: string[] = [];
      let match;
      while ((match = headingRegex.exec(post.content)) !== null) {
        found.push(match[1]);
      }
      setHeadings(found);
    }
  }, [post]);

  // Simple Markdown renderer
  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // H1 Header
      if (paragraph.startsWith('# ')) {
        return null; // Skip title as it is already rendered in header
      }
      // H2 Header
      if (paragraph.startsWith('## ')) {
        const text = paragraph.replace('## ', '');
        const id = text.toLowerCase().replace(/[^\w\u0e00-\u0e7f\u0980-\u09ff]/g, '-');
        return (
          <h2 
            key={index} 
            id={id} 
            className="text-2xl font-sans font-bold text-text-primary border-l-4 border-primary pl-3 my-6 scroll-mt-20"
          >
            {text}
          </h2>
        );
      }
      // Bullets
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
        return (
          <ul key={index} className="list-disc pl-6 my-4 space-y-2 text-text-primary font-sans leading-relaxed">
            {paragraph.split('\n').map((li, i) => (
              <li key={i}>{li.replace(/^[-*]\s+/, '')}</li>
            ))}
          </ul>
        );
      }
      // Numbered List
      if (/^\d+\.\s+/.test(paragraph)) {
        return (
          <ol key={index} className="list-decimal pl-6 my-4 space-y-2 text-text-primary font-sans leading-relaxed">
            {paragraph.split('\n').map((li, i) => (
              <li key={i}>{li.replace(/^\d+\.\s+/, '')}</li>
            ))}
          </ol>
        );
      }
      // Callout Block Definition (if it contains definition indicators)
      if (paragraph.includes('💡') || paragraph.includes('সংজ্ঞা')) {
        return (
          <Callout key={index} title="💡 গুরুত্বপূর্ণ সংজ্ঞা">
            {paragraph.replace('💡', '').trim()}
          </Callout>
        );
      }

      // Regular paragraph (handle **bold**)
      const formattedText = paragraph.split('**').map((chunk, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-bold text-text-primary">{chunk}</strong>;
        }
        return chunk;
      });

      return (
        <p key={index} className="text-text-primary text-base leading-relaxed my-4 font-sans">
          {formattedText}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <Container className="py-12 animate-pulse font-sans">
        <div className="h-6 bg-border w-1/4 mb-6"></div>
        <div className="h-10 bg-border w-3/4 mb-4"></div>
        <div className="h-4 bg-border w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-3 h-96 bg-border rounded-xl"></div>
          <div className="hidden md:block h-64 bg-border rounded-xl"></div>
        </div>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container className="py-12 text-center font-sans">
        <div className="p-8 border border-error/20 bg-error/5 text-error rounded-xl max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-2">নিবন্ধটি পাওয়া যায়নি</h2>
          <p className="text-sm mb-4">{error || 'The requested article could not be loaded.'}</p>
          <Link to="/" className="text-primary font-semibold hover:underline">হোমপেজে ফিরে যান</Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 font-sans">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-text-muted mb-6 flex-wrap font-semibold uppercase tracking-wider">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <Link to="/topics" className="hover:text-primary">Topics</Link>
        <ChevronRight size={12} />
        <Link to={`/topics/${post.topic_id}`} className="hover:text-primary capitalize">
          {post.topic_id.replace('-', ' ')}
        </Link>
        <ChevronRight size={12} />
        <span className="text-text-secondary truncate max-w-[200px]">{post.title}</span>
      </nav>

      {/* Article Header */}
      <header className="border-b border-border pb-6 mb-8">
        <div className="flex gap-2 mb-4">
          <Badge variant={post.academic_level}>{post.academic_level}</Badge>
          <Badge variant="default" className="bg-surface-alt border border-border text-text-secondary capitalize">
            {post.topic_id.replace('-', ' ')}
          </Badge>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary">
          <span className="flex items-center gap-1.5">
            <User size={16} className="text-primary-mid" />
            {post.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={16} className="text-primary-mid" />
            {new Date(post.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={16} className="text-primary-mid" />
            {post.read_time} মিনিট পাঠ
          </span>
        </div>
      </header>

      {/* Main Grid: TOC + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sticky Sidebar TOC (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1 border-r border-border pr-6">
          <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              📂 সূচিপত্র
            </h4>
            {headings.length === 0 ? (
              <p className="text-sm text-text-muted">এই নিবন্ধে কোন সাব-হেডিং নেই।</p>
            ) : (
              <ul className="space-y-3 text-sm font-semibold">
                {headings.map((heading, i) => {
                  const id = heading.toLowerCase().replace(/[^\w\u0e00-\u0e7f\u0980-\u09ff]/g, '-');
                  return (
                    <li key={i}>
                      <a href={`#${id}`} className="text-text-secondary hover:text-primary block transition-colors duration-150 py-0.5">
                        {heading}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Mobile Collapsible TOC Toggle */}
        {headings.length > 0 && (
          <div className="lg:hidden w-full bg-surface-alt border border-border rounded-xl p-4">
            <button 
              onClick={() => setTocOpen(!tocOpen)}
              className="flex items-center justify-between w-full font-bold text-sm text-text-primary uppercase tracking-wider cursor-pointer"
              aria-expanded={tocOpen}
              aria-controls="mobile-toc-menu"
            >
              <span className="flex items-center gap-2">📂 সূচিপত্র</span>
              {tocOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            {tocOpen && (
              <ul id="mobile-toc-menu" className="mt-4 space-y-2 border-t border-border pt-3 text-sm font-medium">
                {headings.map((heading, i) => {
                  const id = heading.toLowerCase().replace(/[^\w\u0e00-\u0e7f\u0980-\u09ff]/g, '-');
                  return (
                    <li key={i}>
                      <a 
                        href={`#${id}`} 
                        onClick={() => setTocOpen(false)}
                        className="text-text-secondary hover:text-primary block py-1"
                      >
                        {heading}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* Content Body */}
        <article className="lg:col-span-3 prose max-w-none">
          {renderContent(post.content)}
        </article>
      </div>
    </Container>
  );
};

export default Article;
