/**
 * Support Screen - vendor-app
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
import { getMySupportTickets, createSupportTicket } from '../api/support';

export default function SupportScreen() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['vendor-support-tickets'],
    queryFn: getMySupportTickets,
  });

  const createMutation = useMutation({
    mutationFn: createSupportTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-support-tickets'] });
      setShowForm(false);
      setSubject('');
      setDescription('');
      setCategory('general');
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>الدعم الفني</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.buttonText}>{showForm ? 'إلغاء' : 'تذكرة جديدة'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="الموضوع"
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="الوصف"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => createMutation.mutate({ subject, description, category })}
          >
            <Text style={styles.buttonText}>إرسال</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.ticket}>
            <Text style={styles.ticketSubject}>{item.subject}</Text>
            <Text style={styles.ticketStatus}>{item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loading: { flex: 1, justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
  button: { backgroundColor: '#007AFF', padding: 8, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  form: { backgroundColor: '#fff', padding: 16, margin: 16, borderRadius: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 },
  textArea: { height: 100 },
  submitButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  ticket: { backgroundColor: '#fff', padding: 16, margin: 16, borderRadius: 12 },
  ticketSubject: { fontSize: 16, fontWeight: 'bold' },
  ticketStatus: { color: '#666', marginTop: 4 },
});
