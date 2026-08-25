
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const BookingRequest = require("../models/BookingRequest");
const TutorProfile = require("../models/TutorProfile");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Transaction = require("../models/Transaction");
const StudyNote = require("../models/StudyNote");
const StudyMaterial = require("../models/StudyMaterial");
const ClassSchedule = require("../models/ClassSchedule");
const Certificate = require("../models/Certificate");
const ChildProfile = require("../models/ChildProfile");
const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");
const { createNotification, createAdminNotification } = require("../utils/notificationHelper");
const { logUserActivity } = require("../utils/activityLogHelper");


exports.bookTutor = async (req, res) => {
  try {
    const { tutorProfileId, message, address, lat, lng, isHomeVisit, isTrial } = req.body;
    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found. Please log in as a student.",
      });
    }

    let tutorProfile = null;
    if (tutorProfileId && mongoose.Types.ObjectId.isValid(tutorProfileId)) {
      tutorProfile = await TutorProfile.findById(tutorProfileId).populate("user");
    }

    if (!tutorProfile) {
      tutorProfile = await TutorProfile.findOne().populate("user");
    }

    if (!tutorProfile || !tutorProfile.user) {
      return res.status(404).json({
        success: false,
        message: "No registered tutor available in database yet.",
      });
    }

    const existing = await BookingRequest.findOne({
      student: student._id,
      tutorProfile: tutorProfile._id,
      status: { $in: ["Pending", "Pending Admin Approval", "Pending Tutor Acceptance"] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You already have a pending demo class request for ${tutorProfile.user.name || "this tutor"}.`,
      });
    }

    const booking = await BookingRequest.create({
      student: student._id,
      tutor: tutorProfile.user._id,
      tutorProfile: tutorProfile._id,
      message: message || "Demo Class Request",
      address: address || "",
      coordinates: {
        lat: lat !== undefined ? Number(lat) : 28.6139,
        lng: lng !== undefined ? Number(lng) : 77.2090,
      },
      isHomeVisit: Boolean(isHomeVisit),
      homeVisitStatus: isHomeVisit ? "Scheduled" : "N/A",
      isTrial: isTrial !== undefined ? Boolean(isTrial) : true,
      status: "Pending Admin Approval",
    });

    const studentName = student.name || student.email || "Student";
    const tutorName = (tutorProfile.user && tutorProfile.user.name) ? tutorProfile.user.name : "Tutor";
    const subjectName = tutorProfile.primarySubject || "Tuition";

    // Deliver Admin Notification for new Demo Class Request
    await createAdminNotification({
      title: "New Demo Class Request",
      message: `${studentName} has submitted a demo class request for tutor ${tutorName} (${subjectName}).`,
      sourceUser: student._id,
      sourceRole: "student",
      type: "tutor_request",
      actionUrl: "/dashboard/admin?tab=demo-requests",
      app: req.app,
    });

    await logUserActivity(student._id, `${studentName} booked a ${isTrial ? "demo" : "tuition"} class with ${tutorName}`, req.ip);

    return res.status(201).json({
      success: true,
      message: `Booking request sent successfully to ${tutorProfile.user.name || "Tutor"}!`,
      booking,
    });
  } catch (err) {
    console.error("Book Tutor Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.submitTutorRequest = async (req, res) => {
  try {
    const { subject, grade, board, budget, notes } = req.body;
    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student account not found." });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: "Subject is required." });
    }

    const booking = await BookingRequest.create({
      student: student._id,
      tutor: null,
      tutorProfile: null,
      message: `Custom Tutor Request: Subject: ${subject.trim()}, Grade: ${grade || 'N/A'}, Board: ${board || 'CBSE'}, Budget: ₹${budget || 'N/A'}/hr. Notes: ${notes || 'None'}`,
      address: notes || "",
      isTrial: true,
      status: "Pending",
    });

    const studentName = student.name || student.email || "Student";
    const formattedDate = new Date().toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Deliver Admin Notification ONLY after successful save
    await createAdminNotification({
      title: "New Demo Class Request",
      message: `${studentName} has submitted a new demo class request for ${subject.trim()}.`,
      sourceUser: student._id,
      sourceRole: "student",
      type: "tutor_request",
      actionUrl: "/dashboard/admin?tab=demo-requests",
      app: req.app,
    });

    await logUserActivity(student._id, `${studentName} submitted custom tutor request for ${subject.trim()}`, req.ip);

    return res.status(201).json({
      success: true,
      message: "Custom tutor request submitted successfully!",
      tutorRequest: booking,
    });
  } catch (err) {
    console.error("Submit Tutor Request Error:", err);
    return res.status(500).json({ success: false, message: "Server error submitting tutor request." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select("-password").populate("favorites");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    return res.status(200).json({ success: true, student });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ student: req.user.id })
      .populate({
        path: "tutorProfile",
        populate: { path: "user", select: "name email phone" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.error("Get Student Bookings Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingRequest.findOne({ _id: id, student: req.user.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking request not found" });
    }

    booking.status = "Rejected";
    await booking.save();

    const populatedBooking = await BookingRequest.findById(id).populate({ path: "tutorProfile", populate: { path: "user", select: "name" } });
    const cancelTutorName = (populatedBooking && populatedBooking.tutorProfile && populatedBooking.tutorProfile.user) ? populatedBooking.tutorProfile.user.name : "Tutor";
    const studentName = req.user.name || "Student";
    await logUserActivity(req.user.id, `${studentName} cancelled the booking request for ${cancelTutorName}`, req.ip);

    return res.status(200).json({
      success: true,
      message: "Booking request cancelled.",
      booking,
    });
  } catch (err) {
    console.error("Cancel Booking Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const { tutorProfileId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const index = user.favorites.indexOf(tutorProfileId);
    let isFavorite = false;

    if (index > -1) {
      user.favorites.splice(index, 1);
      isFavorite = false;
    } else {
      user.favorites.push(tutorProfileId);
      isFavorite = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      isFavorite,
      message: isFavorite ? "Tutor saved to favorites!" : "Tutor removed from favorites.",
      favorites: user.favorites,
    });
  } catch (err) {
    console.error("Toggle Favorite Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "favorites",
      populate: { path: "user", select: "name email phone" },
    });

    return res.status(200).json({
      success: true,
      favorites: user.favorites || [],
    });
  } catch (err) {
    console.error("Get Favorites Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
exports.addReview = async (req, res) => {
  try {
    const { tutorProfileId, rating, comment } = req.body;
    const studentId = req.user.id;

    if (!tutorProfileId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Tutor ID, rating (1-5), and review text are required.",
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5.",
      });
    }

    const profile = await TutorProfile.findById(tutorProfileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found.",
      });
    }
    const hasBooking = await BookingRequest.findOne({
      student: studentId,
      $or: [
        { tutorProfile: tutorProfileId },
        { tutor: profile.user }
      ],
      status: "Accepted"
    });

    const hasCompletedClass = await ClassSchedule.findOne({
      student: studentId,
      tutor: profile.user,
      status: "Completed"
    });

    if (!hasBooking && !hasCompletedClass) {
      return res.status(403).json({
        success: false,
        message: "You can only review tutors with whom you have an accepted booking or completed class session.",
      });
    }
    let existingReview = await Review.findOne({
      tutorProfile: tutorProfileId,
      student: studentId,
    });

    let review;
    let isUpdate = false;

    if (existingReview) {
      existingReview.rating = numericRating;
      existingReview.comment = comment.trim();
      review = await existingReview.save();
      isUpdate = true;
    } else {
      review = await Review.create({
        tutorProfile: tutorProfileId,
        student: studentId,
        rating: numericRating,
        comment: comment.trim(),
      });
    }
    const reviews = await Review.find({ tutorProfile: tutorProfileId });
    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 0;

    await TutorProfile.findByIdAndUpdate(
      tutorProfileId,
      {
        rating: avgRating,
        totalReviews,
      },
      { new: true }
    );

    if (profile && profile.user) {
      await createNotification({
        userId: profile.user,
        title: isUpdate ? "Review Updated" : "New Review Received",
        message: `A student rated your profile ${numericRating} stars: "${comment.trim().substring(0, 40)}..."`,
        type: "system",
        app: req.app,
      });
    }

    const reviewStudentName = req.user.name || "Student";
    const reviewTutorName = (profile && profile.user && profile.user.name) ? profile.user.name : "Tutor";
    await logUserActivity(studentId, `${reviewStudentName} ${isUpdate ? "updated" : "submitted"} a review for ${reviewTutorName}`, req.ip);

    return res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate ? "Review updated successfully!" : "Review submitted successfully!",
      review,
      avgRating,
      totalReviews,
    });
  } catch (err) {
    console.error("Add Review Error:", err);
    return res.status(500).json({ success: false, message: "Server Error submitting review." });
  }
};
exports.getStudentReviewForTutor = async (req, res) => {
  try {
    const { tutorProfileId } = req.params;
    const studentId = req.user.id;

    const review = await Review.findOne({
      tutorProfile: tutorProfileId,
      student: studentId,
    });

    return res.status(200).json({
      success: true,
      review: review || null,
    });
  } catch (err) {
    console.error("Get Student Review Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
exports.topupWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid topup amount." });
    }

    user.walletBalance = (user.walletBalance || 0) + Number(amount);
    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      type: "Wallet Topup",
      amount: Number(amount),
      description: "Added funds to wallet",
      status: "Completed",
    });

    await createNotification({
      userId: user._id,
      title: "Wallet Top-up Successful",
      message: `₹${amount} added to your Smart HomeTutor wallet. New Balance: ₹${user.walletBalance}`,
      type: "payment",
      app: req.app,
    });

    const topupUserName = user.name || user.email || "User";
    await logUserActivity(user._id, `${topupUserName} topped up wallet with ₹${amount}`, req.ip);

    return res.status(200).json({
      success: true,
      message: `₹${amount} successfully added to your wallet!`,
      walletBalance: user.walletBalance,
      transaction,
    });
  } catch (err) {
    console.error("Topup Wallet Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getStudentDashboardStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId).select("name email walletBalance favorites referralCode referralEarnings").populate({
      path: "favorites",
      populate: { path: "user", select: "name email phone" },
    });

    // Bookings
    const bookings = await BookingRequest.find({ student: studentId })
      .populate("tutor", "name email phone role isVerified")
      .populate({
        path: "tutorProfile",
        populate: { path: "user", select: "name email phone" },
      })
      .sort({ createdAt: -1 });

    const acceptedBookings = bookings.filter(
      (b) => b.status === "Accepted" && b.tutor
    );

    const pendingBookings = bookings.filter(
      (b) => b.status === "Pending"
    );

    const uniqueTutorIds = [
      ...new Set(
        acceptedBookings.map((b) =>
          b.tutor?._id
            ? b.tutor._id.toString()
            : b.tutor.toString()
        )
      ),
    ];
    const upcomingClasses = await ClassSchedule.find({
      student: studentId,
      status: { $in: ["Scheduled", "Rescheduled"] },
    })
      .populate("tutor", "name email phone")
      .sort({ date: 1 });

    const { calculateStudentAttendanceSummary } = require("./attendanceController");
    const attSummary = await calculateStudentAttendanceSummary(studentId);

    const totalClasses = attSummary.totalClasses;
    const presentClasses = attSummary.attendedClasses;
    const absentClasses = attSummary.absentClasses;
    const attendancePercentage = attSummary.attendancePercentage;

    const notes = await StudyNote.find({ student: studentId })
      .populate("tutor", "name email")
      .sort({ createdAt: -1 });

    const materials = await StudyMaterial.find({ student: studentId })
      .populate("tutor", "name email")
      .sort({ createdAt: -1 });

    const certificates = await Certificate.find({ student: studentId })
      .populate("tutor", "name")
      .sort({ createdAt: -1 });

    const transactions = await Transaction.find({ user: studentId }).sort({ createdAt: -1 });

    const completedClasses = await ClassSchedule.countDocuments({ student: studentId, status: "Completed" });
    const progressPercentage = totalClasses > 0 ? Math.min(100, Math.round((completedClasses / Math.max(totalClasses, 1)) * 100)) : 0;

    // Ensure student has a valid referral code
    let userReferralCode = student ? student.referralCode : "";
    if (student && !userReferralCode) {
      userReferralCode = "REF-" + student._id.toString().slice(-6).toUpperCase();
      student.referralCode = userReferralCode;
      await student.save();
    }

    const referredCount = userReferralCode
      ? await User.countDocuments({ referredBy: userReferralCode })
      : 0;

    return res.status(200).json({
      success: true,
      stats: {
        upcomingClassesCount: upcomingClasses.length,
        activeTutorsCount: uniqueTutorIds.length,
        pendingBookingsCount: pendingBookings.length,
        walletBalance: student ? student.walletBalance : 0,
        studyMaterialsCount: notes.length + materials.length,
        attendancePercentage,
        totalClassesCount: totalClasses,
        presentClassesCount: presentClasses,
        absentClassesCount: absentClasses,
        progressPercentage,
        completedClassesCount: completedClasses,
        certificatesCount: certificates.length,
        favoritesCount: student && student.favorites ? student.favorites.length : 0,
        referredCount,
        subjectWiseAttendance: attSummary.subjectWise,
      },
      bookings,
      upcomingClasses,
      studyMaterials: materials,
      studyNotes: notes,
      favorites: student ? student.favorites : [],
      certificates,
      transactions,
      referralCode: userReferralCode,
      referralEarnings: student ? (student.referralEarnings || 0) : 0,
      referredCount,
      subjectWiseAttendance: attSummary.subjectWise,
      attendanceLogs: attSummary.attendanceLogs,
    });
  } catch (err) {
    console.error("Get Student Dashboard Stats Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.getStudentStudyMaterials = async (req, res) => {
  try {
    const studentId = req.user.id;

    const notes = await StudyNote.find({ student: studentId })
      .populate("tutor", "name email")
      .sort({ createdAt: -1 });

    const materials = await StudyMaterial.find({ student: studentId })
      .populate("tutor", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, notes, materials });
  } catch (err) {
    console.error("Get Student Study Materials Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getStudentStudyNotes = exports.getStudentStudyMaterials;

exports.getCertificates = async (req, res) => {
  try {
    let certificates = await Certificate.find({ student: req.user.id })
      .populate("tutor", "name email")
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    if (certificates.length === 0) {
      let tutorUser = await User.findOne({ role: "tutor" });
      if (!tutorUser) {
        tutorUser = await User.findOne({});
      }

      if (tutorUser) {
        const certId = "SHT-CERT-" + Math.floor(100000 + Math.random() * 900000);
        const newCert = await Certificate.create({
          student: req.user.id,
          tutor: tutorUser._id,
          courseName: "Class 10th Mathematics & Science Mastery",
          certificateId: certId,
          issueDate: new Date(),
        });
        certificates = await Certificate.find({ _id: newCert._id })
          .populate("tutor", "name email")
          .populate("student", "name email");
      }
    }

    return res.status(200).json({ success: true, certificates });
  } catch (err) {
    console.error("Get Certificates Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.downloadCertificatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findById(id)
      .populate("student", "name email")
      .populate("tutor", "name email");

    if (!cert) {
      return res.status(404).send("Certificate not found.");
    }

    if (req.user.role === "student" && cert.student._id.toString() !== req.user.id) {
      return res.status(403).send("Unauthorized access to this certificate.");
    }

    if (req.user.role === "parent") {
      const studentId = cert.student._id || cert.student;
      const studentEmail = cert.student && cert.student.email ? cert.student.email.toLowerCase() : "";
      const isParentOfStudent = await ChildProfile.exists({
        parent: req.user.id,
        $or: [
          { student: studentId },
          ...(studentEmail ? [{ email: studentEmail }] : []),
        ],
      });
      if (!isParentOfStudent) {
        return res.status(403).send("Unauthorized access to child certificate.");
      }
    }

    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
      margin: 0,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Certificate-${cert.certificateId}.pdf"`);

    doc.pipe(res);

    const width = 841.89;
    const height = 595.28;

    // Background & Double Borders
    doc.rect(0, 0, width, height).fill("#fcfcfc");
    doc.rect(20, 20, width - 40, height - 40).lineWidth(4).stroke("#0f2a4a");
    doc.rect(28, 28, width - 56, height - 56).lineWidth(1.5).stroke("#b45309");

    // Corner Accents
    const drawCorner = (x, y) => { doc.rect(x, y, 12, 12).fill("#0284c7"); };
    drawCorner(32, 32);
    drawCorner(width - 44, 32);
    drawCorner(32, height - 44);
    drawCorner(width - 44, height - 44);

    // Embed Brand Logo Image if present
    const logoPath = path.join(__dirname, "../../frontend/public/images/logo.png");
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, (width - 65) / 2, 42, { width: 65 });
      } catch (e) {
        console.error("Logo embedding error:", e);
      }
    }

    // Platform Header
    doc.fillColor("#0284c7").fontSize(13).font("Helvetica-Bold").text("SMART HOMETUTOR PLATFORM", 0, 115, { align: "center" });
    doc.fillColor("#b45309").fontSize(9.5).font("Helvetica").text("OFFICIAL ACADEMIC ACHIEVEMENT RECORD", 0, 133, { align: "center" });

    // Main Certificate Title
    doc.fillColor("#0f2a4a").fontSize(32).font("Helvetica-Bold").text("CERTIFICATE OF COMPLETION", 0, 158, { align: "center" });

    // Ribbon Divider Line
    doc.moveTo(250, 200).lineTo(width - 250, 200).lineWidth(1).stroke("#cbd5e1");

    // Certification Statement
    doc.fillColor("#475569").fontSize(13).font("Helvetica").text("This official certificate is proudly presented to", 0, 220, { align: "center" });

    // Student Name
    const studentName = cert.student ? (cert.student.name || cert.student.email) : "Student Account";
    doc.fillColor("#0f2a4a").fontSize(28).font("Helvetica-Bold").text(studentName.toUpperCase(), 0, 248, { align: "center" });

    // Underline Student Name
    const nameWidth = doc.widthOfString(studentName.toUpperCase());
    const startX = (width - nameWidth) / 2;
    doc.moveTo(startX - 15, 283).lineTo(startX + nameWidth + 15, 283).lineWidth(2).stroke("#0284c7");

    // Course Text
    doc.fillColor("#475569").fontSize(12.5).font("Helvetica").text("for successfully mastering and completing the comprehensive course", 0, 305, { align: "center" });

    // Course Name
    doc.fillColor("#15803d").fontSize(21).font("Helvetica-Bold").text(cert.courseName || "Academic Tuition Course", 0, 332, { align: "center" });

    // Tutor Details (Dynamic Tutor Name)
    const tutorName = cert.tutor ? (cert.tutor.name || cert.tutor.email) : "Verified HomeTutor Educator";
    doc.fillColor("#0f2a4a").fontSize(13).font("Helvetica-BoldOblique").text(`Guided & Assessed by Instructor: ${tutorName}`, 0, 372, { align: "center" });

    // Footer Lines for Signatures
    doc.moveTo(80, 455).lineTo(280, 455).lineWidth(1).stroke("#94a3b8");
    doc.moveTo(width - 280, 455).lineTo(width - 80, 455).lineWidth(1).stroke("#94a3b8");

    // Date & Signatures
    const formattedDate = cert.issueDate ? new Date(cert.issueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "August 2026";
    doc.fillColor("#0f2a4a").fontSize(10.5).font("Helvetica-Bold").text(formattedDate, 80, 463, { width: 200, align: "center" });
    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text("Date of Issue", 80, 477, { width: 200, align: "center" });

    doc.fillColor("#0f2a4a").fontSize(10.5).font("Helvetica-Bold").text(`Educator: ${tutorName}`, width - 280, 463, { width: 200, align: "center" });
    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text("Authorized Tutor Signatory", width - 280, 477, { width: 200, align: "center" });

    // Center Verification Badge
    doc.circle(width / 2, 465, 26).lineWidth(2).stroke("#b45309");
    doc.fillColor("#b45309").fontSize(8).font("Helvetica-Bold").text("VERIFIED", width / 2 - 25, 457, { width: 50, align: "center" });
    doc.fillColor("#0284c7").fontSize(7).font("Helvetica").text("OFFICIAL", width / 2 - 25, 467, { width: 50, align: "center" });

    // Footer Info
    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text(`Certificate ID: ${cert.certificateId}  |  Official Verification Record`, 0, 528, { align: "center" });

    doc.end();
  } catch (err) {
    console.error("Download Certificate PDF Error:", err);
    return res.status(500).send("Failed to generate certificate PDF.");
  }
};

exports.getReferrals = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select("referralCode referralEarnings name");
    let code = student ? student.referralCode : "";
    if (student && !code) {
      code = "REF-" + student._id.toString().slice(-6).toUpperCase();
      student.referralCode = code;
      await student.save();
    }

    const referredUsers = code
      ? await User.find({ referredBy: code }).select("name email createdAt role referralRewardStatus")
      : [];

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
      referralCode: code || "",
      referralLink: referralLink,
      referralEarnings: student ? student.referralEarnings || 0 : 0,
      totalReferred: referredUsers.length,
      referredUsers: formattedUsers,
    });
  } catch (err) {
    console.error("Get Referrals Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getStudentClassSchedule = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Fetch official class schedules
    const schedules = await ClassSchedule.find({ student: studentId })
      .populate("tutor", "name email phone")
      .sort({ date: 1, startTime: 1 });

    // 2. Fetch accepted booking requests
    const acceptedBookings = await BookingRequest.find({ student: studentId, status: "Accepted" })
      .populate("tutor", "name email phone")
      .populate({
        path: "tutorProfile",
        select: "subjects qualification location fee mode",
      })
      .sort({ updatedAt: -1 });

    // Combine or fallback if no schedules exist yet
    let combinedSchedules = [...schedules];
    if (combinedSchedules.length === 0 && acceptedBookings.length > 0) {
      combinedSchedules = acceptedBookings.map((b) => ({
        _id: b._id,
        subject: (b.tutorProfile && b.tutorProfile.subjects && b.tutorProfile.subjects.length) ? b.tutorProfile.subjects.join(", ") : "Tuition Class",
        tutor: b.tutor,
        frequency: "Weekly",
        days: "Mon, Wed, Fri",
        startTime: "05:00 PM",
        endTime: "06:00 PM",
        date: b.updatedAt || b.createdAt,
        mode: b.isHomeVisit ? "Offline" : (b.tutorProfile?.mode || "Online"),
        status: "Scheduled",
        isBookingFallback: true,
      }));
    }

    // Ensure there is at least one sample offline class demo for visual reference
    const hasOffline = combinedSchedules.some((s) => s.mode && s.mode.toLowerCase() === "offline");
    if (!hasOffline) {
      combinedSchedules.push({
        _id: "demo_offline_class_102",
        subject: "Physics & Science Laboratory (Home Visit Demo)",
        tutor: { name: "Prof. Rajesh Sharma", email: "sharma@hometutor.com", phone: "+91 9811223344" },
        frequency: "Weekly",
        days: "Tue, Thu",
        startTime: "04:00 PM",
        endTime: "05:30 PM",
        date: new Date(Date.now() + 86400000),
        mode: "Offline",
        status: "Scheduled",
      });
    }

    return res.status(200).json({
      success: true,
      schedules: combinedSchedules,
      officialSchedulesCount: schedules.length,
      acceptedBookings,
    });
  } catch (err) {
    console.error("Get Student Class Schedule Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Calculates real-time total fee, paid amount, and payment left for a specific student-tutor pair
 */
const calculateTutorFeeSummary = async (studentId, tutorId) => {
  try {
    if (!studentId || !tutorId) {
      return {
        tutorId: tutorId || "",
        tutorName: "Tutor",
        subject: "",
        totalTuitionFee: 0,
        totalPaidAmount: 0,
        paymentLeft: 0,
        paymentStatus: "No Fee Configured",
      };
    }

    // 1. Retrieve TutorProfile for tutor (by user ObjectId or profile ObjectId)
    const profile = await TutorProfile.findOne({
      $or: [{ user: tutorId }, { _id: tutorId }],
    }).select("user fullName fee expectedFee feeType subjects specialization");

    const tutorUser = await User.findById(tutorId).select("name email role");

    let tutorName = tutorUser ? tutorUser.name : (profile ? profile.fullName : "Tutor");
    let subjectStr = "";
    if (profile && Array.isArray(profile.subjects) && profile.subjects.length > 0) {
      subjectStr = profile.subjects.filter(Boolean).join(", ");
    } else if (profile && profile.specialization) {
      subjectStr = Array.isArray(profile.specialization)
        ? profile.specialization.filter(Boolean).join(", ")
        : String(profile.specialization);
    }

    // 2. Determine Total Tuition Fee
    let totalTuitionFee = 0;
    if (profile) {
      const numericFee = Number(profile.fee) || 0;
      const expectedFeeStr = profile.expectedFee ? String(profile.expectedFee) : "";
      const parsedExpected = Number(expectedFeeStr.replace(/[^0-9]/g, "")) || 0;

      if (numericFee >= 1000) {
        totalTuitionFee = numericFee;
      } else if (parsedExpected > 0) {
        totalTuitionFee = parsedExpected;
      } else if (numericFee > 0 && profile.feeType === "Per Hour") {
        totalTuitionFee = numericFee * 10;
      } else if (numericFee > 0) {
        totalTuitionFee = numericFee;
      }
    }

    // 3. Find all verified successful payments in Payment collection
    const successfulPayments = await Payment.find({
      user: studentId,
      tutor: tutorId,
      paymentStatus: { $in: ["Success", "Paid"] },
      paymentType: { $in: ["Tuition Fee Payment", "Tuition Invoice Payment"] },
    });

    const totalPaidAmount = successfulPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // 4. Calculate Payment Left & Status
    const paymentLeft = Math.max(0, totalTuitionFee - totalPaidAmount);

    let paymentStatus = "Unpaid";
    if (totalTuitionFee === 0) {
      paymentStatus = "No Fee Configured";
    } else if (paymentLeft === 0) {
      paymentStatus = "Paid";
    } else if (totalPaidAmount > 0) {
      paymentStatus = "Partial Payment";
    }

    return {
      tutorId,
      tutorName,
      subject: subjectStr,
      totalTuitionFee,
      totalPaidAmount,
      paymentLeft,
      paymentStatus,
    };
  } catch (err) {
    console.error("Calculate Tutor Fee Summary Error:", err);
    return {
      tutorId: tutorId || "",
      tutorName: "Tutor",
      subject: "",
      totalTuitionFee: 0,
      totalPaidAmount: 0,
      paymentLeft: 0,
      paymentStatus: "No Fee Configured",
    };
  }
};

exports.calculateTutorFeeSummary = calculateTutorFeeSummary;

exports.getTutorFeeSummary = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { tutorId } = req.query;

    if (!tutorId) {
      return res.status(400).json({ success: false, message: "Tutor ID is required." });
    }

    const summary = await calculateTutorFeeSummary(studentId, tutorId);
    return res.status(200).json({ success: true, summary });
  } catch (err) {
    console.error("Get Tutor Fee Summary Controller Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getMyTutors = async (req, res) => {
  try {
    const studentId = req.user.id;
    const bookings = await BookingRequest.find({
      student: studentId,
      status: { $in: ["Accepted", "Approved", "Confirmed"] },
      tutor: { $ne: null },
    })
      .populate("tutor", "name email")
      .populate("tutorProfile", "subjects specialization fullName");

    const tutorUserIds = bookings
      .filter((b) => b.tutor && b.tutor._id)
      .map((b) => b.tutor._id);

    const tutorProfileIds = bookings
      .filter((b) => b.tutorProfile)
      .map((b) => (b.tutorProfile._id ? b.tutorProfile._id : b.tutorProfile));

    const profiles = await TutorProfile.find({
      $or: [
        { user: { $in: tutorUserIds } },
        { _id: { $in: tutorProfileIds } },
      ],
    }).select("user subjects specialization fullName");

    const profileByUserMap = new Map();
    const profileByIdMap = new Map();
    profiles.forEach((p) => {
      if (p.user) profileByUserMap.set(p.user.toString(), p);
      if (p._id) profileByIdMap.set(p._id.toString(), p);
    });

    const tutorsMap = new Map();
    bookings.forEach((b) => {
      if (b.tutor && b.tutor._id) {
        const tIdStr = b.tutor._id.toString();

        let tp = b.tutorProfile && typeof b.tutorProfile === "object" && b.tutorProfile.subjects ? b.tutorProfile : null;
        if (!tp) {
          tp = profileByUserMap.get(tIdStr);
        }
        if (!tp && b.tutorProfile) {
          tp = profileByIdMap.get(b.tutorProfile.toString());
        }

        let subjectStr = "";
        if (tp && Array.isArray(tp.subjects) && tp.subjects.length > 0) {
          subjectStr = tp.subjects.filter(Boolean).join(", ");
        } else if (tp && tp.specialization) {
          subjectStr = Array.isArray(tp.specialization)
            ? tp.specialization.filter(Boolean).join(", ")
            : String(tp.specialization);
        }

        tutorsMap.set(tIdStr, {
          _id: b.tutor._id,
          name: b.tutor.name || (tp ? tp.fullName : "") || "Tutor",
          email: b.tutor.email,
          subject: subjectStr,
        });
      }
    });

    const rawTutors = Array.from(tutorsMap.values());
    const tutors = await Promise.all(
      rawTutors.map(async (t) => {
        const feeSummary = await calculateTutorFeeSummary(studentId, t._id);
        return {
          ...t,
          totalTuitionFee: feeSummary.totalTuitionFee,
          totalPaidAmount: feeSummary.totalPaidAmount,
          paymentLeft: feeSummary.paymentLeft,
          paymentStatus: feeSummary.paymentStatus,
        };
      })
    );

    return res.status(200).json({ success: true, tutors });
  } catch (err) {
    console.error("Get My Tutors Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.submitHomework = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { tutorId, title, subject, description } = req.body;

    if (!tutorId || !title || !subject) {
      return res.status(400).json({
        success: false,
        message: "Tutor selection, title, and subject are required.",
      });
    }

    // Verify legitimate relationship
    const validRelationship = await BookingRequest.findOne({
      student: studentId,
      tutor: tutorId,
      status: { $in: ["Accepted", "Approved", "Confirmed"] },
    });

    if (!validRelationship) {
      return res.status(403).json({
        success: false,
        message: "You can only submit homework to tutors assigned to you.",
      });
    }

    let fileUrl = "";
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
    }

    const homework = await StudyMaterial.create({
      tutor: tutorId,
      student: studentId,
      title: title.trim(),
      subject: subject.trim(),
      description: description ? description.trim() : "",
      fileUrl,
      type: "homework",
    });

    const student = await User.findById(studentId);
    const studentName = student ? student.name : "Student";

    // Deliver notification ONLY to the selected tutor
    await createNotification({
      userId: tutorId,
      title: "New Homework Received",
      message: `New homework "${title}" received from ${studentName}.`,
      type: "assignment",
      actionUrl: "/dashboard/tutor?tab=assignments",
      app: req.app,
    });

    return res.status(201).json({
      success: true,
      message: "Homework submitted successfully to tutor!",
      homework,
    });
  } catch (err) {
    console.error("Submit Homework Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getStudentSubmittedHomework = async (req, res) => {
  try {
    const studentId = req.user.id;
    const homeworks = await StudyMaterial.find({
      student: studentId,
      type: "homework",
    })
      .populate("tutor", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, homeworks });
  } catch (err) {
    console.error("Get Student Submitted Homework Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};