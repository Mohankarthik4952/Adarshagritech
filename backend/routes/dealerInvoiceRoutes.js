import express from "express";
import Invoice from "../models/Invoice.js";

import { protect, dealerOnly } from "../middleware/authMiddleware.js";

import generateInvoicePdf from "../utils/generateInvoicePdf.js";

const router = express.Router();

/* =================================
   RECALCULATE INVOICE VALUES
================================= */

const recalculateInvoice = (invoice) => {
  const grandTotal = Number(invoice.grandTotal || 0);

  const paidAmount = Number(invoice.paidAmount || 0);

  const returnAdjustedAmount = Number(invoice.returnAdjustedAmount || 0);

  const balanceAmount = Math.max(
    grandTotal - paidAmount - returnAdjustedAmount,
    0,
  );

  let invoiceStatus = "UNPAID";
  let paymentStatus = "PENDING";

  if (balanceAmount <= 0) {
    invoiceStatus = "PAID";
    paymentStatus = "RECEIVED";
  } else if (paidAmount > 0) {
    invoiceStatus = "PARTIALLY_PAID";
    paymentStatus = "PARTIAL";
  }

  return {
    ...invoice,

    subTotal: Number(invoice.subTotal || 0),

    grandTotal,

    paidAmount,

    returnAdjustedAmount,

    balanceAmount,

    invoiceStatus,

    paymentStatus,

    items: invoice.items || [],
  };
};

/* =================================
   GET DEALER TOTAL OUTSTANDING
================================= */

const getDealerOutstandingAmount = async (dealerId) => {
  const invoices = await Invoice.find({
    userId: dealerId,
    role: "DEALER",
    invoiceType: "FINAL",
    balanceAmount: { $gt: 0 },
  }).lean();

  return invoices.reduce(
    (sum, invoice) => sum + Number(invoice.balanceAmount || 0),
    0,
  );
};

/* =================================
   GET ALL DEALER INVOICES
================================= */

router.get("/", protect, dealerOnly, async (req, res) => {
  try {
    const invoices = await Invoice.find({
      userId: req.user.id,
      role: "DEALER",
    })
      .sort({ createdAt: -1 })
      .lean();

    const updatedInvoices = invoices.map(recalculateInvoice);

    const finalInvoices = updatedInvoices.filter(
      (invoice) => invoice.invoiceType === "FINAL",
    );

    const totalOutstandingAmount = finalInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.balanceAmount || 0),
      0,
    );

    const pendingBills = finalInvoices.filter(
      (invoice) => Number(invoice.balanceAmount || 0) > 0,
    ).length;

    return res.status(200).json({
      success: true,

      count: updatedInvoices.length,

      totalOutstandingAmount: Number(totalOutstandingAmount.toFixed(2)),

      pendingBills,

      invoices: updatedInvoices,
    });
  } catch (error) {
    console.error("GET DEALER INVOICES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load invoices",
    });
  }
});

/* =================================
   GET SINGLE DEALER INVOICE
================================= */

router.get("/:id", protect, dealerOnly, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user.id,
      role: "DEALER",
    }).lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,

      invoice: recalculateInvoice(invoice),
    });
  } catch (error) {
    console.error("GET DEALER INVOICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load invoice",
    });
  }
});

/* =================================
   DOWNLOAD DEALER INVOICE PDF
================================= */

router.get("/:id/download", protect, dealerOnly, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user.id,
      role: "DEALER",
    }).lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const formattedInvoice = recalculateInvoice(invoice);

    const totalOutstandingAmount = await getDealerOutstandingAmount(
      req.user.id,
    );

    const pdfUrl = await generateInvoicePdf(
      formattedInvoice,
      Number(totalOutstandingAmount.toFixed(2)),
    );

    await Invoice.findByIdAndUpdate(invoice._id, {
      pdfUrl,
      balanceAmount: formattedInvoice.balanceAmount,
      invoiceStatus: formattedInvoice.invoiceStatus,
      paymentStatus: formattedInvoice.paymentStatus,
    });

    return res.status(200).json({
      success: true,
      pdfUrl,
    });
  } catch (error) {
    console.error("DOWNLOAD DEALER INVOICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate invoice PDF",
    });
  }
});

export default router;
