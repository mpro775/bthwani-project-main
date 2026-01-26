// src/components/support/TicketList.tsx
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";

interface TicketItem {
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

// Re-export for backward compatibility
export type { TicketItem };

export default function TicketList({ items }: { items: TicketItem[] }) {
  return (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>الموضوع</TableCell>
            <TableCell>العميل</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell>الأولوية</TableCell>
            <TableCell>المعيّن</TableCell>
            <TableCell>الروابط</TableCell>
            <TableCell>آخر تحديث</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography>لا توجد بيانات</Typography>
              </TableCell>
            </TableRow>
          )}
          {items.map((t: TicketItem) => (
            <TableRow
              key={t._id}
              hover
              style={{ cursor: "pointer" }}
              onClick={() => {
                window.location.href = `/support/ticket/${t._id}`;
              }}
            >
              <TableCell>{t.number}</TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {t.subject}
                  </Typography>
                  {t.description && (
                    <Typography variant="caption" color="text.secondary">
                      {t.description.length > 50 ? `${t.description.slice(0, 50)}...` : t.description}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {t.requester.userInfo.name || "غير محدد"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t.requester.userInfo.email || t.requester.userId}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={t.status}
                  color={
                    t.status === "new" ? "error" :
                    t.status === "open" ? "warning" :
                    t.status === "pending" ? "info" :
                    t.status === "resolved" ? "success" : "default"
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={t.priority}
                  color={
                    t.priority === "urgent" ? "error" :
                    t.priority === "high" ? "warning" :
                    t.priority === "normal" ? "info" : "default"
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>{t.assignee || "-"}</TableCell>
              <TableCell>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {t.links?.orderId && (
                    <Chip label={`طلب ${t.links.orderId.slice(-6)}`} size="small" variant="outlined" />
                  )}
                  {t.links?.store && (
                    <Chip label={`متجر ${t.links.store.slice(-6)}`} size="small" variant="outlined" />
                  )}
                  {t.links?.driver && (
                    <Chip label={`سائق ${t.links.driver.slice(-6)}`} size="small" variant="outlined" />
                  )}
                </Box>
              </TableCell>
              <TableCell>{new Date(t.updatedAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
