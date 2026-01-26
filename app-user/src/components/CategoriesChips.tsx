import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axiosInstance from "@/utils/api/axiosInstance";

type Cat = { _id: string; name: string };
const CHIP_H = 34;

export default function CategoriesChips({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (id?: string | null) => void;
}) {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get("/delivery/categories");
        if (mounted) setCats(data?.items || data || []);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <TouchableOpacity
        onPress={() => onChange(undefined)}
        style={[styles.chip, !value && styles.active]}
        activeOpacity={0.9}
      >
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={[styles.txt, !value && styles.activeTxt]}
        >
          كل الفئات
        </Text>
      </TouchableOpacity>

      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <View key={`s-${i}`} style={[styles.chip, styles.skeleton]} />
          ))
        : cats.map((c) => {
            const active = value === c._id;
            return (
              <TouchableOpacity
                key={c._id}
                onPress={() => onChange(active ? undefined : c._id)}
                style={[styles.chip, active && styles.active]}
                activeOpacity={0.9}
              >
                <Text
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={[styles.txt, active && styles.activeTxt]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chip: {
    height: CHIP_H,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e9eef4",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    minWidth: 64,
  },
  active: { backgroundColor: "#ffefe8", borderColor: "#ffb79f" },
  txt: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 14,
    lineHeight: 18,
    color: "#666",
    ...(Platform.OS === "android"
      ? { includeFontPadding: false, textAlignVertical: "center" as any }
      : {}),
  },
  activeTxt: { color: "#FF500D", fontFamily: "Cairo-Bold" },
  skeleton: {
    backgroundColor: "#f2f4f7",
    borderColor: "#eef2f6",
    width: 80,
  },
});
