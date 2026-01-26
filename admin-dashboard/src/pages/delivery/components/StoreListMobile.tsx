// ================================
// File: src/pages/admin/delivery/DeliveryStoresPage.tsx (refactored)
// Notes:
// - Cleaned up state + handlers
// - Mobile-first layout with a dedicated <StoreListMobile />
// - Extracted header/action bar into <StoresHeader />
// - Safer form building + payload shaping
// - Kept your existing StoreTable & StoreDialog APIs
// ================================



// ================================
// File: src/pages/admin/delivery/components/StoreListMobile.tsx (new)
// Card-based mobile view; keeps actions accessible with compact UI.
// ================================

import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Avatar,
    IconButton,
    Typography,
    Chip,
    Stack,
    Skeleton,
  } from "@mui/material";
  import { Edit, Delete, ChevronRight } from "@mui/icons-material";
  import type { DeliveryStore } from "../../../type/delivery";
  
  interface StoreListMobileProps {
    stores: DeliveryStore[];
    loading?: boolean;
    onEdit: (s: DeliveryStore) => void;
    onDelete: (id: string) => Promise<void> | void;
    onDetail: (id: string) => void;
  }
  
  export default function StoreListMobile({ stores, loading, onEdit, onDelete, onDetail }: StoreListMobileProps) {
    if (loading && !stores.length) {
      return (
        <Stack spacing={1.5}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={96} />
          ))}
        </Stack>
      );
    }
  
    return (
      <Stack spacing={1.5}>
        {stores.map((s) => (
          <Card key={s._id} sx={{ borderRadius: 2 }}>
            <CardHeader
              avatar={<Avatar src={s.logo || s.image || undefined} alt={s.name}>{s.name?.[0]}</Avatar>}
              title={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" fontWeight={700}>{s.name}</Typography>
                  {s.isActive ? (
                    <Chip size="small" color="success" label="فعال" />
                  ) : (
                    <Chip size="small" color="default" label="متوقف" />
                  )}
                  {s.isFeatured && <Chip size="small" color="primary" label="مميز" />}
                  {s.isTrending && <Chip size="small" color="secondary" label="شائع" />}
                </Stack>
              }
              subheader={s.address}
              action={
                <IconButton aria-label="تفاصيل" onClick={() => onDetail(s._id)}>
                  <ChevronRight />
                </IconButton>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="body2" color="text.secondary">
                عمولة: {s.commissionRate || "0"}%
              </Typography>
              {s.category?.name && (
                <Typography variant="body2" color="text.secondary">التصنيف: {s.category.name}</Typography>
              )}
            </CardContent>
            <CardActions disableSpacing sx={{ justifyContent: "flex-end" }}>
              <IconButton aria-label="تعديل" onClick={() => onEdit(s)}>
                <Edit />
              </IconButton>
              <IconButton aria-label="حذف" onClick={() => onDelete(s._id)}>
                <Delete />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Stack>
    );
  }
  