// مطابق لـ app-user ArabonSearchScreen
import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  InputAdornment,
  TextField,
  Chip,
  CircularProgress,
  Container,
  Button,
} from "@mui/material";
import { ArrowBack, Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import { Description } from "@mui/icons-material";
import ArabonCard from "./ArabonCard";
import { useArabonSearch } from "../hooks/useArabonSearch";
import type { ArabonItem, ArabonStatus } from "../types";

const STATUS_OPTIONS: { key: ArabonStatus | ""; label: string }[] = [
  { key: "", label: "الكل" },
  { key: "draft", label: "مسودة" },
  { key: "pending", label: "في الانتظار" },
  { key: "confirmed", label: "مؤكد" },
  { key: "completed", label: "مكتمل" },
  { key: "cancelled", label: "ملغي" },
];

interface ArabonSearchProps {
  onBack: () => void;
  onViewItem?: (item: ArabonItem) => void;
}

const ArabonSearch: React.FC<ArabonSearchProps> = ({ onBack, onViewItem }) => {
  const [status, setStatus] = useState<ArabonStatus | "">("");
  const {
    query,
    setQuery,
    items,
    loading,
    loadingMore,
    hasMore,
    searched,
    loadMore,
  } = useArabonSearch(status);

  const renderEmpty = () => {
    if (loading) return null;
    const q = query.trim();
    if (!q) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
          <SearchIcon sx={{ fontSize: 64, color: "grey.400" }} />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
            ابحث في العربونات
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: "center" }}>
            اكتب كلمة في العنوان أو الوصف ثم اختر فلتر الحالة إن أردت
          </Typography>
        </Box>
      );
    }
    if (!searched) return null;
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
        <Description sx={{ fontSize: 64, color: "grey.400" }} />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
          لا توجد نتائج
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: "center" }}>
          جرّب كلمات أخرى أو غيّر فلتر الحالة
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", pb: 10 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1, textAlign: "center" }}>
          البحث في العربونات
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      <Box sx={{ p: 2, backgroundColor: "background.paper" }}>
        <TextField
          fullWidth
          placeholder="عنوان أو وصف..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setQuery("")}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "grey.50" } }}
        />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
          {STATUS_OPTIONS.map((opt) => (
            <Chip
              key={opt.key || "all"}
              label={opt.label}
              onClick={() => setStatus(opt.key)}
              variant={status === opt.key ? "filled" : "outlined"}
              color={status === opt.key ? "primary" : "default"}
              size="small"
            />
          ))}
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ py: 2 }}>
        {loading && items.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              جاري البحث...
            </Typography>
          </Box>
        ) : items.length === 0 ? (
          renderEmpty()
        ) : (
          <>
            {items.map((item) => (
              <ArabonCard
                key={item._id}
                item={item}
                onView={onViewItem ? () => onViewItem(item) : undefined}
              />
            ))}
            {hasMore && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "جاري التحميل..." : "تحميل المزيد"}
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ArabonSearch;
