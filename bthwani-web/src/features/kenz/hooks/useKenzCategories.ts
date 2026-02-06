import { useState, useEffect, useMemo } from "react";
import { getKenzCategoriesTree, type KenzCategoryTreeItem } from "../api";
import { KENZ_CATEGORIES } from "../types";

/** تسطيح الشجرة إلى قائمة (اسم عربي + معرف) للعرض في القوائم */
function flattenTree(tree: KenzCategoryTreeItem[], prefix = ""): { value: string; label: string; id?: string }[] {
  const out: { value: string; label: string; id?: string }[] = [];
  for (const node of tree) {
    out.push({ value: node.nameAr, label: prefix ? `${prefix} › ${node.nameAr}` : node.nameAr, id: node._id });
    if (node.children?.length) {
      out.push(...flattenTree(node.children, prefix ? `${prefix} › ${node.nameAr}` : node.nameAr));
    }
  }
  return out;
}

/**
 * جلب فئات كنز من الـ API (شجرة). إن كانت فارغة نستخدم القائمة الثابتة.
 */
export function useKenzCategories() {
  const [tree, setTree] = useState<KenzCategoryTreeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getKenzCategoriesTree()
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setTree(data);
      })
      .catch(() => {
        if (!cancelled) setTree([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const flatOptions = useMemo(() => {
    if (tree.length > 0) return flattenTree(tree);
    return KENZ_CATEGORIES.map((c) => ({ value: c, label: c }));
  }, [tree]);

  const categoryValues = useMemo(() => flatOptions.map((o) => o.value), [flatOptions]);

  return { tree, flatOptions, categoryValues, loading };
}
