import "dotenv/config";
import nodemailer from "nodemailer";

/* =================================
   VALIDATE ENV VARIABLES
================================= */

const requiredEnv = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
  "ADMIN_NOTIFICATION_EMAIL",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error("❌ Missing environment variables:", missingEnv.join(", "));

  throw new Error(`Missing environment variables: ${missingEnv.join(", ")}`);
}

/* =================================
   EMAIL CONFIG LOGS
================================= */

console.log("================================");
console.log("📧 EMAIL CONFIG");
console.log("HOST:", process.env.EMAIL_HOST);
console.log("PORT:", process.env.EMAIL_PORT);
console.log("USER:", process.env.EMAIL_USER);
console.log("PASSWORD EXISTS:", Boolean(process.env.EMAIL_PASSWORD));
console.log("ADMIN EMAIL:", process.env.ADMIN_NOTIFICATION_EMAIL);
console.log("================================");

/* =================================
   MAIL TRANSPORTER
================================= */

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,

  port: Number(process.env.EMAIL_PORT),

  secure: Number(process.env.EMAIL_PORT) === 465,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },

  pool: true,

  maxConnections: 5,

  maxMessages: 100,

  connectionTimeout: 30000,

  greetingTimeout: 30000,

  socketTimeout: 30000,

  logger: true,

  debug: true,
});

/* =================================
   VERIFY SMTP CONNECTION
================================= */

(async () => {
  try {
    await transporter.verify();

    console.log("================================");
    console.log("✅ SMTP SERVER READY");
    console.log("================================");
  } catch (error) {
    console.error("================================");
    console.error("❌ SMTP VERIFY ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error("RESPONSE:", error.response);
    console.error("FULL ERROR:", error);
    console.error("================================");
  }
})();

/* =================================
   FORMAT PRODUCTS
================================= */

const formatItems = (order, isDealer) => {
  return (order.items || [])
    .map((item, index) => {
      const quantity = isDealer
        ? Number(item.cases || 0)
        : Number(
            item.quantity ||
              item.requiredBottles ||
              item.totalBottles ||
              item.cases ||
              0,
          );

      return `
        <tr>
          <td style="padding:8px;">${index + 1}</td>

          <td style="padding:8px;">
            ${item.productName || "-"}
          </td>

          <td style="padding:8px;">
            ${item.size || "-"}
          </td>

          <td style="padding:8px; text-align:center;">
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

        <h3>Ordered Products</h3>

        <table
          border="1"
          cellpadding="0"
          cellspacing="0"
          style="
            width:100%;
            border-collapse:collapse;
            margin-top:10px;
          "
        >
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:10px;">#</th>

              <th style="padding:10px;">Product</th>

              <th style="padding:10px;">Size</th>

              <th style="padding:10px;">
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

    const mailOptions = {
      from: {
        name: "Sunrise Agri Products",
        address: process.env.EMAIL_USER,
      },

      to: process.env.ADMIN_NOTIFICATION_EMAIL,

      subject: `New ${role} Order - ${isDealer ? dealerName : customerName}`,

      html,
    };

    console.log("================================");
    console.log("📧 SENDING EMAIL");
    console.log("TO:", process.env.ADMIN_NOTIFICATION_EMAIL);
    console.log("ORDER:", order.orderNo || order._id);
    console.log("ROLE:", role);
    console.log("================================");

    const info = await transporter.sendMail(mailOptions);

    console.log("================================");
    console.log("✅ EMAIL SENT SUCCESSFULLY");
    console.log("MESSAGE ID:", info.messageId);
    console.log("RESPONSE:", info.response);
    console.log("================================");

    return info;
  } catch (error) {
    console.error("================================");
    console.error("❌ EMAIL SEND ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error("RESPONSE:", error.response);
    console.error("COMMAND:", error.command);
    console.error("FULL ERROR:", error);
    console.error("================================");

    throw error;
  }
};
