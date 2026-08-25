
const express = require("express");
const router = express.Router();
const tutorController = require("../controllers/tutorController");
const { requireAuth, authorizeRole, requireApprovedTutor } = require("../middleware/authMiddleware");
const tutorDocUpload = require("../utils/tutorUploadMiddleware");

// Public Endpoint: Get All Tutors (supports GPS & multi-filtering)
router.get("/all", tutorController.getAllTutors);
router.get("/details/:id", tutorController.getTutorById);

router.get("/profile", requireAuth, tutorController.getTutorProfile);
router.put("/profile", requireAuth, authorizeRole("tutor"), tutorController.updateTutorProfile);
// Public / Authenticated Endpoint: Tutor Application Form Submission (No requireApprovedTutor)
router.post("/profile", tutorDocUpload, tutorController.createTutorProfile);

// Booking Request & Home Visit Management (Requires Admin Approval)
router.get("/booking-requests", requireAuth, authorizeRole("tutor"), requireApprovedTutor, tutorController.getBookingRequests);
router.put("/booking-request/:id/accept", requireAuth, authorizeRole("tutor"), requireApprovedTutor, tutorController.acceptBookingRequest);
router.put("/booking-request/:id/reject", requireAuth, authorizeRole("tutor"), requireApprovedTutor, tutorController.rejectBookingRequest);
router.post("/booking-requests/:id/respond", requireAuth, authorizeRole("tutor"), requireApprovedTutor, tutorController.respondBookingRequest);
router.put("/home-visit/:bookingId/status", requireAuth, authorizeRole("tutor"), requireApprovedTutor, tutorController.updateHomeVisitStatus);

// Tutor Dashboard Aggregates & Payout (Requires Admin Approval)
router.get("/dashboard-stats", requireAuth, authorizeRole("tutor"), tutorController.getTutorDashboardStats);
router.post("/payout", requireAuth, authorizeRole("tutor"), requireApprovedTutor, tutorController.requestPayout);

// Homework & Study Material Upload Endpoints (Requires Admin Approval)
router.get("/my-students", requireAuth, authorizeRole("tutor"), requireApprovedTutor, tutorController.getMyStudents);
router.post(
  "/study-material",
  requireAuth,
  authorizeRole("tutor"),
  requireApprovedTutor,
  tutorDocUpload.single("file"),
  tutorController.uploadMaterial
);
router.post(
  "/upload-note",
  requireAuth,
  authorizeRole("tutor"),
  requireApprovedTutor,
  tutorDocUpload.single("note"),
  tutorController.uploadNote
);
router.get("/study-materials", requireAuth, authorizeRole("tutor"), requireApprovedTutor, tutorController.getTutorStudyMaterials);
router.get("/received-homework", requireAuth, authorizeRole("tutor"), requireApprovedTutor, tutorController.getReceivedHomework);

// Document Verification Upload & Certificate Issuance
router.post(
  "/documents",
  requireAuth,
  authorizeRole("tutor"),
  tutorDocUpload.single("document"),
  tutorController.uploadDocuments
);
router.post("/issue-certificate", requireAuth, authorizeRole("tutor"), requireApprovedTutor, tutorController.issueCertificate);
router.post("/request-certificate", requireAuth, authorizeRole("tutor"), requireApprovedTutor, tutorController.requestCertificate);

module.exports = router;