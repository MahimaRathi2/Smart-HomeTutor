const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { logUserActivity } = require("../utils/activityLogHelper");
const { createNotification } = require("../utils/notificationHelper");
const { sendVerificationEmail, sendPasswordResetEmail, isValidEmailFormat } = require("../utils/sendEmail");

const JWT_SECRET = process.env.JWT_SECRET || "HomeTutor_Secret_Key_2026";
const sendTokenResponse = (user, statusCode, req, res) => {
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name || user.email.split("@")[0],
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };

  res.cookie("token", token, cookieOptions);

  const redirectUrl = `/dashboard/${user.role}`;

  if (req.xhr || (req.headers.accept && req.headers.accept.includes("json")) || req.headers["content-type"]?.includes("json")) {
    return res.status(statusCode).json({
      success: true,
      message: "Authentication successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        walletBalance: user.walletBalance,
      },
      redirectUrl,
    });
  }

  return res.redirect(redirectUrl);
};

exports.signup = async (req, res) => {
  const isJsonRequest = req.xhr || (req.headers.accept && req.headers.accept.includes("json")) || req.headers["content-type"]?.includes("json");

  try {
    const { name, firstName, lastName, email, phone, password, role, referredBy, referralCode } = req.body;

    if (!email || !password) {
      const msg = "Please enter a valid email address.";
      if (isJsonRequest) return res.status(400).json({ success: false, message: msg });
      return res.redirect("/signup?error=" + encodeURIComponent(msg));
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (role && String(role).toLowerCase().trim() === "admin") {
      const msg = "Admin accounts cannot be created via public registration.";
      await logUserActivity({
        userEmail: normalizedEmail,
        action: `Unauthorized signup attempt with Admin role for ${normalizedEmail}`,
        ipAddress: req.ip,
        severity: "critical",
        category: "security",
      });
      if (isJsonRequest) return res.status(403).json({ success: false, message: msg });
      return res.redirect("/signup?error=" + encodeURIComponent(msg));
    }

    const requestedRole = role ? String(role).toLowerCase().trim() : "student";
    if (!["student", "tutor", "parent"].includes(requestedRole)) {
      const msg = "Invalid account role selected.";
      if (isJsonRequest) return res.status(400).json({ success: false, message: msg });
      return res.redirect("/signup?error=" + encodeURIComponent(msg));
    }
    if (!isValidEmailFormat(normalizedEmail)) {
      const msg = "Please enter a valid email address.";
      if (isJsonRequest) return res.status(400).json({ success: false, message: msg });
      return res.redirect("/signup?error=" + encodeURIComponent(msg));
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (existingUser.isVerified) {
        const msg = "User already exists. Please login.";
        if (isJsonRequest) return res.status(400).json({ success: false, message: msg });
        return res.redirect("/signup?error=" + encodeURIComponent(msg));
      } else {
        //  resend verification email
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.otp = otpCode;
        existingUser.otpExpires = Date.now() + 10 * 60 * 1000;
        await existingUser.save();

        try {
          await sendVerificationEmail({ to: normalizedEmail, otp: otpCode, name: existingUser.name });
        } catch (emailErr) {
          const msg = "Please enter a valid email address.";
          if (isJsonRequest) return res.status(400).json({ success: false, message: msg });
          return res.redirect("/signup?error=" + encodeURIComponent(msg));
        }

        const msg = `Verification email sent to ${normalizedEmail}! Please enter your OTP to verify.`;
        if (isJsonRequest) {
          return res.status(200).json({
            success: true,
            message: msg,
            requiresVerification: true,
            email: normalizedEmail,
            redirectUrl: "/verify-otp?email=" + encodeURIComponent(normalizedEmail),
          });
        }
        return res.redirect("/verify-otp?email=" + encodeURIComponent(normalizedEmail) + "&message=" + encodeURIComponent(msg));
      }
    }

    const fullName =
      name ||
      (firstName && lastName
        ? `${firstName} ${lastName}`
        : firstName || normalizedEmail.split("@")[0]);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newReferralCode = "REF-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    let initialWallet = 0;
    let validReferredBy = "";
    const rawReferral = (referredBy || referralCode || (req.query && req.query.ref) || "").trim().toUpperCase();

    if (rawReferral) {
      const referrer = await User.findOne({ referralCode: rawReferral });
      if (!referrer) {
        const msg = "Invalid referral code. Please check your code or leave it blank.";
        if (isJsonRequest) return res.status(400).json({ success: false, message: msg });
        return res.redirect("/signup?error=" + encodeURIComponent(msg));
      }

      if (referrer.email.toLowerCase().trim() === normalizedEmail) {
        const msg = "Self-referral is not allowed. Please enter a valid friend's referral code or leave it blank.";
        if (isJsonRequest) return res.status(400).json({ success: false, message: msg });
        return res.redirect("/signup?error=" + encodeURIComponent(msg));
      }

      validReferredBy = referrer.referralCode;
      initialWallet = 50; 

      referrer.walletBalance = (referrer.walletBalance || 0) + 100;
      referrer.referralEarnings = (referrer.referralEarnings || 0) + 100;
      await referrer.save();

      await Transaction.create({
        user: referrer._id,
        type: "Credit",
        amount: 100,
        description: `Referral Bonus for inviting ${fullName}`,
        status: "Completed",
      });

      await createNotification({
        userId: referrer._id,
        title: "Referral Bonus Received 🎉",
        message: `You earned ₹100 bonus because ${fullName} joined using your referral code!`,
        type: "payment",
        app: req.app,
      });
    }

    try {
      await sendVerificationEmail({ to: normalizedEmail, otp: otpCode, name: fullName });
    } catch (emailDeliveryErr) {
      console.error("Email verification delivery failed:", emailDeliveryErr.message);
      const msg = "Please enter a valid email address.";
      if (isJsonRequest) return res.status(400).json({ success: false, message: msg });
      return res.redirect("/signup?error=" + encodeURIComponent(msg));
    }
    const user = await User.create({
      name: fullName,
      email: normalizedEmail,
      phone: phone || "",
      password: hashedPassword,
      role: requestedRole,
      walletBalance: initialWallet,
      referralCode: newReferralCode,
      referredBy: validReferredBy,
      isVerified: false,
      otp: otpCode,
      otpExpires: Date.now() + 10 * 60 * 1000,
    });

    if (initialWallet > 0) {
      await Transaction.create({
        user: user._id,
        type: "Credit",
        amount: 50,
        description: `Welcome Bonus for using referral code ${validReferredBy}`,
        status: "Completed",
      });
    }

    await logUserActivity(user._id, `User initiated registration. Verification email sent to ${normalizedEmail}`, req.ip);
    const successMsg = `Verification email sent successfully to ${normalizedEmail}! Please enter your 6-digit OTP code below to verify your account.`;
    if (isJsonRequest) {
      return res.status(201).json({
        success: true,
        message: successMsg,
        requiresVerification: true,
        email: normalizedEmail,
        redirectUrl: "/verify-otp?email=" + encodeURIComponent(normalizedEmail),
      });
    }

    return res.redirect("/verify-otp?email=" + encodeURIComponent(normalizedEmail) + "&message=" + encodeURIComponent(successMsg));

  } catch (error) {
    console.error("Signup Error:", error);
    const msg = "Please enter a valid email address.";
    if (isJsonRequest) return res.status(500).json({ success: false, message: msg });
    return res.redirect("/signup?error=" + encodeURIComponent(msg));
  }
};
exports.login = async (req, res) => {
  const isJsonRequest = req.xhr || (req.headers.accept && req.headers.accept.includes("json")) || req.headers["content-type"]?.includes("json");

  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      const msg = "Please enter email, password and select your role.";
      if (isJsonRequest) return res.status(400).json({ success: false, message: msg });
      return res.redirect("/login?error=" + encodeURIComponent(msg));
    }

    const normalizedEmail = email.toLowerCase().trim();
    const selectedRole = String(role).toLowerCase().trim();

  
    if (selectedRole === "admin") {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user || user.role !== "admin") {
        const msg = "Invalid admin credentials.";
        await logUserActivity({
          userId: user ? user._id : null,
          userEmail: normalizedEmail,
          action: `Failed admin login attempt (${normalizedEmail})`,
          ipAddress: req.ip,
          severity: "critical",
          category: "security",
        });
        if (isJsonRequest) return res.status(403).json({ success: false, message: msg });
        return res.redirect("/login?error=" + encodeURIComponent(msg));
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const msg = "Invalid admin credentials.";
        await logUserActivity({
          userId: user._id,
          userEmail: user.email,
          action: `Failed admin login attempt (incorrect password for ${user.email})`,
          ipAddress: req.ip,
          severity: "critical",
          category: "security",
        });
        if (isJsonRequest) return res.status(403).json({ success: false, message: msg });
        return res.redirect("/login?error=" + encodeURIComponent(msg));
      }

      await logUserActivity({
        userId: user._id,
        userEmail: user.email,
        action: `Admin logged in successfully (${user.email})`,
        ipAddress: req.ip,
        severity: "info",
        category: "auth",
      });

      return sendTokenResponse(user, 200, req, res);
    }

  
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const msg = "No account found with this email.";
      await logUserActivity({ userEmail: normalizedEmail, action: `Failed login attempt (unregistered email: ${normalizedEmail})`, ipAddress: req.ip, severity: "warning", category: "auth" });
      if (isJsonRequest) return res.status(401).json({ success: false, message: msg });
      return res.redirect("/login?error=" + encodeURIComponent(msg));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const msg = "Invalid password.";
      await logUserActivity({ userId: user._id, userEmail: user.email, action: `Failed login attempt (incorrect password for ${user.email})`, ipAddress: req.ip, severity: "warning", category: "auth" });
      if (isJsonRequest) return res.status(401).json({ success: false, message: msg });
      return res.redirect("/login?error=" + encodeURIComponent(msg));
    }

   
    if (user.role !== selectedRole) {
      const msg = `This account is registered as ${user.role}.`;
      await logUserActivity({ userId: user._id, userEmail: user.email, action: `Failed login attempt (role mismatch: attempted ${selectedRole}, actual ${user.role})`, ipAddress: req.ip, severity: "warning", category: "auth" });
      if (isJsonRequest) return res.status(403).json({ success: false, message: msg });
      return res.redirect("/login?error=" + encodeURIComponent(msg));
    }

    
    if (!user.isVerified) {
      const msg = "Please verify your email address before logging in.";
      await logUserActivity({ userId: user._id, userEmail: user.email, action: `Failed login attempt (unverified email)`, ipAddress: req.ip, severity: "warning", category: "auth" });
      if (isJsonRequest) {
        return res.status(403).json({
          success: false,
          message: msg,
          requiresVerification: true,
          email: user.email,
        });
      }
      return res.redirect("/login?error=" + encodeURIComponent(msg) + "&unverifiedEmail=" + encodeURIComponent(user.email));
    }

    await logUserActivity({ userId: user._id, userEmail: user.email, action: "User logged in successfully", ipAddress: req.ip, severity: "info", category: "auth" });

    return sendTokenResponse(user, 200, req, res);

  } catch (error) {
    console.error("Login Error:", error);
    if (isJsonRequest) return res.status(500).json({ success: false, message: "Server Error" });
    return res.redirect("/login?error=" + encodeURIComponent("Server Error"));
  }
};

exports.logout = async (req, res) => {
  if (req.user && req.user.id) {
    await logUserActivity({ userId: req.user.id, action: "User logged out", ipAddress: req.ip, severity: "info", category: "auth" });
  }
  res.clearCookie("token", { path: "/" });
  if (req.xhr || req.headers["content-type"]?.includes("json")) {
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  }
  return res.redirect("/login?message=" + encodeURIComponent("You have been logged out successfully."));
};


exports.updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    if (!language) {
      return res.status(400).json({ success: false, message: "Language preference is required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.preferredLanguage = language;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Preferred language updated to ${language}.`,
      preferredLanguage: user.preferredLanguage,
    });
  } catch (err) {
    console.error("Update Language Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmailFormat(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otpCode;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();
    try {
      await sendVerificationEmail({ to: normalizedEmail, otp: otpCode, name: user.name });
    } catch (emailErr) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    return res.status(200).json({
      success: true,
      message: `Verification email sent successfully to ${user.email}.`,
    });
  } catch (err) {
    console.error("Send OTP Error:", err);
    return res.status(500).json({ success: false, message: "Please enter a valid email address." });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP code are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: normalizedEmail,
      otp: otp.toString().trim(),
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification OTP code." });
    }

    user.isVerified = true;
    user.otp = "";
    user.otpExpires = null;
    await user.save();

    await logUserActivity(user._id, "Email address verified successfully", req.ip);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({ success: false, message: "Server Error verifying OTP." });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmailFormat(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid registered email address." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "No registered account found with this email address." });
    }

    // Generate secure 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOtp = otpCode;
    user.resetPasswordOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendPasswordResetEmail({ to: normalizedEmail, otp: otpCode, name: user.name });
    } catch (emailErr) {
      console.error("Password reset email delivery error:", emailErr);
      return res.status(500).json({ success: false, message: "Failed to send password reset OTP. Please check email address or SMTP configuration." });
    }

    await logUserActivity(user._id, `Password reset OTP requested for ${normalizedEmail}`, req.ip);

    return res.status(200).json({
      success: true,
      message: `Password reset OTP code has been sent to ${user.email}.`,
      email: normalizedEmail,
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ success: false, message: "Server Error processing forgot password request." });
  }
};

exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and 6-digit OTP code are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: "No registered account found with this email address." });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: "Invalid 6-digit password reset OTP code." });
    }

    if (!user.resetPasswordOtpExpiry || new Date(user.resetPasswordOtpExpiry).getTime() <= Date.now()) {
      return res.status(400).json({ success: false, message: "Password reset OTP has expired. Please request a new code." });
    }

    return res.status(200).json({
      success: true,
      message: "OTP code verified successfully! Please enter your new password below.",
      email: normalizedEmail,
    });
  } catch (err) {
    console.error("Verify Reset OTP Error:", err);
    return res.status(500).json({ success: false, message: "Server Error verifying password reset OTP." });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, resetToken, newPassword } = req.body;
    const targetEmail = email ? email.toLowerCase().trim() : null;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters long." });
    }

    let user = null;

    if (targetEmail && otp) {
      user = await User.findOne({ email: targetEmail });

      if (!user) {
        return res.status(404).json({ success: false, message: "No registered account found with this email address." });
      }

      if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp.toString().trim()) {
        return res.status(400).json({ success: false, message: "Invalid 6-digit reset OTP code." });
      }

      if (!user.resetPasswordOtpExpiry || new Date(user.resetPasswordOtpExpiry).getTime() <= Date.now()) {
        return res.status(400).json({ success: false, message: "Password reset OTP has expired. Please request a new code." });
      }
    } else if (resetToken) {
      user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
      }
    } else {
      return res.status(400).json({ success: false, message: "Email, OTP, and new password are required." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOtp = "";
    user.resetPasswordOtpExpiry = null;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;
    await user.save();

    await logUserActivity(user._id, "Password reset completed successfully", req.ip);

    return res.status(200).json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ success: false, message: "Server Error resetting password." });
  }
};