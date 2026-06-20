import express from "express";

import Invoice from "../../models/Invoice.js";
import Order from "../../models/Order.js";
import Customer from "../../models/Customer.js";

import generateInvoicePdf from "../../utils/generateInvoicePdf.js";

import { protect, adminOnly } from "../../middleware/authMiddleware.js";

const router = express.Router();

/* =================================
   GET ALL INVOICES
================================= */

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const rawInvoices = await Invoice.find()
      .populate("orderId")
      .sort({ createdAt: -1 })
      .lean();

    const invoices = await Promise.all(
      rawInvoices.map(async (invoice) => {
        if (invoice.role !== "CUSTOMER") {
          return invoice;
        }

        const customer = await Customer.findById(invoice.userId).lean();

        return {
          ...invoice,

          customerName: invoice.customerName || customer?.name || "",

          customerPhoneNumber:
            invoice.customerPhoneNumber || customer?.phone || "",

          customerVillage: invoice.customerVillage || customer?.village || "",

          customerPincode: invoice.customerPincode || customer?.pincode || "",

          customerNearBusStand:
            invoice.customerNearBusStand || customer?.nearBusStand || "",
        };
      }),
    );

    return res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("GET INVOICES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load invoices",
    });
  }
});

/* =================================
   GET SINGLE INVOICE
================================= */

router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("orderId")
      .lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    let formattedInvoice = invoice;

    if (invoice.role === "CUSTOMER") {
      const customer = await Customer.findById(invoice.userId).lean();

      formattedInvoice = {
        ...invoice,

        customerName: invoice.customerName || customer?.name || "",

        customerPhoneNumber:
          invoice.customerPhoneNumber || customer?.phone || "",

        customerVillage: invoice.customerVillage || customer?.village || "",

        customerPincode: invoice.customerPincode || customer?.pincode || "",

        customerNearBusStand:
          invoice.customerNearBusStand || customer?.nearBusStand || "",
      };
    }

    return res.status(200).json({
      success: true,
      invoice: formattedInvoice,
    });
  } catch (error) {
    console.error("GET INVOICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load invoice",
    });
  }
});

/* =================================
   UPDATE INVOICE
================================= */

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const {
      companyGSTNumber,
      companyPhoneNumber,
      companyAddress,
      bankDetails,
      items,
    } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (invoice.isLocked) {
      return res.status(400).json({
        success: false,
        message: "Paid invoice cannot be edited",
      });
    }

    /* =========================
       SYNC CUSTOMER DETAILS
    ========================= */

    if (invoice.role === "CUSTOMER") {
      const customer = await Customer.findById(invoice.userId);

      if (customer) {
        invoice.customerName = customer.name || "";
        invoice.customerPhoneNumber = customer.phone || "";
        invoice.customerVillage = customer.village || "";
        invoice.customerPincode = customer.pincode || "";
        invoice.customerNearBusStand = customer.nearBusStand || "";
      }
    }

    /* =========================
       UPDATE ITEMS
    ========================= */

    if (Array.isArray(items) && items.length > 0) {
      invoice.items = items;

      const subTotal = items.reduce(
        (sum, item) => sum + Number(item.finalPrice || 0),
        0,
      );

      invoice.subTotal = Number(subTotal.toFixed(2));

      invoice.grandTotal = Number(subTotal.toFixed(2));

      invoice.balanceAmount = Math.max(
        Number(invoice.grandTotal || 0) - Number(invoice.paidAmount || 0),
        0,
      );
    }

    /* =========================
       UPDATE COMPANY DETAILS
    ========================= */

    if (companyGSTNumber !== undefined) {
      invoice.companyGSTNumber = companyGSTNumber;
    }

    if (companyPhoneNumber !== undefined) {
      invoice.companyPhoneNumber = companyPhoneNumber;
    }

    if (companyAddress !== undefined) {
      invoice.companyAddress = companyAddress;
    }

    if (bankDetails !== undefined) {
      invoice.bankDetails = bankDetails;
    }

    /* =========================
       UPDATE PAYMENT STATUS
    ========================= */

    if (invoice.balanceAmount <= 0) {
      invoice.invoiceStatus = "PAID";
      invoice.paymentStatus = "RECEIVED";
      invoice.isLocked = true;
    } else if (invoice.paidAmount > 0) {
      invoice.invoiceStatus = "PARTIALLY_PAID";
      invoice.paymentStatus = "PARTIAL";
      invoice.isLocked = false;
    } else {
      invoice.invoiceStatus = "UNPAID";
      invoice.paymentStatus = "PENDING";
      invoice.isLocked = false;
    }

    await invoice.save();

    const pdfUrl = await generateInvoicePdf(invoice.toObject());

    invoice.pdfUrl = pdfUrl;

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    console.error("UPDATE INVOICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update invoice",
    });
  }
});

/* =================================
   DELETE INVOICE
================================= */

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (invoice.isLocked) {
      return res.status(400).json({
        success: false,
        message: "Paid invoice cannot be deleted",
      });
    }

    await invoice.deleteOne();

    if (invoice.orderId) {
      await Order.findByIdAndUpdate(invoice.orderId, {
        invoiceGenerated: false,
        invoiceId: null,
        invoiceNumber: "",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("DELETE INVOICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete invoice",
    });
  }
});

/* =================================
   DOWNLOAD INVOICE PDF
================================= */

router.get("/:id/download", protect, adminOnly, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    let invoiceData = invoice;

    if (invoice.role === "CUSTOMER") {
      const customer = await Customer.findById(invoice.userId).lean();

      invoiceData = {
        ...invoice,

        customerName: invoice.customerName || customer?.name || "",

        customerPhoneNumber:
          invoice.customerPhoneNumber || customer?.phone || "",

        customerVillage: invoice.customerVillage || customer?.village || "",

        customerPincode: invoice.customerPincode || customer?.pincode || "",

        customerNearBusStand:
          invoice.customerNearBusStand || customer?.nearBusStand || "",
      };
    }

    let pdfUrl = invoice.pdfUrl;

    if (!pdfUrl) {
      pdfUrl = await generateInvoicePdf(invoiceData);

      await Invoice.findByIdAndUpdate(invoice._id, {
        pdfUrl,
      });
    }

    return res.status(200).json({
      success: true,
      pdfUrl,
    });
  } catch (error) {
    console.error("DOWNLOAD INVOICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate invoice PDF",
    });
  }
});

export default router;
