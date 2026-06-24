export function articleSchema(post: {
  title: string;
  excerpt: string | null;
  published_at: string | null;
  updated_at: string | null;
  slug: string;
  topicSlug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    datePublished: post.published_at,
    dateModified: post.updated_at ?? post.published_at,
    author: {
      '@type': 'Person',
      name: 'Santo Sir',
      url: 'https://biologywithsantosir.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BiologywithSantosir',
      url: 'https://biologywithsantosir.com',
    },
    url: `https://biologywithsantosir.com/topics/${post.topicSlug}/${post.slug}`,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
