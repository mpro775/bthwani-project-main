// src/components/navbar/LandingNavbar.tsx
import React, {
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  useMediaQuery,
  alpha,
  useTheme,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import bthwaniMark from "../../assets/bthwani-mark.png";
// لو كان لديك كائن LINKS (هاتف/واتساب) فعّله باستيراد السطر أدناه:
import { LINKS } from "../../landing/links";
import { COLORS } from "../../theme";

type NavItem = { path: string; label: string };

const ALL_NAV_ITEMS: NavItem[] = [
  { path: "/", label: "الرئيسية" },
  { path: "/for-merchants", label: "للتجار" },
  { path: "/become-captain", label: "انضم ككابتن" },
  { path: "/about", label: "من نحن" },
  { path: "/contact", label: "تواصل بنا" },
  { path: "/support", label: "الدعم" },
  { path: "/privacy", label: "الخصوصية" },
  { path: "/terms", label: "الشروط" },
  { path: "/safety", label: "السلامة" },
];

export default function LandingNavbar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDownMd = useMediaQuery(theme.breakpoints.down("md"));
  const prefersReduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // تقدّم التمرير
  const { scrollYProgress } = useScroll();

  // إظهار/إخفاء على حسب اتجاه التمرير + صلابة الخلفية بعد 12px
  useMotionValueEvent(scrollYProgress, "change", () => {
    if (typeof window === "undefined") return;
    const y = window.scrollY || 0;
    const goingDown = y > 120;
    setHidden(goingDown);
    setSolid(y > 12);
  });

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const isActivePath = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  // عرض جميع العناصر فورًا لتجنّب أي تأخير
  const NAV_ITEMS = ALL_NAV_ITEMS;

  // مجموعات متداخلة حسب التشابه
  const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
    {
      label: "تعرّف علينا",
      items: [
        { path: "/about", label: "من نحن" },
        { path: "/support", label: "الدعم" },
        { path: "/safety", label: "السلامة" },
      ],
    },
    {
      label: "انضم",
      items: [
        { path: "/for-merchants", label: "للتجار" },
        { path: "/become-captain", label: "ككابتن" },
      ],
    },
  ];

  const handleOpenGroup = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, label: string) => {
      setMenuAnchor(e.currentTarget);
      setOpenGroup(label);
    },
    []
  );

  const handleCloseGroup = useCallback(() => {
    setMenuAnchor(null);
    setOpenGroup(null);
  }, []);

  const brand = useMemo(
    () => (
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{ cursor: "pointer" }}
        onClick={() => handleNavigate("/")}
        role="link"
        tabIndex={0}
        aria-label="الذهاب للرئيسية"
      >
        <Box
          component="img"
          src={bthwaniMark}
          alt="بثواني"
          sx={{
            width: 32,
            height: 32,
            objectFit: "contain",
            borderRadius: 1,
            color: COLORS.white,
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
   
      </Stack>
    ),
    [handleNavigate]
  );

  const glassBg = alpha(theme.palette.background.paper, solid ? 0.9 : 0.6);

  return (
    <>
      {/* شريط تقدّم التمرير */}
      <Box
        component={motion.div}
        style={{
          scaleX: prefersReduced ? 0 : scrollYProgress,
          transformOrigin: "0% 50%",
        }}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: theme.palette.primary.main,
          zIndex: (t) => t.zIndex.appBar + 2,
        }}
      />

      <AppBar
        elevation={0}
        component={motion.header}
        animate={{
          y: hidden ? -96 : 0,
          opacity: hidden ? 0.96 : 1,
          boxShadow: solid
            ? theme.palette.mode === "dark"
              ? "0 4px 20px rgba(0,0,0,.45)"
              : "0 4px 20px rgba(0,0,0,.08)"
            : "none",
        }}
        sx={{
          position: "sticky",
          zIndex: (t) => t.zIndex.appBar + 1,
          margin: 0,
          padding: 0,
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
          backdropFilter: "blur(6px)",
        }}
      >
        <Container disableGutters>
          <Toolbar sx={{ minHeight: 72 }}>
            {/* يمين RTL: البراند */}
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              {brand}
            </Box>

            {/* روابط الديسكتوب */}
            {!isDownMd && (
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
              >
                {/* روابط أساسية مصغّرة */}
                {[
                  { path: "/", label: "الرئيسية" },
                  { path: "/contact", label: "تواصل" },
                ].map((item) => {
                  const isActive = isActivePath(item.path);
                  return (
                    <Button
                      key={item.path}
                      size="small"
                      onClick={() => handleNavigate(item.path)}
                      aria-current={isActive ? "page" : undefined}
                      sx={{
                        mx: 0.25,
                        px: 1,
                        fontSize: 13,
                        color: COLORS.white,
                        position: "relative",
                        "&:hover": { color: COLORS.blue },
                      }}
                    >
                      <Box
                        component={motion.span}
                        whileHover={prefersReduced ? undefined : { y: -1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 18,
                        }}
                      >
                        {item.label}
                      </Box>
                      <Box
                        component={motion.span}
                        layoutId={`underline-active`}
                        animate={{ width: isActive ? "100%" : 0 }}
                        transition={{ duration: 0.25 }}
                        sx={{
                          position: "absolute",
                          bottom: -6,
                          right: 0,
                          height: 2,
                          bgcolor: COLORS.white,
                          borderRadius: 1,
                          width: 0,
                        }}
                      />
                    </Button>
                  );
                })}

                {/* مجموعات متداخلة */}
                {NAV_GROUPS.map((group) => (
                  <Box key={group.label}>
                    <Button
                      size="small"
                      onClick={(e) => handleOpenGroup(e, group.label)}
                      sx={{
                        mx: 0.25,
                        px: 1,
                        minWidth: 0,
                        fontSize: 13,
                        fontWeight: 700,
                        color: COLORS.white,
                        "&:hover": { color: COLORS.blue },
                      }}
                    >
                      {group.label}
                    </Button>
                    <Menu
                      anchorEl={menuAnchor}
                      open={Boolean(menuAnchor) && openGroup === group.label}
                      onClose={handleCloseGroup}
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                      {group.items.map((sub) => (
                        <MenuItem
                          key={sub.path}
                          onClick={() => {
                            handleCloseGroup();
                            handleNavigate(sub.path);
                          }}
                        >
                          {sub.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                ))}

                {LINKS?.phone && (
                  <Tooltip title="اتصال">
                    <IconButton
                      component="a"
                      href={`tel:${String(LINKS.phone).replace(/\s/g, "")}`}
                      sx={{ ml: 0.5, color: COLORS.white }}
                      aria-label="اتصال"
                    >
                      <PhoneIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {LINKS?.whatsapp && (
                  <Tooltip title="واتساب">
                    <IconButton
                      component="a"
                      href={LINKS.whatsapp}
                      target="_blank"
                      rel="noopener"
                      aria-label="واتساب"
                      sx={{ color: COLORS.white }}
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            )}

            {/* زر القائمة للجوال */}
            {isDownMd && (
              <IconButton
                edge="end"
                onClick={() => setOpen(true)}
                aria-label="فتح القائمة"
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* قائمة الجوال */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: "86vw",
            maxWidth: 360,
            background: `linear-gradient(180deg, ${alpha(
              glassBg,
              0.98
            )} 0%, ${alpha(glassBg, 0.9)} 100%)`,
            backdropFilter: "blur(14px)",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {brand}
          <IconButton aria-label="إغلاق" onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ py: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <ListItemButton
                key={item.path}
                selected={isActive}
                onClick={() => {
                  setOpen(false);
                  handleNavigate(item.path);
                }}
              >
                <ListItemText
                  primaryTypographyProps={{
                    sx: { fontWeight: isActive ? 900 : 700, fontSize: 16 },
                  }}
                  primary={item.label}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ p: 2, pt: 0, display: "grid", gap: 1 }}>
          <Button
            startIcon={<DownloadIcon />}
            fullWidth
            size="large"
            variant="contained"
            onClick={() => {
              setOpen(false);
              // يمكنك إضافة رابط التحميل هنا إذا كان متاحًا
              window.open("https://play.google.com/store", "_blank");
            }}
            component={motion.div}
            whileHover={prefersReduced ? undefined : { scale: 1.02 }}
            whileTap={prefersReduced ? undefined : { scale: 0.98 }}
            sx={{ fontWeight: 900, borderRadius: 2 }}
          >
            تحميل التطبيق
          </Button>

          <Stack direction="row" spacing={1}>
            {LINKS?.phone && (
              <Button
                startIcon={<PhoneIcon />}
                variant="outlined"
                fullWidth
                href={`tel:${String(LINKS.phone).replace(/\s/g, "")}`}
              >
                اتصال
              </Button>
            )}
            {LINKS?.whatsapp && (
              <Button
                startIcon={<WhatsAppIcon />}
                variant="outlined"
                fullWidth
                component="a"
                href={LINKS.whatsapp}
                target="_blank"
                rel="noopener"
              >
                واتساب
              </Button>
            )}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
