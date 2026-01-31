// مطابق لـ app-user MaaroufListScreen
import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import MaaroufCard from "./MaaroufCard";
import { useMaaroufList } from "../hooks/useMaaroufList";
import type { MaaroufItem } from "../types";

interface MaaroufListProps {
  onViewItem?: (item: MaaroufItem) => void;
  onCreateItem?: () => void;
}

const MaaroufList: React.FC<MaaroufListProps> = ({
  onViewItem,
  onCreateItem,
}) => {
  const { items, loading, loadingMore, hasMore, error, loadMore } =
    useMaaroufList();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        pb: 10,
      }}
    >
      <Box
        sx={{
          p: 2.5,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            textAlign: "center",
            fontFamily: "Cairo, sans-serif",
          }}
        >
          المعروف
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 0.5 }}
        >
          المفقودات والموجودات
        </Typography>

        {onCreateItem && (
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={onCreateItem}
            sx={{ mt: 2 }}
          >
            إضافة إعلان
          </Button>
        )}
      </Box>

      <Container maxWidth="md" sx={{ py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && items.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              جاري تحميل الإعلانات...
            </Typography>
          </Box>
        ) : !loading && items.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 8,
            }}
          >
            <SearchIcon sx={{ fontSize: 64, color: "grey.400" }} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
              لا توجد إعلانات
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, textAlign: "center" }}
            >
              لا توجد إعلانات مفقودات أو موجودات في الوقت الحالي
            </Typography>
          </Box>
        ) : (
          <>
            {items.map((item) => (
              <MaaroufCard
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
                  startIcon={
                    loadingMore ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : null
                  }
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

export default MaaroufList;
