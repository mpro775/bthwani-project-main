// src/hooks/useOnboarding.ts
import { useState } from "react";
import { api } from "../api/client";
import { ENDPOINTS } from "../api/routes";
import type { OnboardingDraft } from "../types";

type ListMyOpts = {
  page?: number;
  limit?: number;
  from?: string; // "2025-09-01"
  to?: string; // "2025-09-30"
  status?: "draft" | "submitted" | "needs_fix" | "approved" | "rejected";
  reset?: boolean; // عند السحب للتحديث
};

type ListMyResponse = {
  items: OnboardingDraft[];
  pagination?: { page: number; limit: number; total: number };
};

export function useOnboarding() {
  const [items, setItems] = useState<OnboardingDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // للحالة الداخلية في حال استخدمت ترقيم من الباك
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState<number | null>(null);

  const hasMore = total == null ? false : items.length < total;
  async function getOne(id: string) {
    const { data } = await api.get(ENDPOINTS.ONB_GET_ONE(id));
    return data; // مستند Onboarding الواحد
  }
  async function listMy(opts: ListMyOpts = {}) {
    setLoading(true);
    setError(null);
    try {
      const reqPage = opts.page ?? page;
      const reqLimit = opts.limit ?? limit;

      const { data } = await api.get<ListMyResponse | OnboardingDraft[]>(
        ENDPOINTS.ONB_LIST_MY,
        {
          params: {
            page: reqPage,
            limit: reqLimit,
            from: opts.from,
            to: opts.to,
            status: opts.status,
          },
        }
      );

      // يدعم الشكلين: { items, pagination } أو Array مباشرة
      const incomingItems = Array.isArray(data) ? data : data.items || [];
      const nextItems =
        opts.reset || reqPage === 1
          ? incomingItems
          : [...items, ...incomingItems];

      setItems(nextItems);

      if (!Array.isArray(data) && data.pagination) {
        setPage(data.pagination.page);
        setLimit(data.pagination.limit);
        setTotal(data.pagination.total);
      } else {
        // لو الباك ما يرجّع pagination، اعتبرها صفحة واحدة
        setPage(1);
        setLimit(incomingItems.length);
        setTotal(incomingItems.length);
      }
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        // هنا ممكن تستدعي logout من الكونتكست إن رغبت
        setError("الجلسة انتهت. سجّل الدخول مجددًا.");
      } else {
        setError(e?.message || "تعذر تحميل الطلبات");
      }
      throw e; // لو حاب تتعامل معه في الشاشة
    } finally {
      setLoading(false);
    }
  }

  async function createDraft(
    payload: Partial<OnboardingDraft>
  ): Promise<{ id: string }> {
    const { data } = await api.post(ENDPOINTS.ONB_CREATE, payload);
    return { id: data._id || data.id };
  }

  async function updateDraft(id: string, payload: Partial<OnboardingDraft>) {
    await api.patch(ENDPOINTS.ONB_UPDATE(id), payload);
  }

  async function submitDraft(id: string) {
    await api.post(ENDPOINTS.ONB_SUBMIT(id), {});
  }

  function resetList() {
    setItems([]);
    setPage(1);
    setTotal(null);
  }

  return {
    items,
    loading,
    error,
    page,
    limit,
    total,
    hasMore,
    listMy,
    resetList,
    setPage, // لو حبيت تتحكم من الشاشة
    setLimit, // لو حبيت تغيّر الحد من الشاشة
    createDraft,
    updateDraft,
    getOne,
    submitDraft,
  };
}
