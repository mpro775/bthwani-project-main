// =====================================
// src/pages/AboutPage.tsx
// =====================================
import React, { useMemo, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Divider,
  Snackbar,
  Alert,
  alpha,
  useTheme,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // ✅ Grid2 الأحدث
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Link as RouterLink } from "react-router-dom";

import LandingNavbar from "../components/LandingNavbar";
import { FooterSection } from "../sections/FooterSection";
import BRAND from "../brand";
import { LINKS } from "../links";

function Bullet({ children }: { children: React.ReactNode }) {
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
      <Typography component="span">{children}</Typography>
    </Stack>
  );
}

export default function AboutPage() {
  const theme = useTheme();
  const cities: string[] = Array.isArray(BRAND?.cities) ? BRAND.cities : [];
  const hasCities = cities.length > 0;

  // نسخ رابط الويب
  const [snackOpen, setSnackOpen] = useState(false);
  const copyWebLink = useCallback(async () => {
    try {
      if (LINKS?.webApp) {
        await navigator.clipboard.writeText(LINKS.webApp);
        setSnackOpen(true);
      }
    } catch {
      /* تجاهل */
    }
  }, []);

  // بطاقات نقاط قوّة صغيرة في الهيرو
  const heroBadges = useMemo(
    () => [
      { icon: <SpeedOutlinedIcon />, label: "توصيل أسرع" },
      { icon: <ShieldOutlinedIcon />, label: "أمان وخصوصية" },
      { icon: <InsightsOutlinedIcon />, label: "تقارير للتجار" },
      { icon: <FavoriteBorderIcon />, label: "دعم محلي" },
    ],
    []
  );

  return (
    <>
      <LandingNavbar />

      {/* ===== Hero ===== */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `radial-gradient(1000px 500px at 100% 0%, ${alpha(
            theme.palette.primary.main,
            0.1
          )}, transparent 60%), radial-gradient(1000px 500px at 0% 100%, ${alpha(
            theme.palette.info.main,
            0.14
          )}, transparent 60%), linear-gradient(180deg, ${alpha(
            theme.palette.background.default,
            1
          )}, ${alpha(theme.palette.background.default, 1)})`,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <Container maxWidth="lg" dir="rtl">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Chip
              label="منصة يمنية للتوصيل والخدمات"
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 800,
                borderColor: alpha(theme.palette.primary.main, 0.35),
              }}
            />
            <Typography
              variant="h3"
              sx={{ fontWeight: 900, fontSize: { xs: "2rem", md: "2.6rem" } }}
            >
              من نحن
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ lineHeight: 1.9, maxWidth: 920 }}
            >
              «بثواني» منصة يمنية ذكية للتوصيل والخدمات اليومية، تركّز على
              السرعة والموثوقية ودعم المتاجر المحلية، لتكون الرفيق اليومي الأول
              لكل يمني.
            </Typography>

            {BRAND?.tagline && (
              <Chip
                label={BRAND.tagline}
                variant="outlined"
                sx={{
                  fontWeight: 800,
                  borderColor: alpha(theme.palette.primary.main, 0.35),
                }}
              />
            )}

            {/* شارات سريعة */}
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              justifyContent="center"
            >
              {heroBadges.map((b) => (
                <Chip
                  key={b.label}
                  icon={b.icon}
                  label={b.label}
                  sx={{ fontWeight: 700 }}
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ===== محتوى رئيسي ===== */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg" dir="rtl">
          <Grid container spacing={3}>
            {/* رؤيتنا */}
            <Grid size={{xs: 12, md: 6}}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  background: alpha(theme.palette.background.paper, 0.7),
                  backdropFilter: "blur(6px)",
                  height: "100%",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <FlagOutlinedIcon />
                  <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                    رؤيتنا
                  </Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ lineHeight: 1.9, fontFamily: "Cairo" }}>
                  أن تصبح «بثواني» أسلوب حياة متكامل لاحتياجات اليوم—من الطعام
                  والمقاضي والمستحضرات، إلى المهام السريعة—بجودة موحّدة وتجربة
                  سلسة.
                </Typography>
              </Paper>
            </Grid>

            {/* رسالتنا */}
            <Grid size={{xs: 12, md: 6}}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  background: alpha(theme.palette.background.paper, 0.7),
                  height: "100%",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <RocketLaunchOutlinedIcon />
                  <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                    رسالتنا
                  </Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ lineHeight: 1.9, fontFamily: "Cairo" }}>
                  تبسيط حياة الناس عبر ربطهم بمتاجرهم القريبة وخدمات موثوقة،
                  بسرعة شفّافة، وتمكين المتاجر من النمو بأدوات سهلة وتقارير
                  واضحة.
                </Typography>
              </Paper>
            </Grid>

            {/* قيمنا */}
            <Grid size={{xs: 12, md: 6}}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  height: "100%",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <FavoriteBorderOutlinedIcon />
                  <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                    قيمنا
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {[
                    "السرعة",
                    "الموثوقية",
                    "الشفافية",
                    "الأمان",
                    "الاحترام",
                    "دعم المتاجر المحلية",
                    "الابتكار",
                    "الخصوصية",
                  ].map((v) => (
                    <Chip key={v} label={v} sx={{ fontFamily: "Cairo" }} />
                  ))}
                </Stack>
              </Paper>
            </Grid>

            {/* أهدافنا */}
            <Grid size={{xs: 12, md: 6}}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  height: "100%",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <StorefrontOutlinedIcon />
                  <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                    أهدافنا
                  </Typography>
                </Stack>

                <Stack spacing={1.1}>
                    <Bullet>رفع كفاءة التشغيل وتقليل زمن التوصيل.</Bullet>
                  <Bullet>تحسين تجربة المستخدم وزيادة التكرار والولاء.</Bullet>
                  <Bullet>تمكين المتاجر بأدوات تسوية وتقارير شفافة.</Bullet>
                  <Bullet>تعزيز الأثر المجتمعي ودعم الاقتصاد المحلي.</Bullet>
                  <Bullet>
                    تنويع مصادر الإيرادات والتوسع الجغرافي المدروس.
                  </Bullet>
                </Stack>
              </Paper>
            </Grid>

            {/* ماذا نقدّم */}
            <Grid size={{xs: 12}}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <LocalShippingOutlinedIcon />
                  <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                    ماذا نقدّم؟
                  </Typography>
                </Stack>
                <Typography
                  color="text.secondary"
                  sx={{ mb: 2, lineHeight: 1.9, fontFamily: "Cairo" }}
                >
                  تطبيق شامل يقدّم: مطاعم، سوبرماركت/بقالة، خضار وفواكه، صيدلية،
                  مياه، غاز منزلي (حيثما يتوفّر)، هدايا وورد، وخدمة
                  «فزعة/أخدمني».
                </Typography>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {[
                    "مطاعم",
                    "سوبرماركت",
                    "خضار وفواكه",
                    "صيدلية",
                    "مياه",
                    "غاز منزلي",
                    "هدايا وورد",
                    "فزعة (أخدمني)",
                  ].map((s) => (
                    <Chip key={s} label={s} sx={{ fontFamily: "Cairo" }} />
                  ))}
                </Stack>
              </Paper>
            </Grid>

            {/* التغطية الجغرافية */}
            <Grid size={{xs: 12, md: 7}}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  height: "100%",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <MapOutlinedIcon />
                  <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                    التغطية الجغرافية
                  </Typography>
                </Stack>

                <Typography
                  color="text.secondary"
                  sx={{ mb: 1.5, lineHeight: 1.9, fontFamily: "Cairo" }}
                >
                  نعمل على تغطية المدن الرئيسية تدريجيًا مع توحيد جودة التجربة.
                  {hasCities ? " المدن المتاحة حاليًا:" : ""}
                </Typography>

                {hasCities ? (
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {cities.map((c) => (
                      <Chip key={c} label={c} sx={{ fontFamily: "Cairo" }} />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "Cairo" }}>
                    تُعلن المدن المدعومة عند الإطلاق التجريبي.
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* الثقة والأمان / الخصوصية / الدعم */}
            <Grid size={{xs: 12, md: 5}}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  height: "100%",
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ShieldOutlinedIcon />
                    <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                      الثقة والأمان
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.9, fontFamily: "Cairo" }}>
                    نلتزم بمعايير السلامة للسائقين والعملاء، وسياسات خصوصية
                    واضحة، ودعم فني سريع داخل الدردشة وخارجها.
                  </Typography>

                  <Divider />

                  <Stack direction="row" spacing={1} alignItems="center">
                    <SecurityOutlinedIcon />
                    <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                      الخصوصية
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.9, fontFamily: "Cairo" }}>
                    تُحترم بياناتك وتُستخدم فقط لتقديم الخدمة وتحسينها، ولا
                    تُشارك مع طرف ثالث إلا وفق المتطلبات القانونية.
                  </Typography>

                  <Divider />

                  <Stack direction="row" spacing={1} alignItems="center">
                    <SupportAgentOutlinedIcon />
                    <Typography variant="h6" sx={{ fontFamily: "Cairo" }}>
                      كيف نتواصل؟
                    </Typography>
                  </Stack>
                  <Stack spacing={0.8}>
                    {LINKS?.phone && (
                      <Typography sx={{ fontFamily: "Cairo" }}>
                        الهاتف: <strong>{LINKS.phone}</strong>
                      </Typography>
                    )}
                    {LINKS?.whatsapp && (
                      <Typography sx={{ fontFamily: "Cairo" }}>
                        واتساب:{" "}
                        <Button
                          href={LINKS.whatsapp}
                          target="_blank"
                          rel="noopener"
                          size="small"
                          sx={{ px: 0, textTransform: "none", fontFamily: "Cairo" }}
                        >
                          تواصل الآن
                        </Button>
                      </Typography>
                    )}
                    {LINKS?.email && (
                      <Typography sx={{ fontFamily: "Cairo" }}>
                        البريد: <strong>{LINKS.email}</strong>
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* ===== إحصائيات سريعة ===== */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {[
              { label: "متاجر شريكة", value: BRAND?.stats?.stores ?? "100+" },
              { label: "طلبات ناجحة", value: BRAND?.stats?.orders ?? "50K+" },
              {
                label: "مدن مُغطاة",
                value: (cities?.length || 0) > 0 ? cities.length : "قريبًا",
              },
            ].map((s) => (
              <Grid key={s.label} size={{xs: 12, sm: 4}}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    textAlign: "center",
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {s.value}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
                    {s.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* ===== CTA سفلي مع تطبيق الويب ===== */}
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              textAlign: "center",
              background:
                theme.palette.mode === "dark"
                  ? alpha("#fff", 0.02)
                  : alpha(theme.palette.primary.main, 0.04),
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                جاهز لتجربة «بثواني»؟
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.2}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/services"
                  sx={{ fontWeight: 900 }}
                  startIcon={<StorefrontOutlinedIcon />}
                >
                  ابدأ الطلب
                </Button>

                {/* تطبيق الويب */}
                <Tooltip title="يفتح في المتصفح">
                  <span>
                    <Button
                      variant="outlined"
                      href={LINKS?.webApp}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontWeight: 800 }}
                      startIcon={<OpenInNewIcon />}
                      disabled={!LINKS?.webApp}
                    >
                      تطبيق الويب
                    </Button>
                  </span>
                </Tooltip>

                <Button
                  variant="text"
                  onClick={copyWebLink}
                  sx={{ fontWeight: 800 }}
                  startIcon={<ContentCopyIcon />}
                  disabled={!LINKS?.webApp}
                >
                  نسخ رابط الويب
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>

      <FooterSection />

      <Snackbar
        open={snackOpen}
        autoHideDuration={2200}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSnackOpen(false)}
          sx={{ fontWeight: 700 }}
        >
          تم نسخ رابط تطبيق الويب ✅
        </Alert>
      </Snackbar>
    </>
  );
}
