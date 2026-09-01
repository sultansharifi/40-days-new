import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useUpdateReportStatus } from "@/hooks/useReportActions";
import type { ReportStatus } from "@/types/database";
import { cn } from "@/lib/utils";

/**
 * The "done" mark on each report row. Unchecked (pending) until someone
 * ticks it — a report doesn't count as finished on the dashboard until
 * this is checked.
 */
export function ReportDoneCheckbox({ reportId, status }: { reportId: string; status: ReportStatus }) {
  const updateStatus = useUpdateReportStatus();
  const checked = status === "approved";

  const toggle = (next: boolean) => {
    updateStatus.mutate({ id: reportId, status: next ? "approved" : "pending" });
  };

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {updateStatus.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Checkbox checked={checked} onCheckedChange={(v) => toggle(v === true)} />
      )}
      <span className={cn("text-xs", checked ? "text-success" : "text-warning")}>
        {checked ? "انجام شده" : "در انتظار"}
      </span>
    </div>
  );
}
