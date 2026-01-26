// src/pages/admin/delivery/components/SubCategoryTable.tsx
import { 
  Box, 
  Paper, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  IconButton,
  useTheme
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import type { DeliveryProductSubCategory } from "../../../type/delivery";

type Props = {
  items: DeliveryProductSubCategory[];
  onEdit: (s: DeliveryProductSubCategory) => void;
  onDelete: (id: string) => void;
};

export default function SubCategoryTable({ items, onEdit, onDelete }: Props) {
  const theme = useTheme();

  return (
    <Paper 
      sx={{ 
        mb: 4,
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>اسم الفئة</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>إجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((sub) => (
            <TableRow key={sub._id} hover>
              <TableCell>{sub.name}</TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton 
                    onClick={() => onEdit(sub)}
                    sx={{ color: theme.palette.primary.main }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={() => onDelete(sub._id)}
                    sx={{ color: theme.palette.error.main }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}