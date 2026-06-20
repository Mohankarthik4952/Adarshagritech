import nodemailer from "nodemailer";

export const sendInvoiceEmail = async (email, fileUrl) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "Sunrise Agri Products",
    to: email,
    subject: "Invoice from Sunrise Agri Products",
    text: "Please find your invoice attached.",
    attachments: [
      {
        path: fileUrl,
      },
    ],
  });
};
