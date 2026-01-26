import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
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
  type WaterOption,
  type WaterSizeKey,
} from "./orders/services/utilityApi";
import dayjs from "dayjs";
import { AxiosError } from "axios";

type ErrorResponse = { message?: string };

// مدينة افتراضية
const DEFAULT_CITY = "صنعاء";

const SIZE_ORDER: WaterSizeKey[] = ["small", "medium", "large"];
const sizeLabel = (k: WaterSizeKey) =>
  k === "small" ? "صغير" : k === "medium" ? "وسط" : "كبير";

export default function AdminWaterPricingPage() {
  const [city, setCity] = useState<string | null>(DEFAULT_CITY); // تعيين المدينة الافتراضية
  const [form, setForm] = useState<WaterOption | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [daily, setDaily] = useState<DailyPriceEntry[]>([]);
  const [dDate, setDDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [dSize, setDSize] = useState<WaterSizeKey>("small");
  const [dPrice, setDPrice] = useState<string>("");

  const canSave = useMemo(() => {
    if (!form) return false;
    const sizesOK = (form.sizes || []).every(
      (s) => s.capacityLiters > 0 && s.pricePerTanker >= 0
    );
    return !!form.city && sizesOK;
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
      const water: WaterOption = opt.water || {
        city: selectedCity,
        sizes: [
          { key: "small", capacityLiters: 8000, pricePerTanker: 0 },
          { key: "medium", capacityLiters: 12000, pricePerTanker: 0 },
          { key: "large", capacityLiters: 20000, pricePerTanker: 0 },
        ],
        allowHalf: true,
        halfPolicy: "multiplier",
        deliveryPolicy: "flat",
        flatFee: 0,
      };
      // تأكد من ترتيب وثبات المقاسات
      water.sizes = SIZE_ORDER.map(
        (k) =>
          water.sizes.find((s) => s.key === k) || {
            key: k,
            capacityLiters: 0,
            pricePerTanker: 0,
          }
      );
      setForm(water);

      const dl = await UtilityApi.listDaily("water", selectedCity);
      setDaily(dl.sort((a, b) => (a.date < b.date ? 1 : -1)));
    } catch (e: unknown) {
      const error = e as AxiosError;
      setError(
        (error.response?.data as ErrorResponse)?.message ||
          "تعذر تحميل الإعدادات"
      );
    }
  }, []);

  // Load current options per city
  useEffect(() => {
    loadCityData(city);
  }, [city, loadCityData]);

  const updateSize = (
    key: WaterSizeKey,
    patch: Partial<{ capacityLiters: number; pricePerTanker: number }>
  ) => {
    if (!form) return;
    setForm({
      ...form,
      sizes: (form.sizes || []).map((s) =>
        s.key === key ? { ...s, ...patch } : s
      ),
    });
  };

  const save = async () => {
    if (!form) return;
    try {
      setSaving(true);
      await UtilityApi.upsertWater(form);
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
      kind: "water",
      city,
      date: dDate,
      price: Number(dPrice),
      variant: dSize, // small|medium|large
    };
    const saved = await UtilityApi.upsertDaily(entry);
    setDaily((prev) => {
      const rest = prev.filter(
        (p) =>
          !(
            p.variant === entry.variant &&
            dayjs(p.date).isSame(entry.date, "day")
          )
      );
      return [saved, ...rest].sort((a, b) => (a.date < b.date ? 1 : -1));
    });
    setDPrice("");
  };

  const deleteDaily = async (row: DailyPriceEntry) => {
    if (row._id) {
      await UtilityApi.deleteDaily(row._id);
    } else {
      await UtilityApi.deleteDailyByKey(
        "water",
        row.city,
        row.date,
        row.variant
      );
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
        تسعير وايت الماء حسب المدينة
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
                {form.sizes.map((s) => (
                  <Grid size={{ xs: 12, md: 4 }} component="div" key={s.key}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography fontWeight={700} gutterBottom>
                          مقاس {sizeLabel(s.key)}
                        </Typography>
                        <Stack spacing={1}>
                          <TextField
                            label="السعة (لتر)"
                            size="small"
                            type="number"
                            value={s.capacityLiters}
                            onChange={(e) =>
                              updateSize(s.key, {
                                capacityLiters: Number(e.target.value),
                              })
                            }
                          />
                          <TextField
                            label="سعر الوايت الأساسي (ر.ي)"
                            size="small"
                            type="number"
                            value={s.pricePerTanker}
                            onChange={(e) =>
                              updateSize(s.key, {
                                pricePerTanker: Number(e.target.value),
                              })
                            }
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}

                <Grid size={{ xs: 12, md: 6 }} component="div">
                  <TextField
                    select
                    label="سياسة النصف"
                    size="small"
                    fullWidth
                    value={form.halfPolicy}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        halfPolicy: e.target.value as
                          | "linear"
                          | "multiplier"
                          | "fixed",
                      })
                    }
                  >
                    <MenuItem value="linear">نصف السعر</MenuItem>
                    <MenuItem value="multiplier">معامل (مثلاً 60%)</MenuItem>
                    <MenuItem value="fixed">قيمة ثابتة</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} component="div">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.allowHalf}
                        onChange={(e) =>
                          setForm({ ...form, allowHalf: e.target.checked })
                        }
                      />
                    }
                    label="السماح بنصف وايت"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} component="div">
                  <TextField
                    select
                    label="سياسة رسوم التوصيل"
                    size="small"
                    fullWidth
                    value={form.deliveryPolicy}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        deliveryPolicy: e.target.value as "flat" | "strategy",
                      })
                    }
                  >
                    <MenuItem value="flat">ثابت</MenuItem>
                    <MenuItem value="strategy">حسب المسافة</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} component="div">
                  <TextField
                    label="رسوم ثابتة (إن وجدت)"
                    size="small"
                    type="number"
                    fullWidth
                    value={form.flatFee ?? 0}
                    onChange={(e) =>
                      setForm({ ...form, flatFee: Number(e.target.value) || 0 })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    onClick={save}
                    disabled={!canSave || saving}
                  >
                    حفظ الإعدادات
                  </Button>
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
              select
              label="المقاس"
              size="small"
              value={dSize}
              onChange={(e) => setDSize(e.target.value as WaterSizeKey)}
            >
              <MenuItem value="small">صغير</MenuItem>
              <MenuItem value="medium">وسط</MenuItem>
              <MenuItem value="large">كبير</MenuItem>
            </TextField>
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
                    {dayjs(row.date).format("YYYY/MM/DD")} •{" "}
                    {row.variant ? sizeLabel(row.variant as WaterSizeKey) : "—"}{" "}
                    • {row.price} ر.ي
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
