import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function exportPdf(opts: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(opts.title, 14, 16);
  autoTable(doc, {
    head: [opts.headers],
    body: opts.rows.map((r) => r.map((c) => String(c))),
    startY: 22,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 118, 110] },
  });
  doc.save(opts.filename.endsWith(".pdf") ? opts.filename : opts.filename + ".pdf");
}

export function exportExcel(opts: {
  sheetName: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}) {
  const ws = XLSX.utils.aoa_to_sheet([opts.headers, ...opts.rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, opts.sheetName.slice(0, 30));
  XLSX.writeFile(wb, opts.filename.endsWith(".xlsx") ? opts.filename : opts.filename + ".xlsx");
}
