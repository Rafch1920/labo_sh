import jsPDF from "jspdf";
import QRCode from "qrcode";

export type ReportData = {
  requestId: string;
  requestCode: string;
  patientName: string;
  patientDob: string;
  patientGender: string;
  patientEmail: string;
  physicianName: string;
  physicianEmail: string;
  analysisDate: string;
  analysisResults: string;
  conclusion: string;
  medicalRemarks: string;
  signatureUrl: string;
};

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return d;
  }
}

export async function generateReportPdf(
  data: ReportData,
  siteUrl: string
): Promise<Blob> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;

  // ── QR Code ──
  const trackUrl = `${siteUrl}/admin/track/${data.requestId}`;
  const qrDataUrl = await QRCode.toDataURL(trackUrl, {
    width: 120,
    margin: 1,
    color: { dark: "#1e293b", light: "#ffffff" },
  });

  // ── Header ──
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageW, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Marrakchi LAB", margin, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Laboratoire d'analyse — Lithiase rénale", margin, 24);
  doc.text(`N° demande : ${data.requestCode}`, margin, 31);
  doc.text(`Date d'émission : ${formatDate(data.analysisDate)}`, margin, 38);

  // QR code at top right
  doc.addImage(qrDataUrl, "PNG", pageW - margin - 32, 5, 32, 32);

  // ── Patient info ──
  let y = 56;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Informations patient", margin, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const patientLines = [
    `Nom : ${data.patientName}`,
    `Date de naissance : ${formatDate(data.patientDob)}`,
    `Sexe : ${data.patientGender === "male" ? "Homme" : "Femme"}`,
    `Email : ${data.patientEmail || "—"}`,
  ];
  for (const line of patientLines) {
    doc.text(line, margin, y);
    y += 5;
  }

  // ── Physician info ──
  y += 3;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Médecin prescripteur", margin, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nom : ${data.physicianName}`, margin, y);
  y += 5;
  if (data.physicianEmail) {
    doc.text(`Email : ${data.physicianEmail}`, margin, y);
    y += 5;
  }

  // ── Analysis results ──
  y += 3;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Résultats d'analyse", margin, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const resultsLines = doc.splitTextToSize(data.analysisResults || "Aucun résultat saisi.", contentW);
  for (const line of resultsLines) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 5;
  }

  // ── Conclusion ──
  if (data.conclusion) {
    y += 3;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Conclusion", margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const conclusionLines = doc.splitTextToSize(data.conclusion, contentW);
    for (const line of conclusionLines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += 5;
    }
  }

  // ── Medical remarks ──
  if (data.medicalRemarks) {
    y += 3;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Remarques médicales", margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const remarksLines = doc.splitTextToSize(data.medicalRemarks, contentW);
    for (const line of remarksLines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += 5;
    }
  }

  // ── Signature ──
  y = Math.max(y + 8, 245);
  if (y > 260) { doc.addPage(); y = 20; }

  const sigW = 50;
  const sigH = 20;
  const sigX = pageW - margin - sigW;
  const sigY = y;

  if (data.signatureUrl) {
    try {
      doc.addImage(data.signatureUrl, "PNG", sigX, sigY, sigW, sigH);
    } catch {
      // fallback: draw placeholder
      doc.setDrawColor(100, 116, 139);
      doc.setLineWidth(0.5);
      doc.rect(sigX, sigY, sigW, sigH);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Signature", sigX + sigW / 2, sigY + sigH / 2 + 2, { align: "center" });
    }
  } else {
    // placeholder box
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.5);
    doc.rect(sigX, sigY, sigW, sigH);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Signature", sigX + sigW / 2, sigY + sigH / 2 + 2, { align: "center" });
  }

  // Signature label
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Signature du laboratoire", sigX, sigY - 3);

  // ── Footer ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} / ${pageCount} — Document généré le ${new Date().toLocaleString("fr-FR")}`,
      margin,
      290,
      { align: "center" }
    );
  }

  return doc.output("blob");
}
