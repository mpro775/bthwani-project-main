import MapView, { PROVIDER_GOOGLE, Region } from "@/shims/MapView";
import axiosInstance from "@/utils/api/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#D84315",
  white: "#fff",
  text: "#212121",
  border: "#e5e7eb",
};

const SANAA_BBOX = {
  minLon: 44.05,
  minLat: 15.24,
  maxLon: 44.35,
  maxLat: 15.55,
};
const SANAA_CENTER = { lat: 15.3694, lng: 44.191 };
const insideSanaa = (lat: number, lng: number) =>
  lng >= SANAA_BBOX.minLon &&
  lng <= SANAA_BBOX.maxLon &&
  lat >= SANAA_BBOX.minLat &&
  lat <= SANAA_BBOX.maxLat;

const MAP_STYLE_LIGHT = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
];

// توليد Session Token بسيط لـ Places Autocomplete
const newSessionToken = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const PLACES_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY ||
  "AIzaSyCoIo_MvZY0h5r1ipzg6fvn6S_iTF3VslA";

export default function SelectLocationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mapRef = useRef<typeof MapView>(null);
  const insets = useSafeAreaInsets();

  const storageKey: string = route?.params?.storageKey || "temp_location";
  const headerTitle: string = route?.params?.title || "تحديد الموقع";

  const [region, setRegion] = useState<Region>({
    latitude: SANAA_CENTER.lat,
    longitude: SANAA_CENTER.lng,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02 * (width / height),
  });
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [address, setAddress] = useState<string>("");
  const [placeId, setPlaceId] = useState<string | null>(null);

  // بحث مبسّط
  const [query, setQuery] = useState("");
  const [preds, setPreds] = useState<{ placeId: string; text: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>(newSessionToken());
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1) إذن موقع وتمركز أولي
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoading(false);
          return;
        }
        const ok = await Location.hasServicesEnabledAsync();
        if (!ok) {
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        const { latitude: lat, longitude: lng } = loc.coords;
        const inside = insideSanaa(lat, lng);
        setRegion((r) => ({
          ...r,
          latitude: inside ? lat : SANAA_CENTER.lat,
          longitude: inside ? lng : SANAA_CENTER.lng,
        }));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) تحديث المركز عند توقف السحب
  const onRegionChangeComplete = (r: Region) => {
    if (!insideSanaa(r.latitude, r.longitude)) {
      mapRef.current?.animateToRegion(
        { ...region, latitude: SANAA_CENTER.lat, longitude: SANAA_CENTER.lng },
        400
      );
      return;
    }
    setRegion(r);
    setCenter({ lat: r.latitude, lng: r.longitude });
    setPlaceId(null);
    setAddress("");
    reverseGeocode(r.latitude, r.longitude);
  };
  // 3) Autocomplete (New) — مجاني — 5 نتائج كحد أقصى
  const doAutocomplete = (text: string) => {
    if (!PLACES_KEY) {
      console.warn("[Places] Missing key");
      setPreds([]);
      return;
    }
    const q = text.trim();
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.length < 2) {
      setPreds([]);
      return;
    }
    setSearching(true);

    searchTimer.current = setTimeout(async () => {
      try {
        const body = {
          input: q,
          languageCode: "ar",
          includedRegionCodes: ["YE"], // يركز على اليمن
          includedPrimaryTypes: [
            "street_address",
            "route",
            "establishment",
            "plus_code",
          ],
          locationBias: {
            circle: {
              center: {
                latitude: region.latitude,
                longitude: region.longitude,
              },
              radius: 10000,
            },
          },
          sessionToken,
        };
        const { data: res } = await axiosInstance.get(
          "https://places.googleapis.com/v1/places:autocomplete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": PLACES_KEY,
              "X-Goog-FieldMask":
                "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
            },
            body: JSON.stringify(body),
          }
        );

        if (!res.ok) {
          console.warn(
            "[Places] Autocomplete error:",
            res.status,
            await res.text()
          );
          setPreds([]);
          return;
        }

        // data already available from axiosInstance
        const list = (data?.suggestions || [])
          .slice(0, 5)
          .map((s: any) => ({
            placeId: s?.placePrediction?.placeId,
            text: s?.placePrediction?.text?.text || "",
          }))
          .filter((x: any) => x.placeId && x.text);
        setPreds(list);
      } catch (e) {
        console.warn("[Places] fetch failed:", e);
        setPreds([]);
      } finally {
        setSearching(false);
      }
    }, 450);
  };

  // 4) Place Details — مرّة عند اختيار نتيجة فقط
  const fetchPlaceDetails = async (pid: string) => {
    try {
      const { data: res } = await axiosInstance.get(
        `https://places.googleapis.com/v1/places/${pid}?languageCode=ar`,
        {
          headers: {
            "X-Goog-Api-Key": PLACES_KEY,
            "X-Goog-FieldMask": "id,formattedAddress,location",
          },
        }
      );
      if (!res.ok) {
        console.warn("[Places] Details error:", res.status, await res.text());
        return null;
      }
      const d = res;
      const lat = d?.location?.latitude,
        lng = d?.location?.longitude;
      const addr = d?.formattedAddress || "";
      return lat && lng ? { lat, lng, address: addr } : null;
    } catch (e) {
      console.warn("[Places] Details failed:", e);
      return null;
    }
  };
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!PLACES_KEY) return;
    try {
      const { data: res } = await axiosInstance.get(
        "https://places.googleapis.com/v1/geocode:reverse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": PLACES_KEY,
            "X-Goog-FieldMask": "formattedAddress,plusCode",
          },
          body: JSON.stringify({
            location: { latitude: lat, longitude: lng },
            languageCode: "ar",
            regionCode: "YE",
          }),
        }
      );
      if (!res.ok) return;
      const d = res;
      setAddress(d?.formattedAddress || d?.plusCode?.globalCode || "");
    } catch {}
  };
  const onPickPrediction = async (p: { placeId: string; text: string }) => {
    const det = await fetchPlaceDetails(p.placeId);
    if (!det) return;
    mapRef.current?.animateToRegion(
      {
        latitude: det.lat,
        longitude: det.lng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015 * (width / height),
      },
      350
    );
    setCenter({ lat: det.lat, lng: det.lng });
    setAddress(det.address || p.text);
    setPlaceId(p.placeId);
    setPreds([]);
    setQuery(det.address || p.text);
    setSessionToken(newSessionToken()); // بداية جلسة جديدة
  };

  // 5) موقعي الحالي
  const recenterToMyLocation = async () => {
    setLocating(true);
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const { latitude: lat, longitude: lng } = loc.coords;
      const inside = insideSanaa(lat, lng);
      mapRef.current?.animateToRegion(
        {
          latitude: inside ? lat : SANAA_CENTER.lat,
          longitude: inside ? lng : SANAA_CENTER.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02 * (width / height),
        },
        400
      );
    } finally {
      setLocating(false);
    }
  };

  // 6) تأكيد
  const confirm = async () => {
    if (!center) return;
    const payload = {
      lat: center.lat,
      lng: center.lng,
      address:
        address ||
        `إحداثيات: ${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`,
      placeId: placeId || null,
    };
    await AsyncStorage.setItem(storageKey, JSON.stringify(payload));
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={[styles.fill, styles.center]}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: COLORS.text }}>
          جارٍ تجهيز الخريطة…
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      {/* الخريطة */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onRegionChangeComplete={onRegionChangeComplete}
        loadingEnabled
        customMapStyle={MAP_STYLE_LIGHT}
        showsCompass={false}
        toolbarEnabled={false}
        rotateEnabled={false}
      />

      {/* دبوس ثابت */}
      <View pointerEvents="none" style={styles.pinWrap}>
        <View style={styles.pinDot} />
        <View style={styles.pinTip} />
      </View>

      {/* شريط البحث */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            doAutocomplete(t);
          }}
          style={styles.searchInput}
          placeholder="ابحث عن مكان أو شارع داخل صنعاء…"
          placeholderTextColor="#888"
          textAlign="right"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery("");
              setPreds([]);
            }}
          >
            <Ionicons name="close" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* نتائج مبسّطة */}
      {preds.length > 0 && (
        <View style={[styles.resultsBox, { top: (insets.top || 0) + 60 }]}>
          <FlatList
            data={preds}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => item.placeId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => onPickPrediction(item)}
              >
                <Text numberOfLines={2} style={styles.resultTitle}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              searching ? <ActivityIndicator style={{ padding: 10 }} /> : null
            }
          />
        </View>
      )}

      {/* بطاقة سفلية */}
      <View
        style={[styles.footer, { bottom: 20 + Math.max(insets.bottom, 12) }]}
      >
        <Text style={styles.addr} numberOfLines={2}>
          {address ||
            (center
              ? `إحداثيات: ${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`
              : headerTitle)}
        </Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#666" }]}
            onPress={recenterToMyLocation}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="locate" size={18} color="#fff" />
                <Text style={styles.btnText}>موقعي الحالي</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: COLORS.primary }]}
            onPress={confirm}
            disabled={!center}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.btnText}>تأكيد الموقع</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#f8f9fa" },
  center: { alignItems: "center", justifyContent: "center" },

  pinWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -13 }, { translateY: -26 }],
    zIndex: 10,
    alignItems: "center",
  },
  pinDot: {
    width: 26,
    height: 26,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: "#fff",
    elevation: 3,
  },
  pinTip: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: COLORS.primary,
  },

  searchWrap: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: { flex: 1, color: "#111" },

  resultsBox: {
    position: "absolute",
    top: Platform.OS === "ios" ? 98 : 68,
    left: 16,
    right: 16,
    zIndex: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 220,
  },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  resultTitle: { textAlign: "right", color: "#222" },

  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  addr: { textAlign: "right", color: COLORS.text },
  row: { flexDirection: "row-reverse", gap: 10, marginTop: 10 },
  btn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
  },
  btnText: { color: "#fff" },
});
