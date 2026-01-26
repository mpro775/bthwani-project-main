import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Typography,
  Button,
  Modal,
  Backdrop,
  Fade,
  CircularProgress,
  Container,
  IconButton,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Store as StoreIcon,
  LocalDining as DiningIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material";

import CategoryFiltersBar from "../../components/category/CategoryFiltersBar";
import DeliveryBannerSlider from "../../components/delivery/BannerSlider";
import ErrorBoundary from "../../components/common/ErrorBoundary";
import axiosInstance from "../../api/axios-instance";

// ⭐ جديد: API المفضلة + محدد النوع (مؤقتًا معطل للويب)
const addFavorite = async (id: string, type: string, data?: Record<string, unknown>) => {
  console.log("Add favorite:", id, type, data);
  return Promise.resolve();
};

const getFavoritesCounts = async (type: string, ids: string[]) => {
  console.log("Get favorites:", type, ids);
  return Promise.resolve({});
};

const removeFavorite = async (id: string, type: string) => {
  console.log("Remove favorite:", id, type);
  return Promise.resolve();
};

// Types for the component
interface DeliveryStore {
  _id: string;
  name: string;
  address?: string;
  distance?: string;
  time?: string;
  rating?: number;
  isOpen?: boolean;
  isFavorite?: boolean;
  tags?: string[];
  image?: string;
  logo?: string;
  isTrending?: boolean;
  isFeatured?: boolean;
  distanceKm?: number;
}

const CategoryDetailsScreen = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const [stores, setStores] = useState<DeliveryStore[]>([]);

  const [loading, setLoading] = useState(true);
  const [filterModal, setFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    meal: "",
    trending: false,
    featured: false,
    topRated: false,
    nearest: false,
    favorite: false,
  });
  // Initialize favorites when stores are loaded
  useEffect(() => {
    if (!stores.length) return;
    const ids = stores.map((s) => s._id);
    getFavoritesCounts("restaurant", ids)
      .then((map: Record<string, number>) => {
        setStores((prev) =>
          prev.map((s) => {
            const v = map?.[s._id];
            return { ...s, isFavorite: (v ?? 0) === 1 };
          })
        );
      })
      .catch(() => {});
  }, [stores]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(
          `/delivery/stores?categoryId=${categoryId}`
        );
        const arr: DeliveryStore[] = Array.isArray(data) ? data : [];

        // Remove duplicates and normalize data
        const unique = new Map<string, DeliveryStore>();
        arr.forEach((s) => {
          if (s?._id && !unique.has(s._id)) unique.set(s._id, s);
        });

        const final = Array.from(unique.values()).map((store) => ({
          ...store,
          isOpen: typeof store.isOpen === "boolean" ? store.isOpen : true,
          isFavorite: typeof store.isFavorite === "boolean" ? store.isFavorite : false,
          tags: store.tags || [],
          distance: store.distance || "غير محدد",
          time: store.time || "غير محدد",
          rating: store.rating || 4.5,
        }));

        setStores(final);
      } catch (error) {
        console.error("Error fetching stores:", error);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId]);

  // ⭐ جديد: تبديل المفضلة
  const [favBusy, setFavBusy] = useState<Set<string>>(new Set());

  const toggleFavorite = async (storeId: string, cur: boolean, store?: DeliveryStore) => {
    // منع السبام: تجاهل لو هذا المتجر قيد المعالجة
    if (favBusy.has(storeId)) return;
    setFavBusy((s) => new Set(s).add(storeId));

    // تفاؤليًا: اعكس الحالة
    setStores((prev) =>
      prev.map((s) => (s._id === storeId ? { ...s, isFavorite: !cur } : s))
    );

    try {
      if (cur) {
        // إزالة من المفضلة
        await removeFavorite(storeId, "restaurant");
      } else {
        // إضافة للمفضلة — مرّر لقطة تساعد شاشة المفضلة لاحقًا
        await addFavorite(storeId, "restaurant", {
          title: store?.name,
          image: store?.logo || store?.image,
          rating: store?.rating,
          storeId: storeId,
          storeType: "restaurant",
        });
      }
    } catch {
      // رول-باك عند الفشل (401 أو أي خطأ)
      setStores((prev) =>
        prev.map((s) => (s._id === storeId ? { ...s, isFavorite: cur } : s))
      );
    } finally {
      // فكّ العلم للمتجر هذا
      setFavBusy((s) => {
        const n = new Set(s);
        n.delete(storeId);
        return n;
      });
    }
  };

  const filteredStores = useMemo(() => {
    let list = stores.filter((store) => {
      if (activeFilters.meal && !store.tags?.includes(activeFilters.meal))
        return false;
      if (activeFilters.trending && !store.isTrending) return false;
      if (activeFilters.featured && !store.isFeatured) return false;
      if (activeFilters.favorite && !store.isFavorite) return false;
      return true;
    });

    if (activeFilters.topRated) {
      list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (activeFilters.nearest) {
      list = [...list].sort(
        (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
      );
    }
    return list;
  }, [stores, activeFilters]);

  const handleFilterBarChange = (id: string) => {
    if (id === "topRated")
      setActiveFilters((f) => ({ ...f, topRated: true, nearest: false }));
    else if (id === "nearest")
      setActiveFilters((f) => ({ ...f, nearest: true, topRated: false }));
    else if (id === "favorite")
      setActiveFilters((f) => ({ ...f, favorite: !f.favorite }));
    else if (id === "trending")
      setActiveFilters((f) => ({ ...f, trending: !f.trending }));
    else if (id === "featured")
      setActiveFilters((f) => ({ ...f, featured: !f.featured }));
    else if (id === "clear")
      setActiveFilters({
        meal: "",
        trending: false,
        featured: false,
        topRated: false,
        nearest: false,
        favorite: false,
      });
    else
      setActiveFilters((f) => ({
        ...f,
        topRated: false,
        nearest: false,
        favorite: false,
        trending: false,
        featured: false,
      }));
  };

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
          <CircularProgress
            sx={{
              color: '#667eea',
              mb: 2,
              width: 60,
              height: 60
            }}
          />
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
            جاري تحميل المتاجر...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        {/* SEO Meta Tags */}
        <Helmet>
          <title>متاجر التوصيل | بثواني - خدمة التوصيل السريع في اليمن</title>
          <meta name="description" content="اكتشف أفضل متاجر التوصيل في اليمن مع بثواني. اطلب دبة الغاز ووايت الماء وخدمات أخرى بسرعة وسهولة." />
          <link rel="canonical" href={`https://bthwaniapp.com/categories`} />
          <meta property="og:title" content="متاجر التوصيل | بثواني" />
          <meta property="og:description" content="اكتشف أفضل متاجر التوصيل في اليمن" />
          <meta property="og:image" content="/icons/icon-512.png" />
          <meta property="og:url" content={`https://bthwaniapp.com/categories`} />
          <meta property="og:type" content="website" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:title" content="متاجر التوصيل | بثواني" />
          <meta property="twitter:description" content="اكتشف أفضل متاجر التوصيل في اليمن" />
          <meta property="twitter:image" content="/icons/icon-512.png" />
        </Helmet>

        {/* Header */}
        <Fade in timeout={800}>
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid',
              borderColor: 'rgba(102, 126, 234, 0.1)',
            paddingBottom: '6px',
          }}
        >
            <Container maxWidth="lg" sx={{ px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  <StoreIcon sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
            متاجر التوصيل
          </Typography>
                  <Typography variant="body2" color="text.secondary">
                    اكتشف أفضل المطاعم والمتاجر في منطقتك
                  </Typography>
                </Box>
              </Box>
            </Container>
        </Box>
        </Fade>

        <Container maxWidth="lg" sx={{ px: 2, py: 3 }}>
          <Fade in timeout={1000}>
            <Box>
          <DeliveryBannerSlider
            banners={[]}
            placement="home_hero"
            channel="web"
          />

          {/* Filters Row */}
              <Card
                sx={{
                  mt: 3,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid',
                  borderColor: 'rgba(102, 126, 234, 0.1)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row-reverse',
              alignItems: 'center',
                      gap: 2,
            }}
          >
                    <Box sx={{ flex: 1 }}>
            <CategoryFiltersBar onChange={handleFilterBarChange} />
                    </Box>
            <IconButton
              onClick={() => setFilterModal(true)}
              sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        p: 1.5,
                        color: 'white',
                        transition: 'all 0.3s ease',
                '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                },
              }}
            >
                      <SettingsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>

          {/* Items Container */}
          <Box sx={{ mt: 4 }}>
            {filteredStores.length === 0 ? (
              <Fade in timeout={600}>
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
                      <DiningIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
              <Typography
                      variant="h5"
                sx={{
                        fontWeight: 'bold',
                        mb: 2,
                        color: 'text.primary'
                      }}
                    >
                      لا توجد متاجر متاحة
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}
                    >
                      لا توجد متاجر في هذه الفئة حالياً. جرب تغيير الفلاتر أو تصفح فئات أخرى.
              </Typography>
                  </CardContent>
                </Card>
              </Fade>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredStores.map((store, index) => (
                  <Fade key={`${store._id}-${store.isFavorite ? "fav" : "nofav"}`} in timeout={400 + index * 100}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: '1px solid',
                        borderColor: 'rgba(102, 126, 234, 0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                          borderColor: 'rgba(102, 126, 234, 0.3)',
                        },
                      }}
                      onClick={() =>
                    navigate(`/business/${store._id}`, { state: { business: store } })
                  }
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                          {/* Store Logo/Image */}
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 2,
                              overflow: 'hidden',
                              flexShrink: 0,
                              position: 'relative',
                            }}
                          >
                            {store.logo || store.image ? (
                              <Box
                                component="img"
                                src={store.logo || store.image}
                                alt={store.name}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                  {store.name.charAt(0)}
                                </Typography>
                              </Box>
                            )}
                            {store.isTrending && (
                              <Chip
                                label="رائج"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                }}
                              />
                            )}
                          </Box>

                          {/* Store Info */}
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {store.name}
                              </Typography>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(store._id, !!store.isFavorite, store);
                                }}
                                disabled={favBusy.has(store._id)}
                                sx={{
                                  color: store.isFavorite ? 'error.main' : 'grey.400',
                                  p: 1,
                                  '&:hover': {
                                    color: store.isFavorite ? 'error.dark' : 'primary.main',
                                    transform: 'scale(1.1)',
                                  },
                                }}
                              >
                                {favBusy.has(store._id) ? (
                                  <CircularProgress size={16} />
                                ) : store.isFavorite ? (
                                  <FavoriteIcon sx={{ fontSize: 20 }} />
                                ) : (
                                  <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                                )}
                              </IconButton>
                            </Box>

                            {store.address && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <LocationIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {store.address}
                                </Typography>
                              </Box>
                            )}

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StarIcon sx={{ fontSize: 16, color: '#ffc107' }} />
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {store.rating?.toFixed(1) || '4.5'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TimeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {store.time || 'غير محدد'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {store.distance || 'غير محدد'}
                                </Typography>
                              </Box>
                            </Box>

                            {store.tags && store.tags.length > 0 && (
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {store.tags.slice(0, 3).map((tag) => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      fontSize: '0.75rem',
                                      height: 24,
                                      borderColor: 'primary.main',
                                      color: 'primary.main',
                                    }}
                                  />
                                ))}
                                {store.tags.length > 3 && (
                                  <Chip
                                    label={`+${store.tags.length - 3}`}
                                    size="small"
                                    sx={{
                                      fontSize: '0.75rem',
                                      height: 24,
                                      backgroundColor: 'primary.main',
                                      color: 'white',
                                    }}
                                  />
                                )}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                ))}
              </Box>
            )}
          </Box>
        </Container>

        {/* Filter Modal */}
        <Modal
          open={filterModal}
          onClose={() => setFilterModal(false)}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <Fade in={filterModal}>
            <Card
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                borderRadius: 4,
                padding: 0,
                margin: 3,
                maxWidth: '480px',
                width: '90%',
                outline: 'none',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    <SettingsIcon sx={{ fontSize: 24, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      فلترة المتاجر
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      اختر الفلاتر المفضلة لديك
                    </Typography>
                  </Box>
                </Box>

                {/* محتوى المودال - يمكن توسيعه لاحقاً */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    سيتم إضافة خيارات الفلترة المتقدمة قريباً...
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    onClick={() => setFilterModal(false)}
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                      },
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setFilterModal(false)}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                      },
                    }}
                  >
                    تطبيق التصفية
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Modal>
      </Box>
    </ErrorBoundary>
  );
};

export default CategoryDetailsScreen;
