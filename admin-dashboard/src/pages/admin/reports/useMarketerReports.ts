import { useEffect, useState } from "react";
import api from "../../../utils/axios";

type MarketerReportItem = {
  uid: string;
  submittedW: number;
  approvedW: number;
  needsFixW: number;
  rejectedW: number;
  approvalRate: number;
};

export function useOverview() {
  const [rows, setRows] = useState<MarketerReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function list(params?: Record<string, string>) {
    setLoading(true);
    try {
      const r = await api.get("/reports/marketers/overview", { params });
      setRows(r.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    list({});
  }, []);
  return { rows, loading, list };
}

export function usePerMarketer(uid: string) {
  const [data, setData] = useState<MarketerReportItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetch(params?: Record<string, string>) {
    setLoading(true);
    try {
        const r = await api.get(`/reports/marketers/${uid}`, { params });
      setData(r.data || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (uid) fetch({});
  }, [uid]);
  return { data, loading, fetch };
}
