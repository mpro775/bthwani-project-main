import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ArabonItem } from "@/types/types";
import COLORS from "@/constants/colors";

interface ArabonCardProps {
  item: ArabonItem;
  onPress: () => void;
}

const ArabonCard: React.FC<ArabonCardProps> = ({ item, onPress }) => {
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
      case 'confirmed': return 'مؤكد';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'غير محدد';
    return `${amount.toFixed(2)} ريال`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير محدد';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const isUpcoming = () => {
    if (!item.scheduleAt) return false;
    const scheduleDate = new Date(item.scheduleAt);
    const now = new Date();
    return scheduleDate > now && item.status !== 'completed' && item.status !== 'cancelled';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>{formatCurrency(item.depositAmount)}</Text>
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

      {item.scheduleAt && (
        <View style={styles.scheduleContainer}>
          <Ionicons
            name={isUpcoming() ? "calendar-outline" : "checkmark-circle-outline"}
            size={16}
            color={isUpcoming() ? COLORS.primary : COLORS.success}
          />
          <Text style={[
            styles.scheduleText,
            { color: isUpcoming() ? COLORS.primary : COLORS.success }
          ]}>
            {formatDate(item.scheduleAt)}
          </Text>
        </View>
      )}

      {item.metadata?.guests && (
        <View style={styles.guestsContainer}>
          <Ionicons name="people-outline" size={14} color={COLORS.lightText} />
          <Text style={styles.guestsText}>
            {item.metadata.guests} شخص{item.metadata.guests > 1 ? 'اً' : ''}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          إنشاء: {new Date(item.createdAt).toLocaleDateString('ar-SA')}
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
  amountContainer: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.success,
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
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  guestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guestsText: {
    fontSize: 12,
    color: COLORS.lightText,
    marginLeft: 4,
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

export default ArabonCard;
