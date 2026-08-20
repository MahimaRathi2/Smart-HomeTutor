

const BookingRequest = require("../models/BookingRequest");
const ClassSchedule = require("../models/ClassSchedule");
const mongoose = require("mongoose");

async function findBookingOrSchedule(sessionId) {
  if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) return null;

  let booking = await BookingRequest.findById(sessionId)
    .populate("student", "name email role")
    .populate("tutor", "name email role")
    .populate({
      path: "tutorProfile",
      select: "subjects qualification fee",
    });

  if (booking) {
    return booking;
  }

  const schedule = await ClassSchedule.findById(sessionId)
    .populate("student", "name email role")
    .populate("tutor", "name email role");

  if (schedule) {
    const studentObj = (schedule.student && typeof schedule.student === "object")
      ? schedule.student
      : { _id: schedule.student, name: "Student", email: "", role: "student" };

    const tutorObj = (schedule.tutor && typeof schedule.tutor === "object")
      ? schedule.tutor
      : { _id: schedule.tutor, name: "Tutor", email: "", role: "tutor" };

    return {
      _id: schedule._id,
      student: studentObj,
      tutor: tutorObj,
      status: schedule.status === "Cancelled" ? "Rejected" : "Accepted",
      tutorProfile: {
        subjects: [schedule.subject || "Tuition Session"],
      },
      mode: schedule.mode || "Online",
    };
  }

  return null;
}

exports.renderVideoCall = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).redirect(
        `/dashboard?error=${encodeURIComponent("Invalid video call session ID.")}`
      );
    }

    const booking = await findBookingOrSchedule(bookingId);

    if (!booking) {
      return res.status(404).redirect(
        `/dashboard?error=${encodeURIComponent("Class session or booking request not found.")}`
      );
    }

    if (booking.status !== "Accepted") {
      const userRole = req.user?.role || "user";
      return res.status(403).redirect(
        `/dashboard/${userRole}?error=${encodeURIComponent(
          "Video call is unavailable. The class session or booking request must be active."
        )}`
      );
    }

    const userIdStr = (req.user?.id || req.user?._id || "").toString();
    const studentIdStr = (booking.student?._id || booking.student || "").toString();
    const tutorIdStr = (booking.tutor?._id || booking.tutor || "").toString();

    if (userIdStr !== studentIdStr && userIdStr !== tutorIdStr && req.user?.role !== "admin") {
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
    const peerName = (peerUser && (peerUser.name || peerUser.email)) ? (peerUser.name || peerUser.email) : peerRole;
    const peerId = (peerUser && (peerUser._id || peerUser.id)) ? (peerUser._id || peerUser.id).toString() : "";

    return res.render("video-call", {
      bookingId: booking._id.toString(),
      roomId: `room_${booking._id.toString()}`,
      user: req.user,
      peerUser: {
        id: peerId,
        name: peerName,
        email: peerUser?.email || "",
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
      return res.status(400).json({ success: false, message: "Invalid session ID." });
    }

    const booking = await findBookingOrSchedule(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Class session not found." });
    }

    const userIdStr = (req.user?.id || req.user?._id || "").toString();
    const studentIdStr = (booking.student?._id || booking.student || "").toString();
    const tutorIdStr = (booking.tutor?._id || booking.tutor || "").toString();

    const isParticipant = userIdStr === studentIdStr || userIdStr === tutorIdStr || req.user?.role === "admin";
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

    const booking = await findBookingOrSchedule(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Class session or booking request not found." });
    }

    if (booking.status !== "Accepted") {
      return res.status(403).json({
        success: false,
        message: "Video call is unavailable. The class session must be active.",
      });
    }

    const userIdStr = (req.user?.id || req.user?._id || "").toString();
    const studentIdStr = (booking.student?._id || booking.student || "").toString();
    const tutorIdStr = (booking.tutor?._id || booking.tutor || "").toString();

    const isStudent = userIdStr === studentIdStr;
    const isTutor = userIdStr === tutorIdStr;
    const isAdmin = req.user?.role === "admin";

    if (!isStudent && !isTutor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Access: You are not a participant in this video call session.",
      });
    }

    const peerUser = isStudent ? booking.tutor : booking.student;
    const peerRole = isStudent ? "Tutor" : "Student";
    const peerName = (peerUser && (peerUser.name || peerUser.email)) ? (peerUser.name || peerUser.email) : peerRole;
    const peerEmail = (peerUser && peerUser.email) ? peerUser.email : "";
    const peerId = (peerUser && (peerUser._id || peerUser.id)) ? (peerUser._id || peerUser.id).toString() : "";

    return res.status(200).json({
      success: true,
      bookingId: booking._id.toString(),
      roomId: `room_${booking._id.toString()}`,
      user: {
        id: req.user.id || req.user._id,
        name: req.user.name || req.user.email || "User",
        email: req.user.email || "",
        role: req.user.role || (isStudent ? "student" : "tutor"),
      },
      peerUser: {
        id: peerId,
        name: peerName,
        email: peerEmail,
        role: peerRole,
      },
      tutorProfile: booking.tutorProfile || {},
      isStudent,
    });
  } catch (error) {
    console.error("Get Video Call Details Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};
