

const BookingRequest = require("../models/BookingRequest");
const mongoose = require("mongoose");


exports.renderVideoCall = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).redirect(
        `/dashboard?error=${encodeURIComponent("Invalid video call session ID.")}`
      );
    }

    const booking = await BookingRequest.findById(bookingId)
      .populate("student", "name email role")
      .populate("tutor", "name email role")
      .populate({
        path: "tutorProfile",
        select: "subjects qualification fee",
      });

    if (!booking) {
      return res.status(404).redirect(
        `/dashboard?error=${encodeURIComponent("Booking request not found.")}`
      );
    }

    
    if (booking.status !== "Accepted") {
      const userRole = req.user?.role || "user";
      return res.status(403).redirect(
        `/dashboard/${userRole}?error=${encodeURIComponent(
          "Video call is unavailable. The booking request must be accepted by the tutor first."
        )}`
      );
    }

    const userIdStr = req.user.id.toString();
    const studentIdStr = booking.student._id.toString();
    const tutorIdStr = booking.tutor._id.toString();

    if (userIdStr !== studentIdStr && userIdStr !== tutorIdStr) {
      const userRole = req.user?.role || "user";
      return res.status(403).redirect(
        `/dashboard/${userRole}?error=${encodeURIComponent(
          "Unauthorized Access: You are not a participant in this video call session."
        )}`
      );
    }


    const isStudent = userIdStr === studentIdStr;
    const peerUser = isStudent ? booking.tutor : booking.student;
    const peerRole = isStudent ? "Tutor" : "Student";


    return res.render("video-call", {
      bookingId: booking._id.toString(),
      roomId: `room_${booking._id.toString()}`,
      user: req.user,
      peerUser: {
        id: peerUser._id.toString(),
        name: peerUser.name || peerRole,
        email: peerUser.email || "",
        role: peerRole,
      },
      tutorProfile: booking.tutorProfile || {},
      isStudent: isStudent,
    });
  } catch (error) {
    console.error("Render Video Call Error:", error);
    return res.status(500).redirect(
      `/dashboard?error=${encodeURIComponent("Server error occurred while preparing video call.")}`
    );
  }
};

exports.getVideoCallStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID." });
    }

    const booking = await BookingRequest.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const userIdStr = req.user.id.toString();
    const studentIdStr = booking.student.toString();
    const tutorIdStr = booking.tutor.toString();

    const isParticipant = userIdStr === studentIdStr || userIdStr === tutorIdStr;
    const isAccepted = booking.status === "Accepted";

    return res.status(200).json({
      success: true,
      isAccepted,
      isParticipant,
      status: booking.status,
      roomId: `room_${booking._id.toString()}`,
    });
  } catch (error) {
    console.error("Get Video Call Status Error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.getVideoCallDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid video call session ID." });
    }

    const booking = await BookingRequest.findById(bookingId)
      .populate("student", "name email role")
      .populate("tutor", "name email role")
      .populate({
        path: "tutorProfile",
        select: "subjects qualification fee",
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking request not found." });
    }

    if (booking.status !== "Accepted") {
      return res.status(403).json({
        success: false,
        message: "Video call is unavailable. The booking request must be accepted by the tutor first.",
      });
    }

    const userIdStr = req.user.id.toString();
    const studentIdStr = booking.student._id.toString();
    const tutorIdStr = booking.tutor._id.toString();

    if (userIdStr !== studentIdStr && userIdStr !== tutorIdStr) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Access: You are not a participant in this video call session.",
      });
    }

    const isStudent = userIdStr === studentIdStr;
    const peerUser = isStudent ? booking.tutor : booking.student;
    const peerRole = isStudent ? "Tutor" : "Student";

    return res.status(200).json({
      success: true,
      bookingId: booking._id.toString(),
      roomId: `room_${booking._id.toString()}`,
      user: {
        id: req.user.id,
        name: req.user.name || req.user.email,
        email: req.user.email || "",
        role: req.user.role || (isStudent ? "student" : "tutor"),
      },
      peerUser: {
        id: peerUser._id.toString(),
        name: peerUser.name || peerRole,
        email: peerUser.email || "",
        role: peerRole,
      },
      tutorProfile: booking.tutorProfile || {},
      isStudent,
    });
  } catch (error) {
    console.error("Get Video Call Details Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
