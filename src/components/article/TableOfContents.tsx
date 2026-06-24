'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, List } from 'lucide-react';
import { HeadingItem } from '@/lib/markdown';

interface TableOfContentsProps {
  headings: HeadingItem[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          // Use the first visible element's ID as the active heading
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '0px 0px -50% 0px',
        threshold: 0.1,
      }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => {
      headings.forEach((h) => {
        const el = document.getElementById(h.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [headings]);

  if (headings.length === 0) return null;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elRect = el.getBoundingClientRect().top;
      const elPosition = elRect - bodyRect;
      const offsetPosition = elPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setActiveId(id);
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full">
      {/* Mobile Accordion */}
      <div className="lg:hidden border border-border rounded-xl bg-surface-alt mb-6 overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-5 py-4 flex items-center justify-between text-text-primary font-bold text-[0.9375rem] font-ui transition hover:bg-primary-light/50"
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-2">
            <List size={18} className="text-primary" />
            সূচিপত্র (Table of Contents)
          </span>
          {isOpen ? (
            <ChevronUp size={18} className="text-text-secondary" />
          ) : (
            <ChevronDown size={18} className="text-text-secondary" />
          )}
        </button>

        {isOpen && (
          <nav className="border-t border-border bg-surface px-5 py-4">
            <ul className="space-y-3">
              {headings.map((heading) => (
                <li
                  key={heading.id}
                  style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
                >
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleLinkClick(e, heading.id)}
                    className={`block text-[0.875rem] font-semibold leading-relaxed transition ${
                      activeId === heading.id
                        ? 'text-primary font-bold'
                        : 'text-text-secondary hover:text-primary'
                    }`}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Desktop Sticky Panel */}
      <div className="hidden lg:block sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-4 font-ui">
        <h3 className="text-[1rem] font-bold text-text-primary mb-4 flex items-center gap-2 pb-3 border-b border-border">
          <List size={18} className="text-primary" />
          সূচিপত্র
        </h3>
        <nav>
          <ul className="space-y-3.5 relative border-l border-border pl-4">
            {headings.map((heading) => {
              const isActive = activeId === heading.id;
              return (
                <li
                  key={heading.id}
                  className="relative animate-fade-in"
                  style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
                >
                  {isActive && (
                    <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-1.5 h-5 bg-primary rounded-r" />
                  )}
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleLinkClick(e, heading.id)}
                    className={`block text-[0.875rem] font-semibold leading-relaxed transition-all duration-150 ${
                      isActive
                        ? 'text-primary font-bold translate-x-1'
                        : 'text-text-secondary hover:text-primary hover:translate-x-1'
                    }`}
                  >
                    {heading.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
