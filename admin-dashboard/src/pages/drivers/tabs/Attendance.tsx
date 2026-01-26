// src/pages/ops/drivers/tabs/Attendance.tsx
import { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import {  Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import dayjs from "dayjs";

type DailyAttendance = {
  _id: string;
  day: string;
  totalOnlineMins: number;
  ordersDelivered: number;
  distanceKm: number;
};

export default function AttendanceTab({ id }:{ id:string }){
  const [daily,setDaily] = useState<DailyAttendance[]>([]);
  useEffect(()=>{
    axios.get(`/drivers/${id}/attendance/daily`, { params:{ from: dayjs().subtract(30,"day").format("YYYY-MM-DD") }})
      .then(r=>setDaily(r.data.items||[])).catch(()=>{});
  },[id]);
  return (
    <Paper style={{padding:12}}>
      <Typography variant="subtitle1">آخر 30 يومًا</Typography>
      <Table size="small" style={{marginTop:8}}>
        <TableHead><TableRow>
          <TableCell>Day</TableCell><TableCell>Online (min)</TableCell><TableCell>Orders</TableCell><TableCell>Distance (km)</TableCell>
        </TableRow></TableHead>
        <TableBody>
            {daily.map((d:DailyAttendance)=>(
            <TableRow key={d._id || d.day}>
              <TableCell>{d.day}</TableCell>
              <TableCell>{Math.round(d.totalOnlineMins)}</TableCell>
              <TableCell>{d.ordersDelivered||0}</TableCell>
              <TableCell>{(d.distanceKm||0).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
