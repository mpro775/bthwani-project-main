import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { RootStackParamList } from "@/types/navigation";
import {
  KawaderPortfolioItem,
  getMyPortfolio,
  addPortfolioItem,
  removePortfolioItem,
  uploadKawaderPortfolioImage,
} from "@/api/kawaderApi";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "KawaderPortfolio"
>;

const KawaderPortfolioScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [items, setItems] = useState<KawaderPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [caption, setCaption] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyPortfolio();
      setItems(res.items ?? []);
    } catch (e) {
      console.error("خطأ في تحميل المعرض:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("تنبيه", "نحتاج صلاحية الوصول للصور لإضافة صورة.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddSubmit = async () => {
    if (!caption.trim() && !imageUri) {
      Alert.alert("تنبيه", "أضف وصفاً أو صورة على الأقل.");
      return;
    }
    setAdding(true);
    try {
      let mediaIds: string[] = [];
      if (imageUri) {
        const id = await uploadKawaderPortfolioImage(imageUri);
        if (id) mediaIds.push(id);
      }
      await addPortfolioItem(mediaIds, caption.trim() || undefined);
      setAddModalVisible(false);
      setCaption("");
      setImageUri(null);
      loadItems();
    } catch (e: any) {
      Alert.alert("خطأ", e?.response?.data?.message || "فشل في إضافة العنصر");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (itemId: string) => {
    Alert.alert("حذف عنصر", "هل تريد حذف هذا العنصر من المعرض؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          setDeletingId(itemId);
          try {
            await removePortfolioItem(itemId);
            setItems((prev) => prev.filter((i) => i._id !== itemId));
          } catch (e: any) {
            Alert.alert("خطأ", e?.response?.data?.message || "فشل الحذف");
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const getFirstMediaUrl = (item: KawaderPortfolioItem): string | null => {
    const first = item.mediaIds?.[0];
    if (!first) return null;
    if (typeof first === "object" && first && "url" in first)
      return (first as any).url ?? null;
    return null;
  };

  const renderItem = ({ item }: { item: KawaderPortfolioItem }) => {
    const thumbUrl = getFirstMediaUrl(item);
    const isDeleting = deletingId === item._id;
    return (
      <View style={styles.card}>
        {thumbUrl ? (
          <Image source={{ uri: thumbUrl }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Ionicons name="images-outline" size={40} color={COLORS.gray} />
          </View>
        )}
        <View style={styles.cardBody}>
          {item.caption ? (
            <Text style={styles.cardCaption} numberOfLines={3}>
              {item.caption}
            </Text>
          ) : (
            <Text style={styles.cardCaptionEmpty}>بدون وصف</Text>
          )}
          <Text style={styles.cardDate}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("ar-SA")
              : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item._id)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={COLORS.danger} />
          ) : (
            <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل المعرض...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>معرضي</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={56} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>لا عناصر في المعرض</Text>
            <Text style={styles.emptySub}>
              أضف أعمالك أو مشاريعك ليعرضها زوار صفحتك
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => setAddModalVisible(true)}
            >
              <Text style={styles.emptyAddBtnText}>إضافة عنصر</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إضافة عنصر للمعرض</Text>
            <TextInput
              style={styles.modalInput}
              value={caption}
              onChangeText={setCaption}
              placeholder="وصف العمل (اختياري)"
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={styles.pickImageBtn}
              onPress={handlePickImage}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.pickedImage} />
              ) : (
                <>
                  <Ionicons
                    name="image-outline"
                    size={32}
                    color={COLORS.primary}
                  />
                  <Text style={styles.pickImageText}>إضافة صورة</Text>
                </>
              )}
            </TouchableOpacity>
            {imageUri ? (
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => setImageUri(null)}
              >
                <Text style={styles.removeImageText}>إزالة الصورة</Text>
              </TouchableOpacity>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setAddModalVisible(false);
                  setCaption("");
                  setImageUri(null);
                }}
              >
                <Text style={styles.modalCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  adding && styles.modalSubmitDisabled,
                ]}
                onPress={handleAddSubmit}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalSubmitText}>إضافة</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textLight },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  addBtn: { padding: 8 },
  listContent: { padding: 16 },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  cardImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: { flex: 1, marginLeft: 12 },
  cardCaption: { fontSize: 14, color: COLORS.text, marginBottom: 4 },
  cardCaptionEmpty: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  cardDate: { fontSize: 12, color: COLORS.textLight },
  deleteBtn: { padding: 8 },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySub: { fontSize: 14, color: COLORS.textLight, marginTop: 8 },
  emptyAddBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  emptyAddBtnText: { fontSize: 16, fontWeight: "600", color: COLORS.white },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 72,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  pickImageBtn: {
    height: 120,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  pickedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  pickImageText: { marginTop: 8, fontSize: 14, color: COLORS.primary },
  removeImageText: { fontSize: 14, color: COLORS.danger, marginBottom: 12 },
  removeImageBtn: { alignSelf: "flex-start", marginBottom: 8 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  modalCancelText: { fontSize: 16, color: COLORS.textLight },
  modalSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalSubmitDisabled: { opacity: 0.6 },
  modalSubmitText: { fontSize: 16, fontWeight: "600", color: COLORS.white },
});

export default KawaderPortfolioScreen;
