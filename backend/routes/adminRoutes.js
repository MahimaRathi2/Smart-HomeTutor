/**
 * ==========================================
 * ADMIN ROUTES
 * ==========================================
 * Router endpoints for administrator operations:
 * - System analytics & monthly report breakdowns
 * - Tutor verification & KYC document approvals
 * - Activity logs & security audit trails
 * - Bulk notifications & announcement broadcasting
 * - Blog & FAQ management
 * - Help Desk / Complaint ticket resolutions
 */

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const paymentController = require("../controllers/paymentController");
const { requireAuth, authorizeRole } = require("../middleware/authMiddleware");
const blogCoverUpload = require("../utils/blogUploadMiddleware");

// All admin routes require authentication and admin role
router.use(requireAuth, authorizeRole("admin"));

router.get("/stats", adminController.getStats);
router.get("/tutors", adminController.getAllTutors);
router.patch("/tutor/:id/verify", adminController.verifyTutor);
router.delete("/tutor/:id", adminController.deleteTutor);

router.get("/users", adminController.getAllUsers);
router.patch("/user/:id/role", adminController.updateUserRole);
router.delete("/user/:id", adminController.deleteUser);

router.get("/bookings", adminController.getAllBookings);
router.patch("/bookings/:id/approve", adminController.approveBookingRequest);
router.patch("/bookings/:id/reject", adminController.rejectBookingRequest);
router.delete("/bookings/:id", adminController.deleteBookingRequest);
router.post("/announcement", adminController.createAnnouncement);
router.get("/announcements", adminController.getAnnouncements);

// Part 2 Features: Bulk Notifications, Audit Logs, KYC Verification, Content & Complaints
router.post("/bulk-notification", adminController.sendBulkNotification);
router.get("/activity-logs", adminController.getActivityLogs);
router.get("/security-audit", adminController.getSecurityAudit);
router.get("/pending-documents", adminController.getPendingDocuments);
router.get("/tutor-applications", adminController.getTutorApplications);
router.get("/tutor-applications/:id", adminController.getTutorApplicationDetails);
router.post("/tutor-applications/:tutorProfileId/verify", adminController.verifyTutorDocument);
router.patch("/document-verify/:tutorProfileId", adminController.verifyTutorDocument);
router.get("/blogs", adminController.getAllBlogs);
router.post("/blogs", adminController.createBlog);
router.post("/blogs/upload-cover", blogCoverUpload, adminController.uploadBlogCover);
router.put("/blogs/:id", adminController.updateBlog);
router.patch("/blogs/:id/publish", adminController.togglePublishBlog);
router.delete("/blogs/:id", adminController.deleteBlog);
router.get("/complaints", adminController.getAllComplaints);
router.patch("/complaints/:id/resolve", adminController.resolveComplaint);
router.get("/export-pdf-report", adminController.exportPdfReport);

// Subjects & Academic Boards Catalog Routes
router.get("/subjects", adminController.getSubjects);
router.post("/subjects", adminController.addSubject);
router.put("/subjects/:id", adminController.updateSubject);
router.delete("/subjects/:id", adminController.deleteSubject);

// Finance & Platform Escrow Revenue Log Route
router.get("/finance-revenue", adminController.getFinanceRevenue);
router.get("/payments", paymentController.getAdminPaymentHistory);

// Certificate Approval & Issuance System Routes
router.get("/certificate-requests", adminController.getCertificateRequests);
router.post("/certificate-requests/:id/approve", adminController.approveCertificateRequest);
router.post("/certificate-requests/:id/reject", adminController.rejectCertificateRequest);

// Educator Payout Request Approval System Routes
router.get("/payout-requests", adminController.getPayoutRequests);
router.post("/payout-requests/:id/approve", adminController.approvePayoutRequest);
router.post("/payout-requests/:id/reject", adminController.rejectPayoutRequest);

// Admin Notifications Management Routes
router.get("/notifications", adminController.getAdminNotifications);
router.get("/notifications/unread-count", adminController.getAdminUnreadCount);
router.patch("/notifications/read-all", adminController.markAllAdminNotificationsAsRead);
router.patch("/notifications/:id/read", adminController.markAdminNotificationAsRead);
router.delete("/notifications/:id", adminController.deleteAdminNotification);

// Admin Chat Unlock Management Routes
router.patch("/booking/:id/toggle-chat-unlock", adminController.toggleBookingChatUnlock);
router.patch("/user/:id/toggle-chat-unlock", adminController.toggleUserChatUnlock);

module.exports = router;
