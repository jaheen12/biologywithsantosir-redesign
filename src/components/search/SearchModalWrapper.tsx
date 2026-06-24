'use client';

import dynamic from 'next/dynamic';

const SearchModal = dynamic(() => import('@/components/search/SearchModal'), { ssr: false });

export default function SearchModalWrapper() {
  return <SearchModal />;
}
