
import { useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Paper,
  Fab,
  IconButton,
  Stack,
} from "@mui/material";
import { Add, Storefront, Refresh } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { useStores } from "./hooks/useStores";
import StoreTable from "./components/StoreTable";
import StoreDialog from "./components/StoreDialog";
import StoresHeader from "./components/StoresHeader";
import StoreListMobile from "./components/StoreListMobile";

import {
  daysOfWeek,
  type Day,
  type DeliveryStore,
  type ScheduleSlot,
  type StoreForm_type,
} from "../../type/delivery";
import axios from "../../utils/axios";

// ---------- helpers ----------
const buildDefaultSchedule = (): ScheduleSlot[] =>
  daysOfWeek.map((day: Day) => ({ day, open: false, from: "09:00", to: "17:00" }));

const buildInitialForm = (): StoreForm_type => ({
  name: "",
  address: "",
  categoryId: "",
  lat: "",
  lng: "",
  isActive: true,
  image: null,
  logo: null,
  documents: null,
  schedule: buildDefaultSchedule(),
  commissionRate: "",
  isTrending: false,
  isFeatured: false,
  pricingStrategyType: "",
  pricingStrategy: "",
});

const mapStoreToForm = (s: DeliveryStore): StoreForm_type => ({
  name: s.name,
  address: s.address,
  categoryId: s.category?._id || "",
  lat: String(s.location.lat),
  lng: String(s.location.lng),
  isActive: s.isActive,
  image: null,
  logo: null,
  documents: null,
  schedule: (s.schedule ?? []).map((sl) => ({ ...sl })), // clone
  commissionRate: s.commissionRate?.toString() ?? "",
  isTrending: s.isTrending ?? false,
  isFeatured: s.isFeatured ?? false,
  pricingStrategyType: s.pricingStrategyType ?? "",
  pricingStrategy:
    typeof s.pricingStrategy === "object" && s.pricingStrategy !== null
      ? 
        (s.pricingStrategy._id as string)
      : (s.pricingStrategy as string) || "",
});

const toPayload = (form: StoreForm_type, editing?: DeliveryStore | null) => ({
  name: form.name.trim(),
  address: form.address.trim(),
  category: form.categoryId || undefined,
  lat: parseFloat(form.lat || "0"),
  lng: parseFloat(form.lng || "0"),
  isActive: !!form.isActive,
  image: editing?.image ?? "",
  logo: editing?.logo ?? "",
  schedule: form.schedule,
  commissionRate: form.commissionRate ? parseFloat(form.commissionRate) : 0,
  isTrending: !!form.isTrending,
  isFeatured: !!form.isFeatured,
  pricingStrategyType: form.pricingStrategyType || "",
  pricingStrategy: form.pricingStrategy || null,
});

export default function DeliveryStoresPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const { stores, categories, loading: listLoading, error, fetchStores, deleteStore } = useStores();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryStore | null>(null);
  const [form, setForm] = useState<StoreForm_type>(buildInitialForm());
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const busy = listLoading || refreshing;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchStores();
    } finally {
      setRefreshing(false);
    }
  }, [fetchStores]);

  const handleOpen = useCallback((s?: DeliveryStore) => {
    if (s) {
      setEditing(s);
      setForm(mapStoreToForm(s));
    } else {
      setEditing(null);
      setForm(buildInitialForm());
    }
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = toPayload(form, editing);

      // Note: File uploads are handled by FileUploader component, form.image/logo are already URLs

      if (editing) {
        await axios.put<DeliveryStore>(`/delivery/stores/${editing._id}`, payload);
      } else {
        await axios.post<DeliveryStore>("/delivery/stores", payload);
      }

      await fetchStores();
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  }, [form, editing, fetchStores]);

  const actions = useMemo(
    () => (
      <Stack direction="row" spacing={1} alignItems="center">
        {!isMobile && (
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={busy}
          >
            تحديث
          </Button>
        )}
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: theme.shadows[3],
              "&:hover": { boxShadow: theme.shadows[6] },
            }}
          >
            إضافة متجر
          </Button>
        )}
        {isMobile && (
          <IconButton onClick={handleRefresh} disabled={busy} aria-label="تحديث القائمة">
            <Refresh />
          </IconButton>
        )}
      </Stack>
    ),
    [isMobile, handleRefresh, handleOpen, busy, theme.palette.primary.main, theme.palette.secondary.main, theme.shadows]
  );

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <StoresHeader title="إدارة المتاجر" icon={<Storefront color="primary" />} actions={actions} />

      <AnimatePresence>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
            {error}
          </Alert>
        )}
      </AnimatePresence>

      {(busy && !stores.length) ? (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        </Paper>
      ) : (
        isMobile ? (
          <StoreListMobile
            stores={stores}
            onEdit={handleOpen}
            onDelete={deleteStore}
            onDetail={(id) => navigate(`/admin/delivery/stores/${id}`)}
            loading={busy}
          />
        ) : (
          <StoreTable
            stores={stores}
            onEdit={handleOpen}
            onDelete={deleteStore}
            onDetail={(id) => navigate(`/admin/delivery/stores/${id}`)}
            loading={busy}
          />
        )
      )}

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          onClick={() => handleOpen()}
          aria-label="إضافة متجر"
          sx={{ position: "fixed", bottom: 24, right: 24 }}
        >
          <Add />
        </Fab>
      )}

      <StoreDialog
        open={dialogOpen}
        editing={editing}
        form={form}
        categories={categories}
        onClose={() => setDialogOpen(false)}
        onChange={(upd) => setForm((f) => ({ ...f, ...upd }))}
        onSave={handleSave}
        saving={saving}
      />
    </Box>
  );
}
