import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generatePDF(content: string, fileName: string): Promise<string> {
  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join("public", "pdfs", `${fileName}.pdf`);

  // Cria a pasta se não existir
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  // Escreve o conteúdo no PDF
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("Travel Guide", { align: "center" }).moveDown();
  doc.fontSize(12).text(content, { align: "left" });

  doc.end();

  return filePath;
}
