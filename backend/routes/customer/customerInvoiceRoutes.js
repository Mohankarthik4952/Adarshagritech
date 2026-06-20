import express from "express";

import Invoice from "../../models/Invoice.js";
import Customer from "../../models/Customer.js";

import { protect, customerOnly } from "../../middleware/authMiddleware.js";

import generateInvoicePdf from "../../utils/generateInvoicePdf.js";

const router = express.Router();

/* =================================
   GET ALL CUSTOMER INVOICES
================================= */

router.get("/", protect, customerOnly, async (req, res) => {
  try {
    console.log("================================");
    console.log("CUSTOMER INVOICES ROUTE HIT");
    console.log("CUSTOMER ID:", req.user.id);
    console.log("================================");

    const customer = await Customer.findById(req.user.id).lean();

    const invoices = await Invoice.find({
      userId: req.user.id,
      role: "CUSTOMER",
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedInvoices = invoices.map((invoice) => ({
      ...invoice,

      customerName: invoice.customerName || customer?.name || "",

      customerPhoneNumber: invoice.customerPhoneNumber || customer?.phone || "",

      customerVillage: invoice.customerVillage || customer?.village || "",

      customerPincode: invoice.customerPincode || customer?.pincode || "",

      customerNearBusStand:
        invoice.customerNearBusStand || customer?.nearBusStand || "",
    }));

    console.log("TOTAL CUSTOMER INVOICES:", formattedInvoices.length);

    if (formattedInvoices.length > 0) {
      console.log(
        "LATEST CUSTOMER INVOICE:",
        formattedInvoices[0].invoiceNo,
        formattedInvoices[0]._id.toString(),
      );
    }

    return res.status(200).json({
      success: true,
      count: formattedInvoices.length,
      invoices: formattedInvoices,
    });
  } catch (error) {
    console.error("CUSTOMER INVOICES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load invoices",
    });
  }
});

/* =================================
   GET SINGLE CUSTOMER INVOICE
================================= */

router.get("/:id", protect, customerOnly, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).lean();

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user.id,
      role: "CUSTOMER",
    }).lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const formattedInvoice = {
      ...invoice,

      customerName: invoice.customerName || customer?.name || "",

      customerPhoneNumber: invoice.customerPhoneNumber || customer?.phone || "",

      customerVillage: invoice.customerVillage || customer?.village || "",

      customerPincode: invoice.customerPincode || customer?.pincode || "",

      customerNearBusStand:
        invoice.customerNearBusStand || customer?.nearBusStand || "",
    };

    return res.status(200).json({
      success: true,
      invoice: formattedInvoice,
    });
  } catch (error) {
    console.error("CUSTOMER INVOICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load invoice",
    });
  }
});

/* =================================
   DOWNLOAD CUSTOMER INVOICE PDF
================================= */

router.get("/:id/download", protect, customerOnly, async (req, res) => {
  try {
    console.log("================================");
    console.log("DOWNLOAD CUSTOMER INVOICE");
    console.log("INVOICE ID:", req.params.id);
    console.log("CUSTOMER ID:", req.user.id);
    console.log("================================");

    const customer = await Customer.findById(req.user.id).lean();

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user.id,
      role: "CUSTOMER",
    }).lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const invoiceData = {
      ...invoice,

      customerName: invoice.customerName || customer?.name || "",

      customerPhoneNumber: invoice.customerPhoneNumber || customer?.phone || "",

      customerVillage: invoice.customerVillage || customer?.village || "",

      customerPincode: invoice.customerPincode || customer?.pincode || "",

      customerNearBusStand:
        invoice.customerNearBusStand || customer?.nearBusStand || "",
    };

    return generateInvoicePdf(invoiceData, res);
  } catch (error) {
    console.error("DOWNLOAD CUSTOMER INVOICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate PDF",
    });
  }
});

export default router;
