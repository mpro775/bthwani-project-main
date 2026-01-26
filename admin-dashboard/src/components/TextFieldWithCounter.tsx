// src/components/TextFieldWithCounter.tsx
import React from "react";
import { TextField, type  TextFieldProps } from "@mui/material";
import { CharacterCounter } from "./CharacterCounter";

interface TextFieldWithCounterProps extends Omit<TextFieldProps, "error" | "helperText"> {
  maxLength?: number;
  showCounter?: boolean;
  showWarning?: boolean;
  warningThreshold?: number;
  error?: boolean;
  helperText?: React.ReactNode;
}

export const TextFieldWithCounter: React.FC<TextFieldWithCounterProps> = ({
  maxLength,
  showCounter = true,
  showWarning = true,
  warningThreshold = 80,
  value,
  error,
  helperText,
  inputProps,
  ...textFieldProps
}) => {
  const currentLength = String(value || "").length;
  const shouldShowCounter = showCounter && maxLength && maxLength > 0;

  return (
    <div>
      <TextField
        {...textFieldProps}
        value={value}
        error={error}
        helperText={helperText}
        inputProps={{
          ...inputProps,
          maxLength,
        }}
        fullWidth
      />
      {shouldShowCounter && (
        <CharacterCounter
          current={currentLength}
          max={maxLength}
          showWarning={showWarning}
          warningThreshold={warningThreshold}
        />
      )}
    </div>
  );
};
