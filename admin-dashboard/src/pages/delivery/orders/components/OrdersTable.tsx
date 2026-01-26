// src/orders/OrdersTable.tsx
import { Paper, Chip, Tooltip, IconButton, Stack } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRowSelectionModel,
  type GridPaginationModel,
  type GridFilterModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import { Visibility } from "@mui/icons-material";
import dayjs from "dayjs";
import {
  type OrderRow,
  type OrderStatus,
  type PaymentMethod,
  paymentLabels,
  statusLabels,
} from "../types";
const rowOf = (...args: unknown[]) => {
  const [a, b] = args;
  if (a && typeof a === "object" && "row" in a)
    return (a as { row: unknown }).row; // v5
  return b; // v6
};

export default function OrdersTable({
  rows,
  onOpen,
  onSelectionChange,
  paginationModel,
  onPaginationModelChange,
  filterModel,
  onFilterModelChange,
  sortModel,
  onSortModelChange,
}: {
  rows: OrderRow[];
  onOpen: (id: string) => void;
  onSelectionChange: (ids: string[]) => void;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  filterModel: GridFilterModel;
  onFilterModelChange: (model: GridFilterModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
}) {
  const cols: GridColDef<OrderRow>[] = [
    { field: "_id", headerName: "المعرّف", flex: 1, minWidth: 160 },

    {
      field: "user",
      headerName: "العميل",
      flex: 1,
      minWidth: 160,
      valueGetter: (...args) => {
        const row = rowOf(...args) as OrderRow | undefined;
        if (!row) return "—";
        return row.user?.fullName || row.user?.name || row.user?.email || "—";
      },
    },

    {
      field: "orderType",
      headerName: "النوع",
      width: 170,
      renderCell: (p) => {
        const row = p.row as OrderRow | undefined;
        if (!row) return null;
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip
              size="small"
              variant="outlined"
              label={row.orderType === "errand" ? "اخدمني" : "متاجر"}
            />
            {row.orderType === "errand" && row.source === "shein" && (
              <Chip size="small" color="secondary" label="SHEIN" />
            )}
          </Stack>
        );
      },
    },

    {
      field: "stores",
      headerName: "المتاجر",
      flex: 1.2,
      minWidth: 200,
      valueGetter: (...args) => {
        const row = rowOf(...args) as OrderRow | undefined;
        if (!row) return "—";
        return (
          (row.subOrders || [])
            .map((s) => s?.store?.name)
            .filter(Boolean)
            .join(", ") || "—"
        );
      },
    },

    {
      field: "status",
      headerName: "الحالة",
      width: 170,
      renderCell: (p) => {
        const row = p.row as OrderRow | undefined;
        if (!row) return null;
        const s = row.status as OrderStatus;
        const color =
          s === "delivered" || s === "procured"
            ? "success"
            : s === "cancelled" ||
              s === "procurement_failed" ||
              s === "returned"
            ? "error"
            : s === "awaiting_procurement" || s === "preparing"
            ? "warning"
            : s === "out_for_delivery" ||
              s === "assigned" ||
              s === "under_review"
            ? "primary"
            : "default";
        return (
          <Chip
            size="small"
            label={statusLabels[s] || s}
            color={
              color as
                | "default"
                | "primary"
                | "secondary"
                | "success"
                | "error"
                | "warning"
                | "info"
            }
          />
        );
      },
    },

    {
      field: "paymentMethod",
      headerName: "الدفع",
      width: 120,
      valueGetter: (...args) => {
        const row = rowOf(...args) as OrderRow | undefined;
        if (!row) return paymentLabels.cash;
        const pm = (row.paymentMethod as PaymentMethod) ?? "cash";
        return paymentLabels[pm];
      },
    },

    {
      field: "deliveryFee",
      headerName: "رسوم التوصيل",
      width: 130,
      valueGetter: (...args) => {
        const row = rowOf(...args) as OrderRow | undefined;
        const v = Number(row?.deliveryFee ?? 0).toFixed(2);
        return `${v} ﷼`;
      },
    },

    {
      field: "price",
      headerName: "الإجمالي",
      width: 130,
      valueGetter: (...args) => {
        const row = rowOf(...args) as OrderRow | undefined;
        const v = Number(row?.price ?? 0).toFixed(2);
        return `${v} ﷼`;
      },
    },

    {
      field: "createdAt",
      headerName: "التاريخ",
      width: 160,
      valueGetter: (...args) => {
        const row = rowOf(...args) as OrderRow | undefined;
        return row?.createdAt
          ? dayjs(row.createdAt).format("YYYY/MM/DD HH:mm")
          : "—";
      },
    },

    {
      field: "actions",
      headerName: "إجراءات",
      width: 110,
      sortable: false,
      renderCell: (p) =>
        p.row ? (
          <Tooltip title="عرض">
            <IconButton onClick={() => onOpen((p.row as OrderRow)._id)}>
              <Visibility />
            </IconButton>
          </Tooltip>
        ) : null,
    },
  ];

  // Filter out any null/undefined rows for safety
  const safeRows = (rows || []).filter(Boolean);

  return (
    <Paper className="p-2 rounded-2xl" sx={{ height: "70vh" }}>
      <DataGrid
        rows={safeRows}
        getRowId={(r: OrderRow) => r?._id || Math.random().toString()}
        columns={cols}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={(m: GridRowSelectionModel) =>
          onSelectionChange(m as unknown as string[])
        }
        pageSizeOptions={[25, 50, 100]}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        filterModel={filterModel}
        onFilterModelChange={onFilterModelChange}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
      />
    </Paper>
  );
}
