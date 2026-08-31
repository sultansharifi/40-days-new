import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ReportFormValues } from "@/lib/reportFormSchema";

interface SaveReportArgs {
  values: ReportFormValues;
  files: File[];
  createdBy: string;
  editingReportId?: string;
}

function fileTypeCategory(file: File): string {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  if (
    file.type.includes("spreadsheet") ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls") ||
    file.name.endsWith(".csv")
  )
    return "excel";
  return "other";
}

async function uploadAttachments(reportId: string, createdBy: string, files: File[]) {
  for (const file of files) {
    const path = `${createdBy}/${reportId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("report-attachments").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase.from("report_attachments").insert({
      report_id: reportId,
      file_name: file.name,
      file_path: path,
      file_type: fileTypeCategory(file),
      file_size: file.size,
      uploaded_by: createdBy,
    });
    if (insertError) throw insertError;
  }
}

export function useSaveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ values, files, createdBy, editingReportId }: SaveReportArgs) => {
      const reportPayload = {
        reporter_name: values.reporterName,
        title: values.title,
        province: values.province,
        district: values.district,
        center_name: values.centerName,
        report_date: values.reportDate,
        report_type: values.reportType as ReportFormValues["reportType"] & string,
        objective: values.objective || null,
        activity_description: values.activityDescription || null,
        location: values.location || null,
        start_date: values.startDate || null,
        end_date: values.endDate || null,
      };

      let reportId = editingReportId;

      if (editingReportId) {
        const { error } = await supabase.from("reports").update(reportPayload).eq("id", editingReportId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("reports")
          .insert({ ...reportPayload, created_by: createdBy, status: "pending" })
          .select("id")
          .single();
        if (error) throw error;
        reportId = data.id;
      }

      if (!reportId) throw new Error("Report id missing after save");

      const participantsPayload = {
        report_id: reportId,
        male_under18: values.maleUnder18,
        female_under18: values.femaleUnder18,
        male_over18: values.maleOver18,
        female_over18: values.femaleOver18,
      };
      const { error: participantsError } = await supabase
        .from("participants")
        .upsert(participantsPayload, { onConflict: "report_id" });
      if (participantsError) throw participantsError;

      const resultsPayload = {
        report_id: reportId,
        achievement: values.achievement || null,
        challenges: values.challenges || null,
        recommendations: values.recommendations || null,
      };
      const { error: resultsError } = await supabase.from("results").upsert(resultsPayload, { onConflict: "report_id" });
      if (resultsError) throw resultsError;

      if (files.length) {
        await uploadAttachments(reportId, createdBy, files);
      }

      return reportId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      await supabase.storage.from("report-attachments").remove([filePath]);
      const { error } = await supabase.from("report_attachments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}
