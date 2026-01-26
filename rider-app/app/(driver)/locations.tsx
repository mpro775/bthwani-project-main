import axios from "@/api/axios";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface LocationItem {
  label: string;
  lat: number;
  lng: number;
  updatedAt?: string;
}

export default function LocationScreen() {
  const [label, setLabel] = useState("");
  const [locations, setLocations] = useState<LocationItem[]>([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await axios.get("/drivers/me");
      setLocations(res.data.otherLocations || []);
    } catch (e) {
      console.error("❌ فشل في جلب المواقع", e);
    }
  };

  const addLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("❌", "يجب تفعيل صلاحية تحديد الموقع");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      await axios.post("/drivers/locations", {
        label,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });

      Alert.alert("✅", "تمت إضافة الموقع");
      setLabel("");
      fetchLocations();
    } catch {
      Alert.alert("❌", "فشل في إضافة الموقع");
    }
  };

  const deleteLocation = async (index: number) => {
    try {
      await axios.delete(`/drivers/locations/${index}`);
      fetchLocations();
    } catch {
      Alert.alert("❌", "فشل في حذف الموقع");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>أضف عنوان جديد:</Text>
      <TextInput
        placeholder="مثلاً: منزلي في صنعاء"
        value={label}
        onChangeText={setLabel}
        style={styles.input}
      />
      <Button title="📍 حفظ موقعي الحالي" onPress={addLocation} />

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>
        📍 المواقع المحفوظة:
      </Text>
      <FlatList
        data={locations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text>
              {item.label} ({item.lat.toFixed(4)}, {item.lng.toFixed(4)})
            </Text>
            <Button title="🗑️ حذف" onPress={() => deleteLocation(index)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    marginVertical: 10,
    padding: 10,
    borderRadius: 6,
  },
  item: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
  },
});
