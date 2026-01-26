import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import type { Marketer as ApiMarketer } from "@/api/marketers";

// Extended type for form with additional fields
type Marketer = ApiMarketer & {
  fullName?: string;
  password?: string;
  team?: string;
  area?: string;
  city?: string;
};

export default function MarketerDialog({
  open,
  onClose,
  onSave,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: Marketer) => Promise<void>;
  editing?: Marketer | null;
}) {
  const [form, setForm] = useState<Marketer>({
    _id: "",
    name: "",
    fullName: "",
    phone: "",
    email: "",
    status: "active",
    commissionRate: 0,
    totalCommissions: 0,
    totalApplications: 0,
    approvedApplications: 0,
    createdAt: "",
    updatedAt: "",
    password: "", // للإنشاء فقط
    team: "",
    area: "",
    city: "",
  });

  useEffect(() => {
    if (editing) {
      // لا ترسل الباسوورد في التعديل
      const { name, fullName, phone, email, team, area, city, status, _id, createdAt, updatedAt } = editing;
      setForm({
        _id: _id || "",
        name: name || fullName || "",
        fullName: fullName || name || "",
        phone: phone || "",
        email: email || "",
        password: "",
        team: team || "",
        area: area || "",
        city: city || "",
        status: status || "active",
        commissionRate: editing.commissionRate || 0,
        totalCommissions: editing.totalCommissions || 0,
        totalApplications: editing.totalApplications || 0,
        approvedApplications: editing.approvedApplications || 0,
        createdAt: createdAt || "",
        updatedAt: updatedAt || "",
      });
    } else {
      setForm({
        _id: "",
        name: "",
        fullName: "",
        phone: "",
        email: "",
        password: "",
        team: "",
        area: "",
        city: "",
        status: "active",
        commissionRate: 0,
        totalCommissions: 0,
        totalApplications: 0,
        approvedApplications: 0,
        createdAt: "",
        updatedAt: "",
      });
    }
  }, [editing]);

  const validate = () => {
    if (!form.fullName?.trim()) return "الاسم مطلوب";
    if (!form.phone?.trim()) return "الهاتف مطلوب";
    if (!editing) {
      if (!form.password || form.password.length < 8)
        return "كلمة المرور 8 أحرف على الأقل";
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      return "البريد غير صالح";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }
    const payload = { ...form };
    if (editing) delete payload.password;
    await onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? "تعديل مسوّق" : "إضافة مسوّق"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="الاسم"
            value={form.fullName}
            onChange={(e) =>
              setForm((f: Marketer) => ({ ...f, fullName: e.target.value }))
            }
            fullWidth
          />
          <TextField
            label="الهاتف"
            value={form.phone}
            onChange={(e) =>
              setForm((f: Marketer) => ({ ...f, phone: e.target.value }))
            }
            fullWidth
          />
          <TextField
            label="البريد"
            value={form.email}
            onChange={(e) =>
              setForm((f: Marketer) => ({ ...f, email: e.target.value }))
            }
            fullWidth
          />
          {!editing && (
            <TextField
              label="كلمة المرور"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f: Marketer) => ({ ...f, password: e.target.value }))
              }
              fullWidth
              helperText="ثمانية أحرف على الأقل"
            />
          )}
          <TextField
            label="الفريق"
            value={form.team}
            onChange={(e) =>
              setForm((f: Marketer) => ({ ...f, team: e.target.value }))
            }
            fullWidth
          />
          <TextField
            label="المنطقة"
            value={form.area}
            onChange={(e) =>
              setForm((f: Marketer) => ({ ...f, area: e.target.value }))
            }
            fullWidth
          />
          <TextField
            label="المدينة"
            value={form.city}
            onChange={(e) =>
              setForm((f: Marketer) => ({ ...f, city: e.target.value }))
            }
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Button variant="contained" onClick={handleSave}>
          حفظ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
