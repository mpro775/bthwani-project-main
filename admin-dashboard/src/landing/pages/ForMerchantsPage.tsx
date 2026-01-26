// =====================================
// src/pages/ForMerchantsPage.tsx
// =====================================
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Button,
  alpha,
  useTheme,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import LandingNavbar from "../components/LandingNavbar";
import { FooterSection } from "../sections/FooterSection";
import { COLORS } from "../../theme";

function Bullet({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: React.ComponentProps<typeof Typography>["sx"];
}) {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.2} alignItems="flex-start">
      <CheckCircleOutlineIcon
        sx={{
          mt: "2px",
          fontSize: 20,
          color: alpha(theme.palette.primary.main, 0.9),
        }}
      />
      <Typography component="span" sx={sx}>
        {children}
      </Typography>
    </Stack>
  );
}

function Numbered({
  n,
  title,
  desc,

}: {
  n: number;
  title: string;
  desc: string;
  sx?: React.ComponentProps<typeof Typography>["sx"];
}) {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Chip
        label={n}
        sx={{
          borderRadius: 2,
          fontFamily: "Cairo",
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
        }}
      />
      <Box>
        <Typography sx={{ fontWeight: 800, fontFamily: "Cairo" }}>{title}</Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.8 }}
        >
          {desc}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function ForMerchantsPage() {
  const theme = useTheme();
  const [form, setForm] = useState({
    storeName: "",
    contactName: "",
    phone: "",
    city: "",
    category: "",
    payoutMethod: "",
    notes: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: axios.post('/api/leads/merchant', form)
    console.log("merchant lead =>", form);
  };

  return (
    <>
      <LandingNavbar />

      <Box
        sx={{
          py: { xs: 8, md: 10 },
          bgcolor: theme.palette.mode === "dark" ? "#0f1115" : "#fff",
        }}
      >
        <Container maxWidth="lg" dir="rtl">
          {/* Header */}
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography
              variant="h3"
              sx={{ fontFamily: "Cairo", color: COLORS.blue }}
            >
              نمِّ مبيعات متجرك مع «بثواني».
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ maxWidth: 900, lineHeight: 1.9, fontFamily: "Cairo" }}
            >
              وصول إلى عملاء جدد، محتوى وصور داخل المتجر، لوحة طلبات بسيطة،
              وتسويات مالية منتظمة.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {/* المحتوى التعريفي */}
            <Grid component="div" size={{ xs: 12, md: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                }}
              >
                <Stack spacing={3}>
                  {/* لماذا بثواني للتجار؟ */}
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AssignmentTurnedInIcon sx={{ color: COLORS.blue }} />
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: "Cairo", color: COLORS.blue }}
                      >
                        لماذا «بثواني» للتجّار؟
                      </Typography>
                    </Stack>
                    <Stack spacing={1.2} sx={{ mt: 0.5 }}>
                      <Bullet sx={{ color: COLORS.blue }}>
                        ظهور متجرك لآلاف العملاء القريبين من موقعك.
                      </Bullet>
                      <Bullet sx={{ color: COLORS.blue }}>
                        صور وقوائم محدثة تساعدك على البيع.
                      </Bullet>
                      <Bullet sx={{ color: COLORS.blue }}>
                        دعم عمليات الطلب والتوصيل دون تعقيد.
                      </Bullet>
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* كيف تبدأ؟ 4 خطوات */}
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ListAltIcon sx={{ color: COLORS.blue }} />
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: "Cairo", color: COLORS.blue }}
                      >
                        كيف تبدأ؟ (4 خطوات)
                      </Typography>
                    </Stack>
                    <Stack spacing={1.3} sx={{ mt: 0.5 }}>
                      <Numbered
                        n={1}
                        title="طلب انضمام"
                        desc="بيانات المتجر الأساسية وصورة واجهة المتجر."
                      />
                      <Numbered
                        n={2}
                        title="تفعيل القوائم"
                        desc="رفع قائمة الأسعار والصور (نساعدك في ذلك)."
                      />
                      <Numbered
                        n={3}
                        title="التدريب السريع"
                        desc="طريقة إدارة الطلبات والعروض."
                      />
                      <Numbered
                        n={4}
                        title="الانطلاق"
                        desc="استقبل طلباتك الأولى وتابع الأداء."
                      />
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* المتطلبات KYC-lite */}
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AssignmentTurnedInIcon sx={{ color: COLORS.blue }} />
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: "Cairo", color: COLORS.blue }}
                      >
                        المتطلبات (KYC-lite)
                      </Typography>
                    </Stack>
                    <Stack spacing={1.2} sx={{ mt: 0.5 }}>
                      <Bullet sx={{ color: COLORS.blue }}>
                        اسم المتجر، السجل/الترخيص (إن وجد)، المالك أو المفوّض،
                        موقع المتجر، هاتف تواصل.
                      </Bullet>
                      <Bullet sx={{ color: COLORS.blue }}>
                        حساب محفظة/تحويل لتسوية المستحقات.
                      </Bullet>
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* السيولة والتسويات */}
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MonetizationOnOutlinedIcon />
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: "Cairo", color: COLORS.blue }}
                      >
                        السيولة والتسويات
                      </Typography>
                    </Stack>
                    <Stack spacing={1.2} sx={{ mt: 0.5 }}>
                      <Bullet sx={{ color: COLORS.blue }}>
                        دورات تسوية منتظمة وفق آلية المحفظة (صافي المتحصلات بعد
                        الرسوم).
                      </Bullet>
                      <Bullet>
                        تقارير واضحة قابلة للتنزيل من لوحة المتجر.
                      </Bullet>
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* الدعم */}
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SupportAgentOutlinedIcon sx={{ color: COLORS.blue }} />
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: "Cairo", color: COLORS.blue }}
                      >
                        الدعم
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.9, fontFamily: "Cairo" }}
                    >
                      فريق علاقات التجّار يساندك في التسعير، الصور، والعروض
                      الموسمية.
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* نموذج الانضمام */}
            <Grid component="div" size={{ xs: 12, md: 5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                }}
              >
                <Typography sx={{ fontFamily: "Cairo", mb: 1.5 }}>
                  نموذج الانضمام
                </Typography>
                <Box component="form" onSubmit={submit}>
                  <Stack spacing={1.5}>
                    <TextField
                      label="اسم المتجر"
                      required
                      value={form.storeName}
                      onChange={(e) =>
                        setForm({ ...form, storeName: e.target.value })
                      }
                    />
                    <TextField
                      label="اسم المالك/المفوّض"
                      required
                      value={form.contactName}
                      onChange={(e) =>
                        setForm({ ...form, contactName: e.target.value })
                      }
                    />
                    <TextField
                      label="رقم الهاتف"
                      required
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                    <TextField
                      label="المدينة"
                      required
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                    <TextField
                      select
                      label="فئة المتجر"
                      required
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      {[
                        "مطاعم",
                        "سوبرماركت",
                        "خضار وفواكه",
                        "صيدلية",
                        "إلكترونيات",
                        "أخرى",
                      ].map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="طريقة التسوية (اختياري)"
                      value={form.payoutMethod}
                      onChange={(e) =>
                        setForm({ ...form, payoutMethod: e.target.value })
                      }
                      helperText="محفظة إلكترونية / تحويل بنكي / حوالة"
                    >
                      {["محفظة إلكترونية", "تحويل بنكي", "حوالة"].map((m) => (
                        <MenuItem key={m} value={m}>
                          {m}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      label="ملاحظات (اختياري)"
                      multiline
                      minRows={3}
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                    />

                    <Button type="submit" variant="contained" size="large" sx={{ fontFamily: "Cairo" }}>
                      إرسال الطلب
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <FooterSection />
    </>
  );
}
