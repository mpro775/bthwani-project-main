import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchCategories, fetchStores } from "../../api/delivery";
import type { Store, Category } from "../../types";
import Loading from "../../components/common/Loading";
import StoreCard from "../../components/delivery/StoreCard";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button as MuiButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Fade,
  Slide,
} from "@mui/material";
import {
  FilterList,
  Map,
  GridView,
  ViewList,
  FilterAlt,
  Clear,
  Store as StoreIcon,
  Restaurant,
  Star,
  AccessTime,
  ShoppingCart,
} from "@mui/icons-material";

const Stores: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<
    "rating" | "delivery_time" | "min_order" | "distance"
  >("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [deliveryTimeFilter, setDeliveryTimeFilter] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [storesData, categoriesData] = await Promise.all([
        fetchStores({ limit: 50 }),
        fetchCategories(),
      ]);

      setStores(storesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter((store) => {
    // Category filter
    if (
      selectedCategories.length > 0 &&
      !selectedCategories.some((cat) => store.categories?.includes(cat))
    ) {
      return false;
    }

    // Price range filter (mock - using minOrder as price indicator)
    if (
      store.minOrder &&
      (store.minOrder < priceRange[0] || store.minOrder > priceRange[1])
    ) {
      return false;
    }

    // Delivery time filter
    if (deliveryTimeFilter && store.deliveryTime !== deliveryTimeFilter) {
      return false;
    }

    return true;
  });

  const sortedStores = [...filteredStores].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "delivery_time":
        return (
          parseDeliveryTime(a.deliveryTime || "") -
          parseDeliveryTime(b.deliveryTime || "")
        );
      case "min_order":
        return (a.minOrder || 0) - (b.minOrder || 0);
      case "distance":
        return Math.random() - 0.5; // Mock distance sorting
      default:
        return 0;
    }
  });

  const parseDeliveryTime = (time: string): number => {
    if (time.includes("دقيقة")) return parseInt(time) || 30;
    if (time.includes("ساعة")) return (parseInt(time) || 1) * 60;
    return 30;
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 100]);
    setDeliveryTimeFilter("");
    setSortBy("rating");
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
          <Loading fullScreen={false} />
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', mt: 2 }}>
            جاري تحميل المتاجر...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      paddingBottom: { xs: 20, md: 8 }
    }}>
      <Container maxWidth="lg" sx={{ px: 2, py: 4 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {t("stores.title")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  اكتشف أفضل المتاجر والمطاعم في منطقتك
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* View Mode Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newValue) => newValue && setViewMode(newValue)}
                aria-label="view mode"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    mx: 0.5,
                    borderRadius: 1.5,
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    },
                  },
                }}
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <GridView />
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <ViewList />
                </ToggleButton>
                <ToggleButton value="map" aria-label="map view">
                  <Map />
                </ToggleButton>
              </ToggleButtonGroup>

              <MuiButton
                variant="outlined"
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FilterList />}
                size="small"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {t("search.filters")}
              </MuiButton>
            </Box>
          </Box>
        </Fade>

        {/* Filters Panel */}
        {showFilters && (
          <Slide direction="down" in timeout={600}>
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
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <FilterAlt sx={{ color: 'primary.main' }} />
                  فلترة المتاجر
                </Typography>

                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(2, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                  gap: 4,
                  mb: 4,
                }}>
                  {/* Categories Filter */}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                        color: 'text.primary',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Restaurant sx={{ color: 'primary.main' }} />
                      الفئات
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {categories.slice(0, 8).map((category, index) => (
                        <Fade key={category.id} in timeout={400 + index * 100}>
                          <Chip
                            label={category.nameAr || category.name}
                            onClick={() => toggleCategory(category.id)}
                            variant={selectedCategories.includes(category.id) ? "filled" : "outlined"}
                            color={selectedCategories.includes(category.id) ? "primary" : "default"}
                            size="small"
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                              },
                            }}
                          />
                        </Fade>
                      ))}
                    </Box>
                  </Box>

                  {/* Price Range Filter */}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                        color: 'text.primary',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <ShoppingCart sx={{ color: 'primary.main' }} />
                      الحد الأدنى للطلب
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      backgroundColor: 'rgba(102, 126, 234, 0.02)',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'rgba(102, 126, 234, 0.1)',
                    }}>
                      <Slider
                        value={priceRange[1]}
                        onChange={(_, value) => setPriceRange([priceRange[0], value as number])}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value} ر.ي`}
                        sx={{
                          flex: 1,
                          color: 'primary.main',
                          '& .MuiSlider-thumb': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                          },
                        }}
                      />
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main', minWidth: 50 }}>
                        {priceRange[1]} ر.ي
                      </Typography>
                    </Box>
                  </Box>

                  {/* Delivery Time Filter */}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                        color: 'text.primary',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <AccessTime sx={{ color: 'primary.main' }} />
                      وقت التوصيل
                    </Typography>
                    <FormControl
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          },
                        },
                      }}
                    >
                      <InputLabel>{t("stores.deliveryTime")}</InputLabel>
                      <Select
                        value={deliveryTimeFilter}
                        onChange={(e) => setDeliveryTimeFilter(e.target.value)}
                        label={t("stores.deliveryTime")}
                      >
                        <MenuItem value="">الكل</MenuItem>
                        <MenuItem value="15 دقيقة">15 دقيقة</MenuItem>
                        <MenuItem value="30 دقيقة">30 دقيقة</MenuItem>
                        <MenuItem value="45 دقيقة">45 دقيقة</MenuItem>
                        <MenuItem value="ساعة">ساعة</MenuItem>
                        <MenuItem value="ساعتين">ساعتين</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Sort Options */}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                        color: 'text.primary',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Star sx={{ color: 'primary.main' }} />
                      ترتيب حسب
                    </Typography>
                    <FormControl
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          },
                        },
                      }}
                    >
                      <InputLabel>{t("stores.sortBy")}</InputLabel>
                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        label={t("stores.sortBy")}
                      >
                        <MenuItem value="rating">التقييم</MenuItem>
                        <MenuItem value="delivery_time">سرعة التوصيل</MenuItem>
                        <MenuItem value="min_order">الحد الأدنى للطلب</MenuItem>
                        <MenuItem value="distance">المسافة</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
          </Box>

                <Box sx={{
                  display: 'flex',
                  gap: 3,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pt: 3,
                  borderTop: '1px solid',
                  borderColor: 'rgba(102, 126, 234, 0.1)',
                }}>
                  <MuiButton
                    onClick={clearFilters}
                    variant="outlined"
                    size="small"
                    startIcon={<Clear />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {t("stores.clearFilters")}
                  </MuiButton>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 'bold',
                      color: 'primary.main',
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                    }}
                  >
                    {t("stores.storeCount", { count: sortedStores.length })} متجر
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Slide>
        )}

        {/* Results Count */}
        <Fade in timeout={1200}>
          <Box sx={{
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'rgba(102, 126, 234, 0.1)',
          }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <StoreIcon sx={{ color: 'primary.main' }} />
              {t("stores.resultsCount", {
                current: sortedStores.length,
                total: stores.length,
              })}
            </Typography>
            {selectedCategories.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  تم الفلترة بواسطة:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {selectedCategories.map((catId) => {
                    const category = categories.find((c) => c.id === catId);
                    return (
                      <Chip
                        key={catId}
                        label={category?.nameAr || category?.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{
                          fontWeight: 'bold',
                          '& .MuiChip-deleteIcon': {
                            color: 'primary.main',
                          },
                        }}
                        onDelete={() => toggleCategory(catId)}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        </Fade>

        {/* Stores Display */}
        <Fade in timeout={1400}>
          <Box>
            {viewMode === "map" ? (
              <Card
                sx={{
                  height: 400,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Map sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    عرض الخريطة
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ستظهر الخريطة هنا قريباً
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: viewMode === 'grid' ? 'repeat(2, 1fr)' : '1fr',
                    lg: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr',
                    xl: viewMode === 'grid' ? 'repeat(4, 1fr)' : '1fr',
                  },
                  gap: viewMode === 'grid' ? 3 : 4,
                }}
              >
                {sortedStores.map((store, index) => (
                  <Fade key={store.id} in timeout={400 + index * 100}>
                    <Box>
                      <StoreCard
                        store={store}
                        onClick={() => navigate(`/business/${store.id}`)}
                      />
                    </Box>
                  </Fade>
                ))}
              </Box>
            )}

            {sortedStores.length === 0 && (
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
                    <FilterAlt sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 'bold',
                      mb: 2,
                      color: 'text.primary'
                    }}
                  >
                    {t("stores.noStoresFound")}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6, mb: 4 }}
                  >
                    {t("stores.tryDifferentFilters")}
                  </Typography>
                  <MuiButton
                    onClick={clearFilters}
                    variant="outlined"
                    startIcon={<Clear />}
                    sx={{
                      borderRadius: 3,
                      px: 6,
                      py: 2,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {t("stores.clearFilters")}
                  </MuiButton>
                </CardContent>
              </Card>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default Stores;
