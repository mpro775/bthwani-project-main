import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Product as P } from "./BusinessProductList";
import COLORS from "../../constants/colors";

type RootStackParamList = {
  UniversalProductDetails: {
    product: P;
    storeId: string;
    storeType: "restaurant" | "grocery" | "shop";
  };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "UniversalProductDetails"
>;

interface Props {
  product: P;
  storeId: string;
  storeType: "restaurant" | "grocery" | "shop";
  onAdd: (item: P, quantity: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const BusinessProductItem: React.FC<Props> = ({
  product,
  storeId,
  storeType,
  onAdd,
  isFavorite,
  onToggleFavorite,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handleAddPress = () => {
    onAdd(product, 1);
  };
  const fav =
    typeof isFavorite === "boolean" ? isFavorite : !!product.isFavorite;

  const handleCardPress = () => {
    navigation.navigate("UniversalProductDetails", {
      product,
      storeId,
      storeType,
    });
  };

  // حساب نسبة الخصم إن وجدت
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : undefined;

  return (
    <TouchableOpacity
      testID="product-card"
      onPress={handleCardPress}
      activeOpacity={0.84}
      style={styles.touchArea}
    >
      <View style={styles.card}>
        <View style={styles.imageBox}>
          <Image
            testID="product-image"
            source={product.image}
            style={styles.image}
            resizeMode="cover"
          />
          {discountPercent && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          testID="favorite-button"
          onPress={onToggleFavorite}
          style={styles.favoriteBtn}
        >
          <Ionicons
            name={fav ? "heart" : "heart-outline"}
            size={20}
            color={fav ? "#C62828" : "#C1C1C1"}
          />
        </TouchableOpacity>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.price}>{product.price} ﷼</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>
                {product.originalPrice} ﷼
              </Text>
            )}
          </View>
          <TouchableOpacity
            testID="add-to-cart-button"
            style={styles.addButton}
            onPress={handleAddPress}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BusinessProductItem;

const styles = StyleSheet.create({
  touchArea: { marginBottom: 16 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#B14D35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minHeight: 120,
    position: "relative",
  },
  imageBox: {
    marginBottom: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 100,
    height: 80,
    backgroundColor: "#F9E8E1",
  },
  discountBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "#FFD7DC",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 1,
    zIndex: 2,
    borderWidth: 1,
    borderColor: "#FFF2F2",
  },
  discountText: {
    fontSize: 12,
    color: "#C62828",
    fontWeight: "bold",
  },
  name: {
    fontSize: 15,
    fontFamily: "Cairo-SemiBold",
    textAlign: "center",
    color: "#4E342E",
    marginBottom: 3,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 4,
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.primary,
    fontFamily: "Cairo-SemiBold",
    textAlign: "right",
    marginLeft: 6,
  },
  originalPrice: {
    fontSize: 13,
    color: "#C1C1C1",
    fontFamily: "Cairo-SemiBold",
    textDecorationLine: "line-through",
    marginRight: 7,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 9,
    borderRadius: 19,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 4,
    marginLeft: 6,
  },
  favoriteBtn: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 2,
  },
});
