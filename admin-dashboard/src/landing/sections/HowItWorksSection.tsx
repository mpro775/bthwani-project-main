// src/landing/sections/HowItWorksSection.tsx
import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Download,
  ShoppingCart,
  DeliveryDining,
  CheckCircle,
} from "@mui/icons-material";
import { COLORS } from "../../theme";

const MotionPaper = motion.create(Paper);

const STEPS = [
  {
    icon: Download,
    title: "حمّل التطبيق",
    desc: "سجّل حسابك خلال ثوانٍ واختر مدينتك.",
  },
  {
    icon: ShoppingCart,
    title: "اختر طلبك",
    desc: "من المطاعم والسوبرماركت والصيدلية والخضار والفزعة.",
  },
  {
    icon: DeliveryDining,
    title: "تأكيد وتتبع",
    desc: "ادفع نقدًا أو إلكترونيًا وتابع الكابتن في الخريطة.",
  },
  {
    icon: CheckCircle,
    title: "استلم واستمتع",
    desc: "توصيل سريع وموثوق، تقييم وختام لطيف.",
  },
];

export const HowItWorksSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      id="how-it-works"
      component="section"
      sx={{
        position: "relative",
        py: { xs: 10, md: 12 },
        overflow: "hidden",
        backgroundColor: COLORS.white,
      }}
    >
      <Container>
        {/* عنوان + تمهيد */}
        <Stack
          spacing={1.2}
          alignItems="center"
          sx={{ mb: { xs: 4, md: 6 }, textAlign: "center" }}
        >
          <Typography
            variant="overline"
            sx={{
              fontFamily: "Cairo",
              letterSpacing: 2,
              color: COLORS.blue,
              fontSize: 24,
            }}
            color="text.secondary"
          >
            اتبع الخطوات الأربع
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontFamily: "Cairo",
              fontSize: { xs: "2rem", md: "3rem" },
              backgroundImage: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primary})`,
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            كيف تعمل «بثواني»؟
          </Typography>
        </Stack>

        {/* شريط تسلسلي بديل (بدون Stepper) */}
        <Box
          aria-label="تسلسل الخطوات"
          sx={{
            mb: { xs: 5, md: 7 },
            display: "grid",
            gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`,
            alignItems: "center",
            gap: 2,
            px: { xs: 2, md: 8 },
          }}
        >
          {STEPS.map((s, i) => (
            <Stack
              key={s.title}
              alignItems="center"
              sx={{ position: "relative" }}
            >
              {/* الخط الواصل (لا يظهر قبل الأولى) */}
              {i > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    insetInlineStart: "-56%",
                    width: "100%",
                    height: 3,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    opacity: 0.35,
                  }}
                />
              )}
              {/* الدائرة الرقمية */}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "Cairo",
                  fontSize: 14,
                  color: theme.palette.common.white,
                  background: ` ${COLORS.blue}`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  boxShadow: `0 6px 16px ${alpha(
                    theme.palette.primary.main,
                    0.28
                  )}`,
                }}
              >
                {i + 1}
              </Box>
              <Typography
                variant="caption"
                sx={{ mt: 1, fontFamily: "Cairo", textAlign: "center" }}
              >
                {s.title}
              </Typography>
            </Stack>
          ))}
        </Box>

        {/* بطاقات الخطوات */}
        <Grid container spacing={3}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Grid component="div" size={{ xs: 12, md: 3 }} key={s.title}>
                <MotionPaper
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    height: "100%",
                    borderRadius: 3,
                    position: "relative",
                    background: `linear-gradient(${
                      theme.palette.mode === "dark" ? "#0b0d10" : "#ffffff"
                    }, ${
                      theme.palette.mode === "dark" ? "#0b0d10" : "#ffffff"
                    }) padding-box,
                                 linear-gradient(135deg, ${alpha(
                                   theme.palette.primary.main,
                                   0.5
                                 )}, ${alpha(
                      theme.palette.secondary.main,
                      0.5
                    )}) border-box`,
                    border: "1px solid transparent",
                    backdropFilter: "blur(8px)",
                    textAlign: "center",
                  }}
                >
                  {/* شارة رقم الخطوة */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      insetInlineStart: 12,
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 800,
                      color: theme.palette.primary.contrastText,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.main})`,
                    }}
                  >
                    الخطوة {i + 1}
                  </Box>

                  <Stack alignItems="center" spacing={1.5} sx={{ pt: 1 }}>
                    <Box
                      sx={{
                        width: 68,
                        height: 68,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        background: alpha(theme.palette.primary.main, 0.12),
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.35
                        )}`,
                        boxShadow: `0 12px 28px ${alpha(
                          theme.palette.primary.main,
                          0.18
                        )}`,
                      }}
                    >
                      <Icon
                        sx={{ fontSize: 34, color: theme.palette.primary.main }}
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontFamily: "Cairo", color: COLORS.blue }}

                    >
                      {s.title}
                    </Typography>
                    <Typography color="text.main" sx={{ lineHeight: 1.9, fontFamily: "Cairo" }}>
                      {s.desc}
                    </Typography>
                  </Stack>
                </MotionPaper>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};
