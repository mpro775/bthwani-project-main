import React, { Suspense } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ==================== CORE & AUTH ====================
import AdminLayout from "./layouts/AdminLayout";
import AdminLogin from "./pages/auth/AdminLogin";
import RequireAdminAuth from "./components/RequireAdminAuth";
import HomeDashboard from "./pages/admin/HomeDashboard";
import ErrorPage from "./pages/errors/ErrorPage";

// ==================== DASHBOARD & MAIN ====================
import LandingPage from "./pages/LandingPage";
import ForMerchantsPage from "./landing/pages/ForMerchantsPage";
import BecomeCaptainPage from "./landing/pages/BecomeCaptainPage";
import SupportPage from "./landing/pages/SupportPage";
import AboutPage from "./landing/pages/AboutPage";
import ContactPage from "./landing/pages/ContactPage";
import PrivacyPage from "./landing/pages/PrivacyPage";
import TermsPage from "./landing/pages/TermsPage";
import MerchantTermsPage from "./landing/pages/MerchantTermsPage";
import SafetyPage from "./landing/pages/SafetyPage";
import DeleteAccountPage from "./landing/pages/delete-account";

// ==================== DELIVERY SYSTEM ====================
import DeliveryStoresPage from "./pages/delivery/DeliveryStoresPage";
import DeliveryCategoriesPage from "./pages/delivery/DeliveryCategoriesPage";
import DeliveryBannersPage from "./pages/delivery/DeliveryBannersPage";
import DeliveryCartsPage from "./pages/delivery/DeliveryCartsPage";
import DeliveryStoreDetailsPage from "./pages/delivery/DeliveryStoreDetailsPage";
import DeliveryPromotionsPage from "./pages/delivery/DeliveryPromotionsPage";
import AdminGasPricingPage from "./pages/delivery/AdminGasPricingPage";
import AdminWaterPricingPage from "./pages/delivery/AdminWaterPricingPage";
import AdminDeliveryOrdersPage from "./pages/delivery/orders";
import OrderDetailsPage from "./pages/delivery/orders/OrderDetailsPage";
import PricingSettingsPage from "./pages/delivery/PricingStrategiesPage";

// ==================== USER MANAGEMENT ====================
import UserManagement from "./pages/admin/UserManagement";
import UsersListPage from "./pages/admin/UsersListPage";
import UserDetailsPage from "./pages/admin/UserDetailsPage";
import UserStats from "./pages/admin/UserStats";

// ==================== ADMIN MANAGEMENT ====================
import {
  AdminsListPage,
  AdminDetailsRoute,
  AdminCreateRoute,
} from "./pages/admin/admins";

// ==================== DRIVER MANAGEMENT ====================
import AdminDriversPage from "./pages/admin/AdminDriversPage";
import AdminDriverDetailsPage from "./pages/admin/AdminDriverDetailsPage";
import DriverAttendancePage from "./pages/admin/DriverAttendancePage";
import DriverShiftsPage from "./pages/admin/DriverShiftsPage";
import DriverAssetsPage from "./pages/admin/DriverAssetsPage";
import DriverRatingsPage from "./pages/admin/DriverRatingsPage";
import DriverLeaveRequestsPage from "./pages/admin/DriverLeaveRequestsPage";

// ==================== OPERATIONS ====================
import OpsDriversDashboard from "./pages/admin/ops/OpsDriversDashboard";
import DriversDashboard from "./pages/drivers/Dashboard";
import DriversList from "./pages/drivers/DriversList";
import DriverDetails from "./pages/drivers/DriverDetails";

// ==================== VENDOR MANAGEMENT ====================
import AdminVendorCreatePage from "./pages/admin/AdminVendorCreatePage";
import {
  VendorProfilePage,
  VendorsListPage,
} from "./pages/admin/vendors/VendorsManagement";
import VendorsModerationPage from "./pages/admin/vendors/VendorsModerationPage";
import VendorPerformanceTrackingPage from "./pages/admin/VendorPerformanceTrackingPage";
import StoresModerationPage from "./pages/admin/stores/StoresModerationPage";

// ==================== MARKETING ====================
import AdminWalletPage from "./pages/admin/marketing/AdminWalletPage";
import AdminCouponsPage from "./pages/admin/marketing/AdminCouponsPage";
import MarketersPage from "./pages/admin/marketers/MarketersPage";
import CommissionPlansPage from "./pages/admin/commission/CommissionPlansPage";
import MarketersOverviewPage from "./pages/admin/reports/MarketersOverviewPage";
import MarketerReportPage from "./pages/admin/reports/MarketerReportPage";

// ==================== ONBOARDING ====================
import OnboardingQueuePage from "./pages/admin/onboarding/OnboardingQueuePage";
import PendingActivationsPage from "./pages/admin/onboarding/PendingActivationsPage";

// ==================== GROCERIES ====================
import GroceriesCategoriesPage from "./pages/admin/groceries/CategoriesPage";
import GroceriesAttributesPage from "./pages/admin/groceries/AttributesPage";
import GroceriesCatalogPage from "./pages/admin/groceries/CatalogPage";
import GroceriesMerchantProductsPage from "./pages/admin/groceries/MerchantProductsPage";

// ==================== FINANCE SYSTEM ====================
import ChartAccounts from "./pages/money/ChartAccounts";
import GeneralLedger from "./pages/money/GeneralLedger";
import ReportsPage from "./pages/money/ReportsPage";
import JournalVoucherPage from "./pages/money/JournalVoucherPage";

// ==================== NEW ADMIN PAGES ====================
import FinanceDashboard from "./pages/admin/finance/FinanceDashboard";
import AnalyticsDashboard from "./pages/admin/analytics/AnalyticsDashboard";
import ApiTestPage from "./pages/admin/test/ApiTestPage";

// ==================== ANALYTICS SYSTEM ====================
import ROASDashboard from "./pages/admin/analytics/ROASDashboard";
import KPIDashboard from "./pages/admin/analytics/KPIDashboard";
import AdvancedAnalytics from "./pages/admin/analytics/AdvancedAnalytics";
import FunnelDashboard from "./pages/admin/analytics/FunnelDashboard";
import UsersDashboard from "./pages/admin/analytics/UsersDashboard";
import RevenueDashboard from "./pages/admin/analytics/RevenueDashboard";

// ==================== CONTENT MANAGEMENT ====================
import ContentDashboard from "./pages/admin/content/ContentDashboard";
import BannersManager from "./pages/admin/content/BannersManager";
import CMSPagesManager from "./pages/admin/content/CMSPagesManager";
import AppSettingsManager from "./pages/admin/content/AppSettingsManager";
import FAQsManager from "./pages/admin/content/FAQsManager";

// ==================== ER/HR SYSTEM ====================
import ERDashboard from "./pages/admin/er/ERDashboard";

// ==================== FINANCE SYSTEM - NEW ====================
import FinanceDashboardNew from "./pages/admin/finance/FinanceDashboardNew";
import PayoutBatchesPage from "./pages/admin/finance/PayoutBatchesPage";
import SettlementsPage from "./pages/admin/finance/SettlementsPage";
import CouponsPage from "./pages/admin/finance/CouponsPage";
import ReconciliationsPage from "./pages/admin/finance/ReconciliationsPage";

// ==================== HEALTH & LEGAL & METRICS & SUPPORT ====================
import HealthMonitorPage from "./pages/admin/system/HealthMonitorPage";
import LegalDashboard from "./pages/admin/legal/LegalDashboard";
import MetricsPage from "./pages/admin/system/MetricsPage";
import SupportDashboard from "./pages/admin/support/SupportDashboard";

// ==================== HR SYSTEM ====================
import EmployeesPage from "./pages/admin/er/EmployeesPage";
import AttendancePage from "./pages/admin/er/AttendancePage";
import PayrollPage from "./pages/admin/er/PayrollPage";
import AssetsPage from "./pages/admin/er/AssetsPage";

// ==================== SUPPORT SYSTEM ====================
import Inbox from "./pages/support/Inbox";
import TicketView from "./pages/support/TicketView";
import Reports from "./pages/support/Reports";

// ==================== WALLET SYSTEM ====================
import WalletManagementPage from "./pages/admin/WalletManagementPage";
import WithdrawalManagementPage from "./pages/admin/wallet/WithdrawalManagementPage";
import EscrowManagementPage from "./pages/admin/wallet/EscrowManagementPage";
import WalletStatsDashboard from "./pages/admin/wallet/WalletStatsDashboard";
import TransactionsPage from "./pages/admin/wallet/TransactionsPage";
import SubscriptionsManagementPage from "./pages/admin/SubscriptionsManagementPage";
import SettlementsManagementPage from "./pages/admin/SettlementsManagementPage";
import CouponsManagementPage from "./pages/admin/CouponsManagementPage";

// ==================== QUALITY & REVIEWS ====================
import QualityReviewsPage from "./pages/admin/quality/QualityReviewsPage";

// ==================== PARTNERS ====================
import PartnersList from "./pages/parteners/PartnersList";
import PartnerDetails from "./pages/parteners/PartnerDetails";

// ==================== DOCUMENTS & ASSETS ====================
import DocumentsManagementPage from "./pages/admin/DocumentsManagementPage";
import ReportsDashboardPage from "./pages/admin/ReportsDashboardPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";

// ==================== NOTIFICATIONS ====================
import { NotificationsListPage } from "./pages/admin/notifications/NotificationsCenter";
import TestOtpPage from "./pages/admin/TestOtpPage";

// ==================== AKHDIMNI ====================
import ErrandsListPage from "./pages/akhdimni/ErrandsListPage";
import ErrandDetailsPage from "./pages/akhdimni/ErrandDetailsPage";

// ==================== AMANI ====================
import AmaniListPage from "./pages/admin/amani/AmaniListPage";
import AmaniDetailsPage from "./pages/admin/amani/AmaniDetailsPage";

// ==================== ARABON ====================
import ArabonListPage from "./pages/admin/arabon/ArabonListPage";
import ArabonDetailsPage from "./pages/admin/arabon/ArabonDetailsPage";

// ==================== ES3AFNI ====================
import Es3afniListPage from "./pages/admin/es3afni/Es3afniListPage";
import Es3afniDetailsPage from "./pages/admin/es3afni/Es3afniDetailsPage";

// ==================== KAWADER ====================
import KawaderListPage from "./pages/admin/kawader/KawaderListPage";
import KawaderDetailsPage from "./pages/admin/kawader/KawaderDetailsPage";

// ==================== KENZ ====================
import KenzListPage from "./pages/admin/kenz/KenzListPage";
import KenzDetailsPage from "./pages/admin/kenz/KenzDetailsPage";

// ==================== MAAROUF ====================
import MaaroufListPage from "./pages/admin/maarouf/MaaroufListPage";
import MaaroufDetailsPage from "./pages/admin/maarouf/MaaroufDetailsPage";

// ==================== SANAD ====================
import SanadListPage from "./pages/admin/sanad/SanadListPage";
import SanadDetailsPage from "./pages/admin/sanad/SanadDetailsPage";

// ==================== PAYMENTS ====================
import PaymentsListPage from "./pages/admin/payments/PaymentsListPage";
import PaymentsDetailsPage from "./pages/admin/payments/PaymentsDetailsPage";

// ==================== CMS SYSTEM ====================
const CmsOnboardingPage = React.lazy(() => import("./pages/cms/CmsOnboardingPage"));
const CmsStringsPage = React.lazy(() => import("./pages/cms/CmsStringsPage"));
const HomeLayoutAdminPage = React.lazy(() => import("./pages/cms/CmsHomeLayoutPage"));

// ==================== UTILITIES ====================
import "leaflet/dist/leaflet.css";
import OverviewPage from "./pages/admin/OverviewPage";

// ==================== WRAPPER COMPONENTS ====================
const VendorProfileWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <VendorProfilePage id={id || ""} />;
};

export default function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors except 408 (timeout)
          const status = (error as { status?: number })?.status;
          if (status && status >= 400 && status < 500 && status !== 408) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
      {/* ==================== AUTHENTICATION ==================== */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ==================== PROTECTED ADMIN ROUTES ==================== */}
      <Route
        path="/admin"
        element={
          <RequireAdminAuth>
            <AdminLayout />
          </RequireAdminAuth>
        }
      >
        {/* ==================== DASHBOARD ==================== */}
        <Route index element={<HomeDashboard />} />
        <Route path="dashboard" element={<HomeDashboard />} />

        {/* ==================== DELIVERY SYSTEM ==================== */}
        <Route path="stores" element={<DeliveryStoresPage />} />
        <Route path="stores/moderation" element={<StoresModerationPage />} />
        <Route path="categories" element={<DeliveryCategoriesPage />} />
        <Route path="delivery/stores/:id" element={<DeliveryStoreDetailsPage />} />
        <Route path="orders" element={<AdminDeliveryOrdersPage />} />
        <Route path="orders/details/:id" element={<OrderDetailsPage />} />
        <Route path="carts" element={<DeliveryCartsPage />} />
        <Route path="offers" element={<DeliveryPromotionsPage />} />
        <Route path="banners" element={<DeliveryBannersPage />} />
        <Route path="utility/gas" element={<AdminGasPricingPage />} />
        <Route path="utility/water" element={<AdminWaterPricingPage />} />

        {/* ==================== USER MANAGEMENT ==================== */}
        <Route path="users" element={<UserManagement />} />
        <Route path="users/list" element={<UsersListPage />} />
        <Route path="users/:id" element={<UserDetailsPage />} />
        <Route path="users/stats" element={<UserStats />} />

        {/* ==================== DRIVER MANAGEMENT ==================== */}
        <Route path="drivers" element={<AdminDriversPage />} />
        <Route path="drivers/:id" element={<AdminDriverDetailsPage />} />
        <Route path="drivers/attendance" element={<DriverAttendancePage />} />
        <Route path="drivers/shifts" element={<DriverShiftsPage />} />
        <Route path="drivers/assets" element={<DriverAssetsPage />} />
        <Route path="drivers/ratings" element={<DriverRatingsPage />} />
        <Route path="drivers/leave-requests" element={<DriverLeaveRequestsPage />} />

        {/* ==================== OPERATIONS ==================== */}
        <Route path="ops/drivers" element={<OpsDriversDashboard />} />
        <Route path="ops/drivers/ops" element={<DriversDashboard />} />
        <Route path="ops/drivers/list" element={<DriversList />} />
        <Route path="ops/drivers/:id" element={<DriverDetails />} />
        <Route path="ops/activations" element={<PendingActivationsPage />} />

        {/* ==================== ADMIN OVERVIEW ==================== */}
        <Route path="overview" element={<OverviewPage />} />

        {/* ==================== ADMIN MANAGEMENT ==================== */}
        <Route path="admins" element={<AdminsListPage />} />
        <Route path="admins/new" element={<AdminCreateRoute />} />
        <Route path="admins/:id" element={<AdminDetailsRoute />} />


        {/* ==================== VENDOR MANAGEMENT ==================== */}
        <Route path="vendors/create" element={<AdminVendorCreatePage />} />
        <Route path="vendors" element={<VendorsListPage />} />
        <Route path="vendors/:id" element={<VendorProfileWrapper />} />
        <Route path="vendors/moderation" element={<VendorsModerationPage />} />
        <Route path="vendors/performance" element={<VendorPerformanceTrackingPage />} />
        <Route path="stores/moderation" element={<StoresModerationPage />} />

        {/* ==================== MARKETING ==================== */}
        <Route path="marketing/marketers" element={<MarketersPage />} />
        <Route path="marketing/coupons" element={<AdminCouponsPage />} />

        {/* ==================== ONBOARDING ==================== */}
        <Route path="field/onboarding" element={<OnboardingQueuePage />} />

        {/* ==================== GROCERIES ==================== */}
        <Route path="groceries/categories" element={<GroceriesCategoriesPage />} />
        <Route path="groceries/attributes" element={<GroceriesAttributesPage />} />
        <Route path="groceries/catalog" element={<GroceriesCatalogPage />} />
        <Route path="groceries/merchant-products" element={<GroceriesMerchantProductsPage />} />

        {/* ==================== FINANCE DASHBOARD ==================== */}
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="finance/new" element={<FinanceDashboardNew />} />
        <Route path="finance/payouts" element={<PayoutBatchesPage />} />
        <Route path="finance/settlements" element={<SettlementsPage />} />
        <Route path="finance/coupons" element={<CouponsPage />} />
        <Route path="finance/reconciliations" element={<ReconciliationsPage />} />

        {/* ==================== ANALYTICS DASHBOARD ==================== */}
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="analytics/roas" element={<ROASDashboard />} />
        <Route path="analytics/kpis" element={<KPIDashboard />} />
        <Route path="analytics/advanced" element={<AdvancedAnalytics />} />
        <Route path="analytics/funnel" element={<FunnelDashboard />} />
        <Route path="analytics/users" element={<UsersDashboard />} />
        <Route path="analytics/revenue" element={<RevenueDashboard />} />

        {/* ==================== CONTENT MANAGEMENT ==================== */}
        <Route path="content" element={<ContentDashboard />} />
        <Route path="content/banners" element={<BannersManager />} />
        <Route path="content/cms-pages" element={<CMSPagesManager />} />
        <Route path="content/app-settings" element={<AppSettingsManager />} />
        <Route path="content/faqs" element={<FAQsManager />} />

        {/* ==================== ER/HR SYSTEM ==================== */}
        <Route path="er" element={<ERDashboard />} />

        {/* ==================== HEALTH MONITORING ==================== */}
        <Route path="system/health" element={<HealthMonitorPage />} />

        {/* ==================== METRICS ==================== */}
        <Route path="system/metrics" element={<MetricsPage />} />

        {/* ==================== LEGAL SYSTEM ==================== */}
        <Route path="legal" element={<LegalDashboard />} />

        {/* ==================== SUPPORT SYSTEM ==================== */}
        <Route path="support/dashboard" element={<SupportDashboard />} />

        {/* ==================== API TESTING ==================== */}
        <Route path="test/api" element={<ApiTestPage />} />

        {/* ==================== DRIVER SUB-PAGES ==================== */}
        <Route path="drivers/attendance" element={<DriverAttendancePage />} />
        <Route path="drivers/shifts" element={<DriverShiftsPage />} />
        <Route path="drivers/assets" element={<DriverAssetsPage />} />
        <Route path="drivers/ratings" element={<DriverRatingsPage />} />
        <Route path="drivers/leave-requests" element={<DriverLeaveRequestsPage />} />

        {/* ==================== FINANCE SYSTEM ==================== */}
        <Route path="finance/ledger" element={<ChartAccounts />} />
        <Route path="finance/employees" element={<EmployeesPage />} />
        <Route path="finance/attendance" element={<AttendancePage />} />
        <Route path="finance/payroll" element={<PayrollPage />} />
        <Route path="finance/assets" element={<AssetsPage />} />
        <Route path="finance/vouchers" element={<JournalVoucherPage />} />
        <Route path="finance/accounts" element={<GeneralLedger />} />
        <Route path="finance/reports" element={<ReportsPage />} />

        {/* ==================== HR SYSTEM ==================== */}
        <Route path="hr/employees" element={<EmployeesPage />} />
        <Route path="hr/attendance" element={<AttendancePage />} />
        <Route path="hr/payroll" element={<PayrollPage />} />
        <Route path="hr/assets" element={<AssetsPage />} />

        {/* ==================== WALLET SYSTEM ==================== */}
        <Route path="wallet" element={<AdminWalletPage />} />
        <Route path="wallet/stats" element={<WalletStatsDashboard />} />
        <Route path="wallet/management" element={<WalletManagementPage />} />
        <Route path="wallet/withdrawals" element={<WithdrawalManagementPage />} />
        <Route path="wallet/escrow" element={<EscrowManagementPage />} />
        <Route path="wallet/transactions" element={<TransactionsPage />} />
        <Route path="wallet/subscriptions" element={<SubscriptionsManagementPage />} />
        <Route path="wallet/settlements" element={<SettlementsManagementPage />} />
        <Route path="wallet/coupons" element={<CouponsManagementPage />} />

        {/* ==================== QUALITY & REVIEWS ==================== */}
        <Route path="quality/reviews" element={<QualityReviewsPage />} />

        {/* ==================== PARTNERS ==================== */}
        <Route path="partners" element={<PartnersList />} />
        <Route path="partners/:store" element={<PartnerDetails />} />

        {/* ==================== SUPPORT SYSTEM ==================== */}
        <Route path="support/inbox" element={<Inbox />} />
        <Route path="support/ticket/:id" element={<TicketView />} />
        <Route path="support/reports" element={<Reports />} />

        {/* ==================== MARKETING - Additional Routes ==================== */}
        <Route path="commission/plans" element={<CommissionPlansPage />} />
        <Route path="reports/marketers" element={<MarketersOverviewPage />} />
        <Route path="reports/marketers/:uid" element={<MarketerReportPage />} />

        {/* ==================== DOCUMENTS & ASSETS ==================== */}
        <Route path="assets" element={<AssetsPage />} />
        <Route path="documents" element={<DocumentsManagementPage />} />

        {/* ==================== REPORTS ==================== */}
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="reports/dashboard" element={<ReportsDashboardPage />} />

        {/* ==================== NOTIFICATIONS ==================== */}
        <Route path="notifications/inbox" element={<NotificationsListPage />} />
        <Route path="test-otp" element={<TestOtpPage />} />

        {/* ==================== SETTINGS ==================== */}
        <Route path="settings/pricing" element={<PricingSettingsPage />} />

        {/* ==================== AKHDIMNI ==================== */}
        <Route path="akhdimni" element={<ErrandsListPage />} />
        <Route path="akhdimni/:id" element={<ErrandDetailsPage />} />

        {/* ==================== AMANI ==================== */}
        <Route path="amani" element={<AmaniListPage />} />
        <Route path="amani/:id" element={<AmaniDetailsPage />} />

        {/* ==================== ARABON ==================== */}
        <Route path="arabon" element={<ArabonListPage />} />
        <Route path="arabon/:id" element={<ArabonDetailsPage />} />

        {/* ==================== ES3AFNI ==================== */}
        <Route path="es3afni" element={<Es3afniListPage />} />
        <Route path="es3afni/:id" element={<Es3afniDetailsPage />} />

        {/* ==================== KAWADER ==================== */}
        <Route path="kawader" element={<KawaderListPage />} />
        <Route path="kawader/:id" element={<KawaderDetailsPage />} />

        {/* ==================== KENZ ==================== */}
        <Route path="kenz" element={<KenzListPage />} />
        <Route path="kenz/:id" element={<KenzDetailsPage />} />

        {/* ==================== MAAROUF ==================== */}
        <Route path="maarouf" element={<MaaroufListPage />} />
        <Route path="maarouf/:id" element={<MaaroufDetailsPage />} />

        {/* ==================== SANAD ==================== */}
        <Route path="sanad" element={<SanadListPage />} />
        <Route path="sanad/:id" element={<SanadDetailsPage />} />

        {/* ==================== PAYMENTS ==================== */}
        <Route path="payments" element={<PaymentsListPage />} />
        <Route path="payments/:id" element={<PaymentsDetailsPage />} />

        {/* ==================== CMS SYSTEM ==================== */}
        <Route path="cms/onboarding" element={
          <Suspense fallback={<div>Loading...</div>}>
            <CmsOnboardingPage />
          </Suspense>
        } />
        <Route path="cms/strings" element={
          <Suspense fallback={<div>Loading...</div>}>
            <CmsStringsPage />
          </Suspense>
        } />
        <Route path="cms/home-layout" element={
          <Suspense fallback={<div>Loading...</div>}>
            <HomeLayoutAdminPage />
          </Suspense>
        } />
      </Route>

      {/* ==================== PUBLIC/LANDING PAGES ==================== */}
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/for-merchants" element={<ForMerchantsPage />} />
      <Route path="/become-captain" element={<BecomeCaptainPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/merchant-terms" element={<MerchantTermsPage />} />
      <Route path="/safety" element={<SafetyPage />} />
      <Route path="/delete-account" element={<DeleteAccountPage />} />

      {/* ==================== ERROR PAGES ==================== */}
      <Route path="/admin/error" element={<ErrorPage />} />

      {/* ==================== CATCH ALL ==================== */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
    </QueryClientProvider>
  );
}
