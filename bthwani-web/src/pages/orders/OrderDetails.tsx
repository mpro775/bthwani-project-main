import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getOrderDetails, rateOrder } from "../../api/orders";
import { useAuth } from "../../hooks/useAuth";
import type { Order } from "../../types";
import Loading from "../../components/common/Loading";

import {
  Box,
  Typography,
  IconButton,
  Container,
  Button as MuiButton,
  Chip,
  Rating,
  TextField,
  Paper,
  Divider,
  Fade,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  type ChipProps,
} from "@mui/material";
import {
  Inventory,
  Schedule,
  CheckCircle,
  Cancel,
  LocalShipping,
  Place,
  Phone,
  Star,
  ArrowBack,
  SupportAgent,
} from "@mui/icons-material";

const STATUS_FLOW = [
  "pending",
  "confirmed",
  "preparing",
  "onTheWay",
  "delivered",
] as const;

const OrderDetails: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  const getActiveStep = (status: string): number => {
    const idx = STATUS_FLOW.indexOf(status as (typeof STATUS_FLOW)[number]);
    return idx >= 0 ? idx : 0;
  };

  const isStepActive = (currentStatus: string, stepStatus: string): boolean => {
    const currentIdx = STATUS_FLOW.indexOf(
      currentStatus as (typeof STATUS_FLOW)[number]
    );
    const stepIdx = STATUS_FLOW.indexOf(
      stepStatus as (typeof STATUS_FLOW)[number]
    );
    const safeCurrent = currentIdx >= 0 ? currentIdx : 0;
    return stepIdx >= 0 && stepIdx <= safeCurrent;
  };

  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case "pending":
        return <Schedule sx={{ fontSize: 20, color: "warning.main" }} />;
      case "confirmed":
      case "preparing":
        return <Inventory sx={{ fontSize: 20, color: "info.main" }} />;
      case "onTheWay":
        return <LocalShipping sx={{ fontSize: 20, color: "secondary.main" }} />;
      case "delivered":
        return <CheckCircle sx={{ fontSize: 20, color: "success.main" }} />;
      case "cancelled":
        return <Cancel sx={{ fontSize: 20, color: "error.main" }} />;
      default:
        return <Inventory sx={{ fontSize: 20, color: "text.secondary" }} />;
    }
  };

  const getStatusText = (status: string) => t(`orders.${status}`);

  const getStatusColor = (status: string): ChipProps["color"] => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
      case "preparing":
        return "info";
      case "onTheWay":
        return "secondary";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const loadOrderDetails = useCallback(
    async (showInline = false) => {
      if (!orderId) return;

      try {
        if (showInline) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        const data = await getOrderDetails(orderId);
        setOrder(data);

        // Show rating form if order is delivered and not rated
        if (data.status === "delivered" && !data.rating) {
          setShowRatingForm(true);
        } else {
          setShowRatingForm(false);
        }
      } catch (error) {
        console.error("Error loading order details:", error);
      } finally {
        if (showInline) {
          setIsRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [orderId]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (orderId) {
      void loadOrderDetails();
    }
  }, [isAuthenticated, navigate, orderId, loadOrderDetails]);

  const handleRatingSubmit = async () => {
    if (!orderId || rating === 0) return;

    setSubmittingRating(true);
    try {
      await rateOrder(orderId, rating, review);
      setOrder((prev) => (prev ? { ...prev, rating, review } : prev));
      setShowRatingForm(false);
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!order) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage:
              "radial-gradient(circle at 25% 25%, #ffffff 0%, transparent 50%), radial-gradient(circle at 75% 75%, #ffffff 0%, transparent 50%)",
            zIndex: 0,
          }}
        />

        <Container
          maxWidth="md"
          sx={{
            paddingY: 8,
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Fade in timeout={1000}>
            <Paper
              elevation={8}
              sx={{
                padding: 6,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: 4,
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  margin: "0 auto 24px",
                  fontSize: "2.5rem",
                }}
              >
                📦
              </Avatar>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: "bold",
                  marginBottom: 2,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                الطلب غير موجود
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ marginBottom: 4, fontSize: "1.1rem" }}
              >
                لم نتمكن من العثور على هذا الطلب في سجلاتنا
              </Typography>
              <MuiButton
                onClick={() => navigate("/orders")}
                variant="contained"
                size="large"
                startIcon={<ArrowBack />}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                  padding: "12px 32px",
                  fontSize: "1.1rem",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                    boxShadow: "0 12px 35px rgba(102, 126, 234, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                العودة إلى الطلبات
              </MuiButton>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{ paddingY: 4, paddingBottom: { xs: 20, md: 8 } }}
    >
      {/* Header */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 3 }}
      >
        <IconButton
          onClick={() => navigate("/orders")}
          sx={{
            "&:hover": {
              backgroundColor: "grey.100",
            },
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          تفاصيل الطلب #{order.orderNumber}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 3,
        }}
      >
        {/* Order Info */}
        <Box sx={{ flex: { xs: "none", lg: 2 } }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Order Status & Progress */}
            <Fade in timeout={800}>
              <Paper
                elevation={6}
                sx={{
                  padding: 4,
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(15px)",
                  borderRadius: 4,
                  border: "1px solid rgba(102, 126, 234, 0.1)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        width: 48,
                        height: 48,
                      }}
                    >
                      {getStatusIcon(order.status)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h5"
                        component="span"
                        sx={{ fontWeight: "bold" }}
                      >
                        #{order.orderNumber}
                      </Typography>
                      <Chip
                        label={getStatusText(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{
                          fontWeight: "medium",
                          mt: 0.5,
                          height: 24,
                          "& .MuiChip-label": { fontSize: "0.75rem" },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Progress Steps */}
                <Stepper
                  activeStep={getActiveStep(order.status)}
                  alternativeLabel
                  sx={{
                    "& .MuiStepConnector-line": {
                      borderColor: "rgba(102, 126, 234, 0.3)",
                      borderWidth: 2,
                    },
                    "& .MuiStepIcon-root": {
                      "&.Mui-active": {
                        color: "#667eea",
                      },
                      "&.Mui-completed": {
                        color: "#4CAF50",
                      },
                    },
                  }}
                >
                  {[
                    { label: "تم الطلب", status: "pending" },
                    { label: "قيد المراجعة", status: "confirmed" },
                    { label: "قيد التحضير", status: "preparing" },
                    { label: "في الطريق", status: "onTheWay" },
                    { label: "تم التسليم", status: "delivered" },
                  ].map((step) => (
                    <Step key={step.status}>
                      <StepLabel
                        sx={{
                          "& .MuiStepLabel-label": {
                            typography: "body2",
                            fontWeight: isStepActive(order.status, step.status)
                              ? "bold"
                              : "normal",
                            color: isStepActive(order.status, step.status)
                              ? "#667eea"
                              : "text.secondary",
                          },
                        }}
                      >
                        {step.label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Paper>
            </Fade>

            {/* Quick Info Grid */}
            <Fade in timeout={900}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    background: "rgba(102, 126, 234, 0.05)",
                    borderRadius: 3,
                    border: "1px solid rgba(102, 126, 234, 0.1)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                        color: "#667eea",
                        width: 40,
                        height: 40,
                      }}
                    >
                      <Schedule />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold", color: "text.primary" }}
                      >
                        تاريخ الطلب
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleString("ar-YE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {order.deliveryTime && (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      background: "rgba(102, 126, 234, 0.05)",
                      borderRadius: 3,
                      border: "1px solid rgba(102, 126, 234, 0.1)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: "rgba(102, 126, 234, 0.1)",
                          color: "#667eea",
                          width: 40,
                          height: 40,
                        }}
                      >
                        <LocalShipping />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold", color: "text.primary" }}
                        >
                          وقت التسليم المتوقع
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.deliveryTime}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}

                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    background: "rgba(102, 126, 234, 0.05)",
                    borderRadius: 3,
                    border: "1px solid rgba(102, 126, 234, 0.1)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                        color: "#667eea",
                        width: 40,
                        height: 40,
                      }}
                    >
                      <Place />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold", color: "text.primary" }}
                      >
                        عنوان التسليم
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.address.city}، {order.address.street}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    background: "rgba(102, 126, 234, 0.05)",
                    borderRadius: 3,
                    border: "1px solid rgba(102, 126, 234, 0.1)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                        color: "#667eea",
                        width: 40,
                        height: 40,
                      }}
                    >
                      <Phone />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold", color: "text.primary" }}
                      >
                        خدمة العملاء
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        متاح 24/7 للمساعدة
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Fade>

            {/* Order Items */}
            <Fade in timeout={1000}>
              <Paper
                elevation={6}
                sx={{
                  padding: 4,
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(15px)",
                  borderRadius: 4,
                  border: "1px solid rgba(102, 126, 234, 0.1)",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Avatar
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      width: 40,
                      height: 40,
                    }}
                  >
                    🛒
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        fontWeight: "bold",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      منتجات الطلب
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.items.length} منتج • إجمالي{" "}
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}{" "}
                      قطعة
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {order.items.map((item, index) => {
                    const finalPrice = item.discount
                      ? item.price - (item.price * item.discount) / 100
                      : item.price;
                    const totalItemPrice = finalPrice * item.quantity;

                    return (
                      <Fade key={item.id} in timeout={800 + index * 100}>
                        <Paper
                          elevation={3}
                          sx={{
                            padding: 3,
                            background: "rgba(255, 255, 255, 0.8)",
                            borderRadius: 3,
                            border: "1px solid rgba(0, 0, 0, 0.05)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: 6,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <Box sx={{ position: "relative" }}>
                              <Box
                                component="img"
                                sx={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: 3,
                                  objectFit: "cover",
                                  backgroundColor: "grey.200",
                                  border: "2px solid rgba(102, 126, 234, 0.1)",
                                }}
                                src={item.image}
                                alt={item.name}
                                onError={(
                                  e: React.SyntheticEvent<
                                    HTMLImageElement,
                                    Event
                                  >
                                ) => {
                                  const target = e.currentTarget;
                                  target.style.display = "none";
                                  const nextSibling =
                                    target.nextElementSibling as HTMLElement | null;
                                  if (nextSibling) {
                                    nextSibling.style.display = "flex";
                                  }
                                }}
                              />
                              <Box
                                sx={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: 3,
                                  backgroundColor: "grey.200",
                                  display: "none",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "2px solid rgba(102, 126, 234, 0.1)",
                                }}
                              >
                                <Typography
                                  variant="h5"
                                  sx={{ fontWeight: "bold", color: "#667eea" }}
                                >
                                  {item.name.charAt(0)}
                                </Typography>
                              </Box>
                              <Chip
                                label={item.quantity}
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: -8,
                                  right: -8,
                                  backgroundColor: "#667eea",
                                  color: "white",
                                  fontSize: "0.75rem",
                                  height: 20,
                                  minWidth: 20,
                                }}
                              />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: "bold", marginBottom: 1 }}
                              >
                                {item.name}
                              </Typography>

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  mb: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: "bold",
                                      color: "primary.main",
                                    }}
                                  >
                                    {finalPrice.toFixed(2)} ر.ي
                                  </Typography>
                                  {!!item.discount && item.discount > 0 && (
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        textDecoration: "line-through",
                                        color: "text.secondary",
                                        fontSize: "0.8rem",
                                      }}
                                    >
                                      {item.price.toFixed(2)} ر.ي
                                    </Typography>
                                  )}
                                </Box>

                                {!!item.discount && item.discount > 0 && (
                                  <Chip
                                    label={`${item.discount}% خصم`}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ fontSize: "0.7rem", height: 20 }}
                                  />
                                )}
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  الكمية: {item.quantity} قطعة
                                </Typography>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "primary.main",
                                  }}
                                >
                                  {totalItemPrice.toFixed(2)} ر.ي
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      </Fade>
                    );
                  })}
                </Box>
              </Paper>
            </Fade>
          </Box>
        </Box>

        {/* Order Summary & Actions */}
        <Box sx={{ flex: { xs: "none", lg: 1 } }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Order Summary */}
            <Fade in timeout={1200}>
              <Paper
                elevation={6}
                sx={{
                  padding: 4,
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(15px)",
                  borderRadius: 4,
                  border: "1px solid rgba(102, 126, 234, 0.1)",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Avatar
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      width: 40,
                      height: 40,
                    }}
                  >
                    💰
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        fontWeight: "bold",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      ملخص الطلب
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      تفاصيل التكلفة والرسوم
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    p: 3,
                    backgroundColor: "rgba(102, 126, 234, 0.05)",
                    borderRadius: 3,
                    border: "1px solid rgba(102, 126, 234, 0.1)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body1" color="text.primary">
                      المجموع الفرعي
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {order.subtotal.toFixed(2)} ر.ي
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body1" color="text.primary">
                      رسوم التوصيل
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {order.deliveryFee.toFixed(2)} ر.ي
                    </Typography>
                  </Box>

                  <Divider
                    sx={{
                      borderColor: "rgba(102, 126, 234, 0.2)",
                      borderWidth: 1,
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      الإجمالي الكلي
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bold",
                        color: "primary.main",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {order.total.toFixed(2)} ر.ي
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Fade>

            {/* Rating Section */}
            {order.status === "delivered" && (
              <Fade in timeout={1400}>
                <Paper
                  elevation={6}
                  sx={{
                    padding: 4,
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(15px)",
                    borderRadius: 4,
                    border: "1px solid rgba(102, 126, 234, 0.1)",
                  }}
                >
                  {order.rating ? (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 3,
                        }}
                      >
                        <Avatar
                          sx={{
                            background:
                              "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                            width: 40,
                            height: 40,
                          }}
                        >
                          <Star />
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              fontWeight: "bold",
                              background:
                                "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            تقييمك للطلب
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            شكراً لك على تقييمك المفيد
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 3,
                          p: 3,
                          backgroundColor: "rgba(255, 152, 0, 0.05)",
                          borderRadius: 3,
                          border: "1px solid rgba(255, 152, 0, 0.1)",
                        }}
                      >
                        <Rating value={order.rating} readOnly size="large" />
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: "bold",
                            color: "warning.main",
                            background:
                              "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {order.rating}/5
                        </Typography>
                      </Box>

                      {order.review && (
                        <Box
                          sx={{
                            backgroundColor: "rgba(102, 126, 234, 0.05)",
                            padding: 3,
                            borderRadius: 3,
                            border: "1px solid rgba(102, 126, 234, 0.1)",
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ fontStyle: "italic", color: "text.primary" }}
                          >
                            "{order.review}"
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : showRatingForm ? (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 3,
                        }}
                      >
                        <Avatar
                          sx={{
                            background:
                              "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                            width: 40,
                            height: 40,
                          }}
                        >
                          <Star />
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              fontWeight: "bold",
                              background:
                                "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            قيم تجربتك
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ساعدنا في تحسين خدماتنا
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          mb: 3,
                          p: 3,
                          backgroundColor: "rgba(255, 152, 0, 0.05)",
                          borderRadius: 3,
                          border: "2px dashed rgba(255, 152, 0, 0.3)",
                        }}
                      >
                        {[...Array(5)].map((_, i) => (
                          <IconButton
                            key={i}
                            onClick={() => setRating(i + 1)}
                            size="large"
                            sx={{
                              color: i < rating ? "warning.main" : "grey.300",
                              fontSize: "2rem",
                              "&:hover": {
                                color: "warning.main",
                                transform: "scale(1.1)",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Star fontSize="inherit" />
                          </IconButton>
                        ))}
                      </Box>

                      <TextField
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="أخبرنا عن تجربتك مع هذا الطلب (اختياري)"
                        multiline
                        rows={3}
                        fullWidth
                        sx={{
                          mb: 3,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            borderRadius: 2,
                          },
                        }}
                      />

                      <Box sx={{ display: "flex", gap: 2 }}>
                        <MuiButton
                          onClick={handleRatingSubmit}
                          disabled={submittingRating || rating === 0}
                          variant="contained"
                          sx={{
                            flex: 1,
                            background:
                              "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                            boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #45a049 0%, #4CAF50 100%)",
                              boxShadow: "0 6px 20px rgba(76, 175, 80, 0.4)",
                              transform: "translateY(-1px)",
                            },
                            "&:disabled": {
                              background: "#e0e0e0",
                              color: "#9e9e9e",
                              boxShadow: "none",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          {submittingRating
                            ? "جاري الإرسال..."
                            : "إرسال التقييم"}
                        </MuiButton>
                        <MuiButton
                          onClick={() => setShowRatingForm(false)}
                          variant="outlined"
                          sx={{
                            borderColor: "rgba(102, 126, 234, 0.3)",
                            color: "#667eea",
                            "&:hover": {
                              borderColor: "#667eea",
                              backgroundColor: "rgba(102, 126, 234, 0.05)",
                            },
                          }}
                        >
                          إلغاء
                        </MuiButton>
                      </Box>
                    </Box>
                  ) : (
                    <MuiButton
                      onClick={() => setShowRatingForm(true)}
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<Star />}
                      sx={{
                        background:
                          "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                        boxShadow: "0 4px 15px rgba(255, 152, 0, 0.3)",
                        padding: "16px 24px",
                        fontSize: "1.1rem",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #f57c00 0%, #ff9800 100%)",
                          boxShadow: "0 6px 20px rgba(255, 152, 0, 0.4)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      قيم هذا الطلب
                    </MuiButton>
                  )}
                </Paper>
              </Fade>
            )}

            {/* Contact Support */}
            <Fade in timeout={1600}>
              <Paper
                elevation={6}
                sx={{
                  padding: 4,
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(15px)",
                  borderRadius: 4,
                  border: "1px solid rgba(102, 126, 234, 0.1)",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Avatar
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      width: 40,
                      height: 40,
                    }}
                  >
                    <SupportAgent />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: "bold",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      تحتاج مساعدة؟
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      فريق الدعم متاح للمساعدة 24/7
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ marginBottom: 3, lineHeight: 1.6 }}
                >
                  إذا كان لديك أي استفسار حول هذا الطلب أو تحتاج مساعدة في أي
                  أمر آخر، فلا تتردد في التواصل مع فريق الدعم الفني المتخصص.
                </Typography>

                <MuiButton
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{
                    borderColor: "rgba(102, 126, 234, 0.3)",
                    color: "#667eea",
                    padding: "12px 24px",
                    "&:hover": {
                      borderColor: "#667eea",
                      backgroundColor: "rgba(102, 126, 234, 0.05)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  التواصل مع الدعم الفني
                </MuiButton>
              </Paper>
            </Fade>
          </Box>
        </Box>
      </Box>

      {/* Loading Progress Bar (for inline refreshes) */}
      {isRefreshing && (
        <Box
          sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }}
        >
          <LinearProgress
            sx={{
              backgroundColor: "rgba(102, 126, 234, 0.2)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              },
            }}
          />
        </Box>
      )}
    </Container>
  );
};

export default OrderDetails;
