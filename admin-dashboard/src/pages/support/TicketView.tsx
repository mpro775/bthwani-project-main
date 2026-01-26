// src/pages/support/TicketView.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "../../utils/axios";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
} from "@mui/material";
import MessageThread from "./MessageThread";
import CustomerPanel from "./CustomerPanel";

interface Ticket {
  _id: string;
  number: number;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  assignee: string;
  requester: {
    userId: string;
    userInfo: {
      name?: string;
      email?: string;
    };
  };
  links?: {
    orderId?: string;
    store?: string;
    driver?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TicketPatch {
  status?: string;
  assignee?: string;
}

export default function TicketView() {
  const { id } = useParams();
  const [t, setT] = useState<Ticket | null>(null);
  const [patch, setPatch] = useState<TicketPatch>({});

  const load = useCallback(async () => {
    try {
      // نحاول الحصول على التذكرة بالـ ID من قائمة التذاكر
      const r = await axios.get("/admin/dashboard/support-tickets", {
        params: { search: id, page: 1, limit: 1 },
      });
      if (r.data.tickets && r.data.tickets.length > 0) {
        setT(r.data.tickets[0]);
      } else {
        setT(null);
      }
    } catch (error) {
      console.error("Error loading ticket:", error);
      setT(null);
    }
  }, [id]);
  useEffect(() => {
    load(); 
  }, [id ,load]);

  const save = async () => {
    if (!id || !patch.status) return;

    try {
      await axios.put(`/admin/dashboard/support-tickets/${id}/status`, {
        status: patch.status,
        assignee: patch.assignee,
      });
      setPatch({});
      await load();
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  return (
    <Box p={2} display="flex" gap={2} alignItems="flex-start">
      <Box flex={1} display="flex" flexDirection="column" gap={2}>
        <Paper style={{ padding: 12 }}>
          <Typography variant="h6">
            #{t?.number} — {t?.subject}
          </Typography>

          {/* معلومات التذكرة */}
          <Box mt={2} display="flex" gap={2} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="text.secondary">الحالة</Typography>
              <Typography variant="body2">
                <Chip
                  label={t?.status}
                  color={
                    t?.status === "new" ? "error" :
                    t?.status === "open" ? "warning" :
                    t?.status === "pending" ? "info" :
                    t?.status === "resolved" ? "success" : "default"
                  }
                  size="small"
                />
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">الأولوية</Typography>
              <Typography variant="body2">
                <Chip
                  label={t?.priority}
                  color={
                    t?.priority === "urgent" ? "error" :
                    t?.priority === "high" ? "warning" :
                    t?.priority === "normal" ? "info" : "default"
                  }
                  size="small"
                />
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">تاريخ الإنشاء</Typography>
              <Typography variant="body2">
                {t?.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">آخر تحديث</Typography>
              <Typography variant="body2">
                {t?.updatedAt ? new Date(t.updatedAt).toLocaleString() : "-"}
              </Typography>
            </Box>
          </Box>

          {/* معلومات العميل */}
          {t?.requester && (
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary">معلومات العميل</Typography>
              <Paper variant="outlined" sx={{ p: 1, mt: 0.5 }}>
                <Typography variant="body2">
                  <strong>الاسم:</strong> {t.requester.userInfo.name || "غير محدد"}
                </Typography>
                <Typography variant="body2">
                  <strong>البريد الإلكتروني:</strong> {t.requester.userInfo.email || "غير محدد"}
                </Typography>
                <Typography variant="body2">
                  <strong>معرف المستخدم:</strong> {t.requester.userId}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* الروابط */}
          {t?.links && (t.links.orderId || t.links.store || t.links.driver) && (
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary">الروابط</Typography>
              <Box mt={0.5} display="flex" gap={1} flexWrap="wrap">
                {t.links.orderId && (
                  <Chip label={`طلب ${t.links.orderId.slice(-6)}`} size="small" variant="outlined" />
                )}
                {t.links.store && (
                  <Chip label={`متجر ${t.links.store.slice(-6)}`} size="small" variant="outlined" />
                )}
                {t.links.driver && (
                  <Chip label={`سائق ${t.links.driver.slice(-6)}`} size="small" variant="outlined" />
                )}
              </Box>
            </Box>
          )}

          {/* الوصف */}
          {t?.description && (
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary">الوصف</Typography>
              <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5 }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {t.description}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* تحديث الحالة والمعيّن */}
          <Box mt={2} display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>تحديث الحالة</InputLabel>
              <Select
                label="تحديث الحالة"
                value={patch.status || ""}
                onChange={(e) =>
                  setPatch((p: TicketPatch) => ({ ...p, status: e.target.value }))
                }
              >
                <MenuItem value="">اختر الحالة</MenuItem>
                {[
                  "new",
                  "open",
                  "pending",
                  "resolved",
                  "closed",
                ].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="المُعيّن (البريد الإلكتروني)"
              value={patch.assignee ?? t?.assignee ?? ""}
              onChange={(e) =>
                setPatch((p: TicketPatch) => ({ ...p, assignee: e.target.value }))
              }
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              onClick={save}
              disabled={!patch.status && !patch.assignee}
            >
              حفظ التغييرات
            </Button>
            {(patch.status || patch.assignee) && (
              <Button
                variant="outlined"
                onClick={() => setPatch({})}
              >
                إلغاء
              </Button>
            )}
          </Box>
        </Paper>

        <MessageThread ticketId={id!} />
      </Box>

      <CustomerPanel userId={t?.requester?.userId} />
    </Box>
  );
}
