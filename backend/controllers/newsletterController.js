const Newsletter = require("../models/Newsletter");
const User = require("../models/User");

/**
 * POST /api/newsletter/subscribe
 * Public Newsletter Subscription Endpoint
 */
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Newsletter.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.status === "Unsubscribed") {
        existing.status = "Active";
        existing.unsubscribedAt = null;
        await existing.save();

        return res.status(200).json({
          success: true,
          message: "Welcome back! Your newsletter subscription has been re-activated.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "You are already subscribed to our newsletter!",
      });
    }

    await Newsletter.create({
      email: normalizedEmail,
      status: "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for subscribing to Smart HomeTutor newsletter!",
    });
  } catch (err) {
    console.error("Newsletter Subscription Error:", err);
    return res.status(500).json({
      success: false,
      message: "Subscription failed. Please try again.",
    });
  }
};

/**
 * ==========================================
 * ADMIN NEWSLETTER SUBSCRIBER MANAGERS
 * ==========================================
 */

/**
 * GET /api/admin/newsletter/subscribers
 * Retrieves all newsletter subscribers with registered User roles & MongoDB stats.
 */
exports.getSubscribers = async (req, res) => {
  try {
    const { search, status, role, sort } = req.query;

    // Build Mongoose sort query
    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    // Fetch all raw newsletter subscribers
    const rawSubscribers = await Newsletter.find().sort(sortOption);

    // Calculate real MongoDB Stats
    const totalSubscribers = rawSubscribers.length;
    const activeSubscribers = rawSubscribers.filter((s) => s.status === "Active").length;
    const unsubscribedCount = rawSubscribers.filter((s) => s.status === "Unsubscribed").length;

    // Cross-reference with User collection for role matching
    const subscriberEmails = rawSubscribers.map((s) => s.email);
    const registeredUsers = await User.find({ email: { $in: subscriberEmails } }).select("name email role createdAt");

    const userMap = new Map();
    registeredUsers.forEach((u) => {
      userMap.set(u.email.toLowerCase(), u);
    });

    // Enhance subscribers with registered User metadata
    let subscribers = rawSubscribers.map((item) => {
      const matchedUser = userMap.get(item.email);
      const userRole = matchedUser
        ? matchedUser.role.charAt(0).toUpperCase() + matchedUser.role.slice(1)
        : "Guest";

      return {
        _id: item._id,
        email: item.email,
        name: matchedUser ? (matchedUser.name || "Registered User") : "Guest Visitor",
        role: userRole, // Student | Tutor | Parent | Admin | Guest
        isRegistered: Boolean(matchedUser),
        status: item.status || "Active",
        createdAt: item.createdAt,
        unsubscribedAt: item.unsubscribedAt,
      };
    });

    // Apply Search Filter (by email or matched user name)
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      subscribers = subscribers.filter(
        (s) => s.email.includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    // Apply Status Filter (Active / Unsubscribed)
    if (status && status !== "all") {
      subscribers = subscribers.filter(
        (s) => s.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Apply Role Filter (Student / Tutor / Parent / Admin / Guest)
    if (role && role !== "all") {
      subscribers = subscribers.filter(
        (s) => s.role.toLowerCase() === role.toLowerCase()
      );
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalSubscribers,
        activeSubscribers,
        unsubscribedCount,
      },
      count: subscribers.length,
      subscribers,
    });
  } catch (err) {
    console.error("Admin Get Newsletter Subscribers Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error retrieving newsletter subscribers.",
    });
  }
};

/**
 * PATCH /api/admin/newsletter/subscribers/:id/unsubscribe
 * Safely unsubscribes a newsletter subscriber without deleting audit records.
 */
exports.unsubscribeSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await Newsletter.findById(id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Newsletter subscriber not found.",
      });
    }

    subscriber.status = "Unsubscribed";
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return res.status(200).json({
      success: true,
      message: `Subscriber ${subscriber.email} has been unsubscribed.`,
      subscriber,
    });
  } catch (err) {
    console.error("Admin Unsubscribe Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error unsubscribing newsletter subscriber.",
    });
  }
};
