import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SanadItem } from "@/types/types";
import COLORS from "@/constants/colors";

interface SanadCardProps {
  item: SanadItem;
  onPress: () => void;
}

const SanadCard: React.FC<SanadCardProps> = ({ item, onPress }) => {
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

  const getKindText = (kind?: string) => {
    switch (kind) {
      case 'specialist': return 'خدمة متخصصة';
      case 'emergency': return 'فزعة';
      case 'charity': return 'خيري';
      default: return 'غير محدد';
    }
  };

  const getKindIcon = (kind?: string) => {
    switch (kind) {
      case 'specialist': return 'briefcase-outline';
      case 'emergency': return 'warning-outline';
      case 'charity': return 'heart-outline';
      default: return 'help-circle-outline';
    }
  };

  const getKindColor = (kind?: string) => {
    switch (kind) {
      case 'specialist': return COLORS.primary;
      case 'emergency': return COLORS.danger;
      case 'charity': return COLORS.success;
      default: return COLORS.gray;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.kindContainer}>
          <Ionicons
            name={getKindIcon(item.kind) as any}
            size={16}
            color={getKindColor(item.kind)}
          />
          <Text style={[styles.kindText, { color: getKindColor(item.kind) }]}>
            {getKindText(item.kind)}
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

      {item.metadata?.location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color={COLORS.lightText} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.metadata.location}
          </Text>
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
  kindContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  kindText: {
    fontSize: 12,
    fontWeight: '600',
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.lightText,
    marginLeft: 4,
    flex: 1,
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

export default SanadCard;
