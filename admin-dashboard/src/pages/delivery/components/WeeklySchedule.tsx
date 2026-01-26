// src/pages/admin/delivery/components/WeeklySchedule.tsx
import { 
  Box, 
  Typography, 
  Switch, 
  TextField, 
  useTheme,
  Paper,
  Divider
} from "@mui/material";
import type { ScheduleSlot } from "../../../type/delivery";
import { motion } from "framer-motion";

interface Props {
  schedule: ScheduleSlot[];
  onChange: (newSched: ScheduleSlot[]) => void;
}

export default function WeeklySchedule({ schedule, onChange }: Props) {
  const theme = useTheme();

  const updateSlot = (idx: number, changes: Partial<ScheduleSlot>) => {
    const s = [...schedule];
    s[idx] = { ...s[idx], ...changes };
    onChange(s);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="h6" fontWeight="bold" mb={3}>
        جدول الدوام الأسبوعي
      </Typography>
      
      {schedule.map((slot, i) => (
        <motion.div
          key={slot.day}
          whileHover={{ backgroundColor: theme.palette.action.hover }}
        >
          <Box 
            display="flex" 
            alignItems="center" 
            gap={2} 
            p={2}
            sx={{
              borderRadius: '8px',
              '&:not(:last-child)': {
                mb: 1,
              }
            }}
          >
            <Typography 
              width={100}
              fontWeight="medium"
              color={slot.open ? 'text.primary' : 'text.secondary'}
            >
              {slot.day}
            </Typography>
            
            <Switch
              checked={slot.open}
              onChange={e => updateSlot(i, { open: e.target.checked })}
              color="primary"
              sx={{
                ml: 'auto'
              }}
            />
            
            <TextField
              type="time"
              size="small"
              disabled={!slot.open}
              value={slot.from}
              onChange={e => updateSlot(i, { from: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{
                width: 120,
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                }
              }}
            />
            
            <Typography>إلى</Typography>
            
            <TextField
              type="time"
              size="small"
              disabled={!slot.open}
              value={slot.to}
              onChange={e => updateSlot(i, { to: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{
                width: 120,
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                }
              }}
            />
          </Box>
          
          {i < schedule.length - 1 && <Divider />}
        </motion.div>
      ))}
    </Paper>
  );
}