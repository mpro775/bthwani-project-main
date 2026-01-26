import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";

type CommissionRule = { trigger: string; amountYER: number };
type CommissionPlan = { _id: string; name: string; active: boolean; rules?: CommissionRule[] };

export default function PlanDialog({
  open,
  onClose,
  onSave,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (p: { name: string; rules: CommissionRule[] }) => Promise<void>;
  editing?: CommissionPlan | null;
}) {
  const [name, setName] = useState("");
  const [rules, setRules] = useState<CommissionRule[]>([
    { trigger: "store_approved", amountYER: 1000 },
  ]);
  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setRules(editing.rules || []);
    } else {
      setName("");
      setRules([{ trigger: "store_approved", amountYER: 1000 }]);
    }
  }, [editing]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? "تعديل خطة" : "إضافة خطة"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          {rules.map((r, i) => (
            <Stack key={i} direction="row" spacing={1}>
              <TextField
                label="Trigger"
                value={r.trigger}
                onChange={(e) => {
                  const arr = [...rules];
                  arr[i] = { ...arr[i], trigger: e.target.value };
                  setRules(arr);
                }}
              />
              <TextField
                label="Amount (YER)"
                type="number"
                value={r.amountYER}
                onChange={(e) => {
                  const arr = [...rules];
                  arr[i] = { ...arr[i], amountYER: Number(e.target.value) };
                  setRules(arr);
                }}
              />
            </Stack>
          ))}
          <Button
            onClick={() =>
              setRules([...rules, { trigger: "store_approved", amountYER: 0 }])
            }
          >
            إضافة Rule
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Button
          variant="contained"
          onClick={async () => {
            await onSave({ name, rules });
            onClose();
          }}
        >
          حفظ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
