import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import { Email, Info } from "@mui/icons-material";

// DeleteAccount.tsx with MUI design consistency

export default function DeleteAccount() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  return (
    <Box
      sx={{
        bgcolor: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
        minHeight: "100vh",
        fontFamily: "Cairo, sans-serif",
        direction: lang === "ar" ? "rtl" : "ltr",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, #FF500D 0%, #5D4037 100%)`,
          py: { xs: 4, md: 6 },
          mb: 4,
          position: "relative",
        }}
      >
        <Container maxWidth="md">
          <Stack
            direction="row-reverse"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            spacing={3}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: "white",
                  textAlign: "left",
                  fontFamily: "Cairo, sans-serif",
                  mb: 1,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {lang === "ar" ? "حذف الحساب" : "Delete Account"}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontFamily: "Cairo, sans-serif",
                  fontWeight: 500,
                }}
              >
                {lang === "ar"
                  ? "طلب حذف حسابك من تطبيق بثواني"
                  : "Request account deletion from bThwani app"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                size="small"
                variant={lang === "ar" ? "contained" : "outlined"}
                onClick={() => setLang("ar")}
                sx={{
                  borderColor: "rgba(255,255,255,0.3)",
                  color: lang === "ar" ? "#FF500D" : "white",
                  bgcolor: lang === "ar" ? "white" : "transparent",
                  fontFamily: "Cairo, sans-serif",
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
                size="small"
                variant={lang === "en" ? "contained" : "outlined"}
                onClick={() => setLang("en")}
                sx={{
                  borderColor: "rgba(255,255,255,0.3)",
                  color: lang === "en" ? "#FF500D" : "white",
                  bgcolor: lang === "en" ? "white" : "transparent",
                  fontFamily: "Cairo, sans-serif",
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
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ pb: 6 }}>
        {/* Important Notice */}
        <Alert
          severity="warning"
          sx={{
            mb: 4,
            borderRadius: 3,
            fontFamily: "Cairo, sans-serif",
          
            "& .MuiAlert-message": {
              fontFamily: "Cairo, sans-serif",
            },
          }}
          icon={<Info />}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 1, fontFamily: "Cairo, sans-serif" , textAlign: "left"}}
          >
            {lang === "ar" ? "تنبيه مهم" : "Important Notice"}
          </Typography>
          <Typography sx={{ fontFamily: "Cairo, sans-serif" , textAlign: "left"}}>
            {lang === "ar"
              ? "هذا الإجراء نهائي ولا يمكن التراجع عنه. تأكد من نسخ أي بيانات مهمة قبل المتابعة."
              : "This action is permanent and cannot be undone. Make sure to backup any important data before proceeding."}
          </Typography>
        </Alert>

        {/* Request Instructions */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              fontFamily: "Cairo, sans-serif",
              color: "#FF500D",
              textAlign: "left",
            }}
          >
            {lang === "ar" ? "كيفية طلب الحذف" : "How to Request Deletion"}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontFamily: "Cairo, sans-serif",
              fontWeight: 600,
              color: "#1A3052",
              textAlign: "left",
            }}
          >
            {lang === "ar" ? "أرسل بريد إلكتروني إلى:" : "Send an email to:"}
          </Typography>

          <Box
            sx={{
              p: 3,
              bgcolor: "rgba(255,80,13,0.04)",
              borderRadius: 2,
              border: "1px solid rgba(255,80,13,0.2)",
              mb: 3,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "#FF500D",
                fontFamily: "Cairo, sans-serif",
                fontWeight: 700,
                mb: 2,
              }}
            >
              📧 operation@bthwani.com
            </Typography>
            <Typography
              sx={{
                fontFamily: "Cairo, sans-serif",
                fontWeight: 600,
                color: "#5D4037",
              }}
            >
              {lang === "ar"
                ? 'الموضوع: "Delete Account Request"'
                : 'Subject: "Delete Account Request"'}
            </Typography>
          </Box>

          <Typography
            sx={{
              mb: 3,
              fontFamily: "Cairo, sans-serif",
              lineHeight: 1.7,
              fontSize: "1.1rem",
            }}
          >
            {lang === "ar"
              ? "إذا كنت ترغب في طلب حذف حسابك وبياناتك المرتبطة من تطبيق bThwani، الرجاء مراسلتنا على البريد الإلكتروني أعلاه مع عنوان الموضوع المحدد."
              : "If you would like to request deletion of your account and associated data from the bThwani app, please email us at the address above with the specified subject line."}
          </Typography>
        </Paper>

        {/* What Gets Deleted */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            mb: 4,
          }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 3,
              fontFamily: "Cairo, sans-serif",
              color: "#1A3052",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            🗑️ {lang === "ar" ? "ما سيتم حذفه" : "What Gets Deleted"}
          </Typography>

          <Stack spacing={2}>
            <Box
              sx={{
                p: 3,
                bgcolor: "success.light",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "success.main",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Cairo, sans-serif",
                  fontWeight: 600,
                  color: "success.dark",
                  mb: 2,
                }}
              >
                {lang === "ar" ? "✅ سيتم حذف:" : "✅ Will be deleted:"}
              </Typography>
              <Typography
                component="div"
                sx={{
                  fontFamily: "Cairo, sans-serif",
                  color: "success.dark",
                  lineHeight: 1.7,
                }}
              >
                {lang === "ar" ? (
                  <>
                    • معلوماتك الشخصية (الملف الشخصي، بيانات تسجيل الدخول،
                    بيانات الاستخدام)
                    <br />
                    • تفاصيل الطلبات والمحفظة
                    <br />• المرفقات والصور الشخصية
                  </>
                ) : (
                  <>
                    • Your personal information (profile, login credentials,
                    usage data)
                    <br />
                    • Order details and wallet information
                    <br />• Personal attachments and photos
                  </>
                )}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 3,
                bgcolor: "info.light",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "info.main",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Cairo, sans-serif",
                  fontWeight: 600,
                  color: "info.dark",
                  mb: 2,
                }}
              >
                {lang === "ar" ? "ℹ️ قد يتم الاحتفاظ:" : "ℹ️ May be retained:"}
              </Typography>
              <Typography
                component="div"
                sx={{
                  fontFamily: "Cairo, sans-serif",
                  color: "info.dark",
                  lineHeight: 1.7,
                }}
              >
                {lang === "ar" ? (
                  <>
                    • بيانات غير شخصية ومجمّعة (مثل الإحصائيات المجهولة)
                    <br />
                    • سجلات ضرورية لأغراض الاستقرار والأمان
                    <br />• بيانات مطلوبة قانونياً
                  </>
                ) : (
                  <>
                    • Non-personal aggregated data (e.g., anonymous analytics)
                    <br />
                    • Records necessary for stability and security
                    <br />• Data required by law
                  </>
                )}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Contact Information */}
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
            variant="h5"
            fontWeight={700}
            sx={{
              mb: 3,
              fontFamily: "Cairo, sans-serif",
              color: "#FF500D",
              textAlign: "center",
            }}
          >
            {lang === "ar" ? "تواصل معنا" : "Contact Us"}
          </Typography>

          <Stack spacing={2} alignItems="center">
            <Button
              variant="contained"
              startIcon={<Email />}
              href="mailto:operation@bthwani.com?subject=Delete%20Account%20Request"
              sx={{
                fontFamily: "Cairo, sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
                px: 4,
                py: 1.5,
                borderRadius: 2,
                bgcolor: "linear-gradient(135deg, #FF500D 0%, #5D4037 100%)",
                "&:hover": {
                  bgcolor: "linear-gradient(135deg, #FF6B3D 0%, #7D5A4A 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {lang === "ar"
                ? "أرسل طلب الحذف الآن"
                : "Send Deletion Request Now"}
            </Button>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontFamily: "Cairo, sans-serif",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              {lang === "ar"
                ? "الطلب مجاني تماماً ولن يتم تحصيل أي رسوم منك"
                : "The request is completely free and no fees will be charged"}
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
