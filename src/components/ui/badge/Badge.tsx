import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "default";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
  warning: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
  danger: "bg-red-400/10 text-red-300 ring-red-400/20",
  info: "bg-cyan-400/10 text-cyan-300 ring-cyan-400/20",
  default: "bg-slate-700/40 text-slate-300 ring-slate-600",
};

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}