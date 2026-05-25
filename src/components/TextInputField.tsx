import React from "react";
import { FieldWrapper } from "./FieldWrapper";

interface TextInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  maxLength?: number;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  error,
  className = "",
  maxLength,
  ...props
}) => {
  const currentLength = (props.value as string)?.length || 0;
  
  return (
    <FieldWrapper
      label={label}
      error={error}
      required={props.required}
      maxLength={maxLength}
      currentLength={currentLength}
      className={className}
    >
      <input
        className={`glass-input ${error ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50" : ""}`}
        maxLength={maxLength}
        {...props}
      />
    </FieldWrapper>
  );
};
