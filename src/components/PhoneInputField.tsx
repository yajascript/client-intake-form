"use client";

import React, { useState, useEffect } from "react";

import { FieldWrapper } from "./FieldWrapper";

interface PhoneInputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  label,
  error,
  value,
  onChange,
  className = "",
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    setDisplayValue(formatPhoneNumber(value));
  }, [value]);

  const formatPhoneNumber = (val: string) => {
    if (!val) return val;
    const phoneNumber = val.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    }
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setDisplayValue(formatted);
    onChange(formatted);
  };

  return (
    <FieldWrapper label={label} error={error} required={props.required} className={className}>
      <input
        className={`glass-input ${error ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50" : ""}`}
        value={displayValue}
        onChange={handleInput}
        maxLength={12} // 000-000-0000
        {...props}
      />
    </FieldWrapper>
  );
};
