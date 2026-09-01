import { NavLink } from "react-router-dom";
import { LayoutDashboard, FilePlus2, GraduationCap as Logo } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-l border-white/10 bg-sidebar/80 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-glow">
          <Logo className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold leading-tight">مدیریت آموزش</div>
          <div className="text-[11px] text-muted-foreground">سیستم ثبت گزارشات آموزشی</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        <NavLink
          to="/"
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-primary/15 text-primary shadow-glow"
                : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
            )
          }
        >
          <LayoutDashboard className="h-4.5 w-4.5" />
          داشبورد
        </NavLink>

        <NavLink
          to="/reports/new"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "mr-4 flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
              isActive
                ? "bg-primary/15 text-primary shadow-glow"
                : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
            )
          }
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          گزارش جدید
        </NavLink>
      </nav>

      <div className="px-4 py-5">
        <div className="glass-card rounded-xl p-3 text-center text-[11px] text-muted-foreground">
          نسخه ۱٫۰ — سیستم مدیریت آموزش
        </div>
      </div>
    </aside>
  );
}
