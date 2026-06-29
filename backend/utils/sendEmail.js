import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    /* ===============================
       DEBUG ENV VARIABLES
    ============================== */
    console.log("📧 Sending email to:", to);
    console.log("EMAIL:", process.env.EMAIL);
    console.log(
      "EMAIL_PASS:",
      process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌",
    );

    /* ===============================
       VALIDATE ENV VARIABLES
    ============================== */
    if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL or EMAIL_PASS is missing in .env file");
    }

    /* ===============================
       CREATE TRANSPORTER
    ============================== */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL.trim(),
        pass: process.env.EMAIL_PASS.trim(),
      },
    });

    /* ===============================
       VERIFY CONNECTION
    ============================== */
    await transporter.verify();
    console.log("✅ Gmail connection successful");

    /* ===============================
       SEND EMAIL
    ============================== */
    const info = await transporter.sendMail({
      from: `"Adarsh Agri Tech" <${process.env.EMAIL.trim()}>`,
      to,
      subject,
      text,
    });

    /* ===============================
       SUCCESS LOGS
    ============================== */
    console.log("✅ Email sent successfully");
    console.log("📨 Message ID:", info.messageId);
    console.log("📨 Response:", info.response);

    return true;
  } catch (error) {
    /* ===============================
       ERROR LOGS
    ============================== */
    console.error("❌ Email error:", error.message);

    if (error.response) {
      console.error("❌ Gmail response:", error.response);
    }

    return false;
  }
};

export default sendEmail;
