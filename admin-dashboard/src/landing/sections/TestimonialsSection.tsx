// =============================
// /src/landing/sections/TestimonialsSection.tsx
// =============================
import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  Rating,
  Stack,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import { TESTIMONIALS } from "../content";
import { COLORS } from "../../theme";

type Testimonial = {
  name: string;
  role: string;
  avatar?: string;
  rating: number; // 0..5
  comment: string;
  city?: string;
};

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

const containerVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
};

function TestimonialCard({ t }: { t: Testimonial }) {
  const theme = useTheme();
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <MotionPaper
      variants={cardVariants}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      elevation={0}
      sx={{
        position: "relative",
        p: { xs: 3, md: 4 },
        height: "100%",
        borderRadius: 3,
        background: `linear-gradient(${COLORS.white}, ${
          COLORS.white
        }) padding-box, linear-gradient(135deg, ${alpha(
          COLORS.primary,
          0.5
        )}, ${alpha(COLORS.primary, 0.5)}) border-box`,
        border: "1px solid transparent",
        backdropFilter: "blur(6px)",
        overflow: "hidden",
        // اقتباس زخرفي خفيف
        "&::after": {
          content: '"“"',
          position: "absolute",
          top: -24,
          left: 16,
          fontSize: 140,
          lineHeight: 1,
          color: alpha(theme.palette.text.primary, 0.06),
          pointerEvents: "none",
          fontFamily: "serif",
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ position: "relative" }}>
          {/* حلقة تدرّج حول الصورة */}
          <Box
            sx={{
              position: "absolute",
              inset: -2,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.7
              )}, ${alpha(theme.palette.secondary.main, 0.7)})`,
            }}
          />
          <Avatar
            src={t.avatar}
            sx={{
              width: 56,
              height: 56,
              position: "relative",
              zIndex: 1,
              border: `2px solid ${COLORS.white}`,
            }}
          >
            {t.name?.[0]}
          </Avatar>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{ fontFamily: "Cairo", mb: 0.2, color: COLORS.blue }}
          >
            {t.name}
          </Typography>
          <Typography variant="body2" color={COLORS.blue} noWrap sx={{ fontFamily: "Cairo" }}>
            {t.role}
            {t.city ? ` — ${t.city}` : ""}
          </Typography>
        </Box>
        
      </Stack>

      <Rating
        value={t.rating}
        readOnly
        sx={{
          mb: 1,
          "& .MuiRating-iconFilled": {
            color: COLORS.primary,
          },
        }}
      />

      <Typography
        sx={{ lineHeight: 1.9, fontStyle: "italic", color: COLORS.blue }}
      >
        “{t.comment}”
      </Typography>
    </MotionPaper>
  );
}

export const TestimonialsSection: React.FC = () => {
  return (
    <Box
      component="section"
      sx={{ position: "relative", py: { xs: 10, md: 12 }, overflow: "hidden" }}
    >
      {/* خلفية نقطية خفيفة */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.35,
          background:
            'url(data:image/svg+xml,%3Csvg width="40" height="40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23999" fill-opacity="0.10"%3E%3Ccircle cx="1.5" cy="1.5" r="1.5"/%3E%3C/g%3E%3C/svg%3E)',
        }}
      />

      <Container
        maxWidth="lg"
        sx={{ position: "relative", zIndex: 1 }}
        dir="rtl"
      >
        {/* العنوان */}
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}
        >
          <Typography
            variant="h2"
            sx={{
              fontFamily: "Cairo",
              mb: 1.5,
              fontSize: { xs: "2rem", md: "3rem" },
              backgroundImage: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primary})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: 0,
            }}
          >
            ماذا يقول مستخدمونا؟
          </Typography>
          <Typography
            variant="h6"
            color={COLORS.blue}
            fontFamily="Cairo"
            sx={{ maxWidth: 720, mx: "auto", lineHeight: 1.8 }}
          >
            آراء تجريبية حتى الآن — سنعرض لاحقًا تقييمات حقيقية بعد الإطلاق
            الرسمي.
          </Typography>
        </MotionBox>

        {/* الشبكة */}
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Grid container spacing={3}>
            {(TESTIMONIALS as Testimonial[]).map((t, i) => (
              <Grid component="div" size={{ xs: 12, md: 4 }} key={t.name ?? i}>
                <TestimonialCard t={t} />
              </Grid>
            ))}
          </Grid>
        </MotionBox>
      </Container>
    </Box>
  );
};
