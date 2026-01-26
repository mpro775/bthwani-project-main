// components/auth/AuthRequiredModal.tsx
import { Dialog, DialogTitle, DialogContent, Button, Stack } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

export default function AuthRequiredModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const goLogin = () => navigate("/login", { state: { from: location } });
  const goRegister = () => navigate("/register", { state: { from: location } });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>يلزم تسجيل الدخول</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button fullWidth variant="contained" onClick={goLogin}>تسجيل الدخول</Button>
          <Button fullWidth variant="outlined" onClick={goRegister}>إنشاء حساب</Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

/*
مثال الاستخدام في أي مكون:

import { useAuthGate } from "../../hooks/useAuthGate";
import AuthRequiredModal from "../auth/AuthRequiredModal";

const MyComponent = () => {
  const { ensureAuth, askAuthOpen, setAskAuthOpen } = useAuthGate();

  const handleAddToFavorites = (productId: string) => {
    ensureAuth(() => {
      // الفعل الفعلي هنا للمستخدم المسجّل
      console.log("Adding to favorites:", productId);
      // addToFavorites(productId);
    });
  };

  const handleProceedToPayment = () => {
    ensureAuth(() => {
      // الفعل الفعلي هنا للمستخدم المسجّل
      console.log("Proceeding to payment");
      // proceedToPayment();
    });
  };

  return (
    <>
      <Button
        onClick={() => handleAddToFavorites("product123")}
        variant="outlined"
      >
        إضافة للمفضلة
      </Button>

      <Button
        onClick={handleProceedToPayment}
        variant="contained"
        sx={{ ml: 2 }}
      >
        متابعة للدفع
      </Button>

      <AuthRequiredModal
        open={askAuthOpen}
        onClose={() => setAskAuthOpen(false)}
      />
    </>
  );
};
*/