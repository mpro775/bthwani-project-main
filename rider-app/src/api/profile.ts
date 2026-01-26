// src/api/profile.ts
import axios from "./axios";

export const getProfile = async () => {
  const res = await axios.get("/drivers/profile");
  return res.data;
};

export const updateProfile = async (data: any) => {
  const res = await axios.patch("/drivers/profile", data);
  return res.data;
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string
) => {
  await axios.post("/drivers/change-password", { oldPassword, newPassword });
};
