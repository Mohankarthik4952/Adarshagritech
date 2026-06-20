import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import Dealer from "../models/Dealer.js";
import Admin from "../models/Admin.js";
import sendEmail from "../utils/sendEmail.js";

/* ===============================
   TOKEN GENERATOR
================================ */
const generateToken = (user, role) => {
  console.log("SIGN JWT_SECRET =", process.env.JWT_SECRET);

  return jwt.sign(
    {
      id: user._id,
      role: role.toUpperCase(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
};

/* ===============================
   CUSTOMER SIGNUP
================================ */
export const customerSignup = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      village,
      pincode,
      nearBusStand,
      cropName,
      password,
    } = req.body;

    /* ===============================
       VALIDATION
    ============================== */

    if (
      !name ||
      !email ||
      !phone ||
      !village ||
      !pincode ||
      !nearBusStand ||
      !cropName ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    /* ===============================
       CHECK EXISTING CUSTOMER
    ============================== */

    const existing = await Customer.findOne({
      $or: [{ email: email.trim().toLowerCase() }, { phone: phone.trim() }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    /* ===============================
       CREATE CUSTOMER
    ============================== */

    const customer = await Customer.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      village: village.trim(),
      pincode: pincode.trim(),
      nearBusStand: nearBusStand.trim(),
      cropName: cropName.trim(),
      password: password.trim(),
    });

    /* ===============================
       GENERATE TOKEN
    ============================== */

    const token = generateToken(customer, "customer");

    /* ===============================
       REMOVE PASSWORD FROM RESPONSE
    ============================== */

    const customerData = customer.toObject();
    delete customerData.password;

    /* ===============================
       RESPONSE
    ============================== */

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      customer: customerData,
    });
  } catch (error) {
    console.error("CUSTOMER SIGNUP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Signup failed",
    });
  }
};

/* ===============================
   CUSTOMER LOGIN
================================ */
export const customerLogin = async (req, res) => {
  try {
    let { identifier, password } = req.body;

    identifier = identifier?.trim();
    password = password?.trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const customer = await Customer.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!customer) {
      return res.status(400).json({ message: "User not found" });
    }

    if (customer.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = generateToken(customer, "customer");

    res.json({
      message: "Login successful",
      token,
      customer,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ===============================
   DEALER SIGNUP
================================ */

export const dealerSignup = async (req, res) => {
  try {
    const { name, shopName, gst, village, email, phone, password } = req.body;

    const existing = await Dealer.findOne({
      $or: [{ email }, { phone }, { gstNumber: gst }],
    });

    if (existing) {
      return res.status(400).json({
        message: "Dealer already exists",
      });
    }

    const dealer = await Dealer.create({
      dealerName: name,
      shopName,
      gstNumber: gst,
      village,
      email,
      phone,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Dealer signup successful",
      dealer,
    });
  } catch (error) {
    console.error("DEALER SIGNUP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Dealer signup failed",
    });
  }
};

/* ===============================
   DEALER LOGIN
================================ */

export const dealerLogin = async (req, res) => {
  try {
    let { identifier, password } = req.body;

    identifier = identifier?.trim();

    password = password?.trim();

    /* =========================
       VALIDATION
    ========================= */

    if (!identifier || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    /* =========================
       FIND DEALER
    ========================= */

    const dealer = await Dealer.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    /* =========================
       DEALER NOT FOUND
    ========================= */

    if (!dealer) {
      return res.status(400).json({
        message: "Dealer not found",
      });
    }

    /* =========================
       PASSWORD CHECK
    ========================= */

    if (dealer.password !== password) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    /* =========================
       GENERATE TOKEN
    ========================= */

    const token = generateToken(dealer, "dealer");

    /* =========================
       RESPONSE
    ========================= */

    res.json({
      message: "Login successful",

      token,

      dealer,
    });
  } catch (error) {
    console.error("DEALER LOGIN ERROR:", error);

    res.status(500).json({
      message: "Dealer login failed",
    });
  }
};

/* ===============================
   ADMIN LOGIN
================================ */
export const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    /* =========================
       CLEAN INPUT
    ========================= */
    email = email?.trim().toLowerCase();
    password = password?.trim();

    /* =========================
       VALIDATION
    ========================= */
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    /* =========================
       FIXED ADMIN EMAIL CHECK
       (Email must match .env)
    ========================= */
    const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (!allowedEmail) {
      return res.status(500).json({
        message: "ADMIN_EMAIL is not configured in .env",
      });
    }

    if (email !== allowedEmail) {
      return res.status(400).json({
        message: "Unauthorized admin email",
      });
    }

    /* =========================
       FIND ADMIN IN MONGODB
    ========================= */
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({
        message: "Admin not found. Please complete setup first.",
      });
    }

    /* =========================
       VERIFY PASSWORD
       (Password stored in MongoDB)
    ========================= */
    if (admin.password !== password) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    /* =========================
       CREATE TOKEN PAYLOAD
    ========================= */
    const adminPayload = {
      _id: admin._id,
      name: admin.name || "Administrator",
      email: admin.email,
      role: "admin",
    };

    /* =========================
       GENERATE JWT TOKEN
    ========================= */
    const token = generateToken(adminPayload, "admin");

    /* =========================
       SUCCESS RESPONSE
    ========================= */
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: adminPayload,
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// adminForgotPassword

export const adminForgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    /* =========================
       VALIDATE EMAIL
    ========================= */
    email = email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    /* =========================
       CHECK FIXED ADMIN EMAIL
    ========================= */
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    console.log("REQUEST EMAIL:", email);
    console.log("ADMIN EMAIL:", adminEmail);

    if (!adminEmail) {
      return res.status(500).json({
        message: "ADMIN_EMAIL is not configured in .env",
      });
    }

    if (email !== adminEmail) {
      return res.status(400).json({
        message: "This email is not authorized for admin access",
      });
    }

    /* =========================
       GENERATE OTP
    ========================= */
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    /* =========================
       SAVE OTP GLOBALLY
    ========================= */
    global.adminOTP = {
      email,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      verified: false,
    };

    console.log("ADMIN OTP GENERATED:", otp);
    console.log("ADMIN OTP SAVED:", global.adminOTP);

    /* =========================
       SEND EMAIL
    ========================= */
    try {
      await sendEmail(
        email,
        "Sunrise Agri Products - Admin Password Reset OTP",
        `Your OTP for admin password reset is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
      );

      console.log("ADMIN OTP EMAIL SENT SUCCESSFULLY");
    } catch (emailError) {
      console.error("EMAIL SEND ERROR:", emailError);

      return res.status(500).json({
        message: emailError.message || "Failed to send OTP email",
      });
    }

    /* =========================
       SUCCESS RESPONSE
    ========================= */
    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("ADMIN FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      message: error.message || "Failed to send OTP",
    });
  }
};
/* ===============================
   ADMIN VERIFY RESET OTP
================================ */
export const adminVerifyResetOTP = async (req, res) => {
  try {
    let { email, otp } = req.body;

    /* =========================
       VALIDATION
    ========================= */
    email = email?.trim().toLowerCase();
    otp = otp?.trim();

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    /* =========================
       CHECK GLOBAL OTP
    ========================= */
    if (!global.adminOTP) {
      return res.status(400).json({
        message: "No OTP found. Please request a new OTP.",
      });
    }

    /* =========================
       EMAIL CHECK
    ========================= */
    if (global.adminOTP.email !== email) {
      return res.status(400).json({
        message: "Email does not match OTP request",
      });
    }

    /* =========================
       OTP CHECK
    ========================= */
    if (global.adminOTP.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    /* =========================
       EXPIRY CHECK
    ========================= */
    if (Date.now() > global.adminOTP.expiresAt) {
      global.adminOTP = null;

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    /* =========================
       MARK VERIFIED
    ========================= */
    global.adminOTP.verified = true;

    console.log("ADMIN OTP VERIFIED:", global.adminOTP);

    /* =========================
       SUCCESS
    ========================= */
    return res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("ADMIN VERIFY RESET OTP ERROR:", error);

    return res.status(500).json({
      message: "OTP verification failed",
    });
  }
};
/* ===============================
   RESET ADMIN PASSWORD
================================ */
export const resetAdminPassword = async (req, res) => {
  try {
    /* =========================
       GET REQUEST DATA
    ========================= */
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();
    password = password?.trim();

    console.log("RESET ADMIN PASSWORD REQUEST:", {
      email,
      passwordLength: password?.length,
    });

    /* =========================
       VALIDATION
    ========================= */
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    /* =========================
       FIND ADMIN
    ========================= */
    let admin = await Admin.findOne({ email });

    console.log("ADMIN FOUND:", admin ? "YES" : "NO");

    /* =========================
       CREATE ADMIN IF NOT FOUND
    ========================= */
    if (!admin) {
      admin = new Admin({
        email,
      });
    }

    /* =========================
       SAVE PASSWORD AS PLAIN TEXT
       (Same as your dealer/customer approach)
    ========================= */
    admin.password = password;

    await admin.save();

    console.log("ADMIN PASSWORD RESET SUCCESS");

    /* =========================
       CLEAR OTP
    ========================= */
    global.adminOTP = null;

    /* =========================
       SUCCESS RESPONSE
    ========================= */
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("RESET ADMIN PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};
/* ===============================
   FORGOT PASSWORD (SEND OTP)
================================ */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    /* ===============================
       VALIDATION
    ============================== */
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    /* ===============================
       FIND USER (CUSTOMER OR DEALER)
    ============================== */
    let user = await Customer.findOne({
      email: email.trim(),
    });

    let role = "customer";

    if (!user) {
      user = await Dealer.findOne({
        email: email.trim(),
      });

      role = "dealer";
    }

    if (!user) {
      return res.status(404).json({
        message: "Email not registered",
      });
    }

    /* ===============================
       GENERATE OTP
    ============================== */
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("GENERATED OTP:", otp);

    /* ===============================
       SAVE OTP TO DATABASE
    ============================== */
    user.resetOTP = otp;
    user.resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    /* VERIFY SAVE */
    const updatedUser =
      role === "customer"
        ? await Customer.findById(user._id)
        : await Dealer.findById(user._id);

    console.log("SAVED OTP:", updatedUser.resetOTP);
    console.log("SAVED OTP EXPIRY:", updatedUser.resetOTPExpiry);

    /* ===============================
       SEND EMAIL
    ============================== */
    const emailSent = await sendEmail(
      user.email,
      "Password Reset OTP",
      `Your OTP for password reset is: ${otp}`,
    );

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send OTP email",
      });
    }

    /* ===============================
       RESPONSE
    ============================== */
    return res.status(200).json({
      message: "OTP sent successfully",
      role,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};

/* ===============================
   VERIFY OTP
================================ */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    /* ===============================
       VALIDATION
    ============================== */
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    /* ===============================
       FIND USER (CUSTOMER OR DEALER)
    ============================== */
    let user = await Customer.findOne({
      email: email.trim(),
    });

    let role = "customer";

    if (!user) {
      user = await Dealer.findOne({
        email: email.trim(),
      });

      role = "dealer";
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* ===============================
       READ SAVED OTP FIELDS
    ============================== */
    const savedOTP = user.resetOTP || user.otp || "";

    const savedOTPExpiry = user.resetOTPExpiry || user.otpExpiry || null;

    console.log("ENTERED OTP:", otp);
    console.log("SAVED OTP:", savedOTP);
    console.log("OTP EXPIRY:", savedOTPExpiry);

    /* ===============================
       CHECK OTP EXISTS
    ============================== */
    if (!savedOTP) {
      return res.status(400).json({
        message: "No OTP found. Please request a new OTP.",
      });
    }

    /* ===============================
       CHECK OTP MATCH
    ============================== */
    if (savedOTP.toString().trim() !== otp.toString().trim()) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    /* ===============================
       CHECK OTP EXPIRY
    ============================== */
    if (savedOTPExpiry && new Date(savedOTPExpiry).getTime() < Date.now()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    /* ===============================
       SUCCESS
    ============================== */
    return res.status(200).json({
      message: "OTP verified successfully",
      role,
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      message: "OTP verification failed",
    });
  }
};

/* ===============================
   RESET PASSWORD
================================ */
export const resetPassword = async (req, res) => {
  try {
    /* ===============================
       ACCEPT MULTIPLE FIELD NAMES
    ============================== */
    const email = req.body.email || req.body.identifier || req.body.userEmail;

    const password = req.body.password || req.body.newPassword;

    /* ===============================
       VALIDATION
    ============================== */
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and new password are required",
      });
    }

    /* ===============================
       FIND USER (CUSTOMER OR DEALER)
    ============================== */
    let user = await Customer.findOne({
      email: email.trim(),
    });

    let role = "customer";

    if (!user) {
      user = await Dealer.findOne({
        email: email.trim(),
      });

      role = "dealer";
    }

    /* ===============================
       USER NOT FOUND
    ============================== */
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* ===============================
       ENSURE OTP WAS VERIFIED
    ============================== */
    const savedOTP = user.resetOTP || user.otp || null;

    if (!savedOTP) {
      return res.status(400).json({
        message: "OTP not verified or OTP expired",
      });
    }

    /* ===============================
       UPDATE PASSWORD
       (Plain text to match your current login logic)
    ============================== */
    user.password = password.trim();

    /* ===============================
       CLEAR OTP FIELDS
    ============================== */
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    user.otp = null;
    user.otpExpiry = null;

    /* ===============================
       SAVE USER
    ============================== */
    await user.save();

    console.log(`PASSWORD RESET SUCCESS for ${role}:`, user.email);

    /* ===============================
       RESPONSE
    ============================== */
    return res.status(200).json({
      message: "Password reset successful",
      role,
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Password reset failed",
    });
  }
};
