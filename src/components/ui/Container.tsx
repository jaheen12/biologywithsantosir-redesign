import React, { HTMLAttributes } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {}

export function Container({
  children,
  className = '',
  ...props
}: ContainerProps) {
  return (
    <div
      className={`max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 w-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
