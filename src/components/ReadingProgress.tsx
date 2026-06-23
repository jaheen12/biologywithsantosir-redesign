import React, { useState, useEffect } from 'react';

const ReadingProgress: React.FC = () => {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          // Calculate scrollable height of the article container specifically,
          // or fallback to docHeight.
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          setScrollPercent(Math.min(pct, 100));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to handle initial load position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="sticky top-16 left-0 w-full h-[14px] bg-[#E8F5F0]/30 z-40 border-b border-border/20 backdrop-blur-xs"
      aria-hidden="true"
    >
      <svg className="w-full h-full">
        <defs>
          <pattern id="lipid-bilayer" width="8" height="14" patternUnits="userSpaceOnUse">
            {/* Top row hydrophilic heads */}
            <circle cx="4" cy="2.5" r="1.5" fill="#1A7A5E" />
            {/* Bottom row hydrophilic heads */}
            <circle cx="4" cy="11.5" r="1.5" fill="#1A7A5E" />
            {/* Hydrophobic fatty acid tails */}
            <path d="M 4 4 Q 2.5 7 4 10" fill="none" stroke="#2EA87A" strokeWidth="0.6" />
            <path d="M 4 4 Q 5.5 7 4 10" fill="none" stroke="#2EA87A" strokeWidth="0.6" />
          </pattern>
        </defs>
        {/* Draw the filled progress indicator using the lipid bilayer pattern */}
        <rect 
          x="0" 
          y="0" 
          width={`${scrollPercent}%`} 
          height="14" 
          fill="url(#lipid-bilayer)"
        />
      </svg>
    </div>
  );
};

export default ReadingProgress;
