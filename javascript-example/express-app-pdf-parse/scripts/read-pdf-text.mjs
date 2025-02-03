import fs from "node:fs/promises";
import path from "node:path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// const file = "mal";
const file = "mal-bisa_credit_statement";

async function extractTextFromPDF(pdfPath) {
  const pdfData = await fs.readFile(pdfPath);
  const pdfDataArray = new Uint8Array(pdfData);
  const pdfDocument = await pdfjsLib.getDocument({
    data: pdfDataArray,
    standardFontDataUrl: path.join(
      import.meta.dirname,
      "node_modules/pdfjs-dist/standard_fonts/"
    ),
  }).promise;

  let extractedText = "";

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    extractedText += pageText + "\n";
  }

  return extractedText;
}

async function main() {
  const pdfPath = `./uploads/${file}.pdf`;
  const text = await extractTextFromPDF(pdfPath);
  console.log(text);
}

main().catch(console.error);
