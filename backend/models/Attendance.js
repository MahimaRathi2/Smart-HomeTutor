/**
 * ==========================================
 * ATTENDANCE MODEL
 * ==========================================
 * MongoDB schema for tracking student class attendance,
 * present/absent logs, and subject-wise metrics.
 */

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
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
    classSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassSchedule",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookingRequest",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Pending"],
      default: "Present",
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance records for the same student + classSchedule
attendanceSchema.index({ student: 1, classSchedule: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
