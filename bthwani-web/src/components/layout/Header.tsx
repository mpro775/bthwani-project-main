import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, User, LogOut, Bell } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import useCartStore from "../../store/cartStore";
import NotificationDropdown from "../NotificationDropdown";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Container,
} from "@mui/material";

const Header: React.FC = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const cartCount = useCartStore((state) => state.getCount());
  const [showNotifications, setShowNotifications] = useState(false);



  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ height: 64 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  fontSize: '1.5rem',
                }}
              >
                بثواني
              </Typography>
            </Link>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            <Button
              component={Link}
              to="/"
              sx={{
                color: 'text.primary',
                '&:hover': { color: 'primary.main' },
                transition: 'color 0.2s',
              }}
            >
              الرئيسية
            </Button>
            <Button
              component={Link}
              to="/stores"
              sx={{
                color: 'text.primary',
                '&:hover': { color: 'primary.main' },
                transition: 'color 0.2s',
              }}
            >
              المتاجر
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  component={Link}
                  to="/orders"
                  sx={{
                    color: 'text.primary',
                    '&:hover': { color: 'primary.main' },
                    transition: 'color 0.2s',
                  }}
                >
                  الطلبات
                </Button>
                <Button
                  component={Link}
                  to="/favorites"
                  sx={{
                    color: 'text.primary',
                    '&:hover': { color: 'primary.main' },
                    transition: 'color 0.2s',
                  }}
                >
                  المفضلة
                </Button>
              </>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           

            {/* Search */}
            <IconButton
              onClick={() => navigate("/search")}
              sx={{
                '&:hover': { backgroundColor: 'grey.100' },
                transition: 'background-color 0.2s',
              }}
            >
              <Search />
            </IconButton>

            {/* Notifications */}
            {isAuthenticated && (
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  onClick={() => setShowNotifications(!showNotifications)}
                  sx={{
                    '&:hover': { backgroundColor: 'grey.100' },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <Bell />
                </IconButton>
                <NotificationDropdown
                  isOpen={showNotifications}
                  onClose={() => setShowNotifications(false)}
                />
              </Box>
            )}

            {/* Cart */}
            <IconButton
              onClick={() => navigate("/cart")}
              sx={{
                position: 'relative',
                '&:hover': { backgroundColor: 'grey.100' },
                transition: 'background-color 0.2s',
              }}
            >
              <ShoppingCart />
              {cartCount > 0 && (
                <Badge
                  badgeContent={cartCount}
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    '& .MuiBadge-badge': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontSize: '0.75rem',
                      minWidth: 20,
                      height: 20,
                    },
                  }}
                />
              )}
            </IconButton>

            {/* User Menu */}
            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={() => navigate("/profile")}
                  sx={{
                    '&:hover': { backgroundColor: 'grey.100' },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <User />
                </IconButton>
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    '&:hover': { backgroundColor: 'grey.100' },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <LogOut />
                </IconButton>
              </Box>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                variant="outlined"
                size="small"
              >
                تسجيل الدخول
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
