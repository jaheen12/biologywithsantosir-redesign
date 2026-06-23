import React from 'react';
import { Link } from 'react-router-dom';
import Container from './ui/Container';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-alt border-t border-border mt-16 font-sans">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img 
                src="/favicon.png" 
                alt="Santo Sir Logo" 
                className="w-8 h-8 rounded-full object-cover border border-primary/20"
              />
              <span className="text-xl font-display font-bold text-primary">Santo Sir Bio</span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
              জীববিজ্ঞান শেখো সহজভাবে, বুঝে বুঝে। এসএসসি, এইচএসসি এবং অনার্স পর্যায়ের জীববিজ্ঞান পাঠ্যক্রমের সহায়িকা।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">রিসোর্স</h4>
            <ul className="space-y-2 text-sm text-text-secondary font-medium">
              <li>
                <Link to="/notes" className="hover:text-primary transition-colors">ফ্রি পিডিএফ নোটস</Link>
              </li>
              <li>
                <Link to="/mcq" className="hover:text-primary transition-colors">MCQ অনুশীলন</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-primary transition-colors">পেইড কোর্সসমূহ</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">যোগাযোগ ও সাহায্য</h4>
            <ul className="space-y-2 text-sm text-text-secondary font-medium">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">শিক্ষক পরিচিতি</Link>
              </li>
              <li>
                <a href="mailto:contact@biologywithsantosir.com" className="hover:text-primary transition-colors">contact@biologywithsantosir.com</a>
              </li>
              <li>
                <span className="text-text-muted">ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-text-muted gap-4">
          <p>© 2026 BiologywithSantosir.com. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://facebook.com" className="hover:text-primary">Facebook Group</a>
            <span>•</span>
            <a href="https://youtube.com" className="hover:text-primary">YouTube</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
