import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BRAND } from '../landing/brand';
import { DEFAULT_META, type SEOPage } from '../seo/metadata';

interface SEOHeadProps extends Partial<SEOPage> {
  children?: React.ReactNode;
}

const SEOHead: React.FC<SEOHeadProps> = ({ 
  title, 
  description, 
  keywords = [], 
  canonical, 
  ogImage,
  noindex = false,
  children 
}) => {
  const fullTitle = title ? `${title} | ${BRAND.nameAr}` : `${BRAND.nameAr} - ${BRAND.tagline}`;
  const metaDescription = description || BRAND.description;
  const metaKeywords = [...keywords, ...BRAND.keywords].join(', ');
  const currentUrl = canonical || (typeof window !== 'undefined' ? window.location.href : 'https://bithawani.com');
  const imageUrl = ogImage || 'https://bithawani.com/images/og-default.jpg';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="ar" dir="rtl" />
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={BRAND.nameAr} />
      <meta name="viewport" content={DEFAULT_META.viewport} />
      <meta charSet={DEFAULT_META.charset} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${BRAND.nameAr} - منصة التوصيل السريع`} />
      <meta property="og:site_name" content={BRAND.nameAr} />
      <meta property="og:locale" content="ar_YE" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={`${BRAND.nameAr} - منصة التوصيل السريع`} />
      <meta name="twitter:site" content="@bithawani" />
      <meta name="twitter:creator" content="@bithawani" />
      
      {/* App Links */}
      <meta property="al:android:package" content={BRAND.app.androidId} />
      <meta property="al:android:url" content={`bithawani://open`} />
      <meta property="al:ios:app_store_id" content={BRAND.app.iosId} />
      <meta property="al:ios:url" content={`bithawani://open`} />
      
      {/* Theme & Icons */}
      <meta name="theme-color" content={BRAND.colors.primary} />
      <meta name="msapplication-TileColor" content={BRAND.colors.primary} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={BRAND.app.name} />
      
      {/* Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color={BRAND.colors.primary} />
      
      {/* Manifest */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://api.bithawani.com" />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="YE" />
      <meta name="geo.placename" content="Yemen" />
      <meta name="geo.position" content="15.552727;48.516388" />
      <meta name="ICBM" content="15.552727, 48.516388" />
      
      {/* Business Info */}
      <meta name="contact" content={BRAND.contact.email} />
      <meta name="copyright" content={`© ${new Date().getFullYear()} ${BRAND.nameAr}. جميع الحقوق محفوظة.`} />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      
      {children}
    </Helmet>
  );
};

export default SEOHead;
