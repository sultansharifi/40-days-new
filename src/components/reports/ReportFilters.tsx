import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PersianDatePicker } from "@/components/ui/persian-date-picker";
import { AFGHAN_PROVINCES } from "@/lib/constants";
import { REPORT_TYPES, REPORT_STATUSES } from "@/types/database";
import type { ReportFilters as Filters } from "@/hooks/useReports";

interface ReportFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  hideStatus?: boolean;
  hideType?: boolean;
}

export function ReportFiltersBar({ filters, onChange, hideStatus, hideType }: ReportFiltersProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  const clear = () => onChange({});

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="glass-card space-y-4 rounded-2xl p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="جستجو بر اساس شماره گزارش، عنوان یا مرکز..."
            className="pr-9"
            value={filters.search ?? ""}
            onChange={(e) => update({ search: e.target.value })}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAdvanced((s) => !s)}
          className="shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4" />
          جستجوی پیشرفته
          {activeCount > 0 && (
            <span className="mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[11px] text-primary">
              {activeCount}
            </span>
          )}
        </Button>
        {activeCount > 0 && (
          <Button type="button" variant="ghost" onClick={clear} className="shrink-0">
            <X className="h-4 w-4" />
            پاک کردن
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">ولایت</label>
            <Select value={filters.province ?? "all"} onValueChange={(v) => update({ province: v === "all" ? undefined : v })}>
              <SelectTrigger>
                <SelectValue placeholder="همه ولایت‌ها" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه ولایت‌ها</SelectItem>
                {AFGHAN_PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">ولسوالی</label>
            <Input
              placeholder="نام ولسوالی"
              value={filters.district ?? ""}
              onChange={(e) => update({ district: e.target.value || undefined })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">مرکز آموزشی</label>
            <Input
              placeholder="نام مرکز"
              value={filters.center ?? ""}
              onChange={(e) => update({ center: e.target.value || undefined })}
            />
          </div>

          {!hideType && (
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">نوع گزارش</label>
              <Select
                value={filters.reportType ?? "all"}
                onValueChange={(v) => update({ reportType: v === "all" ? undefined : (v as Filters["reportType"]) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="همه انواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه انواع</SelectItem>
                  {REPORT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!hideStatus && (
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">وضعیت</label>
              <Select
                value={filters.status ?? "all"}
                onValueChange={(v) => update({ status: v === "all" ? undefined : (v as Filters["status"]) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="همه وضعیت‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  {REPORT_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">از تاریخ</label>
            <PersianDatePicker value={filters.dateFrom} onChange={(v) => update({ dateFrom: v })} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">تا تاریخ</label>
            <PersianDatePicker value={filters.dateTo} onChange={(v) => update({ dateTo: v })} />
          </div>
        </div>
      )}
    </div>
  );
}
