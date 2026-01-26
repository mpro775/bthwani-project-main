// src/features/utilityWater/hooks/useWaterOrder.ts
import { useEffect, useMemo, useState } from "react";
import { storage } from "../../../utils/storage"; // عدّل المسار حسب مشروعك
import type {
  Address,
  PayMethod,
  UtilityOptionsResp,
  WaterOrderPayload,
  WaterSize,
  WaterSizeKey,
} from "../types";
import { SIZE_ORDER, QTY_MIN } from "../constants";
import {
  fetchUserProfile,
  fetchUtilityOptions,
  createWaterOrder,
} from "../api";

export function useWaterOrder() {
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

  // UI State
  const [size, setSize] = useState<WaterSizeKey | null>(null);
  const [half, setHalf] = useState(false);
  const [qty, setQty] = useState<number>(1);
  const [pm, setPM] = useState<PayMethod>("cash");
  const [notes, setNotes] = useState("");
  const [scheduledMode, setScheduledMode] = useState<"now" | "later">("now");
  const [scheduledFor, setScheduledFor] = useState("");
  const [addrModal, setAddrModal] = useState(false);

  // Derived
  const water = options?.water || null;
  const sizes = useMemo(() => water?.sizes || [], [water]);
  const currentSize = useMemo(
    () => sizes.find((s) => s.key === size) || null,
    [sizes, size]
  );

  const displayUnitPrice = useMemo(() => {
    if (!currentSize) return 0;
    if (!half) return Math.ceil(currentSize.pricePerTanker || 0);
    const policy = water?.halfPolicy || "multiplier";
    if (policy === "linear")
      return Math.ceil((currentSize.pricePerTanker || 0) * 0.5);
    if (policy === "multiplier")
      return Math.ceil((currentSize.pricePerTanker || 0) * 0.6);
    // fixed: غير معروف طرف العميل
    return 0; // نعرض شرطة "—"
  }, [currentSize, half, water?.halfPolicy]);

  const itemsTotal = useMemo(() => {
    if (!currentSize) return 0;
    if (half) return displayUnitPrice || 0; // نصف واحد
    return (displayUnitPrice || 0) * qty;
  }, [currentSize, displayUnitPrice, half, qty]);

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
    !!water &&
    !!currentSize &&
    (!half ? qty >= QTY_MIN : true) &&
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
        alert("فشل تحميل العناوين.");
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
        // enforce order small -> medium -> large
        if (data?.water?.sizes?.length) {
          data.water.sizes = SIZE_ORDER.map((k) =>
            data.water!.sizes.find((s) => s.key === k)
          ).filter(Boolean) as WaterSize[];
        }
        setOptions(data);
        const firstKey = data?.water?.sizes?.[0]?.key || null;
        setSize(firstKey);
        if (!data?.water?.allowHalf) setHalf(false);
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
    if (!canSubmit || !currentSize) {
      if (!requireAuth()) return null;
      return null;
    }
    try {
      setSubmitting(true);
      const payload: WaterOrderPayload = {
        kind: "water",
        city: selectedAddress!.city,
        variant: currentSize.key,
        quantity: half ? 0.5 : qty,
        paymentMethod: pm,
        addressId: selectedAddressId!,
        notes: notes?.trim()
          ? [{ body: notes.trim(), visibility: "public" }]
          : [],
        ...(scheduledMode === "later" && scheduledFor?.trim()
          ? { scheduledFor: new Date(scheduledFor).toISOString() }
          : {}),
      };
      const data = await createWaterOrder(payload);
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
    selectedAddress,
    selectedAddressId,
    setSelectedAddressId,
    options,
    // ui
    size,
    setSize,
    half,
    setHalf,
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
    // derived
    sizes,
    currentSize,
    displayUnitPrice,
    itemsTotal,
    canSubmit,
    // helpers
    isLoggedIn,
    requireAuth,
    submitOrder,
  } as const;
}
