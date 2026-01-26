import axios from "../../../../utils/axios";

export type UserLite = {
  _id: string;
  fullName?: string;
  name?: string;
  phone?: string;
};
export const UsersApi = {
  search: (q: string) =>
    axios
      .get<UserLite[]>("/users/search", { params: { q, limit: 20 } })
      .then((r) => r.data),
  getById: (id: string) =>
    axios.get<UserLite>(`/users/${id}`).then((r) => r.data),
};
