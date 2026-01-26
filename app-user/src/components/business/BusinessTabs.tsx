import COLORS from "../../constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  categories: string[];
  selected: string;
  onSelect: (tab: string) => void;
}

const STATIC_TABS = ["عروض مميزة", "الأكثر مبيعاً"];

const BusinessTabs: React.FC<Props> = ({ categories, selected, onSelect }) => {
  // إزالة أي تكرار من التصنيفات إذا كانت تحتوي نفس أسماء التابات الثابتة
  const dynamicTabs = categories.filter((cat) => !STATIC_TABS.includes(cat));
  const allTabs = [...dynamicTabs, ...STATIC_TABS];

  return (
    <View style={styles.outerWrap}>
      <ScrollView
        testID="tabs-scrollview"
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allTabs.map((cat) => {
          const isActive = cat === selected;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onSelect(cat)}
              activeOpacity={0.86}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              {isActive ? (
                <LinearGradient
                  colors={["#FFF7F2", "#FFE0D7", "#FFD3C0"]}
                  style={styles.gradient}
                  start={{ x: 0.7, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  <Text style={styles.textActive}>{cat}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.text}>{cat}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrap: {
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 10,
    flexDirection: "row",
    gap: 3,
    minHeight: 30,
  },
  tab: {
    borderRadius: 23,
    overflow: "hidden",
    marginHorizontal: 0,
    backgroundColor: "#FFF",
    borderWidth: 1.2,
    borderColor: COLORS.blue,
  },
  tabActive: {
    borderColor: COLORS.primary,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.blue,
    paddingVertical: 12,
    paddingHorizontal: 26,
    textAlign: "center",
  },
  textActive: {
    fontSize: 13,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
    textAlign: "center",
    letterSpacing: 0.2,
  },
});

export default BusinessTabs;
