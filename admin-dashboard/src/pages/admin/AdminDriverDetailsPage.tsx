// src/pages/admin/AdminDriverDetailsPage.tsx
import  { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../utils/axios";
import {
  Box, Typography, Paper, Divider, CircularProgress,
  Alert, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody
} from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import StarIcon from "@mui/icons-material/Star";
import ScheduleIcon from "@mui/icons-material/Schedule";

interface DriverProfile {
  _id: string;
  fullName: string;
  email?: string;
  phone: string;
  role: "rider_driver" | "light_driver" | "women_driver";
  vehicleType: "bike" | "car";
  isAvailable: boolean;
  isJoker: boolean;
  jokerFrom?: string;
  jokerTo?: string;
  isVerified: boolean;
  isBanned: boolean;
  currentLocation: { lat: number; lng: number; updatedAt: string };
  residenceLocation: { address: string; city: string; governorate: string };
  otherLocations: { label: string; lat: number; lng: number; updatedAt: string }[];
  wallet: { balance: number; earnings: number };
  deliveryStats: {
    deliveredCount: number;
    canceledCount: number;
    totalDistanceKm: number;
  };
}

interface Order {
  _id: string;
  status: string;
  price: number;
  createdAt: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminDriverDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [dRes, oRes, rRes] = await Promise.all([
          axios.get<DriverProfile>(`/admin/drivers/${id}`),
          axios.get<Order[]>(`/admin/drivers/${id}/orders`),
          axios.get<Review[]>(`/admin/drivers/${id}/reviews`),
        ]);
        setDriver(dRes.data);
        setOrders(oRes.data);
        setReviews(rRes.data);
      } catch {
        setError("فشل في جلب بيانات الموصل");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Box p={3}><CircularProgress /></Box>;
  if (error)   return <Box p={3}><Alert severity="error">{error}</Alert></Box>;
  if (!driver) return null;

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        {driver.fullName} — تفاصيل الموصل
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box flex={1}>
            <Typography><strong>البريد:</strong> {driver.email || "—"}</Typography>
            <Typography><strong>الهاتف:</strong> {driver.phone}</Typography>
            <Typography><strong>الدور:</strong> {driver.role.replace("_"," ")}</Typography>
            <Typography><strong>المركبة:</strong> {driver.vehicleType}</Typography>
            <Typography><strong>متاح:</strong> {driver.isAvailable ? "✅" : "❌"}</Typography>
            <Typography><strong>موثق:</strong> {driver.isVerified ? "✅" : "❌"}</Typography>
            <Typography><strong>محظور:</strong> {driver.isBanned ? "🚫" : "✔️"}</Typography>
          </Box>
          <Box flex={1}>
            <Typography mb={1}>
              <RoomIcon fontSize="small" />{" "}
              {driver.currentLocation.lat.toFixed(5)}, {driver.currentLocation.lng.toFixed(5)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              تم التحديث في: {new Date(driver.currentLocation.updatedAt).toLocaleString("ar")}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>
              <strong>المسكن:</strong> {driver.residenceLocation.address}, {driver.residenceLocation.city}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {driver.residenceLocation.governorate}
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography mb={1}><ScheduleIcon fontSize="small" />{" "}
              الجوكر: {driver.isJoker ? "مفعل" : "غير مفعل"}
            </Typography>
            {driver.isJoker && (
              <Typography variant="caption" color="text.secondary">
                من {new Date(driver.jokerFrom!).toLocaleString("ar")} إلى{" "}
                {new Date(driver.jokerTo!).toLocaleString("ar")}
              </Typography>
            )}
            <Divider sx={{ my: 1 }} />
            <Typography><strong>مواقع إضافية:</strong></Typography>
            {driver.otherLocations.map((loc, i) => (
              <Typography key={i} variant="body2">
                • {loc.label}: {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)} (
                {new Date(loc.updatedAt).toLocaleDateString("ar")})
              </Typography>
            ))}
          </Box>
        </Box>
      </Paper>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <MonetizationOnIcon fontSize="large" color="primary" />
            <Typography variant="h6">الرصيد</Typography>
            <Typography>{driver.wallet.balance.toFixed(2)} ر.س</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <DirectionsCarIcon fontSize="large" color="secondary" />
            <Typography variant="h6">المسافة المقطوعة</Typography>
            <Typography>{driver.deliveryStats.totalDistanceKm.toFixed(1)} كم</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <StarIcon fontSize="large" color="warning" />
            <Typography variant="h6">الطلبيات المنجزة</Typography>
            <Typography>
              {driver.deliveryStats.deliveredCount} تمت / {driver.deliveryStats.canceledCount} ملغاة
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Divider>آخر ٥ طلبات</Divider>
      <Paper sx={{ my: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>المعرف</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>السعر</TableCell>
              <TableCell>تاريخ الإنشاء</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.slice(0, 5).map(o => (
              <TableRow key={o._id}>
                <TableCell>{o._id}</TableCell>
                <TableCell>{o.status}</TableCell>
                <TableCell>{o.price.toFixed(2)} ر.س</TableCell>
                <TableCell>{new Date(o.createdAt).toLocaleString("ar")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Divider>آخر التقييمات</Divider>
      <Paper sx={{ my: 2, p: 2 }}>
        {reviews.length === 0 ? (
          <Typography color="text.secondary">لا توجد تقييمات حتى الآن.</Typography>
        ) : (
          reviews.map(r => (
            <Box key={r._id} mb={2}>
              <Typography>
                ⭐ {r.rating} — {new Date(r.createdAt).toLocaleDateString("ar")}
              </Typography>
              <Typography>{r.comment}</Typography>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
}
