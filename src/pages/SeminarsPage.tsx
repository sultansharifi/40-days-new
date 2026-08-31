import { ReportListView } from "@/components/reports/ReportListView";

export function SeminarsPage() {
  return (
    <ReportListView
      title="سمینارها"
      subtitle="گزارش‌هایی که عنوان یا مرکز آن‌ها شامل «سمینار» است"
      baseFilters={{ search: "سمینار" }}
      exportFileName="سمینارها"
      emptyHint="هیچ گزارش سمیناری یافت نشد"
    />
  );
}
