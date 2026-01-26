// =====================================
// src/pages/ContactPage.tsx
// =====================================
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Grid,
  Divider,
  alpha,
  useTheme,
  MenuItem,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LandingNavbar from "../components/LandingNavbar";
import { FooterSection } from "../sections/FooterSection";
import { LINKS } from "../links";
import BRAND from "../brand";

export default function ContactPage() {
  const theme = useTheme();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "دعم الطلبات",
    orderId: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // TODO: axios.post('/api/support/contact', form)
      console.log("contact =>", form);
      setOk(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "دعم الطلبات",
        orderId: "",
        message: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const infoRows = [
    {
      icon: <PhoneInTalkOutlinedIcon fontSize="small" />,
      label: "الهاتف",
      value: LINKS?.phone || "—",
      href: LINKS?.phone
        ? `tel:${String(LINKS.phone).replace(/\s/g, "")}`
        : undefined,
    },
    {
      icon: <WhatsAppIcon fontSize="small" />,
      label: "واتساب",
      value: LINKS?.whatsapp ? "تواصل عبر واتساب" : "—",
      href: LINKS?.whatsapp,
    },
    {
      icon: <MailOutlineIcon fontSize="small" />,
      label: "البريد",
      value: LINKS?.email || "—",
      href: LINKS?.email ? `mailto:${LINKS.email}` : undefined,
    },
    {
      icon: <AccessTimeIcon fontSize="small" />,
      label: "ساعات العمل",
      value: BRAND?.hours || "يومياً 9ص–11م",
    },
  ];

  return (
    <>
      <LandingNavbar />

      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg" dir="rtl">
          <Stack
            spacing={1}
            sx={{ mb: 3, textAlign: { xs: "center", md: "left" } }}
          >
            <Typography variant="h3" sx={{ fontFamily: "Cairo" }}>
              تواصل معنا
            </Typography>
            <Typography color="text.secondary" sx={{ fontFamily: "Cairo" }}>
              نحن هنا لمساعدتك في أي وقت — اكتب لنا عبر النموذج أو اختر قناة
              التواصل المفضّلة لك.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {/* معلومات وقنوات التواصل */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  height: "100%",
                }}
              >
                <Typography sx={{ fontFamily: "Cairo", mb: 1.5 }}>
                  قنوات التواصل
                </Typography>
                <Stack spacing={1.2}>
                  {infoRows.map((r, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      spacing={1.2}
                      alignItems="center"
                    >
                      {r.icon}
                      <Typography sx={{ minWidth: 96, fontFamily: "Cairo" }}>
                        {r.label}
                      </Typography>
                      {r.href ? (
                        <Button
                          href={r.href}
                          target={
                            r.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            r.href.startsWith("http") ? "noopener" : undefined
                          }
                          size="small"
                          sx={{
                            px: 0.5,
                            textTransform: "none",
                            fontFamily: "Cairo",
                          }}
                        >
                          {r.value}
                        </Button>
                      ) : (
                        <Typography color="text.secondary" sx={{ fontFamily: "Cairo" }}>
                          {r.value}
                        </Typography>
                      )}
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.9, fontFamily: "Cairo" }}
                >
                  لأمور عاجلة متعلقة بطلب جارٍ، يُفضّل استخدام الدردشة داخل
                  الطلب أو الاتصال مباشرة.
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1, flexWrap: "wrap" }}
                >
                  <Chip label="دعم 24/7" sx={{ fontFamily: "Cairo" }} />
                  <Chip label="الاستجابة عادةً خلال ساعات" sx={{ fontFamily: "Cairo" }}  />
                </Stack>
              </Paper>
            </Grid>

            {/* نموذج التواصل */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}
              >
                <Typography sx={{ fontFamily: "Cairo", mb: 1.5 }}>
                  أرسل رسالة
                </Typography>
                <Box component="form" onSubmit={submit} noValidate>
                  <Stack spacing={1.5}>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="الاسم"
                          required
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="البريد"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="رقم الهاتف (اختياري)"
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          select
                          label="الفئة"
                          value={form.category}
                          onChange={(e) =>
                            setForm({ ...form, category: e.target.value })
                          }
                          fullWidth
                        >
                          {[
                            "دعم الطلبات",
                            "مشاكل الدفع",
                            "شراكات/تجّار",
                            "اقتراحات",
                            "أخرى",
                          ].map((c) => (
                            <MenuItem key={c} value={c}>
                              {c}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="رقم الطلب (إن وُجد)"
                          value={form.orderId}
                          onChange={(e) =>
                            setForm({ ...form, orderId: e.target.value })
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="الموضوع"
                          required
                          value={form.subject}
                          onChange={(e) =>
                            setForm({ ...form, subject: e.target.value })
                          }
                          fullWidth
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      label="نص الرسالة"
                      required
                      multiline
                      minRows={5}
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      fullWidth
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      sx={{ fontFamily: "Cairo" }}
                    >
                      {submitting ? "جارٍ الإرسال…" : "إرسال"}
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Snackbar
        open={ok}
        autoHideDuration={4000}
        onClose={() => setOk(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setOk(false)}>
          تم استلام رسالتك، سنردّ عليك في أقرب وقت.
        </Alert>
      </Snackbar>

      <FooterSection />
    </>
  );
}
