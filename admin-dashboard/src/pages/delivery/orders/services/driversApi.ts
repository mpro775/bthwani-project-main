import axios from "../../../../utils/axios";

export type DriverLite = { _id: string; fullName: string; phone?: string };
export const DriversApi = {
  search: (q: string) =>
    axios
      .get<DriverLite[]>("admin/drivers/search", { params: { q, limit: 20 } })
      .then((r) => r.data),
  getById: (id: string) =>
    axios.get<DriverLite>(`admin/drivers/${id}`).then((r) => r.data),
};
