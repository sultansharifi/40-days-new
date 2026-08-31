import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import type { DateObject } from "react-multi-date-picker";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersianDatePickerProps {
  value: string | null | undefined;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className,
  disabled,
}: PersianDatePickerProps) {
  return (
    <div className={cn("relative", className)}>
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        value={value ? new Date(value) : undefined}
        onChange={(date: DateObject | null) => {
          if (date) {
            const native = date.toDate();
            onChange(native.toISOString().slice(0, 10));
          }
        }}
        disabled={disabled}
        placeholder={placeholder}
        inputClass={cn(
          "flex h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 pr-9 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
        )}
        containerClassName="w-full"
      />
      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
