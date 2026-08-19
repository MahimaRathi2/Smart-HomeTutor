/**
 * ==========================================
 * ACTIVITY LOG HELPER
 * ==========================================
 * Helper function for security audit tracking & user activity logs in MongoDB.
 * Includes accurate Client IP resolution and IPv6/localhost normalization.
 */

const mongoose = require("mongoose");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

/**
 * Safely extracts and normalizes the client IP address from an Express request object,
 * request headers (X-Forwarded-For), or a raw IP string.
 *
 * @param {Object|string} input - Express req object or raw IP string
 * @returns {string} Clean, normalized client IP address (e.g., "203.0.113.195", "127.0.0.1")
 */
const getClientIp = (input) => {
  if (!input) return "127.0.0.1";

  let rawIp = "";

  // 1. If Express request object (or object containing req / headers / socket / ip)
  if (typeof input === "object" && input !== null && !input._bsontype) {
    const reqObj = input.req || input;

    if (reqObj.headers) {
      const xForwardedFor = reqObj.headers["x-forwarded-for"] || reqObj.headers["X-Forwarded-For"];
      if (xForwardedFor) {
        const ips = Array.isArray(xForwardedFor) ? xForwardedFor.join(",") : String(xForwardedFor);
        rawIp = ips.split(",")[0].trim();
      }
    }

    if (!rawIp && reqObj.ip) {
      rawIp = String(reqObj.ip).trim();
    }

    if (!rawIp && reqObj.socket && reqObj.socket.remoteAddress) {
      rawIp = String(reqObj.socket.remoteAddress).trim();
    }

    if (!rawIp && reqObj.connection && reqObj.connection.remoteAddress) {
      rawIp = String(reqObj.connection.remoteAddress).trim();
    }

    if (!rawIp && typeof input.ipAddress === "string") {
      rawIp = input.ipAddress.trim();
    }
  } else if (typeof input === "string") {
    rawIp = input.trim();
  }

  if (!rawIp) return "127.0.0.1";

  // Handle multiple comma-separated IPs (take client IP from first hop)
  if (rawIp.includes(",")) {
    rawIp = rawIp.split(",")[0].trim();
  }

  // Normalize IPv6 loopback and IPv4-mapped IPv6 formats
  if (rawIp === "::1" || rawIp === "::ffff:127.0.0.1") {
    return "127.0.0.1";
  }

  if (rawIp.startsWith("::ffff:")) {
    rawIp = rawIp.replace("::ffff:", "");
  }

  return rawIp || "127.0.0.1";
};

/**
 * Log user security action to MongoDB
 * Supports positional params: logUserActivity(userId, action, reqOrIp)
 * and object options: logUserActivity({ userId, userEmail, action, ipAddress, req, severity, category })
 */
const logUserActivity = async (param1, param2, param3) => {
  try {
    let userId = null;
    let userEmail = "";
    let action = "";
    let rawIpInput = "127.0.0.1";
    let severity = "info";
    let category = "user_action";

    if (typeof param1 === "object" && param1 !== null && !param1._bsontype) {
      userId = param1.userId || null;
      userEmail = param1.userEmail || "";
      action = param1.action || "";
      rawIpInput = param1.req || param1.ipAddress || "127.0.0.1";
      severity = param1.severity || "info";
      category = param1.category || "user_action";
    } else {
      userId = param1 || null;
      action = param2 || "";
      rawIpInput = param3 || "127.0.0.1";
    }

    if (!action) return null;

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      userId = null;
    }

    const cleanIp = getClientIp(rawIpInput);
    const lower = action.toLowerCase();

    // 1. Enforce severity & category classification
    if (lower.includes("logged in successfully") || lower.includes("successful login")) {
      severity = "info";
      category = "auth";
    } else if (
      lower.includes("unauthorized") ||
      lower.includes("invalid jwt") ||
      lower.includes("failed admin login") ||
      lower.includes("security violation")
    ) {
      severity = "critical";
      category = "security";
    } else if (lower.includes("failed login") || lower.includes("role mismatch")) {
      severity = "warning";
      category = "auth";
    } else if (lower.includes("password reset") || lower.includes("otp")) {
      severity = lower.includes("completed") ? "info" : "warning";
      category = "auth";
    }

    // 2. Auto-populate userEmail if userId is present and userEmail wasn't passed
    if (userId && !userEmail) {
      try {
        const u = await User.findById(userId).select("email");
        if (u) userEmail = u.email;
      } catch (e) {}
    }

    return await ActivityLog.create({
      user: userId,
      userEmail: userEmail ? userEmail.toLowerCase().trim() : "",
      action,
      ipAddress: cleanIp,
      severity,
      category,
    });
  } catch (err) {
    console.error("Activity Log Error:", err);
    return null;
  }
};

module.exports = { logUserActivity, getClientIp };
