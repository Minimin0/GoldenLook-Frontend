import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "signal" | "outline" | "ghost";
type Size = "md" | "lg";

/** 레드는 긴급·전화 전용이다. 일반 버튼에 섞으면 긴급 신호가 묻힌다. */
const VARIANT: Record<Variant, string> = {
  primary: "bg-navy-800 text-white hover:bg-navy-700 active:bg-navy-900",
  signal: "bg-signal-500 text-white hover:bg-signal-600 active:bg-signal-700",
  outline: "bg-white text-navy-800 border border-line hover:bg-navy-50",
  ghost: "bg-navy-50 text-navy-700 hover:bg-navy-100",
};

const SIZE: Record<Size, string> = {
  md: "h-11 px-4 text-[15px] rounded-xl",
  lg: "h-14 px-5 text-base rounded-2xl",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none select-none";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANT[variant], SIZE[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANT[variant], SIZE[size], fullWidth && "w-full", className)}
    >
      {children}
    </Link>
  );
}
