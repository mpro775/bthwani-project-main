import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllUserFavorites, removeFavorite } from "../../api/favorites";
import { fetchStoreDetails, fetchProductDetails } from "../../api/delivery";
import type { Store, Product } from "../../types";
import Loading from "../../components/common/Loading";

import {
  Box,
  Typography,
  IconButton,
  Container,
  Card,
  CardContent,
  Button as MuiButton,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Fade,
  Slide,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  ShoppingBag,
  Store as StoreIcon,
  Delete,
  GridView,
  ViewList,
  Search,
  Close,
  AccessTime,
  Star,
  Inventory,
  CalendarToday,
  ShoppingCart, // ✅ مضاف
} from "@mui/icons-material";

type TabType = "all" | "restaurant" | "products";

interface FavoriteItem {
  _id: string;
  id: string; // Maps to _id from API
  itemId: string;
  itemType: "restaurant" | "product";
  userId?: string;
  title?: string;
  image?: string;
  price?: number;
  rating?: number;
  storeId?: string;
  storeType?: "grocery" | "restaurant";
  createdAt?: string;
  store?: Store;
  product?: Product;
}

const Favorites: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await getAllUserFavorites();

      const favoritesWithDetails = await Promise.all(
        data.map(async (favorite) => {
          try {
            if (favorite.itemType === "restaurant") {
              const store = await fetchStoreDetails(favorite.itemId);
              return { ...favorite, id: favorite._id || favorite.id || "", store };
            } else if (favorite.itemType === "product") {
              const product = await fetchProductDetails(favorite.itemId);
              return { ...favorite, id: favorite._id || favorite.id || "", product };
            }
            return { ...favorite, id: favorite._id || favorite.id || "" };
          } catch (error) {
            console.error(`Error loading ${favorite.itemType} details:`, error);
            return { ...favorite, id: favorite._id || favorite.id || "" };
          }
        })
      );

      setFavorites(favoritesWithDetails as FavoriteItem[]);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (favorite: FavoriteItem) => {
    if (
      !window.confirm(
        t(
          "favorites.confirmRemove",
          "هل أنت متأكد من إزالة هذا العنصر من المفضلة؟"
        )
      )
    ) {
      return;
    }

    setRemovingId(favorite.id);
    try {
      await removeFavorite(favorite.id, favorite.itemType);
      setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
    } catch (error) {
      console.error("Error removing from favorites:", error);
    } finally {
      setRemovingId(null);
    }
  };

  const filteredFavorites = favorites.filter((favorite: FavoriteItem) => {
    if (activeTab === "restaurant" && favorite.itemType !== "restaurant") return false;
    if (activeTab === "products" && favorite.itemType !== "product")
      return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (favorite.itemType === "restaurant" && favorite.store) {
        return (
          favorite.store.name.toLowerCase().includes(query) ||
          favorite.store.description?.toLowerCase().includes(query)
        );
      } else if (favorite.itemType === "product" && favorite.product) {
        return (
          favorite.product.name.toLowerCase().includes(query) ||
          favorite.product.description?.toLowerCase().includes(query)
        );
      }
    }

    return true;
  });

  const getFavoriteDisplayName = (favorite: FavoriteItem): string => {
    if (favorite.itemType === "restaurant" && favorite.store) {
      return favorite.store.name;
    } else if (favorite.itemType === "product" && favorite.product) {
      return favorite.product.name;
    }
    return `${favorite.itemType} #${favorite.itemId}`;
  };

  const getFavoriteImage = (favorite: FavoriteItem): string | undefined => {
    if (favorite.itemType === "restaurant" && favorite.store) {
      return favorite.store.logo || favorite.store.image;
    } else if (favorite.itemType === "product" && favorite.product) {
      return favorite.product.image;
    }
    return undefined;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Loading fullScreen={false} />
          <Typography
            variant="h6"
            color="primary.main"
            sx={{ fontWeight: "bold", mt: 2 }}
          >
            جاري تحميل المفضلة...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (favorites.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: "center" }}>
        <Fade in timeout={800}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              textAlign: "center",
              py: 8,
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <FavoriteIcon sx={{ fontSize: 40, color: "white" }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  background:
                    "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t("favorites.emptyTitle", "قائمة المفضلة فارغة")}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 400, mx: "auto", lineHeight: 1.6, mb: 4 }}
              >
                {t(
                  "favorites.emptyMessage",
                  "ابدأ بإضافة المتاجر والمنتجات المفضلة لديك لتتمكن من الوصول إليها بسهولة"
                )}
              </Typography>
              <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
                <MuiButton
                  onClick={() => navigate("/")}
                  variant="contained"
                  sx={{
                    borderRadius: 3,
                    px: 6,
                    py: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 35px rgba(102, 126, 234, 0.5)",
                    },
                  }}
                >
                  {t("favorites.browseStores", "تصفح المتاجر")}
                </MuiButton>
                <MuiButton
                  onClick={() => navigate("/stores")}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    px: 6,
                    py: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    borderColor: "primary.main",
                    color: "primary.main",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "primary.dark",
                      backgroundColor: "rgba(102, 126, 234, 0.05)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {t("favorites.exploreStores", "استكشف المتاجر")}
                </MuiButton>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        paddingBottom: { xs: 20, md: 8 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: 2, py: 4 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 4,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                }}
              >
                <FavoriteIcon sx={{ fontSize: 24, color: "white" }} />
              </Box>
              <Box>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: "bold",
                    background:
                      "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {t("nav.favorites")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  المتاجر والمنتجات المفضلة لديك
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label={`${filteredFavorites.length} ${t(
                  "favorites.items",
                  "عنصر"
                )}`}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  height: 32,
                  "& .MuiChip-label": {
                    px: 2,
                  },
                }}
              />

              {/* Search Toggle */}
              <IconButton
                onClick={() => setShowSearch(!showSearch)}
                sx={{
                  backgroundColor: showSearch
                    ? "rgba(102, 126, 234, 0.1)"
                    : "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "rgba(102, 126, 234, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(102, 126, 234, 0.15)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Search
                  sx={{ color: showSearch ? "primary.main" : "text.secondary" }}
                />
              </IconButton>

              {/* View Mode Toggle */}
              <Box
                sx={{
                  display: "flex",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 2,
                  padding: 0.5,
                  border: "1px solid",
                  borderColor: "rgba(102, 126, 234, 0.1)",
                }}
              >
                <IconButton
                  onClick={() => setViewMode("grid")}
                  size="small"
                  sx={{
                    background:
                      viewMode === "grid"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "transparent",
                    color: viewMode === "grid" ? "white" : "text.secondary",
                    boxShadow:
                      viewMode === "grid"
                        ? "0 2px 8px rgba(102, 126, 234, 0.3)"
                        : "none",
                    borderRadius: 1.5,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor:
                        viewMode === "grid"
                          ? "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)"
                          : "rgba(102, 126, 234, 0.05)",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <GridView fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode("list")}
                  size="small"
                  sx={{
                    background:
                      viewMode === "list"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "transparent",
                    color: viewMode === "list" ? "white" : "text.secondary",
                    boxShadow:
                      viewMode === "list"
                        ? "0 2px 8px rgba(102, 126, 234, 0.3)"
                        : "none",
                    borderRadius: 1.5,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor:
                        viewMode === "list"
                          ? "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)"
                          : "rgba(102, 126, 234, 0.05)",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <ViewList fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Search Bar */}
        {showSearch && (
          <Slide direction="down" in timeout={600}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                mb: 4,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <TextField
                  fullWidth
                  placeholder={t(
                    "favorites.searchPlaceholder",
                    "ابحث في المفضلة..."
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "primary.main" }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setSearchQuery("")}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(244, 67, 54, 0.1)",
                            color: "error.main",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              backgroundColor: "rgba(244, 67, 54, 0.2)",
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        "& fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "rgba(255, 255, 255, 1)",
                        "& fieldset": {
                          borderColor: "primary.main",
                          boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.2)",
                        },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Slide>
        )}

        {/* Tabs */}
        <Fade in timeout={1000}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              mb: 4,
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                  "& .MuiTabs-indicator": {
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    height: 3,
                    borderRadius: "3px 3px 0 0",
                  },
                }}
              >
                <Tab
                  label={`${t("favorites.all", "الكل")} (${favorites.length})`}
                  value="all"
                  sx={{
                    textTransform: "none",
                    fontWeight: activeTab === "all" ? "bold" : "normal",
                    fontSize: "1rem",
                    minHeight: 48,
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    mx: 0.5,
                    color:
                      activeTab === "all" ? "primary.main" : "text.secondary",
                    backgroundColor:
                      activeTab === "all"
                        ? "rgba(102, 126, 234, 0.05)"
                        : "transparent",
                    border: 2,
                    borderColor:
                      activeTab === "all"
                        ? "primary.main"
                        : "rgba(102, 126, 234, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor:
                        activeTab === "all"
                          ? "rgba(102, 126, 234, 0.08)"
                          : "rgba(102, 126, 234, 0.02)",
                      transform: "translateY(-1px)",
                    },
                  }}
                />
                <Tab
                  icon={<StoreIcon />}
                  iconPosition="start"
                  label={`${t("favorites.stores", "المتاجر")} (${
                    favorites.filter((f) => f.itemType === "restaurant").length
                  })`}
                    value="restaurant"
                  sx={{
                    textTransform: "none",
                    fontWeight: activeTab === "restaurant" ? "bold" : "normal",
                    fontSize: "1rem",
                    minHeight: 48,
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    mx: 0.5,
                    color:
                        activeTab === "restaurant"
                        ? "primary.main"
                        : "text.secondary",
                    backgroundColor:
                      activeTab === "restaurant"
                        ? "rgba(102, 126, 234, 0.05)"
                        : "transparent",
                    border: 2,
                    borderColor:
                      activeTab === "restaurant"
                        ? "primary.main"
                        : "rgba(102, 126, 234, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor:
                        activeTab === "restaurant"
                          ? "rgba(102, 126, 234, 0.08)"
                          : "rgba(102, 126, 234, 0.02)",
                      transform: "translateY(-1px)",
                    },
                  }}
                />
                <Tab
                  icon={<ShoppingBag />}
                  iconPosition="start"
                  label={`${t("favorites.products", "المنتجات")} (${
                    favorites.filter((f) => f.itemType === "product").length
                  })`}
                  value="products"
                  sx={{
                    textTransform: "none",
                    fontWeight: activeTab === "products" ? "bold" : "normal",
                    fontSize: "1rem",
                    minHeight: 48,
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    mx: 0.5,
                    color:
                      activeTab === "products"
                        ? "primary.main"
                        : "text.secondary",
                    backgroundColor:
                      activeTab === "products"
                        ? "rgba(102, 126, 234, 0.05)"
                        : "transparent",
                    border: 2,
                    borderColor:
                      activeTab === "products"
                        ? "primary.main"
                        : "rgba(102, 126, 234, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor:
                        activeTab === "products"
                          ? "rgba(102, 126, 234, 0.08)"
                          : "rgba(102, 126, 234, 0.02)",
                      transform: "translateY(-1px)",
                    },
                  }}
                />
              </Tabs>
            </CardContent>
          </Card>
        </Fade>

        {/* Favorites Grid/List */}
        {filteredFavorites.length === 0 ? (
          <Fade in timeout={1200}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                textAlign: "center",
                py: 8,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #ffc107 0%, #ff9800 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <FavoriteIcon sx={{ fontSize: 40, color: "white" }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", mb: 2, color: "text.primary" }}
                >
                  {t("favorites.noResults", "لا توجد نتائج")}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ maxWidth: 400, mx: "auto", lineHeight: 1.6, mb: 4 }}
                >
                  {searchQuery
                    ? t(
                        "favorites.noSearchResults",
                        'لا توجد نتائج للبحث عن "{query}"',
                        { query: searchQuery }
                      )
                    : t(
                        "favorites.noItemsInCategory",
                        "لا توجد عناصر في هذه الفئة"
                      )}
                </Typography>
                {searchQuery && (
                  <MuiButton
                    onClick={() => setSearchQuery("")}
                    variant="outlined"
                    startIcon={<Close />}
                    sx={{
                      borderRadius: 3,
                      px: 6,
                      py: 2,
                      textTransform: "none",
                      fontWeight: "bold",
                      borderColor: "primary.main",
                      color: "primary.main",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "primary.dark",
                        backgroundColor: "rgba(102, 126, 234, 0.05)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    {t("favorites.clearSearch", "مسح البحث")}
                  </MuiButton>
                )}
              </CardContent>
            </Card>
          </Fade>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: viewMode === "grid" ? "repeat(2, 1fr)" : "1fr",
                lg: viewMode === "grid" ? "repeat(3, 1fr)" : "1fr",
                xl: viewMode === "grid" ? "repeat(4, 1fr)" : "1fr",
              },
              gap: viewMode === "grid" ? 3 : 4,
            }}
          >
            {filteredFavorites.map((favorite, index) => (
              <Fade key={favorite.id} in timeout={400 + index * 100}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid",
                    borderColor: "rgba(102, 126, 234, 0.1)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                      borderColor: "rgba(102, 126, 234, 0.3)",
                    },
                    opacity: removingId === favorite.id ? 0.5 : 1,
                    transform:
                      removingId === favorite.id ? "scale(0.95)" : "scale(1)",
                    p: viewMode === "list" ? 3 : 2,
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      display: viewMode === "list" ? "flex" : "block",
                      alignItems: viewMode === "list" ? "center" : "stretch",
                      gap: viewMode === "list" ? 2 : 0,
                    }}
                  >
                    {/* Image */}
                    <Box
                      sx={{
                        position: "relative",
                        width: viewMode === "list" ? 100 : "100%",
                        height: viewMode === "list" ? 100 : "auto",
                        aspectRatio: viewMode === "list" ? "1" : "1",
                        borderRadius: 3,
                        overflow: "hidden",
                        background: getFavoriteImage(favorite)
                          ? "transparent"
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        mb: viewMode === "list" ? 0 : 3,
                        "&:hover img": {
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      {getFavoriteImage(favorite) ? (
                        <img
                          src={getFavoriteImage(favorite)!}
                          alt={getFavoriteDisplayName(favorite)}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.3s ease",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {favorite.itemType === "restaurant" ? (
                            <StoreIcon sx={{ fontSize: 40, color: "white" }} />
                          ) : (
                            <ShoppingBag
                              sx={{ fontSize: 40, color: "white" }}
                            />
                          )}
                        </Box>
                      )}

                      {/* Favorite Badge */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background:
                            "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                          color: "white",
                          borderRadius: "50%",
                          p: 1,
                          boxShadow: "0 2px 8px rgba(255, 107, 107, 0.3)",
                        }}
                      >
                        <FavoriteIcon sx={{ fontSize: 14 }} />
                      </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              fontWeight: "bold",
                              mb: 2,
                              color: "text.primary",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {getFavoriteDisplayName(favorite)}
                          </Typography>

                          {favorite.itemType === "restaurant" && favorite.store && (
                            <Box sx={{ mb: 2 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  mb: 1,
                                  p: 2,
                                  backgroundColor: "rgba(255, 193, 7, 0.05)",
                                  borderRadius: 2,
                                  border: "1px solid",
                                  borderColor: "rgba(255, 193, 7, 0.2)",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background:
                                      "linear-gradient(135deg, #ffc107 0%, #ff9800 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Star sx={{ fontSize: 16, color: "white" }} />
                                </Box>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: "bold",
                                      color: "warning.main",
                                    }}
                                  >
                                    {favorite.store.rating?.toFixed(1) ||
                                      "غير محدد"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    تقييم المتجر
                                  </Typography>
                                </Box>
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  mb: 1,
                                  p: 2,
                                  backgroundColor: "rgba(76, 175, 80, 0.05)",
                                  borderRadius: 2,
                                  border: "1px solid",
                                  borderColor: "rgba(76, 175, 80, 0.2)",
                                }}
                              >
                                <AccessTime
                                  sx={{ fontSize: 20, color: "success.main" }}
                                />
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: "bold",
                                      color: "success.main",
                                    }}
                                  >
                                    {favorite.store.deliveryTime || "غير محدد"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    وقت التوصيل
                                  </Typography>
                                </Box>
                              </Box>

                              {favorite.store.minOrder && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    p: 2,
                                    backgroundColor: "rgba(156, 39, 176, 0.05)",
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "rgba(156, 39, 176, 0.2)",
                                  }}
                                >
                                  <ShoppingCart
                                    sx={{
                                      fontSize: 20,
                                      color: "secondary.main",
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: "bold",
                                      color: "secondary.main",
                                    }}
                                  >
                                    الحد الأدنى: {favorite.store.minOrder} ر.ي
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}

                          {favorite.itemType === "product" &&
                            favorite.product && (
                              <Box sx={{ mb: 2 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    mb: 2,
                                    p: 2,
                                    backgroundColor: "rgba(255, 193, 7, 0.05)",
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "rgba(255, 193, 7, 0.2)",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: "50%",
                                      background:
                                        "linear-gradient(135deg, #ffc107 0%, #ff9800 100%)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Star
                                      sx={{ fontSize: 16, color: "white" }}
                                    />
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: "bold",
                                        color: "warning.main",
                                      }}
                                    >
                                      {favorite.product.rating?.toFixed(1) ||
                                        "غير محدد"}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      تقييم المنتج
                                    </Typography>
                                  </Box>
                                </Box>

                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    p: 2,
                                    background: favorite.product.discount
                                      ? "linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)"
                                      : "rgba(102, 126, 234, 0.02)",
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: favorite.product.discount
                                      ? "success.main"
                                      : "rgba(102, 126, 234, 0.1)",
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: "bold",
                                      background:
                                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                      backgroundClip: "text",
                                      WebkitBackgroundClip: "text",
                                      WebkitTextFillColor: "transparent",
                                    }}
                                  >
                                    {favorite.product.price} ر.ي
                                  </Typography>
                                  {favorite.product.discount && (
                                    <Chip
                                      label={`خصم ${favorite.product.discount}%`}
                                      size="small"
                                      sx={{
                                        background:
                                          "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: "0.75rem",
                                        height: 24,
                                      }}
                                      icon={<Inventory sx={{ fontSize: 14 }} />}
                                    />
                                  )}
                                </Box>
                              </Box>
                            )}

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              p: 2,
                              backgroundColor: "rgba(102, 126, 234, 0.02)",
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "rgba(102, 126, 234, 0.1)",
                            }}
                          >
                            <CalendarToday
                              sx={{ fontSize: 16, color: "primary.main" }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              أضيف إلى المفضلة{" "}
                              {new Date(
                                favorite.createdAt || ""
                              ).toLocaleDateString("ar-YE")}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Actions */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            ml: 2,
                          }}
                        >
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              if (favorite.itemType === "restaurant") {
                                navigate(`/business/${favorite.itemId}`);
                              } else {
                                navigate(`/product/${favorite.itemId}`, {
                                  state: { isMerchantProduct: false }
                                });
                              }
                            }}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(102, 126, 234, 0.05)",
                              color: "primary.main",
                              borderRadius: 2,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                backgroundColor: "rgba(102, 126, 234, 0.1)",
                                transform: "scale(1.1)",
                              },
                            }}
                            title={t("favorites.viewDetails", "عرض التفاصيل")}
                          >
                            <ShoppingBag fontSize="small" />
                          </IconButton>

                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromFavorites(favorite);
                            }}
                            disabled={removingId === favorite.id}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(244, 67, 54, 0.05)",
                              color: "error.main",
                              borderRadius: 2,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                backgroundColor: "rgba(244, 67, 54, 0.1)",
                                transform: "scale(1.1)",
                              },
                              opacity: removingId === favorite.id ? 0.5 : 1,
                            }}
                            title={t("favorites.remove", "إزالة من المفضلة")}
                          >
                            {removingId === favorite.id ? (
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  border: 2,
                                  borderColor: "error.main",
                                  borderTopColor: "transparent",
                                  borderRadius: "50%",
                                  animation: "spin 1s linear infinite",
                                }}
                              />
                            ) : (
                              <Delete fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Fade>
            ))}
          </Box>
        )}

        {/* Summary Stats */}
        {filteredFavorites.length > 0 && (
          <Fade in timeout={1400}>
            <Card
              sx={{
                mt: 6,
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "text.primary",
                    mb: 4,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <FavoriteIcon sx={{ color: "primary.main" }} />
                  إحصائيات المفضلة
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      md: "repeat(4, 1fr)",
                    },
                    gap: 3,
                  }}
                >
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 3,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: 2,
                      color: "white",
                    }}
                  >
                    <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
                      {favorites.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {t("favorites.totalItems", "إجمالي العناصر")}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      textAlign: "center",
                      p: 3,
                      background:
                        "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                      borderRadius: 2,
                      color: "white",
                    }}
                  >
                    <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
                      {favorites.filter((f: FavoriteItem) => f.itemType === "restaurant").length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {t("favorites.stores", "المتاجر")}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      textAlign: "center",
                      p: 3,
                      background:
                        "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                      borderRadius: 2,
                      color: "white",
                    }}
                  >
                    <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
                      {favorites.filter((f) => f.itemType === "product").length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {t("favorites.products", "المنتجات")}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      textAlign: "center",
                      p: 3,
                      background:
                        "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                      borderRadius: 2,
                      color: "white",
                    }}
                  >
                    <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
                      {filteredFavorites.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {t("favorites.displayed", "معروض")}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default Favorites;
