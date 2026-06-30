const formatCurrency = (amount = 0) =>
  Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN");
};

const generateInvoiceHtml = (invoice, totalOutstandingAmount = 0) => {
  return `
  <!DOCTYPE html>
  <html lang="en">

    <head>
      <meta charset="UTF-8" />

      <style>
        @page {
          size: A4;
          margin: 16mm;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #ffffff;
          color: #334155;

          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          padding: 0;
        }

        .invoice-container {
          width: 100%;
        }

        .company-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .company-name {
          margin: 0;
          color: #0f2b72;
          font-size: 34px;
          font-weight: 700;
        }

        .invoice-subtitle {
          margin-top: 8px;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #64748b;
        }

        .divider {
          height: 1px;
          background: #e2e8f0;
          margin: 24px 0;
        }

        .info-grid {
          display: flex;
          justify-content: space-between;
          gap: 40px;
        }

        .info-column {
          flex: 1;
        }

        .info-item {
          margin-bottom: 12px;
          font-size: 15px;
          line-height: 1.5;
        }

        .info-item strong {
          color: #0f172a;
        }

        .address-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 10px;
        }

        .address-card {
          border: 1px solid #dbe3ef;
          border-radius: 14px;
          padding: 22px;
          min-height: 220px;
          background: #ffffff;

          page-break-inside: avoid;
          break-inside: avoid;
        }

        .address-card h3 {
          margin: 0 0 18px;
          font-size: 20px;
          color: #0f2b72;
        }

        .address-card p {
          margin: 10px 0;
          font-size: 14px;
          line-height: 1.6;
        }

        .section-title {
          margin: 0 0 18px;
          font-size: 22px;
          color: #0f172a;
        }

        table {
          width: 100%;
          border-collapse: collapse;

          page-break-inside: auto;
        }

        thead {
          display: table-header-group;
          background: #102c73;
          color: #ffffff;
        }

        th {
          padding: 14px 10px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
        }

        td {
          padding: 14px 10px;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }

        tr {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        tbody tr:nth-child(even) {
          background: #f8fafc;
        }

        .totals-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 28px;

          page-break-inside: avoid;
          break-inside: avoid;
        }

        .total-card {
          border: 1px solid #dbe3ef;
          border-radius: 12px;
          padding: 18px;
          text-align: center;
        }

        .total-card h4 {
          margin: 0 0 10px;
          font-size: 13px;
          color: #64748b;
        }

        .total-card p {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
        }

        .primary {
          background: #dcfce7;
          border-color: #bbf7d0;
        }

        .primary p {
          color: #166534;
        }

        .success {
          background: #f0fdf4;
        }

        .warning {
          background: #fef3c7;
        }

        .danger {
          background: #fee2e2;
        }

        .wide-card {
          grid-column: span 2;
        }

        .footer {
          margin-top: 36px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #64748b;
        }

        .footer p {
          margin: 6px 0;
          font-size: 14px;
        }
      </style>
    </head>

    <body>

      <div class="invoice-container">

        <div class="company-header">
          <h1 class="company-name">
            ${invoice.companyName || "Adarsh Agri Tech"}
          </h1>

          <div class="invoice-subtitle">
            TAX INVOICE
          </div>
        </div>

        <div class="divider"></div>

        <div class="info-grid">

          <div class="info-column">

            <div class="info-item">
              <strong>Invoice No :</strong>
              ${invoice.invoiceNo || "-"}
            </div>

            <div class="info-item">
              <strong>Payment Type :</strong>
              ${(invoice.paymentType || "-").replaceAll("_", " ")}
            </div>

            <div class="info-item">
              <strong>Date :</strong>
              ${formatDate(invoice.invoiceDate || invoice.createdAt)}
            </div>

          </div>

          <div class="info-column">

            <div class="info-item">
              <strong>Order No :</strong>
              ${invoice.orderNo || "-"}
            </div>

            <div class="info-item">
              <strong>Role :</strong>
              ${invoice.role || "-"}
            </div>

            <div class="info-item">
              <strong>Payment Status :</strong>
              ${invoice.paymentStatus || "-"}
            </div>

          </div>

        </div>

        <div class="divider"></div>

        <div class="address-grid">

          <div class="address-card">

            <h3>From</h3>

            <p>
              <strong>${invoice.companyName || "Adarsh Agri Tech"}</strong>
            </p>

            <p>
              GST : ${invoice.companyGSTNumber || "F1Z3"}
            </p>

            <p>
              Phone : ${invoice.companyPhoneNumber || "8341198888"}
            </p>

            <p>
              Address : ${invoice.companyAddress || "Door No. 15-146, Gayathri Towers, Ground Floor, Shop No. 5, Side of Sub-Register office road, Nandigama, Krishna Dist, A.P. 521185"}
            </p>

            ${
              invoice.bankDetails
                ? `
                  <p>
                    <strong>Bank Details :</strong><br>
                    ${invoice.bankDetails}
                  </p>
                `
                : ""
            }

          </div>

          <div class="address-card">

            <h3>To</h3>

            ${
              invoice.role === "DEALER"
                ? `
                  <p><strong>Dealer Name :</strong> ${invoice.dealerName || "-"}</p>

                  <p><strong>Shop Name :</strong> ${invoice.shopName || "-"}</p>

                  <p><strong>Dealer GST :</strong> ${invoice.dealerGSTNumber || "-"}</p>

                  <p><strong>Phone :</strong> ${invoice.dealerPhoneNumber || "-"}</p>
                `
                : `
                  <p><strong>Customer Name :</strong> ${invoice.customerName || "-"}</p>

                  <p><strong>Phone :</strong> ${invoice.customerPhoneNumber || "-"}</p>

                  <p><strong>Village :</strong> ${invoice.customerVillage || "-"}</p>

                  <p><strong>Pincode :</strong> ${invoice.customerPincode || "-"}</p>

                  <p><strong>Near Bus Stand :</strong> ${invoice.customerNearBusStand || "-"}</p>
                `
            }

          </div>

        </div>

        <div class="divider"></div>

        <h3 class="section-title">Products</h3>

        <table>

          <thead>
            <tr>
              <th>S.No</th>
              <th>Product</th>
              <th>Size</th>
              <th>MRP</th>
              <th>Discount %</th>
              <th>Quantity</th>
              <th>Final Price</th>
            </tr>
          </thead>

          <tbody>

            ${(invoice.items || [])
              .map(
                (item, index) => `
                  <tr>
                    <td>${index + 1}</td>

                    <td>${item.productName || "-"}</td>

                    <td>${item.size || "-"}</td>

                    <td>₹${formatCurrency(item.mrp || 0)}</td>

                    <td>${Number(item.discountPercent || item.discount || 0)}%</td>

                    <td>${item.quantity || item.cases || 1}</td>

                    <td>₹${formatCurrency(item.finalPrice || 0)}</td>
                  </tr>
                `,
              )
              .join("")}

          </tbody>

        </table>

        <div class="totals-grid">

          <div class="total-card primary">
            <h4>Total Amount</h4>
            <p>₹${formatCurrency(invoice.grandTotal || 0)}</p>
          </div>

          <div class="total-card success">
            <h4>Paid Amount</h4>
            <p>₹${formatCurrency(invoice.paidAmount || 0)}</p>
          </div>

          <div class="total-card ${
            Number(invoice.balanceAmount || 0) > 0 ? "warning" : "success"
          }">
            <h4>Current Balance</h4>
            <p>₹${formatCurrency(invoice.balanceAmount || 0)}</p>
          </div>

          <div class="total-card ${
            invoice.invoiceStatus === "PAID"
              ? "success"
              : invoice.invoiceStatus === "PARTIALLY_PAID"
                ? "warning"
                : "danger"
          }">
            <h4>Invoice Status</h4>
            <p>${invoice.invoiceStatus || "UNPAID"}</p>
          </div>
        </div>

        <div class="footer">

          <p>
            Thank you for doing business with Adarsh Agri Tech
          </p>

          <p>
            Adarsh Agri Tech
          </p>

        </div>

      </div>

    </body>
  </html>
  `;
};

export default generateInvoiceHtml;
