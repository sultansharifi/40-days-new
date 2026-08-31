import { useParams } from "react-router-dom";
import { ReportFormWizard } from "@/components/reports/ReportFormWizard";
import { useReportDetail } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReportFormValues } from "@/lib/reportFormSchema";

export function ReportFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { data: report, isLoading } = useReportDetail(id);

  if (isEditing && isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isEditing && !report) {
    return <div className="text-center text-muted-foreground">گزارش یافت نشد.</div>;
  }

  const initialValues: Partial<ReportFormValues> | undefined = report
    ? {
        reporterName: report.reporter_name,
        title: report.title,
        province: report.province,
        district: report.district,
        centerName: report.center_name,
        reportDate: report.report_date,
        reportType: report.report_type,
        objective: report.objective ?? "",
        activityDescription: report.activity_description ?? "",
        location: report.location ?? "",
        startDate: report.start_date ?? "",
        endDate: report.end_date ?? "",
        maleUnder18: report.participants?.male_under18 ?? 0,
        femaleUnder18: report.participants?.female_under18 ?? 0,
        maleOver18: report.participants?.male_over18 ?? 0,
        femaleOver18: report.participants?.female_over18 ?? 0,
        achievement: report.results?.achievement ?? "",
        challenges: report.results?.challenges ?? "",
        recommendations: report.results?.recommendations ?? "",
      }
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isEditing ? "ویرایش گزارش" : "ثبت گزارش جدید"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEditing ? "اطلاعات گزارش را به‌روزرسانی کنید" : "فرم را مرحله به مرحله تکمیل کنید"}
        </p>
      </div>
      <ReportFormWizard
        editingReportId={id}
        initialValues={initialValues}
        existingAttachments={report?.report_attachments}
      />
    </div>
  );
}
