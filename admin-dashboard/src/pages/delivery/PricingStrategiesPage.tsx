import  { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import axios from "../../utils/axios";

interface Tier {
  minDistance: number;
  maxDistance: number;
  pricePerKm: number;
}

interface Strategy {
  _id: string;
  name: string;
  baseDistance: number;
  basePrice: number;
  tiers: Tier[];
  defaultPricePerKm: number;
  // اختياريًا:
  createdAt?: string;
  updatedAt?: string;
}

export default function PricingSettingsPage() {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [form, setForm] = useState<Partial<Strategy>>({
    name: "",
    baseDistance: 0,
    basePrice: 0,
    tiers: [],
    defaultPricePerKm: 0,
  });

  // جلب الاستراتيجية عند التحميل
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<Strategy[]>("/pricing-strategies"); // <-- مصفوفة + مع سلاش
        const list = Array.isArray(res.data) ? res.data : [res.data as unknown as Strategy];
        const first = list[0];
        if (first) {
          setStrategy(first);
          // انسخ القيم بوضوح لتجنّب مراجع المصفوفات
          setForm({
            _id: first._id,
            name: first.name,
            baseDistance: first.baseDistance,
            basePrice: first.basePrice,
            tiers: first.tiers?.map(t => ({ ...t })) ?? [],
            defaultPricePerKm: first.defaultPricePerKm,
          });
        } else {
          setStrategy(null);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);
  
  // إضافة شريحة جديدة
  const addTier = () => {
    setForm((f) => ({
      ...f,
      tiers: [
        ...(f.tiers || []),
        { minDistance: 0, maxDistance: 0, pricePerKm: 0 },
      ],
    }));
  };

  // حذف شريحة
  const removeTier = (index: number) => {
    setForm((f) => ({
      ...f,
      tiers: (f.tiers || []).filter((_, i) => i !== index),
    }));
  };

  // تحديث قيمة ضمن شريحة
  const updateTier = (
    index: number,
    field: keyof Tier,
    value: number
  ) => {
    setForm((f) => ({
      ...f,
      tiers: (f.tiers || []).map((t, i) =>
        i === index ? { ...t, [field]: value } : t
      ),
    }));
  };

  // حفظ التعديلات
  const save = async () => {
    try {
      const payload: Omit<Strategy, "_id"> = {
        name: form.name ?? "",
        baseDistance: Number(form.baseDistance ?? 0),
        basePrice: Number(form.basePrice ?? 0),
        tiers: (form.tiers ?? []).map(t => ({
          minDistance: Number(t.minDistance ?? 0),
          maxDistance: Number(t.maxDistance ?? 0),
          pricePerKm: Number(t.pricePerKm ?? 0),
        })),
        defaultPricePerKm: Number(form.defaultPricePerKm ?? 0),
      };
  
      let res;
      if (form._id) {
        res = await axios.put<Strategy>(`/pricing-strategies/${form._id}`, payload);
      } else if (strategy?._id) {
        res = await axios.put<Strategy>(`/pricing-strategies/${strategy._id}`, payload);
      } else {
        // لا توجد استراتيجية محفوظة من قبل؟ أنشئ واحدة
        res = await axios.post<Strategy>("/pricing-strategies", payload);
      }
  
      const s = res.data;
      setStrategy(s);
      setForm({
        _id: s._id,
        name: s.name,
        baseDistance: s.baseDistance,
        basePrice: s.basePrice,
        tiers: s.tiers?.map(t => ({ ...t })) ?? [],
        defaultPricePerKm: s.defaultPricePerKm,
      });
      alert("تم حفظ الإعدادات بنجاح");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الحفظ");
    }
  };
  

  if (!strategy) return <Typography>جارٍ تحميل الإعدادات...</Typography>;

  return (
    <Box p={3} maxWidth={700} mx="auto">
      <Typography variant="h5" mb={3}>
        إعدادات التسعير
      </Typography>

      <Paper sx={{ p: 3 }}>
        <TextField
          label="الاسم الوصفي للاستراتيجية"
          fullWidth
          margin="normal"
          value={form.name || ""}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <Box display="flex" gap={2} mt={2}>
          <TextField
            label="المسافة الابتدائية (كم)"
            type="number"
            fullWidth
            value={form.baseDistance ?? 0}
            onChange={(e) =>
              setForm({ ...form, baseDistance: Number(e.target.value) })
            }
          />
          <TextField
            label="السعر الابتدائي (ريال)"
            type="number"
            fullWidth
            value={form.basePrice ?? 0}
            onChange={(e) =>
              setForm({ ...form, basePrice: Number(e.target.value) })
            }
          />
        </Box>

        <Typography variant="subtitle1" mt={3}>
          شرائح المسافات (Ranges)
        </Typography>
        {(form.tiers || []).map((tier, idx) => (
          <Box
            key={idx}
            display="flex"
            alignItems="center"
            gap={1}
            mt={1}
          >
            <TextField
              label="من (كم)"
              type="number"
              value={tier.minDistance}
              onChange={(e) =>
                updateTier(idx, "minDistance", Number(e.target.value))
              }
            />
            <TextField
              label="إلى (كم)"
              type="number"
              value={tier.maxDistance}
              onChange={(e) =>
                updateTier(idx, "maxDistance", Number(e.target.value))
              }
            />
            <TextField
              label="سعر الكيلو (ريال)"
              type="number"
              value={tier.pricePerKm}
              onChange={(e) =>
                updateTier(idx, "pricePerKm", Number(e.target.value))
              }
            />
            <IconButton color="error" onClick={() => removeTier(idx)}>
              <Delete />
            </IconButton>
          </Box>
        ))}

        <Box mt={2}>
          <Button startIcon={<Add />} onClick={addTier}>
            إضافة شريحة جديدة
          </Button>
        </Box>

        <TextField
          label="سعر الكيلو بعد آخر شريحة (ريال)"
          type="number"
          fullWidth
          margin="normal"
          value={form.defaultPricePerKm ?? 0}
          onChange={(e) =>
            setForm({ ...form, defaultPricePerKm: Number(e.target.value) })
          }
        />

        <Box mt={3} textAlign="right">
          <Button variant="contained" onClick={save}>
            حفظ الإعدادات
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
