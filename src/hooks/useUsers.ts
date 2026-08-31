import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { AppUser, UserRole } from "@/types/database";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as AppUser[];
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<AppUser, "role" | "province" | "district" | "is_active" | "full_name" | "phone">>;
    }) => {
      const { error } = await supabase.from("users").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "مدیر سیستم",
  manager: "مدیر بخش",
  reporter: "گزارش‌دهنده",
};
