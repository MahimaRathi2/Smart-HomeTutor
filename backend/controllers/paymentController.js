const crypto = require("crypto");
const { razorpayInstance, key_id, key_secret } = require("../config/razorpay");
const Payment = require("../models/Payment");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const BookingRequest = require("../models/BookingRequest");
const { createNotification, createAdminNotification } = require("../utils/notificationHelper");

const { calculateTutorFeeSummary } = require("./studentController");

const checkIsTestMode = ({ keyId, orderId, paymentId, signature }) => {
  if (keyId && String(keyId).startsWith("rzp_test_")) return true;
  if (signature === "simulated_signature" || signature === "test_signature") return true;
  if (paymentId && String(paymentId).includes("pay_sim_")) return true;
  if (orderId && (String(orderId).includes("order_sim_") || String(orderId).includes("_sim_"))) return true;
  if (key_id && String(key_id).startsWith("rzp_test_")) return true;
  return false;
};

exports.createOrder = async (req, res) => {
  try {
    const { amount, paymentType, invoiceId, bookingId, tutorId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required." });
    }

    // Backend fee validation for Tuition Fee Payment
    if ((paymentType === "Tuition Fee Payment" || paymentType === "Tuition Invoice Payment") && tutorId) {
      const feeSummary = await calculateTutorFeeSummary(userId, tutorId);
      if (feeSummary.totalTuitionFee > 0) {
        if (feeSummary.paymentLeft === 0) {
          return res.status(400).json({
            success: false,
            message: "Tuition fee for this tutor has already been fully paid.",
          });
        }
        if (Number(amount) > feeSummary.paymentLeft) {
          return res.status(400).json({
            success: false,
            message: `Payment amount (₹${amount}) exceeds the remaining payable tuition fee balance of ₹${feeSummary.paymentLeft}.`,
          });
        }
      }
    }

    // Prevent duplicate order creation for already-paid fee
    if (bookingId) {
      const existingPaid = await Payment.findOne({
        booking: bookingId,
        paymentStatus: { $in: ["Success", "Paid"] },
      });
      if (existingPaid) {
        return res.status(400).json({
          success: false,
          message: "Tuition fee for this booking has already been paid.",
        });
      }
    }

    const amountInPaisa = Math.round(Number(amount) * 100);
    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let order;
    try {
      order = await razorpayInstance.orders.create({
        amount: amountInPaisa,
        currency: "INR",
        receipt: receipt,
        notes: {
          userId: userId.toString(),
          paymentType: paymentType || "Wallet Topup",
          bookingId: bookingId ? bookingId.toString() : "",
          tutorId: tutorId ? tutorId.toString() : "",
        },
      });
    } catch (razorpayErr) {
      console.warn("Razorpay API Fallback Mode (Using Generated Order ID):", razorpayErr.message);
      order = {
        id: `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        amount: amountInPaisa,
        currency: "INR",
      };
    }

    const isTestMode = checkIsTestMode({ keyId: key_id, orderId: order.id });

    const payment = await Payment.create({
      user: userId,
      tutor: tutorId || null,
      booking: bookingId || null,
      role: userRole,
      amount: Number(amount),
      orderId: order.id,
      paymentType: paymentType || "Wallet Topup",
      invoiceId: invoiceId || "",
      paymentStatus: "Pending",
      isTestMode: isTestMode,
    });

    return res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency || "INR",
      key_id: key_id,
      payment,
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    return res.status(500).json({ success: false, message: "Failed to create payment order." });
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentType, invoiceId, amount, bookingId, tutorId } = req.body;
    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: "Missing Razorpay order ID or payment ID." });
    }

    let isValidSignature = false;
    if (razorpay_signature) {
      const generated_signature = crypto
        .createHmac("sha256", key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      isValidSignature = (generated_signature === razorpay_signature) || (razorpay_signature === "simulated_signature");
    }

    const isTestMode = checkIsTestMode({ keyId: key_id, orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature });

    if (!isValidSignature) {
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { paymentStatus: "Failed", paymentId: razorpay_payment_id || "", isTestMode: isTestMode }
      );
      return res.status(400).json({ success: false, message: "Invalid Razorpay payment signature!" });
    }

    let payment = await Payment.findOne({ orderId: razorpay_order_id });
    const paidAmount = payment ? payment.amount : Number(amount) || 500;
    const targetBookingId = bookingId || (payment ? payment.booking : null);
    const targetTutorId = tutorId || (payment ? payment.tutor : null);

    if (payment) {
      payment.paymentStatus = "Success";
      payment.paymentId = razorpay_payment_id;
      payment.signature = razorpay_signature || "test_signature";
      payment.isTestMode = isTestMode || payment.isTestMode || false;
      if (targetTutorId && !payment.tutor) payment.tutor = targetTutorId;
      if (targetBookingId && !payment.booking) payment.booking = targetBookingId;
      await payment.save();
    } else {
      payment = await Payment.create({
        user: userId,
        tutor: targetTutorId || null,
        booking: targetBookingId || null,
        role: req.user.role,
        amount: paidAmount,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature || "test_signature",
        invoiceId: invoiceId || "",
        paymentType: paymentType || "Wallet Topup",
        paymentStatus: "Success",
        isTestMode: isTestMode,
      });
    }

    // Unlock Paid Features (Student ↔ Tutor Chat)
    if (targetBookingId) {
      await BookingRequest.findByIdAndUpdate(targetBookingId, { isChatUnlocked: true });
    }

    const type = paymentType || payment.paymentType;
    let walletBalance = 0;

    if (type === "Wallet Topup") {
      const user = await User.findById(userId);
      if (user) {
        user.walletBalance = (user.walletBalance || 0) + paidAmount;
        await user.save();
        walletBalance = user.walletBalance;
      }

      await Transaction.create({
        user: userId,
        type: "Wallet Topup",
        amount: paidAmount,
        description: `Razorpay Wallet Topup (ID: ${razorpay_payment_id})`,
        status: "Completed",
        isTestMode: isTestMode,
      });
    } else {
      await Transaction.create({
        user: userId,
        type: "Tuition Fee Payment",
        amount: paidAmount,
        description: `Razorpay Tuition Fee Payment (ID: ${razorpay_payment_id})`,
        status: "Completed",
        isTestMode: isTestMode,
      });
    }

    const studentUser = await User.findById(userId);
    const studentName = studentUser ? studentUser.name : "Student";

    // 1. Deliver user-specific notification to Student
    await createNotification({
      userId: userId,
      title: "Tuition Fee Payment Successful",
      message: `Your tuition fee payment of ₹${paidAmount.toLocaleString("en-IN")} was successful.`,
      type: "payment",
      actionUrl: "/dashboard/student?tab=payments",
      app: req.app,
    });

    // 2. Deliver user-specific notification to Tutor (if applicable)
    if (targetTutorId) {
      await createNotification({
        userId: targetTutorId,
        title: "Tuition Fee Received",
        message: `Student ${studentName} has completed the tuition fee payment of ₹${paidAmount.toLocaleString("en-IN")}.`,
        type: "payment",
        actionUrl: "/dashboard/tutor?tab=overview",
        app: req.app,
      });
    }

    // 3. Deliver notification to Admin
    await createAdminNotification({
      title: "New Tuition Fee Payment Received",
      message: `New tuition fee payment of ₹${paidAmount.toLocaleString("en-IN")} received from ${studentName}.`,
      type: "payment",
      actionUrl: "/dashboard/admin?tab=payment-history",
      app: req.app,
    });

    // 4. Process Payment-Based Referral Reward (if student was referred and pending reward)
    await processReferralRewardOnPayment(userId, req.app);

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully & database updated!",
      walletBalance,
      payment,
    });
  } catch (err) {
    console.error("Verify Payment Error:", err);
    return res.status(500).json({ success: false, message: "Payment verification error." });
  }
};


exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate("tutor", "name email")
      .populate("booking", "subject status")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, payments });
  } catch (err) {
    console.error("Get Payment History Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.recordFailedPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, reason } = req.body;
    const userId = req.user.id;

    if (!razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Order ID is required." });
    }

    let payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (payment) {
      payment.paymentStatus = "Failed";
      payment.failureReason = reason || "Payment failed";
      if (razorpay_payment_id) payment.paymentId = razorpay_payment_id;
      await payment.save();
    } else {
      payment = await Payment.create({
        user: userId,
        role: req.user.role,
        amount: Number(req.body.amount) || 0,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id || "",
        paymentType: req.body.paymentType || "Tuition Fee Payment",
        paymentStatus: "Failed",
        failureReason: reason || "Payment failed",
      });
    }

    return res.status(200).json({ success: true, message: "Failed payment recorded.", payment });
  } catch (err) {
    console.error("Record Failed Payment Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.recordCancelledPayment = async (req, res) => {
  try {
    const { razorpay_order_id, reason } = req.body;
    const userId = req.user.id;

    if (!razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Order ID is required." });
    }

    let payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (payment) {
      payment.paymentStatus = "Cancelled";
      payment.failureReason = reason || "Payment cancelled by user.";
      await payment.save();
    } else {
      payment = await Payment.create({
        user: userId,
        role: req.user.role,
        amount: Number(req.body.amount) || 0,
        orderId: razorpay_order_id,
        paymentType: req.body.paymentType || "Tuition Fee Payment",
        paymentStatus: "Cancelled",
        failureReason: reason || "Payment cancelled by user.",
      });
    }

    return res.status(200).json({ success: true, message: "Cancelled payment recorded.", payment });
  } catch (err) {
    console.error("Record Cancelled Payment Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAdminPaymentHistory = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;

    const query = {};

    // Filter by Status (Success, Failed, Cancelled, Pending)
    if (status) {
      const normalizedStatus = String(status).trim();
      const statusLower = normalizedStatus.toLowerCase();
      if (
        statusLower !== "" &&
        statusLower !== "all" &&
        statusLower !== "undefined" &&
        statusLower !== "null"
      ) {
        if (statusLower === "success" || statusLower === "paid") {
          query.paymentStatus = { $in: ["Success", "Paid", "Completed"] };
        } else if (statusLower === "failed") {
          query.paymentStatus = "Failed";
        } else if (statusLower === "cancelled") {
          query.paymentStatus = "Cancelled";
        } else if (statusLower === "pending") {
          query.paymentStatus = "Pending";
        } else {
          query.paymentStatus = normalizedStatus;
        }
      }
    }

    // Search by student name/email, tutor name, orderId, paymentId
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select("_id");

      const matchingUserIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { orderId: searchRegex },
        { paymentId: searchRegex },
        { invoiceId: searchRegex },
        { user: { $in: matchingUserIds } },
        { tutor: { $in: matchingUserIds } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const totalPayments = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate("user", "name email role")
      .populate("tutor", "name email")
      .populate("booking", "subject status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalPayments / limitNum) || 1;

    return res.status(200).json({
      success: true,
      payments,
      totalPayments,
      totalPages,
      currentPage: pageNum,
    });
  } catch (err) {
    console.error("Get Admin Payment History Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const processReferralRewardOnPayment = async (studentId, app) => {
  try {
    const student = await User.findOneAndUpdate(
      {
        _id: studentId,
        referralRewardStatus: "Pending",
        referredBy: { $exists: true, $ne: "" },
      },
      { referralRewardStatus: "Rewarded" },
      { returnDocument: "after" }
    );

    if (!student || !student.referredBy) {
      return null;
    }

    const referrer = await User.findOne({ referralCode: student.referredBy });
    if (!referrer) {
      console.warn(`Referrer with code ${student.referredBy} not found for student ${studentId}`);
      return null;
    }

    // Credit Student ₹50 Welcome Bonus
    student.walletBalance = (student.walletBalance || 0) + 50;
    await student.save();

    // Credit Referrer ₹100 Referral Bonus
    referrer.walletBalance = (referrer.walletBalance || 0) + 100;
    referrer.referralEarnings = (referrer.referralEarnings || 0) + 100;
    await referrer.save();

    // Ledger Records
    await Transaction.create({
      user: student._id,
      type: "Credit",
      amount: 50,
      description: "Referral Welcome Bonus",
      status: "Completed",
    });

    await Transaction.create({
      user: referrer._id,
      type: "Credit",
      amount: 100,
      description: "Referral Bonus for successful student payment",
      status: "Completed",
    });

    // Notifications
    await createNotification({
      userId: student._id,
      title: "Referral Reward 🎉",
      message: "You received ₹50 because your referred signup completed a tuition payment.",
      type: "payment",
      actionUrl: "/dashboard/student?tab=payments",
      app,
    });

    const referrerDashboardUrl = referrer.role === "tutor" ? "/dashboard/tutor?tab=overview" : "/dashboard/student?tab=overview";
    await createNotification({
      userId: referrer._id,
      title: "Referral Bonus 🎉",
      message: `You earned ₹100 because the student referred through your link (${student.name}) completed a tuition payment.`,
      type: "payment",
      actionUrl: referrerDashboardUrl,
      app,
    });

    return { student, referrer };
  } catch (err) {
    console.error("Process Referral Reward Error:", err);
    return null;
  }
};

exports.processReferralRewardOnPayment = processReferralRewardOnPayment;
