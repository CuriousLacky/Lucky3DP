"use client";

import { type UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
  label: string;
  error?: string;
  maxLength?: number;
  currentLength?: number;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  maxLength,
  currentLength,
  required,
  children,
}: FormFieldProps) {
  const remaining = maxLength && currentLength !== undefined
    ? maxLength - currentLength
    : undefined;

  return (
    <div>
      <label className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs text-gray-400">
          {label}
          {required && <span className="text-gold ml-0.5">*</span>}
        </span>
        {remaining !== undefined && (
          <span
            className={`text-[10px] font-mono ${
              remaining <= 5 ? "text-amber-400" : "text-gray-600"
            }`}
          >
            {remaining} left
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Styled input class ──────────────────────────────── */

export const inputClassName = (hasError: boolean) =>
  `w-full bg-base-lighter border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder-gray-600 ${
    hasError
      ? "border-red-500/40 focus:border-red-500/60"
      : "border-white/10 focus:border-gold/40"
  }`;
