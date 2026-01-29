import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { KenzItem } from "@/types/types";
import COLORS from "@/constants/colors";

interface KenzCardProps {
  item: KenzItem;
  onPress: () => void;
}

const KenzCard: React.FC<KenzCardProps> = ({ item, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return COLORS.gray;
      case 'pending': return COLORS.orangeDark;
      case 'confirmed': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'cancelled': return COLORS.danger;
      default: return COLORS.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'متاح';
      case 'completed': return 'مباع';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const formatCurrency = (price?: number, currency?: string) => {
    if (!price) return "غير محدد";
    const cur = currency ?? "ريال يمني";
    return `${price.toLocaleString("ar-SA")} ${cur}`;
  };

  const coverImage = (item.images ?? [])[0];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير محدد';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryIcon = (category?: string) => {
    if (!category) return "storefront-outline";

    switch (category) {
      case 'إلكترونيات': return "phone-portrait-outline";
      case 'سيارات': return "car-outline";
      case 'عقارات': return "home-outline";
      case 'أثاث': return "bed-outline";
      case 'ملابس': return "shirt-outline";
      case 'رياضة': return "football-outline";
      case 'كتب': return "book-outline";
      case 'خدمات': return "briefcase-outline";
      case 'وظائف': return "business-outline";
      case 'حيوانات': return "paw-outline";
      default: return "storefront-outline";
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {coverImage ? (
        <Image source={{ uri: coverImage }} style={styles.coverImage} resizeMode="cover" />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Ionicons name="image-outline" size={40} color={COLORS.gray} />
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <Ionicons
            name={getCategoryIcon(item.category)}
            size={16}
            color={COLORS.primary}
          />
          <Text style={styles.categoryText}>
            {item.category || "غير مصنف"}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {(item.city || (item.viewCount ?? 0) > 0) && (
        <View style={styles.metaRow}>
          {item.city && (
            <View style={styles.metaChip}>
              <Ionicons name="location-outline" size={12} color={COLORS.primary} />
              <Text style={styles.metaChipText}>{item.city}</Text>
            </View>
          )}
          {(item.viewCount ?? 0) > 0 && (
            <View style={styles.metaChip}>
              <Ionicons name="eye-outline" size={12} color={COLORS.gray} />
              <Text style={styles.metaChipText}>{item.viewCount}</Text>
            </View>
          )}
        </View>
      )}

      {item.price != null && (
        <View style={styles.priceContainer}>
          <Ionicons name="cash-outline" size={16} color={COLORS.success} />
          <Text style={styles.priceText}>{formatCurrency(item.price, item.currency)}</Text>
        </View>
      )}

      {item.metadata && Object.keys(item.metadata).length > 0 && (
        <View style={styles.metadataContainer}>
          <Text style={styles.metadataText} numberOfLines={1}>
            {Object.entries(item.metadata)
              .slice(0, 2)
              .map(([key, value]) => `${key}: ${value}`)
              .join(' • ')}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          {formatDate(item.createdAt as string)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: 140,
    backgroundColor: COLORS.lightGray,
  },
  coverPlaceholder: {
    width: "100%",
    height: 140,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.background,
  },
  title: {
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
    marginBottom: 12,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  metaChipText: {
    fontSize: 11,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  priceText: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.success,
    marginLeft: 6,
  },
  metadataContainer: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  metadataText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
  },
});

export default KenzCard;
