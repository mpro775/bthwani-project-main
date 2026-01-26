// src/features/kenz/hooks/useKenz.ts
import { useState, useEffect, useCallback } from 'react';
import { getKenz, createKenz, updateKenz, deleteKenz } from '../api';
import type { KenzItem, CreateKenzPayload, UpdateKenzPayload } from '../types';

export function useKenz(id?: string) {
  const [item, setItem] = useState<KenzItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // تحميل الإعلان
  const loadItem = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getKenz(id);
      setItem(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل الإعلان';
      setError(errorMessage);
      console.error('خطأ في تحميل كنز:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // إنشاء إعلان جديد
  const createItem = useCallback(async (payload: CreateKenzPayload): Promise<KenzItem> => {
    try {
      setSaving(true);
      setError(null);
      const newItem = await createKenz(payload);
      setItem(newItem);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إنشاء الإعلان';
      setError(errorMessage);
      console.error('خطأ في إنشاء كنز:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // تحديث الإعلان
  const updateItem = useCallback(async (payload: UpdateKenzPayload): Promise<KenzItem> => {
    if (!item) throw new Error('لا يوجد إعلان للتحديث');

    try {
      setSaving(true);
      setError(null);
      const updatedItem = await updateKenz(item._id, payload);
      setItem(updatedItem);
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث الإعلان';
      setError(errorMessage);
      console.error('خطأ في تحديث كنز:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [item]);

  // حذف الإعلان
  const deleteItem = useCallback(async (): Promise<void> => {
    if (!item) throw new Error('لا يوجد إعلان للحذف');

    try {
      setDeleting(true);
      setError(null);
      await deleteKenz(item._id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حذف الإعلان';
      setError(errorMessage);
      console.error('خطأ في حذف كنز:', err);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [item]);

  // تحديث الحالة المحلية
  const updateLocalItem = useCallback((updates: Partial<KenzItem>) => {
    if (item) {
      setItem({ ...item, ...updates });
    }
  }, [item]);

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id, loadItem]);

  return {
    item,
    loading,
    saving,
    deleting,
    error,
    loadItem,
    createItem,
    updateItem,
    deleteItem,
    updateLocalItem,
  };
}
