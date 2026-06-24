'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  CreditCard, 
  Calendar, 
  ClipboardList, 
  Award, 
  Trophy, 
  CheckSquare, 
  User, 
  Menu, 
  X,
  LogOut,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  profile: any;
  paymentStatus: string | null;
}

export default function Sidebar({ profile, paymentStatus }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
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

  const hasPaymentDue = paymentStatus && paymentStatus !== 'paid';

  const menuItems = [
    { label: 'ড্যাশবোর্ড', path: '/dashboard', icon: Home },
    { label: 'ফি ও পেমেন্ট', path: '/dashboard/payments', icon: CreditCard, badge: hasPaymentDue },
    { label: 'রুটিন', path: '/dashboard/routine', icon: Calendar },
    { label: 'পরীক্ষা', path: '/dashboard/exams', icon: ClipboardList },
    { label: 'ফলাফল', path: '/dashboard/results', icon: Award },
    { label: 'র‍্যাংকিং', path: '/dashboard/leaderboard', icon: Trophy },
    { label: 'উপস্থিতি', path: '/dashboard/attendance', icon: CheckSquare },
    { label: 'প্রোফাইল', path: '/dashboard/profile', icon: User },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between bg-surface border-b border-border px-4 py-3 sticky top-0 z-40 h-[56px] w-full">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold font-ui">
          <GraduationCap className="w-6 h-6" />
          <span>প্যানেল</span>
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
          className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-surface border-r border-border flex flex-col z-35 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0 pt-[56px] md:pt-0' : '-translate-x-full'
        }`}
      >
        {/* Header (Desktop) */}
        <Link href="/" className="hidden md:flex items-center gap-2 px-6 py-5 border-b border-border hover:opacity-85 transition-opacity">
          <GraduationCap className="w-7 h-7 text-primary" />
          <span className="font-bold text-lg text-primary font-ui">ছাত্র প্যানেল</span>
        </Link>



        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto font-ui">
          {!profile?.batch_id && profile?.role !== 'admin' ? (
            <div className="px-4 py-3 bg-accent-light text-accent text-xs rounded-xl font-medium">
              আপনি এখনো কোনো ব্যাচে ভর্তি হননি
            </div>
          ) : (
            menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                    isActive
                      ? 'bg-primary text-white font-semibold'
                      : 'text-text-secondary hover:bg-surface-alt hover:text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-primary'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-2.5 h-2.5 rounded-full bg-error ring-4 ring-surface" />
                  )}
                </Link>
              );
            })
          )}
        </nav>

        {/* Footer / Logout */}
        <div className="px-5 py-3.5 border-t border-border font-ui flex flex-col gap-2 bg-surface-alt/30">
          <Link
            href="/"
            className="flex items-center gap-2.5 py-1 text-xs font-medium text-text-secondary hover:text-primary transition duration-150"
          >
            <ArrowLeft className="w-4 h-4 text-text-muted" />
            <span>ওয়েবসাইটে ফিরুন</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 py-1 text-xs font-medium text-error hover:text-error transition duration-150 cursor-pointer text-left w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>লগ আউট</span>
          </button>
        </div>
      </aside>
    </>
  );
}
