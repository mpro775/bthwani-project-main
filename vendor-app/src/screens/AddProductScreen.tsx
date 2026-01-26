// screens/AddProductScreen.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../AppNavigator";
import { COLORS } from "../constants/colors";
import { useUser } from "../hooks/userContext";
import * as merchantApi from "../api/merchant";

// ===== Helpers: product قد يكون String أو Object
type CatalogRef =
  | string
  | { _id: string; name?: string; image?: string; category?: any };

const getCatalogId = (p?: CatalogRef) =>
  typeof p === "string" ? p : p?._id;
const getCatalogName = (p?: CatalogRef) =>
  !p ? "اختر منتجاً من الكاتالوج" : typeof p === "string" ? `منتج #${p.slice(-6)}` : p.name || "منتج (بدون اسم)";
const getCatalogImage = (p?: CatalogRef) =>
  typeof p === "string" ? undefined : p?.image;

// ===== Mini error-boundary يمنع الشاشة البيضاء
const TryRender: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [err, setErr] = React.useState<string | null>(null);
  if (err) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: "red", fontFamily: "Cairo-Bold", textAlign: "center" }}>
          حدث خطأ أثناء فتح الشاشة
        </Text>
        <Text style={{ marginTop: 8, textAlign: "center", color: "#444" }}>{err}</Text>
      </View>
    );
  }
  try {
    return <>{children}</>;
  } catch (e: any) {
    setErr(e?.message || String(e));
    return null;
  }
};

type Nav = NavigationProp<RootStackParamList>;

const AddProductScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const productId: string | undefined = route.params?.productId;
  const { user } = useUser();

  const [loading, setLoading] = useState<boolean>(!!productId);
  const [product, setProduct] = useState<{
    price: string;
    stock: string;
    isAvailable: boolean;
    customDescription: string;
    customImage: string;
    product?: CatalogRef;
  }>({
    price: "",
    stock: "",
    isAvailable: true,
    customDescription: "",
    customImage: "",
    product: undefined,
  });

  // ===== جلب بيانات المنتج في وضع التعديل
  useEffect(() => {
    if (!productId) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        console.log("[AddProduct] fetching product:", productId);
        const mp = await merchantApi.getProduct(productId);
        console.log("[AddProduct] fetched OK:", mp._id);

        const p: CatalogRef | undefined =
          mp.product ? (typeof mp.product === "string" ? mp.product : mp.product) : undefined;

        if (!cancelled) {
          setProduct({
            price: mp.price != null ? String(mp.price) : "",
            stock: mp.stock != null ? String(mp.stock) : "",
            isAvailable: mp.isAvailable ?? true,
            customDescription: mp.customDescription || "",
            customImage: mp.customImage || "",
            product: p,
          });
        }
      } catch (err: any) {
        console.log("[AddProduct] fetch error:", err?.response?.data || err);
        Alert.alert("خطأ", err?.response?.data?.message || "فشل تحميل بيانات المنتج");
        if (!cancelled) navigation.goBack();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productId, navigation]);

  // الرجوع من منتقي الكاتالوج
  useFocusEffect(
    useCallback(() => {
      const sel = route.params?.selectedCatalogProduct;
      if (sel) {
        console.log("[AddProduct] selectedCatalogProduct:", sel?._id || sel);
        setProduct((prev) => ({ ...prev, product: sel }));
      }
    }, [route.params?.selectedCatalogProduct])
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProduct((prev) => ({ ...prev, customImage: result.assets[0].uri }));
    }
  };

  const catalogId = getCatalogId(product.product);
  const catalogName = getCatalogName(product.product);
  const catalogImage = product.customImage || getCatalogImage(product.product);

  const validateForm = () => {
    if (!catalogId) {
      Alert.alert("خطأ", "يرجى اختيار منتج من الكاتالوج");
      return false;
    }
    const priceNum = Number(product.price);
    if (!product.price || !isFinite(priceNum) || priceNum <= 0) {
      Alert.alert("خطأ", "يرجى إدخال سعر صحيح");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user || !user._id || !user.storeId) {
      Alert.alert("بيانات ناقصة", "لم نعثر على معرف التاجر أو المتجر.");
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        product: catalogId, // دائماً string
        customDescription: product.customDescription || undefined,
        price: Number(product.price),
        stock: product.stock ? Number(product.stock) : undefined,
        isAvailable: product.isAvailable,
        merchant: user._id,
        store: user.storeId,
      };

      console.log("[AddProduct] submit payload:", payload);

      if (productId) {
        await merchantApi.updateProduct(productId, payload);
        Alert.alert("تم", "تم تحديث المنتج بنجاح");
      } else {
        await merchantApi.createProduct(payload);
        Alert.alert("تم", "تم إضافة المنتج بنجاح");
      }
      navigation.goBack();
    } catch (err: any) {
      console.log("Add/Update product error:", err?.response?.data || err);
      Alert.alert("خطأ", err?.response?.data?.message || "فشلت العملية");
    } finally {
      setLoading(false);
    }
  };

  if (loading && productId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 8, color: "#666" }}>جاري تحميل المنتج…</Text>
      </View>
    );
  }

  return (
    <TryRender>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}      >
          <LinearGradient colors={[COLORS.primary, COLORS.primary]} style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {productId ? "تعديل المنتج" : "إضافة منتج جديد"}
            </Text>
            <View style={{ width: 40 }} />
          </LinearGradient>

        

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* اختيار الكاتالوج */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>منتج الكاتالوج *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() =>
                  navigation.navigate("CatalogProductPicker", { returnTo: "AddProduct" })
                }
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {catalogImage && (
                    <Image
                      source={{ uri: catalogImage }}
                      style={{ width: 32, height: 32, borderRadius: 6, marginEnd: 8 }}
                    />
                  )}
                  <Text style={styles.select}>{catalogName}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* الصورة */}
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              {catalogImage ? (
                <Image source={{ uri: catalogImage }} style={styles.productImage} resizeMode="contain" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={50} color="#999" />
                  <Text style={styles.imagePlaceholderText}>اضغط لإضافة صورة</Text>
                </View>
              )}
              <View style={styles.imageEditBadge}>
                <MaterialIcons name="edit" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>الوصف الخاص (اختياري)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={product.customDescription}
                  onChangeText={(text) => setProduct((p) => ({ ...p, customDescription: text }))}
                  placeholder="وصف خاص للمنتج (يظهر بدل وصف الكاتالوج)"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>السعر (ر.ي) *</Text>
                <TextInput
                  style={styles.input}
                  value={product.price}
                  onChangeText={(text) => setProduct((p) => ({ ...p, price: text }))}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>الكمية بالمخزون</Text>
                <TextInput
                  style={styles.input}
                  value={product.stock}
                  onChangeText={(text) => setProduct((p) => ({ ...p, stock: text }))}
                  placeholder="مثال: 100"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>الحالة</Text>
                <TouchableOpacity
                  style={styles.toggleBtn}
                  onPress={() => setProduct((p) => ({ ...p, isAvailable: !p.isAvailable }))}
                >
                  <MaterialIcons
                    name={product.isAvailable ? "toggle-on" : "toggle-off"}
                    size={32}
                    color={product.isAvailable ? "#4CAF50" : "#888"}
                  />
                  <Text style={{ marginLeft: 10, fontFamily: "Cairo-Bold" }}>
                    {product.isAvailable ? "متوفر" : "غير متوفر"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialIcons name={productId ? "update" : "add-circle"} size={24} color="#FFF" />
                  <Text style={styles.submitButtonText}>
                    {productId ? "تحديث المنتج" : "إضافة المنتج"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TryRender>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: "#FFF",
    textAlign: "center",
    flex: 1,
  },
  content: { flex: 1 },
  imageContainer: { alignItems: "center", marginVertical: 25, paddingHorizontal: 20, position: "relative" },
  productImage: { width: 280, height: 200, borderRadius: 16, resizeMode: "contain" },
  imagePlaceholder: {
    width: 280, height: 200, borderRadius: 16, backgroundColor: "#F5F5F5",
    justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#DDD", borderStyle: "dashed",
  },
  imagePlaceholderText: { marginTop: 10, color: "#999", fontSize: 14 },
  imageEditBadge: {
    position: "absolute", bottom: -15, right: 100, backgroundColor: COLORS.primary,
    width: 45, height: 45, borderRadius: 22.5, justifyContent: "center", alignItems: "center",
  },
  form: { paddingHorizontal: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, color: "#333", fontFamily: "Cairo-Bold", direction: "rtl", marginBottom: 8 },
  select: { fontSize: 14, color: "#333", fontFamily: "Cairo-Bold", marginBottom: 8 },
  input: {
    backgroundColor: "#FFF", borderWidth: 1, borderColor: "#DDD", borderRadius: 10,
    paddingHorizontal: 15, paddingVertical: 12, fontFamily: "Cairo-Regular", fontSize: 16, color: "#333",
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  toggleBtn: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  submitButton: {
    flexDirection: "row", backgroundColor: COLORS.primary, marginHorizontal: 20, marginVertical: 30,
    paddingVertical: 15, borderRadius: 10, justifyContent: "center", alignItems: "center",
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: "#FFF", fontSize: 18, fontFamily: "Cairo-Bold", marginLeft: 10 },
});

export default AddProductScreen;
