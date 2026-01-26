// app/(driver)/orders.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { completeOrder, getDriverOrders } from "@/api/driver";
import { triggerSOS } from "@/componant/triggerSOS";
import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams } from "expo-router";

interface OrderType {
  _id: string;
  status: string;
  price: number;
  address?: {
    label: string;
  };
}

export default function DriverOrdersScreen() {
  const { driver } = useAuth(); // نحصل على type من driver نفسه
  const { type = "rider_driver" } = useLocalSearchParams();
  const driverType = type as "rider_driver" | "light_driver" | "women_driver";

  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

useEffect(() => {
  fetchOrders();
}, [type]); // ← أضف type هنا

  const fetchOrders = async () => {
    try {
      const res = await getDriverOrders();
      setOrders(res);
    } catch (error) {
      console.error("❌ Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await completeOrder(orderId);
      await fetchOrders();
    } catch {
      alert("❌ فشل في تأكيد الطلب");
    } finally {
      setProcessingId(null);
    }
  };

  const getActionLabel = () => {
    switch (type) {
      case "rider_driver":
        return "تم التوصيل";
      case "light_driver":
        return "تم التسليم";
      case "women_driver":
        return "إنهاء الرحلة";
      default:
        return "إنهاء";
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#000" />;
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      {orders.length === 0 && (
        <Text style={{ textAlign: "center", color: "#999" }}>
          لا توجد طلبات حالياً
        </Text>
      )}

      {orders.map((order) => (
        <View
          key={order._id}
          style={{
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 16,
            marginBottom: 16,
            elevation: 2,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>
            رقم الطلب: {order._id.slice(-6)}
          </Text>
          <Text>الحالة: {order.status}</Text>
          <Text>العنوان: {order.address?.label}</Text>
          <Text>السعر: {order.price} ريال</Text>

          <TouchableOpacity
  disabled={processingId === order._id || loading} // ← أضف loading
            onPress={() => handleComplete(order._id)}
            style={{
              backgroundColor: "#16a34a",
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              {processingId === order._id
                ? "جارٍ المعالجة..."
                : getActionLabel()}
            </Text>
          </TouchableOpacity>

          {type === "women_driver" && (
            <TouchableOpacity
              onPress={triggerSOS}
              style={{
                backgroundColor: "#dc2626",
                padding: 12,
                borderRadius: 10,
                marginTop: 8,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                🚨 نداء طوارئ
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
