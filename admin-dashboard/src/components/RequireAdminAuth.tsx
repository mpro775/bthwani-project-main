// src/components/RequireAdminAuth.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Box, CircularProgress, Typography, Alert, Button } from "@mui/material";
import { auth } from "../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // فحص التوكن
          const token = await user.getIdToken(true);
          const adminToken = localStorage.getItem("adminToken");
          
          if (token && adminToken === token) {
            setIsAuthenticated(true);
            setError("");
          } else {
            // تحديث التوكن
            localStorage.setItem("adminToken", token);
            localStorage.setItem("adminUser", JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName
            }));
            setIsAuthenticated(true);
            setError("");
          }
        } else {
          // لا يوجد مستخدم مسجل دخول
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
    });

    return () => unsubscribe();
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
