// src/components/AsyncSearchSelect.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";

type IdLike = { _id: string } & Record<string, unknown>;

export default function AsyncSearchSelect<T extends IdLike>({
  label,
  value,                 // الكائن المختار حالياً أو null
  onChange,
  fetchOptions,          // (q: string) => Promise<T[]>
  fetchById,             // اختياري: (id: string) => Promise<T | null> لتهيئة القيمة من id
  getOptionLabel,        // (opt: T) => string
  placeholder,
  disabled,
}: {
  label: string;
  value: T | null;
  onChange: (v: T | null) => void;
  fetchOptions: (q: string) => Promise<T[]>;
  fetchById?: (id: string) => Promise<T | null>;
  getOptionLabel: (opt: T) => string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  // جلب أولي بالقيمة المختارة من id (لو جيت للصفحة وفي فلتر موجود)
  useEffect(() => {
    (async () => {
      if (value && fetchById && (value as IdLike)._id) {
        const full = await fetchById((value as IdLike)._id);
        if (full) onChange(full);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doFetch = useMemo(() => async (q: string) => {
    setLoading(true);
    try {
      const data = await fetchOptions(q);
      setOptions(data);
    } finally {
      setLoading(false);
    }
  }, [fetchOptions]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => doFetch(inputValue.trim()), 300);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [inputValue, open, doFetch]);

  return (
    <Autocomplete
      size="small"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={value}
      onChange={(_, v) => onChange(v)}
      options={options}
      getOptionLabel={(o) => (o ? getOptionLabel(o) : "")}
      isOptionEqualToValue={(o, v) => o._id === v._id}
      loading={loading}
      disabled={disabled}
      noOptionsText="لا توجد نتائج"
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          onChange={(e) => setInputValue(e.target.value)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
