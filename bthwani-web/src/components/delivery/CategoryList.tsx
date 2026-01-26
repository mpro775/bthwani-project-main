// src/components/delivery/CategoryListPro.tsx
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../types";
import axiosInstance from "../../api/axios-instance";

// MUI
import {
  Box,
  ButtonBase,
  Avatar,
  Typography,
  Fade,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Stack,
  Tooltip,
  Grid,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Category as CategoryIcon,
  GridView,
  ChevronRight,
  ChevronLeft,
} from "@mui/icons-material";
import { Package } from "lucide-react";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y, FreeMode } from "swiper/modules";
import "swiper/css";

type Props = { categories: Category[] };

const CategoryListPro: React.FC<Props> = ({ categories = [] }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [showAll, setShowAll] = useState(false);
  const [subModal, setSubModal] = useState<{
    open: boolean;
    title?: string;
    list: Category[];
  }>({ open: false, list: [] });

  // خذ أفضل 8 لواجهة أكثر امتلاء
  const sliderItems = useMemo(() => categories.slice(0, 8), [categories]);

  // مراجع أزرار السوايبر
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  // جلب الفئات الفرعية
  const fetchChildren = async (parentId: string): Promise<Category[]> => {
    try {
      const r = await axiosInstance.get(
        `/delivery/categories/children/${parentId}`,
        { params: { withNumbers: 1 } }
      );
      const data = await r.data;
      return Array.isArray(data)
        ? data.sort(
            (a: Category, b: Category) =>
              (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) ||
              (a.name?.localeCompare?.(b.name, "ar") ?? 0)
          )
        : [];
    } catch {
      return [];
    }
  };

  const customRoutes: Record<string, string> = {
    اخدمني: "/akhdimni",
    الغاز: "/utilities/gas",
    "دبة الغاز": "/utilities/gas",
    "وايت الماء": "/utilities/water",
    الوايت: "/utilities/water",
  };

  const goCategory = async (cat: Category) => {
    if (cat.name === "شي ان") return;

    if (cat.name === "مقاضي") {
      navigate(`/grocery?categoryId=${cat._id}`);
      return;
    }
    if (customRoutes[cat.name]) {
      navigate(customRoutes[cat.name]);
      return;
    }

    const id = (cat.id || cat._id || "unknown") as string;
    const subs = await fetchChildren(id);
    if (subs.length) setSubModal({ open: true, list: subs, title: cat.name });
    else navigate(`/category/${id}`);
  };

  // بطاقة الفئة — تصميم زجاجي مع حافة متدرّجة ولمعة خفيفة
  const CategoryCard = (c: Category, index: number) => {
    const disabled = c.name === "شي ان";
    return (
      <Fade in timeout={350 + index * 60} key={c.id || c._id}>
        <Box
          sx={{
            position: "relative",
            borderRadius: 3,
            p: 1.25,
            overflow: "hidden",
            // حافة متدرجة
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: 3,
              padding: "1px",
              background:
                "linear-gradient(135deg, rgba(99,102,241,.6), rgba(236,72,153,.6))",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            },
            // خلفية زجاجية
            backdropFilter: "blur(6px)",
            background:
              theme.palette.mode === "light"
                ? "rgba(255,255,255,.65)"
                : "rgba(17,25,40,.45)",
            boxShadow:
              theme.palette.mode === "light"
                ? "0 6px 20px rgba(2,8,23,.06)"
                : "0 6px 20px rgba(0,0,0,.35)",
            transition: "transform .25s ease, box-shadow .25s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 10px 28px rgba(2,8,23,.12)"
                  : "0 10px 28px rgba(0,0,0,.55)",
            },
            opacity: disabled ? 0.55 : 1,
          }}
        >
          {/* Badge */}
          <Chip
            className="category-badge"
            label="فئة"
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              insetInlineEnd: 8,
              zIndex: 2,
              fontWeight: 700,
              height: 22,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: "0 2px 10px rgba(59,130,246,.35)",
              "& .MuiChip-label": { px: 1.2, fontSize: ".72rem" },
              opacity: 0,
              transform: "scale(.9)",
              transition: "all .25s",
              ".MuiBox-root:hover &": {
                opacity: 1,
                transform: "scale(1)",
              },
            }}
            icon={<CategoryIcon sx={{ fontSize: 14, color: "inherit" }} />}
          />

          <ButtonBase
            focusRipple
            onClick={() => goCategory(c)}
            aria-label={`فتح ${c.nameAr || c.name}`}
            disabled={disabled}
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.25,
              p: 1.25,
              borderRadius: 3,
            }}
          >
            <Avatar
              alt={c.name}
              src={c.icon || c.image}
              sx={{
                width: 76,
                height: 76,
                bgcolor: "transparent",
                border: "2px solid",
                borderColor: "divider",
                boxShadow: theme.shadows[2],
                transition: "transform .25s ease, box-shadow .25s ease",
                "&:hover": {
                  transform: "scale(1.06)",
                  boxShadow: theme.shadows[6],
                },
              }}
              imgProps={{ loading: "lazy", referrerPolicy: "no-referrer" }}
            >
              {!c.icon && !c.image && (
                <Package style={{ width: 34, height: 34, opacity: 0.8 }} />
              )}
            </Avatar>

            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                fontWeight: 800,
                lineHeight: 1.25,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontSize: ".9rem",
                background:
                  theme.palette.primary.dark,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {c.nameAr || c.name}
            </Typography>
          </ButtonBase>
        </Box>
      </Fade>
    );
  };

  return (
    <Fade in timeout={500}>
      <Box dir="rtl">
        {/* رأس القسم */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
         

          <Stack dir="ltr" direction="row" spacing={1} alignItems="center">
            <ButtonBase
              onClick={() => setShowAll(true)}
              sx={{
                px: 1.25,
                py: 0.75,
                borderRadius: 999,
                border: "1px solid",
                borderColor: "divider",
                gap: 1,
                mr: "auto",
              }}
            >
              <GridView fontSize="small" />
              <Typography  variant="body2" sx={{ fontWeight: 800 }}>
                عرض الكل
              </Typography>
            </ButtonBase>

            <Tooltip title="عرض كل الفئات">
              <IconButton
                color="primary"
                onClick={() => setShowAll(true)}
                sx={{ display: { xs: "inline-flex", md: "none" } }}
              >
                <GridView />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* تنقّل السلايدر */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <IconButton
            ref={nextRef}
            aria-label="التالي"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "background.default" },
            }}
          >
            {/* في RTL: التالي يمين */}
            <ChevronRight />
          </IconButton>

          <IconButton
            ref={prevRef}
            aria-label="السابق"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "background.default" },
            }}
          >
            <ChevronLeft />
          </IconButton>
        </Stack>

        {/* السلايدر */}
        <Swiper
          modules={[Navigation, A11y, FreeMode]}
          dir="rtl"
          freeMode
          slidesPerView={2}
          spaceBetween={12}
          onBeforeInit={(swiper) => {
            // مهم مع refs: اربط قبل init
            // في RTL: نستخدم nextRef لليمين (التالي) و prevRef لليسار (السابق)
            // Swiper يتوقع عناصر DOM لا refs، فنمرّر current
            // ونحدّث swiper.navigation
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anySwiper = swiper as any;
            anySwiper.params.navigation.prevEl = prevRef.current;
            anySwiper.params.navigation.nextEl = nextRef.current;
          }}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          breakpoints={{
            480: { slidesPerView: 3, spaceBetween: 12 },
            768: { slidesPerView: 4, spaceBetween: 14 },
            1024: { slidesPerView: 5, spaceBetween: 16 },
            1280: { slidesPerView: 6, spaceBetween: 18 },
          }}
          style={{ padding: "4px 2px" }}
        >
          {sliderItems.map((c, i) => (
            <SwiperSlide key={c.id || c._id}>
              <Box sx={{ px: 0.5 }}>{CategoryCard(c, i)}</Box>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Modal — كل الفئات */}
        <Dialog
          open={showAll}
          onClose={() => setShowAll(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              maxHeight: "90vh",
              background:
                theme.palette.mode === "light"
                  ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
                  : "linear-gradient(135deg, #0b1220 0%, #0f172a 100%)",
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle
            sx={{
              p: 0,
              overflow: "hidden",
              position: "relative",
              bgcolor: "transparent",
            }}
          >
            <Box
              sx={{
                p: 3,
                color: "white",
                background:
                  theme.palette.primary.main,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" alignItems="center" gap={1}>
                  <CategoryIcon sx={{ fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    كل الفئات
                  </Typography>
                </Stack>
                <IconButton
                  onClick={() => setShowAll(false)}
                  size="large"
                  sx={{
                    color: "white",
                    "&:hover": {
                      background: "rgba(255,255,255,.12)",
                      transform: "scale(1.06)",
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Box>
            <Divider />
          </DialogTitle>

          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={2}>
              {categories.map((c, index) => {
                const disabled = c.name === "شي ان";
                return (
                  <Grid
                  size={{
                    xs: 6,
                    sm: 4,
                    md: 3,
                    lg: 2.4,
                  }}
                    key={c.id || c._id}
                  >
                    <Fade in timeout={220 + index * 35}>
                      <Box
                        sx={{
                          borderRadius: 3,
                          p: 1.25,
                          position: "relative",
                          overflow: "hidden",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            inset: 0,
                            borderRadius: 3,
                            padding: "1px",
                            background:
                              theme.palette.primary.main,
                            WebkitMask:
                              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                            WebkitMaskComposite: "xor",
                            maskComposite: "exclude",
                          },
                          background:
                            theme.palette.mode === "light"
                              ? "rgba(255,255,255,.65)"
                              : "rgba(17,25,40,.45)",
                          backdropFilter: "blur(6px)",
                          boxShadow:
                            theme.palette.mode === "light"
                              ? "0 6px 18px rgba(2,8,23,.06)"
                              : "0 6px 18px rgba(0,0,0,.4)",
                          opacity: disabled ? 0.55 : 1,
                        }}
                      >
                        <ButtonBase
                          focusRipple
                          aria-label={`اختيار ${c.nameAr || c.name}`}
                          onClick={() => {
                            setShowAll(false);
                            goCategory(c);
                          }}
                          disabled={disabled}
                          sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                            p: 1,
                            borderRadius: 3,
                          }}
                        >
                          <Avatar
                            alt={c.name}
                            src={c.icon || c.image}
                            sx={{
                              width: 64,
                              height: 64,
                              border: "2px solid",
                              borderColor: "divider",
                              boxShadow: theme.shadows[2],
                              transition: "transform .25s ease",
                              "&:hover": { transform: "scale(1.06)" },
                            }}
                            imgProps={{ loading: "lazy" }}
                          >
                            {!c.icon && !c.image && (
                              <Package
                                style={{ width: 28, height: 28, opacity: 0.85 }}
                              />
                            )}
                          </Avatar>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              textAlign: "center",
                              lineHeight: 1.2,
                              fontSize: ".82rem",
                              background:
                                theme.palette.primary.main,
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {c.nameAr || c.name}
                          </Typography>
                        </ButtonBase>
                      </Box>
                    </Fade>
                  </Grid>
                );
              })}
            </Grid>
          </DialogContent>
        </Dialog>

        {/* Modal — الفئات الفرعية */}
        <Dialog
          open={subModal.open}
          onClose={() => setSubModal({ open: false, list: [] })}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              maxHeight: "90vh",
              background:
                theme.palette.mode === "light"
                  ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
                  : "linear-gradient(135deg, #0b1220 0%, #0f172a 100%)",
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle sx={{ p: 0 }}>
            <Box
              sx={{
                p: 3,
                color: "white",
                background:
                  theme.palette.primary.main,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" alignItems="center" gap={1}>
                  <CategoryIcon sx={{ fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {subModal.title || "الفئات الفرعية"}
                  </Typography>
                </Stack>
                <IconButton
                  onClick={() => setSubModal({ open: false, list: [] })}
                  size="large"
                  sx={{
                    color: "white",
                    "&:hover": {
                      background: "rgba(255,255,255,.12)",
                      transform: "scale(1.06)",
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Box>
            <Divider />
          </DialogTitle>

          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={2}>
              {subModal.list.map((c, index) => {
                const disabled = c.name === "شي ان";
                return (
                  <Grid
                    size={{
                      xs: 6,
                      sm: 4,
                      md: 3,
                      lg: 2.4,
                    }}
                    key={c.id || c._id}
                  >
                    <Fade in timeout={220 + index * 35}>
                      <Box
                        sx={{
                          borderRadius: 3,
                          p: 1.25,
                          position: "relative",
                          overflow: "hidden",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            inset: 0,
                            borderRadius: 3,
                            padding: "1px",
                            background:
                              theme.palette.primary.main,
                            WebkitMask:
                              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                            WebkitMaskComposite: "xor",
                            maskComposite: "exclude",
                          },
                          background:
                            theme.palette.mode === "light"
                              ? "rgba(255,255,255,.65)"
                              : "rgba(17,25,40,.45)",
                          backdropFilter: "blur(6px)",
                          boxShadow:
                            theme.palette.mode === "light"
                              ? "0 6px 18px rgba(2,8,23,.06)"
                              : "0 6px 18px rgba(0,0,0,.4)",
                          opacity: disabled ? 0.55 : 1,
                        }}
                      >
                        <ButtonBase
                          focusRipple
                          aria-label={`اختيار ${c.nameAr || c.name}`}
                          onClick={() => {
                            setSubModal({ open: false, list: [] });
                            goCategory(c);
                          }}
                          disabled={disabled}
                          sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                            p: 1,
                            borderRadius: 3,
                          }}
                        >
                          <Avatar
                            alt={c.name}
                            src={c.icon || c.image}
                            sx={{
                              width: 64,
                              height: 64,
                              border: "2px solid",
                              borderColor: "divider",
                              boxShadow: theme.shadows[2],
                              transition: "transform .25s ease",
                              "&:hover": { transform: "scale(1.06)" },
                            }}
                            imgProps={{ loading: "lazy" }}
                          >
                            {!c.icon && !c.image && (
                              <Package
                                style={{ width: 28, height: 28, opacity: 0.85 }}
                              />
                            )}
                          </Avatar>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              textAlign: "center",
                              lineHeight: 1.2,
                              fontSize: ".82rem",
                              background:
                                  theme.palette.primary.main,
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {c.nameAr || c.name}
                          </Typography>
                        </ButtonBase>
                      </Box>
                    </Fade>
                  </Grid>
                );
              })}
            </Grid>
          </DialogContent>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default CategoryListPro;
