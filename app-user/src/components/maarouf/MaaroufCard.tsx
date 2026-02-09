import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { MaaroufItem, MAAROUF_CATEGORIES } from "@/types/types";
import COLORS from "@/constants/colors";

interface MaaroufCardProps {
  item: MaaroufItem;
  onPress: () => void;
}

const MaaroufCard: React.FC<MaaroufCardProps> = ({ item, onPress }) => {
  const firstImage = item.mediaUrls?.[0];
  const categoryLabel =
    MAAROUF_CATEGORIES.find((c) => c.value === item.category)?.label || "أخرى";
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return COLORS.gray;
      case "pending":
        return COLORS.orangeDark;
      case "confirmed":
        return COLORS.primary;
      case "completed":
        return COLORS.success;
      case "cancelled":
        return COLORS.danger;
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "مسودة";
      case "pending":
        return "في الانتظار";
      case "confirmed":
        return "مؤكد";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const getKindText = (kind?: string) => {
    switch (kind) {
      case "lost":
        return "مفقود";
      case "found":
        return "موجود";
      default:
        return "غير محدد";
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {firstImage && (
        <Image
          source={{ uri: firstImage }}
          style={styles.thumb}
          resizeMode="cover"
        />
      )}
      <View style={styles.header}>
        <View style={styles.kindContainer}>
          <Text style={styles.kindText}>{getKindText(item.kind)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.badgesRow}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{categoryLabel}</Text>
        </View>
        {item.reward && item.reward > 0 && (
          <View style={styles.rewardChip}>
            <Ionicons name="cash-outline" size={12} color={COLORS.success} />
            <Text style={styles.rewardChipText}>{item.reward} ريال</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <Text key={index} style={styles.tag}>
              #{tag}
            </Text>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTags}>+{item.tags.length - 3}</Text>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString("ar-SA")}
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
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumb: {
    width: "100%",
    height: 120,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryChipText: {
    fontSize: 11,
    fontFamily: "Cairo-Regular",
    color: COLORS.primary,
  },
  rewardChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  rewardChipText: {
    fontSize: 11,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.success,
  },
  kindContainer: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  kindText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Cairo-SemiBold",
    color: COLORS.background,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
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
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  tag: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.primary,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  moreTags: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
    marginLeft: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
  },
});

export default MaaroufCard;
