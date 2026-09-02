import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/persian-date";

// The DB still models report_type as an enum; the simplified UI doesn't
// expose it, so every quick report just gets this fixed default value.
const DEFAULT_REPORT_TYPE = "روزانه";

/**
 * A "report" here is just a short line of text. We still write through
 * create_full_report/update_full_report (atomic across reports +
 * participants + results, see migration 0002) so nothing new needs to be
 * set up in Supabase — the fields the simplified UI doesn't ask for
 * anymore (province, center, participant counts, ...) are just sent as
 * blank/zero defaults.
 */
function defaultedRpcArgs(text: string) {
  return {
    p_reporter_name: "",
    p_title: text,
    p_province: "",
    p_district: "",
    p_center_name: "",
    p_report_date: todayISO(),
    p_report_type: DEFAULT_REPORT_TYPE,
    p_objective: null,
    p_activity_description: null,
    p_location: null,
    p_start_date: null,
    p_end_date: null,
    p_male_under18: 0,
    p_female_under18: 0,
    p_male_over18: 0,
    p_female_over18: 0,
    p_achievement: null,
    p_challenges: null,
    p_recommendations: null,
  };
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["reports"] });
  queryClient.invalidateQueries({ queryKey: ["recent-report-texts"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  queryClient.invalidateQueries({ queryKey: ["report"] });
}

export function useCreateQuickReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      const { data, error } = await supabase.rpc("create_full_report", defaultedRpcArgs(text));
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateQuickReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const { error } = await supabase.rpc("update_full_report", {
        p_report_id: id,
        ...defaultedRpcArgs(text),
      });
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useRecentReportTexts(limit = 8) {
  return useQuery({
    queryKey: ["recent-report-texts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("title")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      const seen = new Set<string>();
      const unique: string[] = [];
      for (const row of data ?? []) {
        const text = row.title.trim();
        if (text && !seen.has(text)) {
          seen.add(text);
          unique.push(text);
        }
        if (unique.length >= limit) break;
      }
      return unique;
    },
    staleTime: 15_000,
  });
}
