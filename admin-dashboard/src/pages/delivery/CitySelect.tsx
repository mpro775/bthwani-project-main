import { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { UtilityApi } from "./orders/services/utilityApi";

export default function CitySelect({
  value,
  onChange,
  label = "المدينة",
}: {
  value: string | null;
  onChange: (city: string | null) => void;
  label?: string;
}) {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await UtilityApi.getCities();
        setCities(list || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // حافظ تزامن النص الظاهر مع القيمة المختارة
  useEffect(() => {
    setInput(value ?? "");
  }, [value]);

  return (
    <Autocomplete
      freeSolo
      options={cities}
      // ✅ تحكّم بالنص الظاهر
      inputValue={input}
      onInputChange={(_, v) => setInput(v ?? "")}
      // ✅ القيمة المختارة (string أو null)
      value={value ?? ""}
      onChange={(_, v) => onChange((v as string) || null)}
      // ❌ لا تمسح النص عند فقدان التركيز
      clearOnBlur={false}
      selectOnFocus
      handleHomeEndKeys
      noOptionsText="لا توجد نتائج — اكتب الاسم ثم اضغط Enter"
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size="small"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // لا يرسل فورم
              const v = input.trim();
              if (v) onChange(v); // ثبّت المدينة المكتوبة
            }
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={16} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
