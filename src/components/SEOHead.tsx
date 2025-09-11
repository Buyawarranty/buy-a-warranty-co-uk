import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

export const SEOHead = ({
  title = "Car Warranty Prices | Affordable UK Vehicle Warranties",
  description = "Compare our car warranty prices and choose the perfect plan for your vehicle. Flexible, affordable UK coverage with no hidden fees. Instant online quotes available.",
  keywords = "car warranty, vehicle warranty, UK warranty, car insurance, breakdown cover, warranty prices",
  ogTitle,
  ogDescription,
  ogImage = "https://lovable.dev/opengraph-image-p98pqg.png",
  canonical
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      
      if (meta) {
        meta.content = content;
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', ogTitle || title, true);
    updateMetaTag('og:description', ogDescription || description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:type', 'website', true);

    // Twitter tags
    updateMetaTag('twitter:title', ogTitle || title);
    updateMetaTag('twitter:description', ogDescription || description);
    updateMetaTag('twitter:image', ogImage);

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (link) {
        link.href = canonical;
      } else {
        link = document.createElement('link');
        link.rel = 'canonical';
        link.href = canonical;
        document.head.appendChild(link);
      }
    }

    // Viewport meta tag (ensure it exists)
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(viewport);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical]);

  return null;
};