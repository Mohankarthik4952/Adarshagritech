import express from "express";
import PDFDocument from "pdfkit";
import Invoice from "../models/Invoice.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =================================
   DOWNLOAD INVOICE PDF
================================= */

router.get("/:id/download", protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNo}.pdf`,
    );

    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    /* =========================
       COMPANY HEADER
    ========================= */

    doc.fontSize(22).text("SUNRISE AGRI PRODUCTS", {
      align: "center",
    });

    doc.moveDown(0.5);

    doc.fontSize(18).text("INVOICE", {
      align: "center",
    });

    doc.moveDown();

    /* =========================
       INVOICE DETAILS
    ========================= */

    doc.fontSize(11);

    doc.text(`Invoice No : ${invoice.invoiceNo}`);
    doc.text(`Order No   : ${invoice.orderNo}`);
    doc.text(`Type       : ${invoice.invoiceType}`);
    doc.text(
      `Date       : ${new Date(invoice.createdAt).toLocaleDateString()}`,
    );

    doc.moveDown();

    /* =========================
       FROM / TO
    ========================= */

    doc.fontSize(13).text("FROM");

    doc.fontSize(11);
    doc.text(invoice.companyName || "Sunrise Agri Products");
    doc.text(`GST : ${invoice.companyGSTNumber || "-"}`);

    doc.moveDown();

    if (invoice.role === "DEALER") {
      doc.fontSize(13).text("TO");

      doc.fontSize(11);
      doc.text(
        `Dealer Name : ${invoice.dealerName || invoice.shopName || "-"}`,
      );

      doc.text(`Shop Name : ${invoice.shopName || "-"}`);

      doc.text(`GST Number : ${invoice.dealerGSTNumber || "-"}`);

      doc.text(`Phone : ${invoice.dealerPhoneNumber || "-"}`);
    } else {
      doc.fontSize(13).text("TO");

      doc.fontSize(11);

      doc.text(`Customer Name : ${invoice.customerName || "-"}`);

      doc.text(`Phone : ${invoice.customerPhoneNumber || "-"}`);
    }

    doc.moveDown();

    /* =========================
       PRODUCT TABLE HEADER
    ========================= */

    let tableTop = doc.y + 10;

    doc.fontSize(10);

    doc.text("S.No", 40, tableTop);

    doc.text("Product", 80, tableTop);

    doc.text("Size", 220, tableTop);

    doc.text("Qty", 300, tableTop);

    doc.text("Discount", 350, tableTop);

    doc.text("Final Price", 450, tableTop);

    doc
      .moveTo(40, tableTop + 15)
      .lineTo(560, tableTop + 15)
      .stroke();

    let rowY = tableTop + 25;

    /* =========================
       PRODUCTS
    ========================= */

    (invoice.items || []).forEach((item, index) => {
      doc.text(index + 1, 40, rowY);

      doc.text(item.productName || "-", 80, rowY, {
        width: 120,
      });

      doc.text(item.size || "-", 220, rowY);

      doc.text(String(item.quantity || 1), 300, rowY);

      doc.text(`${item.discount || 0}%`, 350, rowY);

      doc.text(`₹${Number(item.finalPrice || 0).toLocaleString()}`, 450, rowY);

      rowY += 25;
    });

    doc.moveDown(2);

    /* =========================
       TOTAL
    ========================= */

    doc.moveTo(40, rowY).lineTo(560, rowY).stroke();

    rowY += 20;

    doc.fontSize(14);

    doc.text(
      `Grand Total : ₹${Number(invoice.grandTotal || 0).toLocaleString()}`,
      350,
      rowY,
    );

    rowY += 50;

    /* =========================
       FOOTER
    ========================= */

    doc.fontSize(11);

    doc.text("Thank you for choosing Sunrise Agri Products.", {
      align: "center",
    });

    doc.text("Sunrise Agri Products © 2014", {
      align: "center",
    });

    doc.end();
  } catch (error) {
    console.error("PDF ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
    });
  }
});

export default router;
