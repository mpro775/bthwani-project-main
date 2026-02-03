// src/components/admin/Sidebar.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Box,
  Typography,
  useTheme,
  styled,
  Collapse,
  IconButton,
  useMediaQuery,
  Drawer,
  Toolbar,
  AppBar,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandLess,
  ExpandMore,
  Category as CategoriesIcon,
  LocalOffer as LocalOfferIcon,
  Store as DeliveryStoreIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  ShoppingCart as ShoppingCartIcon,
  ReceiptLong as ReceiptLongIcon,
  Storefront as StorefrontIcon,
  Support as SupportIcon,
  Business as OperationsIcon,
  Inbox as InboxIcon,
  Dashboard as DashboardIcon,
  // List as ListIcon,
  Campaign as CampaignIcon,
  GroupAdd as GroupAddIcon,
  PendingActions as PendingActionsIcon,
  Insights as InsightsIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,

} from "@mui/icons-material";
import SportsMotorsportsIcon from "@mui/icons-material/SportsMotorsports";
const drawerWidth = 350;

const SidebarContainer = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: drawerWidth,

  height: "100vh",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(3, 0),
  overflowY: "auto",
  borderRight: `1px solid ${theme.palette.divider}`,

  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
    width: "100%",
    height: "auto",
    minHeight: "100vh",
  },
}));

// عنصر الرابط مع دعم الوصول
const NavItem = styled(NavLink)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.shape.borderRadius,
  textDecoration: "none",
  color: theme.palette.text.primary,
  transition: "all 0.3s",
  margin: theme.spacing(0, 1.5),
  textAlign: "left",

  justifyContent: "flex-start",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
  },
  "&:focus": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: "2px",
  },
  "&.active": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
    boxShadow: theme.shadows[2],
  },
  "& svg": {
    color: "inherit",
  },
}));

// عنوان القسم القابل للطي مع دعم الوصول
const SectionTitle = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0, 1.5),
  cursor: "pointer",
  transition: "all 0.3s",
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
  },
  "&:focus": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: "2px",
  },
  "& svg": {
    color: "inherit",
  },
}));

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

type SidebarSection = {
  label: string;
  icon: React.ReactNode;
  to?: string;
  children?: SidebarSection[];
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openSection, setOpenSection] = useState<string | null>(null);

  // لدعم فتح أكثر من مستوى
  const [openNested, setOpenNested] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (label: string) =>
    setOpenSection((prev) => (prev === label ? null : label));

  const toggleNested = (label: string) =>
    setOpenNested((prev) => ({ ...prev, [label]: !prev[label] }));

  // === أدوات مساعدة صغيرة لتقليل التكرار ===
  const link = (
    to: string,
    label: string,
    icon: React.ReactNode
  ): SidebarSection => ({
    to,
    label,
    icon,
  });
  const group = (
    label: string,
    icon: React.ReactNode,
    children: SidebarSection[]
  ): SidebarSection => ({
    label,
    icon,
    children,
  });

  // === إعادة التقسيم حسب الإدارات الرئيسية المطلوبة ===
  const sections: SidebarSection[] = [
    // ==================== DASHBOARD ====================
    // group(" لوحة التحكم", <DashboardIcon />, [
    //   link("/admin/dashboard", "الرئيسية", <DashboardIcon />),
    //   link("/admin/reports", "التقارير والإحصائيات", <AssessmentIcon />),
    //   link("/admin/reports/dashboard", "لوحة التقارير", <AssessmentIcon />),
    // ]),

    // ==================== ADMIN OVERVIEW ====================
    group(" لوحة الإدارة العامة", <DashboardIcon />, [
      link("/admin/overview", "لوحة الإدارة العامة", <DashboardIcon />),
      link("/admin/analytics", "التحليلات", <InsightsIcon />),
      link("/admin/analytics/roas", "ROAS", <InsightsIcon />),
      link("/admin/analytics/kpis", "KPIs", <AssessmentIcon />),
      link("/admin/analytics/advanced", "تحليلات متقدمة", <InsightsIcon />),
      link("/admin/analytics/funnel", "مسار التحويل", <InsightsIcon />),
      link("/admin/analytics/users", "تحليلات المستخدمين", <UsersIcon />),
      link("/admin/analytics/revenue", "الإيرادات", <TrendingUpIcon />),
    ]),

    // ==================== ADMIN MANAGEMENT ====================
    group(" إدارة المشرفين", <GroupAddIcon />, [
      link("/admin/admins", "قائمة المشرفين", <GroupAddIcon />),
    ]),

    // ==================== DELIVERY SYSTEM ====================
    group(" نظام التوصيل", <DeliveryStoreIcon />, [
      group("إدارة المتاجر", <DeliveryStoreIcon />, [
        link("/admin/stores", "جميع المتاجر", <DeliveryStoreIcon />),
        link("/admin/stores/moderation", "مراجعة المتاجر", <PendingActionsIcon />),
        link("/admin/categories", "التصنيفات", <CategoriesIcon />),
      ]),
      group("إدارة الطلبات", <ReceiptLongIcon />, [
        link("/admin/orders", "الطلبات النشطة", <ReceiptLongIcon />),
        link("/admin/carts", "سلات التسوق", <ShoppingCartIcon />),
      ]),
      group("العروض والتسعير", <LocalOfferIcon />, [
        link("/admin/offers", "إدارة العروض", <LocalOfferIcon />),
        link("/admin/banners", "البانرات", <LocalOfferIcon />),
        link("/admin/settings/pricing", "إعدادات التسعير", <SettingsIcon />),
      ]),
      group("الخدمات الإضافية", <LocalOfferIcon />, [
        link("/admin/utility/gas", "خدمة الغاز", <LocalOfferIcon />),
        link("/admin/utility/water", "خدمة الماء", <LocalOfferIcon />),
      ]),
    ]),

    // ==================== DRIVER MANAGEMENT ====================
    group(" إدارة شؤون الكباتن", <SportsMotorsportsIcon />, [
      link("/admin/drivers", "قائمة الكباتن", <SportsMotorsportsIcon />),
      group("إدارة الكباتن", <SportsMotorsportsIcon />, [
        link("/admin/drivers/attendance", "الحضور والانصراف", <SportsMotorsportsIcon />),
        link("/admin/drivers/shifts", "إدارة الورديات", <SportsMotorsportsIcon />),
        link("/admin/drivers/assets", "إدارة الأصول", <SportsMotorsportsIcon />),
        link("/admin/drivers/ratings", "التقييمات والمراجعات", <SportsMotorsportsIcon />),
        link("/admin/drivers/leave-requests", "طلبات الإجازات", <SportsMotorsportsIcon />),
      ]),
      group("العمليات", <OperationsIcon />, [
        link("/admin/ops/drivers", "لوحة الكباتن", <DashboardIcon />),
        link("/admin/ops/drivers/list", "قائمة الكباتن", <SportsMotorsportsIcon />),
        link("/admin/ops/drivers/ops", "العمليات اليومية", <OperationsIcon />),
      ]),
    ]),

    // ==================== VENDOR MANAGEMENT ====================
    group(" إدارة الشركاء", <StorefrontIcon />, [
      link("/admin/vendors", "قائمة الشركاء", <StorefrontIcon />),
      link("/admin/vendors/create", "إضافة شريك جديد", <GroupAddIcon />),
      link("/admin/vendors/moderation", "مراجعة الشركاء", <PendingActionsIcon />),
      link("/admin/vendors/performance", "أداء الشركاء", <AssessmentIcon />),
    ]),

    // ==================== MARKETING ====================
    group(" التسويق والإعلان", <CampaignIcon />, [
      link("/admin/marketing/coupons", "إدارة الكوبونات", <LocalOfferIcon />),
      link("/admin/marketing/campaigns", "لوحة الحملات", <CampaignIcon />),
      group("التسويق الميداني", <CampaignIcon />, [
        link("/admin/marketing/marketers", "إدارة المسوقين", <GroupAddIcon />),
        link("/admin/ops/activations", "طلبات التفعيل", <PendingActionsIcon />),
        link("/admin/reports/marketers", "تقارير المسوقين", <InsightsIcon />),
        link("/admin/commission/plans", "خطط العمولات", <ReceiptLongIcon />),
        link("/admin/commission/settings", "إعدادات العمولات", <SettingsIcon />),
      ]),
    ]),

    // ==================== GROCERIES ====================
    group(" نظام المقاضي", <ShoppingCartIcon />, [
      link("/admin/groceries/categories", "تصنيفات المقاضي", <CategoriesIcon />),
      link("/admin/groceries/attributes", "سمات المقاضي", <LocalOfferIcon />),
      link("/admin/groceries/catalog", "المنتجات المركزية", <ShoppingCartIcon />),
      link("/admin/groceries/merchant-products", "منتجات الشركاء", <StorefrontIcon />),
    ]),

    // ==================== USER MANAGEMENT ====================
    group(" إدارة المستخدمين", <UsersIcon />, [
      link("/admin/users", "جميع المستخدمين", <UsersIcon />),
      link("/admin/users/list", "قائمة المستخدمين", <UsersIcon />),
      link("/admin/users/stats", "إحصائيات المستخدمين", <AssessmentIcon />),
    ]),

    // ==================== HR SYSTEM ====================
    group(" الموارد البشرية", <UsersIcon />, [
      link("/admin/er", "لوحة الموارد البشرية", <DashboardIcon />),
      group("إدارة الموظفين", <UsersIcon />, [
        link("/admin/hr/employees", "قائمة الموظفين", <UsersIcon />),
        link("/admin/hr/attendance", "الحضور والانصراف", <UsersIcon />),
        link("/admin/hr/payroll", "المرتبات والرواتب", <ReceiptLongIcon />),
        link("/admin/hr/assets", "أصول الموظفين", <UsersIcon />),
      ]),
    ]),

    // ==================== FINANCE SYSTEM ====================
    group(" النظام المالي", <ReceiptLongIcon />, [
      link("/admin/finance", "لوحة النظام المالي", <DashboardIcon />),
      link("/admin/finance/new", "لوحة مالية (جديدة)", <DashboardIcon />),
      link("/admin/finance/ledger", "شجرة الحسابات", <ReceiptLongIcon />),
      link("/admin/finance/accounts", "دفتر الأستاذ العام", <ReceiptLongIcon />),
      link("/admin/finance/reports", "التقارير المالية", <AssessmentIcon />),
      link("/admin/finance/payouts", "دفعات", <ReceiptLongIcon />),
      link("/admin/finance/reconciliations", "تسويات", <ReceiptLongIcon />),
      link("/admin/finance/payouts-management", "إدارة الدفعات", <ReceiptLongIcon />),
      group("المحاسبة المتقدمة", <ReceiptLongIcon />, [
        link("/admin/finance/employees", "محاسبة الموظفين", <UsersIcon />),
        link("/admin/finance/attendance", "حضور الموظفين", <UsersIcon />),
        link("/admin/finance/payroll", "مرتبات الموظفين", <ReceiptLongIcon />),
        link("/admin/finance/assets", "أصول الشركة", <ReceiptLongIcon />),
        link("/admin/finance/vouchers", "القيود المحاسبية", <ReceiptLongIcon />),
      ]),
    ]),

    // ==================== WALLET SYSTEM ====================
    group(" نظام المحفظة", <ReceiptLongIcon />, [
      link("/admin/wallet", "نظرة عامة", <ReceiptLongIcon />),
      link("/admin/wallet/stats", "لوحة الإحصائيات", <TrendingUpIcon />),
      link("/admin/wallet/management", "إدارة الأرصدة", <ReceiptLongIcon />),
      link("/admin/wallet/withdrawals", "إدارة طلبات السحب", <ReceiptLongIcon />),
      link("/admin/wallet/escrow", "إدارة الحجز", <ReceiptLongIcon />),
      link("/admin/wallet/transactions", "تتبع المعاملات", <AssessmentIcon />),
      link("/admin/wallet/transactions-tracking", "تتبع المعاملات (إضافي)", <AssessmentIcon />),
      link("/admin/wallet/subscriptions", "إدارة الاشتراكات", <ReceiptLongIcon />),
      link("/admin/wallet/settlements", "التسويات المالية", <ReceiptLongIcon />),
      link("/admin/wallet/coupons", "إدارة الكوبونات", <LocalOfferIcon />),
    ]),

    // ==================== QUALITY & REVIEWS ====================
    group(" الجودة والتقييمات", <AssessmentIcon />, [
      link("/admin/quality/reviews", "تقييمات العملاء", <AssessmentIcon />),
      link("/admin/assets", "إدارة الأصول", <ReceiptLongIcon />),
      link("/admin/documents", "إدارة المستندات", <ReceiptLongIcon />),
    ]),

    // ==================== SUPPORT SYSTEM ====================
    group(" خدمة العملاء", <SupportIcon />, [
      link("/admin/support/dashboard", "لوحة الدعم", <DashboardIcon />),
      link("/admin/support/inbox", "صندوق الوارد", <InboxIcon />),
      link("/admin/support/tickets", "قائمة التذاكر", <SupportIcon />),
      link("/admin/support/reports", "تقارير الدعم", <AssessmentIcon />),
    ]),

  
    // ==================== CMS SYSTEM ====================
    group(" نظام إدارة المحتوى", <SettingsIcon />, [
      link("/admin/content", "لوحة المحتوى", <DashboardIcon />),
      link("/admin/cms/onboarding", "تسجيل المستخدمين الجدد", <SettingsIcon />),
      link("/admin/content/cms-pages", "إدارة الصفحات", <SettingsIcon />),
      link("/admin/content/banners", "البانرات", <LocalOfferIcon />),
      link("/admin/content/app-settings", "إعدادات التطبيق", <SettingsIcon />),
      link("/admin/content/faqs", "الأسئلة الشائعة", <SettingsIcon />),
      link("/admin/cms/strings", "نصوص متعددة اللغات", <SettingsIcon />),
      link("/admin/cms/home-layout", "تخطيط الصفحة الرئيسية", <SettingsIcon />),
      link("/admin/settings/appearance", "إعدادات المظهر", <SettingsIcon />),
    ]),

    // ==================== REPORTS & STATS ====================
    group(" التقارير والإحصائيات", <AssessmentIcon />, [
      link("/admin/reports", "التقارير", <AssessmentIcon />),
      link("/admin/reports/dashboard", "لوحة التقارير", <DashboardIcon />),
      link("/admin/reports/merchants", "تقارير الشركاء", <StorefrontIcon />),
      link("/admin/reports/unified", "التقارير الموحدة", <AssessmentIcon />),
    ]),

    // ==================== SYSTEM & LEGAL ====================
    group(" النظام والصحة القانونية", <SettingsIcon />, [
      link("/admin/system/health", "صحة النظام", <AssessmentIcon />),
      link("/admin/system/metrics", "مقاييس النظام", <AssessmentIcon />),
      link("/admin/system/audit-log", "سجل التدقيق", <ReceiptLongIcon />),
      link("/admin/legal", "النظام القانوني", <ReceiptLongIcon />),
    ]),

    // ==================== PARTNERS ====================
    group(" الشركاء (Partners)", <StorefrontIcon />, [
      link("/admin/partners", "الشركاء", <StorefrontIcon />),
    ]),

    // ==================== PAYMENTS & ERAND SERVICES ====================
    group(" المدفوعات وخدمات الإرسال", <ReceiptLongIcon />, [
      link("/admin/payments", "المدفوعات", <ReceiptLongIcon />),
      link("/admin/akhdimni", "أخضمني", <ReceiptLongIcon />),
      link("/admin/amani", "أماني", <ReceiptLongIcon />),
      link("/admin/amani/pricing", "إدارة أسعار أماني", <ReceiptLongIcon />),
      link("/admin/arabon", "أربون", <ReceiptLongIcon />),
      link("/admin/es3afni", "اسعفني", <ReceiptLongIcon />),
      link("/admin/kawader", "كوادر", <ReceiptLongIcon />),
      link("/admin/kenz", "كينز", <ReceiptLongIcon />),
      link("/admin/maarouf", "معروف", <ReceiptLongIcon />),
      link("/admin/sanad", "سند", <ReceiptLongIcon />),
    ]),

    // ==================== ONBOARDING & TOOLS ====================
    group(" التسجيل والأدوات", <PendingActionsIcon />, [
      link("/admin/field/onboarding", "طلبات التسجيل", <PendingActionsIcon />),
      link("/admin/field/onboarding-list", "قائمة طلبات التسجيل", <PendingActionsIcon />),
      link("/admin/test/api", "اختبار API", <SettingsIcon />),
      link("/admin/test-otp", "اختبار OTP", <InboxIcon />),
    ]),

    // ==================== NOTIFICATIONS ====================
    group(" الإشعارات والتنبيهات", <InboxIcon />, [
      link("/admin/notifications/inbox", "مركز الإشعارات", <InboxIcon />),
    ]),
  ];

  // دالة عرض متداخلة لأي مستوى
  const renderSection = (sec: SidebarSection, level = 0) => {
    if (sec.children) {
      const isOpen = openSection === sec.label || openNested[sec.label];
      return (
        <Box key={sec.label} sx={{ mb: 1 }}>
          <SectionTitle
            onClick={() =>
              level === 0 ? toggleSection(sec.label) : toggleNested(sec.label)
            }
            sx={{ pl: level * 2 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {sec.icon}
              <Typography>{sec.label}</Typography>
            </Box>
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </SectionTitle>
          <Collapse in={isOpen}>
            <Box sx={{ pl: 6 }}>
              {sec.children.map((child) => renderSection(child, level + 1))}
            </Box>
          </Collapse>
        </Box>
      );
    }
    return (
      <NavItem key={sec.to} to={sec.to!} sx={{ pl: level * 2 }}>
        {sec.icon}
        <Typography>{sec.label}</Typography>
      </NavItem>
    );
  };

  const drawerContent = (
    <SidebarContainer>
      {isMobile && (
        <Box sx={{ px: 2, pb: 2, textAlign: "left" }}>
          <IconButton
            onClick={onClose}
            sx={{ color: theme.palette.text.primary }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      <Box sx={{ px: 3, mb: 4, display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            bgcolor: theme.palette.primary.main,
            borderRadius: "50%",
            boxShadow: `0 0 8px ${theme.palette.primary.main}`,
          }}
        />
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          لوحة التحكم
        </Typography>
      </Box>

      <Box component="nav" sx={{ flex: 1 }}>
        {sections.map((sec) => renderSection(sec))}
      </Box>

      <Divider sx={{ borderColor: theme.palette.divider }} />
      <Box sx={{ px: 3, pt: 2 }}>
        <Typography
          variant="caption"
          textAlign="center"
          display="block"
          color="text.secondary"
        >
          الإصدار 2.1.0
        </Typography>
      </Box>
    </SidebarContainer>
  );

  return (
    <>
      {/* AppBar مصاحب لإخفاء درج الهواتف */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mr: { md: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          boxShadow: `0 1px 3px ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onClose}
            sx={{
              mr: 2,
              display: { md: "none" },
              color: theme.palette.text.primary,
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          />
        </Toolbar>
      </AppBar>

      {/* درج التصفح */}
      <Box component="nav">
        {/* درج الهواتف */}
        <Drawer
          variant="temporary"
          anchor="left"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* درج الدائمة للشاشات الكبيرة */}
        <Drawer
          variant="permanent"
          anchor="left"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
    </>
  );
}
