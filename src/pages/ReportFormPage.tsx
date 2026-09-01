import { useParams } from "react-router-dom";
import { QuickReportForm } from "@/components/reports/QuickReportForm";
import { useReportDetail } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";

export function ReportFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { data: report, isLoading } = useReportDetail(id);

  if (isEditing && isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isEditing && !report) {
    return <div className="text-center text-muted-foreground">گزارش یافت نشد.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{isEditing ? "ویرایش گزارش" : "گزارش جدید"}</h1>
      </div>
      <QuickReportForm editingReportId={id} initialText={report?.title} />
    </div>
  );
}
