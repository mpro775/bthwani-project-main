import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchStoresAdv, searchProducts } from '../../api/delivery';
import { fetchCategories } from '../../api/delivery';
import type { Store, Product, Category } from '../../types';
import Loading from '../../components/common/Loading';
import StoreCard from '../../components/delivery/StoreCard';
import ProductCard from '../../components/delivery/ProductCard';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  TextField,
  Button as MuiButton,
  Box,
  Typography,
  IconButton,
  Chip,
  Card,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Fade,
  Grow,
  useTheme,
  alpha,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear,
  FilterList,
  LocationOn,
  Schedule,
  Star,
  Close,
  TrendingUp,
  Restaurant,
  LocalMall,
  Category as CategoryIcon,
} from '@mui/icons-material';

type SearchType = 'stores' | 'products';
type SortOption = 'relevance' | 'rating' | 'delivery_time' | 'distance' | 'priceAsc' | 'priceDesc' | 'new';

interface SearchResults {
  items: Store[] | Product[];
  hasMore: boolean;
  total: number;
  page: number;
  limit: number;
}

const Search: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper function to get category icon
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('مطعم') || name.includes('restaurant') || name.includes('طعام') || name.includes('food')) {
      return <Restaurant sx={{ fontSize: 16, color: 'primary.main' }} />;
    } else if (name.includes('متجر') || name.includes('store') || name.includes('سوبر') || name.includes('سوق')) {
      return <LocalMall sx={{ fontSize: 16, color: 'secondary.main' }} />;
    } else {
      return <CategoryIcon sx={{ fontSize: 16, color: 'info.main' }} />;
    }
  };

  // Get initial values from URL parameters
  const query = searchParams.get('q') || '';
  const searchType = (searchParams.get('type') as SearchType) || 'stores';
  const selectedCategory = searchParams.get('categoryId') || '';
  const sortBy = (searchParams.get('sort') as SortOption) || 'relevance';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // Perform search when URL parameters change
    if (query.trim()) {
      handleSearch();
    }
  }, [query, searchType, selectedCategory, sortBy, currentPage]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Update URL parameters and state
  const updateSearchParams = useCallback((updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Handle search with server-side filtering
  const handleSearch = async () => {
    if (!query.trim()) {
      setResults(null);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);

      let searchResults: SearchResults;

      if (searchType === 'stores') {
        const storeResults = await searchStoresAdv({
          q: query,
          categoryId: selectedCategory || undefined,
          page: currentPage,
          limit: 20,
          sort: sortBy as "rating" | "distance" | "new" || "rating"
        });
        searchResults = storeResults;
      } else {
        const productResults = await searchProducts({
          q: query,
          categoryId: selectedCategory || undefined,
          page: currentPage,
          limit: 20,
          sort: sortBy as "relevance" | "priceAsc" | "priceDesc" | "rating" | "new" || "relevance"
        });
        searchResults = productResults;
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes and URL updates
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateSearchParams({ q: value || undefined, page: undefined }); // Reset to first page on new search
  };

  const handleSearchTypeChange = (type: SearchType) => {
    updateSearchParams({ type, page: undefined });
  };

  const handleCategoryChange = (categoryId: string) => {
    updateSearchParams({ categoryId: categoryId || undefined, page: undefined });
  };

  const handleSortChange = (sort: SortOption) => {
    updateSearchParams({ sort, page: undefined });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
  };

  const clearSearch = () => {
    updateSearchParams({ q: undefined, categoryId: undefined, sort: undefined, page: undefined });
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
      paddingY: 2,
    }}>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{query ? `البحث عن "${query}"` : 'البحث في بثواني'} | خدمة التوصيل السريع في اليمن</title>
        <meta name="description" content={query ? `ابحث عن "${query}" في متاجر ومنتجات بثواني. اطلب دبة الغاز ووايت الماء وخدمات أخرى بسرعة وسهولة في اليمن.` : 'ابحث في آلاف المتاجر والمنتجات في بثواني. خدمة التوصيل السريع والموثوق في جميع المدن اليمنية.'} />
        <link rel="canonical" href={`https://bthwaniapp.com/search${query ? `?q=${encodeURIComponent(query)}` : ''}`} />
        <meta property="og:title" content={query ? `البحث عن "${query}" في بثواني` : 'البحث في بثواني'} />
        <meta property="og:description" content={query ? `ابحث عن "${query}" في متاجر ومنتجات بثواني` : 'ابحث في آلاف المتاجر والمنتجات في بثواني'} />
        <meta property="og:image" content="/icons/icon-512.png" />
        <meta property="og:url" content={`https://bthwaniapp.com/search${query ? `?q=${encodeURIComponent(query)}` : ''}`} />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={query ? `البحث عن "${query}" في بثواني` : 'البحث في بثواني'} />
        <meta property="twitter:description" content={query ? `ابحث عن "${query}" في متاجر ومنتجات بثواني` : 'ابحث في آلاف المتاجر والمنتجات في بثواني'} />
        <meta property="twitter:image" content="/icons/icon-512.png" />
      </Helmet>

      <Container maxWidth="lg" sx={{ paddingBottom: { xs: 20, md: 8 } }}>
        {/* Header */}
        <Box sx={{
          textAlign: 'center',
          marginBottom: 4,
          paddingY: 3,
        }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 2,
            }}
          >
            البحث الذكي
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ابحث عن متاجرك ومنتجاتك المفضلة بسهولة وسرعة
          </Typography>
        </Box>

        {/* Search Input */}
        <Fade in timeout={600}>
          <Card sx={{
            padding: 2,
            marginBottom: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
          }}>
            <TextField
              fullWidth
              placeholder="ابحث عن متاجر، منتجات، مطاعم..."
              value={query}
              onChange={handleInputChange}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  background: alpha(theme.palette.background.default, 0.8),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    background: 'white',
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    background: 'white',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Avatar sx={{
                      bgcolor: 'primary.main',
                      width: 32,
                      height: 32,
                      marginRight: 1,
                    }}>
                      <SearchIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  </InputAdornment>
                ),
                endAdornment: query ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={clearSearch}
                      size="small"
                      sx={{
                        background: alpha(theme.palette.error.main, 0.1),
                        color: 'error.main',
                        '&:hover': {
                          background: alpha(theme.palette.error.main, 0.2),
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Clear sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Card>
        </Fade>

        {/* Search Options */}
        <Grow in timeout={800}>
          <Box sx={{
            marginBottom: 4,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
            alignItems: { xs: 'stretch', sm: 'center' },
          }}>
            {/* Search Type Tabs */}
            <Card sx={{
              padding: 1,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}>
              <Box sx={{
                display: 'flex',
                gap: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                padding: 0.5,
              }}>
                <Chip
                  label="المتاجر"
                  onClick={() => handleSearchTypeChange('stores')}
                  color={searchType === 'stores' ? 'primary' : 'default'}
                  variant={searchType === 'stores' ? 'filled' : 'outlined'}
                  sx={{
                    borderRadius: 2,
                    fontWeight: searchType === 'stores' ? 'bold' : 'normal',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                    },
                  }}
                />
                <Chip
                  label="المنتجات"
                  onClick={() => handleSearchTypeChange('products')}
                  color={searchType === 'products' ? 'primary' : 'default'}
                  variant={searchType === 'products' ? 'filled' : 'outlined'}
                  sx={{
                    borderRadius: 2,
                    fontWeight: searchType === 'products' ? 'bold' : 'normal',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                    },
                  }}
                />
              </Box>
            </Card>

            {/* Filter Button */}
            <MuiButton
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterList />}
              sx={{
                borderRadius: 2,
                paddingY: 1.5,
                paddingX: 3,
                background: showFilters ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                borderColor: showFilters ? 'primary.main' : 'grey.300',
                color: showFilters ? 'primary.main' : 'text.primary',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
              }}
            >
              الفلاتر المتقدمة
            </MuiButton>
          </Box>
        </Grow>

        {/* Filters Panel */}
        {showFilters && (
          <Fade in timeout={400}>
            <Card sx={{
              marginBottom: 4,
              padding: 3,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}>
              <Typography variant="h6" sx={{
                fontWeight: 'bold',
                marginBottom: 3,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                <FilterList sx={{ fontSize: 20 }} />
                فلترة النتائج
              </Typography>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
              }}>
                {/* Category Filter */}
                <Box>
                  <FormControl fullWidth>
                    <Typography variant="body2" sx={{
                      marginBottom: 1,
                      fontWeight: 'medium',
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}>
                      <CategoryIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      الفئة
                    </Typography>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        background: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>جميع الفئات</em>
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getCategoryIcon(category.nameAr || category.name)}
                            {category.nameAr || category.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Sort Options */}
                <Box>
                  <FormControl fullWidth>
                    <Typography variant="body2" sx={{
                      marginBottom: 1,
                      fontWeight: 'medium',
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}>
                      <TrendingUp sx={{ fontSize: 16, color: 'secondary.main' }} />
                      ترتيب حسب
                    </Typography>
                    <Select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value as SortOption)}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        background: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.secondary.main, 0.2),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'secondary.main',
                        },
                      }}
                    >
                      <MenuItem value="relevance">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SearchIcon sx={{ fontSize: 16 }} />
                          الأهمية
                        </Box>
                      </MenuItem>
                      <MenuItem value="rating">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                          التقييم
                        </Box>
                      </MenuItem>
                      <MenuItem value="delivery_time">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule sx={{ fontSize: 16, color: 'success.main' }} />
                          وقت التوصيل
                        </Box>
                      </MenuItem>
                      <MenuItem value="distance">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 16, color: 'info.main' }} />
                          المسافة
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Card>
          </Fade>
        )}

        {/* Results */}
        {loading ? (
          <Loading />
        ) : hasSearched ? (
          results && results.items.length > 0 ? (
            <Fade in timeout={400}>
              <Box>
                {/* Results Header */}
                <Card sx={{
                  padding: 2,
                  marginBottom: 3,
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                      تم العثور على {results?.total || 0} نتيجة
                      {selectedCategory && ` في فئة ${categories.find(c => c.id === selectedCategory)?.nameAr}`}
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      color: 'text.secondary'
                    }}>
                      {sortBy === 'rating' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Star fontSize="small" sx={{ color: 'warning.main' }} />
                          <Typography variant="caption">
                            مرتب حسب التقييم
                          </Typography>
                        </Box>
                      )}
                      {sortBy === 'delivery_time' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule fontSize="small" sx={{ color: 'success.main' }} />
                          <Typography variant="caption">
                            مرتب حسب وقت التوصيل
                          </Typography>
                        </Box>
                      )}
                      {sortBy === 'distance' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn fontSize="small" sx={{ color: 'info.main' }} />
                          <Typography variant="caption">
                            مرتب حسب المسافة
                          </Typography>
                        </Box>
                      )}
                      {sortBy === 'priceAsc' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp fontSize="small" sx={{ color: 'success.main' }} />
                          <Typography variant="caption">
                            مرتب حسب السعر (الأقل أولاً)
                          </Typography>
                        </Box>
                      )}
                      {sortBy === 'priceDesc' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp fontSize="small" sx={{ color: 'error.main' }} />
                          <Typography variant="caption">
                            مرتب حسب السعر (الأعلى أولاً)
                          </Typography>
                        </Box>
                      )}
                      {sortBy === 'new' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule fontSize="small" sx={{ color: 'primary.main' }} />
                          <Typography variant="caption">
                            مرتب حسب الأحدث
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Card>

                {/* Results Grid */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                    lg: 'repeat(3, 1fr)',
                    xl: 'repeat(4, 1fr)'
                  },
                  gap: 3,
                }}>
                  {results?.items.map((item, index) => (
                    <Grow in timeout={400 + (index * 100)}>
                      <Box>
                        {searchType === 'stores' ? (
                          <StoreCard
                            key={(item as Store).id}
                            store={item as Store}
                            onClick={() => navigate(`/stores/${(item as Store).id}`)}
                          />
                        ) : (
                          <ProductCard
                            key={(item as Product).id}
                            product={item as Product}
                            onClick={() => navigate(`/delivery/product/${(item as Product).id}`)}
                          />
                        )}
                      </Box>
                    </Grow>
                  ))}
                </Box>

                {/* Pagination */}
                {results && results.total > results.limit && (
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 4,
                    gap: 1,
                  }}>
                    <MuiButton
                      variant="outlined"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      sx={{ borderRadius: 2 }}
                    >
                      السابق
                    </MuiButton>

                    <Typography sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      color: 'text.secondary'
                    }}>
                      صفحة {currentPage} من {Math.ceil(results.total / results.limit)}
                    </Typography>

                    <MuiButton
                      variant="outlined"
                      disabled={!results.hasMore}
                      onClick={() => handlePageChange(currentPage + 1)}
                      sx={{ borderRadius: 2 }}
                    >
                      التالي
                    </MuiButton>
                  </Box>
                )}
              </Box>
            </Fade>
          ) : (
            <Fade in timeout={400}>
              <Box sx={{
                textAlign: 'center',
                paddingY: 8,
                paddingX: 4,
              }}>
                <Card sx={{
                  padding: 4,
                  maxWidth: 500,
                  margin: '0 auto',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                }}>
                  <Avatar sx={{
                    width: 80,
                    height: 80,
                    background: alpha(theme.palette.error.main, 0.1),
                    color: 'error.main',
                    margin: '0 auto 16px',
                  }}>
                    <SearchIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{
                    fontWeight: 'bold',
                    marginBottom: 2,
                    color: 'text.primary',
                  }}>
                    لا توجد نتائج
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ marginBottom: 3 }}>
                    {selectedCategory
                      ? `لا توجد نتائج في فئة ${categories.find(c => c.id === selectedCategory)?.nameAr}`
                      : 'جرب كلمات بحث مختلفة أو قم بإزالة الفلاتر'
                    }
                  </Typography>
                  {selectedCategory && (
                    <MuiButton
                      variant="outlined"
                      onClick={() => handleCategoryChange('')}
                      startIcon={<Close />}
                      sx={{
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      إزالة الفلتر
                    </MuiButton>
                  )}
                </Card>
              </Box>
            </Fade>
          )
        ) : (
          <Fade in timeout={600}>
            <Box sx={{
              textAlign: 'center',
              paddingY: 8,
              paddingX: 4,
            }}>
              <Card sx={{
                padding: 4,
                maxWidth: 600,
                margin: '0 auto',
                boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
                borderRadius: 3,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
              }}>
                <Avatar sx={{
                  width: 80,
                  height: 80,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  margin: '0 auto 16px',
                }}>
                  <SearchIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h4" sx={{
                  fontWeight: 'bold',
                  marginBottom: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  ابدأ البحث الآن
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ marginBottom: 4 }}>
                  اكتب ما تبحث عنه في مربع البحث أعلاه وابحث عن متاجرك ومنتجاتك المفضلة
                </Typography>

                {/* Popular Categories */}
                <Typography variant="h6" sx={{
                  fontWeight: 'bold',
                  marginBottom: 3,
                  color: 'primary.main',
                }}>
                  فئات شائعة
                </Typography>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
                  gap: 2,
                  maxWidth: 500,
                  margin: '0 auto',
                }}>
                  {categories.slice(0, 6).map((category, index) => (
                    <Grow in timeout={800 + (index * 100)}>
                      <MuiButton
                        key={category.id}
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          handleCategoryChange(category.id);
                          updateSearchParams({ q: category.nameAr || category.name, page: undefined });
                        }}
                        sx={{
                          paddingY: 2,
                          paddingX: 1,
                          borderRadius: 2,
                          background: alpha(theme.palette.primary.main, 0.05),
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'primary.main',
                            color: 'white',
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                          },
                        }}
                      >
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                        }}>
                          {getCategoryIcon(category.nameAr || category.name)}
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {category.nameAr || category.name}
                          </Typography>
                        </Box>
                      </MuiButton>
                    </Grow>
                  ))}
                </Box>
              </Card>
            </Box>
          </Fade>
        )}

        {/* Background decoration */}
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: -1,
          opacity: 0.1,
        }}>
          <Box sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: theme.palette.primary.main,
            animation: 'float 6s ease-in-out infinite',
          }} />
          <Box sx={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: theme.palette.secondary.main,
            animation: 'float 8s ease-in-out infinite reverse',
          }} />
        </Box>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </Container>
    </Box>
  );
};

export default Search;
