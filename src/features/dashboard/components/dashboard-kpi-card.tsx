import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardKpiCardProps {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "success" | "warning" | "danger";
}

const toneClasses = {
  default: "border-border/70",
  success: "border-emerald-500/25",
  warning: "border-amber-500/25",
  danger: "border-red-500/30",
};

export function DashboardKpiCard({
  label,
  value,
  detail,
  tone = "default",
}: DashboardKpiCardProps) {
  return (
    <Card className={cn("rounded-2xl bg-card/80 py-3", toneClasses[tone])}>
      <CardContent className="space-y-3">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p className="line-clamp-2 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
