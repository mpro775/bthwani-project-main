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
  GridView as ServicesIcon,
  ListAlt as OrdersIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

// مطابق لـ app-user: الخدمات | طلباتي | المفضلة | حسابي
const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { path: "/", icon: <ServicesIcon />, label: t("nav.services") },
    { path: "/orders", icon: <OrdersIcon />, label: t("nav.orders"), auth: true },
    { path: "/favorites", icon: <FavoriteIcon />, label: t("nav.favorites") },
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
