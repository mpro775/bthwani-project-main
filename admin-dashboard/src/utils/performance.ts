// =============================
// Performance Optimization Utils
// =============================

import React from "react";
import type { FC } from "react";

// تحسين الصور
export const optimizeImage = (
  src: string,
  width?: number,
  height?: number,
  quality = 80
) => {
  if (!src) return "";

  // إذا كان رابط خارجي، اتركه كما هو
  if (src.startsWith("http")) return src;

  // للصور المحلية، أضف معاملات التحسين
  const params = new URLSearchParams();
  if (width) params.append("w", width.toString());
  if (height) params.append("h", height.toString());
  params.append("q", quality.toString());
  params.append("f", "webp");

  return `${src}?${params.toString()}`;
};

// تحميل كسول للصور
export const LazyImage: FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
}> = ({
  src,
  alt,
  width,
  height,
  className,
  placeholder = "/images/placeholder.jpg",
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(optimizeImage(src, width, height));
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, width, height]);

  return React.createElement("img", {
    ref: imgRef,
    src: imageSrc,
    alt: alt,
    width: width,
    height: height,
    className: className,
    style: {
      transition: "opacity 0.3s ease",
      opacity: isLoaded ? 1 : 0.7,
    },
    onLoad: () => setIsLoaded(true),
    loading: "lazy",
  });
};

// قياس الأداء
export const measurePerformance = () => {
  if (typeof window !== "undefined" && "performance" in window) {
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    return {
      // زمن تحميل الصفحة الكامل
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      // زمن الاستجابة من الخادم
      responseTime: navigation.responseEnd - navigation.requestStart,
      // زمن تحميل المحتوى
      domContentLoaded:
        navigation.domContentLoadedEventEnd - navigation.fetchStart,
      // زمن التفاعل الأول
      firstPaint:
        performance.getEntriesByName("first-paint")[0]?.startTime || 0,
      // أكبر عنصر محتوى
      largestContentfulPaint:
        performance.getEntriesByName("largest-contentful-paint")[0]
          ?.startTime || 0,
    };
  }

  return null;
};

// إرسال بيانات الأداء لـ Google Analytics
export const sendPerformanceMetrics = () => {
  if (typeof window !== "undefined" && "gtag" in window) {
    const metrics = measurePerformance();
    if (metrics) {
      window.gtag("event", "page_load_time", {
        value: Math.round(metrics.loadTime),
        custom_parameter: "performance",
      });
    }
  }
};

// تحسين الخطوط
export const preloadFonts = () => {
  const fonts = [
    "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&display=swap",
  ];

  fonts.forEach((font) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = font;
    link.as = "style";
    document.head.appendChild(link);
  });
};

// تحسين الذاكرة
export const memoizeComponent = <T extends object>(
  Component: React.ComponentType<T>
): React.ComponentType<T> => {
  return React.memo(Component, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
};

// تأخير التحميل للمكونات الثقيلة
export const lazyLoadComponent = (
  importFunc: () => Promise<{ default: React.ComponentType<unknown> }>
) => {
  return React.lazy(() => importFunc());
};

export default {
  optimizeImage,
  LazyImage,
  measurePerformance,
  sendPerformanceMetrics,
  preloadFonts,
  memoizeComponent,
  lazyLoadComponent,
};
