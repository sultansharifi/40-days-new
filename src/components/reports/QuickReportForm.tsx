import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Send, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateQuickReport, useUpdateQuickReport, useRecentReportTexts } from "@/hooks/useQuickReports";

interface QuickReportFormProps {
  editingReportId?: string;
  initialText?: string;
}

export function QuickReportForm({ editingReportId, initialText }: QuickReportFormProps) {
  const navigate = useNavigate();
  const [text, setText] = React.useState(initialText ?? "");
  const createReport = useCreateQuickReport();
  const updateReport = useUpdateQuickReport();
  const { data: recentTexts, isLoading: recentLoading } = useRecentReportTexts();

  const pending = createReport.isPending || updateReport.isPending;

  const submit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("گزارش نمی‌تواند خالی باشد");
      return;
    }
    try {
      if (editingReportId) {
        await updateReport.mutateAsync({ id: editingReportId, text: trimmed });
        toast.success("گزارش به‌روزرسانی شد");
        navigate(`/reports/${editingReportId}`);
      } else {
        await createReport.mutateAsync(trimmed);
        toast.success("گزارش ثبت شد");
        setText("");
      }
    } catch (err) {
      toast.error("ثبت گزارش ناموفق بود", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="گزارش را بنویسید..."
            rows={4}
            autoFocus
          />
          <Button onClick={() => submit(text)} disabled={pending} className="w-full" size="lg">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {editingReportId ? "به‌روزرسانی گزارش" : "ایجاد گزارش"}
          </Button>
        </CardContent>
      </Card>

      {!editingReportId && (recentLoading || (recentTexts && recentTexts.length > 0)) && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            گزارش‌های قبلی — برای ثبت دوباره کلیک کنید
          </div>
          <div className="flex flex-wrap gap-2">
            {recentTexts?.map((t, i) => (
              <button
                key={`${t}-${i}`}
                type="button"
                disabled={pending}
                onClick={() => submit(t)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:opacity-50"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
