import { Link } from "react-router-dom";
import { FileText, Clock, CheckCircle2, XCircle, FilePlus2, ListChecks } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/context/AuthContext";

export function DashboardPage() {
  const { data, isLoading } = useDashboardStats();
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">داشبورد</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile ? `${profile.full_name}، ` : ""}خلاصه‌ای از وضعیت گزارشات آموزشی سازمان
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !data
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[100px]" />)
          : (
              [
                { label: "مجموع گزارشات", value: data.total, icon: FileText, tone: "primary" as const },
                { label: "در انتظار بررسی", value: data.pending, icon: Clock, tone: "warning" as const },
                { label: "تایید شده", value: data.approved, icon: CheckCircle2, tone: "success" as const },
                { label: "رد شده", value: data.rejected, icon: XCircle, tone: "destructive" as const },
              ]
            ).map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/reports/new">
          <Card className="group h-full cursor-pointer">
            <CardContent className="flex items-center gap-4 p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-glow transition-transform group-hover:scale-110">
                <FilePlus2 className="h-7 w-7" />
              </div>
              <div>
                <div className="text-lg font-semibold">ثبت گزارش جدید</div>
                <div className="mt-1 text-sm text-muted-foreground">افزودن گزارش آموزشی، امتحان یا سمینار</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/reports">
          <Card className="group h-full cursor-pointer">
            <CardContent className="flex items-center gap-4 p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-glow transition-transform group-hover:scale-110">
                <ListChecks className="h-7 w-7" />
              </div>
              <div>
                <div className="text-lg font-semibold">گزارش همه</div>
                <div className="mt-1 text-sm text-muted-foreground">مشاهده، جستجو و فیلتر تمام گزارشات</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
