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
      type: "dispute",
      actionUrl: "/dashboard?tab=complaints",
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

/**
 * ==========================================
 * COMPLAINT CHAT CONTROLLERS
 * ==========================================
 */
const Message = require("../models/Message");

/**
 * GET /api/complaints/:complaintId/messages
 * Retrieves all messages belonging strictly to the specified complaint ticket.
 */
exports.getComplaintMessages = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const complaint = await Complaint.findById(complaintId).populate("user", "name email role");
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint ticket not found." });
    }

    // Ownership & Role-Based Security Enforcement
    const isOwner = complaint.user && complaint.user._id.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access to complaint ticket conversation." });
    }

    // Fetch conversation thread
    const messages = await Message.find({ complaint: complaintId })
      .populate("sender", "name email role")
      .populate("recipient", "name email role")
      .sort({ createdAt: 1 });

    // Mark unread messages as read for receiver
    await Message.updateMany(
      { complaint: complaintId, recipient: userId, read: false },
      { $set: { read: true, status: "seen" } }
    );

    // Reset unread counter on complaint document
    if (isAdmin) {
      complaint.unreadCountAdmin = 0;
    } else {
      complaint.unreadCountUser = 0;
    }
    await complaint.save();

    return res.status(200).json({
      success: true,
      complaint,
      messages,
    });
  } catch (err) {
    console.error("Get Complaint Messages Error:", err);
    return res.status(500).json({ success: false, message: "Server Error loading complaint messages." });
  }
};

/**
 * POST /api/complaints/:complaintId/messages
 * Send a new message inside a specific complaint ticket.
 */
exports.sendComplaintMessage = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { content, fileUrl, fileType, fileName, fileSize } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;

    if (!content && !fileUrl) {
      return res.status(400).json({ success: false, message: "Message content or attachment is required." });
    }

    const complaint = await Complaint.findById(complaintId).populate("user", "name email role");
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint ticket not found." });
    }

    // Ownership & Security Enforcement
    const isOwner = complaint.user && complaint.user._id.toString() === senderId;
    const isAdmin = senderRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized: You cannot post in this complaint conversation." });
    }

    // Determine Recipient
    let recipientId;
    if (isAdmin) {
      recipientId = complaint.user._id;
    } else {
      // User sending to admin -> find an admin user or fallback
      const adminUser = await User.findOne({ role: "admin" }).select("_id");
      recipientId = adminUser ? adminUser._id : complaint.user._id;
    }

    // Reopen complaint if user sends new message to resolved/closed complaint
    if (!isAdmin && (complaint.status === "Resolved" || complaint.status === "Closed" || complaint.status === "Rejected")) {
      complaint.status = "In Progress";
    } else if (isAdmin && complaint.status === "Pending") {
      complaint.status = "In Progress";
    }

    // Update adminReply preview on complaint if sent by admin
    if (isAdmin && content) {
      complaint.adminReply = content;
    }

    // Create Message Document
    const messageDoc = await Message.create({
      complaint: complaintId,
      sender: senderId,
      recipient: recipientId,
      content: content || "",
      fileUrl: fileUrl || "",
      fileType: fileType || "none",
      fileName: fileName || "",
      fileSize: fileSize || "",
      read: false,
      status: "sent",
    });

    // Update complaint counters and timestamp
    complaint.lastMessageAt = new Date();
    if (isAdmin) {
      complaint.unreadCountUser = (complaint.unreadCountUser || 0) + 1;
    } else {
      complaint.unreadCountAdmin = (complaint.unreadCountAdmin || 0) + 1;
    }
    await complaint.save();

    const populatedMessage = await Message.findById(messageDoc._id)
      .populate("sender", "name email role")
      .populate("recipient", "name email role");

    const tktCode = complaint._id.toString().substring(18).toUpperCase();

    // Trigger Notifications
    if (isAdmin) {
      // Admin replied -> Notify User
      await createNotification({
        userId: recipientId,
        title: "Admin Replied to Ticket 💬",
        message: `Admin replied to your complaint #${tktCode}: "${content ? (content.length > 50 ? content.substring(0, 50) + "..." : content) : "Attachment uploaded"}"`,
        type: "dispute",
        actionUrl: "/dashboard?tab=complaints",
        app: req.app,
      });
    } else {
      // User replied -> Notify Admin
      const senderUser = await User.findById(senderId).select("name email role");
      const senderName = senderUser ? (senderUser.name || senderUser.email) : "User";
      await createAdminNotification({
        title: `New Message on Ticket #${tktCode}`,
        message: `${senderName} sent a message on complaint #${tktCode}: "${content ? (content.length > 50 ? content.substring(0, 50) + "..." : content) : "Attachment uploaded"}"`,
        sourceUser: senderId,
        sourceRole: senderRole,
        type: "dispute",
        actionUrl: "/dashboard/admin?tab=disputes",
        app: req.app,
      });
    }

    // Real-Time Socket.IO Broadcast
    const io = req.app.get("io");
    if (io) {
      // Emit to specific complaint room and user rooms
      io.to(`complaint_${complaintId}`).emit("receiveComplaintMessage", populatedMessage);
      io.to(recipientId.toString()).emit("receiveComplaintMessage", populatedMessage);
      io.to(senderId.toString()).emit("receiveComplaintMessage", populatedMessage);
      if (!isAdmin) {
        io.to("admin").emit("receiveComplaintMessage", populatedMessage);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Complaint message sent successfully.",
      data: populatedMessage,
      complaintStatus: complaint.status,
    });
  } catch (err) {
    console.error("Send Complaint Message Error:", err);
    return res.status(500).json({ success: false, message: "Server Error sending complaint message." });
  }
};

/**
 * PATCH /api/complaints/:complaintId/messages/read
 * Mark all complaint messages as read for the current user.
 */
exports.markComplaintMessagesRead = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint ticket not found." });
    }

    const isOwner = complaint.user && complaint.user.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access." });
    }

    await Message.updateMany(
      { complaint: complaintId, recipient: userId, read: false },
      { $set: { read: true, status: "seen" } }
    );

    if (isAdmin) {
      complaint.unreadCountAdmin = 0;
    } else {
      complaint.unreadCountUser = 0;
    }
    await complaint.save();

    return res.status(200).json({ success: true, message: "Complaint messages marked as read." });
  } catch (err) {
    console.error("Mark Complaint Messages Read Error:", err);
    return res.status(500).json({ success: false, message: "Server Error marking messages as read." });
  }
};
