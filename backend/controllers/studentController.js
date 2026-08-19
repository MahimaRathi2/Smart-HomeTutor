
const User = require("../models/User");
const BookingRequest = require("../models/BookingRequest");
const TutorProfile = require("../models/TutorProfile");
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
      status: "Pending",
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You already have a pending booking request for ${tutorProfile.user.name || "this tutor"}.`,
      });
    }

    const booking = await BookingRequest.create({
      student: student._id,
      tutor: tutorProfile.user._id,
      tutorProfile: tutorProfile._id,
      message: message || "Demo Class / Home Visit Request",
      address: address || "",
      coordinates: {
        lat: lat !== undefined ? Number(lat) : 28.6139,
        lng: lng !== undefined ? Number(lng) : 77.2090,
      },
      isHomeVisit: Boolean(isHomeVisit),
      homeVisitStatus: isHomeVisit ? "Scheduled" : "N/A",
      isTrial: isTrial !== undefined ? Boolean(isTrial) : true,
    });

    await createNotification({
      userId: tutorProfile.user._id,
      title: "New Booking Request 📥",
      message: `${student.name || "A student"} requested a ${isTrial ? "Trial" : "Regular"} session.`,
      type: "booking",
      app: req.app,
    });

    const studentName = student.name || student.email || "Student";
    const tutorName = (tutorProfile.user && tutorProfile.user.name) ? tutorProfile.user.name : "Tutor";
    const subjectName = tutorProfile.primarySubject || "Tuition";

    // Deliver Admin Notification for new Tutor Request
    await createAdminNotification({
      title: "New Tutor Request",
      message: `${studentName} has submitted a tutor request for ${subjectName}.`,
      sourceUser: student._id,
      sourceRole: "student",
      type: "tutor_request",
      actionUrl: "/dashboard/admin?tab=tutor-verifications",
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
      title: "New Tutor Request",
      message: `${studentName} has submitted a new tutor request for ${subject.trim()}.`,
      sourceUser: student._id,
      sourceRole: "student",
      type: "tutor_request",
      actionUrl: "/dashboard/admin?tab=tutor-verifications",
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
        title: isUpdate ? "Review Updated ⭐" : "New Review Received ⭐",
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
      title: "Wallet Top-up Successful 💰",
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
      .populate({
        path: "tutorProfile",
        populate: { path: "user", select: "name email phone" },
      })
      .sort({ createdAt: -1 });

    const acceptedBookings = bookings.filter((b) => b.status === "Accepted");
    const pendingBookings = bookings.filter((b) => b.status === "Pending");
    const tutorUserIds = acceptedBookings.map((b) => b.tutor.toString());
    const upcomingClasses = await ClassSchedule.find({
      student: studentId,
      status: { $in: ["Scheduled", "Rescheduled"] },
    })
      .populate("tutor", "name email phone")
      .sort({ date: 1 });

    const totalClasses = await ClassSchedule.countDocuments({ student: studentId });
    const presentClasses = await ClassSchedule.countDocuments({ student: studentId, attendance: "Present" });
    const absentClasses = await ClassSchedule.countDocuments({ student: studentId, attendance: "Absent" });
    const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

    const notes = await StudyNote.find({ tutor: { $in: tutorUserIds } })
      .populate("tutor", "name email")
      .sort({ createdAt: -1 });

    const materials = await StudyMaterial.find({ tutor: { $in: tutorUserIds } })
      .populate("tutor", "name email")
      .sort({ createdAt: -1 });

    
    const certificates = await Certificate.find({ student: studentId })
      .populate("tutor", "name")
      .sort({ createdAt: -1 });

    
    const transactions = await Transaction.find({ user: studentId }).sort({ createdAt: -1 });

   
    const completedClasses = await ClassSchedule.countDocuments({ student: studentId, status: "Completed" });
    const progressPercentage = totalClasses > 0 ? Math.min(100, Math.round((completedClasses / Math.max(totalClasses, 1)) * 100)) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        upcomingClassesCount: upcomingClasses.length,
        activeTutorsCount: tutorUserIds.length,
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
      },
      bookings,
      upcomingClasses,
      studyMaterials: materials,
      studyNotes: notes,
      favorites: student ? student.favorites : [],
      certificates,
      transactions,
      referralCode: student ? student.referralCode : "",
      referralEarnings: student ? student.referralEarnings : 0,
    });
  } catch (err) {
    console.error("Get Student Dashboard Stats Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.getStudentStudyMaterials = async (req, res) => {
  try {
    const studentId = req.user.id;
    const acceptedBookings = await BookingRequest.find({ student: studentId, status: "Accepted" });
    const tutorUserIds = acceptedBookings.map((b) => b.tutor.toString());

    const notes = await StudyNote.find({ tutor: { $in: tutorUserIds } })
      .populate("tutor", "name email")
      .sort({ createdAt: -1 });

    const materials = await StudyMaterial.find({ tutor: { $in: tutorUserIds } })
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
    const certificates = await Certificate.find({ student: req.user.id })
      .populate("tutor", "name email")
      .sort({ createdAt: -1 });

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

    // Platform Header
    doc.fillColor("#0284c7").fontSize(14).font("Helvetica-Bold").text("SMART HOMETUTOR PLATFORM", 0, 65, { align: "center" });
    doc.fillColor("#b45309").fontSize(10).font("Helvetica").text("OFFICIAL ACADEMIC ACHIEVEMENT RECORD", 0, 85, { align: "center" });

    // Main Certificate Title
    doc.fillColor("#0f2a4a").fontSize(34).font("Helvetica-Bold").text("CERTIFICATE OF COMPLETION", 0, 120, { align: "center" });

    // Ribbon Divider Line
    doc.moveTo(250, 168).lineTo(width - 250, 168).lineWidth(1).stroke("#cbd5e1");

    // Certification Statement
    doc.fillColor("#475569").fontSize(13).font("Helvetica").text("This official certificate is proudly presented to", 0, 195, { align: "center" });

    // Student Name
    const studentName = cert.student ? cert.student.name : "Student Account";
    doc.fillColor("#0f2a4a").fontSize(28).font("Helvetica-Bold").text(studentName.toUpperCase(), 0, 225, { align: "center" });

    // Underline Student Name
    const nameWidth = doc.widthOfString(studentName.toUpperCase());
    const startX = (width - nameWidth) / 2;
    doc.moveTo(startX - 15, 260).lineTo(startX + nameWidth + 15, 260).lineWidth(2).stroke("#0284c7");

    // Course Text
    doc.fillColor("#475569").fontSize(13).font("Helvetica").text("for successfully mastering and completing the comprehensive course", 0, 285, { align: "center" });

    // Course Name
    doc.fillColor("#15803d").fontSize(22).font("Helvetica-Bold").text(cert.courseName, 0, 315, { align: "center" });

    // Tutor Details
    const tutorName = cert.tutor ? cert.tutor.name : "Verified HomeTutor Educator";
    doc.fillColor("#334155").fontSize(12).font("Helvetica-Oblique").text(`Guided and Assessed by Instructor: ${tutorName}`, 0, 355, { align: "center" });

    // Footer Lines
    doc.moveTo(80, 440).lineTo(280, 440).lineWidth(1).stroke("#94a3b8");
    doc.moveTo(width - 280, 440).lineTo(width - 80, 440).lineWidth(1).stroke("#94a3b8");

    // Date & Signatures
    const formattedDate = cert.issueDate ? new Date(cert.issueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "August 2026";
    doc.fillColor("#0f2a4a").fontSize(11).font("Helvetica-Bold").text(formattedDate, 80, 448, { width: 200, align: "center" });
    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text("Date of Issue", 80, 462, { width: 200, align: "center" });

    doc.fillColor("#0f2a4a").fontSize(11).font("Helvetica-Bold").text("Smart HomeTutor Board", width - 280, 448, { width: 200, align: "center" });
    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text("Authorized Signatory", width - 280, 462, { width: 200, align: "center" });

    // Center Verification Badge
    doc.circle(width / 2, 450, 26).lineWidth(2).stroke("#b45309");
    doc.fillColor("#b45309").fontSize(8).font("Helvetica-Bold").text("VERIFIED", width / 2 - 25, 442, { width: 50, align: "center" });
    doc.fillColor("#0284c7").fontSize(7).font("Helvetica").text("OFFICIAL", width / 2 - 25, 452, { width: 50, align: "center" });

    // Footer Info
    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text(`Certificate ID: ${cert.certificateId}  |  Verify online at /api/certificates/${cert.certificateId}`, 0, 520, { align: "center" });

    doc.end();
  } catch (err) {
    console.error("Download Certificate PDF Error:", err);
    return res.status(500).send("Failed to generate certificate PDF.");
  }
};

exports.getReferrals = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select("referralCode referralEarnings name");
    const referredUsers = await User.find({ referredBy: student.referralCode }).select("name email createdAt role");

    return res.status(200).json({
      success: true,
      referralCode: student.referralCode || "",
      referralEarnings: student.referralEarnings || 0,
      totalReferred: referredUsers.length,
      referredUsers,
    });
  } catch (err) {
    console.error("Get Referrals Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getStudentClassSchedule = async (req, res) => {
  try {
    const studentId = req.user.id;

    
    const schedules = await ClassSchedule.find({ student: studentId })
      .populate("tutor", "name email phone")
      .sort({ date: 1, startTime: 1 });

    
    const acceptedBookings = await BookingRequest.find({ student: studentId, status: "Accepted" })
      .populate("tutor", "name email phone")
      .populate({
        path: "tutorProfile",
        select: "subjects qualification location fee mode",
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      schedules,
      acceptedBookings,
    });
  } catch (err) {
    console.error("Get Student Class Schedule Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};