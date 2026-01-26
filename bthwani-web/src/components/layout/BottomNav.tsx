import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import {
  Home as HomeIcon,
  ShoppingBag as ShoppingBagIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalFireDepartment as FireIcon,
  WaterDrop as WaterIcon,
  Search as SearchIcon,
  Payments as PaymentsIcon,
  Work as WorkIcon,
  Store as StoreIcon,
  LocalHospital as HospitalIcon,
  DirectionsCar as CarIcon,
  Support as SupportIcon,
} from "@mui/icons-material";

const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { path: "/", icon: <HomeIcon />, label: t("nav.home") },
    { path: "/orders", icon: <ShoppingBagIcon />, label: t("nav.orders"), auth: true },
    { path: "/grocery", icon: <ShoppingCartIcon />, label: "البقالة", auth: true },
    { path: "/gas", icon: <FireIcon />, label: "الغاز", auth: true },
    { path: "/water", icon: <WaterIcon />, label: "الماء", auth: true },
    { path: "/akhdimni", icon: <InventoryIcon />, label: "أخدمني", auth: true },
    { path: "/maarouf", icon: <SearchIcon />, label: "معروف", auth: true },
    { path: "/arabon", icon: <PaymentsIcon />, label: "عربون", auth: true },
    { path: "/kawader", icon: <WorkIcon />, label: "كوادر", auth: true },
    { path: "/kenz", icon: <StoreIcon />, label: "كنز", auth: true },
    { path: "/es3afni", icon: <HospitalIcon />, label: "اسعفني", auth: true },
    { path: "/amani", icon: <CarIcon />, label: "الأماني", auth: true },
    { path: "/sanad", icon: <SupportIcon />, label: "السند", auth: true },
    { path: "/favorites", icon: <FavoriteIcon />, label: t("nav.favorites"), auth: true },
    { path: "/profile", icon: <PersonIcon />, label: t("nav.profile") },
  ];

  const filteredItems = navItems.filter(
    (item) => !item.auth || isAuthenticated
  );

  const activeItemIndex = filteredItems.findIndex(
    (item) => item.path === location.pathname
  );

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', md: 'none' },
        zIndex: 1000,
        boxShadow: 3,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={activeItemIndex >= 0 ? activeItemIndex : 0}
        sx={{
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            flex: 1,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        {filteredItems.map(({ path, icon, label }) => (
          <BottomNavigationAction
            key={path}
            component={Link}
            to={path}
            icon={icon}
            label={label}
            sx={{
              fontSize: '0.75rem',
              py: 1,
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                mt: 0.5,
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
