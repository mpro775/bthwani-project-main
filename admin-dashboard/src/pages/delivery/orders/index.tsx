import { useEffect, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import { auth } from "../../../config/firebaseConfig";
import FiltersBar from "./components/FiltersBar";
import KpiCards from "./components/KpiCards";
import BulkActionsBar from "./components/BulkActionsBar";
import OrdersTable from "./components/OrdersTable";
import OrderDrawer from "./components/OrderDrawer";
import { useOrders } from "./hooks/useOrders";
import { useAdminSocket } from "./hooks/useAdminSocket";
import { downloadOrdersExcel } from "./utils/excel";
import { useListQueryState } from "../../../hook/useQueryState";
import StateBoundary from "../../../components/ui/StateBoundary";
import SocketStatusIndicator from "../../../components/ui/SocketStatusIndicator";

export default function AdminDeliveryOrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // استخدم hook لحفظ حالة الفلاتر والصفحات في QueryString
  const {
    page,
    setPage,
    perPage,
    setPerPage,
    sort,
    setSort,
    filters,
    setFilters,
  } = useListQueryState();

  const [drawerId] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<string[]>([]);
  const { rows, setRows, loading, error, fetchOrders } = useOrders();
  const { ensure, isConnected } = useAdminSocket();

  const apply = useCallback(() => fetchOrders(filters), [fetchOrders, filters]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return;
      await u.getIdToken(true);

      setReady(true); // 🔔 فعلنا الجاهزية
      apply(); // أول تحميل للبيانات

      const s = await ensure();
      const softRefresh = () => apply();
      s.on("order.created", softRefresh);
      s.on("order.status", softRefresh);
      s.on("order.sub.status", softRefresh);
      s.on("order.note.added", softRefresh);
    });
    return () => {
      ensure().then((s) => {
        s.off("order.created");
        s.off("order.status");
        s.off("order.sub.status");
        s.off("order.note.added");
      });
      unsub();
    };
  }, [ensure, apply]);
  useEffect(() => {
    if (!ready) return; // انتظر الجاهزية
    const t = setTimeout(() => {
      apply(); // اطلب البيانات بعد 350ms من آخر تغيير
    }, 350);
    return () => clearTimeout(t); // امسح المؤقت عند أي تغيير جديد
  }, [filters, ready, apply]);

  return (
    <Box className="p-4" sx={{ display: "grid", gap: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={800}>
          إدارة الطلبات
        </Typography>
        <Stack direction="row" alignItems="center" gap={2}>
          <SocketStatusIndicator isConnected={isConnected} />
          <Button
            startIcon={<Download />}
            onClick={() => downloadOrdersExcel(filters)}
          >
            تصدير
          </Button>
        </Stack>
      </Stack>

      <FiltersBar
        filters={filters}
        setFilters={(upd: unknown) =>
          setFilters((prev) => (typeof upd === "function" ? upd(prev) : upd))
        }
        onApply={apply}
        loading={loading}
      />

      <KpiCards rows={rows} />

      <BulkActionsBar
        selected={selected}
        rows={rows}
        setRows={setRows}
        refresh={apply}
      />

      <StateBoundary
        isLoading={loading}
        isError={!!error}
        isEmpty={rows.length === 0 && !loading && !error}
        onRetry={apply}
        emptyTitle="لا توجد طلبات"
        emptyDescription="لا توجد طلبات تطابق الفلاتر المحددة"
        emptyActionLabel="إعادة ضبط الفلاتر"
        emptyOnAction={() => setFilters({})}
        errorMessage={error || undefined}
        loadingMessage="جارٍ تحميل الطلبات..."
      >
        <OrdersTable
          rows={rows}
          onOpen={(id) => {
            // حفظ الحالة الحالية في QueryString قبل الانتقال للتفاصيل
            const currentParams = new URLSearchParams(location.search);
            navigate(`/admin/delivery/orders/details/${id}?${currentParams.toString()}`);
          }}
          onSelectionChange={(ids) => setSelected(ids)}
          paginationModel={{
            page: page - 1, // DataGrid يبدأ من 0
            pageSize: perPage,
          }}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1); // تحويل من 0-based إلى 1-based
            setPerPage(model.pageSize);
          }}
          filterModel={{
            items: [], // يمكن إضافة فلاتر متقدمة هنا
          }}
          onFilterModelChange={() => {
            // يمكن إضافة منطق الفلترة هنا
          }}
          sortModel={sort ? [{ field: sort.split(':')[0], sort: sort.split(':')[1] as 'asc' | 'desc' }] : []}
          onSortModelChange={(model) => {
            if (model.length > 0) {
              const { field, sort: sortDirection } = model[0];
              setSort(`${field}:${sortDirection}`);
            } else {
              setSort('');
            }
          }}
        />
      </StateBoundary>

      <OrderDrawer
        open={Boolean(drawerId)}
        orderId={drawerId}
        onClose={() => {
          // العودة إلى قائمة الطلبات مع الحفاظ على الفلاتر والصفحة الحالية
          navigate(`/admin/delivery/orders?${location.search}`);
        }}
      />
    </Box>
  );
}
