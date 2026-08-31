import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function AppLayout() {
  return (
    <div dir="rtl" className="flex min-h-screen w-full">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        <main className="page-enter container flex-1 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
