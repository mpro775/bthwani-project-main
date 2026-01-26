// =============================
// /src/landing/sections/FooterSection.tsx
// =============================
import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  IconButton,
  Link as MuiLink,
  Divider,
  alpha,
} from "@mui/material";
import {
  Phone,
  Email,
  LocationOn,
  Facebook,
  Instagram,
  WhatsApp,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { BRAND } from "../brand";
import { LINKS } from "../links";
import { COLORS } from "../../theme";

export const FooterSection: React.FC = () => {
  const social = [
    {
      key: "facebook",
      href: LINKS?.facebook,
      icon: <Facebook />,
      label: "Facebook",
    },
    {
      key: "instagram",
      href: LINKS?.instagram,
      icon: <Instagram />,
      label: "Instagram",
    },
    {
      key: "whatsapp",
      href: LINKS?.whatsapp,
      icon: <WhatsApp />,
      label: "WhatsApp",
    },
    // TikTok لا يتوفر كأيقونة جاهزة في @mui/icons-material؛ إن رغبت نضيف SvgIcon مخصص.
  ].filter((s) => Boolean(s.href));

  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        color: "#fff",
        pt: { xs: 8, md: 10 },
        pb: { xs: 6, md: 8 },
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
        overflow: "hidden",
      }}
    >
      {/* شريط تدرّج علوي رشيق */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
          opacity: 0.9,
        }}
      />

      {/* خلفية نقطية خفيفة */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,

          background:
            'url(data:image/svg+xml,%3Csvg width="40" height="40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.18"%3E%3Ccircle cx="1.5" cy="1.5" r="1.5"/%3E%3C/g%3E%3C/svg%3E)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* العمود 1: العلامة + وصف + متاجر */}
          <Grid component="div" size={{ xs: 12, md: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: "Cairo", mb: 1.5 }}>
              {BRAND.nameAr}
            </Typography>
            <Typography sx={{ mb: 2.5, opacity: 0.9, lineHeight: 1.9 }}>
              {BRAND.tagline}
            </Typography>

            {/* أيقونات اجتماعية */}
            {social.length > 0 && (
              <Stack direction="row" spacing={1}>
                {social.map((s) => (
                  <IconButton
                    key={s.key}
                    component="a"
                    href={s.href}
                    target="_blank"
                    rel="noopener"
                    aria-label={s.label}
                    sx={{
                      color: "#fff",
                      border: `1px solid ${alpha("#fff", 0.35)}`,
                      background: alpha("#fff", 0.06),
                      "&:hover": {
                        background: alpha("#fff", 0.12),
                        transform: "translateY(-2px)",
                      },
                      transition: "all .2s ease",
                    }}
                  >
                    {s.icon}
                  </IconButton>
                ))}
              </Stack>
            )}
          </Grid>

          {/* العمود 2: روابط سريعة */}
          <Grid component="div" size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" sx={{ fontFamily: "Cairo", mb: 1.5 }}>
              روابط
            </Typography>
            <Stack spacing={1.2}>
              <FooterLink href="#download">روابط التطبيق</FooterLink>
              <FooterLink href="#features">خدماتنا</FooterLink>
              <FooterLink href="#faq">الأسئلة الشائعة</FooterLink>
              {/* استبدل الروابط أدناه بصفحاتك الحقيقية حين تتوفر */}
              <FooterLink href="/privacy">سياسة الخصوصية</FooterLink>
              <FooterLink href="/terms">الشروط والأحكام</FooterLink>
            </Stack>
          </Grid>

          {/* العمود 3: تواصل */}
          <Grid component="div" size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" sx={{ fontFamily: "Cairo", mb: 1.5 }}>
              تواصل
            </Typography>

            <Stack spacing={1.3}>
              {LINKS?.phone && (
                <LineItem
                  icon={<Phone sx={{ opacity: 0.9 }} />}
                  label={
                    <MuiLink
                      href={`tel:${String(LINKS.phone).replace(/\s/g, "")}`}
                      underline="hover"
                      color={COLORS.white}
                      sx={{ fontWeight: 600 }}
                    >
                      {LINKS.phone}
                    </MuiLink>
                  }
                />
              )}

              {LINKS?.email && (
                <LineItem
                  icon={<Email sx={{ opacity: 0.9 }} />}
                  label={
                    <MuiLink
                      href={`mailto:${LINKS.email}`}
                      underline="hover"
                      color={COLORS.white}
                      sx={{ fontWeight: 600, wordBreak: "break-all" }}
                    >
                      {LINKS.email}
                    </MuiLink>
                  }
                />
              )}

              {LINKS?.address && (
                <LineItem
                  icon={<LocationOn sx={{ opacity: 0.9 }} />}
                  label={<span>{LINKS.address}</span>}
                />
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* فاصل سفلي */}
        <Divider
          sx={{
            my: { xs: 4, md: 5 },
            borderColor: alpha("#fff", 0.15),
          }}
        />

        {/* سطر الحقوق + روابط قانونية صغيرة + زر أعلى */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} {BRAND.nameAr}. جميع الحقوق محفوظة.
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <MuiLink
              href="/privacy"
              underline="hover"
              sx={{ color: alpha("#fff", 0.85) }}
            >
              سياسة الخصوصية
            </MuiLink>
            <MuiLink
              href="/terms"
              underline="hover"
              sx={{ color: alpha("#fff", 0.85), fontFamily: "Cairo"}}
            >
              الشروط
            </MuiLink>

            <IconButton
              aria-label="العودة للأعلى"
              href="#home"
              sx={{
                ml: 1,
                color: "#fff",
                border: `1px solid ${alpha("#fff", 0.35)}`,
                background: alpha("#fff", 0.06),
                "&:hover": { background: alpha("#fff", 0.12) },
              }}
            >
              <KeyboardArrowUp />
            </IconButton>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

/** عنصر رابط موحّد للذيل */
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <MuiLink
      href={href}
      underline="hover"
      sx={{
        color: "#fff",
        opacity: 0.9,
        fontWeight: 600,
        "&:hover": { opacity: 1 },
      }}
    >
      {children}
    </MuiLink>
  );
}

/** صف تواصل موحّد */
function LineItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1.2} alignItems="center">
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: alpha("#fff", 0.12),
          border: `1px solid ${alpha("#fff", 0.25)}`,
        }}
      >
        {icon}
      </Box>
      <Typography component="div" color={COLORS.white}>
        {label}
      </Typography>
    </Stack>
  );
}
