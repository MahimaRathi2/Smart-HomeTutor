
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { createNotification, createAdminNotification } = require("../utils/notificationHelper");
const { logUserActivity } = require("../utils/activityLogHelper");
exports.submitComplaint = async (req, res) => {
  try {
    const { subject, description } = req.body;
    const userId = req.user.id;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: "Subject and description are required." });
    }
    const complaint = await Complaint.create({
      user: userId,
      subject,
      description,
      status: "Pending",
    });

    const user = await User.findById(userId).select("name email role");
    const userName = user ? (user.name || user.email) : "User";
    const userRole = user ? user.role : "student";

    await createNotification({
      userId,
      title: "Help Desk Ticket Submitted 🎟️",
      message: `Your ticket #${complaint._id.toString().substring(18)} ('${subject}') has been submitted to support.`,
      type: "system",
      app: req.app,
    });

    await createAdminNotification({
      title: "New Complaint",
      message: `${userName} (${userRole.charAt(0).toUpperCase() + userRole.slice(1)}) submitted a complaint ticket regarding "${subject}".`,
      sourceUser: userId,
      sourceRole: userRole,
      type: "dispute",
      actionUrl: "/dashboard/admin?tab=disputes",
      app: req.app,
    });

    await logUserActivity(userId, `Submitted complaint ticket: ${subject}`, req.ip);

    return res.status(201).json({
      success: true,
      message: "Help desk ticket / complaint submitted successfully!",
      complaint,
    });
  } catch (err) {
    console.error("Submit Complaint Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, complaints });
  } catch (err) {
    console.error("Get Complaints Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
