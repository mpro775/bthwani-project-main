// src/pages/ops/drivers/DriverDetails.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
import AttendanceTab from "./tabs/Attendance";
import DocumentsTab from "./tabs/Documents";
import AssetsTab from "./tabs/Assets";
import FinanceTab from "./tabs/Finance";
import ShiftsTab from "./tabs/Shifts";
import VacationsTab from "./tabs/Vacations";

export default function DriverDetails() {
  const { id } = useParams();
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState<{
    _id?: string;
    name?: string;
  } | null>(null);

  useEffect(() => {
    // TODO: اجلب بروفايل السائق من API لديك
    setProfile({ _id: id, name: "—" });
  }, [id]);

  return (
    <Box p={2} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h6">السائق: {profile?.name || id}</Typography>
      <Paper style={{ padding: 12 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)}>
          <Tab label="Attendance" />
          <Tab label="Shifts" />
          <Tab label="Assets" />
          <Tab label="Documents" />
          <Tab label="Finance" />
          <Tab label="Vacations" />
        </Tabs>
      </Paper>
      {tab === 0 && <AttendanceTab id={id!} />}
      {tab === 1 && <ShiftsTab id={id!} />}
      {tab === 2 && <AssetsTab id={id!} />}
      {tab === 3 && <DocumentsTab id={id!} />}
      {tab === 4 && <FinanceTab id={id!} />}
      {tab === 5 && <VacationsTab />}
    </Box>
  );
}
