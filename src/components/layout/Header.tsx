import { useNavigate } from "react-router-dom";
import { Menu, LogOut, User as UserIcon, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/hooks/useUsers";

export function Header() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
    : "؟";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <div className="hidden text-sm text-muted-foreground sm:block">
          {profile ? `خوش آمدید، ${profile.full_name}` : ""}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.06]">
              <Avatar className="h-9 w-9 border border-primary/30">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-right sm:block">
                <div className="text-sm font-medium leading-tight">{profile?.full_name ?? "کاربر"}</div>
                <div className="text-[11px] text-muted-foreground">
                  {profile ? ROLE_LABELS[profile.role] : ""}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>{profile?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="h-4 w-4" />
              پروفایل من
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              خروج از سیستم
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
