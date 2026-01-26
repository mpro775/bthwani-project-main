import MapView, { Marker, MapPressEvent } from "react-native-maps";
import { View, StyleSheet } from "react-native";

export default function MapPicker({
  value,
  onChange,
  containerStyle,
}: {
  value: { lat: number; lng: number };
  onChange: (v: { lat: number; lng: number }) => void;
  containerStyle?: any;
}) {
  const region = {
    latitude: value.lat || 15.3694,
    longitude: value.lng || 44.191,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  const onPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    onChange({ lat: latitude, lng: longitude });
  };
  return (
    <View
      style={[
        containerStyle || { height: 220, borderRadius: 12, overflow: "hidden" },
      ]}
    >
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onPress={onPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="خريطة اختيار الموقع"
        accessibilityHint="اضغط على أي مكان في الخريطة لاختيار هذا الموقع كموقع التسليم"
      >
        <Marker
          coordinate={{
            latitude: value.lat || region.latitude,
            longitude: value.lng || region.longitude,
          }}
        />
      </MapView>
    </View>
  );
}
