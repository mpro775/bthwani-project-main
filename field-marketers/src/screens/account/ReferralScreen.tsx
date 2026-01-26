import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import COLORS from '../../constants/colors';
import { useFonts, Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo';

interface ReferralData {
  link: string;
  ref: string;
  marketerId: string;
}

interface ReferralStats {
  clicks: number;
  signups: number;
  conversions: number;
}

export default function ReferralScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);

  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  const loadReferralData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get/generate referral code
      const codeResponse = await api.post('/marketer/referrals/generate-code');
      const code = codeResponse.data?.code;
      setReferralData({
        link: `https://bthwani.com/join?ref=${code}`,
        ref: code,
        marketerId: user.id,
      });

      // Get referral stats
      const statsResponse = await api.get('/marketer/referrals/statistics');
      setStats({
        clicks: statsResponse.data?.total || 0,
        signups: statsResponse.data?.successful || 0,
        conversions: statsResponse.data?.pending || 0,
      });

    } catch (error: any) {
      console.error('Error loading referral data:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل بيانات الإحالة');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadStatsOnly = useCallback(async () => {
    if (!user?.id) return;

    try {
      const statsResponse = await api.get('/marketer/referrals/statistics');
      setStats({
        clicks: statsResponse.data?.total || 0,
        signups: statsResponse.data?.successful || 0,
        conversions: statsResponse.data?.pending || 0,
      });
    } catch (error: any) {
      console.error('Error loading referral stats:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadReferralData();
  }, [loadReferralData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReferralData();
    setRefreshing(false);
  }, [loadReferralData]);

  const copyToClipboard = async () => {
    if (!referralData?.link) return;

    try {
      await Clipboard.setStringAsync(referralData.link);
      Alert.alert('تم النسخ', 'تم نسخ رابط الإحالة إلى الحافظة');
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في نسخ الرابط');
    }
  };

  const shareReferralLink = async () => {
    if (!referralData?.link) return;

    try {
      const result = await Share.share({
        message: `انضم إلى عائلة بثواني واحصل على فرص عمل رائعة كمسوّق!\n\n${referralData.link}\n\nاستخدم هذا الرابط للتسجيل والبدء في رحلتك معنا!`,
        title: 'انضم إلى فريق بثواني',
      });

      if (result.action === Share.sharedAction) {
        // Track share if needed
        console.log('Referral link shared');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في مشاركة الرابط');
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator style={styles.centered} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>نظام الإحالة</Text>
          <Text style={styles.headerSubtitle}>
            شارك رابطك واحصل على عمولة من كل مسوّق جديد ينضم عبر رابطك
          </Text>
        </View>

        {/* Referral Link Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>رابط الإحالة الخاص بك</Text>

          {loading && !referralData ? (
            <ActivityIndicator style={styles.centered} />
          ) : (
            <View style={styles.linkContainer}>
              <Text style={styles.linkText} numberOfLines={2}>
                {referralData?.link || 'جاري التحميل...'}
              </Text>

              <View style={styles.linkActions}>
                <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                  <Text style={styles.copyButtonText}>نسخ الرابط</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareButton} onPress={shareReferralLink}>
                  <Text style={styles.shareButtonText}>مشاركة</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إحصائيات الإحالة</Text>

          {loading && !stats ? (
            <ActivityIndicator style={styles.centered} />
          ) : (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>عدد النقرات</Text>
                <Text style={styles.statValue}>{stats?.clicks || 0}</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>عدد التسجيلات</Text>
                <Text style={styles.statValue}>{stats?.signups || 0}</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>معدل التحويل</Text>
                <Text style={styles.statValue}>
                  {stats?.conversions ? `${stats.conversions.toFixed(1)}%` : '0%'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>كيف يعمل النظام؟</Text>

          <View style={styles.instructionsContainer}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>انسخ رابط الإحالة الخاص بك</Text>
            </View>

            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>شارك الرابط مع أصدقائك المهتمين بالعمل كمسوّقين</Text>
            </View>

            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>عندما يقوم صديقك بالتسجيل عبر رابطك، ستحصل على عمولة</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.blue,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Cairo_600SemiBold',
    color: COLORS.blue,
    marginBottom: 16,
  },
  linkContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  linkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  copyButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  copyButtonText: {
    color: COLORS.white,
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 14,
  },
  shareButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: COLORS.white,
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.primary,
  },
  instructionsContainer: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Cairo_600SemiBold',
    lineHeight: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.text,
    lineHeight: 20,
  },
});
