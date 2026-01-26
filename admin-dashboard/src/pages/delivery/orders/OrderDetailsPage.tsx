// src/pages/delivery/orders/OrderDetailsPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Divider,

  Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import OrderDrawer from "./components/OrderDrawer";
import { OrdersApi } from "./services/ordersApi";
import type { OrderRow } from "./types";

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("معرف الطلب غير صحيح");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await OrdersApi.get(id);
        setOrder(orderData);
      } catch (err: unknown) {
        setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "فشل في جلب تفاصيل الطلب");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleClose = () => {
    // العودة إلى قائمة الطلبات مع الحفاظ على الفلاتر والصفحة الحالية
    navigate(`/admin/delivery/orders?${location.search}`);
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
          onClick={handleClose}
          sx={{ mb: 2 }}
        >
          العودة للقائمة
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleClose}
          sx={{ mb: 2 }}
        >
          العودة للقائمة
        </Button>
        <Alert severity="info">الطلب غير موجود</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* رأس الصفحة مع زر العودة */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleClose}
          variant="outlined"
          sx={{ mr: 2 }}
        >
          العودة للقائمة
        </Button>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          تفاصيل الطلب #{order._id?.slice(-8)}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* عرض التفاصيل باستخدام نفس OrderDrawer لكن في صفحة منفصلة */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <OrderDrawer
          open={true}
          orderId={id}
          onClose={handleClose}
        />
      </Paper>
    </Box>
  );
}
