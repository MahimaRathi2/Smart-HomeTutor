/**
 * ==========================================
 * PROGRESS REPORT MODEL
 * ==========================================
 * MongoDB schema for tracking 30-day automated progress reports
 * for Students and Tutors, PDF paths, and email delivery statuses.
 */

const mongoose = require("mongoose");

const progressReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "tutor"],
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    periodIndex: {
      type: Number,
      default: 1,
    },
    pdfPath: {
      type: String,
      default: "",
    },
    pdfFilename: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    emailStatus: {
      type: String,
      enum: ["Pending", "Email Sent", "Email Failed"],
      default: "Pending",
    },
    sentAt: {
      type: Date,
    },
    errorLog: {
      type: String,
      default: "",
    },
    metricsSnapshot: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reports for the same user, role, and reporting period
progressReportSchema.index(
  { user: 1, role: 1, periodStart: 1, periodEnd: 1 },
  { unique: true }
);

module.exports = mongoose.model("ProgressReport", progressReportSchema);
