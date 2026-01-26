import type { CapabilitiesMap, ModuleCaps } from "./types";


export function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
  if (!/[A-Z]/.test(pw)) return "يجب أن تحتوي على حرف كبير واحد على الأقل";
  if (!/[a-z]/.test(pw)) return "يجب أن تحتوي على حرف صغير واحد على الأقل";
  if (!/[0-9]/.test(pw)) return "يجب أن تحتوي على رقم واحد على الأقل";
  return null;
}



// يحوّل خريطة الصلاحيات إلى مصفوفة "module:action"
export function toFlatCaps(map?: CapabilitiesMap): string[] {
  if (!map) return [];
  const out: string[] = [];
  for (const [module, actions] of Object.entries(map)) {
    for (const action of ["view", "create", "edit", "delete", "approve", "export"] as const) {
      if ((actions as ModuleCaps)[action]) out.push(`${module}:${action}`);
    }
  }
  return out;
}

// يحوّل مصفوفة "module:action" إلى خريطة الصلاحيات
export function fromFlatCaps(list: string[]): CapabilitiesMap {
  const out: CapabilitiesMap = {};
  for (const cap of list) {
    const [module, action] = cap.split(":");
    if (!module || !action) continue;
    if (!out[module]) out[module] = {};
    (out[module] as unknown as Record<string, boolean>)[action] = true;
  }
  return out;
}

// لحساب عدد الصلاحيات الممنوحة
export function countCaps(map?: CapabilitiesMap): number {
  return toFlatCaps(map).length;
}

// فحص وتطبيع الحالة
export function statusFromIsActive(isActive?: boolean): "active" | "disabled" {
  return isActive ? "active" : "disabled";
}
export function isActiveFromStatus(status?: "active" | "disabled"): boolean | undefined {
  if (status === undefined) return undefined;
  return status === "active";
}