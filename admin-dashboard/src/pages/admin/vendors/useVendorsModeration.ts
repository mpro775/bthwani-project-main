import { useEffect, useState } from "react";
import api from "../../../utils/axios";

export type VendorRow = {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  isActive: boolean;
  store?: { _id: string; name: string; address: string };
  createdAt: string;
};

export function useVendorsModeration() {
  const [rows, setRows] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function list(params?: Record<string, string>) {
    setLoading(true);
    try {
      const res = await api.get<VendorRow[]>("/admin/vendors", { params });
      setRows(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function activate(id: string) { await api.post(`/admin/vendors/${id}/activate`); await list(); }
  async function deactivate(id: string) { await api.post(`/admin/vendors/${id}/deactivate`); await list(); }
  async function resetPassword(id: string, password: string) { await api.post(`/admin/vendors/${id}/reset-password`, { password }); }
  async function patch(id: string, payload: Partial<VendorRow>) { await api.patch(`/admin/vendors/${id}`, payload); await list(); }
  async function remove(id: string) { if (!window.confirm("حذف التاجر؟")) return; await api.delete(`/admin/vendors/${id}`); await list(); }

  useEffect(()=>{ list(); },[]);
  return { rows, loading, list, activate, deactivate, resetPassword, patch, remove };
}
