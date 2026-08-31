import * as React from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PersianDatePicker } from "@/components/ui/persian-date-picker";
import { cn } from "@/lib/utils";
import { AFGHAN_PROVINCES } from "@/lib/constants";
import { REPORT_TYPES } from "@/types/database";
import type { ReportAttachment } from "@/types/database";
import { reportFormSchema, STEP_FIELDS, STEP_LABELS, type ReportFormValues } from "@/lib/reportFormSchema";
import { ActivityDetailsStep, AttachmentsStep, ParticipantsStep, ResultsStep } from "@/components/reports/ReportFormSteps";
import { useSaveReport, useDeleteAttachment } from "@/hooks/useSaveReport";
import { useAuth } from "@/context/AuthContext";
import { todayISO } from "@/lib/persian-date";

interface ReportFormWizardProps {
  editingReportId?: string;
  initialValues?: Partial<ReportFormValues>;
  existingAttachments?: ReportAttachment[];
}

export function ReportFormWizard({ editingReportId, initialValues, existingAttachments }: ReportFormWizardProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const saveReport = useSaveReport();
  const deleteAttachment = useDeleteAttachment();

  const [step, setStep] = React.useState(0);
  const [files, setFiles] = React.useState<File[]>([]);
  const [removedExisting, setRemovedExisting] = React.useState<ReportAttachment[]>([]);

  const methods = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    mode: "onChange",
    defaultValues: {
      reporterName: profile?.full_name ?? "",
      title: "",
      province: profile?.province ?? "",
      district: profile?.district ?? "",
      centerName: "",
      reportDate: todayISO(),
      reportType: REPORT_TYPES[0],
      objective: "",
      activityDescription: "",
      location: "",
      startDate: "",
      endDate: "",
      maleUnder18: 0,
      femaleUnder18: 0,
      maleOver18: 0,
      femaleOver18: 0,
      achievement: "",
      challenges: "",
      recommendations: "",
      ...initialValues,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = methods;

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const valid = fields.length ? await trigger(fields) : true;
    if (valid) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const visibleExisting = (existingAttachments ?? []).filter(
    (a) => !removedExisting.some((r) => r.id === a.id),
  );

  const onRemoveExisting = async (attachment: ReportAttachment) => {
    setRemovedExisting((prev) => [...prev, attachment]);
    try {
      await deleteAttachment.mutateAsync({ id: attachment.id, filePath: attachment.file_path });
    } catch {
      toast.error("حذف پیوست ناموفق بود");
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!profile) return;
    try {
      const reportId = await saveReport.mutateAsync({
        values,
        files,
        createdBy: profile.id,
        editingReportId,
      });
      toast.success(editingReportId ? "گزارش با موفقیت به‌روزرسانی شد" : "گزارش با موفقیت ثبت شد");
      navigate(`/reports/${reportId}`);
    } catch (err) {
      toast.error("ثبت گزارش ناموفق بود", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  });

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-3xl space-y-6">
        <ol className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin sm:gap-2">
          {STEP_LABELS.map((label, i) => (
            <li key={label} className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                  i === step
                    ? "border-primary/50 bg-primary/15 text-primary shadow-glow"
                    : i < step
                      ? "cursor-pointer border-success/40 bg-success/10 text-success"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                {label}
              </button>
              {i < STEP_LABELS.length - 1 && <ChevronLeft className="h-4 w-4 text-muted-foreground/50" />}
            </li>
          ))}
        </ol>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={onSubmit}>
              {step === 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>نام گزارش‌دهنده</Label>
                    <Input {...register("reporterName")} placeholder="نام کامل" />
                    {errors.reporterName && <p className="text-xs text-destructive">{errors.reporterName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>عنوان گزارش</Label>
                    <Input {...register("title")} placeholder="مثال: گزارش بازدید از مرکز سواد آموزی" />
                    {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>ولایت</Label>
                    <Controller
                      control={control}
                      name="province"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="انتخاب ولایت" />
                          </SelectTrigger>
                          <SelectContent>
                            {AFGHAN_PROVINCES.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.province && <p className="text-xs text-destructive">{errors.province.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>ولسوالی</Label>
                    <Input {...register("district")} placeholder="نام ولسوالی" />
                    {errors.district && <p className="text-xs text-destructive">{errors.district.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>مرکز آموزشی</Label>
                    <Input {...register("centerName")} placeholder="نام مرکز آموزشی" />
                    {errors.centerName && <p className="text-xs text-destructive">{errors.centerName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>تاریخ گزارش</Label>
                    <Controller
                      control={control}
                      name="reportDate"
                      render={({ field }) => <PersianDatePicker value={field.value} onChange={field.onChange} />}
                    />
                    {errors.reportDate && <p className="text-xs text-destructive">{errors.reportDate.message}</p>}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>نوع گزارش</Label>
                    <Controller
                      control={control}
                      name="reportType"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="انتخاب نوع گزارش" />
                          </SelectTrigger>
                          <SelectContent>
                            {REPORT_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              )}

              {step === 1 && <ActivityDetailsStep />}
              {step === 2 && <ParticipantsStep />}
              {step === 3 && <ResultsStep />}
              {step === 4 && (
                <AttachmentsStep
                  files={files}
                  onFilesChange={setFiles}
                  existingAttachments={visibleExisting}
                  onRemoveExisting={onRemoveExisting}
                />
              )}

              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>
                  <ChevronRight className="h-4 w-4" />
                  مرحله قبل
                </Button>

                {step < STEP_LABELS.length - 1 ? (
                  <Button type="button" onClick={goNext}>
                    مرحله بعد
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting || saveReport.isPending}>
                    {(isSubmitting || saveReport.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingReportId ? "به‌روزرسانی گزارش" : "ثبت نهایی گزارش"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}
