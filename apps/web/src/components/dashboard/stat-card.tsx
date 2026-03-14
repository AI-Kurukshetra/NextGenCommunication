import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full bg-cyan-100/80 blur-2xl" />
      <CardDescription className="relative">{label}</CardDescription>
      <CardTitle className="relative mt-2 text-2xl">{value}</CardTitle>
      <p className="relative mt-2 text-xs text-muted-foreground">{detail}</p>
    </Card>
  );
}
