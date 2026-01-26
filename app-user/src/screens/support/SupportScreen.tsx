/**
 * Support Screen - app-user (React Native)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { getMySupportTickets, createSupportTicket, CreateTicketDto } from '../../api/support';

export default function SupportScreen() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateTicketDto>({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
  });
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMySupportTickets();
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      Alert.alert('خطأ', 'تعذر تحميل التذاكر');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleSubmit = async () => {
    if (!formData.subject || !formData.description) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setIsSubmitting(true);
      await createSupportTicket(formData);
      await loadTickets();
      setShowCreateForm(false);
      setFormData({ subject: '', description: '', category: 'general', priority: 'medium' });
      Alert.alert('نجح', 'تم إنشاء التذكرة بنجاح');
    } catch (error) {
      console.error('Error creating ticket:', error);
      Alert.alert('خطأ', 'تعذر إنشاء التذكرة');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>الدعم الفني</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Text style={styles.buttonText}>
            {showCreateForm ? 'إلغاء' : 'تذكرة جديدة'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Create Form */}
      {showCreateForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>إنشاء تذكرة دعم</Text>
          
          <TextInput
            style={styles.input}
            placeholder="الموضوع"
            value={formData.subject}
            onChangeText={(text) => setFormData({ ...formData, subject: text })}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="الوصف"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tickets List */}
      <View style={styles.ticketsList}>
        <Text style={styles.sectionTitle}>تذاكري</Text>
        {tickets && tickets.length > 0 ? (
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketSubject}>{item.subject}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'open' && styles.statusOpen,
                      item.status === 'in_progress' && styles.statusInProgress,
                      item.status === 'resolved' && styles.statusResolved,
                    ]}
                  >
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.ticketDescription}>{item.description}</Text>
                <View style={styles.ticketFooter}>
                  <Text style={styles.ticketMeta}>{item.category}</Text>
                  <Text style={styles.ticketMeta}>
                    {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                  </Text>
                </View>
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>لا توجد تذاكر دعم</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    width: '100%',
    paddingVertical: 12,
    marginTop: 8,
  },
  ticketsList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ticketCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusOpen: {
    backgroundColor: '#fee2e2',
  },
  statusInProgress: {
    backgroundColor: '#fef3c7',
  },
  statusResolved: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  ticketDescription: {
    color: '#666',
    marginBottom: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  ticketMeta: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});

