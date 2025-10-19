import { useEffect } from 'react';

interface OrganizationSchemaProps {
  type?: 'Organization' | 'LocalBusiness' | 'InsuranceAgency';
}

export const OrganizationSchema = ({ type = 'LocalBusiness' }: OrganizationSchemaProps) => {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": type,
      "name": "Buy A Warranty",
      "description": "UK's leading car warranty provider offering flexible, affordable vehicle protection with instant quotes and no hidden fees.",
      "url": "https://buyawarranty.co.uk",
      "logo": "https://buyawarranty.co.uk/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png",
      "image": "https://buyawarranty.co.uk/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png",
      "telephone": "+443302295040",
      "email": "support@buyawarranty.co.uk",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "GB",
        "addressRegion": "United Kingdom"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+443302295040",
        "email": "support@buyawarranty.co.uk",
        "contactType": "customer service",
        "availableLanguage": "English",
        "areaServed": "GB"
      },
      "sameAs": [
        "https://uk.trustpilot.com/review/buyawarranty.co.uk"
      ],
      "priceRange": "££",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "reviewCount": "100+",
        "bestRating": "5",
        "worstRating": "1"
      },
      "areaServed": {
        "@type": "Country",
        "name": "United Kingdom"
      },
      "knowsAbout": [
        "Car Warranty",
        "Vehicle Warranty",
        "Extended Warranty",
        "Used Car Warranty",
        "Van Warranty",
        "EV Warranty",
        "Motorbike Warranty"
      ],
      "slogan": "Warranty that works when your car doesn't",
      "foundingDate": "2020",
      "makesOffer": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Car Warranty",
            "description": "Comprehensive car warranty coverage for UK vehicles"
          }
        }
      ]
    };

    const scriptId = 'organization-schema';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (script) {
      script.textContent = JSON.stringify(schema);
    } else {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [type]);

  return null;
};
