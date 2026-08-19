
const Coupon = require("../models/Coupon");
exports.applyCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required." });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      active: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      return res.status(400).json({ success: false, message: "Invalid or expired coupon code." });
    }

    const originalAmount = Number(amount) || 1000;
    const discountAmount = Math.min(
      Math.round((originalAmount * coupon.discountPercent) / 100),
      coupon.maxDiscountAmount
    );
    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied! Saved ₹${discountAmount}.`,
      discountPercent: coupon.discountPercent,
      discountAmount,
      finalAmount,
    });
  } catch (err) {
    console.error("Apply Coupon Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, maxDiscountAmount, expiresAt } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ success: false, message: "Coupon code and discount percentage are required." });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Coupon code already exists." });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountPercent: Number(discountPercent),
      maxDiscountAmount: Number(maxDiscountAmount) || 500,
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      active: true,
    });

    return res.status(201).json({
      success: true,
      message: `Coupon '${coupon.code}' created successfully!`,
      coupon,
    });
  } catch (err) {
    console.error("Create Coupon Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
