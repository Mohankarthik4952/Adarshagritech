import fs from "fs";
import path from "path";
import os from "os";

import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";

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

    /* =========================
       LOCALHOST vs RENDER
    ========================= */

    const isRender =
      process.env.RENDER || process.env.NODE_ENV === "production";

    if (isRender) {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      browser = await puppeteer.launch({
        executablePath:
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",

        headless: true,

        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

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
