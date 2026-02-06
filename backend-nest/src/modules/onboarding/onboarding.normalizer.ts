/**
 * تطبيع body الطلب: يقبل شكل التطبيق (storeDraft / ownerDraft) أو شكل الباك (storeName, ownerName, ...)
 */
export function normalizeOnboardingBody(body: any): {
  storeName: string;
  ownerName: string;
  phone: string;
  email?: string;
  address: { street?: string; city?: string; district?: string; location: { lat: number; lng: number } };
  type: 'store' | 'vendor' | 'driver';
  categoryId?: string;
  imageUrl?: string;
} {
  if (!body) {
    throw new Error('Body is required');
  }

  const hasAppShape =
    body.storeDraft != null || body.ownerDraft != null;

  if (hasAppShape) {
    const store = body.storeDraft ?? {};
    const owner = body.ownerDraft ?? {};
    return {
      storeName: store.name ?? body.storeName ?? '',
      ownerName: owner.fullName ?? owner.fullName ?? body.ownerName ?? store.name ?? body.storeName ?? '',
      phone: owner.phone ?? body.phone ?? '',
      email: owner.email ?? body.email,
      address: {
        street: store.address ? String(store.address).split(',')[0]?.trim() : body.address?.street ?? '',
        city: body.address?.city ?? '',
        district: body.address?.district,
        location:
          store.location && typeof store.location.lat === 'number' && typeof store.location.lng === 'number'
            ? { lat: store.location.lat, lng: store.location.lng }
            : body.address?.location ?? { lat: 0, lng: 0 },
      },
      type: (body.type ?? (store.usageType === 'vendor' ? 'vendor' : 'store')) as 'store' | 'vendor' | 'driver',
      categoryId: store.category ?? body.categoryId,
      imageUrl: store.image ?? body.imageUrl,
    };
  }

  return {
    storeName: body.storeName ?? '',
    ownerName: body.ownerName ?? '',
    phone: body.phone ?? '',
    email: body.email,
    address: {
      street: body.address?.street,
      city: body.address?.city,
      district: body.address?.district,
      location: body.address?.location ?? { lat: 0, lng: 0 },
    },
    type: body.type ?? 'store',
    categoryId: body.categoryId,
    imageUrl: body.imageUrl,
  };
}

/**
 * تطبيع body التحديث الجزئي: يقبل شكل التطبيق أو الباك، ويرجع فقط الحقول المعرّفة (لـ PATCH).
 */
export function normalizeUpdateBody(
  body: any,
): Partial<{
  storeName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: any;
  type: string;
  categoryId: string;
  imageUrl: string;
}> {
  if (!body || typeof body !== 'object') return {};
  const hasAppShape = body.storeDraft != null || body.ownerDraft != null;
  const full = hasAppShape ? normalizeOnboardingBody(body) : body;
  const out: any = {};
  if (full.storeName !== undefined && full.storeName !== '') out.storeName = full.storeName;
  if (full.ownerName !== undefined && full.ownerName !== '') out.ownerName = full.ownerName;
  if (full.phone !== undefined && full.phone !== '') out.phone = full.phone;
  if (full.email !== undefined) out.email = full.email;
  if (full.address !== undefined && full.address != null) out.address = full.address;
  if (full.type !== undefined && full.type !== '') out.type = full.type;
  if (full.categoryId !== undefined) out.categoryId = full.categoryId;
  if (full.imageUrl !== undefined) out.imageUrl = full.imageUrl;
  return out;
}
