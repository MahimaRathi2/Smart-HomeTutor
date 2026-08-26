/**
 * ==========================================
 * REFERRAL CONTROLLER
 * ==========================================
 * Shared referral program controller for all user roles
 * (Students, Tutors, Parents, Admins).
 * Enforces strict user-level data isolation using req.user.id.
 */

const User = require("../models/User");

exports.getReferrals = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("referralCode referralEarnings name email role");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    let code = user.referralCode;
    if (!code) {
      code = "REF-" + user._id.toString().slice(-6).toUpperCase();
      user.referralCode = code;
      await user.save();
    }

    const referredUsers = await User.find({ referredBy: code }).select(
      "name email createdAt role referralRewardStatus"
    );

    const formattedUsers = referredUsers.map((u) => {
      const isRewarded = u.referralRewardStatus === "Rewarded";
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        role: u.role,
        referralRewardStatus: u.referralRewardStatus || "Pending",
        studentReward: isRewarded ? 50 : 0,
        referrerReward: isRewarded ? 100 : 0,
        statusReason: isRewarded
          ? "Completed first tuition payment"
          : "Waiting for first successful tuition payment",
      };
    });

    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:5173";
    const referralLink = `${protocol}://${host}/signup?ref=${code}`;

    return res.status(200).json({
      success: true,
      referralCode: code,
      referralLink: referralLink,
      referralEarnings: user.referralEarnings || 0,
      totalReferred: referredUsers.length,
      referredUsers: formattedUsers,
    });
  } catch (err) {
    console.error("Get Referrals Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
