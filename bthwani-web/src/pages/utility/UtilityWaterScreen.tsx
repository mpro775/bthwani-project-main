// src/features/utilityWater/pages/UtilityWaterPage.tsx
import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useWaterOrder } from "../../features/utilityWater/hooks/useWaterOrder";
import { AddressCard } from "../../features/utilityWater/components/AddressCard";
import { WaterOptionsCard } from "../../features/utilityWater/components/WaterOptionsCard";
import { PaymentCard } from "../../features/utilityWater/components/PaymentCard";
import { SchedulingCard } from "../../features/utilityWater/components/SchedulingCard";
import { NotesCard } from "../../features/utilityWater/components/NotesCard";
import { AddressModal } from "../../features/utilityWater/components/AddressModal";

const UtilityWaterPage: React.FC = () => {
  const theme = useTheme();
  const {
    // loading
    profileLoading,
    optionsLoading,
    submitting,
    // data
    addresses,
    selectedAddress,
    selectedAddressId,
    setSelectedAddressId,
    options,
    // ui
    size,
    setSize,
    half,
    setHalf,
    qty,
    setQty,
    pm,
    setPM,
    notes,
    setNotes,
    scheduledMode,
    setScheduledMode,
    scheduledFor,
    setScheduledFor,
    addrModal,
    setAddrModal,
    // derived
    sizes,
    displayUnitPrice,
    itemsTotal,
    canSubmit,
    // helpers
    requireAuth,
    submitOrder,
  } = useWaterOrder();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        py: 2,
      }}
    >
      <Container maxWidth="lg" sx={{ pb: { xs: 20, md: 8 } }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4, py: 3 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: "bold",
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            طلب وايت الماء
          </Typography>
          <Typography variant="body1" color="text.secondary">
            اطلب وايت الماء بسهولة وسرعة مع خدمة التوصيل السريع
          </Typography>
        </Box>

        <AddressCard
          profileLoading={profileLoading}
          addresses={addresses}
          selectedAddress={selectedAddress}
          onOpenModal={() => setAddrModal(true)}
          requireAuth={requireAuth}
        />

        <WaterOptionsCard
          loading={optionsLoading}
          available={!!options?.water}
          sizes={sizes}
          selected={size}
          onSelect={(k) => setSize(k)}
          allowHalf={!!options?.water?.allowHalf}
          half={half}
          setHalf={setHalf}
          qty={qty}
          setQty={setQty}
          displayUnitPrice={displayUnitPrice}
          itemsTotal={itemsTotal}
        />

        <PaymentCard pm={pm} setPM={setPM} requireAuth={requireAuth} />

        <SchedulingCard
          mode={scheduledMode}
          setMode={setScheduledMode}
          scheduledFor={scheduledFor}
          setScheduledFor={setScheduledFor}
        />

        <NotesCard notes={notes} setNotes={setNotes} />

        <Button
          variant="contained"
          fullWidth
          onClick={async () => {
            const id = await submitOrder();
            if (id) window.location.href = `/orders/${id}`;
          }}
          disabled={!canSubmit || submitting}
          startIcon={!submitting && canSubmit ? <CheckCircle /> : undefined}
          sx={{
            mt: 2,
            borderRadius: 3,
            py: 2,
            fontSize: "1.1rem",
            fontWeight: "bold",
          }}
        >
          {submitting
            ? "جاري إنشاء الطلب..."
            : `تأكيد الطلب - ${itemsTotal.toLocaleString()} ر.ي`}
        </Button>

        {/* Address Modal */}
        <AddressModal
          open={addrModal}
          onClose={() => setAddrModal(false)}
          addresses={addresses}
          selectedId={selectedAddressId}
          onSelect={setSelectedAddressId}
        />
      </Container>

      {/* Background decoration */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: -1,
          opacity: 0.1,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "15%",
            left: "10%",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: theme.palette.primary.main,
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "70%",
            right: "20%",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: theme.palette.secondary.main,
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
      </Box>
      <style>{`@keyframes float {0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}`}</style>
    </Box>
  );
};

export default UtilityWaterPage;
