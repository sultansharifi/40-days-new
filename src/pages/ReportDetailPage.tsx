import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Pencil, Trash2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useReportDetail } from "@/hooks/useReports";
import { useDeleteReport } from "@/hooks/useReportActions";
import { toJalali } from "@/lib/persian-date";
import { toast } from "sonner";

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: report, isLoading } = useReportDetail(id);
  const deleteReport = useDeleteReport();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!report) {
    return <div className="text-center text-muted-foreground">گزارش یافت نشد.</div>;
  }

  const handleDelete = async () => {
    await deleteReport.mutateAsync(report.id);
    toast.success("گزارش حذف شد");
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-bold">گزارش</h1>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="whitespace-pre-wrap text-base leading-8">{report.title}</p>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {toJalali(report.report_date)}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <ReportDoneCheckbox reportId={report.id} status={report.status} />
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/reports/${report.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  ویرایش
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>حذف گزارش</AlertDialogTitle>
                    <AlertDialogDescription>
                      آیا از حذف این گزارش مطمئن هستید؟ این عملیات قابل بازگشت نیست.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      حذف قطعی
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
