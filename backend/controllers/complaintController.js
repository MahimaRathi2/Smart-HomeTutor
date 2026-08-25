const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { createNotification, createAdminNotification } = require("../utils/notificationHelper");
const { logUserActivity } = require("../utils/activityLogHelper");

exports.submitComplaint = async (req, res) => {
  try {
    const { category, subject, description, relatedUser } = req.body;
    const userId = req.user.id; // Strictly from auth token

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: "Subject and description are required." });
    }

    const complaint = await Complaint.create({
      user: userId,
      category: category || "General",
      subject: subject.trim(),
      description: description.trim(),
      relatedUser: relatedUser || null,
      status: "Pending",
    });

    const user = await User.findById(userId).select("name email role");
    const userName = user ? (user.name || user.email) : "User";
    const userRole = user ? user.role : "student";

    await createNotification({
      userId,
      title: "Help Desk Ticket Submitted 🎟️",
      message: `Your complaint ticket #${complaint._id.toString().substring(18)} ('${subject}') has been submitted to support.`,
      type: "system",
      app: req.app,
    });

    await createAdminNotification({
      title: "New Complaint Submitted",
      message: `${userName} (${userRole.charAt(0).toUpperCase() + userRole.slice(1)}) submitted a complaint ticket: "${subject}".`,
      sourceUser: userId,
      sourceRole: userRole,
      type: "dispute",
      actionUrl: "/dashboard/admin?tab=disputes",
      app: req.app,
    });

    await logUserActivity(userId, `Submitted complaint ticket: ${subject}`, req.ip);

    return res.status(201).json({
      success: true,
      message: "Complaint ticket submitted successfully!",
      complaint,
    });
  } catch (err) {
    console.error("Submit Complaint Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    // Strictly filter by logged-in user ID
    const complaints = await Complaint.find({ user: req.user.id })
      .populate("relatedUser", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, complaints });
  } catch (err) {
    console.error("Get Complaints Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id)
      .populate("user", "name email role")
      .populate("relatedUser", "name email role");

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint ticket not found." });
    }

    // Ownership & Role-Based Security Enforcement
    const isOwner = complaint.user && complaint.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access to complaint ticket." });
    }

    return res.status(200).json({ success: true, complaint });
  } catch (err) {
    console.error("Get Complaint By ID Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
