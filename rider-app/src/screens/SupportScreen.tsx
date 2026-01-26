/**
 * Support Screen - rider-app (Drivers)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMySupportTickets, createSupportTicket, CreateTicketDto } from '../api/support';

export default function SupportScreen() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateTicketDto>({
    subject: '',
    description: '',
    category: 'general',
  });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['driver-support-tickets'],
    queryFn: getMySupportTickets,
  });

  const createMutation = useMutation({
    mutationFn: createSupportTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-support-tickets'] });
      setShowForm(false);
      setFormData({ subject: '', description: '', category: 'general' });
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>الدعم الفني</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonText}>
            {showForm ? 'إلغاء' : '+ تذكرة'}
          </Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
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
            style={styles.submitButton}
            onPress={() => createMutation.mutate(formData)}
            disabled={createMutation.isPending}
          >
            <Text style={styles.submitButtonText}>
              {createMutation.isPending ? 'جاري الإرسال...' : 'إرسال'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketSubject}>{item.subject}</Text>
              <View
                style={[
                  styles.status,
                  item.status === 'open' && styles.statusOpen,
                  item.status === 'in_progress' && styles.statusInProgress,
                  item.status === 'resolved' && styles.statusResolved,
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.ticketDescription}>{item.description}</Text>
            <Text style={styles.ticketDate}>
              {new Date(item.createdAt).toLocaleDateString('ar-SA')}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد تذاكر دعم</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  form: { backgroundColor: '#fff', padding: 16, margin: 16, borderRadius: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: 'bold' },
  ticketCard: { backgroundColor: '#fff', padding: 16, margin: 16, borderRadius: 12 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ticketSubject: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  status: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusOpen: { backgroundColor: '#fee2e2' },
  statusInProgress: { backgroundColor: '#fef3c7' },
  statusResolved: { backgroundColor: '#dcfce7' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  ticketDescription: { color: '#666', marginBottom: 8 },
  ticketDate: { fontSize: 12, color: '#999' },
  empty: { backgroundColor: '#fff', padding: 32, margin: 16, borderRadius: 12, alignItems: 'center' },
  emptyText: { color: '#999' },
});

