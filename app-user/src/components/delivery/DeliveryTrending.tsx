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
import { RootStackParamList } from "../../types/navigation";
import axiosInstance from "../../utils/api/axiosInstance";
import {
  DeliveryStoreWithDistance,
  enrichStoresWithDistance,
} from "../../utils/enrichStoresWithDistance";

import COLORS from "../../constants/colors";

// دالة اختيار أفضل عرض
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

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "BusinessDetails"
>;

interface Props {
  onSelect?: (store: DeliveryStoreWithDistance) => void;
  sectionTitle?: string;
}

const DeliveryTrending: React.FC<Props> = ({
  onSelect,
  sectionTitle = "الرائج",
}) => {
  const [stores, setStores] = useState<DeliveryStoreWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;

  // أبعاد السلايدر
  const SIDE = 16; // padding جانبي
  const GAP = 12; // مسافة بين العناصر
  const CARD_W = Math.min(120, Math.max(96, width * 0.28));
  const LOGO = CARD_W - 28; // قطر/حجم الشعار

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // 1) اجلب المتاجر الرائجة
        const { data } = await axiosInstance.get(`/delivery/stores`);

        const trending = Array.isArray(data)
          ? data.filter((s: any) => s?.isTrending === true)
          : [];

        // إزالة التكرار
        const unique = new Map<string, any>();
        trending.forEach((s: any) => {
          if (s?._id && !unique.has(s._id)) unique.set(s._id, s);
        });

        const enriched = await enrichStoresWithDistance(
          Array.from(unique.values())
        );

        // 2) اجلب العروض وادمجها (لا نفلتر شيئًا)
        if (enriched.length) {
          const idsCsv = enriched.map((s) => s._id).join(",");
          const { data: promoMap } = await axiosInstance.get(
            `/delivery/promotions/by-stores?ids=${encodeURIComponent(
              idsCsv
            )}&channel=app`
          );

          const getStorePromos = (sid: string) =>
            Array.isArray(promoMap)
              ? promoMap.filter((p: any) => p.store === sid)
              : promoMap?.[sid];

          enriched.forEach((s: any) => {
            const best = pickBestPromo(getStorePromos(s._id));
            if (best) {
              s.promoBadge =
                best.valueType === "percentage"
                  ? `خصم ${best.value}%`
                  : `خصم ${best.value} ﷼`;
              s.promoPercent =
                best.valueType === "percentage" ? best.value : undefined;
              s.promoId = best._id;
            }
          });
        }

        setStores(enriched);
      } catch (e) {
        console.error("فشل في تحميل متاجر الترند/العروض:", e);
        setStores([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
          لا يوجد متاجر رائجة حالياً.
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

          const logoUri = (item as any).logo || item.image; // fallback للشعار
          const meta: string[] = [];
          if (item.distance) meta.push(item.distance);
          if (item.time) meta.push(item.time);

          return (
            <Animated.View
              style={{
                width: CARD_W,
                transform: [{ scale }], // تقدر تتركه كما هو
                opacity,
              }}
            >
              <Pressable
                android_ripple={{ color: "#eee", borderless: false }}
                style={[
                  s.card,
                  {
                    position: "relative", // 👈 مهم
                    paddingTop: (item as any).promoBadge ? 34 : 24, // 👈 مسافة أكبر
                    paddingBottom: 10,
                  },
                ]}
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
                {/* شريط البادجات */}
                <View style={s.badgesBar} pointerEvents="none">
                  <View style={s.badgesLeft}>
                    <View style={[s.badgePill, s.badgeTrending]}>
                      <Text numberOfLines={1} style={s.badgeText}>
                        🔥 رائج
                      </Text>
                    </View>
                  </View>

                  {(item as any).promoBadge ? (
                    <View style={s.badgesRight}>
                      <View style={[s.badgePill, s.badgePromo]}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={s.badgeText}
                        >
                          {(item as any).promoBadge}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={s.badgesRight} />
                  )}
                </View>

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

                {/* الاسم + معلومات */}
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

export default DeliveryTrending;

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
    // position: 'relative' تُضاف ديناميكيًا أعلى
  },

  // 🔹 شريط بعرض الكارد يوزّع البادجات يسار/يمين
  badgesBar: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,

    zIndex: 10, // 👈 أعلى من الشعار
    elevation: 10, // 👈 ضروري على أندرويد
  },
  badgesLeft: {
    flexDirection: "row",
    flexShrink: 1,
    flexBasis: "48%",
    minWidth: 0,
  },
  badgesRight: {
    flexDirection: "row",
    flexShrink: 1,
    flexBasis: "48%",
    minWidth: 0,
    justifyContent: "flex-end",
  },

  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minHeight: 20,
    maxWidth: "100%",
  },
  badgeTrending: { backgroundColor: COLORS.primary },
  badgePromo: { backgroundColor: COLORS.danger },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Cairo-Bold",
    // للسماح بـ ellipsis صح داخل flex item
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  // قلّل طبقة الشعار حتى لا يغطي البادجات
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    zIndex: 1, // 👈 أقل من badgesBar
  },
  logo: {
    backgroundColor: "#FFFFFF",
  },

  // نصوص أسفل لا تتأثر
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
});
