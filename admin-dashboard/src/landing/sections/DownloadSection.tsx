// =============================
// /src/landing/sections/DownloadSection.tsx
// =============================
import React, { useMemo, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Chip,
  Snackbar,
  Alert,
  alpha,
  Card,
  CardContent,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Apple,
  Android,
  OpenInNew,
  Link as LinkIcon,
  ContentCopy,
} from "@mui/icons-material";
import { LINKS } from "../links";
import { COLORS } from "../../theme";

type Platform = "android" | "ios" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua =
    navigator.userAgent ||
    navigator.vendor ||
    (window as unknown as { opera?: string }).opera ||
    "";
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window)) return "ios";
  return "other";
}

export const DownloadSection: React.FC = () => {
  const platform = useMemo(detectPlatform, []);
  const [snackOpen, setSnackOpen] = useState(false);

  const copyWebLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(LINKS.webApp);
      setSnackOpen(true);
    } catch {
      // تجاهل بصمت
    }
  }, []);

  // المتاجر + الويب (مرتّبة حسب الجهاز، ويب ثابت بالأخير)
  const stores = useMemo(() => {
    const appStore = {
      key: "ios",
      label: "App Store",
      href: LINKS.appStore,
      icon: <Apple />,
      plat: "ios" as Platform,
      color: "primary" as const,
    };
    const googlePlay = {
      key: "gp",
      label: "Google Play",
      href: "https://play.google.com/store/apps/details?id=com.bthwani.app",
      icon: <Android />,
      plat: "android" as Platform,
      color: "primary" as const,
    };
    const webApp = {
      key: "web",
      label: "تطبيق الويب",
      href: LINKS.webApp,
      icon: <OpenInNew />,
      plat: "other" as Platform,
      color: "secondary" as const,
    };

    const base = [appStore, googlePlay];

    const sorted =
      platform === "android"
        ? [...base].sort((a, b) =>
            a.plat === "android" && b.plat !== "android" ? -1 : 1
          )
        : platform === "ios"
        ? [...base].sort((a, b) =>
            a.plat === "ios" && b.plat !== "ios" ? -1 : 1
          )
        : base;

    return [...sorted, webApp];
  }, [platform]);

  const suggestionText =
    platform === "android"
      ? "اقتراح: جهازك Android"
      : platform === "ios"
      ? "اقتراح: جهازك iOS"
      : "متاح على المتاجر وتطبيق الويب";

  return (
    <Box
      id="download"
      component="section"
      sx={{
        position: "relative",
        py: { xs: 8, md: 12 },
        background: `radial-gradient(1200px 600px at 100% 0%, ${alpha(
          COLORS.primary,
          0.08
        )}, transparent 60%), radial-gradient(1200px 600px at 0% 100%, ${alpha(
          COLORS.blue,
          0.1
        )}, transparent 60%), linear-gradient(180deg, ${alpha(
          COLORS.white,
          1
        )}, ${alpha(COLORS.white, 1)})`,
        borderTop: `1px solid ${alpha(COLORS.blue, 0.12)}`,
        borderBottom: `1px solid ${alpha(COLORS.blue, 0.12)}`,
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg" dir="rtl">
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Stack spacing={1.5}>
            <Chip
              label="متاح الآن"
              color="primary"
              variant="outlined"
              sx={{
                alignSelf: "center",
                fontFamily: "Cairo",
                borderColor: alpha(COLORS.primary, 0.4),
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontFamily: "Cairo",
                fontSize: { xs: "1.9rem", md: "2.6rem" },
                letterSpacing: "-0.3px",
                color: COLORS.blue,
              }}
            >
              حمّل «بثواني» أو استخدمه على الويب
            </Typography>
            <Typography
              variant="h6"
              color={COLORS.blue}
              sx={{
                lineHeight: 1.9,
                fontFamily: "Cairo",
                maxWidth: 780,
                mx: "auto",
                opacity: 0.9,
              }}
            >
              تجربة طلب سهلة وسريعة وموثوقة — على iOS وAndroid وتطبيق الويب من
              أي متصفح.
            </Typography>
          </Stack>

          <Card
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 980,
              mx: "auto",
              borderRadius: 4,
              backdropFilter: "blur(8px)",
              border: `1px solid ${alpha(COLORS.blue, 0.12)}`,
              background: alpha(COLORS.white, 0.7),
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                alignItems="center"
                justifyContent="space-between"
              >
                {/* العنوان الصغير + الشارة */}
                <Stack
                  spacing={1}
                  sx={{ textAlign: { xs: "center", md: "right" } }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontFamily: "Cairo", color: COLORS.blue }}
                  >
                    ابدأ خلال ثوانٍ
                  </Typography>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={suggestionText}
                    sx={{
                      alignSelf: { xs: "center", md: "flex-start" },
                      fontWeight: 700,
                      borderColor: alpha(COLORS.primary, 0.35),
                    }}
                  />
                </Stack>

                {/* الأزرار */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.2}
                  useFlexGap
                  flexWrap="wrap"
                  justifyContent="center"
                  alignItems="center"
                >
                  {stores.map((s) => (
                    <Tooltip
                      key={s.key}
                      title={s.key === "web" ? "يفتح في المتصفح" : s.label}
                    >
                      <span>
                        <Button
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={s.icon}
                          variant={s.key === "web" ? "outlined" : "contained"}
                          color={s.color}
                          size="large"
                          disableElevation
                          sx={{
                            px: 3,
                            py: 1.6,
                            fontFamily: "Cairo",
                            fontSize: { xs: "1rem", md: "1.05rem" },
                            borderRadius: 2.6,
                            textTransform: "none",
                            borderWidth: 2,
                            "&:hover": {
                              borderWidth: 2,
                            },
                          }}
                        >
                          {s.label}
                        </Button>
                      </span>
                    </Tooltip>
                  ))}
                </Stack>
              </Stack>

              {/* فاصل وعناصر الويب */}
              <Divider sx={{ my: 3, borderColor: alpha(COLORS.blue, 0.08) }} />
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.2}
                alignItems="center"
                justifyContent="center"
              >
                <Chip
                  icon={<LinkIcon />}
                  label="تطبيق الويب يعمل على كل الأجهزة"
                  variant="outlined"
                  sx={{
                    fontFamily: "Cairo",
                    borderColor: alpha(COLORS.primary, 0.25),
                  }}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    onClick={copyWebLink}
                    startIcon={<ContentCopy />}
                    variant="text"
                    sx={{ fontFamily: "Cairo" }}
                  >
                    نسخ رابط الويب
                  </Button>
                  <Button
                    href={LINKS.webApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<OpenInNew />}
                    variant="text"
                    sx={{ fontFamily: "Cairo" }}
                  >
                    فتح تطبيق الويب
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>

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
    </Box>
  );
};
