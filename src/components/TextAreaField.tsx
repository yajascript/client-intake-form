import React from "react";
import { FieldWrapper, FieldWrapperProps } from "./FieldWrapper";

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  maxLength?: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
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
      <textarea
        className={`glass-input min-h-[64px] resize-y ${error ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50" : ""}`}
        maxLength={maxLength}
        rows={2}
        {...props}
      />
    </FieldWrapper>
  );
};
