import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { MapPressEvent, Marker } from "react-native-maps";
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../api/axiosInstance';
import { useUser } from '../hooks/userContext';


const daysOfWeek = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت',
];

type Store = {
  _id: string;
  name: string;
  address: string;
  category: { _id: string; name: string };
  location: { lat: number; lng: number };
  isActive: boolean;
  image?: string;
  logo?: string;
  forceClosed: boolean;
  forceOpen: boolean;
  schedule: {
    day: string;
    open: boolean;
    from?: string;
    to?: string;
  }[];
  commissionRate: number;
  takeCommission: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  pricingStrategy?: string | null;
  pricingStrategyType: string;
};

const StoreInfoScreen = () => {
  const { user } = useUser();
  const [store, setStore] = useState<Store | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({});
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!user || !user.storeId) {
      Alert.alert('خطأ', 'لا يوجد معرف متجر لهذا التاجر');
      setLoading(false);
      return;
    }
    fetchStore(user.storeId);
  }, [user]);

  const fetchStore = async (storeId: string) => {
    try {

      setLoading(true);
      const res = await axiosInstance.get(`/delivery/stores/${storeId}`);
      setStore(res.data);
      setForm(res.data);
    } catch (err) {
      Alert.alert('خطأ', 'فشل تحميل بيانات المتجر');
    } finally {
      setLoading(false);
    }
  };
  

  const handleImagePick = async (type: 'image' | 'logo') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'image' ? [16, 9] : [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setForm({ ...form, [type]: result.assets[0].uri });
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    if (editMode) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setForm({
        ...form,
        location: {
          lat: latitude,
          lng: longitude
        }
      });
    }
  };
  const handleMarkerDragEnd = (event: any) => {
    if (!editMode) return;
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setForm({
      ...form,
      location: {
        lat: latitude,
        lng: longitude
      }
    });
  };
  const handleSave = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(`/delivery/stores/${user.storeId}`, form);
      Alert.alert('نجح', 'تم حفظ بيانات المتجر بنجاح');
      setEditMode(false);
      fetchStore(user.storeId);
    } catch (err) {
      Alert.alert('خطأ', 'فشل تحديث بيانات المتجر');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF500D" />
        <Text style={styles.errorText}>لا توجد بيانات متجر</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with Cover Image */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={() => editMode && handleImagePick('image')}
            activeOpacity={editMode ? 0.8 : 1}
          >
            <Image
              source={{ uri: form.image || 'https://via.placeholder.com/400x200' }}
              style={styles.coverImage}
            />
            {editMode && (
              <View style={styles.editImageOverlay}>
                <Ionicons name="camera" size={32} color="#FF500D" />
                <Text style={styles.editImageText}>تغيير صورة الغلاف</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Logo */}
          <TouchableOpacity 
            onPress={() => editMode && handleImagePick('logo')}
            activeOpacity={editMode ? 0.8 : 1}
            style={styles.logoContainer}
          >
            <Image
              source={{ uri: form.logo || 'https://via.placeholder.com/100' }}
              style={styles.logo}
            />
            {editMode && (
              <View style={styles.editLogoOverlay}>
                <Ionicons name="camera" size={20} color="#FF500D" />
              </View>
            )}
          </TouchableOpacity>

          {/* Store Status */}
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: store.isActive ? '#4CAF50' : '#F44336' }]} />
            <Text style={styles.statusText}>{store.isActive ? 'مفتوح' : 'مغلق'}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Basic Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color="#FF500D" />
              <Text style={styles.cardTitle}>المعلومات الأساسية</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>اسم المتجر</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(t) => setForm({ ...form, name: t })}
                  placeholder="أدخل اسم المتجر"
                />
              ) : (
                <Text style={styles.value}>{store.name}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>العنوان</Text>
              {editMode ? (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={form.address}
                  onChangeText={(t) => setForm({ ...form, address: t })}
                  placeholder="أدخل العنوان"
                  multiline
                />
              ) : (
                <Text style={styles.value}>{store.address}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>التصنيف</Text>
              <View style={styles.categoryBadge}>
                <FontAwesome5 name="store" size={12} color="#FF500D" />
                <Text style={styles.categoryText}>{store.category?.name || 'غير محدد'}</Text>
              </View>
            </View>

            {/* Location */}
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => setShowMap(!showMap)}
            >
              <Ionicons name="location" size={20} color="#FF500D" />
              <Text style={styles.locationButtonText}>
                الموقع: {store.location.lat.toFixed(4)}, {store.location.lng.toFixed(4)}
              </Text>
              <Ionicons 
                name={showMap ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#FF500D" 
              />
            </TouchableOpacity>

            {showMap && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: form.location.lat,
                    longitude: form.location.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  onPress={handleMapPress}
                  provider="google"
                  showsUserLocation={false}
                  showsMyLocationButton={false}
                  scrollEnabled={editMode}
                  zoomEnabled={editMode}
                  pitchEnabled={editMode}
                  rotateEnabled={editMode}
                >
                  <Marker
                    coordinate={{
                      latitude: form.location.lat,
                      longitude: form.location.lng,
                    }}
                    draggable={editMode}
                    onDragEnd={handleMarkerDragEnd}
                    pinColor="#ff6b35"
                    title="موقع المتجر"
                    description={`الموقع الحالي: ${form.location.lat.toFixed(4)}, ${form.location.lng.toFixed(4)}`}
                  />
                </MapView>
                {editMode && (
                  <View style={styles.mapControls}>
                    <Text style={styles.mapHint}>اضغط على الخريطة أو اسحب المؤشر لتغيير الموقع</Text>
                    <TouchableOpacity 
                      style={styles.locationConfirmButton}
                      onPress={() => setShowMap(false)}
                    >
                      <Text style={styles.locationConfirmText}>تأكيد الموقع</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Schedule Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={24} color="#FF500D" />
              <Text style={styles.cardTitle}>أوقات العمل</Text>
            </View>

            {(editMode ? form.schedule : store.schedule).map((sch: any, idx: number) => (
              <View key={idx} style={styles.scheduleRow}>
                <Text style={styles.dayName}>{daysOfWeek[idx]}</Text>
                
                {editMode ? (
                  <View style={styles.scheduleEditContainer}>
                    <Switch
                      value={sch.open}
                      onValueChange={(value) => {
                        const updated = [...form.schedule];
                        updated[idx].open = value;
                        setForm({ ...form, schedule: updated });
                      }}
                      trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                      thumbColor={sch.open ? '#4CAF50' : '#F5F5F5'}
                    />
                    {sch.open && (
                      <View style={styles.timeInputs}>
                        <TextInput
                          style={styles.timeInput}
                          value={sch.from || ''}
                          onChangeText={(t) => {
                            const updated = [...form.schedule];
                            updated[idx].from = t;
                            setForm({ ...form, schedule: updated });
                          }}
                          placeholder="من"
                          keyboardType="numeric"
                        />
                        <Text style={styles.timeSeparator}>-</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={sch.to || ''}
                          onChangeText={(t) => {
                            const updated = [...form.schedule];
                            updated[idx].to = t;
                            setForm({ ...form, schedule: updated });
                          }}
                          placeholder="إلى"
                          keyboardType="numeric"
                        />
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.scheduleTimeContainer}>
                    {sch.open ? (
                      <>
                        <Ionicons name="checkmark-circle" size={16} color="#FF500D" />
                        <Text style={styles.scheduleTime}>
                          {sch.from} - {sch.to}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="close-circle" size={16} color="#F44336" />
                        <Text style={[styles.scheduleTime, { color: '#999' }]}>مغلق</Text>
                      </>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Additional Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="featured-play-list" size={24} color="#FF500D" />
              <Text style={styles.cardTitle}>معلومات إضافية</Text>
            </View>

            <View style={styles.additionalInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>العمولة</Text>
                <Text style={styles.infoItemValue}>{store.commissionRate}%</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>مميز</Text>
                <Ionicons 
                  name={store.isFeatured ? "star" : "star-outline"} 
                  size={20} 
                  color={store.isFeatured ? "#FFD700" : "#999"} 
                />
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>رائج</Text>
                <Ionicons 
                  name={store.isTrending ? "trending-up" : "trending-down"} 
                  size={20} 
                  color={store.isTrending ? "#FF500D" : "#999"} 
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!editMode ? (
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => setEditMode(true)}
              >
                <Ionicons name="create-outline" size={20} color="#FFF" />
                <Text style={styles.buttonText}>تعديل البيانات</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.primaryButton, { backgroundColor: '#4CAF50' }]}
                  onPress={handleSave}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  <Text style={[styles.buttonText, { color: '#FFF' }]}>حفظ التغييرات</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => {
                    setEditMode(false);
                    setForm(store);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#E74C3C" />
                  <Text style={[styles.buttonText, { color: '#E74C3C' }]}>إلغاء</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#E74C3C',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  headerContainer: {
    position: 'relative',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  coverImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#e9ecef',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -35,
    left: 20,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f8f9fa',
  },
  editImageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editImageText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'Cairo-Regular',
  },
  editLogoOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    padding: 6,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Cairo-SemiBold',
  },
  content: {
    padding: 20,
    paddingTop: 55,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f3f4',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 12,
    color: '#2c3e50',
    fontFamily: 'Cairo-SemiBold',
  },
  infoRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    fontFamily: 'Cairo-Regular',
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
    fontFamily: 'Cairo-Regular',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    fontFamily: 'Cairo-Regular',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#ffcc02',
  },
  categoryText: {
    fontSize: 13,
    color: '#ff6b35',
    marginLeft: 6,
    fontFamily: 'Cairo-Regular',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ffcc02',
  },
  locationButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#ff6b35',
    marginRight: 12,
    fontFamily: 'Cairo-Regular',
  },
  mapContainer: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  map: {
    width: '100%',
    height: 220,
  },
  mapHint: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },
  mapControls: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
    padding: 8,
  },
  locationConfirmButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 6,
    padding: 6,
    marginTop: 4,
    alignItems: 'center',
  },
  locationConfirmText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Cairo-SemiBold',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  dayName: {
    fontSize: 14,
    color: '#2c3e50',
    width: 90,
    fontFamily: 'Cairo-Regular',
  },
  scheduleEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  timeInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
  },
  timeSeparator: {
    marginHorizontal: 6,
    color: '#6c757d',
  },
  scheduleTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 6,
    fontFamily: 'Cairo-Regular',
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  infoItem: {
    alignItems: 'center',
    padding: 8,
  },
  infoItemLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 6,
    fontFamily: 'Cairo-Regular',
  },
  infoItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'Cairo-SemiBold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: '#ff6b35',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E74C3C',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Cairo-SemiBold',
  },
});

export default StoreInfoScreen;