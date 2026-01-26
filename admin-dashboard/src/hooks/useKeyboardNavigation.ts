import { useEffect } from 'react';

/**
 * Hook مخصص لدعم التنقل بالكيبورد في النماذج والعناصر التفاعلية
 */
export function useKeyboardNavigation() {
  const getFocusableElements = (container?: HTMLElement): HTMLElement[] => {
    const selector = [
      'a[href]',
      'area[href]',
      'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
      'select:not([disabled]):not([aria-hidden])',
      'textarea:not([disabled]):not([aria-hidden])',
      'button:not([disabled]):not([aria-hidden])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]',
      '[tabindex]:not([tabindex^="-"])',
    ].join(',');

    const containerElement = container || document;
    return Array.from(containerElement.querySelectorAll(selector)).filter(
      (el) => !el.hasAttribute('hidden') && (el as HTMLElement).offsetParent !== null
    ) as HTMLElement[];
  };

  const focusNext = (currentIndex: number, elements: HTMLElement[]): number => {
    return currentIndex < elements.length - 1 ? currentIndex + 1 : 0;
  };

  const focusPrev = (currentIndex: number, elements: HTMLElement[]): number => {
    return currentIndex > 0 ? currentIndex - 1 : elements.length - 1;
  };

  const handleTabNavigation = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = getFocusableElements();
      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

      if (currentIndex !== -1) {
        if (e.shiftKey) {
          // Shift + Tab (التنقل للخلف)
          e.preventDefault();
          const prevIndex = focusPrev(currentIndex, focusableElements);
          focusableElements[prevIndex].focus();
        } else {
          // Tab (التنقل للأمام)
          if (currentIndex === focusableElements.length - 1) {
            e.preventDefault();
            const nextIndex = focusNext(currentIndex, focusableElements);
            focusableElements[nextIndex].focus();
          }
        }
      }
    }
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // إغلاق القوائم أو النماذج المفتوحة
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        // البحث عن العنصر الأب الذي قد يكون modal أو drawer
        const parentModal = activeElement.closest('[role="dialog"], [role="menu"], .MuiDrawer-root');
        if (parentModal) {
          const closeButton = parentModal.querySelector('[aria-label*="إغلاق"], [aria-label*="close"], button[title*="إغلاق"]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleTabNavigation);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleTabNavigation);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return {
    getFocusableElements,
    focusNext,
    focusPrev,
  };
}

/**
 * Hook للتحقق من تباين الألوان وتوافقها مع إرشادات WCAG
 */
export function useColorContrast() {
  const checkContrast = (foreground: string, background: string): boolean => {
    // دالة مبسطة لحساب تباين الألوان
    // يمكن استبدالها بحساب أكثر دقة حسب الحاجة
    const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const rgb1 = hexToRgb(foreground);
    const rgb2 = hexToRgb(background);

    const l1 = 0.299 * rgb1.r + 0.587 * rgb1.g + 0.114 * rgb1.b;
    const l2 = 0.299 * rgb2.r + 0.587 * rgb2.g + 0.114 * rgb2.b;

    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return ratio >= 4.5; // WCAG AA standard
  };

  return { checkContrast };
}
