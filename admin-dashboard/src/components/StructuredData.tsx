import React from "react";
import { Helmet } from "react-helmet-async";
import { STRUCTURED_DATA } from "../seo/metadata";

interface StructuredDataProps {
  type?: "organization" | "service" | "mobileApp" | "faq" | "all";
  customData?: Record<string, unknown>;
}

const StructuredData: React.FC<StructuredDataProps> = ({
  type = "all",
  customData,
}) => {
  const getStructuredData = () => {
    const scripts: string[] = [];

    if (type === "all" || type === "organization") {
      scripts.push(JSON.stringify(STRUCTURED_DATA.organization));
    }

    if (type === "all" || type === "service") {
      scripts.push(JSON.stringify(STRUCTURED_DATA.service));
    }

    if (type === "all" || type === "mobileApp") {
      scripts.push(JSON.stringify(STRUCTURED_DATA.mobileApp));
    }

    if (type === "faq") {
      scripts.push(JSON.stringify(STRUCTURED_DATA.faq));
    }

    if (customData) {
      scripts.push(JSON.stringify(customData));
    }

    return scripts;
  };

  return (
    <Helmet>
      {getStructuredData().map((script, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: script }}
        />
      ))}
    </Helmet>
  );
};

// مكون خاص للمنتجات
export const ProductStructuredData: React.FC<{
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  availability: "InStock" | "OutOfStock";
  rating?: number;
  reviewCount?: number;
}> = ({
  name,
  description,
  price,
  currency,
  image,
  availability,
  rating,
  reviewCount,
}) => {
  const productData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: name,
    description: description,
    image: image,
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      seller: {
        "@type": "Organization",
        name: "بثواني",
      },
    },
    ...(rating &&
      reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating,
          reviewCount: reviewCount,
        },
      }),
  };

  return <StructuredData customData={productData} />;
};

// مكون خاص للمطاعم
export const RestaurantStructuredData: React.FC<{
  name: string;
  description: string;
  image: string;
  address: string;
  phone: string;
  cuisine: string[];
  priceRange: string;
  rating?: number;
  reviewCount?: number;
}> = ({
  name,
  description,
  image,
  address,
  phone,
  cuisine,
  priceRange,
  rating,
  reviewCount,
}) => {
  const restaurantData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: name,
    description: description,
    image: image,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressCountry: "YE",
    },
    telephone: phone,
    servesCuisine: cuisine,
    priceRange: priceRange,
    hasMenu: {
      "@type": "Menu",
      hasMenuItem: [],
    },
    ...(rating &&
      reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating,
          reviewCount: reviewCount,
        },
      }),
  };

  return <StructuredData customData={restaurantData} />;
};

export default StructuredData;
