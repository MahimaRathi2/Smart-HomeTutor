/**
 * ==========================================
 * ATTENDANCE CONTROLLER
 * ==========================================
 * Dynamic Attendance Management System logic
 * for Students, Tutors, Parents, and Admins.
 */

const Attendance = require("../models/Attendance");
const ClassSchedule = require("../models/ClassSchedule");
const BookingRequest = require("../models/BookingRequest");
const User = require("../models/User");
const { createNotification } = require("../utils/notificationHelper");
const { logUserActivity } = require("../utils/activityLogHelper");

/**
 * Calculates dynamic attendance summary for a student.
 * EXCLUDES future scheduled classes (date > now & status === 'Scheduled')
 * EXCLUDES cancelled classes (status === 'Cancelled').
 */
const calculateStudentAttendanceSummary = async (studentId) => {
  const now = new Date();

  // Find all non-cancelled ClassSchedule records for the student
  const schedules = await ClassSchedule.find({
    student: studentId,
    status: { $ne: "Cancelled" },
  })
    .populate("tutor", "name email phone")
    .sort({ date: -1, startTime: -1 });

  // Filter ONLY completed/past classes that have taken place or have marked attendance
  const completedOrMarkedSchedules = schedules.filter((sch) => {
    if (sch.status === "Completed") return true;
    if (sch.attendance && sch.attendance !== "Pending") return true;
    // Exclude future scheduled classes
    if (sch.date > now) return false;
    // Include past classes even if attendance is pending
    return true;
  });

  const totalClasses = completedOrMarkedSchedules.length;
  const attendedClasses = completedOrMarkedSchedules.filter((sch) =>
    ["Present", "Late"].includes(sch.attendance)
  ).length;
  const absentClasses = completedOrMarkedSchedules.filter(
    (sch) => sch.attendance === "Absent"
  ).length;
  const pendingClasses = completedOrMarkedSchedules.filter(
    (sch) => !sch.attendance || sch.attendance === "Pending"
  ).length;

  const attendancePercentage =
    totalClasses > 0
      ? parseFloat(((attendedClasses / totalClasses) * 100).toFixed(1))
      : 0;

  // Subject-Wise Attendance Breakdown
  const subjectMap = {};
  completedOrMarkedSchedules.forEach((sch) => {
    const subj = sch.subject || "General Tuition";
    if (!subjectMap[subj]) {
      subjectMap[subj] = { total: 0, attended: 0, absent: 0, pending: 0 };
    }
    subjectMap[subj].total += 1;
    if (["Present", "Late"].includes(sch.attendance)) {
      subjectMap[subj].attended += 1;
    } else if (sch.attendance === "Absent") {
      subjectMap[subj].absent += 1;
    } else {
      subjectMap[subj].pending += 1;
    }
  });

  const subjectWise = Object.keys(subjectMap).map((subject) => {
    const data = subjectMap[subject];
    const pct =
      data.total > 0
        ? parseFloat(((data.attended / data.total) * 100).toFixed(1))
        : 0;
    return {
      subject,
      totalClasses: data.total,
      attendedClasses: data.attended,
      absentClasses: data.absent,
      pendingClasses: data.pending,
      attendancePercentage: pct,
    };
  });

  // Fetch detailed Attendance log documents from Attendance collection
  const attendanceLogs = await Attendance.find({ student: studentId })
    .populate("tutor", "name email")
    .populate("classSchedule", "subject date startTime endTime mode status")
    .sort({ date: -1 });

  return {
    totalClasses,
    attendedClasses,
    absentClasses,
    pendingClasses,
    attendancePercentage,
    subjectWise,
    attendanceLogs,
    completedOrMarkedSchedules,
  };
};

/**
 * @desc   Mark or update student attendance for a class session
 * @route  POST /api/attendance/mark
 * @access Private (Tutor / Admin)
 */
exports.markOrUpdateAttendance = async (req, res) => {
  try {
    const { classScheduleId, studentId, status, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!classScheduleId || !status) {
      return res.status(400).json({
        success: false,
        message: "classScheduleId and status (Present, Absent, Late) are required.",
      });
    }

    if (!["Present", "Absent", "Late", "Pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status. Must be Present, Absent, Late, or Pending.",
      });
    }

    const schedule = await ClassSchedule.findById(classScheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Class schedule session not found." });
    }

    // Security: Only assigned tutor or admin can mark attendance
    if (userRole !== "admin" && schedule.tutor.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only mark attendance for your own assigned classes.",
      });
    }

    const targetStudentId = studentId || schedule.student;

    // Update ClassSchedule session status & attendance
    schedule.attendance = status;
    if (["Present", "Absent", "Late"].includes(status)) {
      schedule.status = "Completed";
    }
    await schedule.save();

    // Upsert Attendance record
    const attendanceRecord = await Attendance.findOneAndUpdate(
      { student: targetStudentId, classSchedule: schedule._id },
      {
        student: targetStudentId,
        tutor: schedule.tutor,
        classSchedule: schedule._id,
        booking: schedule.booking || null,
        subject: schedule.subject,
        date: schedule.date,
        status: status,
        notes: notes || "",
        markedBy: userId,
      },
      { upsert: true, returnDocument: "after" }
    );

    // Notify Student
    await createNotification({
      userId: targetStudentId,
      title: "Attendance Updated 📝",
      message: `Your attendance for ${schedule.subject} session on ${new Date(schedule.date).toLocaleDateString()} was marked as ${status}.`,
      type: "class",
      actionUrl: "/dashboard/student?tab=schedule",
      app: req.app,
    });

    await logUserActivity(
      userId,
      `Marked attendance as ${status} for student ${targetStudentId} in ${schedule.subject}`,
      req.ip
    );

    // Recalculate dynamic student summary
    const updatedSummary = await calculateStudentAttendanceSummary(targetStudentId);

    return res.status(200).json({
      success: true,
      message: `Attendance marked as ${status} successfully!`,
      attendanceRecord,
      schedule,
      studentSummary: {
        totalClasses: updatedSummary.totalClasses,
        attendedClasses: updatedSummary.attendedClasses,
        absentClasses: updatedSummary.absentClasses,
        attendancePercentage: updatedSummary.attendancePercentage,
      },
    });
  } catch (err) {
    console.error("Mark Attendance Error:", err);
    return res.status(500).json({ success: false, message: "Server Error marking attendance." });
  }
};

/**
 * @desc   Get student attendance summary & subject-wise breakdown
 * @route  GET /api/attendance/student/:studentId?
 * @access Private (Student / Parent / Tutor / Admin)
 */
exports.getStudentAttendanceSummary = async (req, res) => {
  try {
    let targetStudentId = req.params.studentId || req.user.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Security Controls
    if (userRole === "student") {
      targetStudentId = userId; // Force self inspection
    } else if (userRole === "parent") {
      const parentUser = await User.findById(userId);
      if (parentUser && parentUser.children && parentUser.children.length > 0) {
        const isLinkedChild = parentUser.children.some(
          (cId) => cId.toString() === targetStudentId.toString()
        );
        if (!isLinkedChild) {
          return res.status(403).json({
            success: false,
            message: "Forbidden: You can only view attendance for your linked children.",
          });
        }
      }
    } else if (userRole === "tutor") {
      // Tutor can view attendance of students they teach
      const hasSharedClass = await ClassSchedule.exists({
        tutor: userId,
        student: targetStudentId,
      });
      if (!hasSharedClass) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only view attendance for students enrolled in your classes.",
        });
      }
    }

    const summary = await calculateStudentAttendanceSummary(targetStudentId);
    const studentUser = await User.findById(targetStudentId).select("name email phone");

    return res.status(200).json({
      success: true,
      student: studentUser,
      totalClasses: summary.totalClasses,
      attendedClasses: summary.attendedClasses,
      absentClasses: summary.absentClasses,
      pendingClasses: summary.pendingClasses,
      attendancePercentage: summary.attendancePercentage,
      subjectWise: summary.subjectWise,
      attendanceLogs: summary.attendanceLogs,
      schedules: summary.completedOrMarkedSchedules,
    });
  } catch (err) {
    console.error("Get Student Attendance Summary Error:", err);
    return res.status(500).json({ success: false, message: "Server Error fetching attendance." });
  }
};

/**
 * @desc   Get tutor's classes for attendance marking & review
 * @route  GET /api/attendance/tutor/classes
 * @access Private (Tutor / Admin)
 */
exports.getTutorClassesForAttendance = async (req, res) => {
  try {
    const tutorId = req.user.role === "admin" ? req.query.tutorId || req.user.id : req.user.id;

    const schedules = await ClassSchedule.find({ tutor: tutorId, status: { $ne: "Cancelled" } })
      .populate("student", "name email phone")
      .sort({ date: -1, startTime: -1 });

    const attendanceRecords = await Attendance.find({ tutor: tutorId })
      .populate("student", "name email")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      schedules,
      attendanceRecords,
    });
  } catch (err) {
    console.error("Get Tutor Classes Attendance Error:", err);
    return res.status(500).json({ success: false, message: "Server Error fetching tutor classes." });
  }
};

exports.calculateStudentAttendanceSummary = calculateStudentAttendanceSummary;
