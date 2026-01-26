// src/pages/delivery/StoreDetails.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from 'react-helmet-async';

import Loading from "../../components/common/Loading";
import ProductCard from "../../components/delivery/ProductCard";
import {
  Box,
  Typography,
  IconButton,
  Container,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab,
  Button as MuiButton,
  Fade,
} from "@mui/material";
import {
  ArrowBack,
  AccessTime,
  LocalShipping,
  ShoppingCart,
  Restaurant,
  Star,
  Store as StoreIcon,
  Inventory,
  Schedule,
} from "@mui/icons-material";
import axiosInstance from "../../api/axios-instance";
import { fetchStoreDetails } from "../../api/delivery";
import type { Store } from "../../types";

// ---------- ألوان موحدة ----------


// ---------- Types ----------
type StoreSection = { _id: string; name: string };
type SubCategory = { _id: string; name: string };

type MerchantProduct = {
  _id: string;
  section?: StoreSection;
  product?: { name: string; image?: string; description?: string };
  price: number;
  customImage?: string;
  customDescription?: string;
};

type StoreProduct = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  subCategoryId?: string;
};

type UIProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string | undefined;
  description?: string;
  discountLabel?: string;
};

// ---------- Promo helpers ----------
const pickBestPromo = (
  arr?: { value?: number; valueType?: "percentage" | "fixed"; _id: string }[]
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

const applyBestPromo = (
  basePrice: number,
  promos: { value?: number; valueType?: "percentage" | "fixed"; _id: string }[]
) => {
  const best = pickBestPromo(promos);
  if (!best)
    return { price: basePrice, originalPrice: undefined, label: undefined };

  if (best.valueType === "percentage") {
    const v = Math.max(0, Math.min(100, best.value ?? 0));
    const price = Math.max(0, Math.round(basePrice * (1 - v / 100)));
    return { price, originalPrice: basePrice, label: `خصم ${v}%` };
  } else {
    const v = Math.max(0, best.value ?? 0);
    const price = Math.max(0, basePrice - v);
    return { price, originalPrice: basePrice, label: `-${v} ر.ي` };
  }
};

// ---------- Component ----------
const StoreDetails: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);

  // تبويبات + عناصر
  const [tabs, setTabs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [productsByTab, setProductsByTab] = useState<
    Record<string, UIProduct[]>
  >({});

  // --------- Layout: أعمدة الشبكة حسب العرض ----------
  const getGrid = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 360;
    if (w >= 1280) return 4; // desktop
    if (w >= 992) return 3; // lg
    if (w >= 640) return 2; // sm
    return 1; // mobile
  };
  const [cols, setCols] = useState(getGrid());
  useEffect(() => {
    const onResize = () => setCols(getGrid());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ---------- تحميل بيانات المتجر ----------
  const loadStore = useCallback(async () => {
    if (!storeId) return;
    try {
      setLoading(true);
      const storeData = await fetchStoreDetails(storeId);
      setStore(storeData);
    } catch (e) {
      console.error("Error loading store:", e);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  // ---------- تحميل التبويبات والمنتجات + العروض ----------
  useEffect(() => {
    if (!store?._id) return;

    const run = async () => {
      try {
        let tabNames: string[] = [];
        const grouped: Record<string, UIProduct[]> = {};

        // Grocery?
        if ((store as { category?: { usageType?: string } }).category?.usageType === "grocery") {
          // 1) الأقسام
          const { data: sections } = await axiosInstance.get<StoreSection[]>(
            "/delivery/sections",
            { params: { store: store._id } }
          );
          tabNames = sections.map((s) => s.name);

          // 2) المنتجات (merchant-products)
          const { data: allProds } = await axiosInstance.get<MerchantProduct[]>(
            "/groceries/merchant-products",
            { params: { store: store._id } }
          );

          // 3) عروض المنتجات + عرض المتجر
          const productIds = Array.from(new Set(allProds.map((p) => p._id)));
          const idsCsv = productIds.join(",");

          const [{ data: prodPromoMap }, { data: storePromoMap }] =
            await Promise.all([
              axiosInstance.get<Record<string, unknown[]>>(
                "/delivery/promotions/by-products",
                { params: { ids: idsCsv, channel: "app" } }
              ),
              axiosInstance.get<Record<string, unknown[]>>(
                "/delivery/promotions/by-stores",
                { params: { ids: store._id, channel: "app" } }
              ),
            ]);

          const storePromos = storePromoMap?.[store.id] || [];

          sections.forEach((sec) => {
            const items = allProds
              .filter((p) => p.section?._id === sec._id)
              .map((p) => {
                const base = p.price;
                const merged = [
                  ...(prodPromoMap?.[p._id] || []),
                  ...storePromos,
                ];
                const { price, originalPrice, label } = applyBestPromo(
                  base,
                  merged as { value?: number; valueType?: "percentage" | "fixed"; _id: string }[] 
                );

                return {
                  id: p._id,
                  name: p.product?.name ?? "بدون اسم",
                  price,
                  originalPrice,
                  image: p.customImage || p.product?.image,
                  description: p.customDescription || p.product?.description,
                  discountLabel: label,
                } as UIProduct;
              });
            grouped[sec.name] = items;
          });
        } else {
          // Restaurant (أو عام)
          // 1) الفئات الفرعية
          const { data: subs } = await axiosInstance.get<SubCategory[]>(
            `/delivery/subcategories/store/${store._id}`
          );
          tabNames = subs.map((s) => s.name);

          // 2) المنتجات
          const { data: prods } = await axiosInstance.get<StoreProduct[]>(
            "/delivery/products",
            { params: { storeId: store._id } }
          );

          // 3) عروض
          const productIds = Array.from(new Set(prods.map((p) => p._id)));
          const idsCsv = productIds.join(",");

          const [{ data: prodPromoMap }, { data: storePromoMap }] =
            await Promise.all([
              axiosInstance.get<Record<string, unknown[]>>(
                "/delivery/promotions/by-products",
                { params: { ids: idsCsv, channel: "app" } }
              ),
              axiosInstance.get<Record<string, unknown[]>>(
                "/delivery/promotions/by-stores",
                { params: { ids: store._id, channel: "app" } }
              ),
            ]);

          const storePromos = storePromoMap?.[store.id] || [];

          subs.forEach((sub) => {
            const items = prods
              .filter((p) => p.subCategoryId === sub._id)
              .map((p) => {
                const base = p.price;
                const merged = [
                  ...(prodPromoMap?.[p._id] || []),
                  ...storePromos,
                ];
                const { price, originalPrice, label } = applyBestPromo(
                  base,
                  merged as { value?: number; valueType?: "percentage" | "fixed"; _id: string }[] 
                );

                return {
                  id: p._id,
                  name: p.name,
                  price,
                  originalPrice,
                  image: p.image,
                  description: p.description,
                  discountLabel: label,
                } as UIProduct;
              });
            grouped[sub.name] = items;
          });
        }

        setTabs(tabNames);
        setProductsByTab(grouped);
        setSelectedTab((prev) =>
          prev && tabNames.includes(prev) ? prev : tabNames[0] || ""
        );
      } catch (err) {
        console.error("Failed to load store details (tabs/products):", err);
      }
    };

    run();
  }, [store]);

  const products = useMemo(
    () => productsByTab[selectedTab] || [],
    [productsByTab, selectedTab]
  );

  // ---------- Render ----------
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Loading fullScreen={false} />
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', mt: 2 }}>
            جاري تحميل تفاصيل المتجر...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!store) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Fade in timeout={800}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              textAlign: 'center',
              py: 8,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <StoreIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  color: 'text.primary'
                }}
              >
                المتجر غير متوفر
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6, mb: 4 }}
              >
                عذراً، هذا المتجر غير متوفر حالياً أو قد يكون قد تم حذفه.
              </Typography>
              <MuiButton
                onClick={() => navigate("/")}
                variant="contained"
                sx={{
                  borderRadius: 3,
                  px: 6,
                  py: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
                  },
                }}
              >
                العودة للرئيسية
              </MuiButton>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      paddingBottom: { xs: 20, md: 8 }
    }}>
      {/* SEO Meta Tags */}
      {store && (
        <Helmet>
          <title>{store.name} | بثواني - خدمة التوصيل السريع في اليمن</title>
          <meta name="description" content={`${store.name} - ${store.description || 'متجر موثوق للتوصيل السريع في اليمن'}. تقييم ${store.rating || 'ممتاز'} ⭐. اطلب الآن من بثواني!`} />
          <link rel="canonical" href={`https://bthwaniapp.com/stores/${store._id}`} />
          <meta property="og:title" content={`${store.name} | بثواني`} />
          <meta property="og:description" content={`اطلب من ${store.name} عبر بثواني - خدمة التوصيل السريع في اليمن`} />
          <meta property="og:image" content={store.image || '/icons/icon-512.png'} />
          <meta property="og:url" content={`https://bthwaniapp.com/stores/${store._id}`} />
          <meta property="og:type" content="website" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:title" content={`${store.name} | بثواني`} />
          <meta property="twitter:description" content={`اطلب من ${store.name} عبر بثواني`} />
          <meta property="twitter:image" content={store.image || '/icons/icon-512.png'} />
        </Helmet>
      )}

      {/* Header */}
      <Fade in timeout={800}>
        <Box sx={{
          position: 'relative',
          height: 280,
          background: store.image
            ? 'none'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          overflow: 'hidden',
          borderRadius: '0 0 20px 20px',
        }}>
          {store.image && (
            <>
              <img
                src={store.image}
                alt={store.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <Box sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(102, 126, 234, 0.3) 100%)'
              }} />
            </>
          )}

          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              },
            }}
            aria-label="عودة"
          >
            <ArrowBack sx={{ color: 'primary.main' }} />
          </IconButton>

          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 4,
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
              >
                <StoreIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    mb: 1
                  }}
                >
                  {store.name}
                </Typography>
                {store.description && (
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.95,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                      fontSize: '1.1rem'
                    }}
                  >
                    {store.description}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Info + Tabs + Products */}
      <Container maxWidth="lg" sx={{ px: 2, py: 4 }}>
        {/* Info */}
        <Fade in timeout={1000}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              mb: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Restaurant sx={{ color: 'primary.main' }} />
                معلومات المتجر
              </Typography>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(4, 1fr)',
                },
                gap: 3,
                mb: (store.isOpen && store.isActive && !store.forceClosed) ? 0 : 3,
              }}>
                {store.rating && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    backgroundColor: 'rgba(255, 193, 7, 0.05)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'rgba(255, 193, 7, 0.2)',
                  }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Star sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        التقييم {store.ratingsCount ? `(${store.ratingsCount})` : ''}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                        {store.rating.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {(store.deliveryTime || store.avgPrepTimeMin) && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'rgba(76, 175, 80, 0.2)',
                  }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AccessTime sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">وقت التوصيل</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {store.deliveryTime || `${store.avgPrepTimeMin} دقيقة`}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {(store.deliveryFee !== undefined || store.deliveryBaseFee !== undefined) && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    backgroundColor: (store.deliveryFee === 0 || store.deliveryBaseFee === 0) ? 'rgba(76, 175, 80, 0.05)' : 'rgba(33, 150, 243, 0.05)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: (store.deliveryFee === 0 || store.deliveryBaseFee === 0) ? 'rgba(76, 175, 80, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                  }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: (store.deliveryFee === 0 || store.deliveryBaseFee === 0)
                          ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                          : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LocalShipping sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">رسوم التوصيل</Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 'bold',
                          color: (store.deliveryFee === 0 || store.deliveryBaseFee === 0) ? 'success.main' : 'info.main'
                        }}
                      >
                        {(store.deliveryFee === 0 || store.deliveryBaseFee === 0) ? "مجاني" : `${store.deliveryFee || store.deliveryBaseFee} ر.ي`}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {(store.minOrder || store.minOrderAmount) && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    backgroundColor: 'rgba(156, 39, 176, 0.05)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'rgba(156, 39, 176, 0.2)',
                  }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShoppingCart sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">الحد الأدنى</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                        {store.minOrder || store.minOrderAmount} ر.ي
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Additional Info */}
              <Box sx={{
                display: 'flex',
                gap: 2,
                mt: 3,
                flexWrap: 'wrap',
              }}>
                {store.isTrending && (
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      backgroundColor: 'rgba(255, 87, 34, 0.1)',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'rgba(255, 87, 34, 0.3)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#ff5722', fontWeight: 'bold' }}>
                      متجر رائج
                    </Typography>
                  </Box>
                )}

                {store.isFeatured && (
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      backgroundColor: 'rgba(156, 39, 176, 0.1)',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'rgba(156, 39, 176, 0.3)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                      متجر مميز
                    </Typography>
                  </Box>
                )}

                {store.usageType && (
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'rgba(33, 150, 243, 0.3)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                      {store.usageType === 'grocery' ? 'متجر بقالة' : 'مطعم'}
                    </Typography>
                  </Box>
                )}
              </Box>

              {(!store.isActive || store.forceClosed || !store.isOpen) && (
                <Alert
                  severity="error"
                  sx={{
                    mt: 3,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    py: 2,
                    borderRadius: 2,
                  }}
                >
                  {store.forceClosed ? "المتجر مغلق مؤقتاً" : "المتجر مغلق حالياً"}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* Working Hours */}
        {store.schedule && store.schedule.length > 0 && (
          <Fade in timeout={1100}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                mb: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.primary',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Schedule sx={{ color: 'primary.main' }} />
                  ساعات العمل
                </Typography>

                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                  gap: 2,
                }}>
                  {store.schedule.map((scheduleItem) => (
                    <Box
                      key={scheduleItem.day}
                      sx={{
                        p: 2,
                        backgroundColor: scheduleItem.open ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: scheduleItem.open ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 'bold',
                          color: scheduleItem.open ? 'success.main' : 'error.main',
                          mb: 1,
                          textTransform: 'capitalize',
                        }}
                      >
                        {scheduleItem.day === 'sunday' ? 'الأحد' :
                         scheduleItem.day === 'monday' ? 'الاثنين' :
                         scheduleItem.day === 'tuesday' ? 'الثلاثاء' :
                         scheduleItem.day === 'wednesday' ? 'الأربعاء' :
                         scheduleItem.day === 'thursday' ? 'الخميس' :
                         scheduleItem.day === 'friday' ? 'الجمعة' : 'السبت'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {scheduleItem.open ? `${scheduleItem.from} - ${scheduleItem.to}` : 'مغلق'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Tabs */}
        {tabs.length > 0 && (
          <Fade in timeout={1200}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                mb: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.primary',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Restaurant sx={{ color: 'primary.main' }} />
                  فئات المنتجات
                </Typography>
                <Tabs
                  value={selectedTab}
                  onChange={(_, newValue) => setSelectedTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTabs-indicator': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      height: 3,
                      borderRadius: '3px 3px 0 0',
                    },
                  }}
                >
                  {tabs.map((tab) => (
                    <Tab
                      key={tab}
                      label={tab}
                      value={tab}
                      sx={{
                        borderRadius: 3,
                        mx: 0.5,
                        minHeight: 48,
                        px: 3,
                        py: 1.5,
                        fontWeight: selectedTab === tab ? 'bold' : 'normal',
                        fontSize: '1rem',
                        textTransform: 'none',
                        color: selectedTab === tab ? 'primary.main' : 'text.secondary',
                        backgroundColor: selectedTab === tab
                          ? 'rgba(102, 126, 234, 0.05)'
                          : 'transparent',
                        border: 2,
                        borderColor: selectedTab === tab
                          ? 'primary.main'
                          : 'rgba(102, 126, 234, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: selectedTab === tab
                            ? 'rgba(102, 126, 234, 0.08)'
                            : 'rgba(102, 126, 234, 0.02)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    />
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Products in selected tab */}
        <Fade in timeout={1400}>
          <Box>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 'bold',
                mb: 4,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Inventory sx={{ color: 'primary.main' }} />
              {t("delivery.products")}
            </Typography>

            {products.length > 0 ? (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: cols >= 2 ? 'repeat(2, 1fr)' : '1fr',
                  md: cols >= 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                  lg: cols >= 4 ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
                },
                gap: 3,
              }}>
                {products.map((p, index) => (
                  <Fade key={p.id} in timeout={400 + index * 100}>
                    <Box>
                      <ProductCard
                        product={{
                          id: p.id,
                          name: p.name,
                          price: p.price,
                          image: p.image,
                          description: p.description,
                        }}
                        onClick={() => navigate(`/product/${p.id}`, {
                          state: { isMerchantProduct: true }
                        })}
                      />
                    </Box>
                  </Fade>
                ))}
              </Box>
            ) : (
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  py: 8,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <Inventory sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 'bold',
                      mb: 2,
                      color: 'text.primary'
                    }}
                  >
                    لا توجد منتجات
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}
                  >
                    لا توجد منتجات متاحة في هذا القسم حالياً.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default StoreDetails;
