import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { SERVICES, WALLET_SERVICES } from '@/constants/services';
import ServiceCard from '@/components/ServiceCard';
import COLORS from '@/constants/colors';
import { useAuth } from '@/auth/AuthContext';
import { getAuthBanner } from '@/guards/bannerGateway';
import { safeNavigate } from '@/navigation/RootNavigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ROUTES_REQUIRING_LOGIN: (keyof RootStackParamList)[] = [
  'WalletScreen',
  'SanadList',
];

const ServicesHomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = Dimensions.get("window");
  const { isLoggedIn, authReady } = useAuth();

  const handleServicePress = (route: keyof RootStackParamList) => {
    const requiresLogin = ROUTES_REQUIRING_LOGIN.includes(route);
    if (requiresLogin && authReady && !isLoggedIn) {
      const banner = getAuthBanner();
      if (banner) {
        banner.show('login');
      } else {
        Alert.alert(
          'تسجيل الدخول',
          'يجب تسجيل الدخول للمتابعة.',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'تسجيل الدخول', onPress: () => safeNavigate('Login') },
          ]
        );
      }
      return;
    }
    navigation.navigate(route as never);
  };

  // حساب عدد الأعمدة
  const numColumns = 2;
  const cardWidth = (screenWidth - 48) / 2 - 8;

  return (
    <View style={styles.container}>
      {/* الهيدر */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>بثواني</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Notifications' as never)}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('CartScreen' as never)}
            >
              <Ionicons name="basket-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>اختر الخدمة التي تريدها</Text>
      </View>

      {/* محتوى الخدمات */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.grid,
            {
              maxWidth: screenWidth,
              alignSelf: 'center',
              width: '100%',
            },
          ]}
        >
          {SERVICES.map((service) => (
            <View
              key={service.id}
              style={[
                styles.cardWrapper,
                {
                  width: '48%',
                  padding: 8,
                },
              ]}
            >
              <ServiceCard
                name={service.name}
                description={service.description}
                icon={service.icon}
                color={service.color}
                onPress={() => handleServicePress(service.route)}
                disabled={!service.enabled}
              />
            </View>
          ))}
        </View>

        {/* قسم المحفظة - في الأسفل */}
        <View style={styles.walletSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>المحفظة</Text>
            <Text style={styles.sectionSubtitle}>
              رصيدك، الشحن، التحويل والدفع
            </Text>
          </View>
          <View style={styles.walletShippingRow}>
            {WALLET_SERVICES.map((service) => (
              <View key={service.id} style={styles.walletCardWrapper}>
                <ServiceCard
                  name={service.name}
                  description={service.description}
                  icon={service.icon}
                  color={service.color}
                  onPress={() => handleServicePress(service.route)}
                  disabled={!service.enabled}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Cairo-Bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#FFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  walletSection: {
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'Cairo-Regular',
    color: COLORS.lightText,
  },
  walletShippingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  walletCardWrapper: {
    width: '100%',
    marginBottom: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  cardWrapper: {
    marginBottom: 16,
  },
});

export default ServicesHomeScreen;
