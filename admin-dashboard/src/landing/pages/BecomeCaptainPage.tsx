// =====================================
// src/pages/BecomeCaptainPage.tsx
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
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import { FooterSection } from "../sections/FooterSection";
import LandingNavbar from "../components/LandingNavbar";

function Bullet({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.2} alignItems="flex-start">
      <CheckCircleOutlineIcon
        sx={{
          mt: "2px",
          fontSize: 20,
          color: alpha(theme.palette.secondary.main, 0.9),
        }}
      />
      <Typography component="span">{children}</Typography>
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
}) {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Chip
        label={n}
        sx={{
          fontFamily: "Cairo",
          borderRadius: 2,
          bgcolor: alpha(theme.palette.secondary.main, 0.12),
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
        }}
      />
      <Box>
        <Typography sx={{ fontFamily: "Cairo" }}>{title}</Typography>
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

export default function BecomeCaptainPage() {
  const theme = useTheme();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    vehicle: "دراجة",
    experience: "",
    nationalId: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: axios.post('/api/leads/captain', form)
    console.log("captain lead =>", form);
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
            <Typography variant="h3" sx={{ fontFamily: "Cairo" }}>
              دخلك يبدأ من أقرب مشوار.
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ maxWidth: 900, lineHeight: 1.9, fontFamily: "Cairo" }}
            >
              اعمل في الأوقات التي تناسبك، اختر الرحلات القريبة، وتابع أرباحك
              أولًا بأول.
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
                  {/* المزايا */}
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WorkspacePremiumOutlinedIcon />
                      <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                        المزايا
                      </Typography>
                    </Stack>
                    <Stack spacing={1.2} sx={{ mt: 0.5 }}>
                      <Bullet>مرونة العمل بالساعة/الوردية.</Bullet>
                      <Bullet>رحلات قريبة من موقعك.</Bullet>
                      <Bullet>حوافز أوقات الذروة وجودة الخدمة.</Bullet>
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* المتطلبات */}
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <HealthAndSafetyOutlinedIcon />
                      <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                        المتطلبات
                      </Typography>
                    </Stack>
                    <Stack spacing={1.2} sx={{ mt: 0.5 }}>
                      <Bullet>
                        بطاقة هوية سارية، وسيلة نقل (دراجة/سيارة)، هاتف ذكي،
                        التزام بالزي والسلامة.
                      </Bullet>
                      <Bullet>
                        سلوك احترافي واحترام لقواعد المرور والعملاء.
                      </Bullet>
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* خطوات الانضمام */}
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ListAltIcon />
                      <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                        خطوات الانضمام (4 خطوات)
                      </Typography>
                    </Stack>
                    <Stack spacing={1.3} sx={{ mt: 0.5 }}>
                      <Numbered
                        n={1}
                        title="تقديم الطلب"
                        desc="بياناتك الأساسية وصورة الهوية."
                      />
                      <Numbered
                        n={2}
                        title="التحقق والتدريب السريع"
                        desc="إرشادات السلامة والخدمة."
                      />
                      <Numbered
                        n={3}
                        title="تجهيز الأدوات"
                        desc="حقيبة/صندوق، تطبيق الكابتن، اختبار رحلة."
                      />
                      <Numbered
                        n={4}
                        title="الانطلاق"
                        desc="استلام الطلبات القريبة وبدء الكسب."
                      />
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* المدفوعات */}
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MonetizationOnOutlinedIcon />
                      <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                        المدفوعات
                      </Typography>
                    </Stack>
                    <Stack spacing={1.2} sx={{ mt: 0.5 }}>
                      <Bullet>
                        أرباحك تُعرض في محفظتك داخل التطبيق مع دورات تسوية
                        منتظمة.
                      </Bullet>
                      <Bullet>
                        مكافآت للالتزام والجودة والتغطية في الذروة.
                      </Bullet>
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* السلامة والالتزام */}
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <HealthAndSafetyOutlinedIcon />
                      <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                        السلامة والالتزام
                      </Typography>
                    </Stack>
                    <Stack spacing={1.2} sx={{ mt: 0.5 }}>
                      <Bullet>
                        ارتدِ الخوذة والزيّ، واحترم الإشارات وقوانين المرور.
                      </Bullet>
                      <Bullet>
                        كل التواصل مع العميل والمتجر داخل الدردشة.
                      </Bullet>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* نموذج التسجيل */}
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
                  سجّل اهتمامك
                </Typography>
                <Box component="form" onSubmit={submit}>
                  <Stack spacing={1.5}>
                    <TextField
                      label="الاسم الكامل"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
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
                      label="نوع المركبة"
                      value={form.vehicle}
                      onChange={(e) =>
                        setForm({ ...form, vehicle: e.target.value })
                      }
                    >
                      {["دراجة", "سيارة"].map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="رقم الهوية (اختياري)"
                      value={form.nationalId}
                      onChange={(e) =>
                        setForm({ ...form, nationalId: e.target.value })
                      }
                    />
                    <TextField
                      label="خبرة سابقة (اختياري)"
                      value={form.experience}
                      onChange={(e) =>
                        setForm({ ...form, experience: e.target.value })
                      }
                    />
                    <Button type="submit" variant="contained" size="large" sx={{ fontFamily: "Cairo" }}>
                      إرسال
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
