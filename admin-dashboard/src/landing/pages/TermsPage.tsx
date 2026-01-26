// =====================================
// src/pages/TermsPage.tsx
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
        sx={{ lineHeight: 1.9, fontFamily: "Cairo" }}
      >
        {children}
      </Typography>
    </Paper>
  );
}

export default function TermsPage() {
  return (
    <>
      <LandingNavbar />

      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg" dir="rtl">
          <Typography variant="h3" sx={{ fontFamily: "Cairo", mb: 2 }}>
            الشروط والأحكام
          </Typography>

          <Stack spacing={2.5}>
            <Section title="القبول والأهلية">
              باستخدامك التطبيق/الموقع، فإنك توافق على هذه الشروط. يجب أن تكون
              18 سنة فأكثر، وتتحمل مسؤولية صحة المعلومات في حسابك.
            </Section>

            <Section title="الحساب والأمن">
              تتحمل مسؤولية سرية بيانات دخولك وكافة الأنشطة على حسابك. أبلغ
              فورًا عن أي استخدام غير مصرح به.
            </Section>

            <Section title="الخدمة والطلب">
              نعرض متاجر/خدمات محلية وننسّق التوصيل. قد تختلف التوفّرات والأسعار
              والوقت حسب المتجر والمنطقة. تُعرض التكلفة المتوقعة قبل التأكيد.
            </Section>

            <Section title="الدفع والتسعير">
              يُدفع نقدًا عند الاستلام أو عبر محافظ/تحويلات متاحة. الأسعار
              والأجور قد تشمل رسوم خدمة/توصيل. أي فروقات معقولة تُبلغ بها قبل
              الإتمام.
            </Section>

            <Section title="التوصيل والوقت">
              نعرض نافذة زمنية تقديرية ونحدّثك أثناء الطريق. قد تؤثر ظروف خارجة
              عن إرادتنا (ازدحام/طقس/توفر) على الزمن.
            </Section>

            <Section title="الإلغاء والاسترجاع">
              يمكن الإلغاء قبل بدء التحضير دون رسوم. بعد البدء، قد تُطبّق رسوم
              أو لا يُتاح الإلغاء بحسب نوع الطلب. تُعالج طلبات التعويض وفق
              الأدلة وسياسة كل خدمة.
            </Section>

            <Section title="المحتوى والتقييمات">
              يجب أن تكون المراجعات دقيقة وغير مسيئة. نحتفظ بحق إزالة أي محتوى
              مخالف.
            </Section>

            <Section title="الاستخدام المحظور">
              يُحظر استخدام الخدمة لأغراض غير قانونية أو لطلب عناصر محظورة أو
              للتسبب بالأذى أو الإزعاج للآخرين.
            </Section>

            <Section title="الملكية الفكرية">
              جميع الحقوق، بما في ذلك العلامات والشعارات والمحتوى، مملوكة
              لـ«بثواني» أو للجهات المرخِّصة، ولا يجوز استخدامها دون إذن.
            </Section>

            <Section title="إخلاء المسؤولية والحدود">
              نوفر الخدمة “كما هي” ضمن الحدود المعقولة. لا نتحمل مسؤولية غير
              مباشرة أو تبعية، بالقدر الذي يسمح به القانون.
            </Section>

            <Section title="القانون والاختصاص">
              تخضع هذه الشروط لقوانين الجمهورية اليمنية، ويكون الاختصاص لمحاكم
              صنعاء (ما لم يُنصّ على غير ذلك بموجب القانون).
            </Section>

            <Section title="القوة القاهرة">
              لا نتحمل التأخير/الإخفاق الناتج عن أحداث خارجة عن الإرادة (كوارث،
              حروب، انقطاع واسع، إلخ).
            </Section>

            <Section title="التعديل والإشعارات">
              قد نحدث الشروط، وسنُخطرك بالتغييرات الجوهرية عبر التطبيق/الموقع.
              استمرارك باستخدام الخدمة يعني قبول التعديلات.
            </Section>

            <Section title="التواصل">
              لأي استفسار بشأن الشروط أو الخدمة، تواصل عبر قنوات الدعم الرسمية.
            </Section>
          </Stack>
        </Container>
      </Box>

      <FooterSection />
    </>
  );
}
