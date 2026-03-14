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
    <Card>
      <CardDescription>{label}</CardDescription>
      <CardTitle className="mt-2 text-2xl">{value}</CardTitle>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </Card>
  );
}
