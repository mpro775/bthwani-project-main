import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuItemContent}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons
          name="chevron-back"
          size={20}
          color={COLORS.textSecondary}
        />
      )}
    </View>
  </TouchableOpacity>
);

const MoreScreen: React.FC = () => {
  const navigation = useNavigation();

  const handlePaymentPress = () => {
    // Navigate to payment screen
    navigation.navigate('PaymentStack' as never);
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings' as never);
  };

  const handleStatisticsPress = () => {
    navigation.navigate('Statistics' as never);
  }

  const handleAccountStatementPress = () => {
    navigation.navigate('VendorAccountStatement' as never);
  };

  const handleSupportPress = () => {
    navigation.navigate('Support' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>المزيد</Text>
        <Text style={styles.headerSubtitle}>الإعدادات والخدمات</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الحساب والمالية</Text>
          
          <MenuItem
            icon={
              <LinearGradient
              colors={['#9E9E9E', '#757575']}
              style={[styles.iconBackground, styles.highlightedIcon]}
              >
                <Ionicons name="card" size={26} color="white" />
              </LinearGradient>
            }
            title="السداد"
            subtitle="قريباً - سداد الفواتير والمدفوعات"
            onPress={() => {}} // غير قابل للضغط
            showArrow={false}
          />

          <MenuItem
            icon={
              <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.iconBackground}
              >
                <Ionicons name="document-text" size={24} color="white" />
              </LinearGradient>
            }
            title="كشف الحساب"
            subtitle="سجل العمليات المالية"
            onPress={handleAccountStatementPress}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التحليلات والإحصائيات</Text>
          
          <MenuItem
            icon={
              <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.iconBackground}
              >
                <MaterialIcons name="analytics" size={24} color="white" />
              </LinearGradient>
            }
            title="الإحصائيات"
            subtitle="تحليل الأداء والمبيعات"
            onPress={handleStatisticsPress}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإعدادات والدعم</Text>
          
          <MenuItem
            icon={
              <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.iconBackground}
              >
                <Ionicons name="settings" size={24} color="white" />
              </LinearGradient>
            }
            title="الإعدادات"
            subtitle="إعدادات التطبيق والحساب"
            onPress={handleSettingsPress}
          />

          <MenuItem
            icon={
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.iconBackground}
              >
                <Ionicons name="help-circle" size={24} color="white" />
              </LinearGradient>
            }
            title="الدعم الفني"
            subtitle="مساعدة ودعم فني"
            onPress={handleSupportPress}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    direction: 'rtl',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'Cairo-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    fontFamily: 'Cairo-SemiBold',
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 15,
    marginLeft: 15,
  },
  iconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightedIcon: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    shadowColor: '#9E9E9E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: 'Cairo-SemiBold',
  },
  menuSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: 'Cairo-Regular',
  },
  bottomSpacing: {
    height: 30,
  },
});

export default MoreScreen;
