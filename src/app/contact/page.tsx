'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, Send, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';
import { Container } from '@/components/ui/Container';

const Facebook = (props: React.SVGProps<SVGSVGElement> & { size?: number }) => {
  const { size = 24, ...rest } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
};

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  return (
    <main className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.8125rem] text-text-secondary mb-6 font-semibold">
          <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight size={14} className="text-text-muted" />
          <span className="text-text-primary">যোগাযোগ</span>
        </nav>

        {/* Page Header */}
        <div className="mb-12 max-w-2xl">
          <span className="text-[0.75rem] font-bold text-primary uppercase tracking-wider bg-primary-light px-2.5 py-1 rounded-md mb-3 inline-block">
            সাপোর্ট ও যোগাযোগ
          </span>
          <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-text-primary leading-tight mb-4">
            সান্তো স্যারের সাথে যোগাযোগ করুন
          </h1>
          <p className="text-[1rem] leading-relaxed text-text-secondary">
            আপনার কোনো প্রশ্ন, টিউটরিং জিজ্ঞাসা, প্রিমিয়াম ব্যাচ সংক্রান্ত মতামত অথবা ওয়েবসাইট নিয়ে কোনো পরামর্শ থাকলে সরাসরি যোগাযোগ করুন।
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Contact Info Info Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h2 className="text-[1.25rem] font-bold text-text-primary mb-2 flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              সরাসরি যোগাযোগ মাধ্যম
            </h2>

            {/* Email Card */}
            <div className="p-5 border border-border rounded-xl bg-surface-alt flex gap-4">
              <div className="p-3 bg-primary-light text-primary rounded-xl h-fit">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-[0.9375rem] font-bold text-text-primary mb-1">ইমেইল করুন</h3>
                <a
                  href="mailto:santo@biologywithsantosir.com"
                  className="text-[0.875rem] text-primary hover:underline font-semibold"
                >
                  santo@biologywithsantosir.com
                </a>
                <p className="text-[0.8125rem] text-text-muted mt-1">যেকোনো একাডেমিক ও টেকনিক্যাল সাপোর্ট</p>
              </div>
            </div>

            {/* Phone Card */}
            <div className="p-5 border border-border rounded-xl bg-surface-alt flex gap-4">
              <div className="p-3 bg-primary-light text-primary rounded-xl h-fit">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-[0.9375rem] font-bold text-text-primary mb-1">মোবাইল ও হোয়াটস্যাপ</h3>
                <span className="text-[0.875rem] text-text-primary font-semibold block">
                  +880 1700-000000
                </span>
                <p className="text-[0.8125rem] text-text-muted mt-1">সকাল ১০টা থেকে রাত ৮টা (শুক্রবার অফ)</p>
              </div>
            </div>

            {/* Social Media Card */}
            <div className="p-5 border border-border rounded-xl bg-surface-alt flex gap-4">
              <div className="p-3 bg-primary-light text-primary rounded-xl h-fit">
                <Facebook size={24} />
              </div>
              <div>
                <h3 className="text-[0.9375rem] font-bold text-text-primary mb-1">সোশ্যাল মিডিয়া পেজ</h3>
                <a
                  href="https://facebook.com/biologywithsantosir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.875rem] text-primary hover:underline font-semibold block mb-1"
                >
                  facebook.com/biologywithsantosir
                </a>
                <a
                  href="https://facebook.com/groups/biologywithsantosir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.875rem] text-primary hover:underline font-semibold block"
                >
                  ফেসবুক গ্রুপ (Biology with Santo Sir)
                </a>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 flex flex-col items-center">
                <CheckCircle2 size={56} className="text-primary mb-4 animate-bounce" />
                <h3 className="text-[1.375rem] font-bold text-text-primary mb-2">মেসেজটি সফলভাবে পাঠানো হয়েছে!</h3>
                <p className="text-[0.9375rem] text-text-secondary leading-relaxed max-w-sm mb-6">
                  সান্তো স্যার আপনার বার্তাটি পেয়েছেন। খুব শীঘ্রই আপনার দেওয়া ইমেইলে যোগাযোগ করা হবে।
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-[0.875rem] font-bold rounded-lg transition"
                >
                  আরেকটি বার্তা পাঠান
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h2 className="text-[1.25rem] font-bold text-text-primary">একটি বার্তা লিখুন</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-[0.8125rem] font-bold text-text-primary">
                      আপনার নাম <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="উদাঃ আবির রহমান"
                      className="p-3 border border-border rounded-lg outline-none focus:border-primary transition text-[0.9375rem] text-text-primary"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-[0.8125rem] font-bold text-text-primary">
                      ইমেইল ঠিকানা <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="username@email.com"
                      className="p-3 border border-border rounded-lg outline-none focus:border-primary transition text-[0.9375rem] text-text-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="subject" className="text-[0.8125rem] font-bold text-text-primary">
                    বিষয়
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="উদাঃ প্রিমিয়াম ব্যাচে ভর্তি বা সাধারণ প্রশ্ন"
                    className="p-3 border border-border rounded-lg outline-none focus:border-primary transition text-[0.9375rem] text-text-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-[0.8125rem] font-bold text-text-primary">
                    আপনার বার্তা <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="এখানে আপনার মেসেজটি বিস্তারিত লিখুন..."
                    className="p-3 border border-border rounded-lg outline-none focus:border-primary transition text-[0.9375rem] text-text-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 text-center text-[0.9375rem] font-bold text-white bg-primary hover:bg-primary-dark disabled:bg-primary/50 transition duration-150 py-3 rounded-lg w-full mt-2"
                >
                  {loading ? 'পাঠানো হচ্ছে...' : 'মেসেজ পাঠান'}
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
