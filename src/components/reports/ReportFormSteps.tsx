import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { FileImage, FileSpreadsheet, FileText, Trash2, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PersianDatePicker } from "@/components/ui/persian-date-picker";
import type { ReportFormValues } from "@/lib/reportFormSchema";
import { toPersianDigits } from "@/lib/persian-date";
import type { ReportAttachment } from "@/types/database";

export function ActivityDetailsStep() {
  const { register, control } = useFormContext<ReportFormValues>();
  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="space-y-2">
        <Label>هدف</Label>
        <Textarea rows={3} placeholder="هدف از برگزاری این فعالیت..." {...register("objective")} />
      </div>
      <div className="space-y-2">
        <Label>شرح فعالیت</Label>
        <Textarea rows={4} placeholder="توضیح کامل فعالیت انجام‌شده..." {...register("activityDescription")} />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>محل برگزاری</Label>
          <Input placeholder="مثال: سالن اجتماعات مرکز" {...register("location")} />
        </div>
        <div className="space-y-2">
          <Label>تاریخ شروع</Label>
          <PersianDateField control={control} name="startDate" />
        </div>
        <div className="space-y-2">
          <Label>تاریخ ختم</Label>
          <PersianDateField control={control} name="endDate" />
        </div>
      </div>
    </div>
  );
}

function PersianDateField({ control, name }: { control: any; name: "startDate" | "endDate" }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <PersianDatePicker value={field.value} onChange={field.onChange} />}
    />
  );
}

const PARTICIPANT_FIELDS: { key: keyof ReportFormValues; label: string }[] = [
  { key: "femaleUnder18", label: "دختر (زیر ۱۸ سال)" },
  { key: "maleUnder18", label: "پسر (زیر ۱۸ سال)" },
  { key: "femaleOver18", label: "زن (بالای ۱۸ سال)" },
  { key: "maleOver18", label: "مرد (بالای ۱۸ سال)" },
];

export function ParticipantsStep() {
  const { register, watch } = useFormContext<ReportFormValues>();
  const values = watch();
  const total =
    Number(values.femaleUnder18 || 0) +
    Number(values.maleUnder18 || 0) +
    Number(values.femaleOver18 || 0) +
    Number(values.maleOver18 || 0);

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04]">
            <tr>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">گروه</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">تعداد</th>
            </tr>
          </thead>
          <tbody>
            {PARTICIPANT_FIELDS.map((f) => (
              <tr key={f.key} className="border-t border-white/10">
                <td className="px-4 py-3">{f.label}</td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min={0}
                    className="w-32"
                    {...register(f.key, { valueAsNumber: true })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-card flex items-center justify-between rounded-xl p-4">
        <span className="text-sm text-muted-foreground">مجموع کل اشتراک‌کنندگان</span>
        <span className="text-2xl font-bold text-primary tabular-nums">{toPersianDigits(total)}</span>
      </div>
    </div>
  );
}

export function ResultsStep() {
  const { register } = useFormContext<ReportFormValues>();
  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="space-y-2">
        <Label>دستاوردها</Label>
        <Textarea rows={3} placeholder="دستاوردهای حاصل‌شده..." {...register("achievement")} />
      </div>
      <div className="space-y-2">
        <Label>چالش‌ها</Label>
        <Textarea rows={3} placeholder="چالش‌های مواجه‌شده..." {...register("challenges")} />
      </div>
      <div className="space-y-2">
        <Label>پیشنهادات</Label>
        <Textarea rows={3} placeholder="پیشنهادات برای بهبود..." {...register("recommendations")} />
      </div>
    </div>
  );
}

function attachmentIcon(fileName: string) {
  if (/\.(png|jpe?g|gif|webp)$/i.test(fileName)) return FileImage;
  if (/\.pdf$/i.test(fileName)) return FileText;
  if (/\.(xlsx?|csv)$/i.test(fileName)) return FileSpreadsheet;
  return FileText;
}

interface AttachmentsStepProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  existingAttachments?: ReportAttachment[];
  onRemoveExisting?: (attachment: ReportAttachment) => void;
}

export function AttachmentsStep({ files, onFilesChange, existingAttachments, onRemoveExisting }: AttachmentsStepProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    onFilesChange([...files, ...Array.from(fileList)]);
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
      >
        <UploadCloud className="h-8 w-8 text-primary" />
        <div className="text-sm font-medium">برای آپلود کلیک کنید یا فایل را بکشید</div>
        <div className="text-xs text-muted-foreground">تصویر، PDF یا اکسل — حداکثر ۱۰ مگابایت برای هر فایل</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </button>

      {existingAttachments && existingAttachments.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">پیوست‌های موجود</div>
          {existingAttachments.map((a) => {
            const Icon = attachmentIcon(a.file_name);
            return (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2 truncate">
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{a.file_name}</span>
                </span>
                {onRemoveExisting && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveExisting(a)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">فایل‌های جدید</div>
          {files.map((file, i) => {
            const Icon = attachmentIcon(file.name);
            return (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2 truncate">
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{file.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    ({toPersianDigits((file.size / 1024).toFixed(0))} کیلوبایت)
                  </span>
                </span>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
