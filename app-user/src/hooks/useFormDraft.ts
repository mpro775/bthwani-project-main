// src/hooks/useFormDraft.ts
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FormData {
  [key: string]: any;
}

interface UseFormDraftOptions {
  key: string;
  interval?: number; // Save interval in milliseconds
  enabled?: boolean;
}

export const useFormDraft = ({ key, interval = 2000, enabled = true }: UseFormDraftOptions) => {
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(true);
  const formDataRef = useRef<FormData>({});
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  // Load saved draft on mount
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const loadDraft = async () => {
      try {
        const saved = await AsyncStorage.getItem(`formDraft-${key}`);
        if (saved) {
          const parsedData = JSON.parse(saved);
          setFormData(parsedData);
          formDataRef.current = parsedData;
        }
      } catch (error) {
        console.warn('Failed to load form draft:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [key, enabled]);

  // Auto-save functionality
  useEffect(() => {
    if (!enabled || !interval) return;

    const saveDraft = async () => {
      if (Object.keys(formDataRef.current).length > 0) {
        try {
          await AsyncStorage.setItem(
            `formDraft-${key}`,
            JSON.stringify(formDataRef.current)
          );
        } catch (error) {
          console.warn('Failed to save form draft:', error);
        }
      }
    };

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(saveDraft, interval);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formDataRef.current, key, interval, enabled]);

  const updateField = (field: string, value: any) => {
    const newData = { ...formDataRef.current, [field]: value };
    formDataRef.current = newData;
    setFormData(newData);
  };

  const updateFields = (fields: FormData) => {
    const newData = { ...formDataRef.current, ...fields };
    formDataRef.current = newData;
    setFormData(newData);
  };

  const saveDraft = async () => {
    if (Object.keys(formDataRef.current).length > 0) {
      try {
        await AsyncStorage.setItem(
          `formDraft-${key}`,
          JSON.stringify(formDataRef.current)
        );
      } catch (error) {
        console.warn('Failed to save form draft:', error);
      }
    }
  };

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(`formDraft-${key}`);
      formDataRef.current = {};
      setFormData({});
    } catch (error) {
      console.warn('Failed to clear form draft:', error);
    }
  };

  const getDraft = () => {
    return formDataRef.current;
  };

  return {
    formData,
    isLoading,
    updateField,
    updateFields,
    saveDraft,
    clearDraft,
    getDraft,
  };
};

// Hook for managing form state with draft persistence
export const usePersistentForm = <T extends FormData>(
  initialData: T,
  options: UseFormDraftOptions
) => {
  const draft = useFormDraft(options);

  // Merge initial data with saved draft
  const mergedInitialData = useRef<T>({
    ...initialData,
    ...(draft.formData as Partial<T>),
  });

  const [formData, setFormData] = useState<T>(mergedInitialData.current);

  useEffect(() => {
    if (!draft.isLoading && Object.keys(draft.formData).length > 0) {
      setFormData(prev => ({ ...prev, ...draft.formData }));
    }
  }, [draft.isLoading, draft.formData]);

  const updateFormData = (updates: Partial<T>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    draft.updateFields(updates);
  };

  const resetForm = () => {
    setFormData(initialData);
    draft.clearDraft();
  };

  return {
    formData,
    updateFormData,
    resetForm,
    saveDraft: draft.saveDraft,
    clearDraft: draft.clearDraft,
    isDraftLoading: draft.isLoading,
    hasDraft: Object.keys(draft.formData).length > 0,
  };
};
