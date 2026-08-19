/**
 * ==========================================
 * ANNOUNCEMENT MODEL
 * ==========================================
 * MongoDB schema for platform announcements,
 * system notifications, and admin broadcasts.
 */

const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    targetRole: {
      type: String,
      enum: ["all", "student", "tutor", "parent"],
      default: "all",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Announcement", announcementSchema);
