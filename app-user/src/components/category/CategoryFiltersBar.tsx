import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import COLORS from "../../constants/colors";

 type FilterKey =
  | "all"
  | "nearest"
  | "new"
  | "favorite"
  | "topRated"
  | "trending"
  | "freeDelivery";

type Props = {
  /** قيمة الفلتر الحالية (لو مررتها يصير الكومبوننت متحكَّم) */
  value?: FilterKey;
  /** يتنادى بكل ضغطة فلتر */
  onChange?: (value: FilterKey) => void;
  /** قيمة ابتدائية عند عدم تمرير value */
  defaultValue?: FilterKey;
};

const OPTIONS: { id: FilterKey; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "nearest", label: "الأقرب" }, // ✅ جديد
  { id: "new", label: "الجديدة" }, // (اختياري — جاهز)
  { id: "favorite", label: "المفضلة" },
  { id: "topRated", label: "الأعلى تقييمًا" },
  { id: "trending", label: "الرائج" }, // ✅ جديد
  { id: "freeDelivery", label: "توصيل مجاني" },
];

const CategoryFiltersBar: React.FC<Props> = ({
  value,
  onChange,
  defaultValue = "all",
}) => {
  // دعم controlled/uncontrolled
  const isControlled = typeof value !== "undefined";
  const [internal, setInternal] = useState<FilterKey>(defaultValue);

  useEffect(() => {
    if (isControlled && typeof value !== "undefined") {
      setInternal(value);
    }
  }, [isControlled, value]);

  const current = isControlled ? (value as FilterKey) : internal;

  const handleSelect = (id: FilterKey) => {
    if (!isControlled) setInternal(id);
    onChange?.(id);
  };

  return (
    <ScrollView
      testID="filters-scrollview"
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {OPTIONS.map((opt) => {
        const active = current === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => handleSelect(opt.id)}
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
    flexDirection: "row-reverse",
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
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

export default CategoryFiltersBar;
