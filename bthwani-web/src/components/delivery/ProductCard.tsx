import React from "react";
import type { Product } from "../../types";
import useCartStore from "../../store/cartStore";
import { useAuthGate } from "../../hooks/useAuthGate";
import AuthRequiredModal from "../auth/AuthRequiredModal";
import toast from "react-hot-toast";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Rating,
  Chip,
  Fade,
  useTheme,
} from "@mui/material";
import {
  AddShoppingCart as AddShoppingCartIcon,
  LocalOffer,
  ShoppingBag,
} from "@mui/icons-material";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const addItem = useCartStore((state) => state.addItem);
  const theme = useTheme();
  const { ensureAuth, askAuthOpen, setAskAuthOpen } = useAuthGate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    ensureAuth(() => {
      // الفعل الفعلي هنا للمستخدم المسجّل
      addItem(product, 1);
      toast.success("تمت الإضافة إلى السلة");
    });
  };

  const finalPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  return (
    <>
    <Fade in timeout={600}>
      <Card
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: theme.shadows[12],
            '& .product-badge': {
              opacity: 1,
              transform: 'scale(1)'
            },
            '& .product-overlay': {
              opacity: 1
            }
          },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
        }}
      >
        <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          {product.image || product.images?.[0] ? (
            <CardMedia
              component="img"
              height="200"
              image={product.image || product.images?.[0]}
              alt={product.name}
              sx={{
                objectFit: 'cover',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
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
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                }
              }}
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1
              }}>
                <ShoppingBag sx={{ fontSize: 48, color: 'white' }} />
                <Typography
                  variant="h4"
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '2rem'
                  }}
                >
                  {product.name.charAt(0)}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Product Badges */}
          <Box
            className="product-badge"
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
              label="منتج"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
              }}
              icon={<ShoppingBag sx={{ fontSize: 16 }} />}
            />
          </Box>

          {/* Discount Badge */}
          {product.discount && product.discount > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 2,
              }}
            >
              <Chip
                label={`خصم ${product.discount}%`}
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                  animation: 'pulse 2s infinite'
                }}
                icon={<LocalOffer sx={{ fontSize: 16 }} />}
              />
            </Box>
          )}

          {/* Product Overlay on Hover */}
          <Box
            className="product-overlay"
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Button
              variant="contained"
              size="small"
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: 'primary.main',
                fontWeight: 600,
                '&:hover': {
                  background: 'white',
                  transform: 'scale(1.1)'
                }
              }}
            >
              عرض المنتج
            </Button>
          </Box>

          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(239, 68, 68, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(2px)',
              }}
            >
              <Box sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                background: 'rgba(239, 68, 68, 0.9)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    mb: 0.5
                  }}
                >
                  غير متوفر الآن
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  سيتوفر قريباً
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <CardContent sx={{
          p: 2.5,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent'
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1
          }}>
            <ShoppingBag sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {product.name}
            </Typography>
          </Box>

          {product.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: '0.875rem',
                opacity: 0.8,
              }}
            >
              {product.description}
            </Typography>
          )}

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            flexWrap: 'wrap',
            gap: 1
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {product.discount && product.discount > 0 ? (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  flexDirection: 'column'
                }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <ShoppingBag sx={{ fontSize: 18 }} />
                    {finalPrice.toFixed(2)} ر.ي
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    background: 'rgba(255, 107, 107, 0.1)',
                    px: 1,
                    py: 0.3,
                    borderRadius: 1
                  }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        textDecoration: 'line-through',
                        fontSize: '0.8rem',
                      }}
                    >
                      {product.price.toFixed(2)} ر.ي
                    </Typography>
                    <Chip
                      label={`توفير ${((product.price - finalPrice).toFixed(2))} ر.ي`}
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                        color: 'white',
                        fontSize: '0.7rem',
                        height: '18px',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
              ) : (
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <ShoppingBag sx={{ fontSize: 18 }} />
                  {product.price.toFixed(2)} ر.ي
                </Typography>
              )}
            </Box>

            {product.rating && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                background: 'rgba(255, 215, 0, 0.1)',
                px: 1,
                py: 0.5,
                borderRadius: 1
              }}>
                <Rating
                  value={product.rating}
                  readOnly
                  size="small"
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: '#FFD700',
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'warning.main'
                  }}
                >
                  {product.rating.toFixed(1)}
                </Typography>
              </Box>
            )}
          </Box>

          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            variant="contained"
            fullWidth
            startIcon={<AddShoppingCartIcon />}
            sx={{
              mt: 'auto',
              borderRadius: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                background: 'linear-gradient(135deg, #1976D2 0%, #00BCD4 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                color: '#666',
                boxShadow: 'none'
              }
            }}
          >
            {!product.inStock ? 'غير متوفر' : 'إضافة للسلة'}
          </Button>
        </CardContent>
      </Card>
    </Fade>

    {/* مودال التحقق من المصادقة */}
    <AuthRequiredModal
      open={askAuthOpen}
      onClose={() => setAskAuthOpen(false)}
    />
  </>
  );
};

export default ProductCard;
