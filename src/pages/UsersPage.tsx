import * as React from "react";
import { Pencil, Search, ShieldCheck, UserCog, Users as UsersIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AFGHAN_PROVINCES } from "@/lib/constants";
import { useUsers, useUpdateUser, ROLE_LABELS } from "@/hooks/useUsers";
import type { AppUser, UserRole } from "@/types/database";
import { toJalaliShort } from "@/lib/persian-date";
import { toast } from "sonner";

const roleBadgeVariant: Record<UserRole, "default" | "secondary" | "outline"> = {
  admin: "default",
  manager: "secondary",
  reporter: "outline",
};

function EditUserDialog({ user, onClose }: { user: AppUser; onClose: () => void }) {
  const updateUser = useUpdateUser();
  const [role, setRole] = React.useState<UserRole>(user.role);
  const [province, setProvince] = React.useState(user.province ?? "");
  const [district, setDistrict] = React.useState(user.district ?? "");
  const [phone, setPhone] = React.useState(user.phone ?? "");

  const handleSave = async () => {
    try {
      await updateUser.mutateAsync({ id: user.id, updates: { role, province, district, phone } });
      toast.success("اطلاعات کاربر به‌روزرسانی شد");
      onClose();
    } catch {
      toast.error("به‌روزرسانی ناموفق بود");
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ویرایش کاربر — {user.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>نقش کاربری</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ولایت</Label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب ولایت" />
              </SelectTrigger>
              <SelectContent>
                {AFGHAN_PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ولسوالی</Label>
            <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>شماره تماس</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button onClick={handleSave} disabled={updateUser.isPending}>
            ذخیره تغییرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const [search, setSearch] = React.useState("");
  const [editingUser, setEditingUser] = React.useState<AppUser | null>(null);

  const filtered = React.useMemo(() => {
    if (!users) return [];
    const s = search.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) => u.full_name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s),
    );
  }, [users, search]);

  const toggleActive = async (user: AppUser) => {
    try {
      await updateUser.mutateAsync({ id: user.id, updates: { is_active: !user.is_active } });
      toast.success(user.is_active ? "کاربر غیرفعال شد" : "کاربر فعال شد");
    } catch {
      toast.error("عملیات ناموفق بود");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <UsersIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">کاربران</h1>
          <p className="text-sm text-muted-foreground">مدیریت کاربران و سطوح دسترسی سیستم</p>
        </div>
      </div>

      <Card className="glass-card border-primary/20 bg-primary/[0.04]">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            ثبت‌نام کاربران جدید از طریق صفحه ورود (Supabase Auth) یا پنل مدیریت Supabase انجام می‌شود. در این
            صفحه می‌توانید نقش، ولایت/ولسوالی و وضعیت فعال بودن کاربران موجود را مدیریت کنید.
          </span>
        </CardContent>
      </Card>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="جستجوی نام یا ایمیل..." className="pr-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کاربر</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>ولایت / ولسوالی</TableHead>
              <TableHead>تاریخ عضویت</TableHead>
              <TableHead>فعال</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground">
                    <UserCog className="h-10 w-10 opacity-50" />
                    <div>کاربری یافت نشد</div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-white/10">
                      <AvatarFallback>{user.full_name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{user.full_name}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant[user.role] === "default" ? "default" : "secondary"}>
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.province ? `${user.province} / ${user.district ?? "—"}` : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">{toJalaliShort(user.created_at)}</TableCell>
                <TableCell>
                  <Switch checked={user.is_active} onCheckedChange={() => toggleActive(user)} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingUser && <EditUserDialog user={editingUser} onClose={() => setEditingUser(null)} />}
    </div>
  );
}
