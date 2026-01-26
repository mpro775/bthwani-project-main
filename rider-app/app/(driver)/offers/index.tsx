// app/(driver)/offers/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { listOffers, acceptOffer } from "../../../src/api/driver";
import { COLORS } from "../../../constants/colors";

interface Offer {
  _id: string;
  orderId: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  price: number;
  distance: number;
  estimatedTime: number;
  createdAt: string;
}

export default function OffersScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await listOffers();
      setOffers(data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      Alert.alert("خطأ", "فشل في تحميل العروض");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await acceptOffer(offerId);
      Alert.alert("نجح", "تم قبول العرض بنجاح");
      fetchOffers(); // تحديث القائمة
    } catch (error) {
      console.error("Error accepting offer:", error);
      Alert.alert("خطأ", "فشل في قبول العرض");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOffers();
  };

  const renderOffer = ({ item }: { item: Offer }) => (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Ionicons name="location" size={20} color={COLORS.primary} />
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.price}>{item.price} ﷼</Text>
      </View>

      <View style={styles.addressContainer}>
        <View style={styles.addressRow}>
          <Ionicons name="ellipse" size={8} color={COLORS.success} />
          <Text style={styles.addressText}>{item.pickupAddress}</Text>
        </View>
        <View style={styles.addressRow}>
          <Ionicons name="ellipse" size={8} color={COLORS.error} />
          <Text style={styles.addressText}>{item.deliveryAddress}</Text>
        </View>
      </View>

      <View style={styles.offerDetails}>
        <Text style={styles.detailText}>
          المسافة: {item.distance} كم
        </Text>
        <Text style={styles.detailText}>
          الوقت المتوقع: {item.estimatedTime} دقيقة
        </Text>
        <Text style={styles.timeText}>
          تم الإرسال: {new Date(item.createdAt).toLocaleTimeString("ar-SA")}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleAcceptOffer(item._id)}
        activeOpacity={0.8}
      >
        <Ionicons name="checkmark-circle" size={20} color="#fff" />
        <Text style={styles.acceptButtonText}>قبول العرض</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جارٍ تحميل العروض...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>العروض المتاحة</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={offers}
        renderItem={renderOffer}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>لا توجد عروض متاحة حالياً</Text>
            <Text style={styles.emptySubtext}>
              ستظهر العروض هنا عند توفر طلبات جديدة
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: "#fff",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  listContainer: {
    padding: 16,
  },
  offerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    flex: 1,
    marginLeft: 8,
  },
  price: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  addressText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  offerDetails: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.gray,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    marginTop: 8,
    textAlign: "center",
  },
});
