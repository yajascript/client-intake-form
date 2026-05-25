import React from "react";

export interface FieldWrapperProps {
  label?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  currentLength?: number;
  className?: string;
  children: React.ReactNode;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  label,
  error,
  required,
  maxLength,
  currentLength = 0,
  className = "",
  children
}) => {
  const isAtLimit = maxLength !== undefined && currentLength >= maxLength;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-end ml-1">
          <label className="text-sm font-medium text-white/80">
            {label} {required && <span className="text-yellow-400">*</span>}
          </label>
          {maxLength !== undefined && currentLength > 0 && (
            <span className={`text-xs ${isAtLimit ? 'text-rose-400 font-bold' : 'text-white/40'}`}>
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
      )}
      {children}
      {error && <span className="text-xs text-rose-400 ml-1">{error}</span>}
    </div>
  );
};
