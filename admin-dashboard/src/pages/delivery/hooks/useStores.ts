// src/pages/admin/delivery/hooks/useStores.ts
import { useState, useEffect } from "react";
import axios from "../../../utils/axios";
import type { Category, DeliveryStore } from "../../../type/delivery";

export function useStores() {
  const [stores, setStores] = useState<DeliveryStore[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await axios.get<DeliveryStore[]>("/delivery/stores");
      setStores(res.data);
      setError(null);
    } catch {
      setError("فشل في جلب المتاجر.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get<Category[]>("/delivery/categories");
      setCategories(res.data);
    } catch {
      /* ignore */
    }
  };

  const deleteStore = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    setLoading(true);
    try {
      await axios.delete(`/delivery/stores/${id}`);
      await fetchStores();
    } catch {
      setError("فشل في حذف المتجر.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchCategories();
  }, []);

  return { stores, categories, loading, error, fetchStores, deleteStore };
}
