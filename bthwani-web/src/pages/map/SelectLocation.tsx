// src/pages/map/SelectLocation.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  type MapMouseEvent,
  useApiIsLoaded,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { reverseGeocode, type LatLng } from "../../utils/mapUtils";
import { storage } from "../../utils/storage";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Fade,
  Slide,
  IconButton,
  Chip,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import {
  Save,
  LocationOn,
  Navigation,
  GpsFixed,
  Search,
} from "@mui/icons-material";
import theme from "../../theme";

export default function SelectLocation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storageKey = searchParams.get("storageKey") || "selected_location";
  const returnStep = searchParams.get("step") || "0";

  // مفاتيح البيئة
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string||"ea5aad613f341849dc7ee461";

  // حالة الخريطة والموقع
  const [center, setCenter] = useState<LatLng>({ lat: 15.3694, lng: 44.191 }); // Sana'a
  const [marker, setMarker] = useState<LatLng | null>(center);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<string>("");

  // Google Places Autocomplete
  const isLoaded = useApiIsLoaded();
  const placesLib = useMapsLibrary("places");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isLoaded || !placesLib || !searchInputRef.current) return;

    const Autocomplete = placesLib.Autocomplete;
    const ac = new Autocomplete(searchInputRef.current!, {
      fields: ["geometry", "formatted_address", "name"],
      // (اختياري) تقييد لليمن
      componentRestrictions: { country: ["YE"] },
    });

    const listener = ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const loc = place.geometry?.location;
      if (!loc) return;

      const pos = { lat: loc.lat(), lng: loc.lng() };
      setCenter(pos);
      setMarker(pos);
      setAddress(place.formatted_address || place.name || "");
      setSelectedPlace(place.formatted_address || place.name || "");
      setShowCard(true);
    });

    return () => {
      if (listener && typeof window !== 'undefined' && (window as any).google?.maps?.event) {
        (window as any).google.maps.event.removeListener(listener);
      }
    };
  }, [isLoaded, placesLib]);

  // عكس جيوكود عند تحريك الماركر
  useEffect(() => {
    (async () => {
      if (!marker) return;
      setLoading(true);
      try {
        const addr = await reverseGeocode(marker, apiKey);
        setAddress(addr);
      } finally {
        setLoading(false);
      }
    })();
  }, [marker, apiKey]);

  // تحديد الموقع الحالي من المتصفح
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCenter(c);
          setMarker(c);
        },
        () => {
          // تجاهل الخطأ بصمت؛ نبقى على المركز الافتراضي
        }
      );
    }
  }, []);

  const onMapClick = (event: MapMouseEvent) => {
    if (!event.detail?.latLng) return;
    const lat = event.detail.latLng.lat;
    const lng = event.detail.latLng.lng;
    const pos = { lat, lng };
    setMarker(pos);
    setCenter(pos);
    setSelectedPlace("");
    setShowCard(true);
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCenter(c);
          setMarker(c);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    }
  };

  const save = () => {
    if (!marker) return;
    const payload = { lat: marker.lat, lng: marker.lng, address };
    storage.setSelectedLocation(storageKey, payload);

    // Toast بسيط
    const successMessage = document.createElement("div");
    successMessage.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Arial', sans-serif;
        direction: rtl;
        animation: slideIn 0.3s ease-out;
      ">
        <span>✅</span>
        <span>تم حفظ الموقع بنجاح!</span>
      </div>
    `;
    document.body.appendChild(successMessage);

    // العودة التلقائية بعد حفظ الموقع
    setTimeout(() => {
      successMessage.remove();
      // العودة إلى صفحة أخدمني مع الخطوة الصحيحة
      navigate(`/akhdimni?step=${returnStep}`, { replace: true });
    }, 1500);
  };

  const defaultCenter = useMemo(() => center, [center]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: theme.palette.primary.dark,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.1,
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #ffffff 0%, transparent 50%), radial-gradient(circle at 75% 75%, #ffffff 0%, transparent 50%)",
          zIndex: 0,
        }}
      />

      {/* Floating Action Buttons */}
      <Fade in timeout={1000}>
        <Box
          sx={{
            position: "absolute",
            top: 100,
            right: 20,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <IconButton
            onClick={getCurrentLocation}
            disabled={loading}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              width: 56,
              height: 56,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 1)",
                transform: "scale(1.05)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {loading ? <CircularProgress size={24} /> : <GpsFixed />}
          </IconButton>

          <IconButton
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              width: 56,
              height: 56,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 1)",
                transform: "scale(1.05)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <Navigation />
          </IconButton>
        </Box>
      </Fade>

      {/* Header */}
      <Slide direction="down" in mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            p: 3,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "0 0 24px 24px",
            mb: 2,
            zIndex: 10,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: "bold",
                background: theme.palette.primary.dark,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              اختر موقعك على الخريطة
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.9rem", mb: 2 }}
            >
              ابحث عن مكان عبر Google أو انقر على الخريطة أو استخدم زر تحديد
              الموقع الحالي
            </Typography>

            {/* حقل البحث (Google Places Autocomplete) */}
            <TextField
              fullWidth
              placeholder="ابحث عن مكان (Google Places)..."
              variant="outlined"
              size="small"
              inputRef={searchInputRef}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.9)" },
                  "&.Mui-focused": { backgroundColor: "#fff" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <Search sx={{ color: "text.secondary", mr: 1 }} />
                ),
              }}
            />
          </Box>

          <Fade in={showCard && !!address} timeout={500}>
            <Card
              sx={{
                mt: 2,
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <LocationOn color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    الموقع المحدد:
                  </Typography>
                </Box>
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      جاري جلب العنوان...
                    </Typography>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      p: 1,
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      borderRadius: 2,
                      border: "1px solid rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    {address || "لم يتم تحديد موقع بعد"}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Fade>
        </Paper>
      </Slide>

      {/* Map */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          borderRadius: "0 0 24px 24px",
          overflow: "hidden",
        }}
      >
        <APIProvider apiKey={apiKey} libraries={["marker", "places"]}>
          <Map
            mapId={mapId}
            defaultZoom={14}
            defaultCenter={defaultCenter}
            onClick={onMapClick}
            gestureHandling="greedy"
            style={{ width: "100%", height: "100%" }}
          >
            {marker && (
              <AdvancedMarker position={marker}>
                <Pin
                  background="#667eea"
                  borderColor="#fff"
                  glyphColor="#fff"
                />
              </AdvancedMarker>
            )}
          </Map>
        </APIProvider>

        {/* Map Overlay Instructions */}
        <Fade in={!marker} timeout={2000}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <Paper
              elevation={4}
              sx={{
                p: 3,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                maxWidth: 280,
              }}
            >
              <LocationOn sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                ابحث أو انقر على الموقع المطلوب
              </Typography>
              <Typography variant="body2" color="text.secondary">
                اختر موقع التوصيل على الخريطة بدقة عالية
              </Typography>
            </Paper>
          </Box>
        </Fade>
      </Box>

      {/* Footer */}
      <Slide direction="up" in mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            p: 3,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px 24px 0 0",
            mt: 2,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Chip
              icon={<LocationOn />}
              label={
                marker
                  ? selectedPlace
                    ? `تم اختيار: ${
                        selectedPlace.length > 20
                          ? selectedPlace.substring(0, 20) + "..."
                          : selectedPlace
                      }`
                    : "موقع محدد"
                  : "لم يتم تحديد موقع"
              }
              color={marker ? "primary" : "default"}
              variant={marker ? "filled" : "outlined"}
              sx={{
                fontSize: "0.9rem",
                fontWeight: "bold",
                py: 1,
                px: 2,
                maxWidth: "100%",
              }}
            />
          </Box>

          <Button
            onClick={save}
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Save />}
            disabled={!marker || !address}
            sx={{
              background: theme.palette.primary.dark,
              borderRadius: 3,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: "bold",
              textTransform: "none",
              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
              "&:hover": {
                background: theme.palette.primary.dark,
                boxShadow: "0 12px 35px rgba(102, 126, 234, 0.4)",
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                background: "#e0e0e0",
                color: "#9e9e9e",
                boxShadow: "none",
              },
              transition: "all 0.3s ease",
            }}
          >
            {marker && address ? "حفظ هذا الموقع" : "يرجى تحديد موقع أولاً"}
          </Button>

          {marker && (
            <Fade in timeout={1000}>
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  سيتم حفظ إحداثيات الموقع وعنوانه لاستخدامه في طلبات التوصيل
                </Typography>
              </Box>
            </Fade>
          )}
        </Paper>
      </Slide>

      {/* CSS animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </Box>
  );
}
