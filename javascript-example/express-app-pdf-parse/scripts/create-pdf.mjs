import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function createBisaCreditStatement(customerName, customerAddress, salaryIncome, bills) {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const logoBytes = await fs.readFile(path.join(import.meta.dirname, 'placeholder_logo.png'));
  const logoImage = await pdfDoc.embedPng(logoBytes);

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  const fontSize = 12;
  const xMargin = 50;
  const yMargin = 50;

  const companyName = "Bisa Credit Statement Company";
  const companyAddress = "42nd Arlington, Cumberland, Rhode Island, United States";
  const statementDate = new Date().toLocaleDateString();

  // Header
  page.drawImage(logoImage, {
    x: xMargin,
    y: height - yMargin - 50,
    width: 100,
    height: 100,
  });

  page.drawText(companyName, {
    x: xMargin + 110, // Adjust x position after logo
    y: height - yMargin - 20,
    font: timesRomanBoldFont,
    size: 16,
  });

  page.drawText(companyAddress, {
    x: xMargin + 110, // Adjust x position after logo
    y: height - yMargin - 40,
    font: timesRomanFont,
    size: fontSize,
  });

  page.drawText(`Statement Date: ${statementDate}`, {
    x: width - xMargin - 150, // Position on the right
    y: height - yMargin - 20,
    font: timesRomanFont,
    size: fontSize,
  });

  // Customer Information
  page.drawText(`Customer Name: ${customerName}`, {
    x: xMargin,
    y: height - yMargin - 80,
    font: timesRomanBoldFont,
    size: fontSize,
  });
  page.drawText(`Customer Address: ${customerAddress}`, {
      x: xMargin,
      y: height - yMargin - 100,
      font: timesRomanFont,
      size: fontSize,
    });

  // Salary Income Table
  page.drawText("Salary Income", { x: xMargin, y: height - yMargin - 140, font: timesRomanBoldFont, size: fontSize });
  drawTable(page, xMargin, height - yMargin - 160, timesRomanFont, fontSize, [
    ["Source", "Amount"],
    ...salaryIncome, // Spread the salary income data
  ]);

  // Bills Table
  page.drawText("Bills", { x: xMargin, y: height - yMargin - 240, font: timesRomanBoldFont, size: fontSize });
  drawTable(page, xMargin, height - yMargin - 260, timesRomanFont, fontSize, [
    ["Bill", "Amount"],
    ...bills, // Spread the bills data
  ]);

  // Total Expenses
  const totalExpenses = bills.reduce((sum, bill) => sum + bill[1], 0);
  page.drawText(`Total Monthly Expenses: $${totalExpenses.toFixed(2)}`, {
    x: xMargin,
    y: height - yMargin - 390, // Adjust position
    font: timesRomanBoldFont,
    size: fontSize,
  });


  const managerSignatureBytes = await fs.readFile(path.join(import.meta.dirname, 'manager_signature.png'));
  const managerSignature = await pdfDoc.embedPng(managerSignatureBytes);

  page.drawImage(managerSignature, {
    x: xMargin,
    y: yMargin,
    width: 100,
    height: 50,
  });

  // Signatory Confirmation
  page.drawText("_____________________________", {
    x: xMargin,
    y: yMargin,
    font: timesRomanFont,
    size: fontSize,
  });
  page.drawText("Mr. Jon Kirsch", {
    x: xMargin,
    y: yMargin - 20,
    font: timesRomanFont,
    size: fontSize,
  });
  page.drawText("Bisa Financial Services", {
    x: xMargin,
    y: yMargin - 40,
    font: timesRomanFont,
    size: fontSize,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

function drawTable(page, x, y, font, fontSize, data) {
  const cellPadding = 5;
  const cellWidths = Array(data[0].length).fill(100); // Default cell widths (adjust as needed)

  for (const row of data) {
    let currentX = x;
    for (let i = 0; i < row.length; i++) {
      const cellText = (typeof row[i] === 'number') ? `$${String(row[i])}` : String(row[i]);
      page.drawText(cellText, {
        x: currentX + cellPadding,
        y: y - cellPadding - fontSize,
        font: font,
        size: fontSize,
      });
      currentX += cellWidths[i]; // Move to the next cell position
    }
    y -= fontSize + 2 * cellPadding; // Move to the next row position
  }
}

async function generateAndSavePdf_Alice() {
  const customerName = "Alice Copperfield";
  const customerAddress = "31337 Baker Street, London, England";
  const salaryIncome = [["Salary", 980]];
  const bills = [
    ["Mortgage", 2500],
    ["Utilities", 400],
    ["Groceries", 600],
    ["Gas", 140],
  ];

  const pdfBytes = await createBisaCreditStatement(customerName, customerAddress, salaryIncome, bills);
  await fs.writeFile(path.join(import.meta.dirname, '../uploads/alice-copperfield-credit-proof.pdf'), pdfBytes);
  console.log('PDF created successfully!');
}

async function generateAndSavePdf_John() {
  const customerName = "John Doe";
  const customerAddress = "123 Anystreet, Uptown, New York";
  const salaryIncome = [["Salary", 5750]];
  const bills = [
    ["Mortgage", 2600],
    ["Utilities", 300],
    ["Groceries", 200],
    ["Gas", 100],
  ];

  const pdfBytes = await createBisaCreditStatement(customerName, customerAddress, salaryIncome, bills);
  await fs.writeFile(path.join(import.meta.dirname, '../uploads/john-doe-credit-proof.pdf'), pdfBytes);
  console.log('PDF created successfully!');
}

await generateAndSavePdf_Alice();
await generateAndSavePdf_John();