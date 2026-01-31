import React, { useCallback, useRef } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";

import { RootStackParamList } from "@/types/navigation";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "@/auth/AuthContext";
import { useVerificationState } from "@/context/verify";
import { useEnsureAuthAndVerified } from "@/guards/useEnsureAuthAndVerified"; // ✅

import DeliveryBannerSlider from "@/components/delivery/DeliveryBannerSlider";
import DeliveryCategories from "@/components/delivery/DeliveryCategories";
import DeliveryDeals from "@/components/delivery/DeliveryDeals";
import DeliveryHeader from "@/components/delivery/DeliveryHeader";
import DeliveryTrending from "@/components/delivery/DeliveryTrending";

// Enhanced color palette for web compatibility
const COLORS = {
  primary: "#FF500D",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  text: "#1A3052",
  textLight: "#6B7280",
  border: "#E5E7EB",
};
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "BusinessDetails"
>;

const DeliveryHomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = Dimensions.get("window");
  const ensure = useEnsureAuthAndVerified({
    requireVerified: false,
    cooldownMs: 1200,
  });
  const { authReady } = useAuth();
  const { loading: verifyLoading } = useVerificationState();
  const promptedRef = useRef(false);

  // Layout configuration
  const containerPadding = 16;
  const sectionGap = 24;
  const maxContentWidth = screenWidth - 32;

  // اعرض الـ Prompt عند أول Focus للشاشة فقط بعد الجاهزية
  useFocusEffect(
    useCallback(() => {
      if (promptedRef.current) return;
      if (!authReady || verifyLoading) return;

      promptedRef.current = true;
      const t = setTimeout(() => {
        ensure();
      }, 50); // تأخير بسيط للتأكيد
      return () => clearTimeout(t);
    }, [authReady, verifyLoading, ensure])
  );

  return (
    <View testID="delivery-home-container" style={styles.container}>
      <View testID="sticky-header" style={styles.stickyHeader}>
        <DeliveryHeader showBackButton={true} />
      </View>

      <ScrollView
        testID="scroll-view"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: containerPadding },
        ]}
      >
        <View style={[styles.contentWrapper, { maxWidth: maxContentWidth }]}>
          {/* Hero Banner - Full Width */}
          <View
            testID="content-section"
            style={[styles.section, { marginBottom: sectionGap }]}
          >
            <DeliveryBannerSlider placement="home_hero" channel="app" />
          </View>

          <View
            testID="content-section"
            style={[styles.section, { marginBottom: sectionGap }]}
          >
            <DeliveryCategories />
          </View>

          <View
            testID="content-section"
            style={[styles.section, { marginBottom: sectionGap }]}
          >
            <DeliveryTrending
              onSelect={(store) =>
                navigation.navigate("BusinessDetails", { business: store })
              }
            />
          </View>

          {/* Deals Section - Full Width */}
          <View
            testID="content-section"
            style={[styles.section, { marginBottom: sectionGap }]}
          >
            <DeliveryDeals
              sectionTitle="العروض"
              onSelect={(store) =>
                navigation.navigate("BusinessDetails", { business: store })
              }
              // categoryId={...} // اختياري: لو تبي عروض لفئة معينة
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DeliveryHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  stickyHeader: {
    zIndex: 10,
    backgroundColor: COLORS.background,
    paddingBottom: 6,
    borderBottomWidth: 0,
    borderBottomColor: COLORS.border,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 6,
  },
  contentWrapper: {
    alignSelf: "center",
    width: "100%",
  },
  section: {
    marginBottom: 10,
  },
});
