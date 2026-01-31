// مطابق لـ app-user AkhdimniOptionsScreen
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Container,
} from "@mui/material";
import {
  ArrowBack,
  BackHand,
  LocalFireDepartment,
  WaterDrop,
  ChevronRight,
} from "@mui/icons-material";

interface OptionItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

const OPTIONS: OptionItem[] = [
  {
    id: "akhdimni",
    name: "اخدمني",
    description: "أغراض خاصة ومهام مخصصة",
    icon: <BackHand sx={{ fontSize: 32 }} />,
    color: "#1976D2",
    path: "/akhdimni/errand",
  },
  {
    id: "gas",
    name: "غاز",
    description: "طلب دبة غاز",
    icon: <LocalFireDepartment sx={{ fontSize: 32 }} />,
    color: "#E65100",
    path: "/utilities/gas",
  },
  {
    id: "water",
    name: "وايت ماء",
    description: "طلب وايت ماء",
    icon: <WaterDrop sx={{ fontSize: 32 }} />,
    color: "#0288D1",
    path: "/utilities/water",
  },
];

const AkhdimniOptions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        pb: 4,
      }}
    >
      {/* Header - مطابق لـ app-user */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 2,
          backgroundColor: "#1976D2",
          color: "white",
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ color: "white", mr: 1 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            flex: 1,
            textAlign: "center",
            fontWeight: 700,
            fontFamily: "Cairo, sans-serif",
          }}
        >
          اخدمني
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          textAlign: "center",
          mt: 2,
          px: 2,
        }}
      >
        اختر الخدمة التي تريدها
      </Typography>

      <Container maxWidth="sm" sx={{ mt: 3, px: 2 }}>
        {OPTIONS.map((option) => (
          <Paper
            key={option.id}
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              mb: 1.5,
              borderRadius: 2,
              borderLeft: 4,
              borderLeftColor: option.color,
              border: "1px solid",
              borderColor: "divider",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "action.hover",
                boxShadow: 1,
              },
            }}
            onClick={() => navigate(option.path)}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                backgroundColor: `${option.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: option.color,
                ml: 2,
              }}
            >
              {option.icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  fontFamily: "Cairo, sans-serif",
                  mb: 0.5,
                }}
              >
                {option.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: "Cairo, sans-serif" }}
              >
                {option.description}
              </Typography>
            </Box>
            <ChevronRight sx={{ color: "grey.500", fontSize: 28 }} />
          </Paper>
        ))}
      </Container>
    </Box>
  );
};

export default AkhdimniOptions;
