import COLORS from "@/constants/colors";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../types/navigation";
import axiosInstance from "../../utils/api/axiosInstance";

const NUM_COLUMNS = 4;
const H_MARGIN = 5; // نفس marginHorizontal في gridCard
const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_SIZE = Math.floor(
  (SCREEN_WIDTH - NUM_COLUMNS * (H_MARGIN * 2)) / NUM_COLUMNS
);
interface Category {
  _id: string;
  name: string;
  image: string;
  displayIndex?: number;
  children?: Category[];
}

interface Props {
  onSelectCategory?: (categoryId: string, title: string) => void;
  sectionTitle?: string;
}

// ⚡ مسارات مخصصة (أضفنا الغاز/الماء)
const customRoutes = {
  "شي ان": "SheinScreen",
  اخدمني: "AkhdimniScreen",
  الغاز: "UtilityGasScreen",
  "وايت الماء": "UtilityWaterScreen",
  الوايت: "UtilityWaterScreen",
  "دبة الغاز": "UtilityGasScreen",
} as const;

const DeliveryCategories: React.FC<Props> = ({}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const qs = new URLSearchParams({
          withNumbers: "1",
          parent: "null",
        }).toString();

        const { data: rawData } = await axiosInstance.get(`/delivery/categories?${qs}`);
        let data = rawData;

        data = Array.isArray(data)
          ? data
              .filter((cat: any) => !cat.parent || cat.parent === null)
              .sort(
                (a: any, b: any) =>
                  (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) ||
                  a.name.localeCompare(b.name, "ar")
              )
          : [];

        setCategories(data);
        setLoading(false);
      } catch (error) {
        console.error("فشل في تحميل الفئات", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const fetchSubCategories = async (parentId: string) => {
    try {
      const { data } = await axiosInstance.get(
        `/delivery/categories/children/${parentId}?withNumbers=1`
      );
      return Array.isArray(data)
        ? data.sort(
            (a: any, b: any) =>
              (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) ||
              a.name.localeCompare(b.name, "ar")
          )
        : [];
    } catch (error) {
      console.error("فشل في تحميل الفئات الفرعية", error);
      return [];
    }
  };

  const handleCategoryPress = async (category: Category) => {
    // منع الضغط على شي ان
    if (category.name === "شي ان") {
      return;
    }

    const route = customRoutes[category.name as keyof typeof customRoutes];
    if (category.name === "مقاضي") {
      navigation.navigate("GroceryMainScreen", { categoryId: category._id });
      setShowAll(false);
      setShowSubModal(false);
      return;
    }
    if (route) {
      navigation.navigate(route as any);
      setShowAll(false);
      setShowSubModal(false);
      return;
    }
    const subs = await fetchSubCategories(category._id);
    if (subs.length > 0) {
      setSubCategories(subs);
      setShowSubModal(true);
    } else {
      navigation.navigate("CategoryDetails", {
        categoryId: category._id,
        categoryName: category.name,
      });
      setShowAll(false);
      setShowSubModal(false);
    }
  };

  // مصفوفة العرض + زر "عرض الكل"
  const categoriesWithShowAll = [
    ...categories.slice(0, 7),
    { _id: "showAll", name: "عرض الكل", image: "", isShowAll: true } as any,
  ];

  return (
    <View style={styles.container}>
      {/* شبكة الفئات */}
      <FlatList
        testID="categories-flatlist"
        data={categoriesWithShowAll}
        numColumns={4}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) =>
          "isShowAll" in item ? (
            <TouchableOpacity
              testID="show-all-button"
              style={[
                styles.gridCard,
                styles.showAllSliderCard,
                { backgroundColor: COLORS.background },
              ]}
              onPress={() => setShowAll(true)}
              activeOpacity={0.9}
            >
              <View
                style={[styles.showAllCircle, { borderColor: COLORS.primary }]}
              >
                <Icon
                  name="arrow-forward-ios"
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.sliderText}>عرض الكل</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              testID={`category-item-${item._id}`}
              style={[
                styles.gridCard,
                { backgroundColor: COLORS.background },
                item.name === "شي ان" && styles.disabledCard,
              ]}
              onPress={() => handleCategoryPress(item)}
              activeOpacity={item.name === "شي ان" ? 1 : 0.9}
              disabled={item.name === "شي ان"}
            >
              <Image
                source={{ uri: item.image }}
                style={[
                  styles.sliderImage,
                  item.name === "شي ان" && styles.disabledImage,
                ]}
              />
              <Text
                style={[
                  styles.sliderText,
                  { color: COLORS.blue },
                  item.name === "شي ان" && styles.disabledText,
                ]}
              >
                {item.name}
              </Text>
              {item.name === "شي ان" && (
                <View
                  style={[
                    styles.comingSoonBadge,
                    { backgroundColor: COLORS.blue },
                  ]}
                >
                  <Text style={styles.comingSoonText}>قريباً</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        }
        contentContainerStyle={styles.gridContent}
        scrollEnabled={false}
      />

      {/* مودال الفروع */}
      <Modal visible={showSubModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: COLORS.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: COLORS.blue }]}>
              الفئات الفرعية
            </Text>
            <FlatList
              testID="subcategories-flatlist"
              data={subCategories}
              numColumns={3}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  testID={`subcategory-item-${item._id}`}
                  style={[
                    styles.modalCategoryCard,
                    {
                      backgroundColor: COLORS.background,
                      borderColor: COLORS.lightGray,
                    },
                    item.name === "شي ان" && styles.disabledModalCard,
                  ]}
                  onPress={() => handleCategoryPress(item)}
                  disabled={item.name === "شي ان"}
                  activeOpacity={item.name === "شي ان" ? 1 : 0.9}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={[
                      styles.image,
                      item.name === "شي ان" && styles.disabledImage,
                    ]}
                  />
                  <Text
                    style={[
                      styles.text,
                      { color: COLORS.primary },
                      item.name === "شي ان" && styles.disabledText,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.name === "شي ان" && (
                    <View
                      style={[
                        styles.comingSoonBadge,
                        { backgroundColor: COLORS.primary },
                      ]}
                    >
                      <Text style={styles.comingSoonText}>قريباً</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={{
                paddingBottom: 16,
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
            />
            <TouchableOpacity
              testID="close-submodal-button"
              style={[styles.closeBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => setShowSubModal(false)}
            >
              <Text style={styles.closeBtnText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* مودال كل الفئات */}
      <Modal visible={showAll} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: COLORS.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: COLORS.blue }]}>
              كل الفئات
            </Text>
            <FlatList
              testID="all-categories-flatlist"
              data={categories}
              numColumns={3}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  testID={`all-category-item-${item._id}`}
                  style={[
                    styles.modalCategoryCard,
                    {
                      backgroundColor: COLORS.background,
                      borderColor: COLORS.lightGray,
                    },
                    item.name === "شي ان" && styles.disabledModalCard,
                  ]}
                  onPress={() => handleCategoryPress(item)}
                  disabled={item.name === "شي ان"}
                  activeOpacity={item.name === "شي ان" ? 1 : 0.9}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={[
                      styles.image,
                      item.name === "شي ان" && styles.disabledImage,
                    ]}
                  />
                  <Text
                    style={[
                      styles.text,
                      { color: COLORS.primary },
                      item.name === "شي ان" && styles.disabledText,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.name === "شي ان" && (
                    <View
                      style={[
                        styles.comingSoonBadge,
                        { backgroundColor: COLORS.primary },
                      ]}
                    >
                      <Text style={styles.comingSoonText}>قريباً</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={{
                paddingBottom: 16,
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
            />
            <TouchableOpacity
              testID="close-allmodal-button"
              style={[styles.closeBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => setShowAll(false)}
            >
              <Text style={styles.closeBtnText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DeliveryCategories;

const styles = StyleSheet.create({
  container: {},
  // 🔶 تنسيق شريط الدخول السريع

  title: {
    fontSize: 12,
    fontFamily: "Cairo-Bold",
    textAlign: "right",
    marginBottom: 20,
  },
  gridContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  gridCard: {
    width: CARD_SIZE,
    alignItems: "center",
    justifyContent: "flex-start",
    marginHorizontal: 5,
    marginVertical: 5,
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  sliderImage: {
    width: 80,
    height: 60,
    resizeMode: "contain",
    marginBottom: 2,
  },
  sliderText: {
    fontSize: 10,
    fontFamily: "Cairo-Bold",
    textAlign: "center",
  },
  showAllSliderCard: {
    justifyContent: "center",
    alignItems: "center",
  },
  showAllCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  image: {
    width: 35,
    height: 35,
    marginBottom: 2,
    resizeMode: "contain",
  },
  text: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.blue,
    textAlign: "center",
    marginTop: 2,
  },
  loader: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    left: 6,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  badgeText: {
    color: "#fff",
    fontFamily: "Cairo-Bold",
    fontSize: 11,
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 18,
    padding: 14,
    width: "90%",
    maxHeight: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  modalCategoryCard: {
    width: 85,
    alignItems: "center",
    justifyContent: "center",
    margin: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 0.5,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1.5,
  },
  closeBtn: {
    marginTop: 12,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 32,
  },
  closeBtnText: {
    color: "#fff",
    fontFamily: "Cairo-Bold",
    fontSize: 15,
  },
  // Disabled styles
  disabledCard: {
    opacity: 0.6,
  },
  disabledImage: {
    opacity: 0.5,
  },
  disabledText: {},
  disabledModalCard: {
    opacity: 0.6,
  },
  comingSoonBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingSoonText: {
    color: "#fff",
    fontFamily: "Cairo-Bold",
    fontSize: 8,
  },
});
