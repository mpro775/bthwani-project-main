// src/pages/delivery/Home.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Banner, Category, Store, Product, Promotion } from "../../types";
import Loading from "../../components/common/Loading";
import BannerSlider from "../../components/delivery/BannerSlider";
import CategoryList from "../../components/delivery/CategoryList";
import TrendingStrip from "../../components/delivery/TrendingStrip";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Fade,
  Slide,
  useTheme,
  Chip,
} from "@mui/material";
import {
  Bolt,
  TrendingUp,
  LocalOffer,
  Star,
  ArrowForward,
  ShoppingBag,
  Restaurant
} from '@mui/icons-material';
import axiosInstance from "../../api/axios-instance";

// pick best promo like mobile
const pickBestPromo = (
  arr?: { value?: number; valueType?: "percentage" | "fixed" }[]
) => {
  if (!arr?.length) return undefined;
  const perc = arr
    .filter((p) => p.valueType === "percentage")
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  if (perc.length) return perc[0];
  const fixed = arr
    .filter((p) => p.valueType === "fixed")
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  return fixed[0] || arr[0];
};

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingStores, setTrendingStores] = useState<Store[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [animatedItems, setAnimatedItems] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setAnimatedItems(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [bannersData, categoriesData, storesData, dealsData] =
          await Promise.all([
            // NOTE: align with mobile: placement=home_hero & channel=app
            axiosInstance
              .get("/delivery/promotions", {
                params: { placement: "home_hero", channel: "app" },
              })
              .then((r) => r.data)
              .catch(() => []),
            axiosInstance
              .get("/delivery/categories", {
                params: { withNumbers: 1, parent: null },
              })
              .then((r) => r.data)
              .catch(() => []),
            axiosInstance
              .get("/delivery/stores")
              .then((r) => r.data)
              .catch(() => []),
            axiosInstance
              .get("/delivery/deals")
              .then((r) => r.data)
              .catch(() => []),
          ]);

        // map promotions -> Banner shape (web types)
        const mappedBanners: Banner[] = Array.isArray(bannersData)
          ? bannersData
              .filter(
                (p: Promotion) =>
                  !p.channels?.length || p.channels?.includes("app")
              )
              .map((p: Promotion) => ({
                id: p._id || p.id,
                imageUrl: p.imageUrl,
                title: p.title,
                description: undefined,
                link: p.link,
                target: p.target,
                product: p.product,
                store: p.store,
                category: p.category,
              }))
          : [];

        const rootCats: Category[] = Array.isArray(categoriesData)
          ? categoriesData
              .filter((c: Category) => !c.parent)
              .sort(
                (a: Category, b: Category) =>
                  (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) ||
                  a.name?.localeCompare(b.name, "ar")
              )
          : [];

        const trending = Array.isArray(storesData)
          ? storesData.filter((s: Store) => s?.isTrending)
          : [];

        // Add promotion badges to trending stores
        if (trending.length) {
          const idsCsv = trending.map((s: Store) => s._id || s.id).join(",");
          const promoMap = await axiosInstance
            .get("/delivery/promotions/by-stores", {
              params: {
                ids: idsCsv,
                channel: "app",
              },
            })
            .then((r) => r.data)
            .catch(() => ({}));
          const getStorePromos = (sid: string) =>
            Array.isArray(promoMap)
              ? promoMap.filter((p: Promotion) => p.store === sid)
              : promoMap?.[sid];

          trending.forEach((s: Store) => {
            const best = pickBestPromo(getStorePromos(s._id || s.id));
            if (best) {
              s._promoBadge =
                best.valueType === "percentage"
                  ? `خصم ${best.value}%`
                  : `خصم ${best.value} ﷼`;
              s._promoPercent =
                best.valueType === "percentage" ? best.value : undefined;
            }
          });
        }

        setBanners(mappedBanners);
        setCategories(rootCats);
        setTrendingStores(trending);
        setDeals(Array.isArray(dealsData) ? dealsData : []);
      } finally {
        setLoading(false);
        // Trigger entrance animations after data loads
        setTimeout(() => setAnimatedItems(true), 100);
      }
    })();
  }, []);

  if (loading) return <Loading fullScreen />;

  return (
    <Box sx={{
      pb: { xs: 10, md: 5 },
      backgroundColor: "background.default",
      minHeight: '100vh'
    }}>
      {/* Sticky header spacer handled by layout */}

      {/* Hero Banner with enhanced styling */}
      <Fade in={animatedItems} timeout={800}>
        <Box sx={{
          mb: 4,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
            borderRadius: 2,
            zIndex: 1
          }
        }}>
          <BannerSlider placement="home_hero" channel="app" banners={banners} />
        </Box>
      </Fade>

      {/* Main Content Container */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Categories + Trending Section */}
        <Slide in={animatedItems} direction="up" timeout={600}>
          <Box sx={{ mb: 5 }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Paper
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    p: { xs: 2, md: 3 },
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[6]
                    }
                  }}
                >
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    gap: 1
                  }}>
                    <Restaurant sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        background: theme.palette.primary.main,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {t("delivery.categories")}
                    </Typography>
                  </Box>
                  <CategoryList categories={categories} />
                </Paper>
              </Grid>
              <Grid size={12}>
                <Paper
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    p: { xs: 2, md: 3 },
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[6]
                    }
                  }}
                >
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    gap: 1
                  }}>
                    <TrendingUp sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        background: theme.palette.primary.main,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {t("delivery.trending")}
                    </Typography>
                  </Box>
                  <TrendingStrip
                    title={t("delivery.trending")}
                    stores={trendingStores}
                    onSelect={(store) =>
                      navigate(`/business/${store.id || store._id}`)
                    }
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Slide>

        {/* Daily Deals Section with Enhanced Design */}
        {deals?.length > 0 && (
          <Fade in={animatedItems} timeout={800}>
            <Box sx={{
              mb: 6,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -20,
                left: 0,
                right: 0,
                height: 1,
                background: `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main}30 50%, transparent 100%)`,
                zIndex: 1
              }
            }}>
              <Container maxWidth="xl">
                <Box sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                    }}>
                      <Bolt sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 0.5
                        }}
                      >
                        {t("delivery.deals")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        عروض محدودة الوقت - لا تفوتها!
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="شوف المزيد"
                    onClick={() => navigate('/deals')}
                    sx={{
                      background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1976D2 0%, #00BCD4 100%)',
                        transform: 'scale(1.05)'
                      }
                    }}
                    icon={<ArrowForward />}
                  />
                </Box>

                <Grid container spacing={2.5}>
                  {deals.slice(0, 8).map((deal: Product, index: number) => (
                    <Grid
                      size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}
                      key={deal.id || deal._id}
                    >
                      <Slide
                        in={animatedItems}
                        direction="up"
                        timeout={600 + (index * 100)}
                      >
                        <Card
                          sx={{
                            borderRadius: 3,
                            cursor: "pointer",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                              transform: 'translateY(-8px) scale(1.02)',
                              boxShadow: theme.shadows[12],
                              '& .deal-badge': {
                                opacity: 1,
                                transform: 'scale(1)'
                              }
                            }
                          }}
                          onClick={() => navigate(`/product/${deal.id || deal._id}`, {
                            state: { isMerchantProduct: false }
                          })}
                        >
                          {/* Deal Badge */}
                          <Box
                            className="deal-badge"
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              zIndex: 2,
                              opacity: 0,
                              transform: 'scale(0.8)',
                              transition: 'all 0.3s ease-in-out'
                            }}
                          >
                            <Chip
                              label="عرض خاص"
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                              icon={<LocalOffer sx={{ fontSize: 16 }} />}
                            />
                          </Box>

                          <CardMedia
                            component="img"
                            height="180"
                            image={deal.image}
                            alt={deal.name}
                            sx={{
                              background: !deal.image
                                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                : "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "3rem",
                              fontWeight: "bold",
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(45deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease-in-out',
                              },
                              '&:hover::after': {
                                opacity: 1
                              }
                            }}
                          >
                            {!deal.image && deal.name.charAt(0)}
                          </CardMedia>

                          <CardContent sx={{
                            p: 2,
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                          }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                lineHeight: 1.3,
                                mb: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {deal.name}
                            </Typography>

                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: 1
                            }}>
                              <Box>
                                {deal.price && (
                                  <Typography
                                    variant="h5"
                                    sx={{
                                      fontWeight: 700,
                                      color: 'primary.main',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5
                                    }}
                                  >
                                    <ShoppingBag sx={{ fontSize: 16 }} />
                                    {deal.price} ر.ي
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  عرض محدود الوقت
                                </Typography>
                              </Box>

                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                background: 'rgba(255, 215, 0, 0.1)',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1
                              }}>
                                <Star sx={{ color: '#FFD700', fontSize: 16 }} />
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                  4.8
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Slide>
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default Home;
