// src/components/AnimatedCounter.tsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Typography, useMediaQuery } from "@mui/material";
import type { TypographyProps } from "@mui/material";

type EasingName =
  | "linear"
  | "easeOutCubic"
  | "easeOutQuart"
  | "easeOutQuint"
  | "easeOutExpo";

export interface AnimatedCounterProps
  extends Omit<TypographyProps, "children" | "prefix"> {
  /** القيمة المستهدفة (يمكن تحديثها لاحقًا وسينتقل العد من القيمة الحالية لها) */
  targetValue: number;
  /** قيمة بدء العد (افتراضيًا يبدأ من القيمة الحالية أو 0 عند أول مرة) */
  from?: number;
  /** المدة بالمللي ثانية */
  duration?: number;
  /** تأخير بدء العد بالمللي ثانية */
  delay?: number;
  /** ابدأ تلقائيًا */
  autoplay?: boolean;
  /** لا يبدأ العد إلا عندما يظهر المكوّن في نافذة العرض */
  startOnView?: boolean;
  /** إن كانت true سيبدأ مرة واحدة فقط عند أول ظهور */
  once?: boolean;
  /** هامش التقاطع للـIntersectionObserver (مثال: "0px 0px -20% 0px") */
  rootMargin?: string;
  /** تنسيق: اللغة */
  locale?: string; // مثال: "ar", "ar-YE", "en-US"
  /** خيارات Intl.NumberFormat */
  notation?: "standard" | "compact";
  styleFormat?: "decimal" | "currency" | "percent";
  currency?: string; // مثال: "YER", "USD"
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  /** لاحقة/بادئة يمكن أن تكون ReactNode */
  prefix?: React.ReactNode | null;
  suffix?: React.ReactNode;
  /** دالة تنسيق مخصّصة تتلقى الرقم وتُرجع نصًا */
  format?: (value: number) => string;
  /** اسم Easing جاهز */
  easing?: EasingName;
  /** Events */
  onUpdate?: (value: number) => void;
  onComplete?: (finalValue: number) => void;
}

const EASINGS: Record<EasingName, (t: number) => number> = {
  linear: (t) => t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  easeOutQuint: (t) => 1 - Math.pow(1 - t, 5),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  targetValue,
  from,
  duration = 2000,
  delay = 0,
  autoplay = true,
  startOnView = true,
  once = true,
  rootMargin = "-10% 0px -10% 0px",
  locale = "ar",
  notation = "standard",
  styleFormat = "decimal",
  currency = "YER",
  minimumFractionDigits,
  maximumFractionDigits,
  prefix,
  suffix,
  format,
  easing = "easeOutCubic",
  onUpdate,
  onComplete,
  ...typographyProps
}) => {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [inView, setInView] = useState(!startOnView); // إن لم نفعّل startOnView نبدأ فورًا
  const [current, setCurrent] = useState<number>(from ?? 0);
  console.log(hasPlayed);
  // نحافظ على قيمة البداية في كل انتقال
  const startValueRef = useRef<number>(from ?? 0);
  useEffect(() => {
    // إذا لم يُحدّد from صراحة، ابدأ من القيمة الحالية
    startValueRef.current = from ?? current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue, from]);

  // IntersectionObserver: نبدأ العد عند ظهور العنصر
  useEffect(() => {
    if (!startOnView) return;
    const node = wrapperRef.current;
    if (!node) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { root: null, rootMargin, threshold: 0.1 }
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [startOnView, rootMargin, once]);

  // إلغاء أي RAF عند التفكيك
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const ease = EASINGS[easing] ?? EASINGS.easeOutCubic;

  const tick = useCallback(
    (ts: number, startVal: number, endVal: number, total: number) => {
      if (startTimeRef.current == null) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const clamped = Math.min(Math.max(elapsed / total, 0), 1);
      const p = reduceMotion ? 1 : ease(clamped);
      const next = startVal + (endVal - startVal) * p;

      // قلّل إعادة التصيير: حدّث فقط عند تغيّر ملحوظ
      setCurrent((prev) => {
        if (Math.abs(prev - next) < 0.0005) return prev;
        return next;
      });

      onUpdate?.(next);

      if (clamped < 1) {
        rafRef.current = requestAnimationFrame((t) =>
          tick(t, startVal, endVal, total)
        );
      } else {
        onComplete?.(endVal);
      }
    },
    [ease, onComplete, onUpdate, reduceMotion]
  );

  // إدارة بدء/إعادة العد
  useEffect(() => {
    if (!autoplay) return;
    if (!inView) return;

    // إلغاء أي أنيميشن سابق
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;

    const startVal = startValueRef.current;
    const endVal = targetValue;

    if (reduceMotion) {
      setCurrent(endVal);
      onComplete?.(endVal);
      setHasPlayed(true);
      return;
    }

    const startWithDelay = () => {
      rafRef.current = requestAnimationFrame((t) =>
        tick(t, startVal, endVal, duration)
      );
      setHasPlayed(true);
    };

    if (delay > 0) {
      const id = setTimeout(startWithDelay, delay);
      return () => clearTimeout(id);
    } else {
      startWithDelay();
    }
  }, [
    autoplay,
    inView,
    targetValue,
    duration,
    delay,
    reduceMotion,
    tick,
    onComplete,
  ]);

  // فورماتر احترافي (افتراضي Intl، أو دالة مخصّصة)
  const numberFormatter = useMemo(() => {
    if (format) return null; // سنستخدم الدالة المخصّصة
    const options: Intl.NumberFormatOptions = {
      notation,
      style: styleFormat,
    };
    if (styleFormat === "currency") {
      options.currency = currency;
      // عملة: عادة 0 منازل لـYER — غيّرها إن رغبت
      if (minimumFractionDigits != null)
        options.minimumFractionDigits = minimumFractionDigits;
      else options.minimumFractionDigits = 0;
      if (maximumFractionDigits != null)
        options.maximumFractionDigits = maximumFractionDigits;
      else options.maximumFractionDigits = 0;
    } else {
      if (minimumFractionDigits != null)
        options.minimumFractionDigits = minimumFractionDigits;
      if (maximumFractionDigits != null)
        options.maximumFractionDigits = maximumFractionDigits;
      // افتراضي لطيف: compact => منزلة واحدة، standard => صفر
      if (
        options.minimumFractionDigits == null &&
        options.maximumFractionDigits == null
      ) {
        if (notation === "compact") {
          options.minimumFractionDigits = 0;
          options.maximumFractionDigits = 1;
        } else {
          options.minimumFractionDigits = 0;
          options.maximumFractionDigits = 0;
        }
      }
    }
    try {
      return new Intl.NumberFormat(locale, options);
    } catch {
      return new Intl.NumberFormat("en-US", options);
    }
  }, [
    format,
    notation,
    styleFormat,
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    locale,
  ]);

  const displayText = useMemo(() => {
    const value = current;
    if (format) return format(value);
    return numberFormatter!.format(value);
  }, [current, format, numberFormatter]);

  return (
    <Typography {...typographyProps} component="span" ref={wrapperRef}>
      {prefix && <span style={{ marginInlineStart: 4 }}>{prefix}</span>}
      {/* bdi لضبط الاتجاه داخل سياق RTL ولعرض الأرقام بشكل صحيح */}
      <bdi style={{ direction: "ltr", unicodeBidi: "isolate" }}>
        {displayText}
      </bdi>
      {suffix && <span style={{ marginInlineStart: 4 }}>{suffix}</span>}
    </Typography>
  );
};

export default AnimatedCounter;
