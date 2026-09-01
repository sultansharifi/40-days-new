import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Pencil,
  Trash2,
  MapPin,
  Building2,
  CalendarDays,
  Target,
  Users,
  FileText,
  Paperclip,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
import { useDeleteReport, getAttachmentUrl } from "@/hooks/useReportActions";
import { toJalali, toPersianDigits } from "@/lib/persian-date";
import { toast } from "sonner";

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value || "—"}</div>
      </div>
    </div>
  );
}

function ParticipantStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-primary tabular-nums">{toPersianDigits(value)}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function AttachmentRow({ fileName, filePath }: { fileName: string; filePath: string }) {
  return (
    <a
      href={getAttachmentUrl(filePath)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm transition-colors hover:border-primary/40 hover:bg-white/[0.06]"
    >
      <span className="flex items-center gap-2 truncate">
        <Paperclip className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate">{fileName}</span>
      </span>
      <Download className="h-4 w-4 text-muted-foreground" />
    </a>
  );
}

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: report, isLoading } = useReportDetail(id);
  const deleteReport = useDeleteReport();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{report.title}</h1>
            <div className="mt-1 font-mono text-xs text-muted-foreground" dir="ltr">
              {report.report_number}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ReportDoneCheckbox reportId={report.id} status={report.status} />
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>اطلاعات پایه</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InfoItem icon={FileText} label="نوع گزارش" value={report.report_type} />
            <InfoItem icon={CalendarDays} label="تاریخ گزارش" value={toJalali(report.report_date)} />
            <InfoItem icon={MapPin} label="ولایت / ولسوالی" value={`${report.province} / ${report.district}`} />
            <InfoItem icon={Building2} label="مرکز آموزشی" value={report.center_name} />
            <InfoItem icon={Users} label="ثبت‌کننده" value={report.reporter_name} />
            <InfoItem
              icon={CalendarDays}
              label="دوره فعالیت"
              value={
                report.start_date || report.end_date
                  ? `${toJalali(report.start_date)} تا ${toJalali(report.end_date)}`
                  : undefined
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تعداد اشتراک‌کنندگان</CardTitle>
          </CardHeader>
          <CardContent>
            {report.participants ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <ParticipantStat label="دختر زیر ۱۸ سال" value={report.participants.female_under18} />
                  <ParticipantStat label="پسر زیر ۱۸ سال" value={report.participants.male_under18} />
                  <ParticipantStat label="زن بالای ۱۸ سال" value={report.participants.female_over18} />
                  <ParticipantStat label="مرد بالای ۱۸ سال" value={report.participants.male_over18} />
                </div>
                <Separator />
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm text-muted-foreground">مجموع کل</span>
                  <span className="text-xl font-bold text-primary">{toPersianDigits(report.participants.total)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">اطلاعاتی ثبت نشده است.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>هدف و شرح فعالیت</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Target className="h-3.5 w-3.5" /> هدف
              </div>
              <p className="leading-7">{report.objective || "—"}</p>
            </div>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">شرح فعالیت</div>
              <p className="leading-7">{report.activity_description || "—"}</p>
            </div>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">محل برگزاری</div>
              <p className="leading-7">{report.location || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>نتایج</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="mb-1 text-xs text-muted-foreground">دستاوردها</div>
              <p className="leading-7">{report.results?.achievement || "—"}</p>
            </div>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">چالش‌ها</div>
              <p className="leading-7">{report.results?.challenges || "—"}</p>
            </div>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">پیشنهادات</div>
              <p className="leading-7">{report.results?.recommendations || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>پیوست‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {report.report_attachments?.length ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {report.report_attachments.map((a) => (
                  <AttachmentRow key={a.id} fileName={a.file_name} filePath={a.file_path} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">پیوستی وجود ندارد.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
