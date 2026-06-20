import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

import generateInvoiceHtml from "./generateInvoiceHtml.js";

const generateInvoicePdf = async (invoice, totalOutstandingAmount = 0) => {
  let browser;

  try {
    const invoicesDir = path.join(process.cwd(), "uploads", "invoices");

    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, {
        recursive: true,
      });
    }

    const safeInvoiceNo = String(
      invoice.invoiceNo || `INV-${Date.now()}`,
    ).replace(/[^\w-]/g, "_");

    const fileName = `${safeInvoiceNo}.pdf`;

    const filePath = path.join(invoicesDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    browser = await puppeteer.launch({
      headless: "new",

      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1440,
      height: 2000,
      deviceScaleFactor: 2,
    });

    const html = generateInvoiceHtml(invoice, totalOutstandingAmount);

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    await page.emulateMediaType("screen");

    await page.pdf({
      path: filePath,

      format: "A4",

      printBackground: true,

      preferCSSPageSize: true,

      margin: {
        top: "15mm",
        right: "15mm",
        bottom: "15mm",
        left: "15mm",
      },
    });

    return `/uploads/invoices/${fileName}`;
  } catch (error) {
    console.error("PDF GENERATION ERROR:", error);

    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export default generateInvoicePdf;
