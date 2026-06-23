import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Search } from 'lucide-react';
import Container from './ui/Container';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [classesOpen, setClassesOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setClassesOpen(false);
    setTopicsOpen(false);
  }, [location]);

  // Handle sticky shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full bg-surface border-b transition-all duration-200 ${isScrolled ? 'shadow-sm border-border' : 'border-transparent'}`}>
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/favicon.png" 
              alt="Santo Sir Logo" 
              className="w-8 h-8 rounded-full object-cover border border-primary/20"
            />
            <span className="text-xl font-display font-bold text-primary tracking-tight">
              Santo Sir Bio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-text-secondary font-sans">
            <Link to="/" className="hover:text-primary transition-colors duration-200">
              Home
            </Link>

            {/* Classes Dropdown */}
            <div className="relative group">
              <button 
                onClick={() => setClassesOpen(!classesOpen)}
                onBlur={() => setTimeout(() => setClassesOpen(false), 200)}
                className="flex items-center gap-1 hover:text-primary transition-colors duration-200 py-2 cursor-pointer"
                aria-expanded={classesOpen}
                aria-haspopup="menu"
                aria-controls="classes-menu"
                id="classes-menu-btn"
              >
                Classes
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" aria-hidden="true" />
              </button>
              
              <div id="classes-menu" role="menu" aria-labelledby="classes-menu-btn" className="absolute top-full left-0 mt-1 w-64 bg-surface border border-border rounded-xl shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="grid gap-3">
                  <div>
                    <h5 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">School Level</h5>
                    <Link to="/classes/ssc-biology" className="block text-sm text-text-primary hover:text-primary py-1">SSC Biology</Link>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">College Level</h5>
                    <Link to="/classes/hsc-zoology" className="block text-sm text-text-primary hover:text-primary py-1">HSC Zoology</Link>
                    <Link to="/classes/hsc-botany" className="block text-sm text-text-primary hover:text-primary py-1">HSC Botany</Link>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">University Level</h5>
                    <Link to="/classes/honours" className="block text-sm text-text-primary hover:text-primary py-1">Honours (Zoology)</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Topics Dropdown */}
            <div className="relative group">
              <button 
                onClick={() => setTopicsOpen(!topicsOpen)}
                onBlur={() => setTimeout(() => setTopicsOpen(false), 200)}
                className="flex items-center gap-1 hover:text-primary transition-colors duration-200 py-2 cursor-pointer"
                aria-expanded={topicsOpen}
                aria-haspopup="menu"
                aria-controls="topics-menu"
                id="topics-menu-btn"
              >
                Topics
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" aria-hidden="true" />
              </button>
              
              <div id="topics-menu" role="menu" aria-labelledby="topics-menu-btn" className="absolute top-full left-0 mt-1 w-48 bg-surface border border-border rounded-xl shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link to="/topics/genetics" className="block text-sm text-text-primary hover:bg-primary-light hover:text-primary px-3 py-2 rounded-lg">Genetics</Link>
                <Link to="/topics/cell-biology" className="block text-sm text-text-primary hover:bg-primary-light hover:text-primary px-3 py-2 rounded-lg">Cell Biology</Link>
                <Link to="/topics/physiology" className="block text-sm text-text-primary hover:bg-primary-light hover:text-primary px-3 py-2 rounded-lg">Physiology</Link>
                <Link to="/topics/microbiology" className="block text-sm text-text-primary hover:bg-primary-light hover:text-primary px-3 py-2 rounded-lg">Microbiology</Link>
              </div>
            </div>

            <Link to="/notes" className="hover:text-primary transition-colors duration-200">
              Notes
            </Link>
            <Link to="/mcq" className="hover:text-primary transition-colors duration-200">
              MCQ
            </Link>
            <Link to="/courses" className="hover:text-primary transition-colors duration-200">
              Courses
            </Link>
            <Link to="/about" className="hover:text-primary transition-colors duration-200">
              About
            </Link>
          </nav>

          {/* Right Section Tools */}
          <div className="flex items-center gap-4">
            <Link 
              to="/search" 
              className="text-text-secondary hover:text-primary transition-colors duration-200 p-2 rounded-full hover:bg-surface-alt"
              aria-label="Search articles"
            >
              <Search size={20} aria-hidden="true" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-text-secondary hover:text-primary p-2 rounded-full hover:bg-surface-alt"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/25 backdrop-blur-xs transition-opacity" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-surface p-6 shadow-xl flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src="/favicon.png" 
                  alt="Santo Sir Logo" 
                  className="w-8 h-8 rounded-full object-cover border border-primary/20"
                />
                <span className="text-xl font-display font-bold text-primary">Santo Sir Bio</span>
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-text-secondary hover:text-primary p-1 rounded-full hover:bg-surface-alt"
                aria-label="Close mobile menu"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <nav className="flex flex-col gap-4 font-sans text-base font-semibold text-text-secondary overflow-y-auto max-h-[calc(100vh-120px)]">
              <Link to="/" className="hover:text-primary py-1">Home</Link>
              
              {/* Classes Accordion */}
              <div>
                <button 
                  onClick={() => setClassesOpen(!classesOpen)}
                  className="flex items-center justify-between w-full hover:text-primary py-1 text-left"
                  aria-expanded={classesOpen}
                  aria-controls="mobile-classes-menu"
                >
                  Classes
                  <ChevronDown size={16} className={`transition-transform duration-200 ${classesOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {classesOpen && (
                  <div id="mobile-classes-menu" className="pl-4 mt-2 flex flex-col gap-2 border-l border-border text-sm font-medium">
                    <Link to="/classes/ssc-biology" className="hover:text-primary py-1">SSC Biology</Link>
                    <Link to="/classes/hsc-zoology" className="hover:text-primary py-1">HSC Zoology</Link>
                    <Link to="/classes/hsc-botany" className="hover:text-primary py-1">HSC Botany</Link>
                    <Link to="/classes/honours" className="hover:text-primary py-1">Honours</Link>
                  </div>
                )}
              </div>

              {/* Topics Accordion */}
              <div>
                <button 
                  onClick={() => setTopicsOpen(!topicsOpen)}
                  className="flex items-center justify-between w-full hover:text-primary py-1 text-left"
                  aria-expanded={topicsOpen}
                  aria-controls="mobile-topics-menu"
                >
                  Topics
                  <ChevronDown size={16} className={`transition-transform duration-200 ${topicsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {topicsOpen && (
                  <div id="mobile-topics-menu" className="pl-4 mt-2 flex flex-col gap-2 border-l border-border text-sm font-medium">
                    <Link to="/topics/genetics" className="hover:text-primary py-1">Genetics</Link>
                    <Link to="/topics/cell-biology" className="hover:text-primary py-1">Cell Biology</Link>
                    <Link to="/topics/physiology" className="hover:text-primary py-1">Physiology</Link>
                    <Link to="/topics/microbiology" className="hover:text-primary py-1">Microbiology</Link>
                  </div>
                )}
              </div>

              <Link to="/notes" className="hover:text-primary py-1">Notes</Link>
              <Link to="/mcq" className="hover:text-primary py-1">MCQ</Link>
              <Link to="/courses" className="hover:text-primary py-1">Courses</Link>
              <Link to="/about" className="hover:text-primary py-1">About</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
