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

export function exportFamilyPaymentPdf(opts: {
  familyName: string;
  familyHead: string;
  familyPhone: string;
  familyAddress: string;
  totalPaid: number;
  totalMonthly: number;
  totalSpecial: number;
  lastContribution: string;
  paymentsByYear: Record<string, any[]>;
  filename: string;
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Guzair and Batwash Welfare Association", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Welfare Fund Management System", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 10;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Payment History - ${opts.familyName}`, pageWidth / 2, yPosition, { align: "center" });

  yPosition += 10;

  // Family Information
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Family Information", 14, yPosition);
  yPosition += 6;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Name: ${opts.familyName}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Head of Family: ${opts.familyHead}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Phone: ${opts.familyPhone}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Address: ${opts.familyAddress}`, 14, yPosition);
  yPosition += 10;

  // Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Payment Summary", 14, yPosition);
  yPosition += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Total Paid: Rs. ${opts.totalPaid.toLocaleString("en-PK")}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Monthly Collections: Rs. ${opts.totalMonthly.toLocaleString("en-PK")}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Special Collections: Rs. ${opts.totalSpecial.toLocaleString("en-PK")}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Last Contribution: ${opts.lastContribution}`, 14, yPosition);
  yPosition += 10;

  // Payment History by Year
  const years = Object.keys(opts.paymentsByYear).sort();
  
  for (const year of years) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(year, 14, yPosition);
    yPosition += 3;
    
    const yearPayments = opts.paymentsByYear[year];
    const tableRows = yearPayments.map((p) => {
      const row: (string | number)[] = [
        p.date,
        p.type === "monthly" ? "Monthly" : "Special Collection",
        `Rs. ${p.amount.toLocaleString("en-PK")}`,
      ];
      if (p.type === "monthly" && p.monthsCovered && p.monthsCovered.length > 0) {
        row.push(p.monthsCovered.join(", "));
      } else {
        row.push("");
      }
      if (p.relatedEvent) {
        row.push(p.relatedEvent);
      } else {
        row.push("");
      }
      if (p.notes) {
        row.push(p.notes);
      } else {
        row.push("");
      }
      return row;
    });

    autoTable(doc, {
      head: [["Date", "Type", "Amount", "Details", "Related Event", "Notes"]],
      body: tableRows,
      startY: yPosition,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 118, 110] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;
  }

  // Footer
  const now = new Date();
  const generatedDate = now.toLocaleDateString("en-GB");
  const generatedTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated Date: ${generatedDate}`, 14, 285);
  doc.text(`Generated Time: ${generatedTime}`, 14, 289);
  doc.text("Welfare Fund Management System", pageWidth / 2, 285, { align: "center" });
  doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - 14, 285, { align: "right" });

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
