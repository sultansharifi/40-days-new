import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ReportFormValues } from "@/lib/reportFormSchema";
import { rememberLastReportValues } from "@/lib/reportDraft";

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
    // create_full_report / update_full_report run the report + participants
    // + results writes inside a single Postgres function call, so they all
    // succeed or all fail together. A report only ever exists — and only
    // ever shows up in the dashboard or reports list — once the entire
    // submission actually completed; a mid-way failure leaves nothing
    // behind instead of a half-written "pending" report.
    mutationFn: async ({ values, files, createdBy, editingReportId }: SaveReportArgs) => {
      const rpcArgs = {
        p_reporter_name: values.reporterName,
        p_title: values.title,
        p_province: values.province,
        p_district: values.district,
        p_center_name: values.centerName,
        p_report_date: values.reportDate,
        p_report_type: values.reportType,
        p_objective: values.objective || null,
        p_activity_description: values.activityDescription || null,
        p_location: values.location || null,
        p_start_date: values.startDate || null,
        p_end_date: values.endDate || null,
        p_male_under18: values.maleUnder18,
        p_female_under18: values.femaleUnder18,
        p_male_over18: values.maleOver18,
        p_female_over18: values.femaleOver18,
        p_achievement: values.achievement || null,
        p_challenges: values.challenges || null,
        p_recommendations: values.recommendations || null,
      };

      let reportId: string;

      if (editingReportId) {
        const { error } = await supabase.rpc("update_full_report", {
          p_report_id: editingReportId,
          ...rpcArgs,
        });
        if (error) throw error;
        reportId = editingReportId;
      } else {
        const { data, error } = await supabase.rpc("create_full_report", rpcArgs);
        if (error) throw error;
        reportId = data as string;
      }

      if (files.length) {
        await uploadAttachments(reportId, createdBy, files);
      }

      if (!editingReportId) {
        rememberLastReportValues(createdBy, {
          reporterName: values.reporterName,
          province: values.province,
          district: values.district,
          centerName: values.centerName,
        });
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
