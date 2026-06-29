import "dotenv/config";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is missing");
}

if (!process.env.ADMIN_NOTIFICATION_EMAIL) {
  throw new Error("ADMIN_NOTIFICATION_EMAIL is missing");
}

const resend = new Resend(process.env.RESEND_API_KEY);

/* =================================
   FORMAT PRODUCTS
================================= */

const formatItems = (order, isDealer) => {
  if (!Array.isArray(order?.items) || order.items.length === 0) {
    return `
      <tr>
        <td
          colspan="4"
          style="
            padding:12px;
            text-align:center;
            color:#666;
          "
        >
          No products found
        </td>
      </tr>
    `;
  }

  return order.items
    .map((item, index) => {
      const quantity = isDealer
        ? Number(item.cases || item.quantity || 0)
        : Number(
            item.quantity ||
              item.requiredBottles ||
              item.totalBottles ||
              item.cases ||
              0,
          );

      return `
        <tr>
          <td style="padding:10px; border:1px solid #ddd;">
            ${index + 1}
          </td>

          <td style="padding:10px; border:1px solid #ddd;">
            ${item.productName || item.name || "-"}
          </td>

          <td style="padding:10px; border:1px solid #ddd;">
            ${item.size || "-"}
          </td>

          <td
            style="
              padding:10px;
              border:1px solid #ddd;
              text-align:center;
            "
          >
            ${quantity}
          </td>
        </tr>
      `;
    })
    .join("");
};

/* =================================
   SEND ORDER NOTIFICATION
================================= */

export const sendOrderNotification = async ({
  role,
  customer = {},
  dealer = {},
  order = {},
}) => {
  try {
    const isDealer = role === "DEALER";

    console.log("ORDER ITEMS:", JSON.stringify(order.items || [], null, 2));

    const customerName = order.customerName || customer.name || "-";

    const customerPhone = order.customerPhoneNumber || customer.phone || "-";

    const customerVillage = order.customerVillage || customer.village || "-";

    const customerNearBusStand =
      order.customerNearBusStand || customer.nearBusStand || "-";

    const dealerName =
      order.dealerName || dealer.dealerName || dealer.name || "-";

    const shopName = order.shopName || dealer.shopName || "-";

    const dealerGSTNumber =
      order.dealerGSTNumber ||
      dealer.gstNumber ||
      dealer.dealerGSTNumber ||
      dealer.gstNo ||
      "-";

    const dealerPhone = order.dealerPhoneNumber || dealer.phone || "-";

    const html = `
      <div
        style="
          font-family: Arial, sans-serif;
          color: #222;
          max-width: 800px;
          margin: auto;
        "
      >
        <h2 style="color:#2e7d32;">
          New ${role} Order Received
        </h2>

        <p>
          <strong>Order ID:</strong>
          ${order.orderNo || order._id || "-"}
        </p>

        ${
          isDealer
            ? `
              <p><strong>Name:</strong> ${dealerName}</p>
              <p><strong>Shop Name:</strong> ${shopName}</p>
              <p><strong>GST Number:</strong> ${dealerGSTNumber}</p>
              <p><strong>Phone Number:</strong> ${dealerPhone}</p>
            `
            : `
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Phone Number:</strong> ${customerPhone}</p>
              <p><strong>Village:</strong> ${customerVillage}</p>
              <p><strong>Near Bus Stand:</strong> ${customerNearBusStand}</p>
            `
        }

        <p>
          <strong>Total Amount:</strong>
          ₹${Number(order.totalAmount || 0).toLocaleString("en-IN")}
        </p>

        <h3 style="margin-top:30px;">
          Ordered Products
        </h3>

        <table
          style="
            width:100%;
            border-collapse:collapse;
            margin-top:10px;
          "
        >
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:10px; border:1px solid #ddd;">#</th>

              <th style="padding:10px; border:1px solid #ddd;">
                Product
              </th>

              <th style="padding:10px; border:1px solid #ddd;">
                Size
              </th>

              <th style="padding:10px; border:1px solid #ddd;">
                ${isDealer ? "Cases" : "Quantity"}
              </th>
            </tr>
          </thead>

          <tbody>
            ${formatItems(order, isDealer)}
          </tbody>
        </table>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "Adarsh Agri Tech <onboarding@resend.dev>",
      to: process.env.ADMIN_NOTIFICATION_EMAIL,
      subject: `New ${role} Order - ${isDealer ? dealerName : customerName}`,
      html,
    });

    if (error) {
      console.error("❌ RESEND ERROR:", error);
      throw new Error(error.message);
    }

    console.log("✅ EMAIL SENT:", data?.id);

    return data;
  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:", error);
    throw error;
  }
};

/* =================================
   SEND OUTSTANDING PAYMENT NOTIFICATION
================================= */

export const sendOutstandingPaymentNotification = async ({
  date,
  dealerName,
  shopName,
  phoneNumber,
  paidAmount,
  pendingBillsAfterPayment,
}) => {
  try {
    const html = `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width:700px;
          margin:auto;
          color:#222;
        "
      >
        <h2 style="color:#2e7d32;">
          Outstanding Payment Received
        </h2>

        <table
          style="
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
          "
        >
          <tr>
            <td style="padding:10px;border:1px solid #ddd;"><strong>Date</strong></td>
            <td style="padding:10px;border:1px solid #ddd;">
              ${new Date(date).toLocaleString("en-IN")}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;border:1px solid #ddd;"><strong>Dealer Name</strong></td>
            <td style="padding:10px;border:1px solid #ddd;">
              ${dealerName}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;border:1px solid #ddd;"><strong>Shop Name</strong></td>
            <td style="padding:10px;border:1px solid #ddd;">
              ${shopName}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;border:1px solid #ddd;"><strong>Phone Number</strong></td>
            <td style="padding:10px;border:1px solid #ddd;">
              ${phoneNumber}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;border:1px solid #ddd;"><strong>Paid Amount</strong></td>
            <td style="padding:10px;border:1px solid #ddd;">
              ₹${Number(paidAmount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;border:1px solid #ddd;"><strong>Pending Bills After Payment</strong></td>
            <td style="padding:10px;border:1px solid #ddd;">
              ₹${Number(pendingBillsAfterPayment).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
        </table>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "Adarsh Agri Tech <onboarding@resend.dev>",
      to: process.env.ADMIN_NOTIFICATION_EMAIL,
      subject: "Dealer Outstanding Payment Received",
      html,
    });

    if (error) {
      console.error("❌ OUTSTANDING PAYMENT EMAIL ERROR:", error);
      throw new Error(error.message);
    }

    console.log("✅ OUTSTANDING PAYMENT EMAIL SENT:", data?.id);

    return data;
  } catch (error) {
    console.error("❌ OUTSTANDING PAYMENT EMAIL FAILED:", error);
    throw error;
  }
};

/* =================================
   DEALER RETURN REQUEST EMAIL
================================= */

export const sendDealerReturnRequestNotification = async ({
  dealer,
  returnRequest,
  pendingBills,
  pendingBillsAfterApproval,
}) => {
  try {
    const pendingBillsAfterApproval = Math.max(
      Number(pendingBills || 0) - Number(returnRequest.totalAmount || 0),
      0,
    );

    const productsHtml = (returnRequest.items || [])
      .map(
        (item, index) => `
          <tr>
            <td style="padding:10px;border:1px solid #ddd;">${index + 1}</td>
            <td style="padding:10px;border:1px solid #ddd;">
              ${item.productName}
            </td>
            <td style="padding:10px;border:1px solid #ddd;">
              ${item.size || "-"}
            </td>
            <td style="padding:10px;border:1px solid #ddd;text-align:center;">
              ${item.returnQuantity}
            </td>
            <td style="padding:10px;border:1px solid #ddd;">
              ₹${Number(item.returnAmount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
        `,
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:800px;margin:auto;">

        <h2 style="color:#d32f2f;">
          Dealer Return Request Received
        </h2>

        <table style="width:100%;border-collapse:collapse;margin-top:20px;">

          <tr>
            <td style="padding:10px;border:1px solid #ddd;">
              <strong>Dealer Name</strong>
            </td>
            <td style="padding:10px;border:1px solid #ddd;">
              ${dealer.dealerName || dealer.name || "-"}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;border:1px solid #ddd;">
              <strong>Shop Name</strong>
            </td>
            <td style="padding:10px;border:1px solid #ddd;">
              ${dealer.shopName || "-"}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;border:1px solid #ddd;">
              <strong>Phone Number</strong>
            </td>
            <td style="padding:10px;border:1px solid #ddd;">
              ${dealer.phone || "-"}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;border:1px solid #ddd;">
              <strong>Pending Bills Before Return</strong>
            </td>
            <td style="padding:10px;border:1px solid #ddd;">
              ₹${Number(pendingBills).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;border:1px solid #ddd;">
              <strong>Estimated Return Value</strong>
            </td>
            <td style="padding:10px;border:1px solid #ddd;">
              ₹${Number(returnRequest.totalAmount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;border:1px solid #ddd;">
              <strong>Pending Bills After Approval</strong>
            </td>
            <td style="padding:10px;border:1px solid #ddd;">
              ₹${Number(pendingBillsAfterApproval).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;border:1px solid #ddd;">
              <strong>Remarks</strong>
            </td>
            <td style="padding:10px;border:1px solid #ddd;">
              ${returnRequest.remarks || "-"}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;border:1px solid #ddd;">
              <strong>Date & Time</strong>
            </td>
            <td style="padding:10px;border:1px solid #ddd;">
              ${new Date(returnRequest.createdAt).toLocaleString("en-IN")}
            </td>
          </tr>

        </table>

        <h3 style="margin-top:30px;">
          Return Products
        </h3>

        <table
          style="width:100%;border-collapse:collapse;margin-top:10px;"
        >
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:10px;border:1px solid #ddd;">#</th>
              <th style="padding:10px;border:1px solid #ddd;">Product</th>
              <th style="padding:10px;border:1px solid #ddd;">Size</th>
              <th style="padding:10px;border:1px solid #ddd;">Qty</th>
              <th style="padding:10px;border:1px solid #ddd;">Amount</th>
            </tr>
          </thead>

          <tbody>
            ${productsHtml}
          </tbody>
        </table>

      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "Adarsh Agri Tech <onboarding@resend.dev>",
      to: process.env.ADMIN_NOTIFICATION_EMAIL,
      subject: `Dealer Return Request - ${dealer.shopName || dealer.dealerName}`,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log("✅ RETURN REQUEST EMAIL SENT:", data?.id);

    return data;
  } catch (error) {
    console.error("❌ RETURN REQUEST EMAIL ERROR:", error);
    throw error;
  }
};
