import React, { ReactNode } from 'react';

export interface CalloutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Callout({ children, title = 'সংজ্ঞা', className = '' }: CalloutProps) {
  return (
    <div className={`p-5 my-6 bg-[#FFF8E8] border-l-4 border-accent rounded-r-lg font-ui ${className}`}>
      {title && (
        <h4 className="text-[0.9375rem] font-bold text-text-primary mb-2 flex items-center gap-1.5">
          <span role="img" aria-label="bulb">💡</span> {title}
        </h4>
      )}
      <div className="text-[1rem] leading-relaxed text-text-primary">
        {children}
      </div>
    </div>
  );
}
