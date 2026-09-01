import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ReportType } from "@/types/database";

export interface ReportTypeCount {
  report_type: ReportType;
  total: number;
}

export function useReportTypeCounts() {
  return useQuery({
    queryKey: ["report-type-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("report_type_counts");
      if (error) throw error;
      return (data ?? []) as ReportTypeCount[];
    },
    staleTime: 30_000,
  });
}
