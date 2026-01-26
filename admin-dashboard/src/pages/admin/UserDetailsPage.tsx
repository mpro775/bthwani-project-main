// src/pages/admin/UserDetailsPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Divider,
  Stack,
  Chip,
  Alert,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { ArrowBack, Person as UserIcon } from "@mui/icons-material";
import axios from "../../utils/axios";
import { getEnumLabel, getEnumBadge } from "../../constants/statusMap";

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("معرف المستخدم غير صحيح");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/admin/users/${id}`);
        setUser(response.data);
      } catch (err: unknown) {
        setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "فشل في جلب تفاصيل المستخدم");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleBackToList = () => {
    // العودة إلى قائمة المستخدمين مع الحفاظ على الفلاتر والصفحة الحالية
    navigate(`/admin/users/list?${location.search}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", height: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackToList}
          sx={{ mb: 2 }}
        >
          العودة للقائمة
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackToList}
          sx={{ mb: 2 }}
        >
          العودة للقائمة
        </Button>
        <Alert severity="info">المستخدم غير موجود</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* رأس الصفحة مع زر العودة */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackToList}
          variant="outlined"
          sx={{ mr: 2 }}
        >
          العودة للقائمة
        </Button>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          تفاصيل المستخدم
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* معلومات المستخدم */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <UserIcon sx={{ fontSize: 48, color: "primary.main", mr: 2 }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              {user.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              معرف المستخدم: {user._id}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid  size={{xs: 12, md: 6}}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  معلومات أساسية
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      البريد الإلكتروني
                    </Typography>
                    <Typography variant="body1">
                      {user.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      رقم الهاتف
                    </Typography>
                    <Typography variant="body1">
                      {user.phone}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      الدور
                    </Typography>
                    <Chip
                      label={getEnumLabel("user_role", user.role)}
                      color={getEnumBadge("user_role", user.role).replace('danger', 'error') as 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'}
                      size="small"
                      icon={<UserIcon fontSize="small" />}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid  size={{xs: 12, md: 6}}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  حالة الحساب
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      حالة التفعيل
                    </Typography>
                    <Chip
                      label={user.isActive ? "نشط" : "معطل"}
                      color={user.isActive ? "success" : "error"}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      حالة التحقق
                    </Typography>
                    <Chip
                      label={user.isVerified ? "موثق" : "غير موثق"}
                      color={user.isVerified ? "success" : "warning"}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      حالة الحظر
                    </Typography>
                    <Chip
                      label={user.isBanned ? "محظور" : "غير محظور"}
                      color={user.isBanned ? "error" : "success"}
                      size="small"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid  size={{xs: 12}}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  معلومات النظام
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      تاريخ الإنشاء
                    </Typography>
                    <Typography variant="body1">
                      {new Date(user.createdAt).toLocaleDateString("ar-SA")}
                    </Typography>
                  </Box>
                  {user.lastLogin && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        آخر تسجيل دخول
                      </Typography>
                      <Typography variant="body1">
                        {new Date(user.lastLogin).toLocaleDateString("ar-SA")}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
