/**
 * ==========================================
 * COMPLAINT MODEL
 * ==========================================
 * MongoDB schema for help desk tickets, user feedback,
 * and complaint resolution tracking.
 */

const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["General", "Tuition Fee / Payment", "Tutor Quality / Behavior", "Technical / App Bug", "Schedule / Class Issue", "Other"],
      default: "General",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    adminReply: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);
