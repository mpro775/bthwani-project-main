// ✅ أضف utility
type OrderKind = "marketplace" | "errand" | "utility";

type OrderSource = "shein" | "other" | undefined;

type Order = {
  id: string;
  kind: OrderKind;
  source?: OrderSource;
  store?: string;
  logo?: string;
  total: number;
  storeId?: string;
  date: string;
  monthKey: string;
  time: string;
  status: string;
  rawStatus?: string;
  category: string;
  address?: string;
  errand?: {
    pickupLabel?: string;
    dropoffLabel?: string;
    driverName?: string;
  };
  // 👇 سنملأه دائمًا حتى في utility بسطر واحد
  basket: {
    name: string;
    quantity: number;
    price: number;
  }[];
  deliveryFee: number;
  discount: number;
  paymentMethod: string;
  notes?: string;

  // (اختياري) تمكين بيانات خام للعرض إن احتجتها لاحقًا
  utility?: {
    kind?: "gas" | "water";
    variant?: string;
    quantity?: number;
    city?: string;
  };
};

// ترجمات الحالة (موسّعة)
const translateStatus = (status: string) => {
  switch (status) {
    case "pending_confirmation":
      return "في انتظار التأكيد";
    case "under_review":
      return "قيد المراجعة";
    case "preparing":
      return "قيد التحضير";
    case "assigned":
      return "تم الإسناد";
    case "out_for_delivery":
      return "في الطريق";
    case "delivered":
      return "تم التوصيل";
    case "returned":
      return "مرتجع";
    case "cancelled":
      return "ملغي";
    // حالات الشراء بالإنابة (SHEIN)
    case "awaiting_procurement":
      return "بانتظار الشراء";
    case "procured":
      return "تم الشراء";
    case "procurement_failed":
      return "فشل الشراء";
    default:
      return status;
  }
};

// محوّل من شكل الباك إلى Order موحّد
// utils/orderUtils.ts
export const mapOrder = (o: any): Order => {
  // إذا جاي جاهز (يحمل id و basket مصفوفة) لا تلمسه:
  if (o && o.id && Array.isArray(o.basket)) {
    return {
      ...o,
      id: String(o.id),
      monthKey: o.monthKey || deriveMonthKey(o.createdAt),
    };
  }

  // ✅ حالة utility أولًا
  if (o?.orderType === "utility" || o?.utility) {
    const u = o.utility || {};
    const qty = Number(u.quantity ?? 1);
    const unitPrice = Number(
      u.unitPrice ?? (u.subtotal ? Number(u.subtotal) / (qty || 1) : 0)
    );

    // اسم السطر
    const name =
      u.kind === "gas"
        ? `دبّة غاز ${u.variant || ""}`.trim()
        : u.kind === "water"
        ? `وايت ${u.variant || ""}`.trim()
        : "خدمة";

    const created = new Date(o.createdAt || Date.now());
    const address =
      typeof o.address === "string"
        ? o.address
        : o.address
        ? `${o.address.city}، ${o.address.street}`
        : "—";

    return {
      id: String(o._id ?? o.id ?? o.orderId),
      kind: "utility",
      category:
        u.kind === "gas" ? "الغاز" : u.kind === "water" ? "وايت" : "الخدمات",
      store: u.kind === "gas" ? "خدمة الغاز" : "خدمة الوايت",
      storeId: undefined,
      logo: undefined,
      date: created.toISOString().slice(0, 10),
      time: created.toLocaleTimeString("ar", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      monthKey: deriveMonthKey(created),
      address,
      status: translateStatus(o.status),
      rawStatus: o.status,
      basket: [
        {
          name,
          quantity: qty || 1,
          price: unitPrice || 0,
        },
      ],
      deliveryFee: Number(o.deliveryFee ?? 0),
      discount: Number(o.coupon?.discountOnItems ?? 0),
      // إجمالي الطلب يجي جاهز من السيرفر في o.price
      total: Number(
        o.price ?? Number(u.subtotal ?? 0) + Number(o.deliveryFee ?? 0)
      ),
      paymentMethod: o.paymentMethod || "cash",
      notes: o.notes,
      utility: {
        kind: u.kind,
        variant: u.variant,
        quantity: qty,
        city: u.city ?? o.address?.city,
      },
    };
  }

  const created = new Date(o.createdAt || Date.now());
  const isErrand = o.orderType === "errand" || !!o.errand;

  // ⬇️ تجهيز تسميات من/إلى لطلبات اخدمني
  const pickupLabel =
    o?.errand?.pickup?.label ||
    (o?.errand?.pickup?.city && o?.errand?.pickup?.street
      ? `${o.errand.pickup.city}، ${o.errand.pickup.street}`
      : undefined) ||
    undefined;

  const dropoffLabel =
    o?.errand?.dropoff?.label ||
    (o?.errand?.dropoff?.city && o?.errand?.dropoff?.street
      ? `${o.errand.dropoff.city}، ${o.errand.dropoff.street}`
      : undefined) ||
    undefined;

  const driverName =
    o?.driver?.name || o?.assignedDriver?.name || o?.driverName || undefined;

  return {
    id: String(o._id ?? o.id ?? o.orderId),
    store:
      o.storeName ??
      o.subOrders?.[0]?.store?.name ??
      (isErrand ? "اخدمني" : "—"),
    storeId: o.subOrders?.[0]?.store?._id ?? o.store?._id ?? undefined,
    date: created.toISOString().slice(0, 10),
    time: created.toLocaleTimeString("ar", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    monthKey: deriveMonthKey(created),
    address:
      typeof o.address === "string"
        ? o.address
        : o.address
        ? `${o.address.city}، ${o.address.street}`
        : isErrand
        ? dropoffLabel || "—"
        : "—",
    status: translateStatus(o.status),
    rawStatus: o.status,
    category: isErrand ? "اخدمني" : "المتاجر",
    kind: isErrand ? "errand" : "marketplace",

    // ✅ تلخيص اخدمني لواجهة "من / إلى"
    errand: isErrand
      ? {
          pickupLabel: pickupLabel || "—",
          dropoffLabel: dropoffLabel || "—",
          driverName,
        }
      : undefined,

    basket: Array.isArray(o.items)
      ? o.items.map((it: any) => ({
          name: it.name,
          quantity: it.quantity,
          price: Number(it.unitPrice ?? it.price ?? 0),
          originalPrice: Number(
            it.unitPriceOriginal ?? it.originalPrice ?? it.price ?? 0
          ),
        }))
      : [],

    total: Number(o.price ?? o.total ?? 0), // اخدمني يضع السعر في price
    deliveryFee: Number(o.deliveryFee ?? o.errand?.deliveryFee ?? 0),
    discount: Number(o.coupon?.discountOnItems ?? 0),
    paymentMethod: o.paymentMethod || "cash",
    notes: o.notes,
    logo: o.subOrders?.[0]?.store?.logo,
  };
};

const deriveMonthKey = (d: any) => {
  const dt = d instanceof Date ? d : new Date(d || Date.now());
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
};

export type { Order, OrderKind, OrderSource };
