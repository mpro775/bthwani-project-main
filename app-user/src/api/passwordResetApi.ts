import axios from "../utils/api/axiosInstance";

export async function requestPasswordReset(email: string) {
  const url = `auth/password/forgot`; // تأكد أن /auth/password/forgot موجودة في الباك
  return axios.post(
    url,
    { email },
    { timeout: 10000, headers: { "Content-Type": "application/json" } }
  );
}
export async function verifyResetCode(email: string, code: string) {
  const { data } = await axios.post(
    `auth/password/verify`,
    { email: email.trim().toLowerCase(), code: code.trim() },
    { timeout: 15000 }
  );
  return data; // { ok: true, resetToken }
}

export async function resetPassword(resetToken: string, newPassword: string) {
  const { data } = await axios.post(
    `auth/password/reset`,
    { resetToken, newPassword },
    { timeout: 15000 }
  );
  return data; // { ok: true }
}
