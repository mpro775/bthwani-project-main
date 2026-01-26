import { useEffect, useState } from "react";
import api from "../../../utils/axios";
import type { Store } from "antd/es/form/interface";
import type { VendorRow } from "../vendors/useVendorsModeration";

export function usePendingActivations() {
  const [stores, setStores] = useState<Store[]>([]);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function list(params?: Record<string, string>) {
    setLoading(true);
    try {
      // خيار (1): مسار مجمّع إذا أضفته على الباك إند
      // const r = await api.get("/admin/pending-activations", { params });
      // setStores(r.data.stores || []); setVendors(r.data.vendors || []);

      // خيار (2): استدعاءين (بدون مسار مجمّع)
      const [s, v] = await Promise.all([
        api.get("/delivery/stores", {
          params: { active: false, q: params?.q },
        }),
        api.get("/admin/vendors", { params: { active: false, q: params?.q } }),
      ]);
      setStores(s.data || []);
      setVendors(v.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function activateStore(storeId: string) {
    await api.patch(`/admin/activation/store/${storeId}`);
    await list();
  }

  async function activateVendor(vendorId: string) {
    await api.patch(`/admin/activation/vendor/${vendorId}`);
    await list();
  }

  useEffect(() => {
    list();
  }, []);

  return { stores, vendors, loading, list, activateStore, activateVendor };
}
