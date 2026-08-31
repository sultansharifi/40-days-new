import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian-date";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "primary" | "warning" | "success" | "destructive";
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/15 text-destructive",
};

export function StatCard({ label, value, icon: Icon, tone = "primary" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-bold tabular-nums">{toPersianDigits(value)}</div>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", toneClasses[tone])}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
