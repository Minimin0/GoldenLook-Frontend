"use client";

import { cn } from "@/lib/cn";

export function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  suffix,
  inputMode,
  hint,
  disabled,
  max,
  min,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  suffix?: string;
  inputMode?: "tel" | "numeric" | "text" | "email";
  hint?: string;
  disabled?: boolean;
  max?: number;
  min?: number;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-bold text-navy-700">{label}</span>
      <span
        className={cn(
          "mt-1.5 flex h-12 items-center rounded-xl border border-line px-3 focus-within:border-navy-400",
          disabled ? "bg-paper" : "bg-white",
        )}
      >
        <input
          className="h-full w-full bg-transparent text-[15px] text-ink outline-none disabled:text-muted"
          disabled={disabled}
          inputMode={inputMode}
          max={max}
          maxLength={maxLength}
          min={min}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
        {suffix && <span className="pl-1 text-[14px] font-semibold text-muted">{suffix}</span>}
      </span>
      {hint && <span className="mt-1 block text-[12px] leading-snug text-muted">{hint}</span>}
    </label>
  );
}

export function ChoiceRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string | null | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-[13px] font-bold text-navy-700">{label}</p>
      <div className="mt-1.5 flex gap-1.5">
        {options.map((option) => (
          <button
            aria-pressed={value === option.value}
            className={cn(
              "h-11 flex-1 rounded-xl text-[14px] font-bold transition-colors",
              value === option.value
                ? "bg-navy-800 text-white"
                : "bg-white text-muted hover:bg-navy-100",
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p
      className="rounded-xl bg-signal-50 px-3 py-2.5 text-[13px] font-semibold text-signal-600"
      role="alert"
    >
      {children}
    </p>
  );
}
