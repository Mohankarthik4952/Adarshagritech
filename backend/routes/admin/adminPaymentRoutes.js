import express from "express";
import Payment from "../../models/Payment.js";
import Order from "../../models/Order.js";
import Invoice from "../../models/Invoice.js";
import Dealer from "../../models/Dealer.js";
import { protect, adminOnly } from "../../middleware/authMiddleware.js";
import generateInvoicePdf from "../../utils/generateInvoicePdf.js";

const router = express.Router();

/* =================================
   GET ALL PAYMENTS
================================= */

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const filter = {};

    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }

      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);

        filter.createdAt.$lte = endDate;
      }
    }

    const payments = await Payment.find(filter)
      .populate("orderId")
      .sort({ createdAt: -1 });

    console.log("================================");
    console.log("ADMIN USER:", req.user.id);
    console.log("TRANSACTIONS FOUND:", payments.length);
    console.log("================================");

    return res.status(200).json({
      success: true,

      count: payments.length,

      payments,

      transactions: payments,
    });
  } catch (error) {
    console.error("GET TRANSACTIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load transactions",
    });
  }
});

/* =================================
   APPROVE PAYMENT
================================= */

router.put("/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Payment already approved",
      });
    }

    if (payment.status === "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Payment already rejected",
      });
    }

    payment.status = "APPROVED";
    payment.approvedAt = new Date();

    await payment.save();

    /* =================================
   OUTSTANDING PAYMENT
================================= */

    if (payment.paymentCategory === "OUTSTANDING_PAYMENT") {
      let remainingAmount = Number(payment.amount || 0);

      const invoices = await Invoice.find({
        userId: payment.userId,
        role: "DEALER",
        invoiceType: "FINAL",
        balanceAmount: { $gt: 0 },
      }).sort({ createdAt: 1 });

      for (const invoice of invoices) {
        if (remainingAmount <= 0) break;

        const currentBalance = Number(invoice.balanceAmount || 0);

        const adjustedAmount = Math.min(currentBalance, remainingAmount);

        invoice.paidAmount = Number(invoice.paidAmount || 0) + adjustedAmount;

        invoice.balanceAmount = Math.max(
          Number(invoice.grandTotal || 0) -
            Number(invoice.paidAmount || 0) -
            Number(invoice.returnAdjustedAmount || 0),
          0,
        );

        if (invoice.balanceAmount <= 0) {
          invoice.paymentStatus = "RECEIVED";
          invoice.invoiceStatus = "PAID";
          invoice.isLocked = true;
        } else {
          invoice.paymentStatus = "PARTIAL";
          invoice.invoiceStatus = "PARTIALLY_PAID";
          invoice.isLocked = false;
        }

        invoice.paymentDate = new Date();

        await invoice.save();

        if (invoice.orderId) {
          await Order.findByIdAndUpdate(invoice.orderId, {
            paidAmount: invoice.paidAmount,
            balanceAmount: invoice.balanceAmount,
            paymentStatus: invoice.paymentStatus,
            verifiedAt: new Date(),
          });
        }

        remainingAmount -= adjustedAmount;
      }

      return res.status(200).json({
        success: true,
        message: "Outstanding payment approved successfully",
      });
    }

    /* =================================
       SINGLE ORDER PAYMENT
    ================================= */

    const order = await Order.findById(payment.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paidAmount =
      Number(order.paidAmount || 0) + Number(payment.amount || 0);

    order.balanceAmount = Math.max(
      Number(order.totalAmount || 0) -
        Number(order.paidAmount || 0) -
        Number(order.returnAdjustedAmount || 0),
      0,
    );

    order.verifiedAt = new Date();

    order.paymentStatus = order.balanceAmount <= 0 ? "RECEIVED" : "PARTIAL";

    if (order.role === "DEALER") {
      order.status = "COMPLETED";
      order.deliveryStatus = "Delivered";
    } else if (order.status === "PLACED") {
      order.status = "PROCESSING";
    }

    await order.save();

    let invoice = await Invoice.findOne({
      orderId: order._id,
    });

    /* =================================
       CREATE INVOICE IF MISSING
    ================================= */

    if (
      !invoice &&
      (order.paymentType === "PAY_NOW" || order.paymentType === "PAY_CASH")
    ) {
      let invoiceNo;
      let exists = true;

      while (exists) {
        invoiceNo = `INV-${Date.now()}-${Math.floor(
          1000 + Math.random() * 9000,
        )}`;

        exists = await Invoice.exists({ invoiceNo });
      }

      invoice = await Invoice.create({
        invoiceNo,

        invoiceType: "FINAL",

        paymentType: order.paymentType,

        orderId: order._id,

        orderNo: order.orderNo,

        userId: order.userId,

        role: order.role,

        dealerName: order.dealerName || "",
        shopName: order.shopName || "",
        dealerGSTNumber: order.dealerGSTNumber || "",
        dealerPhoneNumber: order.dealerPhoneNumber || "",

        customerName: order.customerName || "",
        customerPhoneNumber: order.customerPhoneNumber || "",

        customerVillage: order.customerVillage || "",
        customerPincode: order.customerPincode || "",
        customerNearBusStand: order.customerNearBusStand || "",

        items: (order.items || []).map((item) => ({
          productId: item.productId,

          productName: item.productName || item.name || "Unknown Product",

          size: item.size || "",

          quantity: Number(
            item.totalBottles || item.quantity || item.cases || 1,
          ),

          mrp: Number(item.pricePerBottle || item.mrp || 0),

          discount: Number(item.discountPercent || item.discount || 0),

          gstPercent: Number(item.gstPercent || 0),

          gstAmount: Number(item.gstAmount || 0),

          finalPrice: Number(
            item.finalPrice || item.totalPrice || item.price || 0,
          ),
        })),

        subTotal: Number(order.totalAmount || 0),

        grandTotal: Number(order.totalAmount || 0),

        paidAmount: Number(order.paidAmount || 0),

        balanceAmount: Number(order.balanceAmount || 0),

        paymentStatus: order.balanceAmount <= 0 ? "RECEIVED" : "PARTIAL",

        invoiceStatus: order.balanceAmount <= 0 ? "PAID" : "PARTIALLY_PAID",

        paymentDate: order.balanceAmount <= 0 ? new Date() : null,

        isLocked: order.balanceAmount <= 0,
      });

      const pdfUrl = await generateInvoicePdf(invoice.toObject());

      invoice.pdfUrl = pdfUrl;

      await invoice.save();

      order.invoiceGenerated = true;
      order.invoiceId = invoice._id;
      order.invoiceNumber = invoice.invoiceNo;

      await order.save();
    }

    if (!invoice) {
      return res.status(400).json({
        success: false,
        message: "Invoice not found",
      });
    }

    invoice.paidAmount = Number(order.paidAmount || 0);

    invoice.balanceAmount = Math.max(
      Number(order.totalAmount || 0) -
        Number(order.paidAmount || 0) -
        Number(order.returnAdjustedAmount || 0),
      0,
    );

    invoice.paymentStatus = invoice.balanceAmount <= 0 ? "RECEIVED" : "PARTIAL";

    invoice.invoiceStatus =
      invoice.balanceAmount <= 0 ? "PAID" : "PARTIALLY_PAID";

    invoice.paymentDate = invoice.balanceAmount <= 0 ? new Date() : null;

    invoice.isLocked = invoice.balanceAmount <= 0;

    await invoice.save();

    order.invoiceGenerated = true;
    order.invoiceId = invoice._id;
    order.invoiceNumber = invoice.invoiceNo;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment approved successfully",
    });
  } catch (error) {
    console.error("APPROVE PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Approval failed",
    });
  }
});

/* =================================
   REJECT PAYMENT
================================= */

router.put("/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }
    if (payment.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Approved payments cannot be rejected",
      });
    }

    if (payment.status === "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Payment already rejected",
      });
    }

    payment.status = "REJECTED";
    payment.rejectionReason = rejectionReason || "";

    await payment.save();

    if (payment.orderId) {
      const order = await Order.findById(payment.orderId);

      if (order) {
        order.paymentStatus =
          Number(order.paidAmount || 0) > 0 ? "PARTIAL" : "PENDING";
        order.rejectionReason = rejectionReason || "";

        // Do NOT reject the order itself.
        // Dealer can submit payment again.

        await order.save();

        const invoice = payment.invoiceId
          ? await Invoice.findById(payment.invoiceId)
          : await Invoice.findOne({
              orderId: order._id,
            });

        if (invoice) {
          invoice.paymentStatus = "REJECTED";

          invoice.invoiceStatus =
            Number(invoice.paidAmount || 0) > 0 ? "PARTIALLY_PAID" : "UNPAID";

          invoice.isLocked = invoice.balanceAmount <= 0;

          await invoice.save();
        }
      }
    }

    console.log("PAYMENT REJECTED:", payment._id.toString());

    res.status(200).json({
      success: true,
      message: "Payment rejected successfully",
    });
  } catch (error) {
    console.error("REJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Rejection failed",
    });
  }
});

export default router;
