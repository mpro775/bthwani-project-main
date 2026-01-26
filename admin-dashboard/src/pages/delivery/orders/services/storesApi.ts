import axios from "../../../../utils/axios";

export type StoreLite = { _id: string; name: string; logo?: string };
export const StoresApi = {
  search: (q: string) =>
    axios
      .get<StoreLite[]>("/delivery/stores/search", { params: { q, limit: 20 } })
      .then((r) => r.data),
  getById: (id: string) =>
    axios.get<StoreLite>(`/delivery/stores/${id}`).then((r) => r.data),
};
