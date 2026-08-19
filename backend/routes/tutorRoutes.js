
const express = require("express");
const router = express.Router();
const tutorController = require("../controllers/tutorController");
const { requireAuth, authorizeRole } = require("../middleware/authMiddleware");
const tutorDocUpload = require("../utils/tutorUploadMiddleware");

// Public Endpoint: Get All Tutors (supports GPS & multi-filtering)
router.get("/all", tutorController.getAllTutors);
router.get("/details/:id", tutorController.getTutorById);

router.get("/profile", requireAuth, tutorController.getTutorProfile);
// Public Endpoint: Tutor Registration Submission (No requireAuth)
router.post("/profile", tutorDocUpload, tutorController.createTutorProfile);

// Booking Request & Home Visit Management
router.get("/booking-requests", requireAuth, authorizeRole("tutor"), tutorController.getBookingRequests);
router.put("/booking-request/:id/accept", requireAuth, authorizeRole("tutor"), tutorController.acceptBookingRequest);
router.put("/booking-request/:id/reject", requireAuth, authorizeRole("tutor"), tutorController.rejectBookingRequest);
router.post("/booking-requests/:id/respond", requireAuth, authorizeRole("tutor"), tutorController.respondBookingRequest);
router.put("/home-visit/:bookingId/status", requireAuth, authorizeRole("tutor"), tutorController.updateHomeVisitStatus);

// Tutor Dashboard Aggregates & Payout
router.get("/dashboard-stats", requireAuth, authorizeRole("tutor"), tutorController.getTutorDashboardStats);
router.post("/payout", requireAuth, authorizeRole("tutor"), tutorController.requestPayout);

// Homework & Study Material Upload Endpoints
router.post(
  "/study-material",
  requireAuth,
  authorizeRole("tutor"),
  tutorDocUpload.single("file"),
  tutorController.uploadMaterial
);
router.get("/study-materials", requireAuth, authorizeRole("tutor"), tutorController.getTutorStudyMaterials);

// Document Verification Upload & Certificate Issuance
router.post(
  "/documents",
  requireAuth,
  authorizeRole("tutor"),
  tutorDocUpload.single("document"),
  tutorController.uploadDocuments
);
router.post("/issue-certificate", requireAuth, authorizeRole("tutor"), tutorController.issueCertificate);
router.post("/request-certificate", requireAuth, authorizeRole("tutor"), tutorController.requestCertificate);

module.exports = router;