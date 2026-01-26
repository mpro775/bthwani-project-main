import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Address = {
  id: string;
  label: string;
  city: string;
  street: string;
};

interface DeliveryHeaderProps {
  showBackButton?: boolean;
}

const DeliveryHeader = ({ showBackButton = false }: DeliveryHeaderProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation<any>();

  const fetchAddresses = async () => {
    try {
      const stored = await AsyncStorage.getItem("user_addresses");
      const parsed = stored ? JSON.parse(stored) : [];
      setAddresses(parsed);

      const selectedId = await AsyncStorage.getItem("selected_address_id");
      if (selectedId) {
        setSelectedAddressId(selectedId);
      } else if (parsed.length > 0) {
        setSelectedAddressId(parsed[0].id);
        await AsyncStorage.setItem("selected_address_id", parsed[0].id);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const selectAddress = async (id: string) => {
    setSelectedAddressId(id);
    await AsyncStorage.setItem("selected_address_id", id);
    setModalVisible(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) || null;

  return (
    <LinearGradient
      colors={["#FF500D", "#FF500D"]}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerRow}>
        {/* زر الرجوع أو أيقونة السلة */}
        {showBackButton ? (
          <TouchableOpacity
            testID="back-button"
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            testID="cart-button"
            style={styles.iconButton}
            onPress={() => navigation.navigate("CartScreen")}
            activeOpacity={0.8}
          >
            <Ionicons name="basket" size={22} color="#FFF" />
          </TouchableOpacity>
        )}

        {/* كلمة بثواني في الوسط */}
        <View style={styles.centerTitleWrap}>
          <Text style={styles.centerTitle}>بثواني</Text>
        </View>

        {/* أيقونة العناوين يسار */}
        <TouchableOpacity
          testID="location-button"
          style={styles.iconButton}
          onPress={() =>
            addresses.length === 0
              ? navigation.navigate("DeliveryAddresses")
              : setModalVisible(true)
          }
          activeOpacity={0.8}
        >
          <Ionicons name="location-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 🔹 مكان عرض العنوان الحالي أو الافتراضي */}
      <View style={styles.locationContainer}>
        {loading ? (
          <ActivityIndicator
            testID="loading-indicator"
            size="small"
            color="#FFF"
          />
        ) : selectedAddress ? (
          <>
            <Text style={styles.deliveryText}>{selectedAddress.label}</Text>
            <Text style={styles.addressText}>
              {selectedAddress.city}، {selectedAddress.street}
            </Text>
          </>
        ) : (
          <Text style={styles.deliveryText}> </Text>
        )}
      </View>

      {/* حقل البحث أسفل الهيدر */}
      <TouchableOpacity
        testID="search-bar"
        style={styles.searchBar}
        onPress={() => navigation.navigate("DeliverySearch")}
        activeOpacity={0.9}
      >
        <Ionicons
          name="search"
          size={18}
          color="#FF7A00"
          style={{ marginLeft: 6 }}
        />
        <Text style={styles.searchPlaceholder}>ابحث عن مطعم أو منتج...</Text>
      </TouchableOpacity>

      {/* الكيرف السفلي */}
      <View style={styles.curve} />

      {/* قائمة العناوين (المودال) */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
              اختر عنوان التوصيل
            </Text>
            <FlatList
              testID="addresses-flatlist"
              data={addresses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  testID={`address-item-${item.id}`}
                  style={styles.addressItem}
                  onPress={() => selectAddress(item.id)}
                >
                  <Text style={styles.addressText}>{item.label}</Text>
                  <Text style={styles.streetText}>
                    {item.city}، {item.street}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
};

export default DeliveryHeader;

const styles = StyleSheet.create({
  gradientContainer: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    paddingBottom: 12,
    paddingTop: 0,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 2,
  },
  iconButton: {
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 16,
    padding: 7,
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
  },
  centerTitleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTitle: {
    color: "#FFF",
    fontFamily: "Cairo-Bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  searchBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginHorizontal: 12,
    paddingVertical: 7,
    paddingHorizontal: 12,
    elevation: 1,
  },
  searchPlaceholder: {
    color: "#888",
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    flex: 1,
  },
  curve: {
    position: "absolute",
    bottom: -32,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 1,
  },
  locationContainer: {
    marginTop: 6,
  },
  deliveryText: {},
  addressText: {
    fontFamily: "Cairo-Regular",
    fontSize: 12,
    color: "#FFF",
    marginLeft: 4,
  },
  streetText: {
    fontFamily: "Cairo-Regular",
    fontSize: 12,
    color: "#FFE0B2",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    maxHeight: 300,
  },
  addressItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
});
