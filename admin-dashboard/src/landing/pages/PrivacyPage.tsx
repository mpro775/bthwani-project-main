import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

// ✅ Bilingual (AR/EN) drop-in page for https://www.bthwani.com/privacy
// - Pure React, no external UI libs
// - Language toggle (Arabic / English) + product tabs
// - Link to /delete-account
// - Update the date below when you revise

export default function PrivacyPolicy() {
  type Lang = "ar" | "en";
  type Tab = "consumer" | "marketers" | "captain" | "business";

  const [lang, setLang] = useState<Lang>("ar");
  const [tab, setTab] = useState<Tab>("consumer");

  const t = translations[lang];

  type Styles = {
    link: React.CSSProperties;
  };

  const styles: Styles = {
    link: { color: "#2563eb", textDecoration: "underline" },
  };

  return (
    <Box
      sx={{
        bgcolor: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
        minHeight: "100vh",
        fontFamily: '"Cairo", sans-serif',
      }}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Header Section with Gradient Background */}
      <Box
        sx={{
          background: `linear-gradient(135deg, #FF500D 0%, #5D4037 100%)`,
          py: { xs: 4, md: 6 },
          mb: 4,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="0.5" fill="%23ffffff" opacity="0.1"/><circle cx="75" cy="75" r="0.5" fill="%23ffffff" opacity="0.1"/><circle cx="50" cy="10" r="0.3" fill="%23ffffff" opacity="0.1"/><circle cx="90" cy="40" r="0.4" fill="%23ffffff" opacity="0.1"/><circle cx="10" cy="80" r="0.3" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>\')',
            backgroundSize: "100px 100px",
          },
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            spacing={3}
          >
            <Box>
              <Typography
                variant="h3"
                fontWeight={900}
                sx={{
                  lineHeight: 1.2,
                  color: "white",
                  fontFamily: '"Cairo", sans-serif',
                  mb: 1,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {t.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontFamily: '"Cairo", sans-serif',
                  fontWeight: 500,
                }}
              >
                {t.intro}
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              aria-label={t.switchLangAria}
            >
              <Button
                size="medium"
                variant={lang === "ar" ? "contained" : "outlined"}
                onClick={() => setLang("ar")}
                sx={{
                  borderColor: "rgba(255,255,255,0.3)",
                  color: lang === "ar" ? "#FF500D" : "white",
                  bgcolor: lang === "ar" ? "white" : "transparent",
                  fontFamily: '"Cairo", sans-serif',
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor:
                      lang === "ar"
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.1)",
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                }}
              >
                العربية
              </Button>
              <Button
                size="medium"
                variant={lang === "en" ? "contained" : "outlined"}
                onClick={() => setLang("en")}
                sx={{
                  borderColor: "rgba(255,255,255,0.3)",
                  color: lang === "en" ? "#FF500D" : "white",
                  bgcolor: lang === "en" ? "white" : "transparent",
                  fontFamily: '"Cairo", sans-serif',
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor:
                      lang === "en"
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.1)",
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                }}
              >
                English
              </Button>
            </Stack>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.8)",
              mt: 2,
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            {t.lastUpdated}: 16 Sep 2025
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 } }}>
        {/* Quick Links Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Typography
            component="span"
            fontWeight={700}
            sx={{
              fontFamily: '"Cairo", sans-serif',
              color: "#FF500D",
              fontSize: "1.1rem",
            }}
          >
            {t.quickLinks}
          </Typography>{" "}
          <a
            href="/delete-account"
            style={{
              ...styles.link,
              fontFamily: '"Cairo", sans-serif',
              fontWeight: 600,
            }}
          >
            {t.deleteAccount}
          </a>{" "}
          •{" "}
          <a
            href="#contact"
            style={{
              ...styles.link,
              fontFamily: '"Cairo", sans-serif',
              fontWeight: 600,
            }}
          >
            {t.contact}
          </a>
        </Paper>

        {/* Product Tabs */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              fontWeight: 700,
              color: "text.primary",
              textAlign: "center",
            }}
          >
            {t.chooseProduct}
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            useFlexGap
            flexWrap="wrap"
            justifyContent="center"
            sx={{
              "& .MuiButton-root": {
                fontFamily: '"Cairo", sans-serif',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                position: "relative",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-2px) scale(1.02)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: "inherit",
                  background:
                    "linear-gradient(135deg, rgba(255,80,13,0.1) 0%, rgba(93,64,55,0.1) 100%)",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                },
                "&:hover::before": {
                  opacity: 1,
                },
              },
            }}
          >
            {[
              { key: "consumer", label: t.tabs.consumer },
              { key: "marketers", label: t.tabs.marketers },
              { key: "captain", label: t.tabs.captain },
              { key: "business", label: t.tabs.business },
            ].map(({ key, label }) => (
              <Button
                key={key}
                size="medium"
                variant={tab === key ? "contained" : "outlined"}
                onClick={() => setTab(key as Tab)}
                sx={{
                  bgcolor:
                    tab === key
                      ? "linear-gradient(135deg, #FF500D 0%, #5D4037 100%)"
                      : "transparent",
                  borderColor: tab === key ? "#FF500D" : "divider",
                  color: tab === key ? "white" : "text.primary",
                  "&:hover": {
                    bgcolor:
                      tab === key
                        ? "linear-gradient(135deg, #FF6B3D 0%, #7D5A4A 100%)"
                        : "rgba(255,80,13,0.04)",
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* Content Section */}
        <Box sx={{ mb: 4 }}>
          {tab === "consumer" && <ConsumerPolicy styles={styles} lang={lang} />}
          {tab === "marketers" && <MarketersPolicy lang={lang} />}
          {tab === "captain" && <CaptainPolicy lang={lang} />}
          {tab === "business" && <BusinessPolicy lang={lang} />}
        </Box>

        {/* Contact Section */}
        <Divider sx={{ my: 4, borderColor: "divider" }} />
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <Box id="contact">
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                mb: 2,
                fontFamily: "Cairo",
                color: "#FF500D",
              }}
            >
              {t.contactUs}
            </Typography>
            <Typography
              sx={{
                mb: 1.5,
                fontFamily: "Cairo",
                fontWeight: 500,
              }}
            >
              {t.email}:{" "}
              <a
                style={{
                  ...styles.link,
                  fontFamily: "Cairo",
                  fontWeight: 600,
                  color: "#FF500D",
                }}
                href="mailto:support@bthwani.com"
              >
                support@bthwani.com
              </a>
            </Typography>
            <Typography
              sx={{
                mb: 1.5,
                fontFamily: "Cairo",
                fontWeight: 500,
              }}
            >
              {t.inAppHelp}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontFamily: "Cairo",
                fontStyle: "italic",
              }}
            >
              {t.mayUpdate}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

// ———————————————————————————————————————————————
// Translations
// ———————————————————————————————————————————————
const translations = {
  ar: {
    title: "سياسة الخصوصية – بثواني bThwani",
    lastUpdated: "آخر تحديث",
    intro:
      "في بثواني، نحترم خصوصيتك ونلتزم بحماية بياناتك. توضح هذه الصفحة ما نجمعه وكيف نستخدمه ونشاركه ونحتفظ به لمنتجاتنا المختلفة.",
    quickLinks: "روابط مفيدة:",
    deleteAccount: "حذف الحساب",
    contact: "التواصل",
    chooseProduct: "اختَر منتج بثواني",
    contactUs: "التواصل",
    email: "البريد الإلكتروني",
    inAppHelp: "من داخل التطبيق: قسم الدعم أو تواصل معنا",
    mayUpdate:
      "قد نقوم بتحديث هذه السياسة وسنخطرك بالتغييرات المهمة داخل التطبيق.",
    switchLangAria: "تبديل اللغة",
    tabs: {
      consumer: "التطبيق الرئيسي (المستخدم)",
      marketers: "مسوّقين بثواني",
      captain: "كباتن بثواني",
      business: "أعمال بثواني",
    },
    sections: {
      // Generic section headings for reuse
      collect: "ما نجمعه",
      use: "لماذا نستخدمها؟",
      share: "المشاركة",
      security: "الحماية",
      rights: "حقوقك واختياراتك",
      retention: "مدة الاحتفاظ",
    },
  },
  en: {
    title: "Privacy Policy – bThwani",
    lastUpdated: "Last updated",
    intro:
      "At bThwani, we respect your privacy and are committed to protecting your data. This page explains what we collect, how we use it, share it, and retain it across our products.",
    quickLinks: "Quick links:",
    deleteAccount: "Delete Account",
    contact: "Contact",
    chooseProduct: "Choose a bThwani product",
    contactUs: "Contact",
    email: "Email",
    inAppHelp: "From the app: Help/Support section",
    mayUpdate:
      "We may update this policy and will notify you of material changes in the app.",
    switchLangAria: "Switch language",
    tabs: {
      consumer: "Main App (Consumer)",
      marketers: "bThwani Marketers",
      captain: "bThwani Captains",
      business: "bThwani Business",
    },
    sections: {
      collect: "What we collect",
      use: "How we use it",
      share: "Sharing",
      security: "Security",
      rights: "Your rights & choices",
      retention: "Retention",
    },
  },
} as const;

// ———————————————————————————————————————————————
// (1) Consumer – AR/EN
// ———————————————————————————————————————————————
function ConsumerPolicy({ styles, lang }: { styles: { link: React.CSSProperties }; lang: "ar" | "en" }) {
  const L = translations[lang].sections;
  const isAr = lang === "ar";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, #FF500D 0%, #5D4037 100%)`,
        },
      }}
    >
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          mb: 3,
          fontFamily: "Cairo",
          color: "#FF500D",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {isAr
          ? "سياسة الخصوصية – تطبيق بثواني (المستخدم)"
          : "Privacy Policy – bThwani App (Consumer)"}
      </Typography>

      <Stack spacing={3}>
        {/* Collection Section */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: "rgba(255,80,13,0.02)",
              border: "1px solid rgba(255,80,13,0.1)",
            },
          }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.collect}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: "Cairo",
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>
                  بيانات الحساب: الاسم، رقم الهاتف، (وعند الحاجة) البريد
                  الإلكتروني.
                </li>
                <li>
                  بيانات الطلب والمحفظة: تفاصيل الطلبات وعمليات السداد داخل
                  التطبيق.
                </li>
                <li>الموقع (اختياري): لتحسين دقة الأقرب وتسريع التوصيل.</li>
                <li>
                  بيانات تشغيل أساسية: معلومات بسيطة عن الجهاز لأغراض الاعتمادية
                  والتحسين.
                </li>
              </>
            ) : (
              <>
                <li>
                  Account data: name, phone number, and email (when needed).
                </li>
                <li>
                  Orders & wallet data: order details and in‑app payment
                  records.
                </li>
                <li>
                  Location (optional): to improve nearby selection and delivery
                  speed.
                </li>
                <li>
                  Basic runtime data: minimal device info for reliability and
                  improvements.
                </li>
              </>
            )}
          </Box>
        </Box>

        {/* Use Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.use}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>تشغيل الحساب والمحفظة وإتمام الطلبات وتتبعها.</li>
                <li>إرسال التنبيهات المفيدة (قبول الطلب، حالة التسليم…).</li>
                <li>تحسين الجودة والأمان وتجربة الاستخدام.</li>
              </>
            ) : (
              <>
                <li>
                  Operate your account & wallet, fulfill and track orders.
                </li>
                <li>
                  Send helpful notifications (order acceptance, delivery status,
                  etc.).
                </li>
                <li>Improve quality, security, and user experience.</li>
              </>
            )}
          </Box>
        </Box>

        {/* Sharing Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: "Cairo",
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.share}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: "Cairo",
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>لا نبيع بياناتك.</li>
                <li>
                  نشارك الحد الأدنى الضروري مع أطراف موثوقة (المتاجر، الكباتن،
                  الدفع) لتقديم الخدمة.
                </li>
                <li>قد نُفصح إذا طُلب قانونًا من جهة مختصة.</li>
              </>
            ) : (
              <>
                <li>We do not sell your personal data.</li>
                <li>
                  We share the minimum necessary with trusted parties
                  (merchants, captains, payments) to provide the service.
                </li>
                <li>
                  We may disclose if legally required by a competent authority.
                </li>
              </>
            )}
          </Box>
        </Box>

        {/* Security Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.security}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Cairo", sans-serif',
              lineHeight: 1.6,
              color: "text.primary",
              fontWeight: 500,
            }}
          >
            {isAr
              ? "نطبق إجراءات مناسبة لحماية البيانات وضبط الوصول الداخلي ومراجعات دورية."
              : "We apply appropriate safeguards, internal access controls, and periodic reviews."}
          </Typography>
        </Box>

        {/* Rights Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.rights}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>يمكنك طلب الاطلاع أو التعديل أو الحذف/إغلاق الحساب.</li>
                <li>إدارة أذونات الموقع والإشعارات من إعدادات جهازك.</li>
                <li>
                  لطلب الحذف، تفضل بزيارة{" "}
                  <a
                    style={{
                      ...styles.link,
                      fontFamily: '"Cairo", sans-serif',
                      fontWeight: 600,
                      color: "#FF500D",
                    }}
                    href="/delete-account"
                  >
                    حذف الحساب
                  </a>
                  .
                </li>
              </>
            ) : (
              <>
                <li>
                  You may request access, correction, and deletion/closure of
                  your account.
                </li>
                <li>
                  Manage location and notification permissions in your device
                  settings.
                </li>
                <li>
                  For deletion requests, see{" "}
                  <a
                    style={{
                      ...styles.link,
                      fontFamily: '"Cairo", sans-serif',
                      fontWeight: 600,
                      color: "#FF500D",
                    }}
                    href="/delete-account"
                  >
                    Delete Account
                  </a>
                  .
                </li>
              </>
            )}
          </Box>
        </Box>

        {/* Retention Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.retention}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>سجلات الطلبات والدفع لفترة معقولة لا تتجاوز 24 شهرًا.</li>
                <li>الصور/المرفقات (إن وجدت) من 6–12 شهرًا.</li>
                <li>مراسلات الدعم حتى 12 شهرًا؛ ثم تُحذف أو تُجهّل.</li>
              </>
            ) : (
              <>
                <li>
                  Order & payment logs for a reasonable period not exceeding 24
                  months.
                </li>
                <li>Images/attachments (if any) for 6–12 months.</li>
                <li>
                  Support communications up to 12 months, then deleted or
                  anonymized.
                </li>
              </>
            )}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}

// ———————————————————————————————————————————————
// (2) Marketers – AR/EN
// ———————————————————————————————————————————————
function MarketersPolicy({ lang }: { lang: "ar" | "en" }) {
  const L = translations[lang].sections;
  const isAr = lang === "ar";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          mb: 3,
          fontFamily: '"Cairo", sans-serif',
          color: "#FF500D",
          textAlign: "center",
        }}
      >
        {isAr
          ? "سياسة الخصوصية – مسوّقين بثواني"
          : "Privacy Policy – bThwani Marketers"}
      </Typography>

      <Stack spacing={3}>
        {/* Collection Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.collect}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>
                  بيانات حساب المسوّق: الاسم، رقم الجوال، البريد (إن وُجد).
                </li>
                <li>
                  بيانات المتجر: الاسم، وسائل التواصل، الموقع التقريبي،
                  والمرفقات اللازمة.
                </li>
                <li>معلومات تقنية خفيفة: نوع الجهاز ومعرف الإشعارات.</li>
                <li>
                  الموقع اختياري ويستخدم فقط لتحديد موقع المتجر بدقة عند رغبتك.
                </li>
              </>
            ) : (
              <>
                <li>
                  Marketer account data: name, phone, email (if provided).
                </li>
                <li>
                  Store data: name, contact channels, approximate location, and
                  required attachments.
                </li>
                <li>
                  Light technical data: device type and notification
                  identifiers.
                </li>
                <li>
                  Location is optional and used only to precisely pin a store
                  when you opt in.
                </li>
              </>
            )}
          </Box>
        </Box>

        {/* Use Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.use}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>تنفيذ المهمة الأساسية: إضافة المتاجر ومتابعة حالتها.</li>
                <li>إرسال تنبيهات عند القبول أو طلب معلومات إضافية.</li>
                <li>تحسين سهولة الاستخدام واعتمادية الخدمة.</li>
              </>
            ) : (
              <>
                <li>
                  Perform the core workflow: submit stores and track status.
                </li>
                <li>
                  Send notifications upon approval or when more info is needed.
                </li>
                <li>Improve usability and reliability.</li>
              </>
            )}
          </Box>
        </Box>

        {/* Sharing Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.share}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>
                  نشارك الحد الأدنى مع مزودي خدمات موثوقين (خرائط، إشعارات…).
                </li>
                <li>لا نبيع بياناتك.</li>
              </>
            ) : (
              <>
                <li>
                  We share the minimum necessary with trusted providers (maps,
                  notifications, etc.).
                </li>
                <li>We do not sell your data.</li>
              </>
            )}
          </Box>
        </Box>

        {/* Security & Rights Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.security} & {L.rights}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>
                  إجراءات معقولة لحماية البيانات واحتفاظ للفترة اللازمة فقط.
                </li>
                <li>تستطيع الاطلاع أو التعديل أو طلب الحذف متى أمكن.</li>
                <li>تحكم في أذونات الموقع والإشعارات من إعدادات جهازك.</li>
              </>
            ) : (
              <>
                <li>Reasonable safeguards and retention only as needed.</li>
                <li>
                  You can access, correct, or request deletion where applicable.
                </li>
                <li>
                  Control location/notification permissions in device settings.
                </li>
              </>
            )}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}

// ———————————————————————————————————————————————
// (3) Captains – AR/EN
// ———————————————————————————————————————————————
function CaptainPolicy({ lang }: { lang: "ar" | "en" }) {
  const L = translations[lang].sections;
  const isAr = lang === "ar";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          mb: 3,
          fontFamily: '"Cairo", sans-serif',
          color: "#FF500D",
          textAlign: "center",
        }}
      >
        {isAr
          ? "سياسة الخصوصية – كباتن بثواني"
          : "Privacy Policy – bThwani Captains"}
      </Typography>

      <Stack spacing={3}>
        {/* Collection Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.collect}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>
                  بيانات الحساب والكابتن: الاسم، رقم الجوال، البريد (إن وجد)،
                  ومعلومات المركبة.
                </li>
                <li>
                  بيانات الرحلات: وقت ومكان الاستلام والتسليم، المسافة، المدة،
                  حالة الطلب.
                </li>
                <li>
                  الموقع أثناء الرحلة (بعد منح الإذن): لاختيار الطلبات القريبة
                  والملاحة الدقيقة.
                </li>
                <li>الأرباح والمحفظة: تفاصيل الأرباح والرصيد والسحوبات.</li>
                <li>معلومات تقنية خفيفة: نوع الجهاز ومعرفات الإشعارات.</li>
              </>
            ) : (
              <>
                <li>
                  Captain & account data: name, phone, email (if any), and
                  vehicle info.
                </li>
                <li>
                  Trip data: pickup/dropoff time and place, distance, duration,
                  and order status.
                </li>
                <li>
                  Location during trips (with permission) for nearby jobs and
                  accurate navigation.
                </li>
                <li>Earnings & wallet details: balances and withdrawals.</li>
                <li>
                  Light technical data: device type and notification
                  identifiers.
                </li>
              </>
            )}
          </Box>
        </Box>

        {/* Use Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.use}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>
                  تشغيل الميزات الأساسية: استلام الطلبات، الملاحة، وتحديث
                  الحالة.
                </li>
                <li>عرض الأرباح وإتمام السحوبات.</li>
                <li>تحسين التجربة وإرسال التنبيهات المهمة.</li>
              </>
            ) : (
              <>
                <li>
                  Run core features: accept jobs, navigate, and update status.
                </li>
                <li>Show earnings and process withdrawals.</li>
                <li>Improve experience and send essential notifications.</li>
              </>
            )}
          </Box>
        </Box>

        {/* Sharing Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.share}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>
                  نشارك الحد الأدنى لإتمام الخدمة، وقد تظهر معلومات لازمة
                  للعميل/التاجر.
                </li>
                <li>لا نبيع بياناتك.</li>
              </>
            ) : (
              <>
                <li>
                  We share only what is necessary to deliver the service; some
                  info may be shown to the customer/merchant.
                </li>
                <li>We do not sell your data.</li>
              </>
            )}
          </Box>
        </Box>

        {/* Security & Rights Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.security} & {translations[lang].sections.rights}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>إجراءات حماية مناسبة.</li>
                <li>
                  نحتفظ بالبيانات طوال فترة الاستخدام وما يلزم لإدارة الحساب
                  والسجلات.
                </li>
                <li>تستطيع الاطلاع أو التعديل أو طلب الحذف متى أمكن.</li>
                <li>تحكم في أذونات الموقع والإشعارات من إعدادات جهازك.</li>
              </>
            ) : (
              <>
                <li>Appropriate security measures.</li>
                <li>
                  We retain data while the account is active and as needed for
                  records.
                </li>
                <li>
                  You can access, correct, or request deletion where applicable.
                </li>
                <li>
                  Control location/notification permissions in device settings.
                </li>
              </>
            )}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}

// ———————————————————————————————————————————————
// (4) Business – AR/EN
// ———————————————————————————————————————————————
function BusinessPolicy({ lang }: { lang: "ar" | "en" }) {
  const L = translations[lang].sections;
  const isAr = lang === "ar";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          mb: 3,
          fontFamily: '"Cairo", sans-serif',
          color: "#FF500D",
          textAlign: "center",
        }}
      >
        {isAr
          ? "سياسة الخصوصية – أعمال بثواني"
          : "Privacy Policy – bThwani Business"}
      </Typography>

      <Stack spacing={3}>
        {/* Collection Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.collect}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>
                  بيانات النشاط التجاري: اسم المتجر، العنوان، ووسائل التواصل.
                </li>
                <li>
                  المدفوعات والمحفظة: تفاصيل العمليات، الرصيد، وبيانات الحساب
                  للتسوية.
                </li>
                <li>
                  المنتجات والطلبات: أسماء المنتجات، الأسعار، المخزون، سجل
                  الطلبات.
                </li>
                <li>معلومات الاستخدام: نوع الجهاز ونظام التشغيل.</li>
                <li>
                  الموقع الجغرافي للمتجر (اختياري) لاحتساب تكاليف التوصيل.
                </li>
              </>
            ) : (
              <>
                <li>
                  Business data: store name, address, and contact details.
                </li>
                <li>
                  Payments & wallet: transactions, balances, and settlement
                  account info.
                </li>
                <li>
                  Products & orders: product names, prices, inventory, and order
                  history.
                </li>
                <li>Usage info: device type and OS.</li>
                <li>
                  Store geolocation (optional) for delivery cost estimation.
                </li>
              </>
            )}
          </Box>
        </Box>

        {/* Use Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.use}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>تشغيل الحساب وتمكين المدفوعات والتسويات بأمان.</li>
                <li>إدارة الطلبات والمنتجات وإرسال الإشعارات المهمة.</li>
                <li>تقارير الأداء والتحسين.</li>
                <li>مكافحة الاحتيال والالتزام بالمتطلبات النظامية.</li>
              </>
            ) : (
              <>
                <li>
                  Operate the account and enable payments/settlements securely.
                </li>
                <li>
                  Manage orders and products and send essential notifications.
                </li>
                <li>Provide performance reports and improvements.</li>
                <li>Prevent fraud and comply with legal requirements.</li>
              </>
            )}
          </Box>
        </Box>

        {/* Sharing Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.share}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>
                  مشاركة ضرورية فقط مع مزودين موثوقين (الدفع، الإشعارات…).
                </li>
                <li>لن نبيع بياناتك.</li>
              </>
            ) : (
              <>
                <li>
                  Only necessary sharing with trusted providers (payments,
                  notifications, etc.).
                </li>
                <li>We do not sell your data.</li>
              </>
            )}
          </Box>
        </Box>

        {/* Security Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.security}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Cairo", sans-serif',
              lineHeight: 1.6,
              color: "text.primary",
              fontWeight: 500,
            }}
          >
            {isAr
              ? "إجراءات أمان لحماية البيانات من الوصول غير المصرح به أو الفقدان."
              : "Security measures to protect data from unauthorized access or loss."}
          </Typography>
        </Box>

        {/* Retention Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {L.retention}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Cairo", sans-serif',
              lineHeight: 1.6,
              color: "text.primary",
              fontWeight: 500,
            }}
          >
            {isAr
              ? "نحتفظ بالبيانات طوال فترة الاستخدام وما تفرضه القوانين، ثم نحذفها بشكل آمن."
              : "We retain data while in use and as required by law, then delete it securely."}
          </Typography>
        </Box>

        {/* Rights Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
{isAr ? "حقوق التاجر" : "Merchant rights"}
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 3,
              fontFamily: '"Cairo", sans-serif',
              "& li": {
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.primary",
                fontWeight: 500,
              },
            }}
          >
            {isAr ? (
              <>
                <li>الاطلاع على البيانات أو تعديلها أو طلب حذفها.</li>
                <li>التحكم في الأذونات الاختيارية مثل الموقع والإشعارات.</li>
              </>
            ) : (
              <>
                <li>Access, correct, or request deletion of data.</li>
                <li>
                  Control optional permissions such as location and
                  notifications.
                </li>
              </>
            )}
          </Box>
        </Box>

        {/* Cookies Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
{isAr ? "ملفات تعريف الارتباط (Cookies)" : "Cookies"}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Cairo", sans-serif',
              lineHeight: 1.6,
              color: "text.primary",
              fontWeight: 500,
            }}
          >
            {isAr
              ? "نستخدمها لتحسين الأداء؛ ويمكنك التحكم بها من إعدادات المتصفح أو الجهاز."
              : "We use cookies to improve performance; you can control them from your browser or device settings."}
          </Typography>
        </Box>

        {/* Target Audience Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
{isAr ? "الفئة المستهدفة" : "Intended audience"}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Cairo", sans-serif',
              lineHeight: 1.6,
              color: "text.primary",
              fontWeight: 500,
            }}
          >
            {isAr
              ? "التطبيق مخصص للتجار أو المخولين بإدارة الأنشطة التجارية."
              : "The app is intended for merchants or authorized business operators."}
          </Typography>
        </Box>

        {/* Changes Section */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 2,
              fontFamily: '"Cairo", sans-serif',
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
{isAr ? "التعديلات" : "Changes"}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Cairo", sans-serif',
              lineHeight: 1.6,
              color: "text.primary",
              fontWeight: 500,
            }}
          >
            {isAr
              ? "قد نقوم بتحديث السياسة وسنخطرك بالتغييرات المهمة عبر التطبيق."
              : "We may update this policy and will notify you of material changes via the app."}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
