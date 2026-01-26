import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Add, Refresh } from "@mui/icons-material";
import { useCommissionPlans } from "./useCommissionPlans";
import PlanDialog from "./PlanDialog";

type CommissionRule = { trigger: string; amountYER: number };
type CommissionPlan = { _id: string; name: string; active: boolean; rules?: CommissionRule[] };

export default function CommissionPlansPage() {
  const { rows, loading, create, patch, setStatus, remove, list } =
    useCommissionPlans();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CommissionPlan | null>(null);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          خطط الحوافز
        </Typography>
        <Box>
          <Button
            startIcon={<Refresh />}
            onClick={() => list()}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            تحديث
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            إضافة
          </Button>
        </Box>
      </Box>

      <Paper>
        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>الاسم</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>Rules</TableCell>
                <TableCell width={260}>إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.active ? "مفعّلة" : "معطّلة"}
                      color={r.active ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    {r.rules
                      ?.map((x: CommissionRule) => `${x.trigger}:${x.amountYER}`)
                      .join(", ")}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditing(r);
                        setOpen(true);
                      }}
                    >
                      تعديل
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setStatus(r._id, !r.active)}
                    >
                      {r.active ? "تعطيل" : "تفعيل"}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => remove(r._id)}
                    >
                      حذف
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <PlanDialog
        open={open}
        editing={editing}
        onClose={() => setOpen(false)}
        onSave={async (p) => {
          if (editing) {
            await patch(editing._id, p);
          } else {
            await create(p);
          }
        }}
      />
    </Box>
  );
}
