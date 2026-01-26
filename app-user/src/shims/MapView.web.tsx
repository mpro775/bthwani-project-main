// src/shims/MapView.web.tsx
import { APIProvider, Marker as GMarker, Map } from "@vis.gl/react-google-maps";
import * as React from "react";
import { ReactNode, useMemo, type CSSProperties } from "react";

/** نفس تعريف Region كما في react-native-maps */
export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
};

/** واجهة المرجع الذي نعرّضه للخارج */
export type MapViewRef = {
  animateToRegion?: (r: Region, durationMs?: number) => void;
};

type MapViewProps = {
  style?: CSSProperties;
  region?: Region;
  initialRegion?: Region;
  onRegionChangeComplete?: (r: Region) => void;
  onPress?: (e: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => void;
  testID?: string;
  mapId?: string;
  children?: ReactNode;

  /** Props شائعة في RN يتم تجاهلها على الويب بدون مشاكل */
  provider?: any;
  loadingEnabled?: boolean;
  customMapStyle?: any;
  showsCompass?: boolean;
  toolbarEnabled?: boolean;
  rotateEnabled?: boolean;
};

/** تحويل تقريبي بين delta والـ zoom */
const deltaToZoom = (latDelta?: number) => {
  const d = Math.max(0.0005, Math.min(80, latDelta ?? 0.05)); // clamp
  // قيمة تقريبية: كلما صغرت الدلتا زاد الزوم
  const z = 8 - Math.log2(d);
  return Math.max(1, Math.min(21, Math.round(z)));
};

const zoomToDelta = (zoom: number) => {
  const z = Math.max(1, Math.min(21, zoom));
  // عكس الدالة التقريبية أعلاه
  return Math.pow(2, 8 - z);
};

/** مكوّن بديل لو ما كان فيه مفتاح API */
const Fallback: React.FC<{ style?: CSSProperties }> = ({ style }) => (
  <div
    style={{
      width: "100%",
      height: 360,
      borderRadius: 12,
      overflow: "hidden",
      background: "#f3f4f6",
      border: "1px solid rgba(0,0,0,0.08)",
      display: "grid",
      placeItems: "center",
      fontFamily:
        'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      ...style,
    }}
  >
    <div style={{ textAlign: "center", maxWidth: 520, padding: 16 }}>
      <strong>خريطة Google (بحاجة لمفتاح API)</strong>
      <div
        style={{ fontSize: 12, opacity: 0.8, marginTop: 6, lineHeight: 1.6 }}
      >
        ضع قيمة <code>EXPO_PUBLIC_GOOGLE_MAPS_API_KEY</code> في ملف البيئة.
      </div>
    </div>
  </div>
);

/** MapView للويب */
const MapView: React.FC<MapViewProps & { ref?: any }> = (props) => {
  const {
    region,
    initialRegion,
    style,
    children,
    onPress,
    onRegionChangeComplete,
    testID,
    mapId,
  } = props;

  const center = useMemo(() => {
    const r = region ??
      initialRegion ?? {
        latitude: 24.774265,
        longitude: 46.738586,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      };
    return { lat: r.latitude, lng: r.longitude };
  }, [region, initialRegion]);

  const zoom = useMemo(() => {
    return deltaToZoom(region?.latitudeDelta ?? initialRegion?.latitudeDelta);
  }, [region?.latitudeDelta, initialRegion?.latitudeDelta]);

  const apiKey = (process as any).env?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY as
    | string
    | undefined;

  if (!apiKey) return <Fallback style={style} />;

  return (
    <APIProvider apiKey={apiKey}>
      <div
        style={{
          width: "100%",
          height: 360,
          borderRadius: 12,
          overflow: "hidden",
          ...style,
        }}
        data-testid={testID || "mapview-web-google"}
      >
        <Map
          mapId={mapId}
          defaultCenter={center}
          defaultZoom={zoom}
          reuseMaps
          onCameraChanged={(event) => {
            if (!onRegionChangeComplete) return;
            const center = event.detail.center;
            const zoom = event.detail.zoom;
            onRegionChangeComplete({
              latitude: center.lat,
              longitude: center.lng,
              latitudeDelta: zoomToDelta(zoom),
              longitudeDelta: zoomToDelta(zoom),
            });
          }}
          style={{ width: "100%", height: "100%" }}
        >
          {children}
        </Map>
      </div>
    </APIProvider>
  );
};

/** Marker متوافق */
type MarkerProps = {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  description?: string;
  testID?: string;
};
export const Marker: React.FC<MarkerProps> = ({
  coordinate,
  title,
  testID,
}) => {
  return (
    <GMarker
      position={{ lat: coordinate.latitude, lng: coordinate.longitude }}
      title={title}
      data-testid={testID || "marker-web-google"}
    />
  );
};

export const PROVIDER_GOOGLE = "google";
export default MapView as any;
