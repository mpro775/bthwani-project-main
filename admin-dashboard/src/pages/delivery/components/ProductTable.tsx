// src/pages/admin/delivery/components/ProductTable.tsx
import { 
  Box, 
  Paper, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  IconButton,
  Avatar,
  useTheme
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import type {
  DeliveryProduct,
  DeliveryProductSubCategory
} from "../../../type/delivery";

type Props = {
  products: DeliveryProduct[];
  subCategories: DeliveryProductSubCategory[];
  onEdit: (p: DeliveryProduct) => void;
  onDelete: (id: string) => void;
  onDetail: (id: string) => void;
};

export default function ProductTable({
  products, subCategories, onEdit, onDelete, onDetail
}: Props) {
  const theme = useTheme();
  
  const findName = (id: string) =>
    subCategories.find((s) => s._id === id)?.name || "—";

  return (
    <Paper 
      sx={{ 
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
          <TableRow>
            {["الصورة","الاسم","السعر","الفئة","الوصف","متاح","إجراءات"].map((h) => (
              <TableCell 
                key={h} 
                align={h === "إجراءات" ? "right" : "center"}
                sx={{ fontWeight: 'bold' }}
              >
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((prod) => (
            <TableRow key={prod._id} hover>
              <TableCell align="center">
                {prod.image && <Avatar src={prod.image} sx={{ margin: '0 auto' }} />}
              </TableCell>
              <TableCell>{prod.name}</TableCell>
              <TableCell align="center">{prod.price} ﷼</TableCell>
              <TableCell align="center">{findName(prod.subCategoryId ||"")}</TableCell>
              <TableCell>{prod.description || "—"}</TableCell>
              <TableCell align="center">
                <Box 
                  sx={{ 
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: prod.isAvailable ? theme.palette.success.light : theme.palette.error.light,
                    color: prod.isAvailable ? theme.palette.success.dark : theme.palette.error.dark
                  }}
                >
                  {prod.isAvailable ? "✓" : "✕"}
                </Box>
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton onClick={() => onDetail(prod._id)}>
                    <Visibility sx={{ color: theme.palette.info.main }} />
                  </IconButton>
                  <IconButton onClick={() => onEdit(prod)}>
                    <Edit sx={{ color: theme.palette.warning.main }} />
                  </IconButton>
                  <IconButton onClick={() => onDelete(prod._id)}>
                    <Delete sx={{ color: theme.palette.error.main }} />
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