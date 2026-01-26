import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import COLORS from "../../constants/colors";

export type FilterKey =
  | "all"
  | "nearest"
  | "new"
  | "favorite"
  | "topRated"
  | "trending"
  | "freeDelivery"
  | "featured";

type Props = {
  value?: FilterKey; // اختياري: لو مررته يصير Controlled
  onChange?: (value: FilterKey) => void;
  defaultValue?: FilterKey; // عند عدم تمرير value
};

const OPTIONS: { id: FilterKey; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "nearest", label: "الأقرب" },
  { id: "new", label: "الجديدة" },
  { id: "favorite", label: "المفضلة" },
  { id: "topRated", label: "الأعلى تقييمًا" },
  { id: "trending", label: "الرائج" },
  { id: "freeDelivery", label: "توصيل مجاني" },
];

const GroceryFiltersBar: React.FC<Props> = ({
  value,
  onChange,
  defaultValue = "all",
}) => {
  const controlled = typeof value !== "undefined";
  const [internal, setInternal] = useState<FilterKey>(defaultValue);

  useEffect(() => {
    if (controlled) setInternal(value as FilterKey);
  }, [controlled, value]);

  const current = controlled ? (value as FilterKey) : internal;

  const select = (id: FilterKey) => {
    if (!controlled) setInternal(id);
    onChange?.(id);
  };

  return (
    <ScrollView
      testID="delivery-filters-scrollview"
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {OPTIONS.map((opt) => {
        const active = current === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => select(opt.id)}
            style={[styles.filterButton, active && styles.activeFilter]}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterText, active && styles.activeText]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingBottom: 8,
    gap: 8,
  },
  filterButton: {
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#EEE",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.accent || COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  filterText: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 14,
    color: "#666",
    letterSpacing: 0.2,
  },
  activeText: {
    color: "#FFF",
    fontFamily: "Cairo-Bold",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default GroceryFiltersBar;
