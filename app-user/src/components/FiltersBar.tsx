import COLORS from "@/constants/colors";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export type FilterKey =
  | "all"
  | "nearest"
  | "new"
  | "favorite"
  | "topRated"
  | "trending"
  | "freeDelivery";

const OPTIONS: { id: FilterKey; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "nearest", label: "الأقرب" },
  { id: "new", label: "الجديدة" },
  { id: "favorite", label: "المفضلة" },
  { id: "topRated", label: "الأعلى تقييمًا" },
  { id: "trending", label: "الرائج" },
  { id: "freeDelivery", label: "توصيل مجاني" },
];

const CHIP_H = 34;

export default function FiltersBar({
  value,
  onChange,
}: {
  value: FilterKey;
  onChange: (v: FilterKey) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {OPTIONS.map((f) => {
        const active = value === f.id;
        return (
          <TouchableOpacity
            key={f.id}
            onPress={() => onChange(f.id)}
            activeOpacity={0.9}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text
              numberOfLines={1}
              allowFontScaling={false}
              style={[styles.text, active && styles.textActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  chip: {
    height: CHIP_H,
    paddingHorizontal: 12, // لا padding عمودي
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#EEE",
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    // elevation اختياري
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.accent || COLORS.primary,
  },
  text: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 14,
    lineHeight: 18,
    color: "#666",
    ...(Platform.OS === "android"
      ? { includeFontPadding: false, textAlignVertical: "center" as any }
      : {}),
  },
  textActive: { color: "#FFF", fontFamily: "Cairo-Bold" },
});
