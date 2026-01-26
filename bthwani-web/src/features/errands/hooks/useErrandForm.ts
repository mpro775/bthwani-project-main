// src/features/errands/hooks/useErrandForm.ts
import { useEffect, useMemo, useState } from "react";
import { storage } from "../../../utils/storage";
import type { ErrandForm } from "../types";
import { initialForm } from "../types";
import { STEPS } from "../constants";
import { haversineKm } from "../helpers";

export function useErrandForm() {
  const [form, setForm] = useState<ErrandForm>(initialForm);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feeLoading, setFeeLoading] = useState(false);
  const [estimate, setEstimate] = useState<{
    distanceKm?: number | null;
    deliveryFee?: number | null;
    totalWithTip?: number | null;
  }>({});

  // حفظ البيانات مؤقتاً في localStorage عند كل تغيير
  useEffect(() => {
    const saveFormToStorage = () => {
      try {
        localStorage.setItem("akhdimni_form_data", JSON.stringify(form));
      } catch (error) {
        console.error("Error saving form data to localStorage:", error);
      }
    };

    // حفظ البيانات بعد فترة قصيرة من آخر تغيير لتجنب الحفظ المتكرر
    const timeoutId = setTimeout(saveFormToStorage, 500);

    return () => clearTimeout(timeoutId);
  }, [form]);

  // تحميل البيانات المحفوظة من localStorage عند التحميل
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const savedData = localStorage.getItem("akhdimni_form_data");
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setForm(parsedData);
        }
      } catch (error) {
        console.error("Error loading form data from localStorage:", error);
      }

      // تحميل المواقع المختارة من الخريطة
      const loadStoredLocations = () => {
        // تحميل موقع الاستلام
        const pickupData = storage.getSelectedLocation("akhdimni_pickup");
        if (pickupData) {
          setForm(prev => ({
            ...prev,
            pickup: {
              ...prev.pickup,
              location: { lat: pickupData.lat, lng: pickupData.lng },
              city: pickupData.address?.split(',')[0]?.trim() || prev.pickup.city,
              street: pickupData.address?.split(',')[1]?.trim() || prev.pickup.street,
            }
          }));
          // حذف البيانات بعد استخدامها
          storage.clearSelectedLocation("akhdimni_pickup");
        }

        // تحميل موقع التسليم
        const dropoffData = storage.getSelectedLocation("akhdimni_dropoff");
        if (dropoffData) {
          setForm(prev => ({
            ...prev,
            dropoff: {
              ...prev.dropoff,
              location: { lat: dropoffData.lat, lng: dropoffData.lng },
              city: dropoffData.address?.split(',')[0]?.trim() || prev.dropoff.city,
              street: dropoffData.address?.split(',')[1]?.trim() || prev.dropoff.street,
            }
          }));
          // حذف البيانات بعد استخدامها
          storage.clearSelectedLocation("akhdimni_dropoff");
        }
      };

      // تحميل المواقع بعد تحميل البيانات الأساسية
      setTimeout(loadStoredLocations, 100);
    };

    // تحميل البيانات بعد فترة قصيرة للتأكد من أن المكون جاهز
    const timeoutId = setTimeout(loadStoredData, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const isLoggedIn = Boolean(storage.getIdToken());
  const localDistanceKm = useMemo(
    () => haversineKm(form.pickup.location, form.dropoff.location),
    [form.pickup.location, form.dropoff.location]
  );

  const isSpecsValid = !!form.category && !!form.size;
  const isPickupValid =
    form.pickup.location.lat != null && form.pickup.location.lng != null;
  const isDropoffValid =
    form.dropoff.location.lat != null && form.dropoff.location.lng != null;
  const isPayValid = !!form.paymentMethod;
  const canEstimate = isPickupValid && isDropoffValid;

  function isStepValid(i: number) {
    switch (STEPS[i].key) {
      case "specs":
        return isSpecsValid;
      case "pickup":
        return isPickupValid;
      case "dropoff":
        return isDropoffValid;
      case "pay":
        return isPayValid;
      case "review":
        return canEstimate;
      default:
        return false;
    }
  }

  function handleSet<K extends keyof ErrandForm>(key: K, value: ErrandForm[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function handlePoint(
    which: "pickup" | "dropoff",
    key: keyof ErrandForm["pickup"],
    value: unknown
  ) {
    setForm(
      (s) => ({ ...s, [which]: { ...s[which], [key]: value } } as ErrandForm)
    );
  }

  // تنظيف البيانات المحفوظة عند إتمام الطلب أو إلغائه
  const clearStoredData = () => {
    try {
      localStorage.removeItem("akhdimni_form_data");
    } catch (error) {
      console.error("Error clearing stored form data:", error);
    }
  };

  return {
    form,
    setForm,
    step,
    setStep,
    busy,
    setBusy,
    feeLoading,
    setFeeLoading,
    estimate,
    setEstimate,
    localDistanceKm,
    isLoggedIn,
    isStepValid,
    canEstimate,
    handleSet,
    handlePoint,
    clearStoredData,
  } as const;
}
