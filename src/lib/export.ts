import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Report } from "@/types/database";
import { toJalaliShort } from "@/lib/persian-date";
import { REPORT_STATUSES } from "@/types/database";

function statusLabel(status: Report["status"]) {
  return REPORT_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function exportReportsToExcel(reports: Report[], filename = "گزارشات") {
  const rows = reports.map((r) => ({
    "شماره گزارش": r.report_number,
    عنوان: r.title,
    "نوع گزارش": r.report_type,
    ولایت: r.province,
    ولسوالی: r.district,
    مرکز: r.center_name,
    تاریخ: toJalaliShort(r.report_date),
    وضعیت: statusLabel(r.status),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 16 },
    { wch: 28 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "گزارشات");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export async function exportElementToPdf(elementId: string, filename = "گزارشات") {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#0a0e1e",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
}
