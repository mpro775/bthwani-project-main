import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import useCartStore from './store/cartStore';
import './utils/i18n';

// Layout
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import OTPVerification from './pages/auth/OTPVerification';
import ResetNewPassword from './pages/auth/ResetNewPassword';
import ResetVerify from './pages/auth/ResetVerify';
import Home from './pages/delivery/Home';
import Stores from './pages/delivery/Stores';
import StoreDetails from './pages/delivery/StoreDetails';
import ProductDetails from './pages/delivery/ProductDetails';
import CategoryDetails from './pages/delivery/CategoryDetailsScreen';
import Deals from './pages/delivery/Deals';
import Cart from './pages/cart/Cart';
import Checkout from './pages/checkout/Checkout';
import Payment from './pages/payment/Payment';
import PaymentCallback from './pages/payment/Callback';
import Orders from './pages/orders/Orders';
import OrderDetails from './pages/orders/OrderDetails';
import Favorites from './pages/favorites/Favorites';
import Notifications from './pages/notifications/Notifications';
import Profile from './pages/profile/Profile';
import EditProfile from './pages/profile/EditProfile';
import Addresses from './pages/profile/Addresses';
import AddAddress from './pages/profile/AddAddress';
import EditAddress from './pages/profile/EditAddress';
import Search from './pages/search/Search';
import SelectLocation from './pages/map/SelectLocation';
import Akhdimni from './pages/akhdimni/Akhdimni';
import MyErrandsPage from './pages/orders/MyErrandsPage';
import ErrandDetailsPage from './pages/orders/ErrandDetailsPage';

import UtilityGasScreen from './pages/utility/UtilityGasScreen';
import UtilityWaterScreen from './pages/utility/UtilityWaterScreen';
import ProtectedRoute from './ProtectedRoute';
import GroceryScreen from './pages/delivery/GroceryScreen';
import Maarouf from './pages/maarouf/Maarouf';
import Arabon from './pages/arabon/Arabon';
import Kawader from './pages/kawader/Kawader';
import Kenz from './pages/kenz/Kenz';
import Es3afni from './pages/es3afni/Es3afni';
import Amani from './pages/amani/Amani';
import Sanad from './pages/sanad/Sanad';




// App Layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

// Main App Component
const AppContent: React.FC = () => {
  const initCart = useCartStore(state => state.initCart);

  useEffect(() => {
    initCart();
  }, [initCart]);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-verification" element={<OTPVerification />} />
      <Route path="/reset-password" element={<ResetNewPassword />} />
      <Route path="/reset-verify" element={<ResetVerify />} />

      {/* Main Routes */}
      <Route
        path="/"
        element={
          <AppLayout>
            <Home />
          </AppLayout>
        }
      />

      <Route
        path="/stores"
        element={
          <AppLayout>
            <Stores />
          </AppLayout>
        }
      />

      <Route
        path="/categories"
        element={
          <AppLayout>
            <CategoryDetails />
          </AppLayout>
        }
      />

      <Route
        path="/deals"
        element={
          <AppLayout>
            <Deals />
          </AppLayout>
        }
      />

      {/* Store & Product Routes */}
      <Route
        path="/business/:storeId"
        element={
          <AppLayout>
            <StoreDetails />
          </AppLayout>
        }
      />

      <Route
        path="/product/:productId"
        element={
          <AppLayout>
            <ProductDetails />
          </AppLayout>
        }
      />

      {/* Cart */}
      <Route
        path="/cart"
        element={
          <AppLayout>
            <Cart />
          </AppLayout>
        }
      />

      {/* Checkout */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Checkout />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Payment */}
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Payment />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment/callback"
        element={
          <ProtectedRoute>
            <PaymentCallback />
          </ProtectedRoute>
        }
      />

      {/* Search */}
      <Route
        path="/search"
        element={
          <AppLayout>
            <Search />
          </AppLayout>
        }
      />

      {/* Location Selection */}
      <Route
        path="/select-location"
        element={
          <AppLayout>
            <SelectLocation />
          </AppLayout>
        }
      />

      {/* أخدمني Service */}
      <Route
        path="/akhdimni"
        element={
          <AppLayout>
            <Akhdimni />
          </AppLayout>
        }
      />

      {/* معروف - المفقودات والموجودات */}
      <Route
        path="/maarouf"
        element={
          <AppLayout>
            <Maarouf />
          </AppLayout>
        }
      />
      <Route
        path="/maarouf/new"
        element={
          <AppLayout>
            <Maarouf />
          </AppLayout>
        }
      />
      <Route
        path="/maarouf/:id"
        element={
          <AppLayout>
            <Maarouf />
          </AppLayout>
        }
      />
      <Route
        path="/maarouf/:id/:action"
        element={
          <AppLayout>
            <Maarouf />
          </AppLayout>
        }
      />

      {/* عربون - العروض والحجوزات بعربون */}
      <Route
        path="/arabon"
        element={
          <AppLayout>
            <Arabon />
          </AppLayout>
        }
      />
      <Route
        path="/arabon/new"
        element={
          <AppLayout>
            <Arabon />
          </AppLayout>
        }
      />
      <Route
        path="/arabon/:id"
        element={
          <AppLayout>
            <Arabon />
          </AppLayout>
        }
      />
      <Route
        path="/arabon/:id/:action"
        element={
          <AppLayout>
            <Arabon />
          </AppLayout>
        }
      />

      {/* كوادر - العروض الوظيفية والخدمات المهنية */}
      <Route
        path="/kawader"
        element={
          <AppLayout>
            <Kawader />
          </AppLayout>
        }
      />
      <Route
        path="/kawader/new"
        element={
          <AppLayout>
            <Kawader />
          </AppLayout>
        }
      />
      <Route
        path="/kawader/:id"
        element={
          <AppLayout>
            <Kawader />
          </AppLayout>
        }
      />
      <Route
        path="/kawader/:id/:action"
        element={
          <AppLayout>
            <Kawader />
          </AppLayout>
        }
      />

      {/* كنز - السوق المفتوح */}
      <Route
        path="/kenz"
        element={
          <AppLayout>
            <Kenz />
          </AppLayout>
        }
      />
      <Route
        path="/kenz/new"
        element={
          <AppLayout>
            <Kenz />
          </AppLayout>
        }
      />
      <Route
        path="/kenz/:id"
        element={
          <AppLayout>
            <Kenz />
          </AppLayout>
        }
      />
      <Route
        path="/kenz/:id/:action"
        element={
          <AppLayout>
            <Kenz />
          </AppLayout>
        }
      />

      {/* اسعفني - شبكة تبرع بالدم عاجلة */}
      <Route
        path="/es3afni"
        element={
          <AppLayout>
            <Es3afni />
          </AppLayout>
        }
      />
      <Route
        path="/es3afni/new"
        element={
          <AppLayout>
            <Es3afni />
          </AppLayout>
        }
      />
      <Route
        path="/es3afni/:id"
        element={
          <AppLayout>
            <Es3afni />
          </AppLayout>
        }
      />
      <Route
        path="/es3afni/:id/:action"
        element={
          <AppLayout>
            <Es3afni />
          </AppLayout>
        }
      />

      {/* الأماني - النقل النسائي للعائلات */}
      <Route
        path="/amani"
        element={
          <AppLayout>
            <Amani />
          </AppLayout>
        }
      />
      <Route
        path="/amani/new"
        element={
          <AppLayout>
            <Amani />
          </AppLayout>
        }
      />
      <Route
        path="/amani/:id"
        element={
          <AppLayout>
            <Amani />
          </AppLayout>
        }
      />
      <Route
        path="/amani/:id/:action"
        element={
          <AppLayout>
            <Amani />
          </AppLayout>
        }
      />

      {/* السند - خدمات متخصصة + فزعة + خيري */}
      <Route
        path="/sanad"
        element={
          <AppLayout>
            <Sanad />
          </AppLayout>
        }
      />
      <Route
        path="/sanad/new"
        element={
          <AppLayout>
            <Sanad />
          </AppLayout>
        }
      />
      <Route
        path="/sanad/:id"
        element={
          <AppLayout>
            <Sanad />
          </AppLayout>
        }
      />
      <Route
        path="/sanad/:id/:action"
        element={
          <AppLayout>
            <Sanad />
          </AppLayout>
        }
      />

      {/* My Errands */}
      <Route
        path="/orders/errands"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MyErrandsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/errands/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ErrandDetailsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Gas Service */}
      <Route
        path="/utilities/gas"
        element={
          <AppLayout>
            <UtilityGasScreen />
          </AppLayout>
        }
      />

      {/* Water Service */}
      <Route
        path="/utilities/water"
        element={
          <AppLayout>
            <UtilityWaterScreen />
          </AppLayout>
        }
      />


      {/* Orders (Protected - contains personal order data) */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Orders />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/:orderId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <OrderDetails />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/grocery"
        element={
          <AppLayout>
            <GroceryScreen />
          </AppLayout>
        }
      />

      {/* Favorites (Public - can show login prompt) */}
      <Route
        path="/favorites"
        element={
          <AppLayout>
            <Favorites />
          </AppLayout>
        }
      />

      {/* Notifications (Public - can show login prompt) */}
      <Route
        path="/notifications"
        element={
          <AppLayout>
            <Notifications />
          </AppLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <AppLayout>
            <Profile />
          </AppLayout>
        }
      />

      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <AppLayout>
              <EditProfile />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Address Management Routes */}
      <Route
        path="/profile/addresses"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Addresses />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/addresses/add"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AddAddress />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/addresses/edit/:addressId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <EditAddress />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
