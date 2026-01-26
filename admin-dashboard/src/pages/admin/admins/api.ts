// admin-dashboard/src/pages/admin/api.ts
import axios from "../../../utils/axios";
import type {
  AdminStatus,
  AdminUser,
  ModuleDefinition,
  CreateAdminPayload,
  AdminsListResponse,
  UsersListParams,
  AdminListItem,
  CapabilitiesMap,
  AdminRole,
} from "./types";
import {
  fromFlatCaps,
  countCaps,
  statusFromIsActive,
  isActiveFromStatus,
} from "./utils";

// مساعد للتحقق من صحة الدور
function validateAdminRole(role: string): AdminRole {
  const validRoles: AdminRole[] = ["superadmin", "admin", "manager", "support"];
  return validRoles.includes(role as AdminRole) ? (role as AdminRole) : "admin";
}

// حارس نوع بسيط
function unwrapAdmin(input: unknown): AdminUser {
  // تحقق من أن input موجود
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input: expected object');
  }

  // الباك قد يرجع {data: AdminUser} أو AdminUser مباشرة
  const raw = 'data' in input ? input.data : input;

  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid data structure');
  }

  // استخراج القدرات بأمان
  const caps: CapabilitiesMap | undefined =
    (raw as { capabilities?: CapabilitiesMap }).capabilities ??
    (raw as { permissions?: CapabilitiesMap }).permissions ??
    undefined;

  // استخراج الحقول بأمان مع type assertions محسوبة
  const admin: AdminUser = {
    _id: String((raw as { _id?: unknown })._id ?? ""),
    name: String(
      (raw as { name?: unknown }).name ??
      (raw as { username?: unknown }).username ??
      ""
    ),
    email: String(
      (raw as { email?: unknown }).email ??
      (raw as { username?: unknown }).username ??
      ""
    ),
    role: (() => {
      const roles = (raw as { roles?: unknown[] }).roles;
      if (Array.isArray(roles) && roles.length > 0) {
        return validateAdminRole(String(roles[0]));
      }
      return validateAdminRole(String((raw as { role?: unknown }).role || "admin"));
    })(),
    status: (raw as { status?: AdminStatus }).status ?? statusFromIsActive(
      Boolean((raw as { isActive?: unknown }).isActive)
    ),
    capabilities: caps,
  };
  return admin;
}

function toListItem(a: AdminUser): AdminListItem {
  return {
    _id: a._id,
    name: a.name,
    email: a.email,
    role: a.role,
    status: a.status,
    capsCount: countCaps(a.capabilities),
  };
}

/** الوحدات */
export async function apiGetModules(): Promise<{ data: ModuleDefinition[] }> {
  const { data } = await axios.get("/admin/modules");
  return data as { data: ModuleDefinition[] };
}

/** القائمة (استعمل params لتفادي خطأ unused) */
export async function apiListAdmins(
  params?: UsersListParams
): Promise<AdminsListResponse> {
  const { data } = await axios.get("/admin/list", { params });
  const arr: AdminListItem[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];
  const items: AdminListItem[] = arr.map((x) => toListItem(unwrapAdmin(x)));
  return { data: items }; // لا meta إذا النوع لا يتوقعه
}

/** إنشاء */
export async function apiCreateAdmin(
  payload: CreateAdminPayload
): Promise<{ _id: string }> {
  const permissions = fromFlatCaps(payload.capabilities);
  const body = {
    username: payload.email || payload.name,
    password: payload.password,
    roles: [payload.role],
    permissions,
  };
  const { data } = await axios.post("/admin/create", body);
  // الباك قد يرد { message } فقط — جرّب استخراج _id إن وُجد
  const createdId = (data?.data?._id as string) ?? (data?._id as string) ?? ""; // قد يكون فارغ مؤقتًا
  return { _id: createdId };
}

/** تفاصيل */
export async function apiGetAdmin(id: string): Promise<{ data: AdminUser }> {
  const { data } = await axios.get(`/admin/${id}`);
  return { data: unwrapAdmin(data) };
}

/** تعديل */
export async function apiPatchAdmin(
  id: string,
  payload: Partial<Omit<CreateAdminPayload, "password">> & {
    status?: AdminStatus;
  }
): Promise<{ data: AdminUser }> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.username = payload.name;
  if (payload.email !== undefined) body.username = payload.email; // username يمثل email عندك
  if (payload.role !== undefined) body.roles = [payload.role];
  if (payload.status !== undefined)
    body.isActive = isActiveFromStatus(payload.status);
  if (payload.capabilities !== undefined)
    body.permissions = fromFlatCaps(payload.capabilities);

  const { data } = await axios.put(`/admin/${id}`, body);
  return { data: unwrapAdmin(data) };
}

/** حالة */
export async function apiPatchAdminStatus(
  id: string,
  status: AdminStatus
): Promise<{ ok: true; status: AdminStatus }> {
  const isActive = isActiveFromStatus(status);
  const { data } = await axios.patch(`/admin/${id}/status`, { isActive });
  const nextStatus =
    (data?.status as AdminStatus) ??
    statusFromIsActive(data?.isActive ?? isActive);
  return { ok: true, status: nextStatus };
}
