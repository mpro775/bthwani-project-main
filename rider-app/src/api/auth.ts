import axios from "./axios";


export const loginDriver = async ({
  phone,
  password,
}: {
  phone: string;
  password: string;
}) => {
  const res = await axios.post("/driver/login", { phone, password });
  return res.data;
};
