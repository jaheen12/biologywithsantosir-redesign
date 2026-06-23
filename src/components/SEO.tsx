import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  url?: string;
  type?: string;
  image?: string;
  schema?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  url = window.location.href,
  type = 'website',
  image = 'https://biologywithsantosir.com/favicon.png',
  schema,
}) => {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = `${title} | Biology with Santo Sir`;
    document.title = fullTitle;

    // Helper to update or create meta tags
    const updateMetaTag = (propertyOrName: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${propertyOrName}"]`);
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, propertyOrName);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // 2. Update Standard Meta Tags
    updateMetaTag('description', description);

    // 3. Update Open Graph Tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:image', image, true);

    // 4. Update Twitter Card Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // 5. Update/Create JSON-LD Schema
    let schemaScript = document.getElementById('seo-schema') as HTMLScriptElement;
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'seo-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.text = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }

    return () => {
      // Cleanup schema script on unmount
      const existingScript = document.getElementById('seo-schema');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [title, description, url, type, image, schema]);

  return null; // Side-effect only
};

export default SEO;
