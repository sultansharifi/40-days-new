import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

async function countReports(status?: "pending" | "approved" | "rejected") {
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
      const [total, pending, approved, rejected] = await Promise.all([
        countReports(),
        countReports("pending"),
        countReports("approved"),
        countReports("rejected"),
      ]);
      return { total, pending, approved, rejected };
    },
    staleTime: 30_000,
  });
}
