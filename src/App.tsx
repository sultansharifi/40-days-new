import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ReportsListPage } from "@/pages/ReportsListPage";
import { ReportFormPage } from "@/pages/ReportFormPage";
import { ReportDetailPage } from "@/pages/ReportDetailPage";
import { ExamsPage } from "@/pages/ExamsPage";
import { SeminarsPage } from "@/pages/SeminarsPage";
import { UsersPage } from "@/pages/UsersPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsListPage />} />
          <Route path="/reports/new" element={<ReportFormPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          <Route path="/reports/:id/edit" element={<ReportFormPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/seminars" element={<SeminarsPage />} />

          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
