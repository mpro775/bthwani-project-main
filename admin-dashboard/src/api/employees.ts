import axiosInstance from "../utils/axios";

export interface Employee {
  _id?: string;
  fullName: string;
  email: string;
  hireDate: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeFormData {
  fullName: string;
  email: string;
  hireDate: string;
  role: string;
  status: 'active' | 'inactive';
}

// Get all employees
export async function getEmployees(): Promise<Employee[]> {
  const { data } = await axiosInstance.get<Employee[]>("/employees", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Create new employee
export async function createEmployee(employee: EmployeeFormData): Promise<Employee> {
  const { data } = await axiosInstance.post<Employee>("/employees", employee);
  return data;
}

// Update employee
export async function updateEmployee(id: string, employee: Partial<EmployeeFormData>): Promise<Employee> {
  const { data } = await axiosInstance.patch<Employee>(`/employees/${id}`, employee);
  return data;
}

// Delete employee
export async function deleteEmployee(id: string): Promise<void> {
  await axiosInstance.delete(`/employees/${id}`);
}

// Get employee by ID
export async function getEmployee(id: string): Promise<Employee> {
  const { data } = await axiosInstance.get<Employee>(`/employees/${id}`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}
