import React, { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'topic' | 'ssc' | 'hsc' | 'honours';
}

export function Badge({
  variant = 'topic',
  children,
  className = '',
  ...props
}: BadgeProps) {
  const baseClass = 'inline-flex items-center px-2.5 py-1 text-[0.75rem] font-bold font-ui uppercase tracking-wide';

  let variantClass = '';
  switch (variant) {
    case 'topic':
      variantClass = 'bg-primary-light text-primary rounded-full';
      break;
    case 'ssc':
      variantClass = 'bg-[#E3F2FD] text-[#1565C0] rounded-md';
      break;
    case 'hsc':
      variantClass = 'bg-[#E8F5F0] text-[#1A7A5E] rounded-md';
      break;
    case 'honours':
      variantClass = 'bg-[#F3E5F5] text-[#6A1B9A] rounded-md';
      break;
  }

  return (
    <span
      className={`${baseClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
