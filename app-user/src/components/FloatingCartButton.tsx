import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import COLORS from "@/constants/colors";
import React, { useRef } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../context/CartContext";
import { RootStackParamList } from "@/types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const START_POS = { right: 20, bottom: 100 }; // موضع ابتدائي ثابت

const FloatingCartButton = ({ itemCount = 0 }: { itemCount?: number }) => {
  const navigation = useNavigation<Nav>();
  const { totalQuantity } = useCart();

  // نُبقي القيم صفرًا ونحرك بالـ transform فقط
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
      onPanResponderGrant: () => {
        // أضِف القيمة الحالية للأوفست وصفّر القيمة الحية
        pan.extractOffset();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        // ثبّت الموضع الجديد
        pan.flattenOffset();
      },
    })
  ).current;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper, // يحافظ على التراكب فوق كل شيء
        START_POS, // تموضع ابتدائي باستخدام right/bottom (مثالي مع RTL)
        { transform: pan.getTranslateTransform() }, // الحركة بالتحويلات
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CartScreen")}
        activeOpacity={0.85}
        testID="floating-cart-button"
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`سلة المشتريات ${totalQuantity > 0 ? `(${totalQuantity} عناصر)` : '(فارغة)'}`}
        accessibilityHint="يفتح صفحة سلة المشتريات لمراجعة المنتجات المختارة"
      >
        <Ionicons
          name="cart"
          size={24}
          color="#fff"
          accessible={false}
          importantForAccessibility="no"
        />
        {(totalQuantity ?? 0) > 0 && (
          <View style={styles.badge} accessible={false} importantForAccessibility="no">
            <Text style={styles.badgeText}>{totalQuantity}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    zIndex: 9999, // فوق كل العناصر
    elevation: 12, // أندرويد
  },
  button: {
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FFC107",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    color: "#3E2723",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default FloatingCartButton;
