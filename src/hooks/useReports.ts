import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Report, ReportStatus } from "@/types/database";

const PAGE_SIZE = 20;

export interface ReportFilters {
  search?: string;
  status?: ReportStatus | "all";
}

function applyFilters(query: any, filters: ReportFilters) {
  if (filters.search) {
    const s = filters.search.trim();
    if (s) query = query.ilike("title", `%${s}%`);
  }
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  return query;
}

export function useInfiniteReports(filters: ReportFilters) {
  return useInfiniteQuery({
    queryKey: ["reports", filters],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("reports")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      query = applyFilters(query, filters);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        rows: (data ?? []) as Report[],
        nextPage: (data?.length ?? 0) === PAGE_SIZE ? pageParam + 1 : undefined,
        total: count ?? 0,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 15_000,
  });
}

export function useReportDetail(reportId: string | undefined) {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: async () => {
      const { data, error } = await supabase.from("reports").select("*").eq("id", reportId as string).single();
      if (error) throw error;
      return data as Report;
    },
    enabled: Boolean(reportId),
  });
}
