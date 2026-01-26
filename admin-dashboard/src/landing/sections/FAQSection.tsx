// src/landing/sections/FAQSection.tsx
import React from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { COLORS } from "../../theme";

const MotionBox = motion.create(Box);
const MotionAccordion = motion.create(Accordion);

const FAQ = [
  {
    q: "هل أستطيع الدفع نقدًا عند الاستلام؟",
    a: "نعم، ندعم الدفع نقدًا، بالإضافة إلى وسائل إلكترونية ومحافظ رقمية آمنة. يمكنك اختيار طريقة الدفع التي تناسبك عند إتمام الطلب.",
  },
  {
    q: "ما المدن التي تغطيها الخدمة؟",
    a: "نبدأ في صنعاء ومناطق محددة، ونتوسع تدريجيًا في مدن أخرى. نخطط لتغطية جميع المدن الرئيسية في اليمن خلال العام القادم.",
  },
  {
    q: "كيف أتابع طلبي؟",
    a: "يمكنك تتبع الكابتن مباشرًا عبر الخريطة داخل التطبيق. ستتلقى تحديثات فورية عن حالة طلبك وموقع الكابتن في الوقت الفعلي.",
  },
  {
    q: "ماذا لو حدثت مشكلة في الطلب؟",
    a: "فريق الدعم جاهز 24/7، ولدينا سياسة إعادة الإرسال/الاسترجاع شاملة. نضمن رضاك التام عن كل طلب.",
  },
  {
    q: "كم تستغرق مدة التوصيل؟",
    a: "مدة التوصيل تتراوح بين 15-45 دقيقة حسب المسافة والموقع. نعمل على تقديم أسرع خدمة توصيل ممكنة.",
  },
  {
    q: "هل الخدمة متاحة على مدار الساعة؟",
    a: "نعم، خدمتنا متاحة 24/7. يمكنك طلب أي شيء تحتاجه في أي وقت من اليوم أو الليل.",
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
};

export const FAQSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      id="faq"
      component="section"
      sx={{
        py: { xs: 10, md: 12 },
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${alpha(
          COLORS.white,
          0.8
        )} 0%, ${alpha(COLORS.white, 0.9)} 100%)`,
      }}
    >
      {/* خلفية زخرفية */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.4,
          background: COLORS.white,
        }}
      />

      <Container sx={{ position: "relative", zIndex: 1 }}>
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
              textAlign: "center",
              fontFamily: "Cairo",
              mb: 2,
              fontSize: { xs: "2rem", md: "3rem" },
              backgroundImage: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.blue})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            الأسئلة الشائعة
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: "auto",
              fontFamily: "Cairo",
              lineHeight: 1.8,
              opacity: 0.8,
            }}
          >
            إجابات شاملة على أكثر الأسئلة شيوعاً حول خدماتنا
          </Typography>
        </MotionBox>

        {/* الأسئلة */}
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {FAQ.map((item, i) => (
            <MotionAccordion
              key={item.q}
              variants={itemVariants}
              defaultExpanded={i === 0}
              sx={{
                borderRadius: 3,
                mb: 2,
                background: `linear-gradient(${
                  theme.palette.mode === "dark" ? "#0b0d10" : "#ffffff"
                }, ${
                  theme.palette.mode === "dark" ? "#0b0d10" : "#ffffff"
                }) padding-box, linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.3
                )}, ${alpha(theme.palette.secondary.main, 0.3)}) border-box`,
                border: "1px solid transparent",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  transform: "translateY(-2px)",
                },
                "&.Mui-expanded": {
                  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{
                      color: theme.palette.primary.main,
                      transition: "transform 0.3s ease",
                    }}
                  />
                }
                sx={{
                  "& .MuiAccordionSummary-content": {
                    my: 2,
                  },
                  "&.Mui-expanded .MuiAccordionSummary-expandIconWrapper": {
                    transform: "rotate(180deg)",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Cairo",
                    fontSize: "1.1rem",
                    color: COLORS.blue,
                  }}
                >
                  {item.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pb: 3 }}>
                <Typography
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.8,
                    fontSize: "1rem",
                    fontFamily: "Cairo",
                    opacity: 0.9,
                  }}
                >
                  {item.a}
                </Typography>
              </AccordionDetails>
            </MotionAccordion>
          ))}
        </MotionBox>

        {/* زر المساعدة */}
        <MotionBox
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          sx={{ textAlign: "center", mt: 6 }}
        >
          <Button
            component={RouterLink}
            to="/support"
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontSize: "1.1rem",
              fontWeight: 700,
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primary})`,
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
              },
            }}
          >
            جميع الأسئلة والمساعدة
          </Button>
        </MotionBox>
      </Container>
    </Box>
  );
};
