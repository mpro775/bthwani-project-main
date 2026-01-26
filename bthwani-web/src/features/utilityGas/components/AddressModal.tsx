// src/features/utilityGas/components/AddressModal.tsx
import React from "react";
import { alpha, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grow, Typography } from "@mui/material";
import { CheckCircle, Place } from "@mui/icons-material";
import type { Address } from "../types";

export const AddressModal: React.FC<{ open: boolean; onClose: ()=>void; addresses: Address[]; selectedId: string | null; onSelect: (id: string)=>void; }>
= ({ open, onClose, addresses, selectedId, onSelect }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3 } }}>
    <DialogTitle sx={{ color:'primary.main', fontWeight:'bold', textAlign:'center', py:3, background:(t)=>alpha(t.palette.primary.main,0.05) }}>
      اختر عنوان التسليم
    </DialogTitle>
    <DialogContent sx={{ p:0 }}>
      <Box sx={{ maxHeight: 400, overflow: 'auto', p:2 }}>
        {addresses.map((address, index) => (
          <Grow in key={address._id} timeout={300 + index * 100}>
            <Button variant={selectedId === address._id ? 'contained' : 'outlined'} onClick={()=>onSelect(address._id)} startIcon={
              <Avatar sx={{ bgcolor: selectedId === address._id ? 'white' : 'primary.main', width: 24, height: 24 }}>
                <Place sx={{ fontSize: 14, color: selectedId === address._id ? 'primary.main' : 'white' }} />
              </Avatar>
            } sx={{ width:'100%', justifyContent:'flex-start', py:2, px:3, mb:1, borderRadius:2 }}>
              <Box sx={{ textAlign:'left' }}>
                <Typography variant="body1" sx={{ fontWeight:'bold', mb:0.5 }}>{address.label}</Typography>
                <Typography variant="body2" color={selectedId === address._id ? 'rgba(255,255,255,0.8)' : 'text.secondary'}>
                  {address.city}{address.street ? ` • ${address.street}` : ''}
                </Typography>
              </Box>
            </Button>
          </Grow>
        ))}
      </Box>
    </DialogContent>
    <DialogActions sx={{ px:3, py:2, background:(t)=>alpha(t.palette.primary.main,0.05) }}>
      <Button onClick={onClose} variant="contained" startIcon={<CheckCircle />} sx={{ borderRadius:2, py:1.5, px:3 }}>
        تم الاختيار
      </Button>
    </DialogActions>
  </Dialog>
);