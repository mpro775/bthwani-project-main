// src/middleware/withAdminAuth.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const withAdminAuth = (Component: React.ComponentType) => {
  return () => {
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem("adminToken"); // <-- كان "token"
      if (!token) navigate("/admin/login");
    }, [navigate]);

    return <Component />;
  };
};
