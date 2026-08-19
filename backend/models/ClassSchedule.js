/**
 * ==========================================
 * CLASS SCHEDULE MODEL
 * ==========================================
 * MongoDB schema for regular class sessions,
 * calendar dates, rescheduling, and student attendance logs.
 */

const mongoose = require("mongoose");

const classScheduleSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    startTime: {
      type: String,
      default: "18:00",
    },
    endTime: {
      type: String,
      default: "19:00",
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "Rescheduled"],
      default: "Scheduled",
    },
    attendance: {
      type: String,
      enum: ["Pending", "Present", "Absent"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ClassSchedule", classScheduleSchema);
