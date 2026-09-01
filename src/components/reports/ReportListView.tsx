import * as React from "react";
import { Link } from "react-router-dom";
import { FileDown, FileSpreadsheet, Search, Loader2, Inbox, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReportDoneCheckbox } from "@/components/reports/ReportDoneCheckbox";
import { useInfiniteReports, type ReportFilters } from "@/hooks/useReports";
import { useDeleteReport } from "@/hooks/useReportActions";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { toJalaliShort, toPersianDigits } from "@/lib/persian-date";
import { REPORT_STATUSES } from "@/types/database";
import { toast } from "sonner";

export function ReportListView({ title = "همه گزارش‌ها" }: { title?: string }) {
  const [filters, setFilters] = React.useState<ReportFilters>({});
  const [exporting, setExporting] = React.useState(false);
  const deleteReport = useDeleteReport();
  const tableId = React.useId().replace(/[:]/g, "");

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteReports(filters);

  const rows = React.useMemo(() => data?.pages.flatMap((p) => p.rows) ?? [], [data]);
  const total = data?.pages[0]?.total ?? 0;

  const sentinelRef = useIntersectionObserver(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, Boolean(hasNextPage));

  const handleExportExcel = async () => {
    if (!rows.length) {
      toast.error("داده‌ای برای خروجی گرفتن وجود ندارد");
      return;
    }
    const { exportReportsToExcel } = await import("@/lib/export");
    exportReportsToExcel(rows, "گزارشات");
    toast.success("فایل اکسل دانلود شد");
  };

  const handleExportPdf = async () => {
    if (!rows.length) {
      toast.error("داده‌ای برای خروجی گرفتن وجود ندارد");
      return;
    }
    setExporting(true);
    try {
      const { exportElementToPdf } = await import("@/lib/export");
      await exportElementToPdf(tableId, "گزارشات");
      toast.success("فایل PDF دانلود شد");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteReport.mutateAsync(id);
    toast.success("گزارش حذف شد");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "در حال بارگذاری..." : `${toPersianDigits(total)} گزارش`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            اکسل
          </Button>
          <Button variant="outline" onClick={handleExportPdf} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="جستجو در گزارش‌ها..."
            className="pr-9"
            value={filters.search ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
          />
        </div>
        <Select
          value={filters.status ?? "all"}
          onValueChange={(v) => setFilters((f) => ({ ...f, status: v === "all" ? undefined : (v as ReportFilters["status"]) }))}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="همه وضعیت‌ها" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه وضعیت‌ها</SelectItem>
            {REPORT_STATUSES.filter((s) => s.value !== "rejected").map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div id={tableId} className="glass-card divide-y divide-white/[0.06] overflow-hidden rounded-2xl">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-5 w-full" />
            </div>
          ))}

        {!isLoading && rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground">
            <Inbox className="h-10 w-10 opacity-50" />
            <div>هیچ گزارشی یافت نشد</div>
          </div>
        )}

        {rows.map((report) => (
          <div key={report.id} className="flex items-center gap-3 p-4">
            <ReportDoneCheckbox reportId={report.id} status={report.status} />
            <Link to={`/reports/${report.id}`} className="min-w-0 flex-1 hover:text-primary">
              <div className="truncate text-sm font-medium">{report.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{toJalaliShort(report.report_date)}</div>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف گزارش</AlertDialogTitle>
                  <AlertDialogDescription>آیا از حذف این گزارش مطمئن هستید؟</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>انصراف</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(report.id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    حذف قطعی
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}

        {hasNextPage && (
          <div ref={sentinelRef} className="flex items-center justify-center py-6">
            {isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
        )}
      </div>
    </div>
  );
}
