// src/features/errands/pages/AkhdimniPage.tsx
import React, { useEffect, useRef } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Paper,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StepperHeader } from "../../features/errands/components/primitives/StepperHeader";
import { SpecsStep } from "../../features/errands/components/steps/SpecsStep";
import { PickupStep } from "../../features/errands/components/steps/PickupStep";
import { DropoffStep } from "../../features/errands/components/steps/DropoffStep";
import { PayStep } from "../../features/errands/components/steps/PayStep";
import { ReviewStep } from "../../features/errands/components/steps/ReviewStep";
import { useErrandForm } from "../../features/errands/hooks/useErrandForm";
import { STEPS } from "../../features/errands/constants";
import type { StepKey } from "../../features/errands/constants";
import { fetchErrandFee, submitErrandOrder } from "../../features/errands/api";
import ErrorBoundary from "../../components/common/ErrorBoundary";

const AkhdimniPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    form,
    // setForm,
    step,
    setStep,
    busy,
    setBusy,
    feeLoading,
    setFeeLoading,
    estimate,
    setEstimate,
    localDistanceKm,
    isLoggedIn,
    isStepValid,
    canEstimate,
    handleSet,
    handlePoint,
    clearStoredData,
  } = useErrandForm();

  const isLast = step === STEPS.length - 1;

  // قراءة الخطوة من URL parameters عند التحميل
  useEffect(() => {
    const stepFromUrl = searchParams.get("step");
    if (stepFromUrl !== null) {
      const stepNumber = parseInt(stepFromUrl, 10);
      if (stepNumber >= 0 && stepNumber < STEPS.length) {
        setStep(stepNumber);
        // تنظيف URL بعد قراءة الخطوة
        setSearchParams({});
      }
    }
  }, [searchParams, setSearchParams, setStep]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  async function fetchEstimate() {
    if (!canEstimate) {
      alert("الرجاء تحديد إحداثيات الاستلام والتسليم.");
      return;
    }
    if (!isLoggedIn) {
      // تقدير محلي
      const dist = localDistanceKm ?? 0;
      const base = 300,
        perKm = 120;
      const fee = Math.max(base, base + perKm * Math.max(0, dist - 1));
      const tipNum = form.tip ? Number(form.tip) : 0;
      setEstimate({
        distanceKm: dist,
        deliveryFee: Math.round(fee),
        totalWithTip: Math.round(fee + tipNum),
      });
      return;
    }
    setFeeLoading(true);
    try {
      const data = await fetchErrandFee(form);
      setEstimate({
        distanceKm: data?.distanceKm ?? localDistanceKm ?? null,
        deliveryFee: data?.deliveryFee ?? null,
        totalWithTip: data?.totalWithTip ?? null,
      });
    } catch {
      const dist = localDistanceKm ?? 0;
      const base = 300,
        perKm = 120;
      const fee = Math.max(base, base + perKm * Math.max(0, dist - 1));
      const tipNum = form.tip ? Number(form.tip) : 0;
      setEstimate({
        distanceKm: dist,
        deliveryFee: Math.round(fee),
        totalWithTip: Math.round(fee + tipNum),
      });
    } finally {
      setFeeLoading(false);
    }
  }

  async function submitOrder() {
    if (!canEstimate) {
      alert("الرجاء تحديد إحداثيات الاستلام والتسليم.");
      return;
    }
    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("auth:prompt", { detail: { mode: "login" } })
      );
      return;
    }
    setBusy(true);
    try {
      const payload = {
        paymentMethod: form.paymentMethod,
        scheduledFor: form.scheduledFor
          ? new Date(form.scheduledFor).toISOString()
          : null,
        tip: form.tip ? Number(form.tip) : 0,
        notes: form.notes?.trim() || undefined,
        errand: {
          category: form.category,
          description: form.description?.trim() || undefined,
          size: form.size,
          weightKg: form.weightKg ? Number(form.weightKg) : undefined,
          pickup: form.pickup,
          dropoff: form.dropoff,
          waypoints: form.waypoints,
        },
      } as const;
      const order = await submitErrandOrder(payload);
      clearStoredData(); // تنظيف البيانات المحفوظة بعد إتمام الطلب
      alert(`تم إنشاء الطلب. رقم الطلب: ${order._id}`);
      navigate(`/orders/errands/${order._id}`);
    } catch (err: unknown) {
      const msg =
        (err as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as unknown as { message?: string })?.message || "حدث خطأ غير متوقع";
      alert(msg);
    } finally {
      setBusy(false);
    }
  }

  function onNext() {
    if (!isStepValid(step)) {
      alert("أكمل الحقول المطلوبة قبل المتابعة.");
      return;
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else submitOrder();
  }
  function onBack() {
    if (step > 0) setStep((s) => s - 1);
    else {
      clearStoredData(); // تنظيف البيانات عند الخروج من الصفحة
      navigate(-1);
    }
  }

  function onStepClick(clickedStep: number) {
    // لا يمكن النقر على خطوات لم تكتمل بعد
    if (clickedStep <= step) {
      setStep(clickedStep);
    }
  }

  function renderStepContent() {
    const key: StepKey = STEPS[step].key;
    switch (key) {
      case "specs":
        return <SpecsStep form={form} onSet={handleSet} />;
      case "pickup":
        return <PickupStep form={form} onPoint={handlePoint} currentStep={step} />;
      case "dropoff":
        return (
          <DropoffStep
            form={form}
            onPoint={handlePoint}
            localDistanceKm={localDistanceKm}
            currentStep={step}
          />
        );
      case "pay":
        return <PayStep form={form} onSet={handleSet} />;
      case "review":
        return (
          <ReviewStep
            form={form}
            estimate={estimate}
            feeLoading={feeLoading}
            canEstimate={canEstimate}
            localDistanceKm={localDistanceKm}
            onFetchEstimate={fetchEstimate}
          />
        );
      default:
        return null;
    }
  }

  return (
    <ErrorBoundary>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
        dir="rtl"
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,.95) 0%, rgba(255,255,255,.85) 100%)",
          }}
        >
          <Toolbar sx={{ py: 1.5 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ color: "primary.main" }}
            >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                flex: 1,
                textAlign: "center",
                fontWeight: 700,
                color: "primary.main",
              }}
            >
               اخدمني — إنشاء طلب
            </Typography>
            <Box sx={{ width: 48 }} />
          </Toolbar>
        </AppBar>

        <StepperHeader step={step} onStepClick={onStepClick} />

        <Container ref={scrollRef} maxWidth="md" sx={{ px: 2, py: 2, pb: 12 }}>
          <Box>{renderStepContent()}</Box>
        </Container>

        <Paper
          elevation={8}
          sx={{ position: "fixed", bottom: 0, left: 0, right: 0, p: 2 }}
        >
          <Box sx={{ display: "flex", gap: 2, maxWidth: "md", mx: "auto" }}>
            <Button variant="outlined" onClick={onBack} sx={{ flex: 1 }}>
              {step === 0 ? "عودة" : "رجوع"}
            </Button>
            <Button
              variant="contained"
              onClick={onNext}
              disabled={!isStepValid(step) || (busy && isLast)}
              sx={{ flex: 2 }}
            >
              {busy && isLast
                ? "جارٍ إنشاء الطلب..."
                : isLast
                ? "تأكيد الطلب"
                : "التالي"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </ErrorBoundary>
  );
};

export default AkhdimniPage;
