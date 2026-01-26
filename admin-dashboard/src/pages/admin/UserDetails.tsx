// src/pages/admin/UserStats.tsx
import  { useEffect, useState } from "react";
import axios from "../../utils/axios";
import {
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Skeleton,
  useTheme,
  Box,
  Tooltip,
  IconButton,
  Alert,
} from "@mui/material";
import {
  People as TotalIcon,
  Person as UsersIcon,
  AdminPanelSettings as AdminsIcon,
  CheckCircle as ActiveIcon,
  Block as BlockedIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { auth } from "../../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

interface Stats {
  total: number;
  admins: number;
  users: number;
  active: number;
  blocked: number;
  lastUpdated: Date | null;
}

export default function UserStats() {
  const theme = useTheme();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    admins: 0,
    users: 0,
    active: 0,
    blocked: 0,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("المستخدم غير مسجل دخول");
      const token = await user.getIdToken(true);
      const res = await axios.get<Partial<Stats>>("/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats({
        total: res.data.total ?? 0,
        admins: res.data.admins ?? 0,
        users: res.data.users ?? 0,
        active: res.data.active ?? 0,
        blocked: res.data.blocked ?? 0,
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.error(err);
      setError("فشل في تحميل الإحصائيات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) fetchStats();
      else console.warn("❌ لا يوجد مستخدم مسجل دخول");
    });
    return () => unsub();
  }, []);

  const statCards = [
    {
      title: "الإجمالي",
      value: stats.total,
      icon: <TotalIcon fontSize="large" />,
      color: theme.palette.primary.main,
      description: "إجمالي عدد المستخدمين المسجلين في النظام",
    },
    {
      title: "مستخدمين عاديين",
      value: stats.users,
      icon: <UsersIcon fontSize="large" />,
      color: theme.palette.info.main,
      description: "المستخدمون العاديون بدون صلاحيات إدارية",
    },
    {
      title: "مشرفين",
      value: stats.admins,
      icon: <AdminsIcon fontSize="large" />,
      color: theme.palette.warning.main,
      description: "المستخدمون بصلاحيات إدارية",
    },
    {
      title: "نشطين",
      value: stats.active,
      icon: <ActiveIcon fontSize="large" />,
      color: theme.palette.success.main,
      description: "المستخدمون النشطون القادرون على الدخول",
    },
    {
      title: "معطلين",
      value: stats.blocked,
      icon: <BlockedIcon fontSize="large" />,
      color: theme.palette.error.main,
      description: "المستخدمون المعطلون غير القادرين على الدخول",
    },
  ];

  const formatDate = (d: Date | null): string =>
    d
      ? d.toLocaleString("ar", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "غير معروف";

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
        >
          إحصائيات المستخدمين
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {stats.lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              آخر تحديث: {formatDate(stats.lastUpdated)}
            </Typography>
          )}
          <Tooltip title="تحديث البيانات">
            <IconButton onClick={fetchStats} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* استبدال Grid بـ Box مع flex */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        {statCards.map((stat, idx) => (
          <Box
            key={stat.title}
            onMouseEnter={() => setHoveredCard(idx)}
            onMouseLeave={() => setHoveredCard(null)}
            sx={{
              flex: "1 1 calc(25% - 24px)",      // أربعة في الصف مع مسافة
              minWidth: "200px",                 // تمنع الصغر الزائد
            }}
          >
            <Tooltip title={stat.description} arrow>
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease",
                  transform: hoveredCard === idx ? "translateY(-5px)" : "none",
                  boxShadow: hoveredCard === idx ? 3 : 1,
                  position: "relative",
                  overflow: "visible",
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: stat.color,
                    borderTopLeftRadius: theme.shape.borderRadius,
                    borderTopRightRadius: theme.shape.borderRadius,
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", pt: 4, position: "relative" }}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: -24,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={60} sx={{ mx: "auto", mt: 3, mb: 2 }} />
                  ) : (
                    <Typography
                      variant="h2"
                      component="div"
                      sx={{
                        fontWeight: "bold",
                        mb: 1,
                        mt: 2,
                        color: stat.color,
                        fontSize: "2.5rem",
                      }}
                    >
                      {stat.value.toLocaleString()}
                    </Typography>
                  )}
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    {stat.title}
                    <Tooltip title={stat.description}>
                      <span>
                        <InfoIcon fontSize="small" sx={{ opacity: 0.7 }} />
                      </span>
                    </Tooltip>
                  </Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
