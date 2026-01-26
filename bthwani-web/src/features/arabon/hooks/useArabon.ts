// src/features/arabon/hooks/useArabon.ts
import { useState, useEffect, useCallback } from 'react';
import { getArabon, createArabon, updateArabon, deleteArabon } from '../api';
import type { ArabonItem, CreateArabonPayload, UpdateArabonPayload } from '../types';

export function useArabon(id?: string) {
  const [item, setItem] = useState<ArabonItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // تحميل العربون
  const loadItem = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getArabon(id);
      setItem(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل العربون';
      setError(errorMessage);
      console.error('خطأ في تحميل عربون:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // إنشاء عربون جديد
  const createItem = useCallback(async (payload: CreateArabonPayload): Promise<ArabonItem> => {
    try {
      setSaving(true);
      setError(null);
      const newItem = await createArabon(payload);
      setItem(newItem);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إنشاء العربون';
      setError(errorMessage);
      console.error('خطأ في إنشاء عربون:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // تحديث العربون
  const updateItem = useCallback(async (payload: UpdateArabonPayload): Promise<ArabonItem> => {
    if (!item) throw new Error('لا يوجد عربون للتحديث');

    try {
      setSaving(true);
      setError(null);
      const updatedItem = await updateArabon(item._id, payload);
      setItem(updatedItem);
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث العربون';
      setError(errorMessage);
      console.error('خطأ في تحديث عربون:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [item]);

  // حذف العربون
  const deleteItem = useCallback(async (): Promise<void> => {
    if (!item) throw new Error('لا يوجد عربون للحذف');

    try {
      setDeleting(true);
      setError(null);
      await deleteArabon(item._id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حذف العربون';
      setError(errorMessage);
      console.error('خطأ في حذف عربون:', err);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [item]);

  // تحديث الحالة المحلية
  const updateLocalItem = useCallback((updates: Partial<ArabonItem>) => {
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
