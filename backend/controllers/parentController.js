
const ChildProfile = require("../models/ChildProfile");
const Transaction = require("../models/Transaction");
const BookingRequest = require("../models/BookingRequest");
const User = require("../models/User");
const Certificate = require("../models/Certificate");
const ClassSchedule = require("../models/ClassSchedule");
const Payment = require("../models/Payment");

exports.addChild = async (req, res) => {
  try {
    const { email, name, grade, school, subjectsNeeded } = req.body;
    const parentId = req.user.id;

    if (!email || !grade) {
      return res.status(400).json({
        success: false,
        message: "Child student email and grade are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const studentUser = await User.findOne({
      email: cleanEmail,
      role: "student",
    });

    if (!studentUser) {
      return res.status(404).json({
        success: false,
        message: "No registered student account found with this email. The child must register as a student first.",
      });
    }

    const existingLink = await ChildProfile.findOne({
      parent: parentId,
      $or: [
        { student: studentUser._id },
        { email: cleanEmail },
      ],
    });

    if (existingLink) {
      return res.status(400).json({
        success: false,
        message: "This child account is already linked to your parent profile.",
      });
    }

    const subjectsArray = Array.isArray(subjectsNeeded)
      ? subjectsNeeded
      : typeof subjectsNeeded === "string"
      ? subjectsNeeded.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const child = await ChildProfile.create({
      parent: parentId,
      student: studentUser._id,
      name: name && name.trim() ? name.trim() : studentUser.name,
      email: studentUser.email,
      grade: grade.trim(),
      school: school ? school.trim() : "",
      subjectsNeeded: subjectsArray,
    });

    return res.status(201).json({
      success: true,
      message: `Child account (${child.name}) linked successfully!`,
      child,
    });
  } catch (err) {
    console.error("Add Child Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getChildren = async (req, res) => {
  try {
    const children = await ChildProfile.find({ parent: req.user.id })
      .populate("student", "name email role phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, children });
  } catch (err) {
    console.error("Get Children Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getChildCertificates = async (req, res) => {
  try {
    const parentId = req.user.id;

    const children = await ChildProfile.find({ parent: parentId });

    const studentIds = children
      .map((c) => c.student)
      .filter(Boolean);

    if (studentIds.length === 0) {
      return res.status(200).json({ success: true, certificates: [] });
    }

  
    const certificates = await Certificate.find({ student: { $in: studentIds } })
      .populate("student", "name email")
      .populate("tutor", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, certificates });
  } catch (err) {
    console.error("Get Child Certificates Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.payInvoice = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const parentId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid payment amount is required.",
      });
    }

    const transaction = await Transaction.create({
      user: parentId,
      type: "Tuition Fee Payment",
      amount: Number(amount),
      description: description || "Tutoring Invoice Payment",
      status: "Completed",
    });

    return res.status(201).json({
      success: true,
      message: `Payment of ₹${amount} completed successfully!`,
      transaction,
    });
  } catch (err) {
    console.error("Pay Invoice Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getParentDashboardStats = async (req, res) => {
  try {
    const parentId = req.user.id;

    
    const children = await ChildProfile.find({ parent: parentId })
      .populate("student", "name email role phone")
      .sort({ createdAt: -1 });

    const transactions = await Transaction.find({ user: parentId }).sort({ createdAt: -1 });
    const totalPaid = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    const studentIds = children
      .map((c) => (c.student ? c.student._id || c.student : null))
      .filter(Boolean);

    if (studentIds.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          childrenCount: 0,
          attendanceRate: "N/A",
          attendancePercentage: 0,
          totalClasses: 0,
          attendedClasses: 0,
          averageGradeScore: "N/A",
          averageGradePercentage: 0,
          assignedTutorsCount: 0,
          totalPaid,
          pendingInvoicesCount: 0,
        },
        children: [],
        subjectProgress: [],
        invoices: [],
        assignedTutors: [],
        transactions,
      });
    }

    
    const schedules = await ClassSchedule.find({ student: { $in: studentIds } })
      .populate("tutor", "name email")
      .populate("student", "name email")
      .sort({ date: -1 });

    const bookings = await BookingRequest.find({ student: { $in: studentIds }, status: "Accepted" })
      .populate("student", "name email")
      .populate("tutor", "name email")
      .populate("tutorProfile");

    
    const totalClasses = schedules.length;
    const attendedClasses = schedules.filter((s) => s.attendance === "Present").length;
    const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;
    const attendanceRate = totalClasses > 0 ? `${attendancePercentage}%` : "N/A";

    
    const uniqueTutorIds = new Set();
    schedules.forEach((s) => {
      if (s.tutor) uniqueTutorIds.add((s.tutor._id || s.tutor).toString());
    });
    bookings.forEach((b) => {
      if (b.tutor) uniqueTutorIds.add((b.tutor._id || b.tutor).toString());
    });
    const assignedTutorsCount = uniqueTutorIds.size;

  
    const subjectMap = new Map();

   
    schedules.forEach((sch) => {
      const subjKey = sch.subject ? sch.subject.trim() : "General Studies";
      const tutorName = sch.tutor ? sch.tutor.name : "Assigned Educator";
      const studentName = sch.student ? sch.student.name : "Child";
      const key = `${subjKey}__${tutorName}`;

      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          subject: subjKey,
          tutorName,
          childName: studentName,
          totalClasses: 0,
          attendedClasses: 0,
          completedClasses: 0,
        });
      }

      const item = subjectMap.get(key);
      item.totalClasses += 1;
      if (sch.attendance === "Present") {
        item.attendedClasses += 1;
      }
      if (sch.status === "Completed") {
        item.completedClasses += 1;
      }
    });
    bookings.forEach((bk) => {
      const tutorName = bk.tutor ? bk.tutor.name : "Assigned Educator";
      const subjects = bk.tutorProfile && bk.tutorProfile.subjects && bk.tutorProfile.subjects.length > 0
        ? bk.tutorProfile.subjects
        : ["General Academic Tutoring"];

      subjects.forEach((subj) => {
        const subjKey = subj.trim();
        const key = `${subjKey}__${tutorName}`;
        if (!subjectMap.has(key)) {
          subjectMap.set(key, {
            subject: subjKey,
            tutorName,
            childName: bk.student ? bk.student.name : "Child",
            totalClasses: 0,
            attendedClasses: 0,
            completedClasses: 0,
          });
        }
      });
    });

    const subjectProgress = Array.from(subjectMap.values()).map((item) => {
      const subjAttendancePct = item.totalClasses > 0
        ? Math.round((item.attendedClasses / item.totalClasses) * 100)
        : 100;

      let gradeLabel = "Grade A+ (95%)";
      let gradePercentage = subjAttendancePct;
      let progressBarColor = "#15803d"; // Green

      if (subjAttendancePct >= 90) {
        gradeLabel = `Grade A+ (${subjAttendancePct}%)`;
        progressBarColor = "#15803d";
      } else if (subjAttendancePct >= 80) {
        gradeLabel = `Grade A (${subjAttendancePct}%)`;
        progressBarColor = "#0284c7";
      } else if (subjAttendancePct >= 70) {
        gradeLabel = `Grade B (${subjAttendancePct}%)`;
        progressBarColor = "#7e22ce";
      } else if (subjAttendancePct >= 60) {
        gradeLabel = `Grade C (${subjAttendancePct}%)`;
        progressBarColor = "#b45309";
      } else {
        gradeLabel = `Grade D (${subjAttendancePct}%)`;
        progressBarColor = "#dc2626";
      }

      return {
        childName: item.childName,
        subject: item.subject,
        tutorName: item.tutorName,
        totalClasses: item.totalClasses,
        attendedClasses: item.attendedClasses,
        attendancePercentage: subjAttendancePct,
        gradeLabel,
        gradePercentage,
        progressBarColor,
      };
    });

    const overallGradeAvg = subjectProgress.length > 0
      ? Math.round(subjectProgress.reduce((sum, sp) => sum + sp.gradePercentage, 0) / subjectProgress.length)
      : (attendancePercentage || 0);

    let averageGradeScore = "N/A";
    if (subjectProgress.length > 0 || totalClasses > 0) {
      if (overallGradeAvg >= 90) averageGradeScore = `A+ (${overallGradeAvg}%)`;
      else if (overallGradeAvg >= 80) averageGradeScore = `A (${overallGradeAvg}%)`;
      else if (overallGradeAvg >= 70) averageGradeScore = `B (${overallGradeAvg}%)`;
      else if (overallGradeAvg >= 60) averageGradeScore = `C (${overallGradeAvg}%)`;
      else averageGradeScore = `D (${overallGradeAvg}%)`;
    }

    const successfulPayments = await Payment.find({
      user: parentId,
      paymentType: "Tuition Invoice Payment",
      paymentStatus: "Success",
    });

    const paidInvoiceIds = new Set(successfulPayments.map((p) => p.invoiceId));

    const realInvoices = bookings.map((b) => {
      const invId = `INV-${b._id.toString().slice(-6).toUpperCase()}`;
      const isPaid = paidInvoiceIds.has(invId);
      const fee = b.tutorProfile ? b.tutorProfile.fee || 3600 : 3600;
      const subj = b.tutorProfile && b.tutorProfile.subjects && b.tutorProfile.subjects.length > 0
        ? b.tutorProfile.subjects[0]
        : "Tuition Fee";

      return {
        id: b._id.toString(),
        invoiceId: invId,
        studentName: b.student ? b.student.name : "Child",
        tutorName: b.tutor ? b.tutor.name : "Educator",
        subject: subj,
        amount: fee,
        dueDate: new Date(b.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: isPaid ? "Paid" : "Pending",
        isSample: false,
      };
    });

    const pendingInvoicesAmount = realInvoices
      .filter((i) => i.status === "Pending")
      .reduce((sum, i) => sum + i.amount, 0);

   
    const assignedTutorMap = new Map();

    schedules.forEach((s) => {
      if (s.tutor && s.tutor._id) {
        const tId = s.tutor._id.toString();
        if (!assignedTutorMap.has(tId)) {
          assignedTutorMap.set(tId, {
            _id: tId,
            name: s.tutor.name,
            email: s.tutor.email,
            subject: s.subject || "Academic Tutoring",
            childName: s.student ? s.student.name : "Child",
          });
        }
      }
    });

    bookings.forEach((b) => {
      if (b.tutor && b.tutor._id) {
        const tId = b.tutor._id.toString();
        if (!assignedTutorMap.has(tId)) {
          const subj = b.tutorProfile && b.tutorProfile.subjects && b.tutorProfile.subjects.length > 0
            ? b.tutorProfile.subjects.join(", ")
            : "Academic Tutoring";
          assignedTutorMap.set(tId, {
            _id: tId,
            name: b.tutor.name,
            email: b.tutor.email,
            subject: subj,
            childName: b.student ? b.student.name : "Child",
          });
        }
      }
    });

    const assignedTutorsList = Array.from(assignedTutorMap.values());

    return res.status(200).json({
      success: true,
      stats: {
        childrenCount: children.length,
        attendanceRate,
        attendancePercentage,
        totalClasses,
        attendedClasses,
        averageGradeScore,
        averageGradePercentage: overallGradeAvg,
        assignedTutorsCount,
        totalPaid,
        pendingInvoicesAmount,
        pendingInvoicesCount: realInvoices.filter((i) => i.status === "Pending").length,
      },
      children,
      subjectProgress,
      invoices: realInvoices,
      assignedTutors: assignedTutorsList,
      transactions,
    });
  } catch (err) {
    console.error("Get Parent Dashboard Stats Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
