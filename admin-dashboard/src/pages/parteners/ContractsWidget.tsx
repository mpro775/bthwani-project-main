import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { Box, Paper, Typography, Chip } from "@mui/material";

interface ContractItem {
  _id: string;
  store: string;
  end: string;
  status: string;
}

interface ContractsData {
  count: number;
  items: ContractItem[];
}

export default function ContractsWidget({ days = 30 }: { days?: number }) {
  const [data, setData] = useState<ContractsData>({
    count: 0,
    items: [],
  });

  useEffect(() => {
    axios
      .get("/partners/contracts/expiring", { params: { days } })
      .then((r) => setData(r.data))
      .catch(() => {});
  }, [days]);

  if (!data) return null;

  return (
    <Paper style={{ padding: 12 }}>
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        <Typography variant="subtitle1">عقود تنتهي خلال {days} يوم</Typography>
        <Chip
          label={data.count}
          color={data.count > 0 ? "warning" : "default"}
        />
      </Box>
      {data.items?.slice(0, 6).map((c) => (
        <Box key={c._id} mt={1} display="flex" gap={2}>
          <Typography variant="body2">Store: {c.store}</Typography>
          <Typography variant="body2">
            Ends: {new Date(c.end).toLocaleDateString()}
          </Typography>
          <Typography variant="body2">Status: {c.status}</Typography>
        </Box>
      ))}
    </Paper>
  );
}
