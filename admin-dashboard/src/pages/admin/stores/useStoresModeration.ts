import { useEffect, useState } from "react";
import api from "../../../utils/axios";

export type StoreRow = {
  _id: string;
  name: string;
  address: string;
  usageType?: string;
  isActive: boolean;
  forceClosed?: boolean;
  createdAt: string;
};

export function useStoresModeration() {
  const [rows, setRows] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function list(params?: Record<string, string>) {
    setLoading(true);
    try {
      const res = await api.get<StoreRow[]>("/admin/stores", { params });
      setRows(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function activate(id: string) {
    await api.post(`/admin/stores/${id}/activate`);
    await list();
  }
  async function deactivate(id: string) {
    await api.post(`/admin/stores/${id}/deactivate`);
    await list();
  }
  async function forceClose(id: string) {
    await api.post(`/admin/stores/${id}/force-close`);
    await list();
  }
  async function forceOpen(id: string) {
    await api.post(`/admin/stores/${id}/force-open`);
    await list();
  }
  async function patch(id: string, payload: Partial<StoreRow>) {
    await api.patch(`/admin/stores/${id}`, payload);
    await list();
  }
  async function remove(id: string) {
    if (!window.confirm("حذف المتجر؟")) return;
    await api.delete(`/admin/stores/${id}`);
    await list();
  }

  useEffect(() => {
    list();
  }, []);
  return {
    rows,
    loading,
    list,
    activate,
    deactivate,
    forceClose,
    forceOpen,
    patch,
    remove,
  };
}
