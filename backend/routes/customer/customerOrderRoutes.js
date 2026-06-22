import express from "express";

import Order from "../../models/Order.js";
import Payment from "../../models/Payment.js";
import Product from "../../models/Product.js";
import Customer from "../../models/Customer.js";
import Invoice from "../../models/Invoice.js";

import { protect, customerOnly } from "../../middleware/authMiddleware.js";

import generateInvoicePdf from "../../utils/generateInvoicePdf.js";
import { sendOrderNotification } from "../../utils/sendOrderNotification.js";

const router = express.Router();

/* =====================================================
   GENERATE UNIQUE INVOICE NUMBER
===================================================== */

const generateInvoiceNumber = async () => {
  let invoiceNo;
  let exists = true;

  while (exists) {
    invoiceNo = `CUS-INV-${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    exists = await Invoice.exists({ invoiceNo });
  }

  return invoiceNo;
};

/* =====================================================
   GET PRODUCTS FOR CUSTOMER
===================================================== */

router.get("/products", protect, customerOnly, async (req, res) => {
  try {
    const products = await Product.find({
      visibleToCustomers: true,
      isActive: true,
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error("PRODUCT FETCH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load products",
    });
  }
});

/* =====================================================
   PLACE CUSTOMER ORDER
===================================================== */

router.post("/", protect, customerOnly, async (req, res) => {
  try {
    const { products, paymentApp, paymentProof, utrNumber } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products selected",
      });
    }

    if (!paymentProof) {
      return res.status(400).json({
        success: false,
        message: "Payment screenshot is required",
      });
    }

    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const parsedProducts =
      typeof products === "string" ? JSON.parse(products) : products;

    const formattedItems = [];

    let calculatedTotal = 0;

    for (const item of parsedProducts) {
      const product = await Product.findById(item.productId);

      if (!product) continue;

      const selectedSize =
        product.sizes?.find((s) => s.size === item.size) || null;

      if (!selectedSize) continue;

      const mrp = Number(selectedSize.mrp || 0);

      const discountPercent = Number(product.customerDiscountPercent || 0);

      const discountAmount = (mrp * discountPercent) / 100;

      const pricePerBottle = mrp - discountAmount;

      const quantity = Number(item.quantity || item.cases || 1);

      const bottlesPerCase = Number(selectedSize.bottlesPerCase || 1);

      const finalPrice = Number((pricePerBottle * quantity).toFixed(2));

      calculatedTotal += finalPrice;

      formattedItems.push({
        productId: product._id,

        productName: product.name,

        size: selectedSize.size,

        quantity,

        cases: quantity,

        bottlesPerCase,

        mrp,

        pricePerBottle,

        discountPercent,

        gstPercent: Number(product.gstPercent || 0),

        finalPrice,
      });
    }

    if (formattedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products found",
      });
    }

    calculatedTotal = Number(calculatedTotal.toFixed(2));

    const formattedApp =
      paymentApp === "PhonePe"
        ? "PHONEPE"
        : paymentApp === "Google Pay"
          ? "GPAY"
          : "PAYTM";

    const orderNo = `CUS-${Date.now()}`;

    /* =================================
       CREATE ORDER
    ================================= */

    const order = await Order.create({
      orderNo,

      userId: customer._id,

      userModel: "Customer",

      role: "CUSTOMER",

      customerName: customer.name || "",

      customerPhoneNumber: customer.phone || "",

      customerVillage: customer.village || "",

      customerPincode: customer.pincode || "",

      customerNearBusStand: customer.nearBusStand || "",

      items: formattedItems,

      totalAmount: calculatedTotal,

      paidAmount: 0,

      paymentType: "PAY_NOW",

      paymentApp: formattedApp,

      paymentProof,

      utrNumber: utrNumber || "",

      paymentStatus: "VERIFICATION_PENDING",

      status: "PLACED",

      deliveryStatus: "Pending Delivery",

      paymentDate: new Date(),

      invoiceGenerated: false,
    });

    try {
      await sendOrderNotification({
        role: "CUSTOMER",
        customer,
        order,
      });
    } catch (err) {
      console.error("================================");
      console.error("CUSTOMER EMAIL ERROR");
      console.error("MESSAGE:", err.message);
      console.error("STACK:", err.stack);
      console.error("================================");
    }

    /* =================================
       CREATE PAYMENT ENTRY
    ================================= */

    await Payment.create({
      orderId: order._id,

      userId: customer._id,

      role: "CUSTOMER",

      amount: calculatedTotal,

      paymentType: "UPI",

      paymentApp: formattedApp,

      utrNumber: utrNumber || "",

      paymentProof,

      status: "VERIFICATION_PENDING",

      paymentDate: new Date(),
    });

    /* =================================
       CREATE INVOICE
    ================================= */

    const invoiceNo = await generateInvoiceNumber();

    const invoiceItems = formattedItems.map((item) => ({
      productId: item.productId,

      productName: item.productName,

      size: item.size,

      quantity: item.quantity,

      mrp: item.mrp,

      discount: item.discountPercent,

      gstPercent: item.gstPercent || 0,

      gstAmount: 0,

      finalPrice: item.finalPrice,
    }));

    const invoice = await Invoice.create({
      invoiceNo,

      invoiceType: "FINAL",

      orderId: order._id,

      orderNo: order.orderNo,

      userId: customer._id,

      role: "CUSTOMER",

      paymentType: "PAY_NOW",

      customerName: customer.name || "",

      customerPhoneNumber: customer.phone || "",

      customerVillage: customer.village || "",

      customerPincode: customer.pincode || "",

      customerNearBusStand: customer.nearBusStand || "",

      items: invoiceItems,

      subTotal: calculatedTotal,

      grandTotal: calculatedTotal,

      paidAmount: 0,

      balanceAmount: calculatedTotal,

      paymentStatus: "VERIFICATION_PENDING",

      invoiceStatus: "UNPAID",

      isLocked: false,
    });

    const pdfUrl = await generateInvoicePdf(invoice.toObject());

    invoice.pdfUrl = pdfUrl;

    await invoice.save();

    /* =================================
       UPDATE ORDER
    ================================= */

    order.invoiceGenerated = true;

    order.invoiceNumber = invoice.invoiceNo;

    order.invoiceId = invoice._id;

    await order.save();

    console.log("================================");
    console.log("CUSTOMER ORDER CREATED");
    console.log("ORDER NO:", order.orderNo);
    console.log("INVOICE NO:", invoice.invoiceNo);
    console.log("================================");

    return res.status(201).json({
      success: true,
      message: "Order submitted successfully. Waiting for admin verification.",
      order,
      invoice,
    });
  } catch (error) {
    console.error("CUSTOMER ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Order failed",
    });
  }
});

/* =====================================================
   CUSTOMER MY ORDERS
===================================================== */

router.get("/my-orders", protect, customerOnly, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id,
      role: "CUSTOMER",
    })
      .populate(
        "invoiceId",
        "invoiceNo paidAmount balanceAmount invoiceStatus pdfUrl",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("MY ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load orders",
    });
  }
});

export default router;
