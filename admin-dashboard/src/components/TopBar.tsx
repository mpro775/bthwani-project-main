import  { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  useTheme,
  styled,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

type TopBarProps = {
  onToggleDrawer: () => void;
};

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

export default function TopBar({ onToggleDrawer }: TopBarProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          backgroundColor: theme.palette.primary.dark,
          color: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          width: "100%",
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6" noWrap component="div">
              مرحبًا بك،{" "}
              <Box component="span" sx={{ fontWeight: 700 }}>
                أدمن
              </Box>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton size="large" color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton size="large" color="inherit">
              <LanguageIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="حساب المستخدم"
              aria-controls="topbar-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
              sx={{
                "&:focus": {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: "2px",
                },
              }}
            >
              <Avatar sx={{ width: 32, height: 32 }} alt="صورة المستخدم">A</Avatar>
            </IconButton>
            <IconButton
              size="large"
              edge="start"
              onClick={onToggleDrawer}
              sx={{ display: { md: "none" } }}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>

        <Menu
          id="topbar-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          MenuListProps={{ dense: true }}
        >
          <MenuItem onClick={handleMenuClose}>
            <PersonIcon fontSize="small" sx={{ ml: 1 }} /> الملف الشخصي
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <SettingsIcon fontSize="small" sx={{ ml: 1 }} /> الإعدادات
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <LogoutIcon fontSize="small" sx={{ ml: 1 }} /> تسجيل خروج
          </MenuItem>
        </Menu>
      </AppBar>
      <Offset />
    </>
  );
}
