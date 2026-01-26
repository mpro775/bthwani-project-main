import React from "react";
import type { Store } from "../../types";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Rating,
  Fade,
  useTheme,
  Chip,
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  Star,
  DeliveryDining,
  Restaurant,
} from "@mui/icons-material";

const StoreCard: React.FC<{ store: Store; onClick?: () => void }> = ({
  store,
  onClick,
}) => {
  const theme = useTheme();
  const closed = store.isOpen === false;

  return (
    <Fade in timeout={600}>
      <Card
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: theme.shadows[12],
            '& .store-badge': {
              opacity: 1,
              transform: 'scale(1)'
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
        <Box sx={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          {store.image || store.logo ? (
            <CardMedia
              component="img"
              height="180"
              image={(store.image || store.logo) as string}
              alt={store.name}
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
                <Restaurant sx={{ fontSize: 48, color: 'white' }} />
                <Typography
                  variant="h4"
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '2rem'
                  }}
                >
                  {store.name?.charAt(0)}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Store Badges */}
          <Box
            className="store-badge"
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
              label="مطعم"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
                boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
              }}
              icon={<Restaurant sx={{ fontSize: 16 }} />}
            />
          </Box>

          {closed && (
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
                  مغلق الآن
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  يفتح قريباً
                </Typography>
              </Box>
            </Box>
          )}

          {/* Trending Badge */}
          {store.isTrending && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 2,
              }}
            >
              <Chip
                label="رائج"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#8B4513',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                }}
                icon={<Star sx={{ fontSize: 16, color: '#8B4513' }} />}
              />
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
            <Restaurant sx={{ color: 'primary.main', fontSize: 20 }} />
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
              {store.name}
            </Typography>
          </Box>

          {store.description && (
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
              {store.description}
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
            {store.rating && (
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
                  value={Number(store.rating)}
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
                  {Number(store.rating).toFixed(1)}
                </Typography>
              </Box>
            )}

            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flex: 1,
              justifyContent: 'flex-end'
            }}>
              {store.deliveryTime && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  background: 'rgba(33, 150, 243, 0.1)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1
                }}>
                  <DeliveryDining sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'primary.main'
                    }}
                  >
                    {store.deliveryTime}
                  </Typography>
                </Box>
              )}

              {store.deliveryFee !== undefined && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  background: store.deliveryFee === 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(156, 39, 176, 0.1)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1
                }}>
                  <AttachMoneyIcon sx={{
                    fontSize: 16,
                    color: store.deliveryFee === 0 ? 'success.main' : 'secondary.main'
                  }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: store.deliveryFee === 0 ? 'success.main' : 'secondary.main'
                    }}
                  >
                    {store.deliveryFee === 0 ? "مجاني" : `${store.deliveryFee} ر.ي`}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {store.minOrder && (
            <Box sx={{
              mt: 'auto',
              pt: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  background: 'rgba(0, 0, 0, 0.05)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  display: 'inline-block'
                }}
              >
                الحد الأدنى: {store.minOrder} ر.ي
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};
export default StoreCard;
