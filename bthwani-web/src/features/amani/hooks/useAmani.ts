// src/features/amani/hooks/useAmani.ts
import { useState, useEffect, useCallback } from 'react';
import { getAmani, createAmani, updateAmani, deleteAmani } from '../api';
import type { AmaniItem, CreateAmaniPayload, UpdateAmaniPayload } from '../types';

export function useAmani(id?: string) {
  const [item, setItem] = useState<AmaniItem | null>(null);
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
      const data = await getAmani(id);
      setItem(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل طلب النقل النسائي';
      setError(errorMessage);
      console.error('خطأ في تحميل الأماني:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // إنشاء طلب نقل نسائي جديد
  const createItem = useCallback(async (payload: CreateAmaniPayload): Promise<AmaniItem> => {
    try {
      setSaving(true);
      setError(null);
      const newItem = await createAmani(payload);
      setItem(newItem);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إنشاء طلب النقل النسائي';
      setError(errorMessage);
      console.error('خطأ في إنشاء الأماني:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // تحديث طلب النقل النسائي
  const updateItem = useCallback(async (payload: UpdateAmaniPayload): Promise<AmaniItem> => {
    if (!item) throw new Error('لا يوجد طلب نقل نسائي للتحديث');

    try {
      setSaving(true);
      setError(null);
      const updatedItem = await updateAmani(item._id, payload);
      setItem(updatedItem);
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث طلب النقل النسائي';
      setError(errorMessage);
      console.error('خطأ في تحديث الأماني:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [item]);

  // حذف طلب النقل النسائي
  const deleteItem = useCallback(async (): Promise<void> => {
    if (!item) throw new Error('لا يوجد طلب نقل نسائي للحذف');

    try {
      setDeleting(true);
      setError(null);
      await deleteAmani(item._id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حذف طلب النقل النسائي';
      setError(errorMessage);
      console.error('خطأ في حذف الأماني:', err);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [item]);

  // تحديث الحالة المحلية
  const updateLocalItem = useCallback((updates: Partial<AmaniItem>) => {
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
