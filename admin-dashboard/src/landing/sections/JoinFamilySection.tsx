// =============================
// /src/landing/sections/JoinFamilySection.tsx
// =============================
import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Paper,
  Grid,
  alpha,
  useTheme,
} from "@mui/material";
import StoreMallDirectoryIcon from "@mui/icons-material/StoreMallDirectory";
import PedalBikeIcon from "@mui/icons-material/PedalBike";
import { Link as RouterLink } from "react-router-dom";
import { COLORS } from "../../theme";

export const JoinFamilySection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      id="join-family"
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        background: COLORS.white,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
      }}
    >
      <Container maxWidth="lg" dir="rtl">
        {/* العنوان الموحّد */}
        <Stack
          spacing={1.2}
          alignItems="center"
          textAlign="center"
          sx={{ mb: 5 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontFamily: "Cairo",
              fontSize: { xs: "1.9rem", md: "2.4rem" },
              color: COLORS.blue,
            }}
          >
            انضم إلى عائلة «بثواني»
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ lineHeight: 1.9, maxWidth: 820, fontFamily: "Cairo" }}
          >
            سواءً كنت تاجرًا تبحث عن نمو ومبيعات أكثر، أو كابتن توصيل ترغب بدخل
            مرن — مكانك معنا.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* بطاقة التجّار */}
          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                height: "100%",
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                background:
                  theme.palette.mode === "dark"
                    ? alpha("#fff", 0.02)
                    : alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: 999,
                    background: alpha(theme.palette.primary.main, 0.12),
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                  }}
                >
                  <StoreMallDirectoryIcon
                    sx={{ color: theme.palette.primary.main }}
                  />
                  <Typography sx={{fontFamily: "Cairo", color: COLORS.primary }}>
                    للتجّار
                  </Typography>
                </Stack>

                <Typography
                  variant="h4"
                  sx={{ fontFamily: "Cairo", color: COLORS.primary }}
                >
                  انضم كتاجر مع «بثواني»
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.9, fontFamily: "Cairo" }}>
                  زد مبيعاتك ووصل لعملاء جدد مع تقارير واضحة وتسوية مالية سلسة.
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.2}
                  justifyContent="center"
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <Button
                    component={RouterLink}
                    to="/for-merchants"
                    variant="contained"
                    size="large"
                    sx={{
                      fontFamily: "Cairo",
                      borderRadius: 2.5,
                      textTransform: "none",
                      px: 3,
                    }}
                  >
                    قدّم طلب انضمام
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/services"
                    variant="outlined"
                    size="large"
                    sx={{
                      fontFamily: "Cairo",
                      borderRadius: 2.5,
                      textTransform: "none",
                      px: 3,
                    }}
                  >
                    استكشف الخدمات
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          {/* بطاقة الكباتن */}
          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                height: "100%",
                borderRadius: 3,
                border: `1px solid ${alpha(
                  theme.palette.secondary.main,
                  0.25
                )}`,
                background: alpha(COLORS.blue, 0.04),
              }}
            >
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: 999,
                    background: alpha(COLORS.blue, 0.12),
                    border: `1px solid ${alpha(COLORS.blue, 0.3)}`,
                  }}
                >
                  <PedalBikeIcon sx={{ color: COLORS.blue }} />
                  <Typography sx={{ fontFamily: "Cairo", color: COLORS.blue }}>
                    للكباتن
                  </Typography>
                </Stack>

                <Typography
                  variant="h4"
                  sx={{ fontFamily: "Cairo", color: COLORS.blue }}
                >
                  انضم ككابتن توصيل مستقل
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.9, fontFamily: "Cairo" }}>
                  أرباح مرنة وسريعة، وأمان وسلامة في كل مشوار.
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.2}
                  justifyContent="center"
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <Button
                    component={RouterLink}
                    to="/become-captain"
                    variant="contained"
                    size="large"
                    sx={{
                      fontFamily: "Cairo",
                      borderRadius: 2.5,
                      background: COLORS.blue,
                      textTransform: "none",
                      px: 3,
                    }}
                  >
                    سجّل الآن
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/support"
                    variant="outlined"
                    size="large"
                    sx={{
                        fontFamily: "Cairo",
                      borderRadius: 2.5,
                      borderColor: COLORS.blue,
                      color: COLORS.blue,
                      textTransform: "none",
                      px: 3,
                    }}
                  >
                    اعرف المزيد
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
