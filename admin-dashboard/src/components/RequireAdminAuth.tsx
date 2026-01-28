// src/components/RequireAdminAuth.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Box, CircularProgress, Typography, Alert, Button } from "@mui/material";

interface RequireAdminAuthProps {
  children: React.ReactNode;
}

export default function RequireAdminAuth({ children }: RequireAdminAuthProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = () => {
      try {
        const adminToken = localStorage.getItem("adminToken");
        const adminUser = localStorage.getItem("adminUser");
        
        if (adminToken && adminUser) {
          setIsAuthenticated(true);
          setError("");
        } else {
          setIsAuthenticated(false);
          setError("يجب تسجيل الدخول للوصول إلى هذه الصفحة");
          navigate("/admin/login", { 
            state: { from: location },
            replace: true 
          });
        }
      } catch (err) {
        console.error("خطأ في فحص المصادقة:", err);
        setError("حدث خطأ في فحص المصادقة");
        setIsAuthenticated(false);
        navigate("/admin/login", { 
          state: { from: location },
          replace: true 
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          جاري فحص المصادقة...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 3,
          p: 3
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error || "غير مصرح لك بالوصول إلى هذه الصفحة"}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/admin/login")}
          size="large"
        >
          تسجيل الدخول
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}
