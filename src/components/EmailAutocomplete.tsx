"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

import { FieldWrapper } from "./FieldWrapper";

const EMAIL_DOMAINS = ["gmail.com", "outlook.com", "icloud.com", "yahoo.com", "hotmail.com"];

export interface EmailAutocompleteProps extends Omit<React.ComponentProps<"input">, 'value' | 'onChange'> {
  label?: string;
  error?: string;
  value?: string;
  onChange: (...event: any[]) => void;
  required?: boolean;
}

const EmailAutocomplete = React.forwardRef<HTMLInputElement, EmailAutocompleteProps>(
  ({ label, error, value, onChange, required, className, ...props }, ref) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [show, setShow] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
      if (typeof value === 'string' && value.includes("@")) {
        const [local, domain] = value.split("@");
        if (local && domain !== undefined && !domain.includes(".")) {
          const filteredDomains = EMAIL_DOMAINS.filter((d) => d.startsWith(domain.toLowerCase()));
          const emailSuggestions = filteredDomains.map((d) => `${local.toLowerCase()}@${d}`);
          setSuggestions(emailSuggestions);
          setShow(emailSuggestions.length > 0);
          setActiveIndex(0);
        } else {
          setShow(false);
        }
      } else {
        setShow(false);
      }
    }, [value]);

    const pickSuggestion = (suggestion: string) => {
      const newEvent = {
        target: { value: suggestion },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(newEvent);
      setShow(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!show || suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pickSuggestion(suggestions[activeIndex]);
      } else if (e.key === "Escape") {
        setShow(false);
      }
    };

    return (
      <FieldWrapper label={label} error={error} required={required} className={className}>
        <div className="relative w-full">
          <input
            type="email"
            value={value || ""}
            onChange={onChange}
            onBlur={() => setTimeout(() => setShow(false), 150)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            ref={ref}
            className={cn(
              "glass-input",
              error ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50" : ""
            )}
            {...props}
          />
          {show && (
            <div className="absolute z-[100] left-0 w-full bg-[#121c33] border border-white/10 mt-1 shadow-2xl max-h-72 overflow-y-auto rounded-md animate-in fade-in slide-in-from-top-1 duration-200">
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => pickSuggestion(s)}
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm transition-all border-b border-white/5 last:border-0",
                    i === activeIndex
                      ? "bg-[#ADC8FF] text-[#0B1326] font-medium"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </FieldWrapper>
    );
  }
);

EmailAutocomplete.displayName = "EmailAutocomplete";

export { EmailAutocomplete };
