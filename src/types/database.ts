export type ReportType = "روزانه" | "هفتگی" | "ماهانه" | "فعالیت" | "بازدید";

export type ReportStatus = "pending" | "approved" | "rejected";

export const REPORT_TYPES: ReportType[] = ["روزانه", "هفتگی", "ماهانه", "فعالیت", "بازدید"];

export const REPORT_STATUSES: { value: ReportStatus; label: string }[] = [
  { value: "pending", label: "در انتظار" },
  { value: "approved", label: "انجام شده" },
  { value: "rejected", label: "رد شده" },
];

export interface Participants {
  id: string;
  report_id: string;
  male_under18: number;
  female_under18: number;
  male_over18: number;
  female_over18: number;
  total: number;
}

export interface ReportResults {
  id: string;
  report_id: string;
  achievement: string | null;
  challenges: string | null;
  recommendations: string | null;
}

export interface ReportAttachment {
  id: string;
  report_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  report_number: string;
  created_by: string | null;
  reporter_name: string;
  report_type: ReportType;
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

export interface ReportWithRelations extends Report {
  participants: Participants | null;
  results: ReportResults | null;
  report_attachments: ReportAttachment[];
}
