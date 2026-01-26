// =====================================
// src/pages/SafetyPage.tsx
// =====================================
import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import LandingNavbar from "../components/LandingNavbar";
import { FooterSection } from "../sections/FooterSection";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
      }}
    >
      <Typography variant="h6" sx={{ fontFamily: "Cairo", mb: 1 }}>
        {title}
      </Typography>
      <Typography
        component="div"
        color="text.secondary"
        sx={{ lineHeight: 1.9, fontFamily: "Cairo"   }}
      >
        {children}
      </Typography>
    </Paper>
  );
}

export default function SafetyPage() {
  return (
    <>
      <LandingNavbar />

      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg" dir="rtl">
          <Typography variant="h3" sx={{ fontFamily: "Cairo", mb: 2 }}>
            السلامة والأمان
          </Typography>

          <Stack spacing={2.5}>
            <Section title="التزامنا">
              نلتزم بسلامة العملاء والتجّار والكباتن وخصوصيتهم عبر ضوابط تشغيلية
              واضحة وتدريب دوري ومراجعات مستمرة.
            </Section>

            <Section title="عناصر محظورة">
              يُحظر شراء/نقل: الأسلحة وملحقاتها، المواد الخطرة والقابلة
              للاشتعال، المخدرات، منتجات التبغ/النيكوتين، الكحول، الأدوية
              المقيّدة دون وصفة، أي سلع مخالفة للقانون.
            </Section>

            <Section title="طلبات حساسة">
              قد تتطلب بعض الطلبات تحققًا إضافيًا (مثل مستلزمات طبية خاصة).
              نحتفظ بحق رفض الطلب أو طلب مستندات داعمة بما يتوافق مع القانون
              المحلي.
            </Section>

            <Section title="سلامة الكباتن">
              التحقق من الهوية والمركبة، التزام بالزي والخوذة، تدريب على السلامة
              والخدمة، عدم تجاوز السرعات القانونية، والامتناع عن المخاطر (مناطق
              غير آمنة/ظروف جوية قاسية).
            </Section>

            <Section title="سلامة التسليم">
              التسليم على الباب أو عند المدخل حسب طلب العميل. يمنع الدخول إلى
              أماكن خاصة إلا عند الضرورة وبموافقة واضحة. يمكن اعتماد “تسليم بدون
              تلامس” عند الطلب.
            </Section>

            <Section title="الاحتيال وإساءة الاستخدام">
              أي نشاط احتيالي أو إساءة (إرجاع مكرّر غير مبرر، تلاعب
              بالأسعار/الطلبات، تهديدات) قد يؤدي إلى إلغاء الطلب، حجب الحساب، أو
              إحالة الجهات المختصة. يتم توثيق الحالات بدقة ومراجعتها.
            </Section>

            <Section title="الخصوصية والدردشة">
              تتم محادثات الطلب داخل القنوات الرسمية فقط. يُحظر مشاركة أرقام
              شخصية أو أي معلومات غير لازمة. نتابع البلاغات ونسعى لاتخاذ إجراء
              سريع عند أي إساءة.
            </Section>

            <Section title="المفقودات والنزاعات">
              في حال وجود مفقودات أو تباين، يُبلغ خلال وقت معقول عبر التطبيق.
              نتبع آلية تحقق عادلة وقد يتم التعويض حسب سياسة كل خدمة وأدلة
              الحالة.
            </Section>

            <Section title="الطوارئ والبلاغات">
              للحالات الطارئة اتصل بجهات الطوارئ المحلية أولًا، ثم أبلغنا عبر
              التطبيق أو الهاتف لتوثيق الحالة ومساعدتك.
            </Section>
          </Stack>
        </Container>
      </Box>

      <FooterSection />
    </>
  );
}
