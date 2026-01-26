// =============================
// /src/landing/sections/HeroSection.tsx
// =============================
import React, { useRef, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Button,
  Paper,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ArrowForward,  DeliveryDining } from "@mui/icons-material";
import { motion } from "framer-motion";
import { BRAND } from "../brand";
import { HERO } from "../content";

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);
const MotionPaper = motion.create(Paper);

export const HeroSection: React.FC = () => {
  const theme = useTheme();
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    sectionRef.current.style.setProperty("--x", `${x}px`);
    sectionRef.current.style.setProperty("--y", `${y}px`);
  }, []);

  const primary = BRAND?.colors?.primary ?? theme.palette.primary.main;
  const secondary = BRAND?.colors?.secondary ?? theme.palette.secondary.main;
  const appScreenshot = BRAND?.app?.screenshotUrl as string | undefined;

  // Variants
  const containerVariant = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const itemVariant = (delay = 0) => ({
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, delay },
    },
  });

  return (
    <Box
      ref={sectionRef}
      component="section"
      onMouseMove={handleMouseMove}
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: { xs: 640, md: "92vh" },
        display: "flex",
        alignItems: "center",
        // خلفية أساس (ديغرادينت العلامة)
        background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
        // Spotlight تفاعلي على مؤشر الماوس
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(550px circle at var(--x, 50%) var(--y, 30%), rgba(255,255,255,0.14), transparent 45%)",
          mixBlendMode: "screen",
        },
        // Aurora/Glow خلفي لطراوة إضافية
        "&::after": {
          content: '""',
          position: "absolute",
          inset: "-20% -10% -10% -10%",
          background: `radial-gradient(60% 60% at 70% 10%, ${alpha(
            "#ffffff",
            0.18
          )} 0%, transparent 60%), radial-gradient(50% 60% at 10% 80%, ${alpha(
            "#ffffff",
            0.12
          )} 0%, transparent 60%)`,
          filter: "blur(24px)",
          opacity: 0.9,
        },
      }}
    >
      {/* شبكة نقطية خفيفة (ملمس) */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background:
            'url(data:image/svg+xml,%3Csvg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.07"%3E%3Ccircle cx="2" cy="2" r="1"/%3E%3C/g%3E%3C/svg%3E)',
          opacity: 0.35,
        }}
      />

      <Container sx={{ position: "relative", zIndex: 1 }}>
        <MotionBox
          variants={containerVariant}
          initial="hidden"
          animate="visible"
          dir="rtl"
          sx={{
            display: "grid",
            gridTemplateColumns: { md: "1.1fr 0.9fr" },
            alignItems: "center",
            gap: { xs: 4, md: 6 },
            py: { xs: 8, md: 10 },
          }}
        >
          {/* النصوص / الأزرار */}
          <Box sx={{ color: "#fff", textAlign: { xs: "center", md: "left" } }}>
            <MotionBox variants={itemVariant(0)}>
              <Chip
                label={HERO.badge}
                sx={{
                  mb: 3,
                  bgcolor: alpha("#fff", 0.18),
                  color: "#fff",
                  fontSize: "1rem",
                  px: 2,
                  py: 1,
                  border: "1px solid",
                  borderColor: alpha("#fff", 0.3),
                  backdropFilter: "blur(6px)",
                }}
              />
            </MotionBox>

            <MotionTypography
              variants={itemVariant(0.05)}
              sx={{
                fontSize: { xs: "2.35rem", md: "3.6rem" },
                fontFamily: "Cairo",
                lineHeight: 1.1,
                mb: 1,
                letterSpacing: 0,
              }}
            >
              {HERO.titleLine1}
            </MotionTypography>

            <MotionTypography
              variants={itemVariant(0.12)}
              sx={{
                fontSize: { xs: "1.6rem", md: "2.1rem" },
                fontFamily: "Cairo",
                mb: 2,
                opacity: 0.98,
              }}
            >
              {HERO.titleLine2}
            </MotionTypography>

            <MotionTypography
              variants={itemVariant(0.2)}
              sx={{
                fontSize: { xs: "1rem", md: "1.125rem" },
                mb: 4,
                opacity: 0.94,
                fontFamily: "Cairo",
                lineHeight: 1.9,
                maxWidth: 600,
                mx: { xs: "auto", md: 0 },
              }}
            >
              {HERO.description}
            </MotionTypography>

            <MotionBox variants={itemVariant(0.28)}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ justifyContent: { xs: "center", md: "flex-start" } }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  href="https://bthwaniapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  component={motion.a}
                  
                  whileHover={reduceMotion ? undefined : { scale: 1.03, y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  sx={{
                    bgcolor: "#fff",
                    color: primary,
                    px: 4,
                    py: 2,
                    fontFamily: "Cairo",
                    fontSize: "1.1rem",
                    borderRadius: 3,
                    boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
                    "&:hover": {
                      bgcolor: "#fafafa",
                      boxShadow: "0 16px 40px rgba(0,0,0,0.24)",
                    },
                  }}
                >
                  {HERO.ctaPrimary}
                </Button>

              </Stack>
            </MotionBox>

            {/* شارات صغيرة متحركة (سلمية) */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ mt: 3, justifyContent: { xs: "center", md: "flex-start" } }}
            >
              {["توصيل سريع", "متاجر محلية", "سداد آمن"].map((t, i) => (
                <MotionBox
                  key={t}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.5 }}
                >
                  <Chip
                    label={t}
                    icon={<DeliveryDining sx={{ color: "#fff !important" }} />}
                    sx={{
                      color: "#fff",
                      bgcolor: alpha("#000", 0.15),
                      border: "1px solid",
                      borderColor: alpha("#fff", 0.25),
                      "& .MuiChip-icon": { color: "#fff" },
                      backdropFilter: "blur(4px)",
                    }}
                  />
                </MotionBox>
              ))}
            </Stack>
          </Box>

          {/* موك أب التطبيق (مرن للجوال) */}
          <Box sx={{ display: "grid", placeItems: "center" }}>
            <MotionBox
              initial={{ opacity: 0, y: 30, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              sx={{ position: "relative" }}
            >
              {/* هالة خلفية */}
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: -40,
                  background: `radial-gradient(40% 40% at 50% 50%, ${alpha(
                    "#fff",
                    0.45
                  )} 0%, transparent 70%)`,
                  filter: "blur(28px)",
                  zIndex: 0,
                }}
              />

              {/* الجهاز */}
              <MotionPaper
                elevation={24}
                sx={{
                  position: "relative",
                  width: { xs: 280, md: 340 },
                  height: { xs: 560, md: 650 },
                  borderRadius: "36px",
                  overflow: "hidden",
                  backdropFilter: "blur(6px)",
                  border: `1px solid ${alpha("#fff", 0.3)}`,
                  zIndex: 1,
                }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -6, transition: { type: "spring", stiffness: 150 } }
                }
              >
                {/* شريط علوي للجهاز */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 0,
                    right: 0,
                    mx: "auto",
                    width: 120,
                    height: 24,
                    borderRadius: 12,
                    bgcolor: alpha("#000", 0.25),
                    zIndex: 2,
                  }}
                />

                {/* شاشة التطبيق: لقطة حقيقية إن توفّرت، وإلا واجهة وهمية */}
                {appScreenshot ? (
                  <Box
                    component="img"
                    src={appScreenshot}
                    alt="لقطة شاشة التطبيق"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(180deg, ${alpha(
                        "#ffffff",
                        0.75
                      )} 0%, ${alpha("#ffffff", 0.98)} 30%, ${alpha(
                        secondary,
                        0.08
                      )} 100%)`,
                    }}
                  />
                )}

                {!appScreenshot && (
                  <Box sx={{ position: "relative", zIndex: 3, p: 2.2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: alpha("#000", 0.6), mb: 1 }}
                    >
                      bThwani — Super App
                    </Typography>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        borderColor: alpha("#000", 0.12),
                        mb: 2,
                        bgcolor: "#fff",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: "Cairo",  mb: 0.5 }}
                      >
                        بثواني — نحقق الأماني
                      </Typography>
                      <Typography sx={{ color: alpha("#000", 0.7) }}>
                        جرّب أسرع توصيل من متاجرك المفضلة في صنعاء.
                      </Typography>
                    </Paper>

                    <Stack spacing={1.5}>
                      {["مطاعم", "سوبرماركت", "خضار وفواكه", "صيدلية"].map(
                        (cat, i) => (
                          <Paper
                            key={cat}
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              borderColor: alpha("#000", 0.12),
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              bgcolor: "#fff",
                            }}
                            component={motion.div}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.25 + i * 0.08,
                              duration: 0.45,
                            }}
                          >
                            <DeliveryDining sx={{ opacity: 0.8 }} />
                            <Typography sx={{ fontWeight: 700 }}>
                              {cat}
                            </Typography>
                            <Box
                              sx={{ ml: "auto", opacity: 0.6, fontSize: 12 }}
                            >
                              الآن
                            </Box>
                          </Paper>
                        )
                      )}
                    </Stack>
                  </Box>
                )}
              </MotionPaper>

              {/* أيقونات عائمة حول الجهاز */}
              <MotionBox
                aria-hidden
                initial={{ y: 0 }}
                animate={
                  reduceMotion
                    ? {}
                    : {
                        y: [0, -8, 0],
                        transition: { repeat: Infinity, duration: 4 },
                      }
                }
                sx={{
                  position: "absolute",
                  top: -14,
                  right: -14,
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  display: { xs: "none", md: "grid" },
                  placeItems: "center",
                  bgcolor: alpha("#fff", 0.15),
                  border: `1px solid ${alpha("#fff", 0.35)}`,
                  backdropFilter: "blur(8px)",
                }}
              >
                <DeliveryDining sx={{ color: "#fff" }} />
              </MotionBox>
            </MotionBox>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
};
