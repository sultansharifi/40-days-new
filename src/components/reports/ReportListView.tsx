import * as React from "react";
import { Link } from "react-router-dom";
import { FileDown, FileSpreadsheet, Eye, Loader2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportFiltersBar } from "@/components/reports/ReportFilters";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { useInfiniteReports, type ReportFilters } from "@/hooks/useReports";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { toJalaliShort, toPersianDigits } from "@/lib/persian-date";
import { toast } from "sonner";

interface ReportListViewProps {
  title: string;
  subtitle?: string;
  baseFilters?: Partial<ReportFilters>;
  exportFileName?: string;
  emptyHint?: string;
  hideStatusFilter?: boolean;
  hideTypeFilter?: boolean;
}

export function ReportListView({
  title,
  subtitle,
  baseFilters,
  exportFileName = "گزارشات",
  emptyHint,
  hideStatusFilter,
  hideTypeFilter,
}: ReportListViewProps) {
  const [filters, setFilters] = React.useState<ReportFilters>(baseFilters ?? {});
  const [exporting, setExporting] = React.useState(false);
  const tableId = React.useId().replace(/[:]/g, "");

  const effectiveFilters = React.useMemo(() => ({ ...baseFilters, ...filters }), [baseFilters, filters]);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteReports(effectiveFilters);

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
    exportReportsToExcel(rows, exportFileName);
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
      await exportElementToPdf(tableId, exportFileName);
      toast.success("فایل PDF دانلود شد");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "در حال بارگذاری..." : `${toPersianDigits(total)} گزارش یافت شد`}
            {subtitle ? ` — ${subtitle}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            خروجی اکسل
          </Button>
          <Button variant="outline" onClick={handleExportPdf} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            خروجی PDF
          </Button>
        </div>
      </div>

      <ReportFiltersBar
        filters={filters}
        onChange={setFilters}
        hideStatus={hideStatusFilter}
        hideType={hideTypeFilter}
      />

      <div id={tableId} className="glass-card overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>شماره گزارش</TableHead>
              <TableHead>عنوان</TableHead>
              <TableHead>نوع</TableHead>
              <TableHead>ولایت / ولسوالی</TableHead>
              <TableHead>مرکز</TableHead>
              <TableHead>تاریخ</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground">
                    <Inbox className="h-10 w-10 opacity-50" />
                    <div>{emptyHint ?? "هیچ گزارشی یافت نشد"}</div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {rows.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-mono text-xs text-primary" dir="ltr">
                  {report.report_number}
                </TableCell>
                <TableCell className="max-w-[220px] truncate font-medium">{report.title}</TableCell>
                <TableCell>{report.report_type}</TableCell>
                <TableCell className="text-muted-foreground">
                  {report.province} / {report.district}
                </TableCell>
                <TableCell className="text-muted-foreground">{report.center_name}</TableCell>
                <TableCell className="text-muted-foreground">{toJalaliShort(report.report_date)}</TableCell>
                <TableCell>
                  <StatusBadge status={report.status} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/reports/${report.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {hasNextPage && (
          <div ref={sentinelRef} className="flex items-center justify-center py-6">
            {isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
        )}
      </div>
    </div>
  );
}
