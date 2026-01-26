import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Box,
  Link as MuiLink,
  IconButton,
  InputAdornment,
  Fade,
  Slide,
  useTheme,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Visibility,
  VisibilityOff,
  PersonAdd,
  ArrowForward,
  CheckCircle,
} from "@mui/icons-material";

const Register: React.FC = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    setLoading(true);

    const result = await register(
      formData.email,
      formData.password,
      formData.fullName,
      formData.phone
    );

    setLoading(false);

    if (result.success) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 1,
        },
        p: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 2 }}>
        <Fade in timeout={800}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: theme.shadows[12],
              overflow: "visible",
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
              border: "1px solid",
              borderColor: "divider",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${theme.palette.secondary.light}08 0%, ${theme.palette.primary.light}05 100%)`,
                borderRadius: 4,
                zIndex: 1,
              },
            }}
          >
            <CardContent sx={{ p: 4, position: "relative", zIndex: 2 }}>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Slide in direction="down" timeout={600}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: theme.palette.primary.main,
                        boxShadow: theme.palette.primary.main,
                      }}
                    >
                      <PersonAdd sx={{ fontSize: 32, color: "white" }} />
                    </Box>
                  </Box>
                </Slide>

                <Slide in direction="up" timeout={800}>
                  <Box>
                    <Typography
                      variant="h3"
                      component="h1"
                      sx={{
                        fontWeight: 800,
                        mb: 1,
                        fontSize: "2.2rem",
                        background: theme.palette.primary.main,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      بثواني
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "1.2rem",
                        fontWeight: 500,
                        opacity: 0.8,
                        mb: 1,
                      }}
                    >
                      انضم إلينا اليوم!
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        opacity: 0.7,
                      }}
                    >
                      أنشئ حسابك وابدأ رحلتك معنا
                    </Typography>
                  </Box>
                </Slide>
              </Box>

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "flex", flexDirection: "column", gap: 3 }}
              >
                <Fade in timeout={1000}>
                  <TextField
                    name="fullName"
                    type="text"
                    label={t("auth.fullName")}
                    placeholder="أحمد محمد"
                    value={formData.fullName}
                    onChange={handleChange}
                    onFocus={() => handleFocus("fullName")}
                    onBlur={handleBlur}
                    required
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon
                            sx={{
                              color:
                                focusedField === "fullName"
                                  ? "primary.main"
                                  : "text.secondary",
                              transition: "color 0.3s ease-in-out",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: 2,
                        transition: "all 0.3s ease-in-out",
                        border:
                          focusedField === "fullName"
                            ? `2px solid ${theme.palette.primary.main}`
                            : "1px solid",
                        borderColor:
                          focusedField === "fullName"
                            ? "primary.main"
                            : "divider",
                        boxShadow:
                          focusedField === "fullName"
                            ? `0 0 0 3px ${theme.palette.primary.light}30`
                            : "none",
                        background:
                          focusedField === "fullName"
                            ? "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)"
                            : "transparent",
                      },
                      "& .MuiInputLabel-root": {
                        color:
                          focusedField === "fullName"
                            ? "primary.main"
                            : "text.secondary",
                        fontWeight: focusedField === "fullName" ? 600 : 400,
                        transition: "all 0.3s ease-in-out",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    }}
                  />
                </Fade>

                <Fade in timeout={1100}>
                  <TextField
                    name="email"
                    type="email"
                    label={t("auth.email")}
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus("email")}
                    onBlur={handleBlur}
                    required
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon
                            sx={{
                              color:
                                focusedField === "email"
                                  ? "primary.main"
                                  : "text.secondary",
                              transition: "color 0.3s ease-in-out",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: 2,
                        transition: "all 0.3s ease-in-out",
                        border:
                          focusedField === "email"
                            ? `2px solid ${theme.palette.primary.main}`
                            : "1px solid",
                        borderColor:
                          focusedField === "email" ? "primary.main" : "divider",
                        boxShadow:
                          focusedField === "email"
                            ? `0 0 0 3px ${theme.palette.primary.light}30`
                            : "none",
                        background:
                          focusedField === "email"
                            ? "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)"
                            : "transparent",
                      },
                      "& .MuiInputLabel-root": {
                        color:
                          focusedField === "email"
                            ? "primary.main"
                            : "text.secondary",
                        fontWeight: focusedField === "email" ? 600 : 400,
                        transition: "all 0.3s ease-in-out",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    }}
                  />
                </Fade>

                <Fade in timeout={1200}>
                  <TextField
                    name="phone"
                    type="tel"
                    label={t("auth.phone")}
                    placeholder="777123456"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => handleFocus("phone")}
                    onBlur={handleBlur}
                    required
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon
                            sx={{
                              color:
                                focusedField === "phone"
                                  ? "primary.main"
                                  : "text.secondary",
                              transition: "color 0.3s ease-in-out",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: 2,
                        transition: "all 0.3s ease-in-out",
                        border:
                          focusedField === "phone"
                            ? `2px solid ${theme.palette.primary.main}`
                            : "1px solid",
                        borderColor:
                          focusedField === "phone" ? "primary.main" : "divider",
                        boxShadow:
                          focusedField === "phone"
                            ? `0 0 0 3px ${theme.palette.primary.light}30`
                            : "none",
                        background:
                          focusedField === "phone"
                            ? "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)"
                            : "transparent",
                      },
                      "& .MuiInputLabel-root": {
                        color:
                          focusedField === "phone"
                            ? "primary.main"
                            : "text.secondary",
                        fontWeight: focusedField === "phone" ? 600 : 400,
                        transition: "all 0.3s ease-in-out",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    }}
                  />
                </Fade>

                <Fade in timeout={1300}>
                  <TextField
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label={t("auth.password")}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus("password")}
                    onBlur={handleBlur}
                    required
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon
                            sx={{
                              color:
                                focusedField === "password"
                                  ? "primary.main"
                                  : "text.secondary",
                              transition: "color 0.3s ease-in-out",
                            }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{
                              color:
                                focusedField === "password"
                                  ? "primary.main"
                                  : "text.secondary",
                              transition: "color 0.3s ease-in-out",
                              transform: showPassword
                                ? "scale(1.1)"
                                : "scale(1)",
                              "&:hover": {
                                background: "rgba(156, 39, 176, 0.1)",
                                transform: "scale(1.2)",
                              },
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: 2,
                        transition: "all 0.3s ease-in-out",
                        border:
                          focusedField === "password"
                            ? `2px solid ${theme.palette.primary.main}`
                            : "1px solid",
                        borderColor:
                          focusedField === "password"
                            ? "primary.main"
                            : "divider",
                        boxShadow:
                          focusedField === "password"
                            ? `0 0 0 3px ${theme.palette.primary.light}30`
                            : "none",
                        background:
                          focusedField === "password"
                            ? "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)"
                            : "transparent",
                      },
                      "& .MuiInputLabel-root": {
                        color:
                          focusedField === "password"
                            ? "primary.main"
                            : "text.secondary",
                        fontWeight: focusedField === "password" ? 600 : 400,
                        transition: "all 0.3s ease-in-out",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    }}
                  />
                </Fade>

                <Fade in timeout={1400}>
                  <TextField
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    label={t("auth.confirmPassword")}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => handleFocus("confirmPassword")}
                    onBlur={handleBlur}
                    required
                    fullWidth
                    variant="outlined"
                    error={!!error}
                    helperText={error}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon
                            sx={{
                              color:
                                focusedField === "confirmPassword"
                                  ? "primary.main"
                                  : "text.secondary",
                              transition: "color 0.3s ease-in-out",
                            }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                            sx={{
                              color:
                                focusedField === "confirmPassword"
                                  ? "primary.main"
                                  : "text.secondary",
                              transition: "color 0.3s ease-in-out",
                              transform: showConfirmPassword
                                ? "scale(1.1)"
                                : "scale(1)",
                              "&:hover": {
                                background: "rgba(156, 39, 176, 0.1)",
                                transform: "scale(1.2)",
                              },
                            }}
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: 2,
                        transition: "all 0.3s ease-in-out",
                        border:
                          focusedField === "confirmPassword"
                            ? `2px solid ${theme.palette.primary.main}`
                            : "1px solid",
                        borderColor:
                          focusedField === "confirmPassword"
                            ? "primary.main"
                            : "divider",
                        boxShadow:
                          focusedField === "confirmPassword"
                            ? `0 0 0 3px ${theme.palette.primary.light}30`
                            : "none",
                        background:
                          focusedField === "confirmPassword"
                            ? "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)"
                            : "transparent",
                      },
                      "& .MuiInputLabel-root": {
                        color:
                          focusedField === "confirmPassword"
                            ? "primary.main"
                            : "text.secondary",
                        fontWeight:
                          focusedField === "confirmPassword" ? 600 : 400,
                        transition: "all 0.3s ease-in-out",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "& .MuiFormHelperText-root": {
                        color: error ? "error.main" : "text.secondary",
                        fontSize: "0.8rem",
                        mt: 0.5,
                      },
                    }}
                  />
                </Fade>

                <Fade in timeout={1600}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    sx={{
                      borderRadius: 3,
                      py: 2,
                      textTransform: "none",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      background:
                        theme.palette.primary.main,
                      boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        background:
                          theme.palette.primary.main,
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(156, 39, 176, 0.4)",
                      },
                      "&:disabled": {
                        background:
                          "linear-gradient(135deg, #ccc 0%, #999 100%)",
                        color: "#666",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {loading ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            border: "2px solid transparent",
                            borderTop: "2px solid white",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        جارٍ إنشاء الحساب…
                      </Box>
                    ) : (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PersonAdd sx={{ fontSize: 20 }} />
                        {t("auth.register")}
                      </Box>
                    )}
                  </Button>
                </Fade>

                <Fade in timeout={1800}>
                  <Box
                    sx={{
                      textAlign: "center",
                      pt: 2,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      mt: 3,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        display: "inline",
                        mb: 1,
                      }}
                    >
                      {t("auth.alreadyHaveAccount")}{" "}
                    </Typography>
                    <MuiLink
                      component={Link}
                      to="/login"
                      variant="body2"
                      sx={{
                        color: "primary.main",
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.05) 100%)",
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                          color: "primary.dark",
                          background:"theme.palette.primary.main",
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(156, 39, 176, 0.2)",
                          "& .login-arrow": {
                            transform: "translateX(4px)",
                          },
                        },
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 16 }} />
                      {t("auth.login")}
                      <ArrowForward
                        className="login-arrow"
                        sx={{
                          fontSize: 14,
                          transition: "transform 0.3s ease-in-out",
                        }}
                      />
                    </MuiLink>
                  </Box>
                </Fade>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default Register;
