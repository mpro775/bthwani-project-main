import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
} from "@mui/material";
import { ArrowBack, Send } from "@mui/icons-material";
import {
  getConversation,
  getMessages,
  sendMessage as sendMessageApi,
  markAsRead,
  type KenzConversation,
  type KenzMessage,
} from "../../features/kenz/api-chat";
import { useAuth } from "../../hooks/useAuth";

const KenzChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<KenzConversation | null>(
    null
  );
  const [messages, setMessages] = useState<KenzMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const listEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = user?._id ?? user?.id ?? "";

  const load = useCallback(async () => {
    if (!conversationId || !currentUserId) {
      if (!currentUserId)
        navigate("/login", { state: { from: `/kenz/chat/${conversationId}` } });
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [conv, msgRes] = await Promise.all([
        getConversation(conversationId),
        getMessages(conversationId, { limit: 50 }),
      ]);
      setConversation(conv);
      setMessages(msgRes?.items ?? []);
      await markAsRead(conversationId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل في تحميل المحادثة");
    } finally {
      setLoading(false);
    }
  }, [conversationId, currentUserId, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !conversationId || sending) return;
    setSending(true);
    setInputText("");
    try {
      const msg = await sendMessageApi(conversationId, text);
      setMessages((prev) => [...prev, msg]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل في إرسال الرسالة");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return null;

  if (loading && !conversation) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const title = conversation?.kenzId?.title ?? "محادثة";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1,
          py: 1.5,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <IconButton onClick={() => navigate("/kenz/chat")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1, textAlign: "center" }} noWrap>
          {title}
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mx: 2, mt: 1 }}
        >
          {error}
        </Alert>
      )}

      <List
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {messages.map((msg) => {
          const isMe =
            String((msg.senderId as any)?._id ?? msg.senderId) ===
            String(currentUserId);
          return (
            <ListItem
              key={msg._id}
              sx={{ justifyContent: isMe ? "flex-end" : "flex-start", px: 0 }}
            >
              <Paper
                elevation={0}
                sx={{
                  maxWidth: "80%",
                  px: 2,
                  py: 1.5,
                  backgroundColor: isMe ? "primary.main" : "grey.200",
                  color: isMe ? "primary.contrastText" : "text.primary",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1">{msg.text}</Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.8, display: "block", mt: 0.5 }}
                >
                  {formatDate(msg.createdAt)}
                </Typography>
              </Paper>
            </ListItem>
          );
        })}
        <div ref={listEndRef} />
      </List>

      <Paper
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        sx={{
          p: 1.5,
          borderRadius: 0,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="اكتب رسالة..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={sending}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  color="primary"
                  disabled={!inputText.trim() || sending}
                >
                  {sending ? <CircularProgress size={24} /> : <Send />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>
    </Box>
  );
};

export default KenzChatPage;
