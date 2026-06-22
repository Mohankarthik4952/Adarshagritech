import fs from "fs";
import path from "path";

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

import generateInvoiceHtml from "./generateInvoiceHtml.js";

const generateInvoicePdf = async (invoice, totalOutstandingAmount = 0) => {
  let browser;

  try {
    /* =========================
       CREATE INVOICE DIRECTORY
    ========================= */

    const invoicesDir = path.join(process.cwd(), "uploads", "invoices");

    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, {
        recursive: true,
      });
    }

    /* =========================
       FILE NAME
    ========================= */

    const safeInvoiceNo = String(
      invoice.invoiceNo || `INV-${Date.now()}`,
    ).replace(/[^\w-]/g, "_");

    const fileName = `${safeInvoiceNo}.pdf`;

    const filePath = path.join(invoicesDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    /* =========================
       LAUNCH CHROMIUM
    ========================= */

    browser = await puppeteer.launch({
      args: chromium.args,

      defaultViewport: chromium.defaultViewport,

      executablePath: await chromium.executablePath(),

      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1440,
      height: 2000,
      deviceScaleFactor: 2,
    });

    /* =========================
       GENERATE HTML
    ========================= */

    const html = generateInvoiceHtml(invoice, totalOutstandingAmount);

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    await page.emulateMediaType("screen");

    /* =========================
       GENERATE PDF
    ========================= */

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
    console.error("================================");
    console.error("PDF GENERATION ERROR");
    console.error("MESSAGE:", error.message);
    console.error("STACK:", error.stack);
    console.error("================================");

    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export default generateInvoicePdf;
