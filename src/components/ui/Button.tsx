import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClass = 'inline-flex items-center justify-center font-medium rounded-lg transition duration-150 ease-in-out min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-ui';

  let variantClass = '';
  switch (variant) {
    case 'primary':
      variantClass = 'bg-primary text-white hover:bg-primary-dark shadow-sm';
      break;
    case 'secondary':
      variantClass = 'bg-primary-light text-primary hover:bg-primary-mid hover:text-white';
      break;
    case 'outline':
      variantClass = 'border border-primary text-primary hover:bg-primary-light bg-transparent';
      break;
  }

  let sizeClass = '';
  switch (size) {
    case 'sm':
      sizeClass = 'px-3 py-1.5 text-[0.75rem]'; // min text size constraint (badge size)
      break;
    case 'md':
      sizeClass = 'px-4 py-2 text-[0.875rem]';
      break;
    case 'lg':
      sizeClass = 'px-6 py-3 text-[1rem]';
      break;
  }

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
