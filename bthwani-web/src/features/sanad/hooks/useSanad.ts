// src/features/sanad/hooks/useSanad.ts
import { useState, useEffect, useCallback } from 'react';
import { getSanad, createSanad, updateSanad, deleteSanad } from '../api';
import type { SanadItem, CreateSanadPayload, UpdateSanadPayload } from '../types';

export function useSanad(id?: string) {
  const [item, setItem] = useState<SanadItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // تحميل الطلب
  const loadItem = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getSanad(id);
      setItem(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل طلب السند';
      setError(errorMessage);
      console.error('خطأ في تحميل السند:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // إنشاء طلب سند جديد
  const createItem = useCallback(async (payload: CreateSanadPayload): Promise<SanadItem> => {
    try {
      setSaving(true);
      setError(null);
      const newItem = await createSanad(payload);
      setItem(newItem);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إنشاء طلب السند';
      setError(errorMessage);
      console.error('خطأ في إنشاء السند:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // تحديث طلب السند
  const updateItem = useCallback(async (payload: UpdateSanadPayload): Promise<SanadItem> => {
    if (!item) throw new Error('لا يوجد طلب سند للتحديث');

    try {
      setSaving(true);
      setError(null);
      const updatedItem = await updateSanad(item._id, payload);
      setItem(updatedItem);
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث طلب السند';
      setError(errorMessage);
      console.error('خطأ في تحديث السند:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [item]);

  // حذف طلب السند
  const deleteItem = useCallback(async (): Promise<void> => {
    if (!item) throw new Error('لا يوجد طلب سند للحذف');

    try {
      setDeleting(true);
      setError(null);
      await deleteSanad(item._id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حذف طلب السند';
      setError(errorMessage);
      console.error('خطأ في حذف السند:', err);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [item]);

  // تحديث الحالة المحلية
  const updateLocalItem = useCallback((updates: Partial<SanadItem>) => {
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
