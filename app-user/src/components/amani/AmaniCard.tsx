import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AmaniItem } from "@/types/types";
import COLORS from "@/constants/colors";

interface AmaniCardProps {
  item: AmaniItem;
  onPress: () => void;
}

const AmaniCard: React.FC<AmaniCardProps> = ({ item, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return COLORS.gray;
      case 'pending': return COLORS.orangeDark;
      case 'confirmed': return COLORS.primary;
      case 'in_progress': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'cancelled': return COLORS.danger;
      default: return COLORS.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getRouteText = (origin?: any, destination?: any) => {
    if (!origin || !destination) return 'غير محدد';
    return `${origin.address?.split(',')[0] || 'من'} → ${destination.address?.split(',')[0] || 'إلى'}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.carIcon}>
          <Ionicons name="car" size={20} color={COLORS.primary} />
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

      <View style={styles.routeContainer}>
        <Ionicons name="navigate" size={14} color={COLORS.lightText} />
        <Text style={styles.routeText} numberOfLines={1}>
          {getRouteText(item.origin, item.destination)}
        </Text>
      </View>

      {item.metadata && (item.metadata.passengers || item.metadata.luggage) && (
        <View style={styles.metadataContainer}>
          {item.metadata.passengers && (
            <View style={styles.metadataItem}>
              <Ionicons name="people" size={12} color={COLORS.primary} />
              <Text style={styles.metadataText}>{item.metadata.passengers} أشخاص</Text>
            </View>
          )}
          {item.metadata.luggage && (
            <View style={styles.metadataItem}>
              <Ionicons name="bag" size={12} color={COLORS.primary} />
              <Text style={styles.metadataText}>أمتعة</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString('ar-SA')}
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
  carIcon: {
    backgroundColor: COLORS.blue,
    padding: 8,
    borderRadius: 8,
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
    fontFamily: 'Cairo-SemiBold',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
    fontFamily: 'Cairo-SemiBold',
  },
  description: {
    fontSize: 14,
    color: COLORS.lightText,
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: 'Cairo-Regular',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeText: {
    fontSize: 12,
    color: COLORS.lightText,
    marginLeft: 6,
    flex: 1,
    fontFamily: 'Cairo-Regular',
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
    fontFamily: 'Cairo-SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.lightText,
    fontFamily: 'Cairo-Regular',
  },
});

export default AmaniCard;
