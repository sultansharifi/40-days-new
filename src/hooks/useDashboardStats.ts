import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
}

async function countReports(status?: "pending" | "approved") {
  let query = supabase.from("reports").select("id", { count: "exact", head: true });
  if (status) query = query.eq("status", status);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const [total, pending, approved] = await Promise.all([
        countReports(),
        countReports("pending"),
        countReports("approved"),
      ]);
      return { total, pending, approved };
    },
    staleTime: 30_000,
  });
}
