// screens/ProductsScreen.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../AppNavigator";
import axiosInstance from "../api/axiosInstance";
import { COLORS } from "../constants/colors";
import * as merchantApi from "../api/merchant";
import { useUser } from "../hooks/userContext";

type MerchantProduct = {
  _id: string;
  product: {
    _id: string;
    name: string;
    category?: { _id: string; name: string };
    image?: string;
  };
  price: number;
  isAvailable: boolean;
  customImage?: string;
  customDescription?: string;
  stock?: number;
  section?: { _id: string; name: string };
};

const ProductCard = React.memo(function ProductCard({
  item,
  index,
  onEdit,
  onToggle,
  onDelete,
}: {
  item: MerchantProduct;
  index: number;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const anim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  return (
    <Animated.View
      style={[
        styles.productCard,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onEdit}
      >
        <View style={styles.productContent}>
          <Image
            source={{
              uri:
                item.customImage ||
                item.product?.image ||
                "https://via.placeholder.com/100",
            }}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {item.product?.name || "منتج بدون اسم"}
            </Text>
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.customDescription || "بدون وصف مخصص"}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>{item.price} ر.ي</Text>
              <View
                style={[
                  styles.availabilityBadge,
                  {
                    backgroundColor: item.isAvailable ? "#4CAF50" : "#F44336",
                  },
                ]}
              >
                <Text style={styles.availabilityText}>
                  {item.isAvailable ? "متوفر" : "غير متوفر"}
                </Text>
              </View>
            </View>
            {item.stock !== undefined && (
              <Text style={{ color: "#888", fontSize: 12 }}>
                المخزون: {item.stock}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#FF9800" }]}
            onPress={onEdit}
          >
            <MaterialIcons name="edit" size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: item.isAvailable ? "#F44336" : "#4CAF50" },
            ]}
            onPress={onToggle}
          >
            <MaterialIcons
              name={item.isAvailable ? "visibility-off" : "visibility"}
              size={18}
              color="#FFF"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#F44336" }]}
            onPress={onDelete}
          >
            <MaterialIcons name="delete" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const ProductsScreen = () => {
  const { user } = useUser();
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  // للفلاتر، اجمع جميع التصنيفات المستخدمة
  const categories = useMemo(() => {
    const allCategories = [{ id: "all", name: "الكل", icon: "apps" }];

    const uniqueCategories = new Map();
    products.forEach((p) => {
      if (p.product?.category?._id && p.product?.category?.name) {
        uniqueCategories.set(p.product.category._id, {
          id: p.product.category._id,
          name: p.product.category.name,
          icon: "category",
        });
      }
    });

    return [...allCategories, ...Array.from(uniqueCategories.values())];
  }, [products]);

  const fetchProducts = useCallback(async () => {
    try {
      setRefreshing(true);
      if (!user?._id) return;
      
      const data = await merchantApi.getMyProducts(user._id);

      // تحديث واحد لجميع الحالات
      setProducts(data);
      setPage(1);
      setHasMoreProducts(data.length >= 12);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setRefreshing(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Debounce للبحث
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Pagination
  const loadMoreProducts = useCallback(() => {
    if (isLoadingMore || !hasMoreProducts) return;
    setIsLoadingMore(true);
    requestAnimationFrame(() => {
      setPage(prev => prev + 1);
      setIsLoadingMore(false);
    });
  }, [isLoadingMore, hasMoreProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // تطبيق فلتر التصنيف
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => {
        return product.product?.category?._id === selectedCategory;
      });
    }

    // تطبيق فلتر البحث
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((product) => {
        const productName = (product.product?.name || "").toLowerCase();
        const categoryName = (
          product.product?.category?.name || ""
        ).toLowerCase();
        const customDescription = (
          product.customDescription || ""
        ).toLowerCase();

        return (
          productName.includes(query) ||
          categoryName.includes(query) ||
          customDescription.includes(query)
        );
      });
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const paginatedProducts = filteredProducts.slice(0, page * 12);

  const toggleAvailability = useCallback(async (id: string, current: boolean) => {
    try {
      await merchantApi.updateProduct(id, { isAvailable: !current });
      // تحديث محلي (تفاؤلي)
      setProducts(prev => prev.map(p => p._id === id ? { ...p, isAvailable: !current } : p));
    } catch {
      Alert.alert("خطأ", "فشل تحديث حالة المنتج");
    }
  }, []);

  const deleteProduct = useCallback((id: string) => {
    Alert.alert("حذف المنتج", "هل أنت متأكد من حذف هذا المنتج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await merchantApi.deleteProduct(id);
            // تحديث محلي (تفاؤلي)
            setProducts(prev => prev.filter(p => p._id !== id));
          } catch {
            Alert.alert("خطأ", "فشل حذف المنتج");
          }
        },
      },
    ]);
  }, []);

  const renderProduct = useCallback(
    ({ item, index }: { item: MerchantProduct; index: number }) => (
      <ProductCard
        item={item}
        index={index}
        onEdit={() => navigation.navigate("AddProduct", { productId: item._id })}
        onToggle={() => toggleAvailability(item._id, item.isAvailable)}
        onDelete={() => deleteProduct(item._id)}
      />
    ),
    [navigation, toggleAvailability, deleteProduct]
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
      >
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.headerRow}>
          {/* Spacer لموازنة العنوان في المنتصف */}
          <View style={{ width: 44 }} />
          <Text style={styles.headerTitle}>منتجات متجرك</Text>

          {/* زر إضافة منتج */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate("AddProduct")}
          >
            <Ionicons name="add-circle" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن منتج أو تصنيف..."
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearch("")}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <MaterialIcons
                name={item.icon as any}
                size={18}
                color={selectedCategory === item.id ? "#FFF" : "#666"}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.id && styles.categoryTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingRight: 5 }}
        />
      </View>

      <FlatList
        data={paginatedProducts}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchProducts} />
        }
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        initialNumToRender={12}
        windowSize={7}
        maxToRenderPerBatch={12}
        removeClippedSubviews
        ListFooterComponent={() =>
          isLoadingMore && hasMoreProducts ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadMoreText}>تحميل المزيد...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inventory" size={80} color="#CCC" />
            <Text style={styles.emptyText}>
              {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد منتجات"}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearch("")}
              >
                <Text style={styles.clearSearchText}>مسح البحث</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingBottom: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden", // مهم لإظهار الانحناء فعلياً
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: "#FFF",
    textAlign: "center",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
    textAlign: "right",
    fontFamily: "Cairo-Regular",
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 5,
  },
  categoriesContainer: {
    maxHeight: 60,
    paddingHorizontal: 15,
    marginBottom: 15,
    paddingVertical: 5,
  },
  categoryChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginRight: 10,
    elevation: 1,
    minHeight: 40,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: "#666",
    textAlign: "center",
  },
  categoryTextActive: {
    color: "#FFF",
    fontFamily: "Cairo-Bold",
  },
  productsList: {
    padding: 15,
  },
  productCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productContent: {
    flexDirection: "row",
    padding: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  productInfo: {
    flex: 1,
    direction: "rtl",
    marginLeft: 15,
  },
  productName: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: "#333",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Cairo-Bold",

    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
  },
  availabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 12,
    color: "#FFF",
    fontFamily: "Cairo-Bold",
  },
  productActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingBottom: 15,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    marginTop: 16,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: "#666",
    marginTop: 8,
  },
  clearSearchButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#FF500D",
    borderRadius: 20,
  },
  clearSearchText: {
    color: "#FFF",
    fontFamily: "Cairo-Regular",
    fontSize: 14,
  },
});

export default ProductsScreen;
