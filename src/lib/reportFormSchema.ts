import { z } from "zod";
import { REPORT_TYPES } from "@/types/database";

export const basicInfoSchema = z.object({
  reporterName: z.string().min(2, "نام گزارش‌دهنده الزامی است"),
  title: z.string().min(3, "عنوان گزارش الزامی است"),
  province: z.string().min(1, "ولایت را انتخاب کنید"),
  district: z.string().min(1, "ولسوالی را وارد کنید"),
  centerName: z.string().min(1, "نام مرکز آموزشی الزامی است"),
  reportDate: z.string().min(1, "تاریخ گزارش الزامی است"),
  reportType: z.enum(REPORT_TYPES as [string, ...string[]]),
});

export const activitySchema = z.object({
  objective: z.string().optional(),
  activityDescription: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
});

export const participantsSchema = z.object({
  maleUnder18: z.coerce.number().int().min(0).default(0),
  femaleUnder18: z.coerce.number().int().min(0).default(0),
  maleOver18: z.coerce.number().int().min(0).default(0),
  femaleOver18: z.coerce.number().int().min(0).default(0),
});

export const resultsSchema = z.object({
  achievement: z.string().optional(),
  challenges: z.string().optional(),
  recommendations: z.string().optional(),
});

export const reportFormSchema = basicInfoSchema
  .merge(activitySchema)
  .merge(participantsSchema)
  .merge(resultsSchema);

export type ReportFormValues = z.infer<typeof reportFormSchema>;

export const STEP_FIELDS: Record<number, (keyof ReportFormValues)[]> = {
  0: ["reporterName", "title", "province", "district", "centerName", "reportDate", "reportType"],
  1: ["objective", "activityDescription", "location", "startDate", "endDate"],
  2: ["maleUnder18", "femaleUnder18", "maleOver18", "femaleOver18"],
  3: ["achievement", "challenges", "recommendations"],
  4: [],
};

export const STEP_LABELS = ["اطلاعات پایه", "جزئیات فعالیت", "اشتراک‌کنندگان", "نتایج", "پیوست‌ها"];
