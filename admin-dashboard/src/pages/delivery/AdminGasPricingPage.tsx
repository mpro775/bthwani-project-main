import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import CitySelect from "./CitySelect";
import {
  UtilityApi,
  type DailyPriceEntry,
  type GasOption,
} from "./orders/services/utilityApi";
import dayjs from "dayjs";
import { AxiosError } from "axios";

// مدينة افتراضية
const DEFAULT_CITY = "صنعاء";

type ErrorResponse = { message?: string };

export default function AdminGasPricingPage() {
  const [city, setCity] = useState<string | null>(DEFAULT_CITY); // تعيين المدينة الافتراضية
  const [form, setForm] = useState<GasOption | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Daily pricing
  const [daily, setDaily] = useState<DailyPriceEntry[]>([]);
  const [dDate, setDDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [dPrice, setDPrice] = useState<string>("");

  const canSave = useMemo(() => {
    if (!form) return false;
    return (
      !!form.city && form.cylinderSizeLiters > 0 && form.pricePerCylinder >= 0
    );
  }, [form]);

  // تحميل قائمة المدن المتاحة وتحديد المدينة الافتراضية
  useEffect(() => {
    (async () => {
      try {
        const cities = await UtilityApi.getCities();

        // إذا كانت المدينة الحالية غير متوفرة في القائمة، استخدم أول مدينة متاحة أو الافتراضية
        if (cities && cities.length > 0 && (!city || !cities.includes(city))) {
          const defaultCity = cities.includes(DEFAULT_CITY) ? DEFAULT_CITY : cities[0];
          setCity(defaultCity);
        }
      } catch (error) {
        console.warn("فشل في تحميل قائمة المدن:", error);
        // استخدم المدينة الافتراضية في حالة الخطأ
        if (!city) {
          setCity(DEFAULT_CITY);
        }
      }
    })();
  }, []);

  const loadCityData = useCallback(async (selectedCity: string | null) => {
    setError(null);
    if (!selectedCity) {
      setForm(null);
      setDaily([]);
      return;
    }
    try {
      const opt = await UtilityApi.getOptions(selectedCity);
      const gas = opt.gas || {
        city: selectedCity,
        cylinderSizeLiters: 20,
        pricePerCylinder: 0,
        minQty: 1,
        deliveryPolicy: "flat",
        flatFee: 0,
      };
      setForm(gas as GasOption);

      const dl = await UtilityApi.listDaily("gas", selectedCity);
      setDaily(dl);
    } catch (e: unknown) {
      const error = e as AxiosError<ErrorResponse>;
      if (error.response?.status === 404) {
        // ✅ مدينة جديدة: جهّز نموذج افتراضي
        setForm({
          city: selectedCity,
          cylinderSizeLiters: 20,
          pricePerCylinder: 0,
          minQty: 1,
          deliveryPolicy: "flat",
          flatFee: 0,
        } as GasOption);
        setDaily([]);
      } else {
        setError(error.response?.data?.message || "تعذر تحميل الإعدادات");
      }
    }
  }, []);

  // Load current options per city
  useEffect(() => {
    loadCityData(city);
  }, [city, loadCityData]);

  const save = async () => {
    if (!form) return;
    try {
      setSaving(true);
      await UtilityApi.upsertGas(form);
    } catch (e: unknown) {
      const error = e as AxiosError;
      setError((error.response?.data as ErrorResponse)?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const addDaily = async () => {
    if (!city || !dDate || !dPrice) return;
    const entry: DailyPriceEntry = {
      kind: "gas",
      city,
      date: dDate,
      price: Number(dPrice),
      variant: `${form?.cylinderSizeLiters ?? 20}L`,
    };
    const saved = await UtilityApi.upsertDaily(entry);
    setDaily((prev) => {
      const rest = prev.filter((p) => !dayjs(p.date).isSame(entry.date, "day"));
      return [saved, ...rest].sort((a, b) => (a.date < b.date ? 1 : -1));
    });
    setDPrice("");
  };

  const deleteDaily = async (row: DailyPriceEntry) => {
    if (row._id) {
      await UtilityApi.deleteDaily(row._id);
    } else {
      await UtilityApi.deleteDailyByKey("gas", row.city, row.date, row.variant);
    }
    setDaily((prev) =>
      prev.filter(
        (p) =>
          !(
            p.city === row.city &&
            p.date === row.date &&
            p.variant === row.variant
          )
      )
    );
  };

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Typography variant="h5" fontWeight={800}>
        تسعير الغاز حسب المدينة
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} component="div">
              <CitySelect value={city} onChange={setCity} />
            </Grid>
            {form && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 4 }} component="div">
                  <TextField
                    label="حجم الأسطوانة (لتر)"
                    size="small"
                    type="number"
                    value={form.cylinderSizeLiters}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cylinderSizeLiters: Number(e.target.value),
                      })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }} component="div">
                  <TextField
                    label="سعر الأسطوانة الأساسي (ر.ي)"
                    size="small"
                    type="number"
                    value={form.pricePerCylinder}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pricePerCylinder: Number(e.target.value),
                      })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }} component="div">
                  <TextField
                    label="الحد الأدنى للكمية"
                    size="small"
                    type="number"
                    value={form.minQty}
                    onChange={(e) =>
                      setForm({ ...form, minQty: Number(e.target.value) })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }} component="div">
                  <TextField
                    select
                    label="سياسة رسوم التوصيل"
                    size="small"
                    value={form.deliveryPolicy}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        deliveryPolicy: e.target.value as "flat" | "strategy",
                      })
                    }
                    fullWidth
                  >
                    <MenuItem value="flat">ثابت</MenuItem>
                    <MenuItem value="strategy">حسب المسافة</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }} component="div">
                  <TextField
                    label="رسوم ثابتة (إن وجدت)"
                    size="small"
                    type="number"
                    value={form.flatFee ?? 0}
                    onChange={(e) =>
                      setForm({ ...form, flatFee: Number(e.target.value) || 0 })
                    }
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12 }} component="div">
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      onClick={save}
                      disabled={!canSave || saving}
                    >
                      حفظ الإعدادات
                    </Button>
                  </Stack>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Daily Pricing */}
      <Card variant="outlined">
        <CardContent>
          <Typography fontWeight={700} gutterBottom>
            السعر اليومي (Override)
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="التاريخ"
              size="small"
              type="date"
              value={dDate}
              onChange={(e) => setDDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="السعر (ر.ي)"
              size="small"
              type="number"
              value={dPrice}
              onChange={(e) => setDPrice(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={addDaily}
              disabled={!city || !dPrice}
            >
              إضافة / تحديث
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {daily.length === 0 ? (
            <Typography color="text.secondary">لا توجد أسعار يومية.</Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1 }}>
              {daily.map((row) => (
                <Stack
                  key={`${row.date}-${row.variant}`}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ border: "1px solid #eee", borderRadius: 1, p: 1 }}
                >
                  <Typography>
                    {dayjs(row.date).format("YYYY/MM/DD")} • {row.variant} •{" "}
                    {row.price} ر.ي
                  </Typography>
                  <IconButton onClick={() => deleteDaily(row)}>
                    <DeleteOutline />
                  </IconButton>
                </Stack>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
