import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getAmaniDetails,
  updateAmaniStatus,
  AmaniOrder,
} from '../../api/amani';

export default function AmaniDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<AmaniOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getAmaniDetails(id);
      setOrder(data);
    } catch (error: any) {
      console.error('Error loading order:', error);
      Alert.alert('خطأ', 'فشل في تحميل تفاصيل الطلب');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusUpdate = async (newStatus: string, note?: string) => {
    if (!id) return;

    setUpdating(true);
    try {
      await updateAmaniStatus(id, newStatus, note);
      Alert.alert('نجح', 'تم تحديث الحالة بنجاح');
      loadOrder();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.message || 'فشل في تحديث الحالة');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'in_progress': return '#8b5cf6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const canUpdateStatus = (currentStatus: string) => {
    return ['confirmed', 'in_progress'].includes(currentStatus);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>الطلب غير موجود</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل الطلب</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{order.title}</Text>

        {/* Description */}
        {order.description && (
          <Text style={styles.description}>{order.description}</Text>
        )}

        {/* Route */}
        {(order.origin || order.destination) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>مسار الرحلة</Text>
            {order.origin && (
              <View style={styles.locationCard}>
                <Ionicons name="location" size={20} color="#3b82f6" />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>من</Text>
                  <Text style={styles.locationAddress}>{order.origin.address}</Text>
                </View>
              </View>
            )}
            {order.destination && (
              <View style={styles.locationCard}>
                <Ionicons name="navigate" size={20} color="#10b981" />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>إلى</Text>
                  <Text style={styles.locationAddress}>{order.destination.address}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Metadata */}
        {order.metadata && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>بيانات إضافية</Text>
            {order.metadata.passengers && (
              <View style={styles.metadataItem}>
                <Ionicons name="people" size={16} color="#6b7280" />
                <Text style={styles.metadataText}>{order.metadata.passengers} أشخاص</Text>
              </View>
            )}
            {order.metadata.luggage && (
              <View style={styles.metadataItem}>
                <Ionicons name="bag" size={16} color="#6b7280" />
                <Text style={styles.metadataText}>يوجد أمتعة</Text>
              </View>
            )}
            {order.metadata.specialRequests && (
              <View style={styles.metadataItem}>
                <Ionicons name="information-circle" size={16} color="#6b7280" />
                <Text style={styles.metadataText}>{order.metadata.specialRequests}</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        {canUpdateStatus(order.status) && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>الإجراءات</Text>
            {order.status === 'confirmed' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.startButton]}
                onPress={() => handleStatusUpdate('in_progress', 'بدأ السائق الرحلة')}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="play" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>بدء الرحلة</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            {order.status === 'in_progress' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => handleStatusUpdate('completed', 'تم إكمال الرحلة')}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>إكمال الرحلة</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التواريخ</Text>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>تاريخ الإنشاء:</Text>
            <Text style={styles.dateValue}>
              {new Date(order.createdAt).toLocaleDateString('ar-SA')}
            </Text>
          </View>
          {order.assignedAt && (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>تاريخ التعيين:</Text>
              <Text style={styles.dateValue}>
                {new Date(order.assignedAt).toLocaleDateString('ar-SA')}
              </Text>
            </View>
          )}
          {order.completedAt && (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>تاريخ الإكمال:</Text>
              <Text style={styles.dateValue}>
                {new Date(order.completedAt).toLocaleDateString('ar-SA')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#111827',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#8b5cf6',
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
});
