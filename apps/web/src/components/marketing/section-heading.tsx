import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-3", align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0f766e]">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">{title}</h2>
      {description ? <p className="text-base leading-7 text-slate-600 md:text-lg">{description}</p> : null}
    </div>
  );
}
