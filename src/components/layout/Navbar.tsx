'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, ChevronDown, Book, GraduationCap, School } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Container } from '@/components/ui/Container';
import { useSearch } from '@/context/SearchContext';

interface Topic {
  name_en: string;
  name_bn: string;
  slug: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openSearch } = useSearch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClassesOpen, setIsClassesOpen] = useState(false);
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Mobile accordion state
  const [isMobileClassesOpen, setIsMobileClassesOpen] = useState(false);
  const [isMobileTopicsOpen, setIsMobileTopicsOpen] = useState(false);

  const [topics, setTopics] = useState<Topic[]>([]);
  const supabase = createClient();

  const classesRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Fetch topics for the dropdown
  useEffect(() => {
    async function fetchTopics() {
      const { data, error } = await supabase
        .from('topics')
        .select('name_en, name_bn, slug')
        .order('sort_order', { ascending: true });
      if (!error && data) {
        setTopics(data);
      }
    }
    fetchTopics();
  }, []);

  // Handle scroll shadow
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (classesRef.current && !classesRef.current.contains(event.target as Node)) {
        setIsClassesOpen(false);
      }
      if (topicsRef.current && !topicsRef.current.contains(event.target as Node)) {
        setIsTopicsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auth state listener
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getInitial = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.trim().charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Close drawer on path change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Mobile drawer focus management
  useEffect(() => {
    if (isDrawerOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      // Focus the close button after render
      requestAnimationFrame(() => {
        closeBtnRef.current?.focus();
      });
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isDrawerOpen]);

  // Escape key closes drawer
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 bg-surface border-b border-border h-[56px] lg:h-[64px] flex items-center ${
          isScrolled ? 'shadow-[0_1px_8px_rgba(0,0,0,0.08)]' : ''
        }`}
      >
        <Container className="flex items-center justify-between">
          {/* Logo */}
          {/* Logo — leading-none prevents body line-height from creating awkward gaps when text wraps on small screens; text-sm/md on mobile to avoid wrapping */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 text-primary font-bold text-sm sm:text-base lg:text-xl font-ui leading-none">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 fill-current shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7,18.5C15.5,18.5 19,13 22,8C19,10 16,8 17,8M12,2C11.5,4 8.5,8 3,8C3.5,6 6.5,2 12,2Z" />
            </svg>
            <span className="whitespace-nowrap">Santo Sir Biology</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 font-ui">
            {/* Classes Dropdown */}
            <div className="relative" ref={classesRef}>
              <button
                onClick={() => setIsClassesOpen(!isClassesOpen)}
                aria-expanded={isClassesOpen}
                aria-controls="navbar-classes-dropdown"
                className={`flex items-center gap-1 text-[0.9375rem] font-medium transition duration-150 py-2 hover:text-primary ${
                  isClassesOpen ? 'text-primary' : 'text-text-primary'
                }`}
              >
                Classes
                <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isClassesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isClassesOpen && (
                <div id="navbar-classes-dropdown" className="absolute top-[48px] left-1/2 -translate-x-1/2 bg-surface border border-border rounded-xl shadow-lg p-5 grid grid-cols-2 gap-6 w-[420px]">
                  <div>
                    <h3 className="text-[0.75rem] font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                      <School className="w-3.5 h-3.5 text-primary" />
                      School Level
                    </h3>
                    <Link
                      href="/classes/ssc-biology"
                      onClick={() => setIsClassesOpen(false)}
                      className="block text-[0.875rem] text-text-primary hover:text-primary transition duration-150 py-1"
                    >
                      • SSC Biology
                    </Link>
                  </div>
                  <div>
                    <h3 className="text-[0.75rem] font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />
                      College Level
                    </h3>
                    <Link
                      href="/classes/hsc-zoology"
                      onClick={() => setIsClassesOpen(false)}
                      className="block text-[0.875rem] text-text-primary hover:text-primary transition duration-150 py-1"
                    >
                      • HSC Zoology
                    </Link>
                    <Link
                      href="/classes/hsc-botany"
                      onClick={() => setIsClassesOpen(false)}
                      className="block text-[0.875rem] text-text-primary hover:text-primary transition duration-150 py-1"
                    >
                      • HSC Botany
                    </Link>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-border">
                    <h3 className="text-[0.75rem] font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />
                      University (Honours)
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/classes/honours-3rd-year"
                        onClick={() => setIsClassesOpen(false)}
                        className="block text-[0.875rem] text-text-primary hover:text-primary transition duration-150 py-1"
                      >
                        • Honours 3rd Year
                      </Link>
                      <Link
                        href="/classes/honours-4th-year"
                        onClick={() => setIsClassesOpen(false)}
                        className="block text-[0.875rem] text-text-primary hover:text-primary transition duration-150 py-1"
                      >
                        • Honours 4th Year
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Topics Dropdown */}
            <div className="relative" ref={topicsRef}>
              <button
                onClick={() => setIsTopicsOpen(!isTopicsOpen)}
                aria-expanded={isTopicsOpen}
                aria-controls="navbar-topics-dropdown"
                className={`flex items-center gap-1 text-[0.9375rem] font-medium transition duration-150 py-2 hover:text-primary ${
                  isTopicsOpen ? 'text-primary' : 'text-text-primary'
                }`}
              >
                Topics
                <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isTopicsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTopicsOpen && (
                <div id="navbar-topics-dropdown" className="absolute top-[48px] left-0 bg-surface border border-border rounded-xl shadow-lg p-3 min-w-[200px] flex flex-col gap-1">
                  {topics.length > 0 ? (
                    topics.map((topic) => (
                      <Link
                        key={topic.slug}
                        href={`/topics/${topic.slug}`}
                        onClick={() => setIsTopicsOpen(false)}
                        className="block text-[0.875rem] text-text-primary hover:text-primary hover:bg-primary-light transition duration-150 px-3 py-2 rounded-lg"
                      >
                        {topic.name_bn} ({topic.name_en})
                      </Link>
                    ))
                  ) : (
                    <span className="text-[0.875rem] text-text-muted px-3 py-2">No topics found</span>
                  )}
                </div>
              )}
            </div>

            {/* Other Static Links */}
            <Link
              href="/notes"
              className={`text-[0.9375rem] font-medium hover:text-primary transition duration-150 py-2 ${
                pathname === '/notes' ? 'text-primary' : 'text-text-primary'
              }`}
            >
              Notes
            </Link>
            <Link
              href="/mcq"
              className={`text-[0.9375rem] font-medium hover:text-primary transition duration-150 py-2 ${
                pathname === '/mcq' ? 'text-primary' : 'text-text-primary'
              }`}
            >
              MCQ
            </Link>
            <Link
              href="/courses"
              className={`text-[0.9375rem] font-medium hover:text-primary transition duration-150 py-2 ${
                pathname === '/courses' ? 'text-primary' : 'text-text-primary'
              }`}
            >
              Courses
            </Link>
            <Link
              href="/about"
              className={`text-[0.9375rem] font-medium hover:text-primary transition duration-150 py-2 ${
                pathname === '/about' ? 'text-primary' : 'text-text-primary'
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-[0.9375rem] font-medium hover:text-primary transition duration-150 py-2 ${
                pathname === '/contact' ? 'text-primary' : 'text-text-primary'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Action buttons (Search + Auth + Hamburger) */}
          <div className="flex items-center gap-3">
            <button
              onClick={openSearch}
              aria-label="Open search"
              className="p-2 text-text-secondary hover:text-primary transition duration-150 rounded-lg hover:bg-surface-alt min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer select-none"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Auth State */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white font-semibold text-sm hover:opacity-90 transition duration-150 focus:outline-none cursor-pointer"
                >
                  {getInitial()}
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-border text-xs text-text-secondary truncate">
                      {user.user_metadata?.full_name || user.email}
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-alt hover:text-primary transition duration-150"
                    >
                      আমার ড্যাশবোর্ড
                    </Link>
                    <button
                      onClick={async () => {
                        setIsProfileDropdownOpen(false);
                        await supabase.auth.signOut();
                        router.push('/');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 transition duration-150 cursor-pointer"
                    >
                      লগ আউট
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                // Mobile: larger touch target (py-3) + text-base to match 16px minimum that prevents iOS zoom
                className="inline-flex items-center justify-center px-5 py-3 sm:px-4 sm:py-2 text-sm sm:text-xs font-medium text-primary-dark border border-primary hover:bg-primary-light rounded-lg transition duration-150 min-h-[44px] sm:min-h-0"
              >
                লগ ইন
              </Link>
            )}

            {/* Mobile Hamburger menu */}
            <button
              ref={toggleBtnRef}
              onClick={toggleDrawer}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 text-text-primary hover:text-primary transition duration-150 rounded-lg hover:bg-surface-alt min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile Slide-in Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden flex">
          {/* Overlay — touch-action: manipulation prevents double-tap zoom on mobile */}
          <div
            onClick={toggleDrawer}
            aria-hidden="true"
            className="fixed inset-0 bg-black/40 transition-opacity duration-300 touch-action-manipulation"
            onTouchMove={(e) => e.preventDefault()}
          />

          {/* Drawer Panel — w-[85vw] scales on small phones vs tablets, max-w-[320px] prevents over-expansion, pb-6 for safe area */}
          <div className="relative flex flex-col w-[85vw] max-w-[320px] h-full bg-surface shadow-2xl transition-transform duration-300 z-10 p-5 pb-6 font-ui">
            <div className="flex items-center justify-between mb-6">
              <span className="text-primary font-bold text-lg">Menu</span>
              <button
                ref={closeBtnRef}
                onClick={toggleDrawer}
                aria-label="Close navigation menu"
                className="p-2 text-text-primary hover:text-primary active:opacity-80 transition duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-4 overflow-y-auto pr-1">
              {/* Mobile Classes Accordion */}
              <div>
                <button
                  onClick={() => setIsMobileClassesOpen(!isMobileClassesOpen)}
                  // Mobile: py-3 for minimum 44px touch target
                  className="flex items-center justify-between w-full text-base font-semibold text-text-primary py-3 text-left active:opacity-80"
                >
                  Classes
                  <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isMobileClassesOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                  // Mobile: max-h-[50vh] prevents accordion from overflowing viewport on small screens
                  className={`overflow-hidden transition-all duration-300 pl-3 border-l border-border flex flex-col gap-2 mt-1 ${
                    isMobileClassesOpen ? 'max-h-[50vh] overflow-y-auto opacity-100 py-1' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="text-[0.75rem] font-bold text-text-secondary uppercase tracking-wider mt-1">School</div>
                  <Link href="/classes/ssc-biology" className="text-sm text-text-primary py-3 block active:opacity-80">SSC Biology</Link>

                  <div className="text-[0.75rem] font-bold text-text-secondary uppercase tracking-wider mt-1">College</div>
                  <Link href="/classes/hsc-zoology" className="text-sm text-text-primary py-3 block active:opacity-80">HSC Zoology</Link>
                  <Link href="/classes/hsc-botany" className="text-sm text-text-primary py-3 block active:opacity-80">HSC Botany</Link>

                  <div className="text-[0.75rem] font-bold text-text-secondary uppercase tracking-wider mt-1">University</div>
                  <Link href="/classes/honours-3rd-year" className="text-sm text-text-primary py-3 block active:opacity-80">Honours 3rd Year</Link>
                  <Link href="/classes/honours-4th-year" className="text-sm text-text-primary py-3 block active:opacity-80">Honours 4th Year</Link>
                </div>
              </div>

              {/* Mobile Topics Accordion */}
              <div>
                <button
                  onClick={() => setIsMobileTopicsOpen(!isMobileTopicsOpen)}
                  // Mobile: py-3 for minimum 44px touch target
                  className="flex items-center justify-between w-full text-base font-semibold text-text-primary py-3 text-left active:opacity-80"
                >
                  Topics
                  <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isMobileTopicsOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                  // Mobile: max-h-[50vh] prevents accordion from overflowing viewport on small screens
                  className={`overflow-hidden transition-all duration-300 pl-3 border-l border-border flex flex-col gap-2 mt-1 ${
                    isMobileTopicsOpen ? 'max-h-[50vh] overflow-y-auto opacity-100 py-1' : 'max-h-0 opacity-0'
                  }`}
                >
                  {topics.length > 0 ? (
                    topics.map((topic) => (
                      <Link key={topic.slug} href={`/topics/${topic.slug}`} className="text-sm text-text-primary py-3 block active:opacity-80">
                        {topic.name_bn}
                      </Link>
                    ))
                  ) : (
                    // Mobile: visually distinct no-topics message with background and padding
                    <span className="text-xs text-text-muted bg-surface-alt px-3 py-2 rounded-lg text-center">No topics available</span>
                  )}
                </div>
              </div>

              {/* Other links */}
              <Link href="/notes" className="text-base font-semibold text-text-primary py-3 block active:opacity-80">
                Notes
              </Link>
              <Link href="/mcq" className="text-base font-semibold text-text-primary py-3 block active:opacity-80">
                MCQ
              </Link>
              <Link href="/courses" className="text-base font-semibold text-text-primary py-3 block active:opacity-80">
                Courses
              </Link>
              <Link href="/about" className="text-base font-semibold text-text-primary py-3 block active:opacity-80">
                About
              </Link>
              <Link href="/contact" className="text-base font-semibold text-text-primary py-3 block active:opacity-80">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
