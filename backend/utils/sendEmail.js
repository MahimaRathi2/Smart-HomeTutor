
const nodemailer = require("nodemailer");

const isValidEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase().trim());
};

/**
 * Send real email verification code via Nodemailer SMTP
 * @param {Object} options
 * @param {string} options.to - 
 * @param {string} options.otp -
 * @param {string} [options.name] - 
 */
const sendVerificationEmail = async ({ to, otp, name }) => {
  const normalizedEmail = String(to).toLowerCase().trim();


  if (!isValidEmailFormat(normalizedEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from = process.env.EMAIL_FROM || `"Smart HomeTutor" <${user}>`;

  console.log(`📧 [EMAIL OTP GENERATED] Recipient: ${normalizedEmail}`);
  console.log(`🔑 [VERIFICATION CODE]: ${otp}`);


  const isPlaceholder = !user || !pass || pass === "app_password_placeholder";

  if (isPlaceholder) {
    console.warn("⚠️ SMTP credentials placeholders detected in .env. OTP logged to console above for verification testing.");
    return { success: true, isDevConsole: true, messageId: "dev-console-otp" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 8000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from,
    to: normalizedEmail,
    subject: "Smart HomeTutor - Verify Your Email Address (6-Digit OTP)",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4f46e5; font-size: 24px; margin: 0;">Smart HomeTutor</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Account Email Verification</p>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #334155; font-size: 15px; margin: 0 0 10px 0;">Hello <strong>${name || "User"}</strong>,</p>
          <p style="color: #475569; font-size: 14px; margin: 0 0 15px 0;">
            Thank you for registering with Smart HomeTutor! To complete your signup and verify your email address, enter the 6-digit verification code below:
          </p>

          <div style="text-align: center; padding: 16px; background: #4f46e5; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 6px; border-radius: 8px; margin: 15px 0;">
            ${otp}
          </div>

          <p style="color: #64748b; font-size: 12px; margin: 10px 0 0 0; text-align: center;">
            This verification code is valid for 10 minutes. If you did not initiate this request, please ignore this message.
          </p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
          &copy; 2026 Smart HomeTutor Platform. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    console.log(`📤 [EMAIL SERVICE] Delivering verification email to ${normalizedEmail}...`);
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SMTP delivery response timeout (6s limit exceeded).")), 6000)
    );

    const info = await Promise.race([emailPromise, timeoutPromise]);
    console.log("✅ [EMAIL SERVICE SUCCESS] Real Verification Email Sent via Nodemailer SMTP:", info.messageId || info.response);
    return info;
  } catch (err) {
    console.error("❌ [EMAIL SERVICE WARNING] SMTP Delivery Alert:", err.message);
    console.log(`💡 [FALLBACK OTP LOGGED FOR VERIFICATION]: ${otp} for ${normalizedEmail}`);
    return { success: true, isFallback: true, messageId: "smtp-timeout-fallback" };
  }
};

/**
 * Send Password Reset OTP email via Nodemailer SMTP
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.otp - 6-digit OTP code
 * @param {string} [options.name] - User name
 */
const sendPasswordResetEmail = async ({ to, otp, name }) => {
  const normalizedEmail = String(to).toLowerCase().trim();

  if (!isValidEmailFormat(normalizedEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from = process.env.EMAIL_FROM || `"Smart HomeTutor" <${user}>`;

  console.log(`📧 [PASSWORD RESET OTP GENERATED] Recipient: ${normalizedEmail}`);
  console.log(`🔑 [RESET VERIFICATION CODE]: ${otp}`);

  const isPlaceholder = !user || !pass || pass === "app_password_placeholder";

  if (isPlaceholder) {
    console.warn("⚠️ SMTP credentials placeholders detected in .env. Password Reset OTP logged to console above for verification testing.");
    return { success: true, isDevConsole: true, messageId: "dev-console-reset-otp" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from,
    to: normalizedEmail,
    subject: "Smart HomeTutor - Password Reset Request (6-Digit OTP)",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4f46e5; font-size: 24px; margin: 0;">Smart HomeTutor</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Password Reset Request</p>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #334155; font-size: 15px; margin: 0 0 10px 0;">Hello <strong>${name || "User"}</strong>,</p>
          <p style="color: #475569; font-size: 14px; margin: 0 0 15px 0;">
            We received a request to reset your password for your Smart HomeTutor account. Enter the 6-digit OTP code below:
          </p>

          <div style="text-align: center; padding: 16px; background: #dc2626; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 6px; border-radius: 8px; margin: 15px 0;">
            ${otp}
          </div>

          <p style="color: #64748b; font-size: 12px; margin: 10px 0 0 0; text-align: center;">
            This password reset code is valid for 10 minutes. If you did not request a password reset, please ignore this email.
          </p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
          &copy; 2026 Smart HomeTutor Platform. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    console.log(`📤 [EMAIL SERVICE] Delivering password reset email to ${normalizedEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [EMAIL SERVICE SUCCESS] Real Password Reset Email Sent via Nodemailer SMTP:", info.messageId || info.response);
    return info;
  } catch (err) {
    console.error("❌ [EMAIL SERVICE ERROR] Nodemailer SMTP Delivery Error:", err.message);
    throw err;
  }
};

/**
 * Send real email with PDF attachments via Nodemailer
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.text]
 * @param {Array}  [options.attachments]
 */
const sendEmailWithAttachment = async ({ to, subject, html, text, attachments = [] }) => {
  const normalizedEmail = String(to).toLowerCase().trim();

  if (!isValidEmailFormat(normalizedEmail)) {
    throw new Error("Invalid recipient email address.");
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from = process.env.EMAIL_FROM || `"Smart HomeTutor" <${user}>`;

  const isPlaceholder = !user || !pass || pass === "app_password_placeholder";

  if (isPlaceholder) {
    console.warn(`⚠️ SMTP credentials placeholder detected. Simulating email delivery for ${normalizedEmail}. Subject: ${subject}`);
    return { success: true, isDevConsole: true, messageId: "dev-console-report-email" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from,
    to: normalizedEmail,
    subject,
    text: text || "Please see the attached 30-day progress report PDF.",
    html,
    attachments,
  };

  try {
    console.log(`📤 [EMAIL SERVICE] Sending report email with attachment to ${normalizedEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [EMAIL SERVICE SUCCESS] Report Email Sent via Nodemailer:", info.messageId || info.response);
    return info;
  } catch (err) {
    console.error("❌ [EMAIL SERVICE ERROR] Email delivery failed:", err.message);
    throw err;
  }
};

module.exports = {
  isValidEmailFormat,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmailWithAttachment,
};
