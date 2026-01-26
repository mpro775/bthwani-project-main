import React from "react";
import type { Store } from "../../types";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  Fade,
  useTheme,
} from "@mui/material";
import {
  LocalFireDepartment as FireIcon,
  TrendingUp,
  Star,
  LocationOn,
  AccessTime,
} from "@mui/icons-material";


const TrendingStrip: React.FC<{
  title: string;
  stores?: Store[];
  onSelect?: (s: Store) => void;
}> = ({ title, stores = [], onSelect }) => {
  const theme = useTheme();

  if (!stores.length)
    return (
      <Fade in timeout={600}>
        <Box sx={{
          textAlign: 'center',
          py: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <TrendingUp sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h4" sx={{
            mb: 1,
            fontWeight: 700,
            background: theme.palette.primary.dark,
            color: 'white',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {title}
          </Typography>
          <Typography color="text.secondary" variant="body1">
            لا يوجد متاجر رائجة حالياً
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            سيتم تحديث القائمة قريباً
          </Typography>
        </Box>
      </Fade>
    );

  return (
    <Fade in timeout={600}>
      <Box>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2
        }}>
       
        </Box>

        <Box
          dir="rtl"
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            px: 1,
            '&::-webkit-scrollbar': {
              height: '6px',
              borderRadius: '3px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '3px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.primary.main,
              borderRadius: '3px',
              '&:hover': {
                background: theme.palette.primary.main
              }
            },
            scrollbarWidth: 'thin',
            scrollbarColor: theme.palette.primary.main,
          }}
        >
          {stores.map((s: Store) => (
            <Button
                onClick={() => onSelect?.(s)}
                sx={{
                  minWidth: 150,
                  width: 200,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 4,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: theme.shadows[8],
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}10 100%)`,
                    '& .store-badge': {
                      opacity: 1,
                      transform: 'scale(1)'
                    }
                  },
                  position: 'relative',
                  textAlign: 'center',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* badges bar */}
                <Box
                  className="store-badge"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    right: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    opacity: 0,
                    transform: 'scale(0.8)',
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  <Chip
                    icon={<FireIcon />}
                    label="رائج"
                    size="small"
                    sx={{
                      background: theme.palette.primary.main,
                      color: '#8B4513',
                      fontSize: '0.7rem',
                      height: 22,
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                    }}
                  />
                  {s._promoBadge && (
                    <Chip
                      label={s._promoBadge}
                      size="small"
                      sx={{
                        background: theme.palette.primary.main,
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 30,
                        fontWeight: 600,
                        maxWidth: '100%',
                      }}
                    />
                  )}
                </Box>

               

                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    border: 2,
                    overflow: 'hidden',
                    mx: 'auto',
                    boxShadow: theme.shadows[3],
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: theme.shadows[6]
                    }
                  }}
                  src={s.logo || s.image}
                  alt={s.name}
                >
                  {!s.logo && !s.image && (
                    <Box sx={{
                      width: '100%',
                      height: '100%',
                      background: theme.palette.primary.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h5" sx={{
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        {s.name?.charAt(0)}
                      </Typography>
                    </Box>
                  )}
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{
                    mt: 1.5,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    background: theme.palette.primary.main,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {s.name}
                </Typography>

                {(s.distance || s.time) && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 1,
                    background: 'rgba(0, 0, 0, 0.05)',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2
                  }}>
                    {s.distance && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.3
                      }}>
                        <LocationOn sx={{ fontSize: 12, color: 'primary.main' }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: 'primary.main'
                          }}
                        >
                          {s.distance}
                        </Typography>
                      </Box>
                    )}
                    {s.time && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.3
                      }}>
                        <AccessTime sx={{ fontSize: 12, color: 'secondary.main' }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: 'secondary.main'
                          }}
                        >
                          {s.time}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Rating */}
                {s.rating && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mt: 1,
                    background: 'rgba(255, 215, 0, 0.1)',
                    px: 1,
                    py: 0.3,
                    borderRadius: 1,
                    alignSelf: 'center'
                  }}>
                    <Star sx={{ fontSize: 14, color: '#FFD700' }} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'warning.main'
                      }}
                    >
                      {Number(s.rating).toFixed(1)}
                    </Typography>
                  </Box>
                )}
            </Button>
          ))}
        </Box>
      </Box>
    </Fade>
  );
};
export default TrendingStrip;
