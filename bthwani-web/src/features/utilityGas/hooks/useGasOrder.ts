// src/features/utilityGas/hooks/useGasOrder.ts
import { useEffect, useMemo, useState } from "react";
import { storage } from "../../../utils/storage"; // عدّل المسار إذا لزم
import {  QTY_MIN_FALLBACK } from "../constants";
import type {
  Address,
  GasOrderPayload,
  PayMethod,
  UtilityOptionsResp,
} from "../types";
import { createGasOrder, fetchUserProfile, fetchUtilityOptions } from "../api";

export function useGasOrder() {
  const isLoggedIn = Boolean(storage.getIdToken());

  // Loading
  const [profileLoading, setProfileLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const selectedAddress = useMemo(
    () => addresses.find((a) => a._id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const [options, setOptions] = useState<UtilityOptionsResp | null>(null);
  const unitPrice = options?.gas?.pricePerCylinder || 0;
  const minQty = options?.gas?.minQty || QTY_MIN_FALLBACK;
  const cylinderSize = options?.gas?.cylinderSizeLiters || 20;

  // UI State
  const [qty, setQty] = useState<number>(1);
  const [pm, setPM] = useState<PayMethod>("cash");
  const [notes, setNotes] = useState("");
  const [scheduledMode, setScheduledMode] = useState<"now" | "later">("now");
  const [scheduledFor, setScheduledFor] = useState("");
  const [addrModal, setAddrModal] = useState(false);

  const itemsTotal = unitPrice * qty;

  const requireAuth = () => {
    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("auth:prompt", { detail: { mode: "login" } })
      );
      return false;
    }
    return true;
  };

  const canSubmit =
    !profileLoading &&
    !optionsLoading &&
    !!selectedAddressId &&
    !!options?.gas &&
    qty >= minQty &&
    !submitting &&
    isLoggedIn;

  // 1) Load profile/addresses
  useEffect(() => {
    (async () => {
      try {
        setProfileLoading(true);
        if (!isLoggedIn) {
          window.dispatchEvent(
            new CustomEvent("auth:prompt", { detail: { mode: "login" } })
          );
          setAddresses([]);
          setSelectedAddressId(null);
          return;
        }
        const user = await fetchUserProfile();
        const addrs = (user?.addresses || []) as Address[];
        setAddresses(addrs);
        const defId = user?.defaultAddressId || addrs?.[0]?._id || null;
        setSelectedAddressId(defId);
      } catch (e) {
        console.warn("profile error", e);
        alert("فشل تحميل العناوين. تأكد من تسجيل الدخول.");
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [isLoggedIn]);

  // 2) Load utility options by city
  useEffect(() => {
    (async () => {
      if (!selectedAddress?.city) return;
      try {
        setOptionsLoading(true);
        const data = await fetchUtilityOptions(selectedAddress.city);
        setOptions(data);
        if (data?.gas?.minQty) setQty((q) => Math.max(q, data.gas!.minQty));
      } catch (e) {
        console.warn("utility options error", e);
        alert("لا توجد إعدادات تسعير لهذه المدينة.");
        setOptions(null);
      } finally {
        setOptionsLoading(false);
      }
    })();
  }, [selectedAddress?.city]);

  async function submitOrder() {
    if (!canSubmit) {
      if (!requireAuth()) return;
      return;
    }
    try {
      setSubmitting(true);
      const payload: GasOrderPayload = {
        kind: "gas",
        city: selectedAddress!.city,
        variant: `${cylinderSize}L`,
        quantity: qty,
        paymentMethod: pm,
        addressId: selectedAddressId!,
        notes: notes?.trim()
          ? [{ body: notes.trim(), visibility: "public" }]
          : [],
        ...(scheduledMode === "later" && scheduledFor?.trim()
          ? { scheduledFor: new Date(scheduledFor).toISOString() }
          : {}),
      };
      const data = await createGasOrder(payload);
      return data?._id || data?.id || null;
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } }).response?.data?.message || (e as { message?: string }).message || "تعذّر إنشاء الطلب.";
      alert(msg);
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    // loading
    profileLoading,
    optionsLoading,
    submitting,

    // data
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    selectedAddress,
    options,

    // ui state
    qty,
    setQty,
    pm,
    setPM,
    notes,
    setNotes,
    scheduledMode,
    setScheduledMode,
    scheduledFor,
    setScheduledFor,
    addrModal,
    setAddrModal,

    // computed
    unitPrice,
    minQty,
    cylinderSize,
    itemsTotal,
    canSubmit,

    // helpers
    isLoggedIn,
    requireAuth,
    submitOrder,
  } as const;
}
