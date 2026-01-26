import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import COLORS from "@/constants/colors";
import { RootStackParamList } from "@/types/navigation";
import axiosInstance from "@/utils/api/axiosInstance";
import {
  DeliveryStoreWithDistance,
  enrichStoresWithDistance,
} from "@/utils/enrichStoresWithDistance";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "BusinessDetails"
>;

interface Props {
  onSelect?: (store: DeliveryStoreWithDistance) => void;
  sectionTitle?: string;
  categoryId?: string; // اختياري: لو حبيت تحصر العروض على فئة
}

const pickBestPromo = (
  arr?: { _id: string; value?: number; valueType?: "percentage" | "fixed" }[]
) => {
  if (!arr || !arr.length) return undefined;
  const perc = arr
    .filter((p) => p.valueType === "percentage")
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  if (perc.length) return perc[0];
  const fixed = arr
    .filter((p) => p.valueType === "fixed")
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  return fixed[0] || arr[0];
};

const DeliveryDeals: React.FC<Props> = ({
  onSelect,
  sectionTitle = "العروض",
  categoryId,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [stores, setStores] = useState<DeliveryStoreWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;

  // أبعاد السلايدر
  const SIDE = 16;
  const GAP = 12;
  const CARD_W = Math.min(120, Math.max(96, width * 0.28));
  const LOGO = CARD_W - 28;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // 1) اجلب المتاجر (اختياري: حصر بفئة)
        const params = categoryId
          ? `?categoryId=${encodeURIComponent(categoryId)}`
          : "";
        const { data } = await axiosInstance.get(`/delivery/stores${params}`);
        const arr: any[] = Array.isArray(data) ? data : [];

        // إزالة تكرارات
        const unique = new Map<string, any>();
        arr.forEach((s: any) => {
          if (s?._id && !unique.has(s._id)) unique.set(s._id, s);
        });

        const base = await enrichStoresWithDistance(
          Array.from(unique.values())
        );
        if (!base.length) {
          setStores([]);
          return;
        }

        // 2) اجلب العروض لكل المتاجر
        const idsCsv = base.map((s) => s._id).join(",");
        const { data: promoMap } = await axiosInstance.get(
          `/delivery/promotions/by-stores?ids=${encodeURIComponent(
            idsCsv
          )}&channel=app`
        );
        const getStorePromos = (sid: string) =>
          Array.isArray(promoMap)
            ? promoMap.filter((p: any) => p.store === sid)
            : promoMap?.[sid];

        // 3) خُذ فقط المتاجر التي لديها عرض + أضف شارة الخصم
        const withPromos = base
          .map((s: any) => {
            const best = pickBestPromo(getStorePromos(s._id));
            if (!best) return null;
            s.promoBadge =
              best.valueType === "percentage"
                ? `خصم ${best.value}%`
                : `خصم ${best.value} ﷼`;
            s.promoPercent =
              best.valueType === "percentage" ? best.value : undefined;
            s.promoId = best._id;
            return s;
          })
          .filter(Boolean) as DeliveryStoreWithDistance[];

        setStores(withPromos);
      } catch (e) {
        console.error("فشل في تحميل قسم العروض:", e);
        setStores([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId]);

  if (loading) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (stores.length === 0) {
    return (
      <View style={s.container}>
        <Text style={s.title}>{sectionTitle}</Text>
        <Text style={{ color: COLORS.secondary, textAlign: "center" }}>
          لا توجد عروض حالياً.
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>{sectionTitle}</Text>

      <Animated.FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={stores}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: SIDE }}
        snapToInterval={CARD_W + GAP}
        decelerationRate="fast"
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (CARD_W + GAP),
            index * (CARD_W + GAP),
            (index + 1) * (CARD_W + GAP),
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
            extrapolate: "clamp",
          });

          const logoUri = (item as any).logo || (item as any).image;
          const meta: string[] = [];
          if ((item as any).distance) meta.push((item as any).distance);
          if ((item as any).time) meta.push((item as any).time);

          return (
            <Animated.View
              style={{ width: CARD_W, transform: [{ scale }], opacity }}
            >
              <Pressable
                android_ripple={{ color: "#eee", borderless: false }}
                style={[s.card, { paddingTop: 14, paddingBottom: 10 }]}
                onPress={() => {
                  const sObj = {
                    ...item,
                    distance:
                      (item as any).distance ??
                      (item as any).distanceText ??
                      (item as any).distanceLabel ??
                      (item as any).distance_km_text ??
                      undefined,
                    time:
                      (item as any).time ??
                      (item as any).durationText ??
                      (item as any).etaLabel ??
                      (item as any).duration_min_text ??
                      undefined,
                  };

                  if (onSelect) onSelect(sObj);
                  else
                    navigation.navigate("BusinessDetails", { business: sObj });
                }}
              >
                {/* بادج العرض (يمين) */}
                {(item as any).promoBadge ? (
                  <View style={[s.badge, s.badgeRight, s.promoBadge]}>
                    <Text style={s.badgeText}>{(item as any).promoBadge}</Text>
                  </View>
                ) : null}

                {/* الشعار */}
                <View style={s.logoWrap}>
                  <Image
                    source={{ uri: logoUri }}
                    style={[
                      s.logo,
                      { borderRadius: LOGO / 2 },
                      { width: LOGO, height: LOGO },
                    ]}
                    resizeMode="contain"
                  />
                </View>

                {/* الاسم + معلومات بسيطة */}
                <Text style={s.name} numberOfLines={1}>
                  {item.name}
                </Text>
                {meta.length > 0 && (
                  <Text style={s.meta} numberOfLines={1}>
                    {meta.join(" • ")}
                  </Text>
                )}
              </Pressable>
            </Animated.View>
          );
        }}
      />
    </View>
  );
};

export default DeliveryDeals;

const s = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingTop: 14,
    paddingBottom: 8,
  },
  loader: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    color: COLORS.primary,
    fontFamily: "Cairo-Bold",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  card: {
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.lightGray,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  logo: { backgroundColor: "#FFFFFF" },
  name: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.text,
    fontFamily: "Cairo-SemiBold",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  meta: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.gray,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  badge: {
    position: "absolute",
    top: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 2,
    elevation: 2,
  },
  badgeRight: { right: 8 },
  promoBadge: { backgroundColor: COLORS.danger },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Cairo-Bold",
  },
});
