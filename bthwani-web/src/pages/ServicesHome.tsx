// الصفحة الرئيسية - مطابقة لـ app-user (ServicesHomeScreen)
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Container, Grid, Typography } from "@mui/material";
import { SERVICES } from "../constants/services";
import ServiceCard from "../components/common/ServiceCard";

const ServicesHome: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        pb: { xs: 10, md: 5 },
      }}
    >
      {/* Header Section - مطابق لـ app-user */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #FF500D 0%, #ff6b2b 100%)",
          color: "white",
          py: 4,
          px: 2,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          mb: 3,
        }}
      >
        <Container maxWidth="xl">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontFamily: "Cairo, sans-serif",
              mb: 1,
            }}
          >
            {t("appName")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              opacity: 0.95,
              fontFamily: "Cairo, sans-serif",
            }}
          >
            {t("services.chooseSubtitle")}
          </Typography>
        </Container>
      </Box>

      {/* Services Grid */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={3}>
          {SERVICES.map((service) => (
            <Grid
              key={service.id}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              sx={{ display: "flex" }}
            >
              <Box sx={{ width: "100%" }}>
                <ServiceCard
                  name={service.name}
                  description={service.description}
                  icon={service.icon}
                  color={service.color}
                  onClick={() => navigate(service.path)}
                  disabled={!service.enabled}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ServicesHome;
