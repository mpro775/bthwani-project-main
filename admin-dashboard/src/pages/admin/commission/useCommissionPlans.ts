import { useEffect, useState } from "react";
import api from "../../../utils/axios";

export type Plan = {
  _id: string;
  name: string;
  active: boolean;
  rules: { trigger: string; amountYER: number }[];
};
export function useCommissionPlans() {
  const [rows, setRows] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  async function list() {
    setLoading(true);
    try {
      const r = await api.get<Plan[]>("/admin/commission-plans");
      setRows(r.data);
    } finally {
      setLoading(false);
    }
  }
  async function create(payload: Partial<Plan>) {
    await api.post("/admin/commission-plans", payload);
    await list();
  }
  async function patch(id: string, payload: Partial<Plan>) {
    await api.patch(`/admin/commission-plans/${id}`, payload);
    await list();
  }
  async function setStatus(id: string, active: boolean) {
    await api.post(`/admin/commission-plans/${id}/status`, { active });
    await list();
  }
  async function remove(id: string) {
    if (!window.confirm("حذف الخطة؟")) return;
    await api.delete(`/admin/commission-plans/${id}`);
    await list();
  }
  useEffect(() => {
    list();
  }, []);
  return { rows, loading, list, create, patch, setStatus, remove };
}
