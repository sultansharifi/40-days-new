import * as React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function LoginPage() {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  if (!loading && session) {
    const from = (location.state as { from?: string })?.from ?? "/";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error("ورود ناموفق بود", { description: "ایمیل یا رمز عبور اشتباه است." });
      return;
    }
    toast.success("خوش آمدید");
    navigate("/", { replace: true });
  };

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-glow-lg">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مدیریت آموزش</h1>
            <p className="mt-1 text-sm text-muted-foreground">سیستم مدیریت و ثبت گزارشات آموزشی</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-card cyan-glow-border space-y-5 rounded-2xl p-7">
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                dir="ltr"
                placeholder="you@example.com"
                className="pr-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                required
                dir="ltr"
                placeholder="••••••••"
                className="pr-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            ورود به سیستم
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            دسترسی به این سامانه فقط برای کارمندان مجاز سازمان است.
          </p>
        </form>
      </div>
    </div>
  );
}
