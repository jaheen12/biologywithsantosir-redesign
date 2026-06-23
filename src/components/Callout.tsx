import React from 'react';

interface CalloutProps {
  title?: string;
  children: React.ReactNode;
}

const Callout: React.FC<CalloutProps> = ({ title = '💡 সংজ্ঞা', children }) => {
  return (
    <div className="my-6 p-5 bg-[#FFF8E8] border-l-4 border-accent rounded-r-lg shadow-sm">
      {title && (
        <h4 className="text-sm uppercase tracking-wider font-bold text-accent mb-2 font-sans">
          {title}
        </h4>
      )}
      <div className="text-text-primary text-base leading-relaxed font-sans">
        {children}
      </div>
    </div>
  );
};

export default Callout;
