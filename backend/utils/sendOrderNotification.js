import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderNotification = async ({
  role,
  customer = {},
  dealer = {},
  order = {},
}) => {
  try {
    const isDealer = role === "DEALER";

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
      <div style="font-family:Arial,sans-serif;color:#222;">
        <h2>New ${role} Order Received</h2>

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
