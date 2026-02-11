import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AkhdimniOptionsScreen"
>;

interface OptionItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: keyof RootStackParamList;
}

const NAVY = "#1a237e"; // كحلي غامق لصفحة اخدمني

const OPTIONS: OptionItem[] = [
  {
    id: "akhdimni",
    name: "اخدمني",
    description: "أغراض خاصة ومهام مخصصة",
    icon: "hand-left-outline",
    color: NAVY,
    route: "AkhdimniScreen",
  },
  {
    id: "gas",
    name: "غاز",
    description: "طلب دبة غاز",
    icon: "flame-outline",
    color: "#E65100",
    route: "UtilityGasScreen",
  },
  {
    id: "water",
    name: "وايت ماء",
    description: "طلب وايت ماء",
    icon: "water-outline",
    color: "#0288D1",
    route: "UtilityWaterScreen",
  },
];

const AkhdimniOptionsScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>اخدمني</Text>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={styles.subtitle}>اختر الخدمة التي تريدها</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.optionCard, { borderLeftColor: option.color }]}
            onPress={() => navigation.navigate(option.route as never)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: `${option.color}18` },
              ]}
            >
              <Ionicons
                name={option.icon as any}
                size={32}
                color={option.color}
              />
            </View>
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionName}>{option.name}</Text>
              <Text style={styles.optionDesc}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={COLORS.gray} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontFamily: "Cairo-Bold",
    color: COLORS.white,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionName: {
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
  },
});

export default AkhdimniOptionsScreen;
