export type UserRole = "admin" | "manager" | "reporter";

export type ReportType = "روزانه" | "هفتگی" | "ماهانه" | "فعالیت" | "بازدید";

export type ReportStatus = "pending" | "approved" | "rejected";

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "admin", label: "مدیر سیستم" },
  { value: "manager", label: "مدیر بخش" },
  { value: "reporter", label: "گزارش‌دهنده" },
];

export const REPORT_TYPES: ReportType[] = ["روزانه", "هفتگی", "ماهانه", "فعالیت", "بازدید"];

export const REPORT_STATUSES: { value: ReportStatus; label: string }[] = [
  { value: "pending", label: "در انتظار بررسی" },
  { value: "approved", label: "تایید شده" },
  { value: "rejected", label: "رد شده" },
];

export interface AppUser {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  province: string | null;
  district: string | null;
  is_active: boolean;
  created_at: string;
}

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
  created_by: string;
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
  author?: Pick<AppUser, "id" | "full_name" | "email"> | null;
}

type Relationships = [];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: AppUser;
        Insert: Partial<AppUser> & { id: string; full_name: string; email: string };
        Update: Partial<AppUser>;
        Relationships: Relationships;
      };
      reports: {
        Row: Report;
        Insert: Partial<Report> & {
          created_by: string;
          report_type: ReportType;
          title: string;
          province: string;
          district: string;
          center_name: string;
        };
        Update: Partial<Report>;
        Relationships: Relationships;
      };
      participants: {
        Row: Participants;
        Insert: Omit<Participants, "id" | "total"> & { id?: string };
        Update: Partial<Omit<Participants, "id" | "total">>;
        Relationships: Relationships;
      };
      results: {
        Row: ReportResults;
        Insert: Omit<ReportResults, "id"> & { id?: string };
        Update: Partial<Omit<ReportResults, "id">>;
        Relationships: Relationships;
      };
      report_attachments: {
        Row: ReportAttachment;
        Insert: Omit<ReportAttachment, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<ReportAttachment, "id">>;
        Relationships: Relationships;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
