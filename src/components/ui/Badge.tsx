import React from 'react';

interface BadgeProps {
  variant?: 'ssc' | 'hsc' | 'honours' | 'default';
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '' }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold uppercase tracking-wider font-sans';

  const variantStyles = {
    ssc: 'bg-[#E3F2FD] text-[#1565C0]',
    hsc: 'bg-primary-light text-primary',
    honours: 'bg-[#F3E5F5] text-[#6A1B9A]',
    default: 'bg-primary-light text-primary',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
