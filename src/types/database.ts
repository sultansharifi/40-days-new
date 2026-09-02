export type ReportStatus = "pending" | "approved" | "rejected";

export const REPORT_STATUSES: { value: ReportStatus; label: string }[] = [
  { value: "pending", label: "در انتظار" },
  { value: "approved", label: "انجام شده" },
  { value: "rejected", label: "رد شده" },
];

export interface Report {
  id: string;
  report_number: string;
  created_by: string | null;
  reporter_name: string;
  report_type: string;
  title: string;
  province: string;
  district: string;
  center_name: string;
  report_date: string;
  objective: string | null;
  activity_description: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}
