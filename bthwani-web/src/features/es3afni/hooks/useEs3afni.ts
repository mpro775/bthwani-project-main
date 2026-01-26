// src/features/es3afni/hooks/useEs3afni.ts
import { useState, useEffect, useCallback } from 'react';
import { getEs3afni, createEs3afni, updateEs3afni, deleteEs3afni } from '../api';
import type { Es3afniItem, CreateEs3afniPayload, UpdateEs3afniPayload } from '../types';

export function useEs3afni(id?: string) {
  const [item, setItem] = useState<Es3afniItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // تحميل البلاغ
  const loadItem = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getEs3afni(id);
      setItem(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل البلاغ';
      setError(errorMessage);
      console.error('خطأ في تحميل اسعفني:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // إنشاء بلاغ جديد
  const createItem = useCallback(async (payload: CreateEs3afniPayload): Promise<Es3afniItem> => {
    try {
      setSaving(true);
      setError(null);
      const newItem = await createEs3afni(payload);
      setItem(newItem);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إنشاء البلاغ';
      setError(errorMessage);
      console.error('خطأ في إنشاء اسعفني:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // تحديث البلاغ
  const updateItem = useCallback(async (payload: UpdateEs3afniPayload): Promise<Es3afniItem> => {
    if (!item) throw new Error('لا يوجد بلاغ للتحديث');

    try {
      setSaving(true);
      setError(null);
      const updatedItem = await updateEs3afni(item._id, payload);
      setItem(updatedItem);
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث البلاغ';
      setError(errorMessage);
      console.error('خطأ في تحديث اسعفني:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [item]);

  // حذف البلاغ
  const deleteItem = useCallback(async (): Promise<void> => {
    if (!item) throw new Error('لا يوجد بلاغ للحذف');

    try {
      setDeleting(true);
      setError(null);
      await deleteEs3afni(item._id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حذف البلاغ';
      setError(errorMessage);
      console.error('خطأ في حذف اسعفني:', err);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [item]);

  // تحديث الحالة المحلية
  const updateLocalItem = useCallback((updates: Partial<Es3afniItem>) => {
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
