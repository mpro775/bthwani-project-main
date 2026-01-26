import { useMemo } from "react";
import type { ModuleDefinition } from "./types";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

/**
 * RoleMatrix - مكون مصفوفة الصلاحيات
 * يعرض الوحدات والصلاحيات المتاحة في شكل مصفوفة
 */
export default function RoleMatrix({
  modules,
  value,
  onChange,
}: {
  modules: ModuleDefinition[];
  value: string[];
  onChange: (caps: string[]) => void;
}) {
  // تحويل القائمة إلى Set للبحث السريع
  const current = useMemo(() => new Set<string>(value), [value]);

  // دالة تبديل الصلاحية
  const toggle = (cap: string): void => {
    const next = new Set<string>(current);
    if (next.has(cap)) {
      next.delete(cap);
    } else {
      next.add(cap);
    }
    onChange(Array.from(next));
  };

  // دالة تحديد/إلغاء جميع صلاحيات الوحدة
  const setModuleAll = (
    module: string,
    actions: string[],
    enable: boolean
  ): void => {
    const next = new Set<string>(current);
    actions.forEach((action) => {
      const cap = `${module}:${action}`;
      if (enable) {
        next.add(cap);
      } else {
        next.delete(cap);
      }
    });
    onChange(Array.from(next));
  };

  return (
    <Stack spacing={1}>
      {modules.map((module) => {
        // التحقق من حالة التحديد للوحدة بأكملها
        const allSelected = module.actions.every((action) =>
          current.has(`${module.name}:${action}`)
        );
        const someSelected =
          !allSelected &&
          module.actions.some((action) => current.has(`${module.name}:${action}`));

        return (
          <Paper key={module.name} variant="outlined" sx={{ p: 1.5 }}>
            <Stack spacing={1}>
              {/* عنوان الوحدة وأزرار التحديد السريع */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {module.label ?? module.name}
                  </Typography>
                  {module.description && (
                    <Typography variant="caption" color="text.secondary">
                      {module.description}
                    </Typography>
                  )}
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    onClick={() => setModuleAll(module.name, module.actions, true)}
                  >
                    تحديد الكل
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    color="secondary"
                    onClick={() => setModuleAll(module.name, module.actions, false)}
                  >
                    إلغاء الكل
                  </Button>
                </Stack>
              </Stack>

              {/* قائمة الصلاحيات */}
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {module.actions.map((action) => {
                  const cap = `${module.name}:${action}`;
                  return (
                    <FormControlLabel
                      key={cap}
                      control={
                        <Checkbox
                          checked={current.has(cap)}
                          indeterminate={someSelected && !current.has(cap)}
                          onChange={() => toggle(cap)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {action}
                        </Typography>
                      }
                    />
                  );
                })}
              </Stack>
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
