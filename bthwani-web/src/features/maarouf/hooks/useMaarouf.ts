// src/features/maarouf/hooks/useMaarouf.ts
import { useState, useEffect, useCallback } from 'react';
import { getMaarouf, createMaarouf, updateMaarouf, deleteMaarouf } from '../api';
import type { MaaroufItem, CreateMaaroufPayload, UpdateMaaroufPayload } from '../types';

export function useMaarouf(id?: string) {
  const [item, setItem] = useState<MaaroufItem | null>(null);
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
      const data = await getMaarouf(id);
      setItem(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل الإعلان';
      setError(errorMessage);
      console.error('خطأ في تحميل إعلان معروف:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // إنشاء إعلان جديد
  const createItem = useCallback(async (payload: CreateMaaroufPayload): Promise<MaaroufItem> => {
    try {
      setSaving(true);
      setError(null);
      const newItem = await createMaarouf(payload);
      setItem(newItem);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إنشاء الإعلان';
      setError(errorMessage);
      console.error('خطأ في إنشاء إعلان معروف:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // تحديث الإعلان
  const updateItem = useCallback(async (payload: UpdateMaaroufPayload): Promise<MaaroufItem> => {
    if (!item) throw new Error('لا يوجد إعلان للتحديث');

    try {
      setSaving(true);
      setError(null);
      const updatedItem = await updateMaarouf(item._id, payload);
      setItem(updatedItem);
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث الإعلان';
      setError(errorMessage);
      console.error('خطأ في تحديث إعلان معروف:', err);
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
      await deleteMaarouf(item._id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حذف الإعلان';
      setError(errorMessage);
      console.error('خطأ في حذف إعلان معروف:', err);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [item]);

  // تحديث الحالة المحلية
  const updateLocalItem = useCallback((updates: Partial<MaaroufItem>) => {
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
