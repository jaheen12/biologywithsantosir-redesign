'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface PublicLayoutWrapperProps {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
  searchModal: React.ReactNode;
}

export default function PublicLayoutWrapper({
  children,
  navbar,
  footer,
  searchModal,
}: PublicLayoutWrapperProps) {
  const pathname = usePathname() || '';
  const isDashboardOrAdmin = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (isDashboardOrAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      <div className="flex-grow">
        {children}
      </div>
      {footer}
      {searchModal}
    </>
  );
}
