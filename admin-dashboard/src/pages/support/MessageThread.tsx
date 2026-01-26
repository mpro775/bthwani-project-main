// src/components/support/MessageThread.tsx
import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

interface MessageItem {
  _id: string;
  createdAt: string;
  author?: {
    type: string;
    name?: string;
  };
  isInternalNote?: boolean;
  body: string;
  type?: "message" | "note";
}

export default function MessageThread({ ticketId }: { ticketId: string }) {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [isNoteMode, setIsNoteMode] = useState(false);

  const load = async () => {
    const r = await axios.get(`/support/tickets/${ticketId}/messages`);
    setItems(r.data?.items || []);
  };
  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [ticketId]);

  const sendMessage = async () => {
    if (!body) return;
    await axios.post(`/support/tickets/${ticketId}/messages`, {
      text: body,
    });
    setBody("");
    setInternal(false);
    await load();
  };

  const addNote = async () => {
    if (!body.trim()) return;
    try {
      await axios.post(`/admin/dashboard/support-tickets/${ticketId}/notes`, {
        note: body.trim(),
        internal: internal,
      });
      setBody("");
      setInternal(false);
      setIsNoteMode(false);
      await load();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Paper style={{ padding: 12 }}>
        {items.map((m: MessageItem) => (
          <Box
            key={m._id}
            mb={1}
            p={1}
            border="1px solid #eee"
            borderRadius={1}
            bgcolor={m.isInternalNote || m.type === "note" ? "#fff7e6" : "#fff"}
          >
            <Typography variant="caption">
              {new Date(m.createdAt).toLocaleString()} — {m.author?.name || m.author?.type || "نظام"}
              {m.isInternalNote || m.type === "note" ? " (ملاحظة داخلية)" : ""}
            </Typography>
            <Typography>{m.body}</Typography>
          </Box>
        ))}
      </Paper>

      <Paper style={{ padding: 12 }}>
        {/* أزرار التبديل بين الرسائل والملاحظات */}
        <Box mb={2} display="flex" gap={1}>
          <Button
            variant={!isNoteMode ? "contained" : "outlined"}
            size="small"
            onClick={() => {
              setIsNoteMode(false);
              setInternal(false);
            }}
          >
            رد عادي
          </Button>
          <Button
            variant={isNoteMode ? "contained" : "outlined"}
            size="small"
            onClick={() => setIsNoteMode(true)}
          >
            إضافة ملاحظة
          </Button>
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={3}
          label={isNoteMode ? "اكتب الملاحظة..." : "اكتب ردًا..."}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        {isNoteMode && (
          <Box mt={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={internal}
                  onChange={(e) => setInternal(e.target.checked)}
                />
              }
              label="ملاحظة داخلية (لا تظهر للعميل)"
            />
          </Box>
        )}

        <Box mt={1} display="flex" gap={2} alignItems="center">
          <Button
            variant="contained"
            onClick={isNoteMode ? addNote : sendMessage}
            disabled={!body.trim()}
          >
            {isNoteMode ? "إضافة الملاحظة" : "إرسال الرد"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setBody("");
              setInternal(false);
              setIsNoteMode(false);
            }}
          >
            إلغاء
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

