// src/components/DeliveryBannerSlider.tsx
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import axiosInstance from "../../utils/api/axiosInstance";

const COLORS = { primary: "#D84315", background: "#FFFFFF" };

type PromotionPlacement =
  | "home_hero"
  | "home_strip"
  | "category_header"
  | "category_feed"
  | "store_header"
  | "search_banner"
  | "cart"
  | "checkout";

type Channel = "app" | "web";

interface PromotionBanner {
  _id: string;
  image: string;
  link?: string;
  target: "product" | "store" | "category";
  product?: { _id: string; name?: string };
  store?: { _id: string; name?: string };
  category?: { _id: string; name?: string };
  placements?: PromotionPlacement[];
  channels?: Channel[];
  cities?: string[];
  isActive?: boolean;
}

type Props = {
  placement?: PromotionPlacement; // افتراضي: home_hero
  channel?: Channel; // افتراضي: app
  city?: string; // اختياري
  categoryId?: string; // ⭐ جديد
  storeId?: string; // اختياري للمستقبل
  productId?: string; // اختياري للمستقبل
  autoplayMs?: number;
};
const DeliveryBannerSlider: React.FC<Props> = ({
  placement = "home_hero",
  channel = "app",
  city,
  categoryId,
  storeId,
  productId,
  autoplayMs = 3000,
}) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const [banners, setBanners] = useState<PromotionBanner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const CARD_INSET = 16; // الهامش يمين ويسار
  const CARD_RADIUS = 16; // تدوير الزوايا
  const CARD_W = width - CARD_INSET * 2;
  const CARD_H = Math.round(CARD_W * 0.48); // نسبة الارتفاع, عدّلها كما تحب

  // جلب العروض
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axiosInstance.get<PromotionBanner[]>("/delivery/promotions");

        const filtered = data.filter((p) => {
          const okPlacement =
            !p.placements?.length || p.placements.includes(placement);
          const okChannel = !p.channels?.length || p.channels.includes(channel);
          const okCity =
            !city ||
            !p.cities?.length ||
            p.cities.some((c) => c.toLowerCase() === city.toLowerCase());

          // ⭐ مطابقة الهدف (عند تزويد معرّف معيّن فقط)
          const anyTargetId = !!(categoryId || storeId || productId);
          const targetMatch =
            (categoryId &&
              p.target === "category" &&
              p.category?._id === categoryId) ||
            (storeId && p.target === "store" && p.store?._id === storeId) ||
            (productId &&
              p.target === "product" &&
              p.product?._id === productId);

          return (
            okPlacement &&
            okChannel &&
            okCity &&
            (!anyTargetId || !!targetMatch)
          );
        });

        if (mounted) setBanners(filtered);
      } catch (err) {
        console.error("Fetch promotions error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [placement, channel, city, categoryId, storeId, productId]);

  // تشغيل تلقائي
  useEffect(() => {
    if (!banners.length) return;
    const iv = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, autoplayMs);
    return () => clearInterval(iv);
  }, [banners.length, width, autoplayMs]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  };

  const handlePress = (b: PromotionBanner) => {
    // 1) لو عنده رابط خارجي
    if (b.link?.startsWith("http")) {
      Linking.openURL(b.link);
      return;
    }
    // 2) تنقل داخلي بناءً على الهدف
    if (b.target === "store" && b.store?._id) {
      navigation.navigate("BusinessDetails", { businessId: b.store._id }); // ✅
      return;
    }
    if (b.target === "category" && b.category?._id) {
      navigation.navigate("CategoryDetails", { categoryId: b.category._id }); // تأكّد أن الشاشة تستقبل هذا
      return;
    }
    if (b.target === "product" && b.product?._id) {
      navigation.navigate("UniversalProductDetails", {
        product: { _id: b.product._id },
      }); // أو productId حسب شاشتك
      return;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loader, { width }]}>
        <ActivityIndicator
          testID="loading-indicator"
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }

  if (!banners.length) {
    return <View style={{ height: 8 }} />; // مساحة بسيطة إن لم يوجد عروض
  }

  return (
    <View style={styles.container}>
      <ScrollView
        testID="banner-scrollview"
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ref={scrollRef}
        snapToInterval={width} // نبقي الصفحة بعرض الشاشة
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: 4 }}
      >
        {banners.map((b) => (
          // صفحة بعرض الشاشة، نضيف بداخلها padding أفقي للهامش
          <View key={b._id} style={{ width, paddingHorizontal: CARD_INSET }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handlePress(b)}
              style={{
                borderRadius: CARD_RADIUS,
                backgroundColor: COLORS.background,
                overflow: "hidden", // عشان يشتغل الـ borderRadius مع الصورة على أندرويد
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowOffset: { width: 0, height: 6 },
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <Image
                source={{ uri: b.image }}
                accessibilityLabel={b.target}
                style={{ width: CARD_W, height: CARD_H, resizeMode: "cover" }}
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex ? styles.dotActive : null]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  loader: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DeliveryBannerSlider;
