import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../api/axios-instance";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Button,
  Stack,
  Paper,
  Avatar,
  Skeleton,
  Tooltip,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  LocationOn,
  AccessTime,
  LocalOffer,
  Whatshot,
  Stars,
  NearMe,
} from "@mui/icons-material";

import {
  addFavorite,
  getFavoritesCounts,
  removeFavorite,
} from "../../api/favorites";

// ------------ Helpers ------------
const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1586201375761-83865001e31b?q=80&w=1200&auto=format&fit=crop"; // بلايسهولدر نظيف

const pickBestPromo = (
  arr?: { _id: string; value?: number; valueType?: "percentage" | "fixed" }[]
) => {
  if (!arr || !arr.length) return undefined;
  const perc = arr
    .filter((p) => p.valueType === "percentage")
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  if (perc.length) return perc[0];
  const fixed = arr
    .filter((p) => p.valueType === "fixed")
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  return fixed[0] || arr[0];
};

type FilterKey =
  | "all"
  | "featured"
  | "trending"
  | "topRated"
  | "nearest"
  | "favorite";

type RawStoreResponse = {
  _id?: string;
  name?: string;
  address?: string;
  image?: string;
  logo?: string;
  rating?: number;
  tags?: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isFavorite?: boolean;
  distanceMeters?: number;
  distanceKm?: number;
  time?: string;
  isOpen?: boolean;
  promoBadge?: string;
  promoPercent?: number;
  promoId?: string;
  category?: { usageType?: "grocery" | "restaurant" | string };
  [key: string]: unknown;
};

type Store = {
  _id: string;
  name: string;
  address?: string;
  image?: string;
  logo?: string;
  rating?: number;
  tags?: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isFavorite?: boolean;
  distanceMeters?: number;
  distanceKm?: number;
  time?: string;
  isOpen?: boolean;
  promoBadge?: string;
  promoPercent?: number;
  promoId?: string;
  category?: { usageType?: "grocery" | "restaurant" | string };
};

type SubCategory = {
  _id: string;
  name: string;
  image?: string;
  usageType?: string;
};

const STORE_FAV_TYPE = "grocery"; // ✅ أصلحنا النوع

export default function GroceryScreen() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();
  const { isAuthenticated } = useAuth();

  const parentCategoryId = categoryId; // فئة الأب من المسار
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(
    parentCategoryId
  );

  // --- 1) حالة جديدة: مكدّس الفئات ---
  const [catStack, setCatStack] = useState<string[]>(
    parentCategoryId ? [parentCategoryId] : []
  );

  const [baseStores, setBaseStores] = useState<Store[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);

  const [filter, setFilter] = useState<FilterKey>("all");

  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const geoKey =
    filter === "nearest" && coords.lat && coords.lng
      ? `${coords.lat.toFixed(3)},${coords.lng.toFixed(3)}`
      : "no-geo";

  // المعرّف الفعلي الذي نجلب أبناءه ونبني عليه "الكل"
  const currentParentId = catStack[catStack.length - 1];

  const cacheRef = useRef<Map<string, { ts: number; data: Store[] }>>(
    new Map()
  );
  const TTL = 60_000;

  // عند تغيّر المسار نعيد ضبط الـ stack والـ active
  useEffect(() => {
    setCatStack(parentCategoryId ? [parentCategoryId] : []);
    setActiveCategoryId(parentCategoryId);
  }, [parentCategoryId]);

  // الموقع للأقرب
  useEffect(() => {
    if (filter !== "nearest") {
      setCoords({});
      return;
    }
    const savedLocation = localStorage.getItem("selected_location");
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        if (location.lat && location.lng) {
          setCoords({ lat: location.lat, lng: location.lng });
          return;
        }
      } catch {
        // Ignore error
      }
    }
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, [filter]);

  // --- 2) اجلب الفئات الفرعية بالاعتماد على currentParentId ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!currentParentId) {
        setSubCategories([]);
        return;
      }
      try {
        setSubLoading(true);
        const { data } = await axiosInstance.get(
          `/delivery/categories/children/${currentParentId}`,
          { params: { usageType: "grocery" } } // اختياري، كتلميح للسيرفر
        );

        const arr = Array.isArray(data) ? data : [];
        const normalized = arr
          .map((c: {
            _id?: string;
            id?: string;
            name?: string;
            title?: string;
            image?: string;
            icon?: string;
            cover?: string;
            usageType?: string;
          }) => ({
            _id: c?._id ?? c?.id ?? "",
            name: c?.name ?? c?.title ?? "",
            image: c?.image ?? c?.icon ?? c?.cover ?? "",
            usageType: c?.usageType,
          }))
          .filter((c) => !!c._id && !!c.name && (!c.usageType || c.usageType === "grocery"));

        if (!cancelled) setSubCategories(normalized);
      } catch {
        if (!cancelled) setSubCategories([]);
      } finally {
        if (!cancelled) setSubLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentParentId]); // <-- بدل parentCategoryId

  // جلب السيرفر
  const fetchBaseFromServer = useCallback(
    async (
      categoryIdForFetch?: string,
      nearest: { lat: number; lng: number } | null = null,
      signal?: AbortSignal
    ) => {
      const params: Record<string, unknown> = {
        page: 1,
        limit: 24,
        usageType: "grocery",
      }; // hint
      if (categoryIdForFetch) {
        params.categoryId = categoryIdForFetch; // ✨ الاسم الشائع
        params.category = categoryIdForFetch; // ✨ دعم أسماء مختلفة بدون كسر
      }

      let endpoint = "/delivery/stores";
      if (
        nearest &&
        Number.isFinite(nearest.lat) &&
        Number.isFinite(nearest.lng)
      ) {
        endpoint = "/delivery/stores/search";
        params.filter = "nearest";
        params.lat = nearest.lat;
        params.lng = nearest.lng;
      }

      const { data } = await axiosInstance.get(endpoint, { params, signal });
      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const list: Store[] = (raw || []).map((s: unknown) => {
        const storeData = s as RawStoreResponse;
        return {
          ...storeData,
          _id: storeData._id || "",
          name: storeData.name || "",
          image: storeData.image || storeData.logo,
          distanceKm:
            typeof storeData.distanceMeters === "number"
              ? storeData.distanceMeters / 1000
              : storeData.distanceKm,
          isOpen:
            typeof storeData.isOpen === "boolean" ? storeData.isOpen : true,
          isFavorite: !!storeData.isFavorite,
          tags: storeData.tags || [],
        };
      });

      // المفضلة (grocery)
      if (list.length) {
        try {
          const ids = list.map((x: Store) => x._id);
          const map = await getFavoritesCounts("grocery", ids);
          list.forEach((st) => {
            st.isFavorite = (map?.[st._id] ?? 0) === 1;
          });
        } catch {
          // Ignore error
        }
      }

      // العروض
      try {
        if (list.length) {
          const idsCsv = list.map((s) => s._id).join(",");
          const { data: promoResp } = await axiosInstance.get(
            "/delivery/promotions/by-stores",
            { params: { ids: idsCsv, channel: "app" } }
          );
          const getStorePromos = (sid: string) =>
            Array.isArray(promoResp)
              ? promoResp.filter((p: { store?: string }) => p.store === sid)
              : promoResp?.[sid];

          list.forEach((s) => {
            const best = pickBestPromo(getStorePromos(s._id));
            if (best) {
              s.promoBadge =
                best.valueType === "percentage"
                  ? `خصم ${best.value}%`
                  : `خصم ${best.value} ﷼`;
              s.promoPercent =
                best.valueType === "percentage" ? best.value : undefined;
              s.promoId = best._id;
            }
          });
        }
      } catch {
        // Ignore error
      }

      return list;
    },
    []
  );

  const fetchBaseWithCache = useCallback(
    async (categoryIdForFetch?: string, signal?: AbortSignal) => {
      const key = categoryIdForFetch || "no-cat";
      const hit = cacheRef.current.get(key);
      if (hit && Date.now() - hit.ts < TTL) {
        return hit.data;
      }
      const data = await fetchBaseFromServer(categoryIdForFetch, null, signal);
      cacheRef.current.set(key, { ts: Date.now(), data });
      return data;
    },
    [fetchBaseFromServer]
  );

  const serverKey = useMemo(() => {
    const effCat = activeCategoryId ?? parentCategoryId ?? "no-cat";
    return filter === "nearest"
      ? `nearest|${effCat}|${geoKey}`
      : `base|${effCat}`;
  }, [activeCategoryId, parentCategoryId, filter, geoKey]);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const effCat = activeCategoryId ?? parentCategoryId;
        let data: Store[] = [];

        if (filter === "nearest") {
          if (coords.lat && coords.lng) {
            data = await fetchBaseFromServer(
              effCat,
              { lat: coords.lat, lng: coords.lng },
              controller.signal
            );
          } else {
            data = [];
          }
        } else {
          data = await fetchBaseWithCache(effCat, controller.signal);
        }
        if (!alive) return;
        setBaseStores(data);
      } catch {
        if (!alive) return;
        setBaseStores([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [
    serverKey,
    fetchBaseFromServer,
    fetchBaseWithCache,
    coords.lat,
    coords.lng,
    activeCategoryId,
    filter,
    parentCategoryId,
  ]);

  const applyLocalFilters = useCallback((list: Store[], f: FilterKey) => {
    let out = [...list];
    if (f === "featured") out = out.filter((s) => !!s.isFeatured);
    if (f === "trending") out = out.filter((s) => !!s.isTrending);
    if (f === "topRated")
      out = out
        .filter((s) => (s.rating ?? 0) > 0)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (f === "favorite") out = out.filter((s) => !!s.isFavorite);
    return out; // nearest مطبق سيرفريًا
  }, []);

  useEffect(() => {
    setStores(applyLocalFilters(baseStores, filter));
  }, [baseStores, filter, applyLocalFilters]);

  // إعادة مزامنة المفضلة
  useEffect(() => {
    if (!baseStores.length || !isAuthenticated) return;
    const ids = baseStores.map((s) => s._id);
    getFavoritesCounts(STORE_FAV_TYPE, ids)
      .then((map) => {
        setBaseStores((prev) =>
          prev.map((s) => ({ ...s, isFavorite: (map?.[s._id] ?? 0) === 1 }))
        );
      })
      .catch(() => {});
  }, [baseStores, isAuthenticated]);

  const [favBusy, setFavBusy] = useState<Set<string>>(new Set());

  const toggleFavorite = async (
    storeId: string,
    cur: boolean,
    store?: Partial<Store>
  ) => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    if (favBusy.has(storeId)) return;
    setFavBusy((s) => new Set(s).add(storeId));
    setStores((prev) =>
      prev.map((s) => (s._id === storeId ? { ...s, isFavorite: !cur } : s))
    );
    try {
      if (cur) {
        await removeFavorite(storeId, STORE_FAV_TYPE);
      } else {
        await addFavorite(storeId, STORE_FAV_TYPE, {
          title: store?.name,
          image:
            typeof store?.logo === "string" && store.logo
              ? store.logo
              : store?.image,
          rating: typeof store?.rating === "number" ? store.rating : undefined,
          storeId,
          storeType:
            (store as { category?: { usageType?: "grocery" | "restaurant" } })
              ?.category?.usageType ?? "grocery",
        });
      }
    } catch (e: unknown) {
      const error = e as { response?: { status?: number } };
      if (error?.response?.status === 401) navigate("/auth/login");
      setStores((prev) =>
        prev.map((s) => (s._id === storeId ? { ...s, isFavorite: cur } : s))
      );
    } finally {
      setFavBusy((s) => {
        const n = new Set(s);
        n.delete(storeId);
        return n;
      });
    }
  };

  // --- 3) بناء الشرائح (الكل + رجوع + أبناء الحالي) ---
  const categoryChips = useMemo(
    () => [{ _id: "__all__", name: "الكل", image: "" }, ...subCategories],
    [subCategories]
  );

  return (
    <Box sx={{ flex: 1, bgcolor: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: "#fff",
          borderBottom: "1px solid #eee",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
   
      </Paper>

      {/* الفئات الفرعية */}
      <Box sx={{ mt: 2, mb: 2, px: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ overflowX: "auto", pb: 1 }}>
          {/* زر رجوع يظهر فقط إن كان لدينا طبقات أعمق */}
          {catStack.length > 1 && (
            <Chip
              label="رجوع"
              onClick={() => {
                setCatStack((prev) => {
                  const next = [...prev];
                  next.pop();
                  const newParent = next[next.length - 1];
                  setActiveCategoryId(newParent); // صفّي على الأب بعد الرجوع
                  return next;
                });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              sx={{ bgcolor: "#f0f0f0" }}
            />
          )}

          {subLoading ? (
            [...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="rounded" width={90} height={36} />
            ))
          ) : (
            categoryChips.map((item) => {
              const isAll = item._id === "__all__";
              const isActive = isAll
                ? activeCategoryId === currentParentId // "الكل" نشط لو نصفي على parent الحالي
                : activeCategoryId === item._id;

              return (
                <Chip
                  key={item._id}
                  avatar={
                    !isAll && item.image ? <Avatar src={item.image} imgProps={{ referrerPolicy: "no-referrer" }} /> : undefined
                  }
                  label={item.name}
                  clickable
                  onClick={() => {
                    if (isAll) {
                      // "الكل" = صفّي متاجر الأب الحالي
                      setActiveCategoryId(currentParentId);
                    } else {
                      // اختَر ابنًا: صفّي عليه + انزل لطبقته (اعرض أبناءه)
                      setActiveCategoryId(item._id);
                      setCatStack((prev) => [...prev, item._id]);
                    }
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  sx={{
                    minWidth: 88,
                    borderRadius: 999,
                    fontWeight: 600,
                    ...(isActive ? { bgcolor: "#D84315", color: "#fff" } : { bgcolor: "#f6f7f8", color: "#333" }),
                  }}
                />
              );
            })
          )}
        </Stack>
      </Box>

      {/* الفلاتر */}
      <Box sx={{ px: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {[
            { key: "all", label: "الكل", icon: <Stars fontSize="small" /> },
            {
              key: "featured",
              label: "مميز",
              icon: <LocalOffer fontSize="small" />,
            },
            {
              key: "trending",
              label: "شائع",
              icon: <Whatshot fontSize="small" />,
            },
            {
              key: "topRated",
              label: "الأعلى تقييماً",
              icon: <Stars fontSize="small" />,
            },
            {
              key: "nearest",
              label: "الأقرب",
              icon: <NearMe fontSize="small" />,
            },
            {
              key: "favorite",
              label: "المفضلة",
              icon: <Favorite fontSize="small" />,
            },
          ].map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              icon={f.icon}
              onClick={() => setFilter(f.key as FilterKey)}
              color={filter === f.key ? "primary" : "default"}
              variant={filter === f.key ? "filled" : "outlined"}
              sx={{ borderRadius: 999, height: 34 }}
            />
          ))}
        </Stack>
      </Box>

      {/* قائمة المتاجر */}
      <Box sx={{ px: 2, pb: 6 }}>
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ overflow: "hidden" }}>
                  <Skeleton variant="rectangular" height={180} />
                  <Box sx={{ p: 2 }}>
                    <Skeleton width="60%" height={24} />
                    <Skeleton width="80%" height={18} />
                    <Skeleton width="40%" height={18} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : stores.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 6, color: "#888" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              ما في متاجر ضمن هذه الفئة حالياً 👀
            </Typography>
            <Typography variant="body2">
              جرّب تغيير الفلتر أو اختيار فئة أخرى.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {stores.map((store) => (
              <Grid key={store._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    borderRadius: 3,
                    overflow: "hidden",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                  }}
                  onClick={() => navigate(`/business/${store._id}`)}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={store.image || store.logo || PLACEHOLDER_IMG}
                      alt={store.name}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PLACEHOLDER_IMG;
                      }}
                      sx={{ objectFit: "cover", bgcolor: "#f5f5f5" }}
                    />
                    {/* شارة الحالة */}
                    <Chip
                      label={store.isOpen ? "مفتوح الآن" : "مغلق"}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        bgcolor: store.isOpen ? "success.main" : "grey.600",
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    />
                    {/* شارات التخفيض */}
                    {store.promoBadge && (
                      <Chip
                        label={store.promoBadge}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          bgcolor: "#D84315",
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      />
                    )}
                    {/* زر المفضلة */}
                    <Box sx={{ position: "absolute", bottom: 10, right: 12 }}>
                      <Tooltip
                        title={
                          store.isFavorite
                            ? "إزالة من المفضلة"
                            : "إضافة للمفضلة"
                        }
                      >
                        <Button
                          size="small"
                          sx={{
                            minWidth: "auto",
                            p: 1,
                            borderRadius: "50%",
                            bgcolor: "rgba(255,255,255,0.95)",
                            "&:hover": { bgcolor: "#fff" },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(
                              store._id,
                              !!store.isFavorite,
                              store
                            );
                          }}
                          disabled={favBusy.has(store._id)}
                        >
                          {store.isFavorite ? (
                            <Favorite color="error" />
                          ) : (
                            <FavoriteBorder />
                          )}
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom fontWeight={800}>
                      {store.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      noWrap
                    >
                      {store.address || "العنوان غير محدد"}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Rating
                        value={store.rating || 4.5}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2">
                        {(store.rating ?? 4.5).toFixed(1)}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <LocationOn color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {typeof store.distanceKm === "number"
                          ? `${store.distanceKm.toFixed(1)} كم`
                          : "غير محدد"}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTime color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {store.time || "غير محدد"}
                      </Typography>
                    </Stack>

                    {store.tags && store.tags.length > 0 && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ mt: 2, flexWrap: "wrap", gap: 0.5 }}
                      >
                        {store.tags.slice(0, 3).map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
