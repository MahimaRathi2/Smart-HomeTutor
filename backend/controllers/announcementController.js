const Announcement = require("../models/Announcement");

exports.getPublicAnnouncements = async (req, res) => {
  try {
    const userRole = req.user ? req.user.role : "student";

    const announcements = await Announcement.find({
      $or: [{ targetRole: "all" }, { targetRole: userRole }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (err) {
    console.error("Get Public Announcements Error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching announcements." });
  }
};
