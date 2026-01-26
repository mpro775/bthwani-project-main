import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchProductDetails, fetchMerchantProductDetails } from '../../api/delivery';
import type { Product } from '../../types';
import Loading from '../../components/common/Loading';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Typography,
  IconButton,
  Container,
  Card,
  CardContent,
  Chip,
  Alert,
  Button as MuiButton,
  Fade,
} from '@mui/material';
import {
  ArrowBack,
  ShoppingCart,
  Add,
  Remove,
  Store,
  Restaurant,
  Star,
  Inventory,
  LocalOffer,
} from '@mui/icons-material';

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);

  // تحديد مصدر المنتج من المسار أو المعلومات المتاحة
  const isMerchantProduct = location.state?.isMerchantProduct || false;
  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      // استخدام API مختلف بناءً على مصدر المنتج
      const data = isMerchantProduct
        ? await fetchMerchantProductDetails(productId!)
        : await fetchProductDetails(productId!);
      // معالجة البيانات حسب الشكل المتوقع
      let processedData = data;

      // إذا كانت البيانات تحتوي على product object متداخل، استخدم البيانات المتداخلة
      if (data.product && typeof data.product === 'object') {
        // دمج البيانات المتداخلة مع البيانات الرئيسية
        processedData = { ...data.product, ...data };
        console.log('Using nested product data:', processedData);
      }

      setProduct(processedData);

      // تتبع البيانات للتأكد من وصول الحقول الصحيحة
      console.log('Product data received:', data);
      console.log('Processed data:', processedData);
      console.log('Available fields:', Object.keys(processedData));
      console.log('isAvailable:', processedData.isAvailable);
      console.log('inStock:', processedData.inStock);
      console.log('isMerchantProduct:', isMerchantProduct);
    } catch (error: unknown) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  }, [productId, isMerchantProduct]);
  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId, loadProduct]);



  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success(`تمت إضافة ${quantity} من ${product.name} إلى السلة`);
    }
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));

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
            جاري تحميل تفاصيل المنتج...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!product) {
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
                المنتج غير متوفر
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6, mb: 4 }}
              >
                عذراً، هذا المنتج غير متوفر حالياً أو قد يكون قد تم حذفه.
              </Typography>
              <MuiButton
                onClick={() => navigate('/')}
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

  // استخدام fallback ذكي لحقول الباك-إند المختلفة الأسماء
  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const discount = product.discount ?? product.discountPercent ?? product.discountPercentage ?? 0;
  const finalPrice = discount
    ? product.price - (product.price * discount / 100)
    : product.price;

  // تتبع معلومات الخصم أيضًا
  console.log('Discount info:', {
    discount: product.discount,
    discountPercent: product.discountPercent,
    discountPercentage: product.discountPercentage,
    finalDiscount: discount,
    finalPrice: finalPrice
  });

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      paddingBottom: { xs: 20, md: 8 }
    }}>
      {/* SEO Meta Tags */}
      {product && (
        <Helmet>
          <title>{product.name} | منتج من {product.store?.name || 'متجر موثوق'} | بثواني</title>
          <meta name="description" content={`${product.name} - ${product.description || 'منتج عالي الجودة'}. سعر ${product.price} ريال يمني. اطلب الآن من بثواني!`} />
          <link rel="canonical" href={`https://bthwaniapp.com/delivery/product/${product._id}`} />
          <meta property="og:title" content={`${product.name} | منتج من ${product.store?.name || 'متجر موثوق'}`} />
          <meta property="og:description" content={`اطلب ${product.name} من بثواني - خدمة التوصيل السريع في اليمن`} />
          <meta property="og:image" content={product.image || product.images?.[0] || '/icons/icon-512.png'} />
          <meta property="og:url" content={`https://bthwaniapp.com/delivery/product/${product._id}`} />
          <meta property="og:type" content="product" />
          <meta property="product:price:amount" content={product.price.toString()} />
          <meta property="product:price:currency" content="YER" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:title" content={`${product.name} | منتج من ${product.store?.name || 'متجر موثوق'}`} />
          <meta property="twitter:description" content={`اطلب ${product.name} من بثواني`} />
          <meta property="twitter:image" content={product.image || product.images?.[0] || '/icons/icon-512.png'} />
        </Helmet>
      )}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back Button */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 4 }}>
            <MuiButton
              onClick={() => navigate(-1)}
              startIcon={<ArrowBack />}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold',
                color: 'primary.main',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: 'rgba(102, 126, 234, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                },
              }}
            >
              رجوع
            </MuiButton>
          </Box>
        </Fade>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          {/* Images Section */}
          <Box sx={{ flex: { xs: 'none', lg: 1 } }}>
            <Fade in timeout={800}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {images.length > 0 ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 384,
                      overflow: 'hidden',
                      '&:hover img': {
                        transform: 'scale(1.05)',
                      }
                    }}
                  >
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                      }}
                    />
                    {product.discount && product.discount > 0 && (
                      <Chip
                        label={`-${product.discount}%`}
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          height: 32,
                        }}
                        icon={<LocalOffer sx={{ fontSize: 16 }} />}
                      />
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 384,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="h1"
                      sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      {product.name.charAt(0)}
                    </Typography>
                  </Box>
                )}
              </Card>
            </Fade>

            {images.length > 1 && (
              <Fade in timeout={1000}>
                <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
                  {images.map((img, index) => (
                    <Card
                      key={index}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: 3,
                        borderColor: selectedImage === index ? 'primary.main' : 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        },
                      }}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Card>
                  ))}
                </Box>
              </Fade>
            )}
          </Box>

          {/* Details Section */}
          <Box sx={{ flex: { xs: 'none', lg: 1 } }}>
            <Fade in timeout={1000}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  {/* Product Header */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h3"
                      component="h1"
                      sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2,
                      }}
                    >
                      {product.name}
                    </Typography>

                    {product.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            backgroundColor: 'rgba(255, 193, 7, 0.1)',
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                          }}
                        >
                          <Star sx={{ color: '#ffc107', fontSize: 20 }} />
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                            {product.rating.toFixed(1)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          تقييم المنتج
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {product.description && (
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="h6"
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
                        وصف المنتج
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                          backgroundColor: 'rgba(102, 126, 234, 0.02)',
                          p: 3,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'rgba(102, 126, 234, 0.1)',
                        }}
                      >
                        {product.description}
                      </Typography>
                    </Box>
                  )}

                  {/* Price Section */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 3,
                      background: product.discount && product.discount > 0
                        ? 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)'
                        : 'rgba(102, 126, 234, 0.02)',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: product.discount && product.discount > 0
                        ? 'success.main'
                        : 'rgba(102, 126, 234, 0.1)',
                    }}>
                      {product.discount && product.discount > 0 ? (
                        <>
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 'bold',
                              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {finalPrice.toFixed(2)} ر.ي
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              color: 'text.secondary',
                              textDecoration: 'line-through',
                              opacity: 0.7
                            }}
                          >
                            {product.price.toFixed(2)} ر.ي
                          </Typography>
                          <Chip
                            label={`خصم ${product.discount}%`}
                            sx={{
                              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              height: 32,
                            }}
                            icon={<LocalOffer sx={{ fontSize: 16 }} />}
                          />
                        </>
                      ) : (
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {product.price.toFixed(2)} ر.ي
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* استخدام fallback ذكي لحقل التوفر */}
                  {(() => {
                    // التحقق من جميع الحقول الممكنة للتوفر
                    const available = product.isAvailable ?? product.inStock ?? product.available ?? true;
                    console.log('Availability check:', {
                      isAvailable: product.isAvailable,
                      inStock: product.inStock,
                      available: product.available,
                      result: available,
                      productKeys: Object.keys(product)
                    });
                    return available;
                  })() ? (
                    <>
                      {/* Quantity Selector */}
                      <Box sx={{ mb: 4 }}>
                        <Typography
                          variant="h6"
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
                          اختر الكمية
                        </Typography>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          p: 3,
                          backgroundColor: 'rgba(102, 126, 234, 0.02)',
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'rgba(102, 126, 234, 0.1)',
                        }}>
                          <IconButton
                            onClick={decrementQuantity}
                            disabled={quantity <= 1}
                            sx={{
                              border: 2,
                              borderColor: quantity <= 1 ? 'grey.300' : 'primary.main',
                              borderRadius: 2,
                              backgroundColor: quantity <= 1 ? 'grey.100' : 'rgba(102, 126, 234, 0.05)',
                              color: quantity <= 1 ? 'grey.400' : 'primary.main',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: quantity <= 1 ? 'grey.100' : 'rgba(102, 126, 234, 0.1)',
                                transform: quantity <= 1 ? 'none' : 'scale(1.05)',
                              },
                            }}
                          >
                            <Remove fontSize="large" />
                          </IconButton>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 'bold',
                              width: 60,
                              textAlign: 'center',
                              backgroundColor: 'primary.main',
                              color: 'white',
                              borderRadius: 2,
                              py: 1,
                            }}
                          >
                            {quantity}
                          </Typography>
                          <IconButton
                            onClick={incrementQuantity}
                            sx={{
                              border: 2,
                              borderColor: 'primary.main',
                              borderRadius: 2,
                              backgroundColor: 'rgba(102, 126, 234, 0.05)',
                              color: 'primary.main',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                transform: 'scale(1.05)',
                              },
                            }}
                          >
                            <Add fontSize="large" />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Add to Cart Button */}
                      <MuiButton
                        onClick={handleAddToCart}
                        fullWidth
                        size="large"
                        startIcon={<ShoppingCart />}
                        sx={{
                          borderRadius: 3,
                          py: 2.5,
                          textTransform: 'none',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                          mb: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
                          },
                        }}
                      >
                        إضافة للسلة - {(finalPrice * quantity).toFixed(2)} ر.ي
                      </MuiButton>
                    </>
                  ) : (
                    <Alert
                      severity="error"
                      sx={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        py: 3,
                        borderRadius: 2,
                      }}
                    >
                      المنتج غير متوفر حالياً
                    </Alert>
                  )}

                  {product.store && (
                    <Box sx={{
                      mt: 4,
                      pt: 4,
                      borderTop: '2px solid',
                      borderColor: 'rgba(102, 126, 234, 0.2)',
                    }}>
                      <MuiButton
                        onClick={() => navigate(`/business/${product.storeId}`)}
                        startIcon={
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 1,
                            }}
                          >
                            <Store sx={{ fontSize: 16, color: 'white' }} />
                          </Box>
                        }
                        sx={{
                          color: 'primary.main',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          textTransform: 'none',
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.02)',
                          border: '1px solid',
                          borderColor: 'rgba(102, 126, 234, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                          },
                        }}
                      >
                        عرض المتجر: {product.store.name}
                      </MuiButton>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductDetails;
