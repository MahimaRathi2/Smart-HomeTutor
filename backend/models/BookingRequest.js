const mongoose = require("mongoose");

const bookingRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },

    tutorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TutorProfile",
      required: false,
      default: null,
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },

    message: {
      type: String,
      default: "",
    },

    // PART 2 LOCATION & TRIAL CLASS MANAGEMENT
    isTrial: {
      type: Boolean,
      default: true,
    },

    address: {
      type: String,
      default: "",
    },

    coordinates: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.2090 },
    },

    isHomeVisit: {
      type: Boolean,
      default: false,
    },

    homeVisitStatus: {
      type: String,
      enum: ["Scheduled", "En Route", "Arrived", "Completed", "N/A"],
      default: "N/A",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BookingRequest", bookingRequestSchema);