const Message = require("../models/Message");
const User = require("../models/User");
const ChildProfile = require("../models/ChildProfile");
const ClassSchedule = require("../models/ClassSchedule");
const BookingRequest = require("../models/BookingRequest");
const path = require("path");
const fs = require("fs");

async function verifyParentTutorAccess(parentId, tutorUserId) {
  const children = await ChildProfile.find({ parent: parentId });
  const studentIds = children.map((c) => c.student).filter(Boolean);

  if (studentIds.length === 0) return false;

  const hasSchedule = await ClassSchedule.exists({
    student: { $in: studentIds },
    tutor: tutorUserId,
  });
  if (hasSchedule) return true;

  const hasBooking = await BookingRequest.exists({
    student: { $in: studentIds },
    tutor: tutorUserId,
    status: "Accepted",
  });
  if (hasBooking) return true;

  return false;
}

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, fileUrl, fileType, fileName, fileSize } = req.body;
    const senderId = req.user.id;

    if (!recipientId || (!content && !fileUrl)) {
      return res.status(400).json({
        success: false,
        message: "Recipient and content or file are required.",
      });
    }

    if (req.user.role === "parent") {
      const isAllowed = await verifyParentTutorAccess(senderId, recipientId);
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You can only message tutors assigned to your linked children.",
        });
      }
    }

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const receiverSocketId = onlineUsers ? onlineUsers.get(recipientId) : null;

    const initialStatus = receiverSocketId ? "delivered" : "sent";

    const newMessage = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content: content || "",
      fileUrl: fileUrl || "",
      fileType: fileType || "none",
      fileName: fileName || "",
      fileSize: fileSize || "",
      status: initialStatus,
    });

    const populated = await Message.findById(newMessage._id)
      .populate("sender", "name email role")
      .populate("recipient", "name email role");

    if (receiverSocketId && io) {
      io.to(receiverSocketId).emit("receiveMessage", populated);
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: populated,
    });
  } catch (err) {
    console.error("Send Message Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { otherUserId } = req.params;

    if (req.user.role === "parent") {
      const isAllowed = await verifyParentTutorAccess(currentUserId, otherUserId);
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You can only access chat history with tutors assigned to your linked children.",
        });
      }
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email role")
      .populate("recipient", "name email role");

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error("Get Messages Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.markAsSeen = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { otherUserId } = req.params;

    await Message.updateMany(
      { sender: otherUserId, recipient: currentUserId, read: false },
      { $set: { read: true, status: "seen" } }
    );

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const senderSocketId = onlineUsers ? onlineUsers.get(otherUserId) : null;

    if (senderSocketId && io) {
      io.to(senderSocketId).emit("messagesSeen", { seenBy: currentUserId });
    }

    return res.status(200).json({
      success: true,
      message: "Messages marked as seen",
    });
  } catch (err) {
    console.error("Mark Seen Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name email role")
      .populate("recipient", "name email role");

    const conversationMap = new Map();

    for (const msg of messages) {
      if (!msg.sender || !msg.recipient) continue;
      const isSender = msg.sender._id.toString() === currentUserId;
      const otherUser = isSender ? msg.recipient : msg.sender;

      if (!otherUser || !otherUser._id) continue;

      const otherUserIdStr = otherUser._id.toString();

      if (!conversationMap.has(otherUserIdStr)) {
        conversationMap.set(otherUserIdStr, {
          user: otherUser,
          lastMessage: msg.content || (msg.fileName ? `📎 ${msg.fileName}` : "Attachment"),
          lastMessageTime: msg.createdAt,
          unreadCount: (!isSender && !msg.read) ? 1 : 0,
        });
      } else {
        if (!isSender && !msg.read) {
          const conv = conversationMap.get(otherUserIdStr);
          conv.unreadCount += 1;
        }
      }
    }

    const conversations = Array.from(conversationMap.values());

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (err) {
    console.error("Get Conversations Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file was uploaded." });
    }

    const file = req.file;
    const fileName = file.originalname;
    const ext = path.extname(fileName).toLowerCase();

    let fileType = "other";
    if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)) {
      fileType = "image";
    } else if (ext === ".pdf") {
      fileType = "pdf";
    } else if ([".doc", ".docx"].includes(ext)) {
      fileType = "docx";
    }

    const fileSizeBytes = file.size;
    let fileSizeStr = `${(fileSizeBytes / 1024).toFixed(1)} KB`;
    if (fileSizeBytes >= 1024 * 1024) {
      fileSizeStr = `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    const fileUrl = `/uploads/chat/${file.filename}`;

    return res.status(200).json({
      success: true,
      fileUrl,
      fileType,
      fileName,
      fileSize: fileSizeStr,
    });
  } catch (err) {
    console.error("Upload File Error:", err);
    return res.status(500).json({ success: false, message: "Failed to process file upload." });
  } 
};
