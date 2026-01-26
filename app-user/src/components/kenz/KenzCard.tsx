import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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

  const formatCurrency = (price?: number) => {
    if (!price) return 'غير محدد';
    return `${price.toLocaleString('ar-SA')} ريال`;
  };

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
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <Ionicons
            name={getCategoryIcon(item.category)}
            size={16}
            color={COLORS.primary}
          />
          <Text style={styles.categoryText}>
            {item.category || 'غير مصنف'}
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

      {item.price && (
        <View style={styles.priceContainer}>
          <Ionicons name="cash-outline" size={16} color={COLORS.success} />
          <Text style={styles.priceText}>{formatCurrency(item.price)}</Text>
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
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
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
    fontWeight: '500',
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
    fontWeight: '600',
    color: COLORS.background,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: COLORS.lightText,
    marginBottom: 12,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
    marginLeft: 6,
  },
  metadataContainer: {
    marginBottom: 12,
  },
  metadataText: {
    fontSize: 12,
    color: COLORS.lightText,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.lightText,
  },
});

export default KenzCard;
