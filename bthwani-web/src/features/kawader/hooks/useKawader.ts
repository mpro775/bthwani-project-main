// src/features/kawader/hooks/useKawader.ts
import { useState, useEffect, useCallback } from 'react';
import { getKawader, createKawader, updateKawader, deleteKawader } from '../api';
import type { KawaderItem, CreateKawaderPayload, UpdateKawaderPayload } from '../types';

export function useKawader(id?: string) {
  const [item, setItem] = useState<KawaderItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // تحميل الكادر
  const loadItem = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getKawader(id);
      setItem(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل العرض الوظيفي';
      setError(errorMessage);
      console.error('خطأ في تحميل كادر:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // إنشاء عرض وظيفي جديد
  const createItem = useCallback(async (payload: CreateKawaderPayload): Promise<KawaderItem> => {
    try {
      setSaving(true);
      setError(null);
      const newItem = await createKawader(payload);
      setItem(newItem);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إنشاء العرض الوظيفي';
      setError(errorMessage);
      console.error('خطأ في إنشاء كادر:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // تحديث العرض الوظيفي
  const updateItem = useCallback(async (payload: UpdateKawaderPayload): Promise<KawaderItem> => {
    if (!item) throw new Error('لا يوجد عرض وظيفي للتحديث');

    try {
      setSaving(true);
      setError(null);
      const updatedItem = await updateKawader(item._id, payload);
      setItem(updatedItem);
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث العرض الوظيفي';
      setError(errorMessage);
      console.error('خطأ في تحديث كادر:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [item]);

  // حذف العرض الوظيفي
  const deleteItem = useCallback(async (): Promise<void> => {
    if (!item) throw new Error('لا يوجد عرض وظيفي للحذف');

    try {
      setDeleting(true);
      setError(null);
      await deleteKawader(item._id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حذف العرض الوظيفي';
      setError(errorMessage);
      console.error('خطأ في حذف كادر:', err);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [item]);

  // تحديث الحالة المحلية
  const updateLocalItem = useCallback((updates: Partial<KawaderItem>) => {
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
