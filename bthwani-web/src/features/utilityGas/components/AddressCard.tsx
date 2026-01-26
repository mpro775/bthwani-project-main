// src/features/utilityGas/components/AddressCard.tsx
import React from "react";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import { LocationOn, Place, Edit } from "@mui/icons-material";
import type { Address } from "../types";

export const AddressCard: React.FC<{
  profileLoading: boolean;
  addresses: Address[];
  selectedAddress: Address | null;
  onOpenModal: () => void;
  requireAuth: () => boolean;
}> = ({
  profileLoading,
  addresses,
  selectedAddress,
  onOpenModal,
  requireAuth,
}) => {
  if (profileLoading) {
    return (
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LocationOn sx={{ fontSize: 20 }} /> عنوان التسليم
          </Typography>
          <Box
            sx={{
              py: 3,
              textAlign: "center",
              background: (t) => alpha(t.palette.primary.main, 0.05),
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              جارٍ تحميل العناوين...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!addresses.length) {
    return (
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LocationOn sx={{ fontSize: 20 }} /> عنوان التسليم
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "info.main",
              background: (t) => alpha(t.palette.info.main, 0.08),
            }}
          >
            <Typography variant="body2">
              لا توجد عناوين محفوظة. يرجى إضافة عنوان جديد أولاً.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <LocationOn sx={{ fontSize: 20 }} /> عنوان التسليم
        </Typography>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
            background: (t) => alpha(t.palette.primary.main, 0.05),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
              <Place sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {selectedAddress?.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAddress?.city}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => {
              if (!requireAuth()) return;
              onOpenModal();
            }}
          >
            تغيير العنوان
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
