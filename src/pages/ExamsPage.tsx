import { ReportListView } from "@/components/reports/ReportListView";

export function ExamsPage() {
  return (
    <ReportListView
      title="امتحان‌ها"
      subtitle="گزارش‌هایی که عنوان یا مرکز آن‌ها شامل «امتحان» است"
      baseFilters={{ search: "امتحان" }}
      exportFileName="امتحان‌ها"
      emptyHint="هیچ گزارش امتحانی یافت نشد"
    />
  );
}
