// src/components/delivery/BannerSlider.tsx
// ============================
import "swiper/css";
import "swiper/css/pagination";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Box, Typography, Fade, useTheme, Chip } from "@mui/material";
import { ArrowForward, LocalOffer } from "@mui/icons-material";




export type BannerLike = {
  id?: string;
  imageUrl?: string;
  title?: string;
  description?: string;
  // parity data for internal routing
  link?: string;
  target?: "product" | "store" | "category";
  product?: { _id: string };
  store?: { _id: string };
  category?: { _id: string };
};

const openBanner = (b: BannerLike, navigate: (href: string, options?: { state?: Record<string, unknown> }) => void) => {
  if (b.link && /^https?:\/\//.test(b.link)) {
    window.open(b.link, "_blank");
    return;
  }
  if (b.target === "store" && b.store?._id)
    return navigate(`/business/${b.store._id}`);
  if (b.target === "category" && b.category?._id)
    return navigate(`/category/${b.category._id}`);
  if (b.target === "product" && b.product?._id)
    return navigate(`/product/${b.product._id}`, {
      state: { isMerchantProduct: false }
    });
};

const BannerSlider: React.FC<{
  banners: BannerLike[];
  placement?: "home_hero" | "home_strip";
  channel?: "app" | "web";
}> = ({ banners }) => {
  const theme = useTheme();

  if (!banners?.length) {
    return (
      <Fade in timeout={800}>
        <Box
          sx={{
            width: '100%',
            height: { xs: 200, md: 280 },
            background: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              zIndex: 1
            }
          }}
        >
          <Box sx={{
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            zIndex: 2,
            px: 3
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mb: 2
            }}>
             
            </Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3.5rem' },
                fontWeight: 800,
                mb: 1,
                background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              بثواني
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 500,
                opacity: 0.9,
                mb: 2
              }}
            >
              خدمة التوصيل السريع
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              اكتشف أفضل العروض والمطاعم في منطقتك
            </Typography>
          </Box>
        </Box>
      </Fade>
    );
  }
  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          width: '100%',
          height: { xs: 200, md: 280 },
          position: 'relative',
          '& .swiper': {
            width: '100%',
            height: '100%',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: theme.shadows[8]
          },
          '& .swiper-pagination': {
            bottom: 20,
            '& .swiper-pagination-bullet': {
              width: 12,
              height: 12,
              background: 'rgba(255, 255, 255, 0.5)',
              opacity: 0.7,
              transition: 'all 0.3s ease-in-out',
            },
            '& .swiper-pagination-bullet-active': {
              background: 'white',
              opacity: 1,
              transform: 'scale(1.2)',
            }
          }
        }}
      >
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
        >
          {banners.map((banner, idx) => (
            <SwiperSlide key={banner.id || idx}>
              <Box
                component="button"
                onClick={() =>
                  openBanner(banner, (href) => {
                    window.location.href = href;
                  })
                }
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                    zIndex: 1,
                    transition: 'opacity 0.3s ease-in-out',
                  },
                  '&:hover::before': {
                    opacity: 0.2
                  }
                }}
              >
                {banner.imageUrl ? (
                  <Box
                    component="img"
                    src={banner.imageUrl}
                    alt={banner.title || "banner"}
                    sx={{
                      width: '100%',
                      height: '100%',
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
                    }}
                  >
                    <Box sx={{
                      textAlign: 'center',
                      color: 'white',
                      position: 'relative',
                      zIndex: 2,
                      px: 3
                    }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        mb: 2
                      }}>
                        <Chip
                          label="عرض خاص"
                          sx={{
                            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                            color: 'white',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
                          }}
                          icon={<LocalOffer />}
                        />
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontSize: { xs: '1.8rem', md: '3rem' },
                          fontWeight: 800,
                          mb: 1,
                          background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        {banner.title || "عرض خاص"}
                      </Typography>
                      {banner.description && (
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: { xs: '1.1rem', md: '1.4rem' },
                            fontWeight: 500,
                            opacity: 0.9,
                            mb: 2
                          }}
                        >
                          {banner.description}
                        </Typography>
                      )}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          اكتشف المزيد
                        </Typography>
                        <ArrowForward sx={{ fontSize: 18 }} />
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Banner Content Overlay */}
                {banner.title && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      p: 3,
                      zIndex: 2,
                      textAlign: 'left'
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontSize: { xs: '1.5rem', md: '2.5rem' },
                        fontWeight: 800,
                        color: 'white',
                        mb: 1,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                      }}
                    >
                      {banner.title}
                    </Typography>
                    {banner.description && (
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: '1rem', md: '1.3rem' },
                          color: 'rgba(255, 255, 255, 0.9)',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                        }}
                      >
                        {banner.description}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Fade>
  );
};
export default BannerSlider;
