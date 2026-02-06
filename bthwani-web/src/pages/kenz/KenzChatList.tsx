import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  Avatar,
} from "@mui/material";
import { ArrowBack, ChatBubbleOutline } from "@mui/icons-material";
import {
  getConversations,
  type KenzConversation,
} from "../../features/kenz/api-chat";
import { useAuth } from "../../hooks/useAuth";

const KenzChatList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<KenzConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      navigate("/login", { state: { from: "/kenz/chat" } });
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await getConversations({ limit: 50 });
      setItems(res?.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل في تحميل المحادثات");
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOtherUser = (c: KenzConversation) => {
    const uid = user?._id ?? user?.id ?? "";
    const ownerId =
      typeof c.ownerId === "object" && c.ownerId?._id
        ? c.ownerId._id
        : String(c.ownerId);
    const interestedId =
      typeof c.interestedUserId === "object" && c.interestedUserId?._id
        ? c.interestedUserId._id
        : String(c.interestedUserId);
    if (String(ownerId) === String(uid)) return c.interestedUserId;
    return c.ownerId;
  };

  const getUnreadCount = (c: KenzConversation) => {
    const uid = user?._id ?? user?.id ?? "";
    const ownerId =
      typeof c.ownerId === "object" && c.ownerId?._id
        ? c.ownerId._id
        : String(c.ownerId);
    return String(ownerId) === String(uid)
      ? c.unreadCountOwner ?? 0
      : c.unreadCountInterested ?? 0;
  };

  if (!user) {
    return null;
  }

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: "background.default", pb: 10 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 2,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <IconButton onClick={() => navigate("/kenz")} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1 }}>
          محادثات كنز
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 6,
            }}
          >
            <ChatBubbleOutline sx={{ fontSize: 64, color: "grey.400" }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              لا توجد محادثات بعد
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              من صفحة تفاصيل إعلان اضغط "تواصل مع المعلن" لبدء محادثة
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {items.map((c) => {
              const other = getOtherUser(c);
              const name =
                (other as any)?.name ?? (other as any)?.email ?? "مستخدم";
              const unread = getUnreadCount(c);
              return (
                <ListItemButton
                  key={c._id}
                  onClick={() => navigate(`/kenz/chat/${c._id}`)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                    {name.charAt(0)}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography fontWeight={600}>{name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(c.lastMessageAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {c.kenzId?.title ?? "إعلان"}{" "}
                        {unread > 0 && ` • ${unread} غير مقروءة`}
                      </Typography>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default KenzChatList;
