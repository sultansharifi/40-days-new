import { Link } from "react-router-dom";
import { FileText, Clock, CheckCircle2, FilePlus2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ReportListView } from "@/components/reports/ReportListView";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">داشبورد</h1>
          <p className="mt-1 text-sm text-muted-foreground">خلاصه‌ای از گزارش‌های ثبت‌شده</p>
        </div>
        <Link to="/reports/new">
          <Card className="cursor-pointer">
            <CardContent className="flex items-center gap-3 px-5 py-3">
              <FilePlus2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">گزارش جدید</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading || !data
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[100px]" />)
          : (
              [
                { label: "مجموع گزارشات", value: data.total, icon: FileText, tone: "primary" as const },
                { label: "در انتظار", value: data.pending, icon: Clock, tone: "warning" as const },
                { label: "انجام شده", value: data.approved, icon: CheckCircle2, tone: "success" as const },
              ]
            ).map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <ReportListView />
    </div>
  );
}
