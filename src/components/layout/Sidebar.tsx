import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  FilePlus2,
  GraduationCap,
  Presentation,
  Users,
  GraduationCap as Logo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { to: "/", label: "داشبورد", icon: LayoutDashboard, end: true },
  { to: "/reports", label: "گزارش همه", icon: FileText },
  { to: "/reports/new", label: "ثبت گزارش", icon: FilePlus2 },
  { to: "/exams", label: "امتحان‌ها", icon: GraduationCap },
  { to: "/seminars", label: "سمینارها", icon: Presentation },
  { to: "/users", label: "کاربران", icon: Users, adminOnly: true },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { hasRole } = useAuth();

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
        {navItems.map((item) => {
          if (item.adminOnly && !hasRole("admin")) return null;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-5">
        <div className="glass-card rounded-xl p-3 text-center text-[11px] text-muted-foreground">
          نسخه ۱٫۰ — سیستم مدیریت آموزش
        </div>
      </div>
    </aside>
  );
}
