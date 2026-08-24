const webpush = require("web-push");
const Notification = require("../models/Notification");
const User = require("../models/User");

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMe5a3k9bY4xV9E8yKx-N5wF8J2_9cWqP3_kR3n2M5m7p9q1w3e5r";
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || "4u7e3w2q1r0t9y8u7i6o5p4a3s2d1f0g9h8j7k6l5m4";

try {
  webpush.setVapidDetails("mailto:support@smarthometutor.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (vErr) {
  console.warn("VAPID details setup notice:", vErr.message);
}

/**
 * Create a persistent notification in MongoDB for Student, Parent, or Tutor
 */
const createNotification = async ({ userId, role, title, message, type = "system", actionUrl = "", app }) => {
  try {
    if (!userId || !title || !message) return null;

    let userRole = role;
    if (!userRole) {
      const recipient = await User.findById(userId).select("role pushSubscriptions");
      if (recipient) {
        userRole = recipient.role;
      }
    }

    const notificationDoc = await Notification.create({
      user: userId,
      role: userRole || "student",
      title,
      message,
      type,
      actionUrl,
      isRead: false,
      read: false,
    });

    // 1. Socket.IO Real-Time Notification
    if (app) {
      const io = app.get("io");
      const onlineUsers = app.get("onlineUsers");
      if (io && onlineUsers) {
        const recipientSocketId = onlineUsers.get(userId.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("receiveNotification", notificationDoc);
        }
      }
    }

    // 2. Web Push Notification
    try {
      const user = await User.findById(userId).select("pushSubscriptions");
      if (user && user.pushSubscriptions && user.pushSubscriptions.length > 0) {
        const pushPayload = JSON.stringify({
          title,
          body: message,
          type,
          url: actionUrl || "/dashboard",
        });

        for (const sub of user.pushSubscriptions) {
          webpush.sendNotification(sub, pushPayload).catch(async (pErr) => {
            if (pErr.statusCode === 404 || pErr.statusCode === 410) {
              await User.updateOne({ _id: userId }, { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }).catch(() => {});
            }
          });
        }
      }
    } catch (pushErr) {
      console.warn("Web Push notification error:", pushErr.message);
    }

    return notificationDoc;
  } catch (err) {
    console.error("Create Notification Helper Error:", err);
    return null;
  }
};

/**
 * Create an Admin Panel notification in MongoDB and emit real-time Socket.IO event to Admin(s)
 */
const createAdminNotification = async ({
  title = "New Demo Class Request",
  message,
  sourceUser = null,
  sourceRole = null,
  type = "tutor_request",
  actionUrl = "/dashboard/admin?tab=demo-requests",
  app,
}) => {
  try {
    if (!title || !message) return [];

    // Find admin users (case-insensitive role search or admin email)
    let adminUsers = await User.find({ role: { $regex: /^admin$/i } }).select("_id role");
    if (!adminUsers || adminUsers.length === 0) {
      adminUsers = await User.find({ email: process.env.ADMIN_EMAIL || "useradmin2005@gmail.com" }).select("_id role");
    }
    if (!adminUsers || adminUsers.length === 0) return [];

    const createdNotifications = [];
    for (const admin of adminUsers) {
      // Rapid double-click guard (5 seconds for exact same sourceUser, title, and message)
      const duplicateFilter = {
        user: admin._id,
        title,
        message,
        createdAt: { $gte: new Date(Date.now() - 5 * 1000) },
      };
      if (sourceUser) duplicateFilter.sourceUser = sourceUser;

      const existing = await Notification.findOne(duplicateFilter);

      if (!existing) {
        const notif = await Notification.create({
          user: admin._id,
          role: "admin",
          sourceUser: sourceUser || null,
          sourceRole: sourceRole || null,
          title,
          message,
          type,
          actionUrl,
          isRead: false,
          read: false,
        });

        createdNotifications.push(notif);

        // Real-Time Socket.IO Broadcast to Admin Room & Sockets
        if (app) {
          const io = app.get("io");
          if (io) {
            io.to("admin").emit("receiveNotification", notif);
            io.to("admin").emit("receiveAdminNotification", notif);
            io.emit("receiveAdminNotification", notif);

            const onlineUsers = app.get("onlineUsers");
            if (onlineUsers) {
              const socketId = onlineUsers.get(admin._id.toString());
              if (socketId) {
                io.to(socketId).emit("receiveNotification", notif);
                io.to(socketId).emit("receiveAdminNotification", notif);
              }
            }
          }
        }
      }
    }

    return createdNotifications;
  } catch (err) {
    console.error("Create Admin Notification Error:", err);
    return [];
  }
};

module.exports = { createNotification, createAdminNotification };
