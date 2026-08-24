/**
 * ==========================================
 * USER MODEL
 * ==========================================
 * MongoDB schema for users (students, tutors, parents, admins)
 * including wallet balance, favorites, OTP verification, and password reset tokens.
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "tutor", "parent", "admin"],
      default: "student",
    },

    tutorStatus: {
      type: String,
      enum: ["not_applied", "pending", "approved", "rejected"],
      default: "not_applied",
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TutorProfile",
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },

    chatUnlockedByAdmin: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: "",
    },

    otpExpires: {
      type: Date,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: "",
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    resetPasswordOtp: {
      type: String,
      default: "",
    },

    resetPasswordOtpExpiry: {
      type: Date,
      default: null,
    },

    // PART 2 ADDITIONAL FEATURES
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    referredBy: {
      type: String,
      default: "",
    },

    referralEarnings: {
      type: Number,
      default: 0,
    },

    preferredLanguage: {
      type: String,
      default: "English",
    },

    pushSubscriptions: [
      {
        endpoint: { type: String },
        expirationTime: { type: String, default: null },
        keys: {
          p256dh: { type: String },
          auth: { type: String }
        }
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);