/**
 * ==========================================
 * STUDENT ROUTES
 * ==========================================
 * Router endpoints for student actions:
 * - Booking tutor demo & home visit sessions
 * - Dashboard analytics & scheduled classes
 * - Managing wallet balance, reviews & favorites
 * - Homework, study materials, certificates & referrals
 */

const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { requireAuth, authorizeRole } = require("../middleware/authMiddleware");

// Protected Student Endpoints
router.post("/book", requireAuth, authorizeRole("student"), studentController.bookTutor);
router.post("/tutor-request", requireAuth, authorizeRole("student"), studentController.submitTutorRequest);
router.get("/profile", requireAuth, studentController.getProfile);
router.get("/bookings", requireAuth, authorizeRole("student"), studentController.getBookings);
router.put("/booking/:id/cancel", requireAuth, authorizeRole("student"), studentController.cancelBooking);

// Favorites & Reviews
router.post("/favorite/:tutorProfileId", requireAuth, authorizeRole("student"), studentController.toggleFavorite);
router.get("/favorites", requireAuth, authorizeRole("student"), studentController.getFavorites);
router.post("/review", requireAuth, authorizeRole("student"), studentController.addReview);
router.get("/review/:tutorProfileId", requireAuth, authorizeRole("student"), studentController.getStudentReviewForTutor);

// Wallet & Dashboard Aggregates
router.post("/wallet/topup", requireAuth, authorizeRole("student"), studentController.topupWallet);
router.get("/dashboard-stats", requireAuth, authorizeRole("student"), studentController.getStudentDashboardStats);
router.get("/study-materials", requireAuth, authorizeRole("student"), studentController.getStudentStudyMaterials);
router.get("/study-notes", requireAuth, authorizeRole("student"), studentController.getStudentStudyNotes);

// Certificates, Class Schedule & Referral Program
router.get("/certificates", requireAuth, authorizeRole("student"), studentController.getCertificates);
router.get("/certificates/download/:id", requireAuth, studentController.downloadCertificatePDF);
router.get("/referrals", requireAuth, authorizeRole("student"), studentController.getReferrals);
router.get("/class-schedule", requireAuth, authorizeRole("student"), studentController.getStudentClassSchedule);

module.exports = router;