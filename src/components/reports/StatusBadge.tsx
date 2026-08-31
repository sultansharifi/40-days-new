import { Badge } from "@/components/ui/badge";
import type { ReportStatus } from "@/types/database";

const config: Record<ReportStatus, { label: string; variant: "success" | "warning" | "destructive" }> = {
  approved: { label: "تایید شده", variant: "success" },
  pending: { label: "در انتظار بررسی", variant: "warning" },
  rejected: { label: "رد شده", variant: "destructive" },
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  const c = config[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
