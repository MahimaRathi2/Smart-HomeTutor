/**
 * ==========================================
 * PAYMENT MODEL
 * ==========================================
 * MongoDB schema for storing Razorpay payments,
 * order IDs, verification signatures, and invoice references.
 */

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "parent", "tutor", "admin"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
      default: "",
    },
    orderId: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      default: "",
    },
    invoiceId: {
      type: String,
      default: "",
    },
    paymentType: {
      type: String,
      enum: ["Wallet Topup", "Tuition Invoice Payment", "Payout Request"],
      default: "Wallet Topup",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
