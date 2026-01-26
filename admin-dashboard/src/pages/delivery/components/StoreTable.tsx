// src/pages/admin/delivery/components/StoreTable.tsx
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Tooltip,
  Button,
  IconButton,
  Chip,
  useTheme,
  Paper,
  Box,
  Typography,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import type { DeliveryStore } from "../../../type/delivery";
import { useState } from "react";
import StoreStatsDialog from "./StoreStatsDialog";
import BarChartIcon from "@mui/icons-material/BarChart"; // أيقونة الإحصائيات
interface Props {
  stores: DeliveryStore[];
  onEdit: (s: DeliveryStore) => void;
  onDelete: (id: string) => void;
  onDetail: (id: string) => void;
  loading?: boolean;
}

export default function StoreTable({
  stores,
  onEdit,
  onDelete,
  onDetail,
}: Props) {
  const theme = useTheme();
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [statsStoreId, setStatsStoreId] = useState<string>("");
  return (
    <Paper>
      <Table>
        {/* Header */}
        <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>الشعار</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>الاسم</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>القسم</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>العنوان</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>الحالة</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>التفاصيل</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>إجراءات</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>تقرير</TableCell>
          </TableRow>
        </TableHead>

        {/* Body */}
        <TableBody>
          {stores.map((store) => (
            <TableRow key={store._id} hover>
              <TableCell>
                <Avatar
                  src={store.logo}
                  sx={{
                    width: 56,
                    height: 56,
                    border: `2px solid ${theme.palette.grey[300]}`,
                  }}
                />
              </TableCell>
              <TableCell>
                <Typography fontWeight="medium">{store.name}</Typography>
              </TableCell>
              <TableCell>
                <Chip
              label={store.category?.name || "غير محددة"}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    fontWeight: "bold",
                  }}
                />
              </TableCell>
              <TableCell>
                <Tooltip title={store.address} arrow>
                  <Typography>{store.address}</Typography>
                </Tooltip>
              </TableCell>

              <TableCell>
                <Chip
                  label={store.isActive ? "نشط" : "معطل"}
                  size="small"
                  color={store.isActive ? "success" : "error"}
                  sx={{ fontWeight: "bold" }}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => onDetail(store._id)}
                  sx={{ textTransform: "none" }}
                >
                  التفاصيل
                </Button>
              </TableCell>
              <TableCell>
                <Box display="flex" justifyContent="center" gap={1}>
                  <Tooltip title="تعديل" arrow>
                    <IconButton
                      onClick={() => onEdit(store)}
                      sx={{
                        bgcolor: theme.palette.info.light,
                        color: theme.palette.info.contrastText,
                        "&:hover": {
                          bgcolor: theme.palette.info.main,
                        },
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="حذف" arrow>
                    <IconButton
                      onClick={() => onDelete(store._id)}
                      sx={{
                        bgcolor: theme.palette.error.light,
                        color: theme.palette.error.contrastText,
                        "&:hover": {
                          bgcolor: theme.palette.error.main,
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell>
                <Tooltip title="عرض تقرير إحصائيات">
                  <IconButton
                    onClick={() => {
                      setStatsStoreId(store._id);
                      setStatsDialogOpen(true);
                    }}
                  >
                    <BarChartIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <StoreStatsDialog
        open={statsDialogOpen}
        storeId={statsStoreId}
        onClose={() => setStatsDialogOpen(false)}
      />
    </Paper>
  );
}
