/**
 * ==========================================
 * CERTIFICATE REQUEST MODEL
 * ==========================================
 * MongoDB schema for course completion certificate requests
 * submitted by tutors and requiring Admin approval.
 */

const mongoose = require("mongoose");

const certificateRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    attendancePercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    completedClasses: {
      type: Number,
      default: 12,
    },
    paymentStatus: {
      type: String,
      enum: ["Completed", "Pending", "Waived"],
      default: "Completed",
    },
    tutorRemarks: {
      type: String,
      default: "",
    },
    adminRemarks: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CertificateRequest", certificateRequestSchema);
