import axios from "../utils/axios";

export const getAccounts = () => axios.get('/accounts/chart');
export const getAccountTree = () => axios.get('/accounts/chart/tree');
export const createAccount = (data: unknown) => axios.post('/accounts/chart', data);
export const updateAccount = (id: string, data: unknown) => axios.patch(`/accounts/chart/${id}`, data);
export const deleteAccount = (id: string) => axios.delete(`/accounts/chart/${id}`);
