"use client";

import React, { useState, useRef, useEffect } from "react";

const COMMON_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];

interface EmailInputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export const EmailInputField: React.FC<EmailInputFieldProps> = ({
  label,
  error,
  value,
  onChange,
  className = "",
  ...props
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    const atIndex = val.lastIndexOf("@");
    if (atIndex !== -1) {
      const prefix = val.slice(0, atIndex + 1);
      const domainPart = val.slice(atIndex + 1);
      const matchedDomains = COMMON_DOMAINS.filter(d => d.startsWith(domainPart));
      
      if (matchedDomains.length > 0 && domainPart.length > 0 && !COMMON_DOMAINS.includes(domainPart)) {
        setSuggestions(matchedDomains.map(d => `${prefix}${d}`));
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className={`flex flex-col gap-2 relative ${className}`} ref={containerRef}>
      <label className="text-sm font-medium text-white/80 ml-1">
        {label}
      </label>
      <input
        type="email"
        className={`glass-input ${error ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50" : ""}`}
        value={value}
        onChange={handleInput}
        {...props}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full top-full mt-1 bg-[#0a1526] border border-white/10 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((suggestion, idx) => (
            <li
              key={idx}
              className="px-4 py-3 cursor-pointer hover:bg-white/5 text-white/90 text-sm transition-colors"
              onClick={() => selectSuggestion(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      {error && <span className="text-xs text-red-400 ml-1">{error}</span>}
    </div>
  );
};
