// screens/CatalogProductPickerScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../AppNavigator";
import axiosInstance from "../api/axiosInstance";
import { COLORS } from "../constants/colors";

interface CatalogProduct {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  category?: { _id: string; name: string };
}

type CatalogProductPickerScreenRouteProp = RouteProp<
  RootStackParamList,
  "CatalogProductPicker"
>;
type CatalogProductPickerScreenNavigationProp =
  NavigationProp<RootStackParamList>;
const CatalogProductPickerScreen = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<CatalogProductPickerScreenNavigationProp>();
  const route = useRoute<CatalogProductPickerScreenRouteProp>();
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/groceries/catalog");
      setProducts(res.data);
    } catch {
      // خطأ
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: CatalogProduct }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => {
        // 1. حدد اسم الشاشة التي تريد العودة لها
        const returnTo = route.params?.returnTo || "AddProduct";
        // 2. استخدم navigate(اسم الشاشة, params)
        navigation.navigate(returnTo as any, { selectedCatalogProduct: item });
      }}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="contain"
            onError={(error) =>
              console.log("Image loading error:", error.nativeEvent.error)
            }
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={24} color="#CCC" />
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.desc} numberOfLines={1}>
          {item.description || "—"}
        </Text>
      </View>
      <Text style={styles.cat}>{item.category?.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>اختر منتج من الكتالوج</Text>
        <Text style={styles.headerSubtitle}>ابحث واختر المنتج المناسب</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.search}
            placeholder="ابحث باسم المنتج أو التصنيف"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري تحميل المنتجات...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>لا توجد نتائج</Text>
              <Text style={styles.emptySubtext}>جرب البحث بكلمات مختلفة</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    color: "white",
    marginBottom: 4,
    textAlign: "center",
    fontFamily: "Cairo-Bold",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Cairo-Regular",
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  search: {
    flex: 1,
    paddingVertical: 15,
    fontFamily: "Cairo-Regular",
    fontSize: 16,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
    fontFamily: "Cairo-Regular",
  },
  listContainer: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    fontFamily: "Cairo-Bold",
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    fontFamily: "Cairo-Regular",
    marginTop: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginBottom: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    padding: 15,
    gap: 12,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#EEE",
    overflow: "hidden",
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#EEE",
    padding: 2,
  },
  imagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: "Cairo-Bold",
  },
  desc: {
    fontSize: 13,
    color: "#555",
    fontFamily: "Cairo-Regular",
  },
  cat: {
    fontSize: 12,
    color: "#888",
    marginLeft: 6,
    minWidth: 45,
    textAlign: "right",
    fontFamily: "Cairo-Regular",
  },
});

export default CatalogProductPickerScreen;
