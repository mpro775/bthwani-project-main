import {
  addUserAddress,
  deleteUserAddress,
  fetchUserProfile,
  setDefaultUserAddress,
  updateUserAddress,
} from "@/api/userApi";
import COLORS from "@/constants/colors";
import { RootStackParamList } from "@/types/navigation";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Address = {
  _id: string;
  label: string;
  city: string;
  street: string;
  location?: { lat: number; lng: number };
};

const YEMEN_CITIES = [
  "صنعاء",
  "عدن",
  "تعز",
  "الحديدة",
  "إب",
  "المكلا",
  "ذمار",
  "البيضاء",
  "عمران",
  "صعدة",
  "مارب",
  "حجة",
  "لحج",
  "الضالع",
  "المحويت",
  "ريمة",
  "شبوة",
  "الجوف",
  "حضرموت",
  "سقطرى",
];

type DeliveryRouteProp = RouteProp<RootStackParamList, "DeliveryAddresses">;

export default function DeliveryAddressesScreen() {
  const isFocused = useIsFocused();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const flatListRef = useRef<FlatList>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<DeliveryRouteProp>();
  const insets = useSafeAreaInsets();

  // ✅ وضع النموذج: إضافة/تعديل
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [formVisible, setFormVisible] = useState(false);

  // حقول النموذج
  const [label, setLabel] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const scaleAnim = useState(new Animated.Value(1))[0];

  const loadData = async () => {
    try {
      const user = await fetchUserProfile();
      if (user?.addresses) setAddresses(user.addresses);
      if (user?.defaultAddressId) setSelectedAddressId(user.defaultAddressId);
    } catch {
      Alert.alert("خطأ", "فشل تحميل العناوين من السيرفر");
    }
    // استرجاع بيانات محفوظة مؤقتًا (من شاشة الخريطة)
    const savedLabel = await AsyncStorage.getItem("temp_label");
    const savedCity = await AsyncStorage.getItem("temp_city");
    const savedStreet = await AsyncStorage.getItem("temp_street");
    const savedLocation = await AsyncStorage.getItem("temp_location");
    if (savedLabel) setLabel(savedLabel);
    if (savedCity) setCity(savedCity);
    if (savedStreet) setStreet(savedStreet);
    if (savedLocation) setLocation(JSON.parse(savedLocation));

    await AsyncStorage.multiRemove([
      "temp_label",
      "temp_city",
      "temp_street",
      "temp_location",
    ]);
  };

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused]);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ✅ فتح نموذج الإضافة
  const openAdd = () => {
    setMode("add");
    setEditingId(null);
    setLabel("");
    setCity("");
    setStreet("");
    setLocation(null);
    setFormVisible(true);
  };

  // ✅ فتح نموذج التعديل
  const openEdit = (addr: Address) => {
    setMode("edit");
    setEditingId(addr._id);
    setLabel(addr.label);
    setCity(addr.city);
    setStreet(addr.street);
    setLocation(addr.location ?? null);
    setFormVisible(true);
  };

  // ✅ حفظ (إضافة/تعديل)
  const handleSaveAddress = async () => {
    animatePress();
    if (!label || !city || !street) {
      Alert.alert("تنبيه", "الرجاء تعبئة جميع الحقول المطلوبة");
      return;
    }
    try {
      const payload = {
        label: label.trim(),
        city: city.trim(),
        street: street.trim(),
        location: location
          ? { lat: location.lat, lng: location.lng }
          : undefined,
      };

      if (mode === "add") {
        await addUserAddress(payload);
        Alert.alert("تم", "تمت إضافة العنوان بنجاح");
      } else {
        await updateUserAddress({ _id: editingId!, ...payload });
        Alert.alert("تم", "تم حفظ التعديلات");
      }

      const user = await fetchUserProfile();
      setAddresses(user.addresses);

      // إعادة ضبط النموذج
      setMode("add");
      setEditingId(null);
      setLabel("");
      setCity("");
      setStreet("");
      setLocation(null);
      setFormVisible(false);

      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100
      );
      Keyboard.dismiss();
    } catch (err) {
      Alert.alert(
        "خطأ",
        mode === "add" ? "فشل حفظ العنوان" : "فشل تعديل العنوان"
      );
      console.error("❌", err);
    }
  };

  const setAsDefault = async (id: string) => {
    const addr = addresses.find((a) => a._id === id);
    if (!addr) return;
    try {
      await setDefaultUserAddress({ _id: addr._id });
      setSelectedAddressId(id);
      Alert.alert("تم", "تم تعيين العنوان كافتراضي");
    } catch (err) {
      console.error("❌ فشل التعيين:", err);
      Alert.alert("خطأ", "فشل تعيين العنوان كافتراضي");
    }
  };

  const handleDelete = (index: number) => {
    const id = addresses[index]._id;
    Alert.alert("تأكيد الحذف", "هل أنت متأكد؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          await deleteUserAddress(id);
          const user = await fetchUserProfile();
          setAddresses(user.addresses);
        },
      },
    ]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          {/* Header */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.primary]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.headerTitle}>العناوين المحفوظة</Text>
          </LinearGradient>

          {/* Address List */}
          <FlatList
            ref={flatListRef}
            data={addresses}
            keyExtractor={(item) => item._id}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: addresses.length > 0 ? 250 : 20 },
            ]}
            renderItem={({ item, index }) => (
              <View style={styles.addressCard}>
                <View style={styles.addressInfo}>
                  <View style={styles.addressHeader}>
                    <MaterialIcons
                      name="location-on"
                      size={20}
                      color="#D84315"
                    />
                    <Text style={styles.addressLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.addressText}>{item.city}</Text>
                  <Text style={styles.addressText}>{item.street}</Text>
                  {item.location && (
                    <Text style={styles.locationText}>
                      الإحداثيات: {item.location.lat.toFixed(4)},{" "}
                      {item.location.lng.toFixed(4)}
                    </Text>
                  )}

                  {/* زر العنوان الافتراضي */}
                  <TouchableOpacity
                    style={{
                      marginTop: 8,
                      alignSelf: "flex-start",
                      backgroundColor:
                        selectedAddressId === item._id ? "#4CAF50" : "#E0E0E0",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                    onPress={() => setAsDefault(item._id)}
                  >
                    <Text
                      style={{
                        color: selectedAddressId === item._id ? "#FFF" : "#000",
                      }}
                    >
                      {selectedAddressId === item._id
                        ? "العنوان الافتراضي"
                        : "تعيين كافتراضي"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* أزرار تعديل/حذف */}
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEdit(item)}
                  >
                    <Ionicons name="create-outline" size={20} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(index)}
                  >
                    <Ionicons name="trash" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="location-off" size={50} color="#E0E0E0" />
                <Text style={styles.emptyText}>لا توجد عناوين مسجلة</Text>
              </View>
            }
          />

          {/* نموذج إضافة/تعديل */}
          {formVisible && (
            <Modal
              visible={formVisible}
              animationType="slide"
              transparent
              onRequestClose={() => {
                setFormVisible(false);
                setMode("add");
                setEditingId(null);
              }}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.sectionTitle}>
                    {mode === "add" ? "إضافة عنوان جديد" : "تعديل العنوان"}
                  </Text>

                  {/* الحقول */}
                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name="label"
                      size={20}
                      color={COLORS.blue}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="اسم العنوان"
                      placeholderTextColor={COLORS.blue}
                      value={label}
                      onChangeText={setLabel}
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name="location-city"
                      size={20}
                      color={COLORS.blue}
                      style={styles.inputIcon}
                    />
                    <TouchableOpacity
                      style={styles.dropdownInput}
                      onPress={() => {
                        Keyboard.dismiss();
                        setCityPickerVisible(true);
                      }}
                    >
                      <Text
                        style={{
                          color: COLORS.blue,
                          fontFamily: "Cairo-Regular",
                        }}
                      >
                        {city || "اختر محافظة..."}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name="map"
                      size={20}
                      color={COLORS.blue}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="وصف الشارع"
                      placeholderTextColor={COLORS.blue}
                      value={street}
                      onChangeText={setStreet}
                      style={styles.input}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={async () => {
                      await AsyncStorage.multiSet([
                        ["temp_label", label],
                        ["temp_city", city],
                        ["temp_street", street],
                        ["map_mode", mode], // ✅ مهم
                      ]);
                      navigation.navigate("SelectLocation", {
                        storageKey: "temp_location",
                        title:
                          mode === "add"
                            ? "حدد موقع العنوان"
                            : "عدّل موقع العنوان",
                      });
                    }}
                  >
                    <LinearGradient
                      colors={
                        location
                          ? [COLORS.primary, COLORS.primary]
                          : [COLORS.blue, COLORS.blue]
                      }
                      style={styles.buttonGradient}
                    >
                      <MaterialIcons
                        name={location ? "check-circle" : "map"}
                        size={20}
                        color="#FFF"
                      />
                      <Text style={styles.buttonText}>
                        {location
                          ? "تم تحديد الموقع"
                          : "تحديد/تعديل الموقع من الخريطة"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleSaveAddress}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primary]}
                      style={styles.buttonGradient}
                    >
                      <MaterialIcons
                        name={mode === "add" ? "add-location" : "save"}
                        size={20}
                        color="#FFF"
                      />
                      <Text style={styles.buttonText}>
                        {mode === "add" ? "إضافة العنوان" : "حفظ التعديلات"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setFormVisible(false);
                      setMode("add");
                      setEditingId(null);
                    }}
                    style={{ marginTop: 10 }}
                  >
                    <Text style={{ textAlign: "center", color: "#888" }}>
                      إغلاق
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          {/* اختيار المحافظة */}
          <Modal
            visible={cityPickerVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setCityPickerVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPressOut={() => setCityPickerVisible(false)}
            >
              <View style={styles.cityModalContainer}>
                <Text style={styles.sectionTitle}>اختر المحافظة</Text>
                <FlatList
                  data={YEMEN_CITIES}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setCity(item);
                        setCityPickerVisible(false);
                      }}
                      style={styles.cityItem}
                    >
                      <Text style={styles.cityText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity onPress={() => setCityPickerVisible(false)}>
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#888",
                      marginTop: 10,
                    }}
                  >
                    إغلاق
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* زر عائم لإضافة عنوان */}
          <TouchableOpacity
            style={[
              styles.floatingButton,
              {
                // ارفع الزر فوق الـ home indicator / أزرار النظام
                bottom: 24 + Math.max(insets.bottom, 12),
                // خليه كمان بعيد عن الحافة اليمنى لو في notch جانبي نادرًا
                right: 24 + Math.max(insets.right, 0),
              },
            ]}
            onPress={openAdd}
          >
            <Ionicons name="add" size={30} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
  },
  header: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 22,
    color: "#FFF",
    textAlign: "center",
  },
  listContent: { paddingHorizontal: 20, paddingTop: 10 },
  addressCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  addressInfo: { flex: 1, marginRight: 10 },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  addressLabel: {
    fontFamily: "Cairo-Bold",
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  addressText: {
    fontFamily: "Cairo-Regular",
    color: "#555",
    marginBottom: 4,
  },
  locationText: {
    fontFamily: "Cairo-Regular",
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: "#D32F2F",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#1976D2",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: "Cairo-Regular",
    color: "#888",
    marginTop: 10,
    fontSize: 16,
  },
  sectionTitle: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 18,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  inputIcon: { marginLeft: 10 },
  input: {
    flex: 1,
    fontFamily: "Cairo-Regular",
    color: COLORS.blue,
    textAlign: "right",
    height: "100%",
  },
  dropdownInput: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    justifyContent: "center",
  },
  locationButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
  },
  addButton: { borderRadius: 12, overflow: "hidden", elevation: 3 },
  buttonGradient: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },
  buttonText: {
    fontFamily: "Cairo-SemiBold",
    color: "#FFF",
    fontSize: 16,
    marginRight: 10,
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  // Modal المحافظات
  cityModalContainer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "60%",
  },
  cityItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  cityText: { fontSize: 16, fontFamily: "Cairo-Regular", textAlign: "center" },
});
