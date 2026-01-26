// =====================================
// src/pages/SupportPage.tsx
// =====================================
import { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Chip,
  TextField,
  Grid,
  Paper,
  alpha,
  useTheme,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LandingNavbar from "../components/LandingNavbar";
import { FooterSection } from "../sections/FooterSection";
import { LINKS } from "../links";

type Faq = { q: string; a: string; cat: string };

const FAQ: Faq[] = [
  {
    q: "كيف ألغِ الطلب؟",
    a: "يمكنك الإلغاء من تفاصيل الطلب قبل بدء التحضير. بعد البدء قد تُطبّق رسوم حسب الحالة. لطلب جارٍ، تواصل عبر الدردشة.",
    cat: "الطلبات",
  },
  {
    q: "ماذا لو تأخر الطلب؟",
    a: "نحدّثك دوريًا عبر الدردشة. في حالات التأخير المثبتة قد تُمنح قسيمة تعويض وفق السياسة.",
    cat: "الطلبات",
  },
  {
    q: "هل الرسوم ثابتة؟",
    a: "تعتمد على المسافة والوقت والفئة والعروض. تظهر التكلفة قبل التأكيد.",
    cat: "التسعير",
  },
  {
    q: "طرق الدفع المتاحة؟",
    a: "نقدًا عند الاستلام، ومحافظ/تحويل حيثما تتوفر محليًا.",
    cat: "الدفع",
  },
  {
    q: "مشكلة في الدفع/المحفظة",
    a: "تحقق من الرصيد والاتصال، ثم أعد المحاولة. إن استمرت، راسلنا مع رقم الطلب وأي لقطة شاشة.",
    cat: "الدفع",
  },
  {
    q: "بدائل المنتجات الناقصة",
    a: "سنقترح بدائل مناسبة داخل الدردشة قبل الاستبدال.",
    cat: "الطلبات",
  },
  {
    q: "كيف أعدّل العنوان؟",
    a: "إن لم يبدأ الكابتن في التحرك، يمكن التعديل من صفحة الطلب أو عبر الدعم.",
    cat: "الحساب",
  },
  {
    q: "استرجاع/تعويض",
    a: "يُعالج حسب أدلة الحالة ونوع الخدمة. قد يتم التعويض جزئيًا أو كقسيمة.",
    cat: "السياسات",
  },
  {
    q: "الخصوصية والبيانات",
    a: "نلتزم بسياسة الخصوصية وحماية بياناتك، ولا نشاركها إلا وفق القانون.",
    cat: "السياسات",
  },
  {
    q: "دعم التجّار",
    a: "للتجّار: حدّثوا القوائم والأسعار وراسلوا فريق العلاقات لأي عروض/صور.",
    cat: "تجّار",
  },
  {
    q: "دعم الكباتن",
    a: "للكباتن: التزموا بالزي والسلامة، وأبلغوا عن أي عوائق عبر التطبيق.",
    cat: "كباتن",
  },
  {
    q: "حالة النظام",
    a: "نراقب جاهزية المنظومة باستمرار. عند أي انقطاع واسع سننشر تحديثًا.",
    cat: "عام",
  },
];

const CATS = [
  "الكل",
  "الطلبات",
  "التسعير",
  "الدفع",
  "الحساب",
  "السياسات",
  "تجّار",
  "كباتن",
  "عام",
];

export default function SupportPage() {
  const theme = useTheme();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("الكل");

  const data = useMemo(() => {
    const byCat = cat === "الكل" ? FAQ : FAQ.filter((f) => f.cat === cat);
    const query = q.trim();
    if (!query) return byCat;
    const n = query.toLowerCase();
    return byCat.filter(
      (f) => f.q.toLowerCase().includes(n) || f.a.toLowerCase().includes(n)
    );
  }, [q, cat]);

  return (
    <>
      <LandingNavbar />

      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg" dir="rtl">
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h3" sx={{ fontFamily: "Cairo" }}>
              مركز المساعدة
            </Typography>
            <Typography color="text.secondary" sx={{ fontFamily: "Cairo" }}>
              أجوبة سريعة ودعم مباشر — ابحث عن سؤالك أو تواصل معنا.
            </Typography>
          </Stack>

          {/* شريط الأدوات */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="ابحث في الأسئلة…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <HelpOutlineIcon sx={{ mr: 1, opacity: 0.6 }} />
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {CATS.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    onClick={() => setCat(c)}
                    color={cat === c ? "primary" : undefined}
                    variant={cat === c ? "filled" : "outlined"}
                    sx={{ fontFamily: "Cairo" }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>

          {/* قنوات سريعة */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
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
                  <ChatBubbleOutlineIcon />
                  <Typography sx={{ fontFamily: "Cairo" }}>دردشة الطلب</Typography>
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.9, mb: 1, fontFamily: "Cairo" }}
                >
                  لأسرع استجابة لطلب جارٍ، استخدم الدردشة داخل الطلب.
                </Typography>
                <Button disabled size="small">
                  افتح الطلب (داخل التطبيق)
                </Button>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
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
                  <LocalPhoneOutlinedIcon />
                  <Typography sx={{ fontFamily: "Cairo" }}>اتصال مباشر</Typography>
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.9, mb: 1, fontFamily: "Cairo" }}
                >
                  تواصل عبر الهاتف في الحالات العاجلة.
                </Typography>
                {LINKS?.phone ? (
                  <Button
                    size="small"
                    href={`tel:${String(LINKS.phone).replace(/\s/g, "")}`}
                  >
                    اتصل الآن
                  </Button>
                ) : (
                  <Button disabled size="small">
                    غير متاح
                  </Button>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
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
                  <WhatsAppIcon />
                  <Typography sx={{ fontFamily: "Cairo" }}>واتساب الدعم</Typography>
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.9, mb: 1, fontFamily: "Cairo" }}
                >
                  افتح محادثة دعم عبر واتساب.
                </Typography>
                {LINKS?.whatsapp ? (
                  <Button
                    size="small"
                    href={LINKS.whatsapp}
                    target="_blank"
                    rel="noopener"
                  >
                    تواصل واتساب
                  </Button>
                ) : (
                  <Button disabled size="small">
                    غير متاح
                  </Button>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* الأسئلة الشائعة */}
          <Typography sx={{ fontFamily: "Cairo", mb: 1.5 }}>
            الأسئلة الشائعة
          </Typography>
          {data.length === 0 && (
            <Typography color="text.secondary" sx={{ mb: 2, fontFamily: "Cairo" }}>
              لا توجد نتائج مطابقة. جرّب كلمات أخرى أو اختر فئة مختلفة.
            </Typography>
          )}
          {data.map((f) => (
            <Accordion key={f.q} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontFamily: "Cairo" }}>{f.q}</Typography>
                  <Chip size="small" label={f.cat} sx={{ ml: 1 }} />
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary" sx={{ lineHeight: 1.9, fontFamily: "Cairo" }}>
                  {f.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}

          {/* تواصل إضافي */}
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontFamily: "Cairo", mb: 1 }}>
              لم تجد إجابتك؟
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                href="/contact"
                  sx={{ fontFamily: "Cairo" }}
              >
                افتح تذكرة دعم
              </Button>
              {LINKS?.whatsapp && (
                <Button
                  variant="outlined"
                  href={LINKS.whatsapp}
                  target="_blank"
                  rel="noopener"
                >
                  تواصل واتساب
                </Button>
              )}
            </Stack>
          </Paper>
        </Container>
      </Box>

      <FooterSection />
    </>
  );
}
