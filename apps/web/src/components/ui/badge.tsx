import { cn } from "@/lib/utils";

const statusClasses: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  neutral: "bg-slate-100 text-slate-700"
};

export function Badge({
  tone = "neutral",
  className,
  children
}: {
  tone?: "success" | "warning" | "danger" | "neutral";
  className?: string;
  children: React.ReactNode;
}) {
  return <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-medium", statusClasses[tone], className)}>{children}</span>;
}
