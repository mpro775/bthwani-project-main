import { useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import {
  Search as SearchIcon,
  MyLocation as MyLocationIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

type Props = {
  initial?: { lat: number; lng: number };
  onSelect: (
    lat: number,
    lng: number,
    address?: string,
    placeId?: string | null
  ) => void;
  onClose: () => void;
};

const GMAPS_KEY = "AIzaSyB7rdwWNFGT9rt2jo1xn5PJKGDnaHG5sZI";

const COLORS = {
  primary: "#D84315",
  text: "#212121",
  border: "#e5e7eb",
  white: "#fff",
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

// أسلوب خريطة بسيط (نظيف)
const MAP_STYLE_LIGHT: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
];

export default function SimpleMapPicker({ initial, onSelect, onClose }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GMAPS_KEY,
    libraries: ["places"], // مهم للأوتوكملِيت والتفاصيل
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const placesSvcRef = useRef<google.maps.places.PlacesService | null>(null);
  const autoSvcRef = useRef<google.maps.places.AutocompleteService | null>(
    null
  );

  const [center, setCenter] = useState<google.maps.LatLngLiteral>(
    initial && insideSanaa(initial.lat, initial.lng) ? initial : SANAA_CENTER
  );
  const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral>(center);
  const [address, setAddress] = useState<string>("");
  const [placeId, setPlaceId] = useState<string | null>(null);

  // بحث
  const [query, setQuery] = useState("");
  const [preds, setPreds] = useState<{ placeId: string; text: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // تهيئة الخدمات عند تحميل الخريطة
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    placesSvcRef.current = new google.maps.places.PlacesService(map);
    autoSvcRef.current = new google.maps.places.AutocompleteService();
    setSessionToken(new google.maps.places.AutocompleteSessionToken());
  };

  // حدود صنعاء كباوندز للبحث
  const sanaaBounds = useMemo(() => {
    const sw = new google.maps.LatLng(SANAA_BBOX.minLat, SANAA_BBOX.minLon);
    const ne = new google.maps.LatLng(SANAA_BBOX.maxLat, SANAA_BBOX.maxLon);
    return new google.maps.LatLngBounds(sw, ne);
  }, [isLoaded]);

  // أوتوكملِيت مبسّط (5 نتائج)
  const doAutocomplete = (text: string) => {
    if (!isLoaded || !autoSvcRef.current || !sessionToken) return;
    const q = text.trim();
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.length < 2) {
      setPreds([]);
      return;
    }

    setSearching(true);
    searchTimer.current = setTimeout(() => {
      autoSvcRef.current!.getPlacePredictions(
        {
          input: q,
          sessionToken,
          componentRestrictions: { country: "ye" },
          bounds: sanaaBounds,
          strictBounds: false,
          // يمكنك أيضًا استخدام locationBias كدائرة حول المركز الحالي
        },
        (res) => {
          setSearching(false);
          const list = (res || [])
            .slice(0, 5)
            .map((p) => ({
              placeId: p.place_id!,
              text: p.description || p.structured_formatting?.main_text || "",
            }))
            .filter((x) => x.placeId && x.text);
          setPreds(list);
        }
      );
    }, 350);
  };

  // جلب تفاصيل المكان مرة واحدة عند الاختيار
  const fetchPlaceDetails = (pid: string) =>
    new Promise<{ lat: number; lng: number; address: string } | null>(
      (resolve) => {
        if (!placesSvcRef.current) return resolve(null);
        placesSvcRef.current.getDetails(
          {
            placeId: pid,
            fields: ["geometry.location", "formatted_address", "adr_address"],
          },
          (place, status) => {
            if (
              status !== google.maps.places.PlacesServiceStatus.OK ||
              !place ||
              !place.geometry?.location
            ) {
              return resolve(null);
            }
            const pos = place.geometry.location.toJSON();
            const addr = place.formatted_address || place.adr_address || "";
            resolve({ lat: pos.lat, lng: pos.lng, address: addr });
          }
        );
      }
    );

  const onPickPrediction = async (item: { placeId: string; text: string }) => {
    const det = await fetchPlaceDetails(item.placeId);
    if (!det) return;
    if (!insideSanaa(det.lat, det.lng)) {
      // حماية بسيطة: أعد التمركز لوسط صنعاء
      mapRef.current?.panTo(SANAA_CENTER);
      setMarkerPos(SANAA_CENTER);
      setCenter(SANAA_CENTER);
      setAddress("");
      setPlaceId(null);
      return;
    }
    setCenter({ lat: det.lat, lng: det.lng });
    setMarkerPos({ lat: det.lat, lng: det.lng });
    setAddress(det.address || item.text);
    setPlaceId(item.placeId);
    mapRef.current?.panTo({ lat: det.lat, lng: det.lng });
    setPreds([]);
    setQuery(det.address || item.text);
    // ابدأ جلسة جديدة لتقليل التكلفة
    setSessionToken(new google.maps.places.AutocompleteSessionToken());
  };

  // سحب الماركَر
  const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const pos = e.latLng.toJSON();
    if (!insideSanaa(pos.lat, pos.lng)) {
      mapRef.current?.panTo(SANAA_CENTER);
      setMarkerPos(SANAA_CENTER);
      setCenter(SANAA_CENTER);
      setAddress("");
      setPlaceId(null);
      return;
    }
    setMarkerPos(pos);
    setCenter(pos);
    setAddress("");
    setPlaceId(null);
  };

  // موقعي الحالي (اختياري على الويب—يعتمد إذن المتصفح)
  const goToMyLocation = async () => {
    try {
      // مجرد طلب—سيُظهر المتصفح النافذة
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
          const inside = insideSanaa(pos.lat, pos.lng);
          const dst = inside ? pos : SANAA_CENTER;
          setCenter(dst);
          setMarkerPos(dst);
          mapRef.current?.panTo(dst);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } catch {
      // ignore
    }
  };

  const confirm = () => {
    onSelect(markerPos.lat, markerPos.lng, address || undefined, placeId);
  };

  if (loadError) {
    return <Box p={2}>تعذّر تحميل خرائط جوجل. تحقّق من المفتاح/الدومين.</Box>;
  }

  if (!isLoaded) {
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "80vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* شريط البحث */}
      <TextField
        placeholder="ابحث عن مكان أو شارع داخل صنعاء…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          doAutocomplete(e.target.value);
        }}
        onKeyDown={(e) => e.key === "Enter" && doAutocomplete(query)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {searching ? (
                <CircularProgress size={18} />
              ) : (
                <SearchIcon
                  sx={{ cursor: "pointer" }}
                  onClick={() => doAutocomplete(query)}
                />
              )}
            </InputAdornment>
          ),
        }}
      />

      {/* قائمة الاقتراحات */}
      {preds.length > 0 && (
        <Paper elevation={3} sx={{ maxHeight: 240, overflow: "auto" }}>
          <List dense>
            {preds.map((p) => (
              <ListItem key={p.placeId} disablePadding>
                <ListItemButton onClick={() => onPickPrediction(p)}>
                  <ListItemText primary={p.text} sx={{ textAlign: "right" }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* الخريطة */}
      <Box sx={{ position: "relative", flex: 1 }}>
        <GoogleMap
          onLoad={onMapLoad}
          center={center}
          zoom={16}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            fullscreenControl: false,
            mapTypeControl: false,
            styles: MAP_STYLE_LIGHT,
            gestureHandling: "greedy",
            restriction: {
              latLngBounds: {
                south: SANAA_BBOX.minLat,
                west: SANAA_BBOX.minLon,
                north: SANAA_BBOX.maxLat,
                east: SANAA_BBOX.maxLon,
              },
              strictBounds: false,
            },
          }}
          onClick={(e) => {
            if (!e.latLng) return;
            const pos = e.latLng.toJSON();
            if (!insideSanaa(pos.lat, pos.lng)) return;
            setMarkerPos(pos);
            setCenter(pos);
            setAddress("");
            setPlaceId(null);
          }}
        >
          <Marker
            position={markerPos}
            draggable
            onDragEnd={onMarkerDragEnd}
            icon={undefined} // الافتراضي
          />
        </GoogleMap>

        {/* زر موقعي الحالي */}
        <Button
          variant="contained"
          size="small"
          onClick={goToMyLocation}
          startIcon={<MyLocationIcon />}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            bgcolor: COLORS.white,
            color: COLORS.text,
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          موقعي الحالي
        </Button>
      </Box>

      {/* العنوان/الإحداثيات + الأزرار */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
      >
        <Box sx={{ color: COLORS.text, fontSize: 14 }}>
          {address ||
            `إحداثيات: ${markerPos.lat.toFixed(5)}, ${markerPos.lng.toFixed(
              5
            )}`}
        </Box>
        <Box display="flex" gap={1}>
          <Button onClick={onClose}>إلغاء</Button>
          <Button
            variant="contained"
            endIcon={<CheckIcon />}
            onClick={confirm}
            sx={{ bgcolor: COLORS.primary, "&:hover": { bgcolor: "#bf3a12" } }}
          >
            تأكيد الموقع
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
