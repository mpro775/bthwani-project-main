// src/pages/admin/UserStats.tsx
import { useEffect, useState } from "react";
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
  Chip,
  useMediaQuery,
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
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import axios from "../../utils/axios";
import { auth } from "../../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

interface Stats {
  total: number;
  admins: number;
  users: number;
  active: number;
  blocked: number;
  lastUpdated: Date | null;
}

const StatCard = ({
  title,
  value,
  icon,
  color,
  description,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  description: string;
  loading: boolean;
}) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Card
        sx={{
          height: "100%",
          transition: "all 0.3s ease",
          boxShadow: hovered ? 6 : 3,
          position: "relative",
          overflow: "visible",
          borderLeft: `4px solid ${color}`,
          borderRadius: "12px",
          background: hovered
            ? `linear-gradient(to bottom right, ${theme.palette.background.paper}, ${color}10)`
            : theme.palette.background.paper,
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
              boxShadow: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color,
              border: `2px solid ${color}`,
            }}
          >
            {icon}
          </Box>

          {loading ? (
            <Skeleton
              variant="rounded"
              width={120}
              height={60}
              sx={{ mx: "auto", mt: 3, mb: 2 }}
            />
          ) : (
            <Typography
              variant="h2"
              component="div"
              sx={{
                fontWeight: "bold",
                mb: 1,
                mt: 2,
                color: color,
                fontSize: "2.5rem",
                background: `linear-gradient(to right, ${color}, ${theme.palette.getContrastText(
                  color
                )})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {value.toLocaleString()}
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
              fontWeight: 600,
            }}
          >
            {title}
            <Tooltip title={description} arrow>
              <InfoIcon fontSize="small" sx={{ opacity: 0.7, color }} />
            </Tooltip>
          </Typography>

          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 1,
                  fontSize: "0.75rem",
                }}
              >
                {description}
              </Typography>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function UserStats() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setRefreshing(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn("❌ المستخدم غير مسجل دخول");
        setRefreshing(false);
        return;
      }
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
      console.error("فشل في تحميل الإحصائيات", err);
      setError("فشل في تحميل الإحصائيات. يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchStats();
      } else {
        console.warn("❌ لا يوجد مستخدم مسجل دخول");
      }
    });
    return () => unsubscribe();
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
    <Box sx={{ p: isMobile ? 2 : 3,
 
     }}>
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
          sx={{
            fontWeight: "bold",
            color: theme.palette.text.primary,
            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          إحصائيات المستخدمين
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {stats.lastUpdated && (
            <Chip
              icon={<TimeIcon fontSize="small" />}
              label={`آخر تحديث: ${formatDate(stats.lastUpdated)}`}
              size="small"
              sx={{
                borderRadius: "8px",
                backgroundColor: theme.palette.grey[200],
                color: theme.palette.text.secondary,
              }}
            />
          )}
          <Tooltip title="تحديث البيانات" arrow>
            <IconButton
              onClick={fetchStats}
              disabled={loading || refreshing}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              <motion.div
                animate={{ rotate: refreshing ? 360 : 0 }}
                transition={{
                  duration: refreshing ? 1 : 0,
                  repeat: refreshing ? Infinity : 0,
                }}
              >
                <RefreshIcon />
              </motion.div>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {(loading || refreshing) && (
        <LinearProgress
          sx={{
            mb: 3,
            height: "4px",
            borderRadius: "4px",
            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }}
        />
      )}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3, // الفراغ بين البطاقات
          mx: -1.5, // يعوض الهامش الأفقي لكل عنصر
        }}
      >
        {statCards.map((stat) => (
          <Box
            key={stat.title}
            sx={{
              px: 1.5, // يعوض mx سالب في الحاوية
              mb: 3,
              display: "flex",
              flexDirection: "column",
              width: {
                xs: "100%", // عمود واحد على الجوال
                sm: "50%", // عمودين على الشاشات الصغيرة
                md: "33.3333%", // ثلاث أعمدة على الشاشات المتوسطة
                lg: "20%", // خمس أعمدة على الشاشات الكبيرة
              },
            }}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              description={stat.description}
              loading={loading}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
