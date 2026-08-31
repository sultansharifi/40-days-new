import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export function NotFoundPage() {
  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-glow">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold">صفحه مورد نظر یافت نشد</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        آدرسی که وارد کرده‌اید وجود ندارد یا جابه‌جا شده است.
      </p>
      <Button asChild>
        <Link to="/">بازگشت به داشبورد</Link>
      </Button>
    </div>
  );
}
