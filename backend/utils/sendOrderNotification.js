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
      from: "Sunrise Agri <onboarding@resend.dev>",
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
