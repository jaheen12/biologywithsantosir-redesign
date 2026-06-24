'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard,
  Users,
  GraduationCap,
  CheckSquare,
  CreditCard,
  PlusCircle,
  CheckCircle,
  BookOpen,
  Calendar,
  FileText,
  Award,
  Trophy,
  Megaphone,
  Shield,
  Menu,
  X,
  LogOut,
  ArrowLeft,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navigationGroups = [
  {
    title: '👥 শিক্ষার্থী',
    items: [
      { label: 'শিক্ষার্থী তালিকা', path: '/admin/students', icon: Users },
      { label: 'ভর্তি ব্যবস্থাপনা', path: '/admin/enrollments', icon: GraduationCap },
      { label: 'উপস্থিতি', path: '/admin/attendance', icon: CheckSquare },
    ]
  },
  {
    title: '💰 পেমেন্ট',
    items: [
      { label: 'পেমেন্ট লেজার', path: '/admin/payments', icon: CreditCard },
      { label: 'নতুন পেমেন্ট', path: '/admin/payments/new', icon: PlusCircle },
      { label: 'bKash যাচাই', path: '/admin/payments/reconcile', icon: CheckCircle },
    ]
  },
  {
    title: '🏫 ব্যাচ ও কোর্স',
    items: [
      { label: 'ব্যাচ ব্যবস্থাপনা', path: '/admin/batches', icon: BookOpen },
      { label: 'রুটিন', path: '/admin/routine', icon: Calendar },
    ]
  },
  {
    title: '📝 পরীক্ষা',
    items: [
      { label: 'পরীক্ষা পরিচালনা', path: '/admin/exams', icon: FileText },
      { label: 'ফলাফল প্রবেশ', path: '/admin/results', icon: Award },
      { label: 'র‍্যাংকিং', path: '/admin/leaderboard', icon: Trophy },
    ]
  },
  {
    title: '📢 অন্যান্য',
    items: [
      { label: 'নোটিশ বোর্ড', path: '/admin/announcements', icon: Megaphone },
      { label: 'রোল ব্যবস্থাপনা', path: '/admin/roles', icon: Shield },
    ]
  }
];

interface AdminSidebarProps {
  fullName: string;
}

export default function AdminSidebar({ fullName }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Mobile sidebar focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // Escape key closes mobile sidebar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-expand group of active page on load / pathname change
  React.useEffect(() => {
    navigationGroups.forEach((group) => {
      const hasActiveItem = group.items.some(item => pathname === item.path);
      if (hasActiveItem) {
        setExpandedGroups(prev => ({
          ...prev,
          [group.title]: true
        }));
      }
    });
  }, [pathname]);

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: prev[title] !== false ? false : true
    }));
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between bg-surface border-b border-border px-4 py-3 sticky top-0 z-40 h-[56px] w-full">
        <Link href="/admin" className="flex items-center gap-2 text-primary font-bold font-ui">
          <Shield className="w-6 h-6" />
          <span>এডমিন প্যানেল</span>
        </Link>
        <button
          ref={toggleBtnRef}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="p-2 text-text-primary hover:text-primary transition duration-150 rounded-lg hover:bg-surface-alt min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-surface border-r border-border flex flex-col z-35 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 pt-[56px] lg:pt-0' : '-translate-x-full'
        }`}
      >
        {/* Header (Desktop) */}
        <div className="hidden lg:block border-b border-border">
          <Link href="/admin" className="flex items-center gap-2 px-6 py-4 hover:opacity-85 transition-opacity">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-base text-primary font-ui">এডমিন প্যানেল</span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-5 overflow-y-auto font-ui scrollbar-thin">
          {/* Dashboard Home Link */}
          <div>
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-150 ${
                pathname === '/admin'
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-surface-alt hover:text-primary'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 ${pathname === '/admin' ? 'text-primary' : 'text-text-muted'}`} />
              <span>ড্যাশবোর্ড হোম</span>
            </Link>
          </div>

          {/* Grouped Links */}
          {navigationGroups.map((group) => {
            const isExpanded = expandedGroups[group.title] !== false;
            return (
              <div key={group.title} className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center justify-between px-4 py-1 text-xs font-bold text-text-muted hover:text-primary uppercase tracking-wider transition-colors text-left cursor-pointer group/btn"
                >
                  <span>{group.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover/btn:text-primary transition-colors" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover/btn:text-primary transition-colors" />
                  )}
                </button>
                {isExpanded && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition duration-150 ${
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-text-secondary hover:bg-surface-alt hover:text-primary'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Spacer */}
          <div className="h-4"></div>

          {/* Action Links */}
          <div className="pt-4 border-t border-border/50 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface-alt hover:text-primary transition duration-150"
            >
              <ArrowLeft className="w-4 h-4 text-text-muted" />
              <span>ছাত্র প্যানেলে ফিরুন</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-error hover:bg-error/10 transition duration-150 cursor-pointer text-left w-full"
            >
              <LogOut className="w-4 h-4 text-error" />
              <span>লগ আউট</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
