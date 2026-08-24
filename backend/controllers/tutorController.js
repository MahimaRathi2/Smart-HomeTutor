
const BookingRequest = require("../models/BookingRequest");
const TutorProfile = require("../models/TutorProfile");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const StudyMaterial = require("../models/StudyMaterial");
const StudyNote = require("../models/StudyNote");
const Review = require("../models/Review");
const ClassSchedule = require("../models/ClassSchedule");
const Certificate = require("../models/Certificate");
const CertificateRequest = require("../models/CertificateRequest");
const PayoutRequest = require("../models/PayoutRequest");
const mongoose = require("mongoose");
const { createNotification, createAdminNotification } = require("../utils/notificationHelper");
const { logUserActivity } = require("../utils/activityLogHelper");

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

exports.getTutorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const tutorProfile = await TutorProfile.findOne({ user: user._id }).sort({ createdAt: -1 }).populate("user", "name email phone role tutorStatus");

    let tutorStatus = user.tutorStatus || "not_applied";
    if (tutorProfile) {
      if (tutorProfile.registrationStatus === "Approved" && tutorStatus !== "approved") {
        user.tutorStatus = "approved";
        await user.save();
        tutorStatus = "approved";
      } else if (tutorProfile.registrationStatus === "Pending" && tutorStatus === "not_applied") {
        user.tutorStatus = "pending";
        await user.save();
        tutorStatus = "pending";
      } else if (tutorProfile.registrationStatus === "Rejected" && tutorStatus !== "rejected") {
        user.tutorStatus = "rejected";
        await user.save();
        tutorStatus = "rejected";
      }
    }

    return res.status(200).json({
      success: true,
      tutorProfile: tutorProfile || null,
      tutorStatus,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get Tutor Profile Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.createTutorProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      fullName,
      gender,
      dob,
      mobile,
      whatsapp,
      email,
      alternateContact,
      currentAddress,
      city,
      state,
      pincode,
      teachingArea,
      preferredRadius,
      highestQualification,
      degreeName,
      collegeUniversity,
      passingYear,
      specialization,
      additionalQualifications,
      experienceType,
      totalExperience,
      previousInstitute,
      experienceDuration,
      classesYouTeach,
      board,
      subjectsYouTeach,
      classType,
      teachingMethod,
      studentLevel,
      teachingMode,
      preferredTeachingAreas,
      maxTravelDistance,
      preferredLocation,
      onlinePlatform,
      laptopAvailable,
      stableInternet,
      digitalTabletAvailable,
      availableDays,
      startTime,
      endTime,
      expectedFee,
      feeType,
      negotiable,
      additionalFeeNotes,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      upiId,
      declarationAccepted,
      qualification,
      experience,
      subjects,
      classes,
      fee,
      location,
      mode,
      about,
      lat,
      lng,
      serviceAreaRadius,
      serviceAreas,
      homeVisitsEnabled,
      language,
    } = req.body;

    const parseArray = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input;
      if (typeof input === "string") {
        try {
          const parsed = JSON.parse(input);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
        return input.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return [];
    };

    const subjectsArray = parseArray(subjectsYouTeach || subjects);
    const classesArray = parseArray(classesYouTeach || classes);
    const boardArray = parseArray(board);
    const classTypeArray = parseArray(classType);
    const specializationArray = parseArray(specialization);
    const languageArray = parseArray(language);
    const serviceAreasArray = parseArray(serviceAreas);
    const availableDaysArray = parseArray(availableDays);

    const userId = (req.user && req.user.id) ? req.user.id : null;

    // Backend mandatory fields validation across all steps
    const compName = (fullName || `${firstName || ""} ${lastName || ""}`).trim();
    if (!compName) {
      return res.status(400).json({ success: false, message: "First Name and Last Name / Full Name are required." });
    }
    if (!mobile || !/^\d{10}$/.test(String(mobile).trim())) {
      return res.status(400).json({ success: false, message: "Mobile number must contain exactly 10 digits." });
    }
    if (whatsapp && String(whatsapp).trim() && !/^\d{10}$/.test(String(whatsapp).trim())) {
      return res.status(400).json({ success: false, message: "WhatsApp number must contain exactly 10 digits." });
    }
    if (pincode && String(pincode).trim() && !/^\d{6}$/.test(String(pincode).trim())) {
      return res.status(400).json({ success: false, message: "Pincode must contain exactly 6 digits." });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, message: "Email Address is required." });
    }
    if (!currentAddress || !String(currentAddress).trim()) {
      return res.status(400).json({ success: false, message: "Current Address is required." });
    }
    if (!city || !String(city).trim()) {
      return res.status(400).json({ success: false, message: "City is required." });
    }
    if (!highestQualification && !qualification) {
      return res.status(400).json({ success: false, message: "Highest Qualification is required." });
    }
    if (!totalExperience && !experience) {
      return res.status(400).json({ success: false, message: "Total Teaching Experience is required." });
    }
    if (subjectsArray.length === 0) {
      return res.status(400).json({ success: false, message: "At least one Subject is required." });
    }
    if (classesArray.length === 0) {
      return res.status(400).json({ success: false, message: "At least one Class is required." });
    }

    // Process File Uploads from req.files
    const documents = [];
    let profileImageUrl = "";

    if (req.files) {
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        profileImageUrl = `/uploads/tutors/${req.files.profilePhoto[0].filename}`;
      }
      if (req.files.qualificationDoc && req.files.qualificationDoc[0]) {
        documents.push({
          name: req.files.qualificationDoc[0].originalname || "Qualification Certificate",
          docType: "Qualification Certificate",
          fileUrl: `/uploads/tutors/${req.files.qualificationDoc[0].filename}`,
          status: "Pending",
          uploadedAt: new Date(),
        });
      }
      if (req.files.idProofDoc && req.files.idProofDoc[0]) {
        documents.push({
          name: req.files.idProofDoc[0].originalname || "ID Proof",
          docType: "ID Proof",
          fileUrl: `/uploads/tutors/${req.files.idProofDoc[0].filename}`,
          status: "Pending",
          uploadedAt: new Date(),
        });
      }
      if (req.files.experienceDoc && req.files.experienceDoc[0]) {
        documents.push({
          name: req.files.experienceDoc[0].originalname || "Experience Certificate",
          docType: "Experience Certificate",
          fileUrl: `/uploads/tutors/${req.files.experienceDoc[0].filename}`,
          status: "Pending",
          uploadedAt: new Date(),
        });
      }
      if (req.files.resumeDoc && req.files.resumeDoc[0]) {
        documents.push({
          name: req.files.resumeDoc[0].originalname || "Resume / CV",
          docType: "Resume / CV",
          fileUrl: `/uploads/tutors/${req.files.resumeDoc[0].filename}`,
          status: "Pending",
          uploadedAt: new Date(),
        });
      }
      if (req.files.addressProofDoc && req.files.addressProofDoc[0]) {
        documents.push({
          name: req.files.addressProofDoc[0].originalname || "Address Proof",
          docType: "Address Proof",
          fileUrl: `/uploads/tutors/${req.files.addressProofDoc[0].filename}`,
          status: "Pending",
          uploadedAt: new Date(),
        });
      }
    }

    const coordinatesObj = {
      lat: lat !== undefined ? Number(lat) : 28.6139,
      lng: lng !== undefined ? Number(lng) : 77.2090,
    };

    const numFee = Number(expectedFee || fee) || 0;
    const numExp = Number(totalExperience || experience) || 0;

    const computedFullName = (fullName || `${firstName || ''} ${lastName || ''}`).trim();

    // ALWAYS create a NEW TutorProfile application document
    const tutorProfile = await TutorProfile.create({
      user: userId,
      firstName: firstName || "",
      lastName: lastName || "",
      fullName: computedFullName || (req.user ? req.user.name : "") || "Tutor Applicant",
      gender: gender || "Not Specified",
      dob: dob || "",
      mobile: mobile || (req.user ? req.user.phone : "") || "",
      whatsapp: whatsapp || "",
      email: email || (req.user ? req.user.email : "") || "",
      alternateContact: alternateContact || "",
      currentAddress: currentAddress || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      teachingArea: teachingArea || "",
      preferredRadius: preferredRadius || "10 km",
      qualification: highestQualification || qualification || "Degree",
      highestQualification: highestQualification || qualification || "",
      degreeName: degreeName || "",
      collegeUniversity: collegeUniversity || "",
      passingYear: passingYear || "",
      specialization: specializationArray.length ? specializationArray : parseArray(specialization),
      additionalQualifications: additionalQualifications || "",
      experienceType: experienceType || "Experienced",
      totalExperience: String(totalExperience || experience || "0"),
      experience: numExp,
      previousInstitute: previousInstitute || "",
      experienceDuration: experienceDuration || "",
      subjects: subjectsArray,
      classes: classesArray,
      board: boardArray,
      classType: classTypeArray.length ? classTypeArray : ["One-to-One"],
      teachingMethod: teachingMethod || "",
      studentLevel: studentLevel || "Intermediate",
      mode: teachingMode || mode || "Both",
      preferredTeachingAreas: preferredTeachingAreas || "",
      maxTravelDistance: maxTravelDistance || "10 km",
      preferredLocation: preferredLocation || "",
      onlinePlatform: onlinePlatform || "Zoom / Google Meet",
      laptopAvailable: laptopAvailable || "Yes",
      stableInternet: stableInternet || "Yes",
      digitalTabletAvailable: digitalTabletAvailable || "No",
      availableDays: availableDaysArray,
      startTime: startTime || "09:00",
      endTime: endTime || "19:00",
      fee: numFee,
      expectedFee: String(expectedFee || fee || ""),
      feeType: feeType || "Per Hour",
      negotiable: negotiable || "Yes",
      additionalFeeNotes: additionalFeeNotes || "",
      paymentDetails: {
        accountHolderName: accountHolderName || "",
        bankName: bankName || "",
        accountNumber: accountNumber || "",
        ifscCode: ifscCode || "",
        upiId: upiId || "",
      },
      declarationAccepted: declarationAccepted === "true" || declarationAccepted === true,
      location: city || location || "Online",
      about: teachingMethod || about || "",
      profileImage: profileImageUrl,
      coordinates: coordinatesObj,
      serviceAreaRadius: Number(serviceAreaRadius) || 10,
      serviceAreas: serviceAreasArray,
      homeVisitsEnabled: homeVisitsEnabled !== undefined ? Boolean(homeVisitsEnabled) : true,
      language: languageArray,
      registrationStatus: "Pending",
      verificationStatus: "Pending",
      verified: false,
      documents: documents,
    });

    if (userId) {
      await User.findByIdAndUpdate(userId, { tutorStatus: "pending" });
      await logUserActivity(userId, `Registered new tutor application (#${tutorProfile._id})`, req.ip);
    }

    return res.status(201).json({
      success: true,
      message: "Tutor registration application submitted successfully.",
      tutorProfile,
      tutorStatus: "pending",
    });
  } catch (error) {
    console.error("Create Tutor Profile Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAllTutors = async (req, res) => {
  try {
    const {
      subject,
      location,
      mode,
      minFee,
      maxFee,
      grade,
      board,
      gender,
      language,
      experience,
      minRating,
      search,
      available,
      lat,
      lng,
      distanceRadius,
    } = req.query;

    let filter = {};

    if (available === "true") filter.available = true;
    if (subject && subject !== "all") filter.subjects = { $regex: subject, $options: "i" };
    if (location && location !== "all") filter.location = { $regex: location, $options: "i" };
    if (mode && mode !== "all") filter.mode = { $regex: mode, $options: "i" };
    if (grade && grade !== "all") {
      if (grade === "Class 1-5" || grade === "Grade 1-5") {
        filter.classes = { $regex: "(Class\\s*[1-5]\\b|Grade\\s*[1-5]\\b|Class 1-5|Grade 1-5|Primary|All Grades|Class 1 to 12)", $options: "i" };
      } else if (grade === "Class 6-8" || grade === "Grade 6-8") {
        filter.classes = { $regex: "(Class\\s*[6-8]\\b|Grade\\s*[6-8]\\b|Class 6-8|Grade 6-8|Middle|All Grades|Class 1 to 12)", $options: "i" };
      } else if (grade === "Class 9-10" || grade === "Grade 9-10") {
        filter.classes = { $regex: "(Class\\s*(9|10)\\b|Grade\\s*(9|10)\\b|Class 9-10|Grade 9-10|Secondary|All Grades|Class 1 to 12)", $options: "i" };
      } else if (grade === "Class 11-12" || grade === "Grade 11-12") {
        filter.classes = { $regex: "(Class\\s*(11|12)\\b|Grade\\s*(11|12)\\b|Class 11-12|Grade 11-12|Senior|All Grades|Class 1 to 12)", $options: "i" };
      } else if (grade.startsWith("Class ")) {
        const num = grade.replace("Class ", "").trim();
        filter.classes = { $regex: `(Class\\s*${num}\\b|Grade\\s*${num}\\b|All Grades|Class 1 to 12)`, $options: "i" };
      } else {
        filter.classes = { $regex: grade, $options: "i" };
      }
    }
    if (board && board !== "all") filter.board = { $regex: board, $options: "i" };
    if (gender && gender !== "all") filter.gender = { $regex: gender, $options: "i" };
    if (language && language !== "all") filter.language = { $regex: language, $options: "i" };
    if (minRating && Number(minRating) > 0) filter.rating = { $gte: Number(minRating) };

    if (minFee || maxFee) {
      filter.fee = {};
      if (minFee) filter.fee.$gte = Number(minFee);
      if (maxFee) filter.fee.$lte = Number(maxFee);
    }

    if (experience && experience !== "all") {
      if (experience.includes("3-5")) filter.experience = { $gte: 3, $lte: 5 };
      else if (experience.includes("5-10")) filter.experience = { $gte: 5, $lte: 10 };
      else if (experience.includes("10+")) filter.experience = { $gte: 10 };
    }

    let tutors = await TutorProfile.find(filter).populate("user", "name email phone");

    if (search) {
      const searchRegex = new RegExp(search, "i");
      tutors = tutors.filter(
        (t) =>
          (t.user && searchRegex.test(t.user.name)) ||
          searchRegex.test(t.qualification) ||
          t.subjects.some((s) => searchRegex.test(s)) ||
          searchRegex.test(t.location)
      );
    }
    if (lat && lng) {
      const userLat = Number(lat);
      const userLng = Number(lng);
      const maxDistance = distanceRadius ? Number(distanceRadius.replace("km", "")) : 50;

      tutors = tutors
        .map((t) => {
          const tutorLat = t.coordinates?.lat || 28.6139;
          const tutorLng = t.coordinates?.lng || 77.2090;
          const dist = calculateDistanceKm(userLat, userLng, tutorLat, tutorLng);
          return { ...t.toObject(), distanceKm: Math.round(dist * 10) / 10 };
        })
        .filter((t) => t.distanceKm <= maxDistance)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return res.status(200).json({ success: true, count: tutors.length, tutors });
  } catch (error) {
    console.error("Get All Tutors Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.getBookingRequests = async (req, res) => {
  try {
    const tutorId = req.user.id;
    // Only return demo class requests that have passed Admin Approval and are awaiting Tutor response or already actioned by tutor
    const requests = await BookingRequest.find({
      tutor: tutorId,
      status: { $in: ["Pending Tutor Acceptance", "Approved", "Accepted", "Confirmed", "Rejected by Tutor"] },
    })
      .populate("student", "name email phone role")
      .populate("tutorProfile", "qualification fee subjects location primarySubject")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, requests });
  } catch (err) {
    console.error("Get Booking Requests Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.acceptBookingRequest = async (req, res) => {
  try {
    const requestId = req.params.id || req.params.bookingId;
    const booking = await BookingRequest.findOne({ _id: requestId, tutor: req.user.id })
      .populate("student", "name email phone");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Demo class request not found or not assigned to you." });
    }

    booking.status = "Confirmed";
    await booking.save();

    const tutorUser = await User.findById(req.user.id);
    const tutorName = tutorUser ? tutorUser.name : "Tutor";

    // Deliver notification to Student that Tutor has accepted
    if (booking.student) {
      await createNotification({
        userId: booking.student._id,
        title: "Demo Class Confirmed 🎉",
        message: `Your demo class request has been accepted by ${tutorName}.`,
        type: "booking",
        app: req.app,
      });
    }

    await logUserActivity(req.user.id, `Tutor ${tutorName} accepted demo class request (${booking._id})`, req.ip);

    return res.status(200).json({
      success: true,
      message: `Demo class request ACCEPTED successfully!`,
      booking,
    });
  } catch (err) {
    console.error("Tutor Accept Booking Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.rejectBookingRequest = async (req, res) => {
  try {
    const requestId = req.params.id || req.params.bookingId;
    const booking = await BookingRequest.findOne({ _id: requestId, tutor: req.user.id })
      .populate("student", "name email phone");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Demo class request not found or not assigned to you." });
    }

    booking.status = "Rejected by Tutor";
    await booking.save();

    const tutorUser = await User.findById(req.user.id);
    const tutorName = tutorUser ? tutorUser.name : "Tutor";

    // Deliver notification to Student that Tutor declined
    if (booking.student) {
      await createNotification({
        userId: booking.student._id,
        title: "Demo Class Request Update",
        message: `Your demo class request has been declined by the tutor.`,
        type: "booking",
        app: req.app,
      });
    }

    await logUserActivity(req.user.id, `Tutor ${tutorName} declined demo class request (${booking._id})`, req.ip);

    return res.status(200).json({
      success: true,
      message: "Demo class request declined.",
      booking,
    });
  } catch (err) {
    console.error("Tutor Reject Booking Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.respondBookingRequest = async (req, res) => {
  const { action } = req.body;
  if (action === 'accept') {
    return exports.acceptBookingRequest(req, res);
  } else {
    return exports.rejectBookingRequest(req, res);
  }
};

exports.updateHomeVisitStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; // Scheduled, En Route, Arrived, Completed

    if (!["Scheduled", "En Route", "Arrived", "Completed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid home visit status." });
    }

    const booking = await BookingRequest.findOne({ _id: bookingId, tutor: req.user.id }).populate("student", "name");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Home visit booking not found." });
    }

    booking.isHomeVisit = true;
    booking.homeVisitStatus = status;
    await booking.save();

    if (booking.student) {
      await createNotification({
        userId: booking.student._id,
        title: "Home Visit Update 🚗",
        message: `Your tutor home visit status is now: ${status}.`,
        type: "class",
        app: req.app,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Home visit status updated to ${status}.`,
      booking,
    });
  } catch (err) {
    console.error("Update Home Visit Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.uploadDocuments = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { docType, name, fileUrl: bodyFileUrl } = req.body;

    let fileUrl = bodyFileUrl || "";
    if (req.file) {
      fileUrl = `/uploads/documents/${req.file.filename}`;
    }

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: "Document file or URL is required." });
    }

    const profile = await TutorProfile.findOne({ user: tutorId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Tutor profile not found." });
    }

    const newDoc = {
      name: name || "ID Proof / Certificate",
      docType: docType || "ID Proof",
      fileUrl,
      status: "Pending",
      uploadedAt: new Date(),
    };

    profile.documents.push(newDoc);
    profile.verificationStatus = "Pending";
    await profile.save();

    const kycTutorName = req.user.name || "Tutor";
    await logUserActivity(tutorId, `${kycTutorName} uploaded ${docType || "verification document"} for KYC approval`, req.ip);

    return res.status(201).json({
      success: true,
      message: "Verification document uploaded successfully! Admin review in progress.",
      documents: profile.documents,
      verificationStatus: profile.verificationStatus,
    });
  } catch (err) {
    console.error("Upload Documents Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.requestCertificate = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { studentId, courseName, tutorRemarks, attendancePercentage } = req.body;

    if (!studentId || !courseName) {
      return res.status(400).json({ success: false, message: "Student ID and course name are required." });
    }

    const existing = await CertificateRequest.findOne({
      student: studentId,
      courseName: courseName.trim(),
      status: { $in: ["Pending", "Approved"] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.status === "Approved"
          ? "Certificate has already been issued for this course."
          : "Certificate approval request is already pending Admin review.",
      });
    }

    const certRequest = await CertificateRequest.create({
      student: studentId,
      tutor: tutorId,
      courseName: courseName.trim(),
      tutorRemarks: tutorRemarks || "Completed all required modules and attendance.",
      attendancePercentage: attendancePercentage ? Number(attendancePercentage) : 100,
      status: "Pending",
    });

    const admins = await User.find({ role: "admin" }).select("_id");
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        title: "Certificate Approval Request 🎓",
        message: `New certificate approval request for ${courseName} requires review.`,
        type: "system",
        app: req.app,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Course completion request submitted for Admin approval successfully!",
      request: certRequest,
    });
  } catch (err) {
    console.error("Request Certificate Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.issueCertificate = exports.requestCertificate;

exports.getTutorDashboardStats = async (req, res) => {
  try {
    const tutorId = req.user.id;

    // Fetch tutor profile
    const profile = await TutorProfile.findOne({ user: tutorId });

    // Fetch booking request counts
    const pendingRequests = await BookingRequest.countDocuments({ tutor: tutorId, status: "Pending" });
    const acceptedRequests = await BookingRequest.find({ tutor: tutorId, status: "Accepted" }).populate("student", "name email phone");

    // Unique active students count
    const uniqueStudentIds = new Set(acceptedRequests.map((b) => b.student._id.toString()));
    const activeStudentCount = uniqueStudentIds.size;

    // Today's classes schedule
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysClasses = await ClassSchedule.find({
      tutor: tutorId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("student", "name email");

    // Attendance summary stats
    const totalClasses = await ClassSchedule.countDocuments({ tutor: tutorId });
    const completedClasses = await ClassSchedule.countDocuments({ tutor: tutorId, status: "Completed" });
    const presentAttendanceCount = await ClassSchedule.countDocuments({ tutor: tutorId, attendance: "Present" });

    const user = await User.findById(tutorId).select("walletBalance");
    const userWallet = user ? user.walletBalance || 0 : 0;

    const completedClassesList = await ClassSchedule.find({ tutor: tutorId, status: "Completed" });
    const classEarnings = completedClassesList.length * (profile ? profile.fee || profile.hourlyRate || 500 : 500);

    const creditTxns = await Transaction.find({ user: tutorId, status: "Completed", type: { $in: ["Credit", "Tuition Fee Payment", "Wallet Topup"] } });
    const creditEarnings = creditTxns.reduce((sum, t) => sum + (t.amount || 0), 0);

    const grossEarnings = classEarnings + creditEarnings + userWallet;

    const approvedPayouts = await PayoutRequest.find({ tutor: tutorId, status: "Approved" });
    const totalPayoutsDeducted = approvedPayouts.reduce((sum, p) => sum + p.amount, 0);

    const availableBalance = Math.max(0, grossEarnings - totalPayoutsDeducted);

    const payoutHistory = await PayoutRequest.find({ tutor: tutorId }).sort({ createdAt: -1 });
    const pendingPayoutRequest = payoutHistory.find((p) => p.status === "Pending") || null;

 
    const studyMaterialsCount = await StudyMaterial.countDocuments({ tutor: tutorId });

  
    const reviews = profile
      ? await Review.find({ tutorProfile: profile._id }).populate("student", "name").sort({ createdAt: -1 })
      : [];

    let avgRating = profile ? profile.rating : 5.0;
    let totalReviews = profile ? profile.totalReviews : reviews.length;

    return res.status(200).json({
      success: true,
      stats: {
        totalEarnings: grossEarnings,
        availableBalance,
        activeStudentCount,
        pendingRequestsCount: pendingRequests,
        acceptedRequestsCount: acceptedRequests.length,
        todaysClassesCount: todaysClasses.length,
        totalClassesConducted: totalClasses,
        completedClassesCount: completedClasses,
        presentAttendanceCount,
        studyMaterialsCount,
        rating: avgRating,
        totalReviews,
      },
      todaysClasses,
      acceptedStudents: acceptedRequests.map((b) => b.student),
      reviews,
      documents: profile ? profile.documents : [],
      verificationStatus: profile ? profile.verificationStatus : "Pending",
      payoutHistory,
      pendingPayoutRequest,
    });
  } catch (err) {
    console.error("Get Tutor Dashboard Stats Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getMyStudents = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const acceptedBookings = await BookingRequest.find({ tutor: tutorId, status: "Accepted" })
      .populate("student", "name email phone role")
      .sort({ updatedAt: -1 });

    const studentMap = new Map();
    for (const b of acceptedBookings) {
      if (b.student && b.student._id && !studentMap.has(b.student._id.toString())) {
        studentMap.set(b.student._id.toString(), {
          _id: b.student._id,
          name: b.student.name || "Student",
          email: b.student.email,
          subject: b.subject || "General",
        });
      }
    }

    const students = Array.from(studentMap.values());
    return res.status(200).json({ success: true, students });
  } catch (err) {
    console.error("Get My Students Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.uploadNote = async (req, res) => {
  try {
    const { title, subject, class: className, student: studentId, board } = req.body;
    const tutorId = req.user.id;

    if (!title || !subject || !className) {
      return res.status(400).json({ success: false, message: "Title, subject, and class are required." });
    }

    if (!studentId) {
      return res.status(400).json({ success: false, message: "Please select a student to receive these notes." });
    }

    // Verify student is legitimately assigned/accepted by this tutor
    const isAssigned = await BookingRequest.exists({
      tutor: tutorId,
      student: studentId,
      status: { $in: ["Accepted", "Approved", "Confirmed"] },
    });
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: "Unauthorized: You can only share notes with your assigned students." });
    }

    let fileUrl = "";
    if (req.file) {
      fileUrl = `/uploads/documents/${req.file.filename}`;
    }

    const note = await StudyNote.create({
      tutor: tutorId,
      student: studentId,
      title,
      subject,
      board: board || "CBSE",
      class: className,
      fileUrl: fileUrl || "/uploads/documents/default-notes.pdf",
    });

    await StudyMaterial.create({
      tutor: tutorId,
      student: studentId,
      title,
      subject,
      targetGrade: className,
      fileUrl: fileUrl || "/uploads/documents/default-notes.pdf",
      description: `Class: ${className}`,
    }).catch(() => {});

    await createNotification({
      userId: studentId,
      title: "New Study Note Received 📚",
      message: `Your tutor uploaded new notes: ${title} (${subject})`,
      type: "assignment",
      app: req.app,
    });

    const matTutorName = req.user.name || "Tutor";
    await logUserActivity(tutorId, `${matTutorName} uploaded note: ${title}`, req.ip);

    return res.status(201).json({
      success: true,
      message: "Study Note uploaded and shared with student successfully!",
      note,
    });
  } catch (err) {
    console.error("Upload Note Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.uploadMaterial = async (req, res) => {
  try {
    const { title, subject, targetGrade, description, fileUrl: bodyFileUrl, student: studentId } = req.body;
    const tutorId = req.user.id;

    if (!title || !subject) {
      return res.status(400).json({ success: false, message: "Title and subject are required." });
    }

    if (!studentId) {
      return res.status(400).json({ success: false, message: "Please select a student to receive these notes." });
    }

    const isAssigned = await BookingRequest.exists({
      tutor: tutorId,
      student: studentId,
      status: { $in: ["Accepted", "Approved", "Confirmed"] },
    });
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: "Unauthorized: You can only share notes with your assigned students." });
    }

    let fileUrl = bodyFileUrl || "";
    if (req.file) {
      fileUrl = `/uploads/materials/${req.file.filename}`;
    }

    const material = await StudyMaterial.create({
      tutor: tutorId,
      student: studentId,
      title,
      subject,
      targetGrade: targetGrade || "All Grades",
      fileUrl: fileUrl || "/uploads/materials/default-notes.pdf",
      description: description || "",
    });

    await StudyNote.create({
      tutor: tutorId,
      student: studentId,
      title,
      subject,
      board: "CBSE",
      class: targetGrade || "General",
      fileUrl: fileUrl || "/uploads/materials/default-notes.pdf",
    }).catch(() => {});

    await createNotification({
      userId: studentId,
      title: "New Assignment / Study Material 📚",
      message: `Your tutor uploaded new material: ${title} (${subject})`,
      type: "assignment",
      app: req.app,
    });

    const matTutorName = req.user.name || "Tutor";
    await logUserActivity(tutorId, `${matTutorName} uploaded study material: ${title}`, req.ip);

    return res.status(201).json({
      success: true,
      message: "Study material / homework uploaded and shared successfully!",
      material,
    });
  } catch (err) {
    console.error("Upload Material Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getTutorStudyMaterials = async (req, res) => {
  try {
    const materials = await StudyMaterial.find({ tutor: req.user.id })
      .populate("student", "name email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, materials });
  } catch (err) {
    console.error("Get Tutor Study Materials Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.requestPayout = async (req, res) => {
  try {
    const { amount, paymentDetails } = req.body;
    const tutorId = req.user.id;
    const reqAmount = Number(amount);

    if (!reqAmount || reqAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid payout amount is required." });
    }

    if (reqAmount < 100) {
      return res.status(400).json({ success: false, message: "Minimum payout request amount is ₹100.00." });
    }

    
    const existingPending = await PayoutRequest.findOne({ tutor: tutorId, status: "Pending" });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: `You already have a pending payout request of ₹${existingPending.amount.toLocaleString("en-IN")} submitted on ${new Date(existingPending.requestedAt).toLocaleDateString("en-IN")}. Please await admin review.`,
      });
    }

    const profile = await TutorProfile.findOne({ user: tutorId });
    const user = await User.findById(tutorId).select("walletBalance");
    const userWallet = user ? user.walletBalance || 0 : 0;

    const completedClassesList = await ClassSchedule.find({ tutor: tutorId, status: "Completed" });
    const classEarnings = completedClassesList.length * (profile ? profile.fee || profile.hourlyRate || 500 : 500);

    const creditTxns = await Transaction.find({ user: tutorId, status: "Completed", type: { $in: ["Credit", "Tuition Fee Payment", "Wallet Topup"] } });
    const creditEarnings = creditTxns.reduce((sum, t) => sum + (t.amount || 0), 0);

    const grossEarnings = classEarnings + creditEarnings + userWallet;

    const approvedPayouts = await PayoutRequest.find({ tutor: tutorId, status: "Approved" });
    const totalPayoutsDeducted = approvedPayouts.reduce((sum, p) => sum + p.amount, 0);

    const availableBalance = Math.max(0, grossEarnings - totalPayoutsDeducted);

    if (reqAmount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Requested amount (₹${reqAmount.toLocaleString("en-IN")}) exceeds your available earnings balance of ₹${availableBalance.toLocaleString("en-IN")}.`,
      });
    }

    const payoutRequest = await PayoutRequest.create({
      tutor: tutorId,
      amount: reqAmount,
      status: "Pending",
      paymentDetails: paymentDetails || {},
      requestedAt: new Date(),
    });

    await createNotification({
      userId: tutorId,
      title: "Payout Request Submitted 💰",
      message: `Your payout request of ₹${reqAmount.toLocaleString("en-IN")} has been submitted for admin verification.`,
      type: "payment",
      app: req.app,
    });

    const payoutTutorName = req.user.name || "Tutor";

    await createAdminNotification({
      title: "New Payout Request",
      message: `${payoutTutorName} (Tutor) submitted a payout request of ₹${reqAmount.toLocaleString("en-IN")}.`,
      sourceUser: tutorId,
      sourceRole: "tutor",
      type: "payment",
      actionUrl: "/dashboard/admin?tab=finance",
      app: req.app,
    });

    await logUserActivity(tutorId, `${payoutTutorName} submitted a payout request of ₹${reqAmount}`, req.ip);

    return res.status(201).json({
      success: true,
      message: `Payout request of ₹${reqAmount.toLocaleString("en-IN")} submitted successfully! Awaiting admin review.`,
      payoutRequest,
    });
  } catch (err) {
    console.error("Request Payout Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getTutorById = async (req, res) => {
  try {
    const tutorId = req.params.id;
    if (!tutorId || !mongoose.Types.ObjectId.isValid(tutorId)) {
      return res.status(400).json({ success: false, message: "Invalid Tutor ID format." });
    }

    const tutor = await TutorProfile.findById(tutorId).populate("user", "name email phone avatar");
    if (!tutor) {
      return res.status(404).json({ success: false, message: "Tutor Profile Not Found" });
    }

    const reviews = await Review.find({ tutorProfile: tutor._id })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tutor,
      reviews,
    });
  } catch (err) {
    console.error("Get Tutor By ID Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.requestCertificate = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { studentId, courseName, attendancePercentage, completedClasses, tutorRemarks } = req.body;

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: "Valid student ID is required." });
    }

    if (!courseName || !courseName.trim()) {
      return res.status(400).json({ success: false, message: "Course or Subject name is required." });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student account not found." });
    }

    const existingReq = await CertificateRequest.findOne({
      tutor: tutorId,
      student: studentId,
      courseName: courseName.trim(),
      status: { $in: ["Pending", "Approved"] },
    });

    if (existingReq) {
      return res.status(400).json({
        success: false,
        message: `A certificate request for "${courseName}" with this student is already ${existingReq.status}.`,
        request: existingReq,
      });
    }

    const certRequest = await CertificateRequest.create({
      tutor: tutorId,
      student: studentId,
      courseName: courseName.trim(),
      attendancePercentage: Number(attendancePercentage) || 100,
      completedClasses: Number(completedClasses) || 12,
      tutorRemarks: tutorRemarks || "Course completed successfully.",
      status: "Pending",
    });

    const tutorName = req.user.name || "Tutor";
    await createAdminNotification({
      title: "New Certificate Request 🎓",
      message: `${tutorName} (Tutor) requested a completion certificate for ${student.name || "Student"} (${courseName}).`,
      sourceUser: tutorId,
      sourceRole: "tutor",
      type: "certificate",
      actionUrl: "/dashboard/admin?tab=certificates",
      app: req.app,
    });

    return res.status(201).json({
      success: true,
      message: `Certificate request for "${courseName}" submitted to Admin for approval.`,
      request: certRequest,
    });
  } catch (err) {
    console.error("Request Certificate Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.issueCertificate = exports.requestCertificate;

exports.getReceivedHomework = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const homeworks = await StudyMaterial.find({
      tutor: tutorId,
      student: { $ne: null },
      type: "homework",
    })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, homeworks });
  } catch (err) {
    console.error("Get Received Homework Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};